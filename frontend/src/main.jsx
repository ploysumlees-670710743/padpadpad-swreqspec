import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './styles.css';


import VoteLocationPage from './pages/VoteLocationPage.jsx';
import CommunityLocationPage from './pages/CommunityLocationPage.jsx';
import ProjectApprovalPage from './pages/ProjectApprovalPage.jsx';
import ApplicationStatusPage from './pages/ApplicationStatusPage.jsx';
import ScheduleManagementPage from './pages/ScheduleManagementPage.jsx';
import ApplicantSearchPage from './pages/ApplicantSearchPage.jsx';
import ApplicantEditPage from './pages/ApplicantEditPage.jsx';

import './ucPrototype.css';

function RouteRoot() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    function handleNavigation() {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    }

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const params = new URLSearchParams(search);
  const feature = params.get('feature');

  // UC-01 / UC-07 feature pages
  if (feature === 'vote-location') {
    return <VoteLocationPage />;
  }

  if (feature === 'community-location') {
    return <CommunityLocationPage />;
  }

  if (feature === 'project-approval') {
    return <ProjectApprovalPage />;
  }

  // Applicant pages
  const editMatch = pathname.match(
    /^\/applicants\/([^/]+)\/edit\/?$/
  );

  if (editMatch) {
    return (
      <ApplicantEditPage
        applicantId={decodeURIComponent(editMatch[1])}
      />
    );
  }

  if (/^\/applicants\/?$/.test(pathname)) {
    return <ApplicantSearchPage />;
  }

  // Schedule management
  if (/^\/schedule\/?$/.test(pathname)) {
    return <ScheduleManagementPage />;
  }

  // Application status
  if (
    pathname === '/application-status' ||
    pathname === '/applications/status'
  ) {
    return <ApplicationStatusPage />;
  }

  // Login, role home, enrollment and other App routes
  if (
    pathname === '/login' ||
    pathname === '/home' ||
    pathname === '/enrollment' ||
    pathname === '/camp-enrollment'
  ) {
    return <App />;
  }

  // Preserve the original default page
  return <VoteLocationPage />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouteRoot />
  </React.StrictMode>
);
