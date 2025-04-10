import React from 'react';

const ActivityView = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Activity Timeline</h3>
      {data.recent_activities && data.recent_activities.length > 0 ? (
        <div className="relative border-l-2 border-blue-500 pl-6 space-y-6">
          {data.recent_activities.map((activity, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-8 top-1 w-6 h-6 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800"></div>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(activity.created_at).toLocaleString()} -{" "}
                  <span className="font-medium">{activity.event_type}</span>:{" "}
                  {activity.description} in{" "}
                  <a
                    href={`https://github.com/${activity.repo_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {activity.repo_name}
                  </a>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No recent activity available.</p>
      )}
    </div>
  );
};

export default ActivityView;