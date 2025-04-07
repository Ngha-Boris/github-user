use axum::{Json, extract::Path, http::StatusCode};
use chrono::{Duration, Utc};
use std::collections::HashSet;

use crate::models::{Event, GithubUser, Repo, SearchResult, UserResponse};

pub async fn proxy_user(path: Path<String>) -> Result<Json<UserResponse>, StatusCode> {
    let username = path.0;
    let client = reqwest::Client::builder()
        .user_agent("github-user-proxy/0.1")
        .build()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // Fetch user data
    let user_url = format!("https://api.github.com/users/{}", username);
    let user: GithubUser = client
        .get(&user_url)
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    // Fetch repositories
    let repos_url = format!("https://api.github.com/users/{}/repos", username);
    let repos: Vec<Repo> = client
        .get(&repos_url)
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;
    let repo_links: Vec<String> = repos.into_iter().map(|repo| repo.html_url).collect();

    // Fetch events for commits
    let events_url = format!("https://api.github.com/users/{}/events", username);
    let events: Vec<Event> = client
        .get(&events_url)
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let one_year_ago = Utc::now() - Duration::days(365);
    let mut commits_last_year = 0;
    let mut verified_commits_last_year = 0;
    for event in events {
        if event.event_type == "PushEvent" && event.created_at > one_year_ago {
            if let Some(payload) = event.payload {
                if let Some(commits) = payload.commits {
                    commits_last_year += commits.len() as u32;
                    verified_commits_last_year += commits.len() as u32; // Simplification
                }
            }
        }
    }

    // Fetch merged PRs
    let pr_url = format!(
        "https://api.github.com/search/issues?q=author:{}+type:pr+is:merged",
        username
    );
    let pr_search: SearchResult = client
        .get(&pr_url)
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;
    let merged_pull_requests = pr_search.total_count;

    // Fetch contributed projects
    let contrib_url = format!(
        "https://api.github.com/search/issues?q=involves:{}",
        username
    );
    let contrib_search: SearchResult = client
        .get(&contrib_url)
        .send()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?
        .json()
        .await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;
    let contributed_projects: Vec<String> = contrib_search
        .items
        .into_iter()
        .map(|issue| {
            issue
                .repository_url
                .replace("https://api.github.com/repos/", "https://github.com/")
        })
        .collect::<HashSet<String>>()
        .into_iter()
        .collect();

    Ok(Json(UserResponse {
        username: user.login,
        name: user.name,
        avatar: user.avatar_url,
        public_repos: user.public_repos,
        repo_links,
        commits_last_year,
        verified_commits_last_year,
        merged_pull_requests,
        contributed_projects,
        followers: user.followers,
        following: user.following,
        bio: user.bio,
    }))
}
