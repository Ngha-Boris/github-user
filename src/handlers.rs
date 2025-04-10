use axum::{Json, extract::Path, http::StatusCode};
use cached::proc_macro::cached;
use chrono::{Duration, Utc};
use std::collections::{HashMap, HashSet};

use crate::models::{Activity, Event, GithubUser, Repo, SearchResult, UserResponse};

// Cache the UserResponse directly, not the Result
#[cached(size = 100, time = 300)] // Cache for 5 minutes
async fn fetch_user_data(username: String) -> Result<UserResponse, (StatusCode, String)> {
    println!("Fetching data for username: {}", username);

    // Build HTTP client
    println!("Building HTTP client...");
    let client = reqwest::Client::builder()
        .user_agent("github-user-proxy/0.1")
        .build()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to build HTTP client".to_string(),
            )
        })?;

    // Fetch user data
    let user_url = format!("https://api.github.com/users/{}", username);
    println!("Fetching user data from: {}", user_url);
    let user_response = client.get(&user_url).send().await.map_err(|err| {
        println!("Error fetching user data: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch user data: {}", err),
        )
    })?;

    println!("User response status: {}", user_response.status());
    if user_response.status() == reqwest::StatusCode::NOT_FOUND {
        return Err((
            StatusCode::NOT_FOUND,
            format!("User '{}' not found", username),
        ));
    }

    let user: GithubUser = user_response.json().await.map_err(|err| {
        println!("Error parsing user data: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse user data: {}", err),
        )
    })?;

    // Fetch repositories
    let repos_url = format!("https://api.github.com/users/{}/repos", username);
    println!("Fetching repositories from: {}", repos_url);
    let repos: Vec<Repo> = client
        .get(&repos_url)
        .send()
        .await
        .map_err(|err| {
            println!("Error fetching repos: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch repos: {}", err),
            )
        })?
        .json()
        .await
        .map_err(|err| {
            println!("Error parsing repos: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to parse repos: {}", err),
            )
        })?;

    // Fetch events for commits and activities
    let events_url = format!("https://api.github.com/users/{}/events", username);
    println!("Fetching events from: {}", events_url);
    let events: Vec<Event> = client
        .get(&events_url)
        .send()
        .await
        .map_err(|err| {
            println!("Error fetching events: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch events: {}", err),
            )
        })?
        .json()
        .await
        .map_err(|err| {
            println!("Error parsing events: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to parse events: {}", err),
            )
        })?;

    let one_year_ago = Utc::now() - Duration::days(365);
    let mut commits_last_year = 0;
    let mut verified_commits_last_year = 0;
    let mut contribution_map: HashMap<String, u32> = HashMap::new();

    // Process events for commits and contribution graph
    println!("Processing events...");
    for event in &events {
        if event.event_type == "PushEvent" && event.created_at > one_year_ago {
            if let Some(payload) = &event.payload {
                if let Some(commits) = &payload.commits {
                    commits_last_year += commits.len() as u32;
                    verified_commits_last_year += commits.len() as u32;
                    let date = event.created_at.format("%Y-%m-%d").to_string();
                    *contribution_map.entry(date).or_insert(0) += commits.len() as u32;
                }
            }
        }
    }

    // Process recent activities
    println!("Processing recent activities...");
    let mut recent_activities = Vec::new();
    for event in events.iter().take(5) {
        let description = match event.event_type.as_str() {
            "PushEvent" => {
                if let Some(payload) = &event.payload {
                    if let Some(commits) = &payload.commits {
                        format!("Pushed {} commit(s)", commits.len())
                    } else {
                        "Pushed to a repository".to_string()
                    }
                } else {
                    "Pushed to a repository".to_string()
                }
            }
            "IssuesEvent" => "Created or updated an issue".to_string(),
            "PullRequestEvent" => "Opened or updated a pull request".to_string(),
            _ => format!("Performed a {} event", event.event_type),
        };
        recent_activities.push(Activity {
            event_type: event.event_type.clone(),
            repo_name: event
                .repo
                .as_ref()
                .map(|r| {
                    let name = r.name.clone();
                    println!("Repo name for activity: {}", name);
                    name
                })
                .unwrap_or_default(),
            created_at: event.created_at,
            description,
        });
    }

    // Fetch merged PRs
    let pr_url = format!(
        "https://api.github.com/search/issues?q=author:{}+type:pr+is:merged",
        username
    );
    println!("Fetching merged PRs from: {}", pr_url);
    let pr_search: SearchResult = client
        .get(&pr_url)
        .send()
        .await
        .map_err(|err| {
            println!("Error fetching PRs: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch PRs: {}", err),
            )
        })?
        .json()
        .await
        .map_err(|err| {
            println!("Error parsing PRs: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to parse PRs: {}", err),
            )
        })?;
    let merged_pull_requests = pr_search.total_count;

    // Fetch contributed projects
    let contrib_url = format!(
        "https://api.github.com/search/issues?q=involves:{}",
        username
    );
    println!("Fetching contributed projects from: {}", contrib_url);
    let contrib_search: SearchResult = client
        .get(&contrib_url)
        .send()
        .await
        .map_err(|err| {
            println!("Error fetching contributions: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to fetch contributions: {}", err),
            )
        })?
        .json()
        .await
        .map_err(|err| {
            println!("Error parsing contributions: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                format!("Failed to parse contributions: {}", err),
            )
        })?;
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

    println!("Building response...");
    Ok(UserResponse {
        username: user.login,
        name: user.name,
        avatar: user.avatar_url,
        public_repos: user.public_repos,
        repo_links: repos,
        commits_last_year,
        verified_commits_last_year,
        merged_pull_requests,
        contributed_projects,
        followers: user.followers,
        following: user.following,
        bio: user.bio,
        recent_activities,
        contribution_graph: contribution_map,
    })
}

pub async fn proxy_user(path: Path<String>) -> Result<Json<UserResponse>, (StatusCode, String)> {
    let username = path.0;
    println!("Received request for username: {}", username);
    let result = fetch_user_data(username).await?;
    println!("Returning result...");
    Ok(Json(result))
}
