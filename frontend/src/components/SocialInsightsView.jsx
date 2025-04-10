import React from 'react';

const SocialInsightsView = ({ data }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Social Insights</h3>
      {data.social_insights ? (
        <div className="space-y-4">
          {data.linkedin_url && (
            <div>
              <h4 className="text-md font-medium text-gray-600 dark:text-gray-400">LinkedIn</h4>
              <p>
                <strong>Profile:</strong>{' '}
                <a
                  href={data.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {data.linkedin_url}
                </a>
              </p>
              {data.social_insights.linkedin_job_title && (
                <p>
                  <strong>Job Title:</strong> {data.social_insights.linkedin_job_title}
                </p>
              )}
              {data.social_insights.linkedin_company && (
                <p>
                  <strong>Company:</strong> {data.social_insights.linkedin_company}
                </p>
              )}
            </div>
          )}
          {data.twitter_handle && (
            <div>
              <h4 className="text-md font-medium text-gray-600 dark:text-gray-400">Twitter</h4>
              <p>
                <strong>Handle:</strong>{' '}
                <a
                  href={`https://twitter.com/${data.twitter_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  @{data.twitter_handle}
                </a>
              </p>
              {data.social_insights.twitter_recent_tweet && (
                <p>
                  <strong>Recent Tweet:</strong> {data.social_insights.twitter_recent_tweet}
                </p>
              )}
            </div>
          )}
          {data.personal_website && (
            <div>
              <h4 className="text-md font-medium text-gray-600 dark:text-gray-400">Personal Website</h4>
              <p>
                <strong>Website:</strong>{' '}
                <a
                  href={data.personal_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {data.personal_website}
                </a>
              </p>
              {data.social_insights.website_description && (
                <p>
                  <strong>Description:</strong> {data.social_insights.website_description}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No social media insights available. Check if the user has linked their profiles in their GitHub bio.
        </p>
      )}
    </div>
  );
};

export default SocialInsightsView;