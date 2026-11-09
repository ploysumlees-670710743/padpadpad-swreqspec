// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { createDemoApiClient } from '../api/demoClient.js';

const validForm = {
  full_name: 'ผู้สมัครตรวจสอบ',
  nickname: 'ตัวอย่าง',
  student_id: '66000001',
  year_level: '2',
  phone_number: '0800000000',
  contact_channel: 'line-id',
  food_allergy: 'no',
};

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

async function seedSubmittedApplication() {
  const client = createDemoApiClient({
    storage: window.localStorage,
    applicantId: 'demo-applicant-001',
    identity: 'applicant',
  });
  await client.saveDraft(validForm);
  await client.submitApplication();
}

async function seedApplication(storage, applicantId, fullName) {
  const client = createDemoApiClient({
    storage,
    applicantId,
    identity: 'applicant',
  });
  await client.saveDraft({ ...validForm, full_name: fullName });
  await client.submitApplication();
  return client;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Demo enrollment decisions and Staff Review (AC-ENR-04)', () => {
  it('lets the fixed Demo Admin view approved application details without manual decisions', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    await seedSubmittedApplication();
    window.history.replaceState(null, '', '/demo/admin');

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'รายการใบสมัครที่ส่งแล้ว' })).toBeTruthy();
    fireEvent.click(await screen.findByRole('button', { name: /ผู้สมัครตรวจสอบ/ }));
    expect(await screen.findByRole('heading', { name: 'รายละเอียดใบสมัคร' })).toBeTruthy();
    expect(screen.getByText('ชื่อ-นามสกุล')).toBeTruthy();
    expect(screen.getAllByText('ผู้สมัครตรวจสอบ').length).toBeGreaterThan(0);
    expect(screen.getAllByText('อนุมัติแล้ว').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /^อนุมัติ$/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^ปฏิเสธ$/ })).toBeNull();
  });

  it('restores the applicant status after refresh without showing the form again', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    await seedSubmittedApplication();
    window.history.replaceState(null, '', '/demo/applicant');

    render(<App />);

    expect(await screen.findByText('อนุมัติแล้ว', { selector: '.demo-status-badge' })).toBeTruthy();
    expect(screen.getByText('ผู้สมัครตรวจสอบ')).toBeTruthy();
    expect(screen.queryByLabelText('ชื่อ-นามสกุล')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'รายการใบสมัครที่ส่งแล้ว' })).toBeNull();
  });

  it('shows the applicant own waitlist position after refresh', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    const storage = window.localStorage;
    for (let index = 1; index <= 3; index += 1) {
      await seedApplication(
        storage,
        `before-waitlist-${index}`,
        `Before Waitlist ${index}`,
      );
    }
    await seedApplication(storage, 'demo-applicant-001', 'Waitlisted Applicant');
    window.history.replaceState(null, '', '/demo/applicant');

    render(<App />);

    expect(await screen.findByText('รายชื่อสำรอง', { selector: '.demo-status-badge' }))
      .toBeTruthy();
    expect(screen.getByText('ลำดับสำรอง: 1')).toBeTruthy();
    expect(screen.queryByLabelText('ชื่อ-นามสกุล')).toBeNull();
  });

  it('requires confirmation before withdrawing and shows the applicant withdrawn status', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    await seedSubmittedApplication();
    window.history.replaceState(null, '', '/demo/applicant');
    vi.spyOn(window, 'confirm')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'สละสิทธิ์' }));
    expect(screen.getByText('อนุมัติแล้ว', { selector: '.demo-status-badge' })).toBeTruthy();
    expect(window.confirm).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'สละสิทธิ์' }));
    expect(await screen.findByText('สละสิทธิ์แล้ว', { selector: '.demo-status-badge' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'สละสิทธิ์' })).toBeNull();
  });

  it('shows approved, waitlisted, and withdrawn entries in the read-only Admin list', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'true');
    const storage = window.localStorage;
    const applicants = [];
    for (let index = 1; index <= 5; index += 1) {
      applicants.push(await seedApplication(
        storage,
        `staff-list-applicant-${index}`,
        `Staff List Applicant ${index}`,
      ));
    }
    await applicants[0].withdrawApplication();
    window.history.replaceState(null, '', '/demo/admin');

    render(<App />);

    expect(await screen.findByRole('button', { name: /Staff List Applicant 1/ })).toBeTruthy();
    expect(screen.getByText('สละสิทธิ์แล้ว')).toBeTruthy();
    expect(screen.getByText('รายชื่อสำรอง ลำดับ 1')).toBeTruthy();
    expect(screen.getAllByText('อนุมัติแล้ว').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Staff List Applicant 5/ }));
    expect(await screen.findByText('รายชื่อสำรอง ลำดับ 1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^อนุมัติ$/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^ปฏิเสธ$/ })).toBeNull();
  });

  it('does not activate Demo routes or Mock permissions when Demo Mode is off', async () => {
    vi.stubEnv('VITE_DEMO_MODE', 'false');
    window.history.replaceState(null, '', '/demo/admin');
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse({
        name: 'ค่ายจริง',
        required_fields: ['full_name'],
      })),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({ detail: 'Draft not found.' }, 404)),
    };

    render(<App client={client} />);

    expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'รายการใบสมัครที่ส่งแล้ว' })).toBeNull();
    expect(screen.queryByText('Demo Mode — ข้อมูลจำลอง')).toBeNull();
  });
});
