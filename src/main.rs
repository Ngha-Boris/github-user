use std::path::Path;

use axum::{Router, routing::{get, get_service}};
use tower_http::services::ServeDir;
use github_user::handlers::proxy_user;

#[tokio::main]
async fn main() {
    // API router for the GitHub user endpoint
    let api_router = Router::new()
        .route("/github/users/:username", get(proxy_user));
    let path = Path::new("frontend/dist");
    let service = ServeDir::new("assets");
    // Serve static files from frontend/dist
    let static_files = get_service(
        ServeDir::new(path)
            .append_index_html_on_directories(true)
            .compat()
    ).handle_error(|error: std::io::Error| async move {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to serve static file: {}", error),
        )
    });

    // Combine the API and static file serving
    let app = Router::new()
        .nest("/api", api_router) // API routes take precedence
        .fallback_service(static_files); // Fallback to static files for unmatched routes

    println!("Server running at http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}