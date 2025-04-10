use axum::{
    Router, Server,
    routing::{get, get_service},
};
use github_user::handlers::proxy_user;
use std::path::Path;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    // API router for the GitHub user endpoint
    let api_router = Router::new().route("/github/users/:username", get(proxy_user));

    let path = Path::new("frontend/dist");
    // Serve static files from frontend/dist
    let static_files = get_service(ServeDir::new(path).append_index_html_on_directories(true));

    // Combine the API and static file serving
    let app = Router::new()
        .nest("/api", api_router) // API routes take precedence
        .fallback_service(static_files); // Fallback to static files for unmatched routes

    println!("Server running at http://localhost:3000");
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    Server::from_tcp(listener.into_std().unwrap())
        .unwrap()
        .serve(app.into_make_service())
        .await
        .unwrap();
}
