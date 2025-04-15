use axum::{
    Router, Server,
    routing::{get, get_service},
};
use github_user::handlers::{proxy_github_user, proxy_search_github_users};
use std::path::Path;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let api_router = Router::new()
        .route("/github/users/:username", get(proxy_github_user))
        .route("/github/search/users/:name", get(proxy_search_github_users));

    let path = Path::new("frontend/dist");
    let static_files = get_service(ServeDir::new(path).append_index_html_on_directories(true));

    let app = Router::new()
        .nest("/api", api_router)
        .fallback_service(static_files);

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
