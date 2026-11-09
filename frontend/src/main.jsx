import React from "react";
import { createRoot } from "react-dom/client";
import VoteLocationPage from "./pages/VoteLocationPage.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <VoteLocationPage />
  </React.StrictMode>,
);
