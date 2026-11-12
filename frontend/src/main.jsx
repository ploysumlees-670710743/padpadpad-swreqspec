import React from "react";
import { createRoot } from "react-dom/client";
import ScheduleManagementPage from "./pages/ScheduleManagementPage.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScheduleManagementPage />
import VoteLocationPage from "./pages/VoteLocationPage.jsx";

function renderPage() {
  const match = window.location.pathname.match(/^\/applicants\/([^/]+)\/edit\/?$/);
  if (match) {
    return <ApplicantEditPage applicantId={decodeURIComponent(match[1])} />;
  }
  if (window.location.pathname === "/applicants/search") {
    return <ApplicantSearchPage />;
  }
  return <ApplicationStatusPage />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <VoteLocationPage />
  </React.StrictMode>,
);
