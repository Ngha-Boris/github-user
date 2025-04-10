import React from 'react';

const ComparisonTable = ({ userData, userData2 }) => {
  if (!userData || !userData2) return null;

  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
        User Comparison
      </h3>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-gray-300 dark:border-gray-600 p-2">Metric</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">{userData.username}</th>
            <th className="border border-gray-300 dark:border-gray-600 p-2">{userData2.username}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 dark:border-gray-600 p-2">Commits Last Year</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData.commits_last_year}</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData2.commits_last_year}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 dark:border-gray-600 p-2">Merged PRs</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData.merged_pull_requests}</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData2.merged_pull_requests}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 dark:border-gray-600 p-2">Followers</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData.followers}</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData2.followers}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 dark:border-gray-600 p-2">Following</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData.following}</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData2.following}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 dark:border-gray-600 p-2">Public Repos</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData.public_repos}</td>
            <td className="border border-gray-300 dark:border-gray-600 p-2">{userData2.public_repos}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;