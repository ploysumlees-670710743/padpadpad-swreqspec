import React from "react";
import { createRoot } from "react-dom/client";
import ApplicationStatusPage from "./pages/ApplicationStatusPage.jsx";
import ScheduleManagementPage from "./pages/ScheduleManagementPage.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {window.location.pathname === "/schedule" ? (
      <ScheduleManagementPage />
    ) : (
      <ApplicationStatusPage />
    )}
  </React.StrictMode>,
);
