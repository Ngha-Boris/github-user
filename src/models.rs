use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct GithubUser {
    pub login: String,
    pub name: Option<String>,
    pub avatar_url: String,
    pub public_repos: u32,
    pub followers: u32,
    pub following: u32,
    pub bio: Option<String>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Repo {
    pub html_url: String,
    pub name: String,
    pub language: Option<String>,
    pub stargazers_count: u32,
    pub description: Option<String>,
    pub forks_count: u32,
    pub watchers_count: u32, // Add watchers_count
    pub topics: Vec<String>, // Add topics
    pub updated_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct Event {
    #[serde(rename = "type")]
    pub event_type: String,
    pub payload: Option<EventPayload>,
    pub created_at: DateTime<Utc>,
    pub repo: Option<EventRepo>,
}

#[derive(Deserialize)]
pub struct EventRepo {
    pub id: Option<u64>,
    pub name: String,
    pub url: Option<String>,
}

#[derive(Deserialize)]
pub struct EventPayload {
    pub commits: Option<Vec<Commit>>,
}

#[derive(Deserialize)]
pub struct Commit {
    pub sha: String,
}

#[derive(Deserialize)]
pub struct SearchResult {
    pub total_count: u32,
    pub items: Vec<Issue>,
}

#[derive(Deserialize)]
pub struct Issue {
    pub html_url: String,
    pub repository_url: String,
}

#[derive(Serialize, Clone)]
pub struct UserResponse {
    pub username: String,
    pub name: Option<String>,
    pub avatar: String,
    pub public_repos: u32,
    pub repo_links: Vec<Repo>,
    pub commits_last_year: u32,
    pub verified_commits_last_year: u32,
    pub merged_pull_requests: u32,
    pub contributed_projects: Vec<String>,
    pub followers: u32,
    pub following: u32,
    pub bio: Option<String>,
    pub recent_activities: Vec<Activity>,
    pub contribution_graph: HashMap<String, u32>,
}

#[derive(Serialize, Clone)]
pub struct Activity {
    pub event_type: String,
    pub repo_name: String,
    pub created_at: DateTime<Utc>,
    pub description: String,
}
