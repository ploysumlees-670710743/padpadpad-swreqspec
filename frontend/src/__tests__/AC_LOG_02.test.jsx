// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

// รองรับ: FR-LOG-06, AC-LOG-02
describe('test_AC_LOG_02_invalid_credentials_ui', () => {
  it('shows the invalid-credentials message and stays on Login', async () => {
    window.history.replaceState({}, '', '/login');
    const invalidCredentialsError = Object.assign(
      new Error('Authentication failed.'),
      { status: 401 },
    );
    const client = {
      login: vi.fn().mockRejectedValue(invalidCredentialsError),
      getRoleHome: vi.fn(),
    };

    render(<App client={client} />);
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
      target: { value: 'student-01' },
    });
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
      target: { value: 'incorrect-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    );
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
    expect(screen.getByLabelText('ชื่อผู้ใช้').value).toBe('student-01');
    expect(screen.getByLabelText('รหัสผ่าน').value).toBe('incorrect-password');
    expect(client.login).toHaveBeenCalledWith('student-01', 'incorrect-password');
  });
});
