import React from 'react';

const UserInput = ({
  username,
  setUsername,
  handleFetchUser,
  placeholder,
  buttonText,
}) => {
  return (
    <div>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={placeholder}
        className="p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      <button
        onClick={handleFetchUser}
        className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default UserInput;