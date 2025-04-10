## GitHub User Stats

### Project Goal

GitHub User Stats is a web application that allows users to fetch and compare GitHub user statistics. The app retrieves data such as a user's public repositories, commits, merged pull requests, followers, following, recent activities, and contribution graph directly from the GitHub API. Users can input one or two GitHub usernames to view detailed stats and compare them side-by-side. The app provides a clean, responsive interface with features like dark mode, repository search and filtering, pagination, and the ability to export user stats as a PDF.

The goal of this project is to provide an easy-to-use tool for developers, recruiters, or anyone interested in exploring and comparing GitHub user activity and contributions without manually visiting GitHub profiles.

### Prerequisites

Before running the project, ensure you have the following installed:

Rust: The backend is written in Rust. Install Rust by following the instructions at rust-lang.org.

Node.js and npm: The frontend is built with React. Install Node.js and npm from nodejs.org.

### Project Structure
Backend: Located in the root directory, written in Rust using the Axum framework.

Frontend: Located in the frontend/ directory, built with React and Vite.

### How to Run the Project
Follow these steps to set up and run the project locally.
 Clone the Repository

    Clone the project to your local machine:

```bash
    git clone https://github.com/your-username/github-user-stats.git

    cd github-user-stats
```
 Set Up and Run the Frontend

    The frontend is a React application built with Vite. It communicates with the backend API to fetch GitHub user data.

 Navigate to the frontend directory:
```bash
    cd frontend
```

 Install dependencies:
```bash
    cd frontend
```

 Build the frontend for production (this creates the frontend/dist directory that the backend serves):
```bash
    npm run build
```
 Build and Run the Backend
```bash
    cargo run
```
The backend will start a server at http://localhost:3000. It will handle API requests and serve the frontend.




### Features
- User Stats: View a user’s public repositories, commits, merged pull requests, followers, following, and more.
- Comparison: Compare two GitHub users side-by-side in a table.
- Repository View: Browse a user’s repositories with search, language filtering, and pagination.
- Activity Timeline: See a user’s recent GitHub activities (e.g., pushes, issues, pull requests).
- Contribution Graph: View a user’s contribution activity over the past year.
- Export to PDF: Export a user’s stats as a PDF file.
- Dark Mode: Toggle between light and dark themes.
- Responsive Design: Works on both desktop and mobile devices.

### Troubleshooting

Frontend Not Loading: Ensure you’ve built the frontend (npm run build) and the frontend/dist directory exists. The backend serves these static files.
CORS Issues: If you run the frontend separately (e.g., with npm run dev), you may encounter CORS issues. In production, the backend serves the frontend, so this shouldn’t be a problem.