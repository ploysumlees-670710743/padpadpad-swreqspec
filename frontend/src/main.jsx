import React from "react";
import { createRoot } from "react-dom/client";
import ScheduleManagementPage from "./pages/ScheduleManagementPage.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScheduleManagementPage />
  </React.StrictMode>,
);
