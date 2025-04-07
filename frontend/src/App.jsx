import { useState } from 'react';

function App() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    setUserData(null);

    try {
      const response = await fetch(`/api/github/users/${username}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          GitHub User Stats
        </h1>
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter GitHub username (e.g., rust-lang)"
            className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <button
            onClick={fetchUserData}
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition"
          >
            Get Stats
          </button>
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {userData && (
          <div className="p-4 border border-gray-200 rounded-md">
            <h2 className="text-xl font-semibold text-blue-600 mb-4">{userData.username}</h2>
            <img
              src={userData.avatar}
              alt={`${userData.username}'s avatar`}
              className="w-24 h-24 rounded-full mb-4 mx-auto"
            />
            <p><strong className="text-gray-700">Name:</strong> {userData.name || 'Not provided'}</p>
            <p><strong className="text-gray-700">Bio:</strong> {userData.bio || 'Not provided'}</p>
            <p><strong className="text-gray-700">Public Repositories:</strong> {userData.public_repos}</p>
            <p><strong className="text-gray-700">Repositories:</strong></p>
            <ul className="list-disc pl-5">
              {userData.repo_links.map((link, index) => (
                <li key={index}>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <p><strong className="text-gray-700">Commits Last Year:</strong> {userData.commits_last_year}</p>
            <p><strong className="text-gray-700">Verified Commits Last Year:</strong> {userData.verified_commits_last_year}</p>
            <p><strong className="text-gray-700">Merged Pull Requests:</strong> {userData.merged_pull_requests}</p>
            <p><strong className="text-gray-700">Contributed Projects:</strong></p>
            <ul className="list-disc pl-5">
              {userData.contributed_projects.map((project, index) => (
                <li key={index}>
                  <a href={project} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {project}
                  </a>
                </li>
              ))}
            </ul>
            <p><strong className="text-gray-700">Followers:</strong> {userData.followers}</p>
            <p><strong className="text-gray-700">Following:</strong> {userData.following}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;