import React from 'react';
import OverviewView from './OverviewView';
import RepositoriesView from './RepositoriesView';
import ActivityView from './ActivityView';
import ContributedView from './ContributedView';
import SocialInsightsView from './SocialInsightsView'; 
const UserStats = ({
  data,
  isUser1,
  activeView,
  repoSearch,
  setRepoSearch,
  languageFilter,
  setLanguageFilter,
  repoPage,
  setRepoPage,
  projectsPage,
  setProjectsPage,
  setSelectedRepo,
  shareProfile,
  exportToPDF,
  itemsPerPage,
}) => {
  if (!data) {
    console.log('No data provided to renderUserStats');
    return null;
  }

  console.log('Rendering stats for:', data.username);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
          {data.username}
        </h2>
        <div className="space-x-2">
          <button
            onClick={() => shareProfile(data.username)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Share Profile
          </button>
          <button
            onClick={exportToPDF}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            Export as PDF
          </button>
        </div>
      </div>

      {activeView === 'overview' && <OverviewView data={data} isUser1={isUser1} />}
      {activeView === 'repositories' && (
        <RepositoriesView
          data={data}
          repoSearch={repoSearch}
          setRepoSearch={setRepoSearch}
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          repoPage={repoPage}
          setRepoPage={setRepoPage}
          setSelectedRepo={setSelectedRepo}
          itemsPerPage={itemsPerPage}
        />
      )}
      {activeView === 'activity' && <ActivityView data={data} />}
      {activeView === 'contributed' && (
        <ContributedView
          data={data}
          projectsPage={projectsPage}
          setProjectsPage={setProjectsPage}
          itemsPerPage={itemsPerPage}
        />
      )}
      {activeView === 'social' && <SocialInsightsView data={data} />}
    </div>
  );
};

export default UserStats;