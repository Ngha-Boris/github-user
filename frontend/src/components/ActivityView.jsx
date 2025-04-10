import React from 'react';
import PropTypes from 'prop-types';

const ActivityView = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Activities</h3>
      {data.recent_activities && data.recent_activities.length > 0 ? (
        <ul className="space-y-2">
          {data.recent_activities.map((activity, index) => (
            <li key={index} className="text-gray-600 dark:text-gray-400">
              {activity.description} in <span className="font-medium">{activity.repo_name}</span> on{' '}
              {new Date(activity.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No recent activities available.</p>
      )}
    </div>
  );
};

ActivityView.propTypes = {
  data: PropTypes.shape({
    recent_activities: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
        repo_name: PropTypes.string,
        created_at: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default ActivityView;