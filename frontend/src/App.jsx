import React, { createContext, useEffect, useMemo, useState } from 'react';

import { apiClient } from './api/client.js';
import { createDemoApiClient } from './api/demoClient.js';
import CampEnrollmentPage from './pages/CampEnrollmentPage.jsx';
import CommunityLocationPage from './pages/CommunityLocationPage.jsx';
import ProjectApprovalPage from './pages/ProjectApprovalPage.jsx';
import ApplicantApplicationPage from './pages/ApplicantApplicationPage.jsx';

export const ApiClientContext = createContext(apiClient);

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, FR-ENR-07
function EnrollmentFlow({ client }) {
  const [applicationId, setApplicationId] = useState(
    () => new URLSearchParams(window.location.search).get('application'),
  );

  useEffect(() => {
    const handleNavigation = () => {
      setApplicationId(new URLSearchParams(window.location.search).get('application'));
    };
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  function showApplication(id) {
    const url = new URL(window.location.href);
    url.searchParams.set('application', id);
    window.history.replaceState(window.history.state, '', url);
    setApplicationId(id);
  }

  return applicationId ? (
    <ApplicantApplicationPage applicationId={applicationId} client={client} />
  ) : (
    <CampEnrollmentPage client={client} onSubmitted={showApplication} />
  );
}

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04, FR-ENR-07
function DemoApp() {
  const client = useMemo(
    () => createDemoApiClient({
      storage: {
        getItem: (key) => window.sessionStorage.getItem(key),
        setItem: (key, value) => window.sessionStorage.setItem(key, value),
      },
    }),
    [],
  );

  return (
    <div className="app-shell demo-app">
      <header className="site-header">
        <a className="brand" href="/" aria-label="หน้าสมัครเข้าร่วมค่าย">
          <span className="brand-mark" aria-hidden="true">ค</span>
          <span>
            <strong>ค่ายกิจกรรม</strong>
            <small>ระบบรับสมัครนักศึกษา</small>
          </span>
        </a>
        <span className="header-label">CAMP APPLICATION</span>
      </header>
      <main className="site-content">
        <p className="demo-banner" role="note">
          <span className="demo-indicator" aria-hidden="true" />
          <strong>Demo Mode — ข้อมูลจำลอง</strong>
          <span>ไม่เชื่อมต่อ Backend และไม่บันทึกใน PostgreSQL</span>
        </p>
        <EnrollmentFlow client={client} />
      </main>
      <footer className="site-footer">
        ตัวอย่างสำหรับการสาธิตเท่านั้น · ข้อมูลทั้งหมดเป็นข้อมูลจำลอง
      </footer>
    </div>
  );
}

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-04
export default function App({ client = apiClient, children }) {
  // UC-01 FR-01-01: feature-scoped page, preserving the existing enrollment home.
  if (new URLSearchParams(window.location.search).get('feature') === 'community-location') {
    return <CommunityLocationPage />;
  }
  if (new URLSearchParams(window.location.search).get('feature') === 'project-approval') {
    return <ProjectApprovalPage />;
  }
  if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
    return <DemoApp />;
  }

  return (
    <ApiClientContext.Provider value={client}>
      <main>{children ?? <EnrollmentFlow client={client} />}</main>
    </ApiClientContext.Provider>
  );
}
