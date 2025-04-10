import React from 'react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeView, setActiveView }) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">GitHub Dashboard</h2>
      </div>
      <nav className="mt-4">
        {['overview', 'repositories', 'activity', 'contributed', 'social'].map((view) => (
          <button
            key={view}
            onClick={() => {
              setActiveView(view);
              setSidebarOpen(false);
            }}
            className={`w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
              activeView === view ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
          >
            {view === 'social' ? 'Social Insights' : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;