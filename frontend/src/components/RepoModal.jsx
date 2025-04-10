import React from 'react';

const RepoModal = ({ selectedRepo, setSelectedRepo }) => {
  if (!selectedRepo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        {console.log('Rendering selectedRepo:', selectedRepo)}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{selectedRepo.name}</h3>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Description:</strong>{' '}
          {selectedRepo.description || 'Not provided'}
        </p>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Language:</strong>{' '}
          {selectedRepo.language || 'Not specified'}
        </p>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Stars:</strong>{' '}
          {selectedRepo.stargazers_count}
        </p>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Forks:</strong>{' '}
          {selectedRepo.forks_count}
        </p>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Watchers:</strong>{' '}
          {selectedRepo.watchers_count}
        </p>
        <p>
          <strong className="text-gray-700 dark:text-gray-300">Last Updated:</strong>{' '}
          {new Date(selectedRepo.updated_at).toLocaleDateString()}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedRepo.topics && selectedRepo.topics.length > 0 ? (
            selectedRepo.topics.map((topic, idx) => (
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
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setSelectedRepo(null)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepoModal;