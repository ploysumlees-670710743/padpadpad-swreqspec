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

describe('AC-LOG-03 approved test cases', () => {
  it('test_TC_LOG_03_1_unsupported_role_denied', async () => {
    // Given: ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบและบัญชีมีบทบาทนอกเหนือจากบทบาทที่อนุญาต
    window.history.replaceState({}, '', '/login');
    const client = {
      login: vi.fn().mockRejectedValue(
        Object.assign(new Error('Account is not authorized.'), { status: 403 }),
      ),
      getRoleHome: vi.fn(),
    };
    render(<App client={client} />);

    // When: ผู้ใช้งานพยายามเข้าสู่ระบบด้วยข้อมูลของบัญชีนั้น
    fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
      target: { value: 'unsupported-user' },
    });
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
      target: { value: 'unsupported-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    // Then: ระบบปฏิเสธ แสดงข้อความตาม spec และคงหน้าเข้าสู่ระบบ
    expect((await screen.findByRole('alert')).textContent).toBe(
      'บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ',
    );
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
  });

  it('test_TC_LOG_03_2_suspended_allowed_role_denied', async () => {
    // Given: ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบและบัญชีบทบาทนักศึกษาถูกระงับ
    window.history.replaceState({}, '', '/login');
    const client = {
      login: vi.fn().mockRejectedValue(
        Object.assign(new Error('Account is not authorized.'), { status: 403 }),
      ),
      getRoleHome: vi.fn(),
    };
    render(<App client={client} />);

    // When: ผู้ใช้งานพยายามเข้าสู่ระบบด้วยข้อมูลของบัญชีนั้น
    fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
      target: { value: 'suspended-user' },
    });
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
      target: { value: 'suspended-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    // Then: ระบบปฏิเสธ แสดงข้อความตาม spec และคงหน้าเข้าสู่ระบบ
    expect((await screen.findByRole('alert')).textContent).toBe(
      'บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานระบบ',
    );
    expect(screen.getByRole('heading', { name: 'เข้าสู่ระบบ' })).toBeTruthy();
    expect(window.location.pathname).toBe('/login');
  });

  it('test_TC_LOG_03_3_active_student_login_succeeds', async () => {
    // Given: ผู้ใช้งานอยู่ที่หน้าเข้าสู่ระบบและมีบัญชีนักศึกษาในสถานะ Active
    window.history.replaceState({}, '', '/login');
    const loginData = {
      username: 'active-student',
      role: 'student',
      menu: ['สมัครค่าย', 'ดูค่าย'],
      home_url: '/home',
    };
    const client = {
      login: vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => loginData,
      }),
      getRoleHome: vi.fn(),
    };
    render(<App client={client} />);

    // When: ผู้ใช้งานกรอก username/password ถูกต้องแล้วเข้าสู่ระบบ
    fireEvent.change(screen.getByLabelText('ชื่อผู้ใช้'), {
      target: { value: 'active-student' },
    });
    fireEvent.change(screen.getByLabelText('รหัสผ่าน'), {
      target: { value: 'correct-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    // Then: ระบบนำเข้าสู่หน้าหลักและแสดงเมนูเฉพาะบทบาทนักศึกษา
    expect(await screen.findByRole('heading', { name: 'หน้าหลัก' })).toBeTruthy();
    expect(screen.getByText('สมัครค่าย')).toBeTruthy();
    expect(screen.getByText('ดูค่าย')).toBeTruthy();
    expect(window.location.pathname).toBe('/home');
  });
});
