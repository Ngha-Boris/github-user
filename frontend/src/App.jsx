import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserStats from './components/UserStats';
import RepoModal from './components/RepoModal';
import ComparisonTable from './components/ComparisonTable';

function App() {
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [name2, setName2] = useState('');
  const [platforms, setPlatforms] = useState({
    github: { searchResults: [], selectedUsername: null, data: null },
    linkedin: { url: null, username: null },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const extractLinkedInUsername = (url) => {
    if (!url) return null;
    const match = url.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)\/?/);
    return match ? match[1] : null;
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const githubResponse = await fetch(`/api/github/search/users/${encodeURIComponent(name)}`);
      if (!githubResponse.ok) {
        const errorText = await githubResponse.text();
        throw new Error(`Failed to search GitHub users: ${githubResponse.status} - ${errorText}`);
      }
      const githubResults = await githubResponse.json();
      console.log("GitHub Search Results:", githubResults);

      if (githubResults.length === 0) {
        setError("No GitHub users found for this name.");
      }

      const linkedinUsername = extractLinkedInUsername(linkedinUrl);

      setPlatforms(prev => ({
        ...prev,
        github: {
          searchResults: githubResults,
          selectedUsername: githubResults.length === 1 ? githubResults[0].login : null,
          data: null,
        },
        linkedin: { url: linkedinUrl, username: linkedinUsername },
      }));
    } catch (err) {
      setError(err.message);
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      if (platforms.github.selectedUsername) {
        const response = await fetch(`/api/github/users/${platforms.github.selectedUsername}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch GitHub data: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log("GitHub User Data:", data);
        setPlatforms(prev => ({ ...prev, github: { ...prev.github, data } }));
      }
    } catch (err) {
      setError(err.message);
      console.error("Fetch Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="flex-1 p-4 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <Header
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter person's name"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="Enter LinkedIn profile URL (optional)"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
            >
              Search
            </button>
          </div>

          {loading && <p className="text-center">Loading...</p>}
          {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}

          {platforms.github.searchResults.length > 1 && (
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300">Select GitHub user:</label>
                <select
                  onChange={(e) =>
                    setPlatforms((prev) => ({
                      ...prev,
                      github: { ...prev.github, selectedUsername: e.target.value },
                    }))
                  }
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a user</option>
                  {platforms.github.searchResults.map((user) => (
                    <option key={user.login} value={user.login}>
                      {user.login}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleFetchStats}
                disabled={!platforms.github.selectedUsername}
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition disabled:bg-gray-300"
              >
                Fetch Stats
              </button>
            </div>
          )}

          {platforms.github.searchResults.length === 1 && platforms.github.data === null && (
            <div className="mb-6">
              <p className="text-center text-gray-700 dark:text-gray-300">
                Found GitHub user: {platforms.github.searchResults[0].login}
              </p>
              <button
                onClick={handleFetchStats}
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition mx-auto block"
              >
                Fetch Stats
              </button>
            </div>
          )}

          <div ref={dashboardRef} className="mt-6 space-y-6">
            {platforms.github.data && (
              <UserStats
                data={platforms.github.data}
                platform="github"
                activeView={activeView}
                setSelectedRepo={setSelectedRepo}
              />
            )}
            {platforms.linkedin.url && (
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">LinkedIn Profile</h3>
                {platforms.linkedin.username ? (
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Username:</strong> {platforms.linkedin.username}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      LinkedIn stats fetching is not supported due to API restrictions. Below is a preview of what stats might look like:
                    </p>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Name:</strong> {name || 'Not available'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Headline:</strong> Software Engineer at Example Corp (mock data)
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Connections:</strong> 500+ (mock data)
                      </p>
                    </div>
                    <a
                      href={platforms.linkedin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Profile on LinkedIn
                    </a>
                  </div>
                ) : (
                  <p className="text-red-500 dark:text-red-400">
                    Invalid LinkedIn URL. Please enter a valid profile URL (e.g., https://www.linkedin.com/in/username).
                  </p>
                )}
              </div>
            )}
          </div>

          <RepoModal selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
        </div>
      </div>
    </div>
  );
}

export default App;