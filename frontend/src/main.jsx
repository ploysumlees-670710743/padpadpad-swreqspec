import React from "react";
import { createRoot } from "react-dom/client";
import ApplicationStatusPage from "./pages/ApplicationStatusPage.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApplicationStatusPage />
  </React.StrictMode>,
);
