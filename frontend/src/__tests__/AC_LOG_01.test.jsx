// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { createApiClient } from '../api/client.js';

const roleMenus = {
  student: ['สมัครค่าย', 'ดูค่าย'],
  committee: ['ล็อก', 'ตรวจเอกสาร', 'ประกาศค่าย'],
  faculty: ['ล็อก', 'อนุมัติโครงการ'],
};

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  };
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

// รองรับ: FR-LOG-01, FR-LOG-02, FR-LOG-05, AC-LOG-01
describe('test_AC_LOG_01_login_success_by_role_ui', () => {
  it('navigates active users to their role-specific home page', async () => {
    for (const [role, menu] of Object.entries(roleMenus)) {
      window.history.replaceState({}, '', '/login');
      const loginResult = {
        username: role,
        role,
        menu,
        home_url: '/home',
      };
      const client = {
        login: vi.fn().mockResolvedValue(jsonResponse(loginResult)),
        getRoleHome: vi.fn(),
      };
      render(<App client={client} />);

      expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
      fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
        target: { value: role },
      });
      fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
        target: { value: `password-${role}` },
      });
      fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

      expect(await screen.findByRole('heading', { name: 'หน้าหลัก' })).toBeTruthy();
      expect(screen.getByText(role)).toBeTruthy();
      for (const menuItem of menu) {
        expect(screen.getByText(menuItem)).toBeTruthy();
      }
      expect(window.location.pathname).toBe('/home');
      expect(client.login).toHaveBeenCalledWith(role, `password-${role}`);
      expect(client.getRoleHome).not.toHaveBeenCalled();
      cleanup();
    }
  });

  it('loads the signed-in role menu when opening /home directly', async () => {
    window.history.replaceState({}, '', '/home');
    const home = {
      username: 'student-01',
      role: 'student',
      menu: roleMenus.student,
    };
    const client = {
      login: vi.fn(),
      getRoleHome: vi.fn().mockResolvedValue(jsonResponse(home)),
    };
    render(<App client={client} />);

    await waitFor(() => expect(client.getRoleHome).toHaveBeenCalledOnce());
    expect(await screen.findByText('student-01')).toBeTruthy();
    for (const menuItem of roleMenus.student) {
      expect(screen.getByText(menuItem)).toBeTruthy();
    }
  });

  it('sends login credentials and requests the role home with the session cookie', async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}));
    const client = createApiClient({ baseUrl: '/api', fetchImpl });

    await client.login('student-01', 'example-password');
    await client.getRoleHome();

    expect(fetchImpl).toHaveBeenNthCalledWith(1, '/api/login', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'student-01', password: 'example-password' }),
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/api/home', {
      credentials: 'include',
    });
  });
});
