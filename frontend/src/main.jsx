import React from "react";
import { createRoot } from "react-dom/client";
import ApplicantEditPage from "./pages/ApplicantEditPage.jsx";
import ApplicantSearchPage from "./pages/ApplicantSearchPage.jsx";
import ApplicationStatusPage from "./pages/ApplicationStatusPage.jsx";

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
    {renderPage()}
  </React.StrictMode>,
);
