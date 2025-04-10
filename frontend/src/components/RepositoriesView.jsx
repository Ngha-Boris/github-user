import React from 'react';

const RepositoriesView = ({
  data,
  repoSearch,
  setRepoSearch,
  languageFilter,
  setLanguageFilter,
  repoPage,
  setRepoPage,
  setSelectedRepo,
  itemsPerPage,
}) => {
  const languages = [...new Set(data.repo_links.map(repo => repo.language).filter(Boolean))];
  const filteredRepos = data.repo_links.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(repoSearch.toLowerCase());
    const matchesLanguage = languageFilter ? repo.language === languageFilter : true;
    return matchesSearch && matchesLanguage;
  });

  const paginatedRepos = filteredRepos.slice(
    (repoPage - 1) * itemsPerPage,
    repoPage * itemsPerPage
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Repositories</h3>
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          value={repoSearch}
          onChange={(e) => setRepoSearch(e.target.value)}
          placeholder="Search repositories..."
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Languages</option>
          {languages.map((lang, index) => (
            <option key={index} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="space-y-4">
        {paginatedRepos.map((repo, index) => (
          <div
            key={index}
            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedRepo(repo)}
                className="text-blue-500 hover:underline text-lg font-medium"
              >
                {repo.name}
              </button>
              <div className="flex space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ⭐ {repo.stargazers_count}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  🍴 {repo.forks_count}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  👀 {repo.watchers_count}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {repo.description || 'No description available.'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {repo.topics && repo.topics.length > 0 ? (
                repo.topics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">No topics</span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Language: {repo.language || 'Not specified'} | Last Updated: {new Date(repo.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setRepoPage(page => Math.max(page - 1, 1))}
          disabled={repoPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
        >
          Previous
        </button>
        <span>Page {repoPage} of {Math.ceil(filteredRepos.length / itemsPerPage)}</span>
        <button
          onClick={() => setRepoPage(page => page + 1)}
          disabled={repoPage * itemsPerPage >= filteredRepos.length}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RepositoriesView;