import React from 'react';

const Header = ({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
      >
        {sidebarOpen ? '✖' : '☰'}
      </button>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        GitHub User Stats
      </h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default Header;