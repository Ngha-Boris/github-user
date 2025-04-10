import React from 'react';
import { Bar } from 'react-chartjs-2';

const OverviewView = ({ data, isUser1 }) => {
  const chartData = {
    labels: ['Commits Last Year', 'Merged PRs', 'Followers', 'Following'],
    datasets: [
      {
        label: data.username,
        data: [
          data.commits_last_year,
          data.merged_pull_requests,
          data.followers,
          data.following,
        ],
        backgroundColor: isUser1 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={data.avatar}
          alt={`${data.username}'s avatar`}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Name:</strong>{' '}
            {data.name || 'Not provided'}
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Bio:</strong>{' '}
            {data.bio || 'Not provided'}
          </p>
          <p>
            <strong className="text-gray-700 dark:text-gray-300">Public Repositories:</strong>{' '}
            {data.public_repos}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">User Stats</h3>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Contribution Graph</h3>
        {data.contribution_graph && Object.keys(data.contribution_graph).length > 0 ? (
          <div className="text-gray-600 dark:text-gray-400">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 dark:border-gray-600 p-2">Date</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2">Contributions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.contribution_graph).map(([date, count], index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{date}</td>
                    <td className="border border-gray-300 dark:border-gray-600 p-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No contribution data available.</p>
        )}
      </div>
    </div>
  );
};

export default OverviewView;