import React, { createContext, useEffect, useMemo, useState } from 'react';

import { apiClient } from './api/client.js';
import { createDemoApiClient } from './api/demoClient.js';
import CampEnrollmentPage from './pages/CampEnrollmentPage.jsx';
import ApplicantApplicationPage from './pages/ApplicantApplicationPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RoleHomePage from './pages/RoleHomePage.jsx';

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

// รองรับ: FR-LOG-01, FR-LOG-02, FR-LOG-05, AC-LOG-01
export default function App({ client = apiClient, children }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [home, setHome] = useState(null);
  const [homeError, setHomeError] = useState('');

  useEffect(() => {
    function handleNavigation() {
      setPathname(window.location.pathname);
      setHome(null);
      setHomeError('');
    }

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  useEffect(() => {
    if (
      children
      || pathname !== '/home'
      || home
      || (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true')
    ) {
      return undefined;
    }

    let active = true;
    client.getRoleHome()
      .then((response) => response.json())
      .then((homeData) => {
        if (active) setHome(homeData);
      })
      .catch((error) => {
        if (active) setHomeError(error.message);
      });

    return () => {
      active = false;
    };
  }, [children, client, home, pathname]);

  if (import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true') {
    return <DemoApp />;
  }

  if (children) {
    return (
      <ApiClientContext.Provider value={client}>
        <main>{children}</main>
      </ApiClientContext.Provider>
    );
  }

  // รองรับ: FR-LOG-05, AC-LOG-01
  function navigate(path) {
    window.history.pushState({}, '', path);
    setPathname(path);
  }

  if (pathname === '/login') {
    return (
      <LoginPage
        client={client}
        onLoginSuccess={(homeData) => {
          setHome(homeData);
          navigate(homeData.home_url);
        }}
      />
    );
  }

  if (pathname === '/home') {
    if (homeError) return <p role="alert">{homeError}</p>;
    if (!home) return <p role="status">กำลังโหลดข้อมูล</p>;
    return <RoleHomePage home={home} />;
  }

  return (
    <ApiClientContext.Provider value={client}>
      <main>
        <EnrollmentFlow client={client} />
      </main>
    </ApiClientContext.Provider>
  );
}
