// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';

function response(data, status = 200) {
  return { status, ok: status < 400, json: async () => data };
}

function fillForm() {
  for (const [label, value] of [
    ['ชื่อ-นามสกุล', 'ผู้สมัคร ตัวอย่าง'],
    ['ชื่อเล่น', 'น้อง'],
    ['รหัสนักศึกษา', '66000001'],
    ['ชั้นปี', '2'],
    ['เบอร์โทรศัพท์', '0800000000'],
    ['ช่องทางติดต่อ', 'line-id'],
  ]) {
    fireEvent.change(screen.getByLabelText(new RegExp(label)), { target: { value } });
  }
  fireEvent.click(screen.getByRole('radio', { name: 'ไม่มี' }));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('AC-ENR-04 และ AC-ENR-05: navigation and refresh', () => {
  it('keeps validation errors on the form, then shows Demo status and restores it after refresh without fetch', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    const fetchImpl = vi.fn();
    vi.stubGlobal('fetch', fetchImpl);
    const first = render(<App />);

    await screen.findByLabelText('ชื่อ-นามสกุล');
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));
    await screen.findByText('ข้อมูลไม่ครบถ้วน กรุณาแก้ไขช่องที่ระบุ');
    expect(screen.getByLabelText(/ชื่อ-นามสกุล/).getAttribute('aria-invalid')).toBe('true');
    expect(screen.queryByText('รอตรวจสอบ')).toBeNull();

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));
    expect(await screen.findByText('อนุมัติแล้ว', { selector: '.demo-status-badge' })).toBeTruthy();
    expect(screen.getByText('ผู้สมัคร ตัวอย่าง')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'ยืนยันส่งใบสมัคร' })).toBeNull();
    expect(new URLSearchParams(location.search).get('application')).toBe('demo-application-001');
    first.unmount();

    render(<App />);
    expect(await screen.findByText('อนุมัติแล้ว', { selector: '.demo-status-badge' })).toBeTruthy();
    expect(screen.getByText('ผู้สมัคร ตัวอย่าง')).toBeTruthy();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('navigates with the returned application_id and reloads through the real client interface', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'false');
    const application = {
      application_id: 'application-001',
      status: 'submitted',
      form_data: { full_name: 'ผู้สมัคร ตัวอย่าง' },
    };
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(response({
        name: 'ค่ายตัวอย่าง',
        required_fields: ['full_name', 'nickname', 'student_id', 'year_level', 'phone_number', 'contact_channel', 'food_allergy'],
      })),
      getDraft: vi.fn().mockResolvedValue(response({}, 404)),
      saveDraft: vi.fn().mockResolvedValue(response({})),
      submitApplication: vi.fn().mockResolvedValue(response(application, 201)),
      getApplication: vi.fn().mockResolvedValue(response(application)),
    };
    const first = render(<App client={client} />);
    await screen.findByLabelText('ชื่อ-นามสกุล');
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    expect(await screen.findByText('รอตรวจสอบ', { selector: '.application-status-badge' })).toBeTruthy();
    expect(client.getApplication).toHaveBeenCalledWith('application-001');
    expect(client.saveDraft).toHaveBeenCalledWith(expect.objectContaining({
      full_name: 'ผู้สมัคร ตัวอย่าง',
      food_allergy: 'no',
    }));
    expect(new URLSearchParams(location.search).get('application')).toBe('application-001');
    first.unmount();

    render(<App client={client} />);
    await screen.findByText('รอตรวจสอบ', { selector: '.application-status-badge' });
    await waitFor(() => expect(client.getApplication).toHaveBeenCalledTimes(2));
    expect(screen.getByText('ผู้สมัคร ตัวอย่าง')).toBeTruthy();
  });
});
