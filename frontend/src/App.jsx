import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import html2pdf from 'html2pdf.js';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserInput from './components/UserInput';
import UserStats from './components/UserStats';
import ComparisonTable from './components/ComparisonTable';
import RepoModal from './components/RepoModal';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function App() {
  const [username, setUsername] = useState('');
  const [username2, setUsername2] = useState('');
  const [userData, setUserData] = useState(null);
  const [userData2, setUserData2] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [repoPage, setRepoPage] = useState(1);
  const [projectsPage, setProjectsPage] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const itemsPerPage = 5;
  const dashboardRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchUserData = async (user, setData) => {
    if (!user.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/github/users/${user}`);
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        if (response.status === 502) {
          errorMessage = "Unable to fetch data from GitHub. This might be due to API rate limiting. Please try again later.";
        } else if (response.status === 404) {
          errorMessage = `User '${user}' not found on GitHub.`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setData(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchUser1 = () => fetchUserData(username, setUserData);
  const handleFetchUser2 = () => fetchUserData(username2, setUserData2);

  const shareProfile = (username) => {
    const url = `${window.location.origin}/?user=${username}`;
    navigator.clipboard.writeText(url);
    alert('Profile URL copied to clipboard!');
  };

  const exportToPDF = () => {
    const element = dashboardRef.current;
    const opt = {
      margin: 0.5,
      filename: `${userData?.username || 'github-stats'}-stats.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
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
            <UserInput
              username={username}
              setUsername={setUsername}
              handleFetchUser={handleFetchUser1}
              placeholder="Enter first GitHub username"
              buttonText="Get Stats"
            />
            <UserInput
              username={username2}
              setUsername={setUsername2}
              handleFetchUser={handleFetchUser2}
              placeholder="Enter second GitHub username (optional)"
              buttonText="Get Stats"
            />
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}

          <div ref={dashboardRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData && (
                <UserStats
                  data={userData}
                  isUser1={true}
                  activeView={activeView}
                  repoSearch={repoSearch}
                  setRepoSearch={setRepoSearch}
                  languageFilter={languageFilter}
                  setLanguageFilter={setLanguageFilter}
                  repoPage={repoPage}
                  setRepoPage={setRepoPage}
                  projectsPage={projectsPage}
                  setProjectsPage={setProjectsPage}
                  setSelectedRepo={setSelectedRepo}
                  shareProfile={shareProfile}
                  exportToPDF={exportToPDF}
                  itemsPerPage={itemsPerPage}
                />
              )}
              {userData2 && (
                <UserStats
                  data={userData2}
                  isUser1={false}
                  activeView={activeView}
                  repoSearch={repoSearch}
                  setRepoSearch={setRepoSearch}
                  languageFilter={languageFilter}
                  setLanguageFilter={setLanguageFilter}
                  repoPage={repoPage}
                  setRepoPage={setRepoPage}
                  projectsPage={projectsPage}
                  setProjectsPage={setProjectsPage}
                  setSelectedRepo={setSelectedRepo}
                  shareProfile={shareProfile}
                  exportToPDF={exportToPDF}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
            <ComparisonTable userData={userData} userData2={userData2} />
          </div>

          <RepoModal selectedRepo={selectedRepo} setSelectedRepo={setSelectedRepo} />
        </div>
      </div>
    </div>
  );
}

export default App;