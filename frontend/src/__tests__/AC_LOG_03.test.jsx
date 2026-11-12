// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
});

// รองรับ: FR-LOG-07, AC-LOG-03
describe('test_AC_LOG_03_unauthorized_account_ui', () => {
  it('shows the unauthorized-account message and stays on Login', async () => {
    window.history.replaceState({}, '', '/login');
    const unauthorizedError = Object.assign(
      new Error('Account is not authorized.'),
      { status: 403 },
    );
    const client = {
      login: vi.fn().mockRejectedValue(unauthorizedError),
      getRoleHome: vi.fn(),
    };

    render(<App client={client} />);
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
      target: { value: 'suspended-user' },
    });
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
      target: { value: 'example-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      'บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ',
    );
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
    expect(screen.getByLabelText('ชื่อผู้ใช้').value).toBe('suspended-user');
    expect(screen.getByLabelText('รหัสผ่าน').value).toBe('example-password');
    expect(client.login).toHaveBeenCalledWith('suspended-user', 'example-password');
  });
});
