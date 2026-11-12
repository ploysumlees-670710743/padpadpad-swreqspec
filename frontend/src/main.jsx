import React from 'react';
import { createRoot } from 'react-dom/client';
import VoteLocationPage from './pages/VoteLocationPage.jsx';
import CommunityLocationPage from './pages/CommunityLocationPage.jsx';
import ProjectApprovalPage from './pages/ProjectApprovalPage.jsx';
import {
  createCommunityPrototypeClient, createProjectApprovalPrototypeClient,
} from './api/ucPrototypeClients.js';
import './ucPrototype.css';

const feature = new URLSearchParams(window.location.search).get('feature');
const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
const communityDemo = createCommunityPrototypeClient();
const projectDemo = createProjectApprovalPrototypeClient();

// UC-01 / UC-07 only: use the existing entrypoint without changing other features' routes.
// VITE_DEMO_MODE runs an explicitly labeled, no-network prototype; normal mode uses real API.
function FeatureEntry() {
  if (feature === 'community-location' || feature === 'project-approval') {
    return (
      <>
        <nav className="uc-topbar" aria-label="หน้าต้นแบบฟีเจอร์">
          <a className="uc-brand" href="/?feature=community-location">
            <span className="uc-logo">ค</span> Camp Project
          </a>
          <div className="uc-links">
            <a className={feature === 'community-location' ? 'active' : ''} href="/?feature=community-location">UC-01 ชุมชน</a>
            <a className={feature === 'project-approval' ? 'active' : ''} href="/?feature=project-approval">UC-07 อนุมัติ</a>
          </div>
        </nav>
        {isDemo && (
          <aside className="uc-demo-banner" role="note">
            <strong>PROTOTYPE / DEMO MODE</strong>
            <span>ข้อมูลจำลองในหน้านี้เท่านั้น • ยังไม่ได้เชื่อม Login หรือบันทึกลงฐานข้อมูลจริง</span>
          </aside>
        )}
        {feature === 'community-location'
          ? <CommunityLocationPage demo={isDemo} client={isDemo ? communityDemo : undefined} />
          : <ProjectApprovalPage demo={isDemo} client={isDemo ? projectDemo : undefined} />}
        <footer className="uc-footer">Software Requirements Specification • UC-01 / UC-07 • Prototype</footer>
      </>
    );
  }
  return <VoteLocationPage />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><FeatureEntry /></React.StrictMode>,
);
