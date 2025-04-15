import React, { useState } from "react";
import OverviewView from "./OverviewView";
import RepositoriesView from "./RepositoriesView";
import ActivityView from "./ActivityView";
import ContributedView from "./ContributedView";
import SocialInsightsView from "./SocialInsightsView";

const UserStats = ({ data, platform, activeView, setSelectedRepo }) => {
  const [repoSearch, setRepoSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [repoPage, setRepoPage] = useState(1);
  const itemsPerPage = 5;

  console.log("UserStats Data:", data);

  if (!data) return null;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
        {data.username} ({platform.charAt(0).toUpperCase() + platform.slice(1)})
      </h2>
      {activeView === "overview" && <OverviewView data={data} />}
      {activeView === "repositories" && (
        <RepositoriesView
          data={data}
          repoSearch={repoSearch}
          setRepoSearch={setRepoSearch}
          languageFilter={languageFilter}
          setLanguageFilter={setLanguageFilter}
          repoPage={repoPage}
          setRepoPage={setRepoPage}
          setSelectedRepo={setSelectedRepo}
          itemsPerPage={itemsPerPage}
        />
      )}
      {activeView === "activity" && <ActivityView data={data} />}
      {activeView === "contributed" && <ContributedView data={data} />}
      {activeView === "social" && <SocialInsightsView data={data} />}
    </div>
  );
};

export default UserStats;
