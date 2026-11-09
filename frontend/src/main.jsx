import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ApplicationStatusPage from "./pages/ApplicationStatusPage.jsx";

// รองรับ: FR-LOG-01, FR-LOG-05, AC-LOG-01
function RouteRoot() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function handleNavigation() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  return ["/login", "/home"].includes(pathname) ? (
    <App />
  ) : (
    <ApplicationStatusPage />
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouteRoot />
  </React.StrictMode>,
);
