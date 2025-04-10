import React from 'react';

const ContributedView = ({ data, projectsPage, setProjectsPage, itemsPerPage }) => {
  const paginatedProjects = data.contributed_projects.slice(
    (projectsPage - 1) * itemsPerPage,
    projectsPage * itemsPerPage
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Contributed Projects</h3>
      <div className="space-y-2">
        {paginatedProjects.map((project, index) => (
          <div
            key={index}
            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <a
              href={project}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {project}
            </a>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setProjectsPage(page => Math.max(page - 1, 1))}
          disabled={projectsPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
        >
          Previous
        </button>
        <span>Page {projectsPage} of {Math.ceil(data.contributed_projects.length / itemsPerPage)}</span>
        <button
          onClick={() => setProjectsPage(page => page + 1)}
          disabled={projectsPage * itemsPerPage >= data.contributed_projects.length}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContributedView;