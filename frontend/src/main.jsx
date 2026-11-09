import React from "react";
import { createRoot } from "react-dom/client";
import ApplicantEditPage from "./pages/ApplicantEditPage.jsx";
import ApplicationStatusPage from "./pages/ApplicationStatusPage.jsx";

function renderPage() {
  const match = window.location.pathname.match(/^\/applicants\/([^/]+)\/edit\/?$/);
  if (match) {
    return <ApplicantEditPage applicantId={decodeURIComponent(match[1])} />;
  }
  return <ApplicationStatusPage />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {renderPage()}
  </React.StrictMode>,
);
