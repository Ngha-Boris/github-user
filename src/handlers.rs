use axum::{Json, extract::Path, http::StatusCode, response::IntoResponse};
use cached::proc_macro::cached;
use chrono::{Duration, Utc};
use std::collections::{HashMap, HashSet};

use crate::models::{
    Activity, Event, GithubUser, GithubUserSearchItem, GithubUserSearchResult, Repo, SearchResult,
    UserResponse,
};

// Search GitHub users by name
#[cached(size = 100, time = 300)]
async fn search_github_users(
    name: String,
) -> Result<Vec<GithubUserSearchItem>, (StatusCode, String)> {
    let client = reqwest::Client::builder()
        .user_agent("github-user-proxy/0.1")
        .build()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to build HTTP client".to_string(),
            )
        })?;

    let search_url = format!("https://api.github.com/search/users?q={}", name);
    let response = client.get(&search_url).send().await.map_err(|err| {
        eprintln!("GitHub API request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to search GitHub users: Network error - {}", err),
        )
    })?;

    // Check for rate limiting
    if response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let search_result: GithubUserSearchResult = response.json().await.map_err(|err| {
        eprintln!("GitHub API parse error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse GitHub search results: {}", err),
        )
    })?;
    Ok(search_result.items)
}

// Fetch GitHub user data
#[cached(size = 100, time = 300)]
async fn fetch_github_user_data(username: String) -> Result<UserResponse, (StatusCode, String)> {
    let client = reqwest::Client::builder()
        .user_agent("github-user-proxy/0.1")
        .build()
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to build HTTP client".to_string(),
            )
        })?;

    let user_url = format!("https://api.github.com/users/{}", username);
    let user_response = client.get(&user_url).send().await.map_err(|err| {
        eprintln!("GitHub API user request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch user data: Network error - {}", err),
        )
    })?;

    if user_response.status() == StatusCode::NOT_FOUND {
        return Err((
            StatusCode::NOT_FOUND,
            format!("User '{}' not found", username),
        ));
    }

    // Check for rate limiting
    if user_response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = user_response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = user_response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let user: GithubUser = user_response.json().await.map_err(|err| {
        eprintln!("GitHub API user parse error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse user data: {}", err),
        )
    })?;

    let repos_url = format!("https://api.github.com/users/{}/repos", username);
    let repos_response = client.get(&repos_url).send().await.map_err(|err| {
        eprintln!("GitHub API repos request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch repos: Network error - {}", err),
        )
    })?;

    if repos_response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = repos_response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = repos_response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let repos: Vec<Repo> = repos_response.json().await.map_err(|err| {
        eprintln!("GitHub API repos parse error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse repos: {}", err),
        )
    })?;

    let events_url = format!("https://api.github.com/users/{}/events", username);
    let events_response = client.get(&events_url).send().await.map_err(|err| {
        eprintln!("GitHub API events request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch events: Network error - {}", err),
        )
    })?;

    if events_response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = events_response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = events_response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let events: Vec<Event> = events_response.json().await.map_err(|err| {
        eprintln!("GitHub API events parse error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse events: {}", err),
        )
    })?;

    let one_year_ago = Utc::now() - Duration::days(365);
    let mut commits_last_year = 0;
    let mut verified_commits_last_year = 0;
    let mut contribution_map: HashMap<String, u32> = HashMap::new();

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
                .map(|r| r.name.clone())
                .unwrap_or_default(),
            created_at: event.created_at,
            description,
        });
    }

    let pr_url = format!(
        "https://api.github.com/search/issues?q=author:{}+type:pr+is:merged",
        username
    );
    let pr_response = client.get(&pr_url).send().await.map_err(|err| {
        eprintln!("GitHub API PR request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch PRs: Network error - {}", err),
        )
    })?;

    if pr_response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = pr_response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = pr_response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let pr_search: SearchResult = pr_response.json().await.map_err(|err| {
        eprintln!("GitHub API PR parse error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to parse PRs: {}", err),
        )
    })?;
    let merged_pull_requests = pr_search.total_count;

    let contrib_url = format!(
        "https://api.github.com/search/issues?q=involves:{}",
        username
    );
    let contrib_response = client.get(&contrib_url).send().await.map_err(|err| {
        eprintln!("GitHub API contributions request error: {}", err);
        (
            StatusCode::BAD_GATEWAY,
            format!("Failed to fetch contributions: Network error - {}", err),
        )
    })?;

    if contrib_response.status() == StatusCode::FORBIDDEN {
        let rate_limit_remaining: u32 = contrib_response
            .headers()
            .get("x-ratelimit-remaining")
            .and_then(|v| v.to_str().ok())
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);

        if rate_limit_remaining == 0 {
            let reset_time: i64 = contrib_response
                .headers()
                .get("x-ratelimit-reset")
                .and_then(|v| v.to_str().ok())
                .and_then(|v| v.parse().ok())
                .unwrap_or(0);
            let reset_datetime = chrono::DateTime::<Utc>::from_timestamp(reset_time, 0)
                .map(|dt| dt.format("%Y-%m-%d %H:%M:%S UTC").to_string())
                .unwrap_or("unknown time".to_string());

            return Err((
                StatusCode::TOO_MANY_REQUESTS,
                format!(
                    "GitHub API rate limit exceeded. Please try again after {}.",
                    reset_datetime
                ),
            ));
        }
    }

    let contrib_search: SearchResult = contrib_response.json().await.map_err(|err| {
        eprintln!("GitHub API contributions parse error: {}", err);
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

// Handler for searching GitHub users
pub async fn proxy_search_github_users(path: Path<String>) -> impl IntoResponse {
    let name = path.0;
    match search_github_users(name).await {
        Ok(users) => Json(users).into_response(),
        Err((status, message)) => (status, message).into_response(),
    }
}

// Handler for fetching GitHub user data
pub async fn proxy_github_user(path: Path<String>) -> impl IntoResponse {
    let username = path.0;
    match fetch_github_user_data(username).await {
        Ok(user_response) => Json(user_response).into_response(),
        Err((status, message)) => (status, message).into_response(),
    }
}
