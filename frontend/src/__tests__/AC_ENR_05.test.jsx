// @vitest-environment jsdom

import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApiClient } from '../api/client.js';
import ApplicantApplicationPage from '../pages/ApplicantApplicationPage.jsx';

afterEach(cleanup);

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('test_AC_ENR_05_application_view', () => {
  it('shows the saved application data and review status to its applicant', async () => {
    const application = {
      application_id: 'application-001',
      camp_id: 'camp-001',
      form_data: {
        full_name: 'Applicant One',
        student_id: '1001',
        food_allergy: 'no',
      },
      status: 'submitted',
    };
    const client = {
      getApplication: vi.fn().mockResolvedValue(jsonResponse(application)),
    };

    render(
      <ApplicantApplicationPage
        applicationId="application-001"
        client={client}
      />,
    );

    expect(
      await screen.findByText('รอตรวจสอบ', {
        selector: '.application-status-badge',
      }),
    ).toBeTruthy();
    expect(screen.getByText('ชื่อ-นามสกุล')).toBeTruthy();
    expect(screen.getByText('Applicant One')).toBeTruthy();
    expect(screen.getByText('รหัสนักศึกษา')).toBeTruthy();
    expect(screen.getByText('1001')).toBeTruthy();
    expect(screen.getByText('ข้อมูลการแพ้อาหาร')).toBeTruthy();
    expect(screen.getByText('ไม่มี')).toBeTruthy();
    expect(client.getApplication).toHaveBeenCalledOnce();
    expect(client.getApplication).toHaveBeenCalledWith('application-001');
  });

  it('requests the selected application through the authenticated API client', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}));
    const client = createApiClient({ fetchImpl });

    await client.getApplication('application 001');

    expect(fetchImpl).toHaveBeenCalledWith('/applications/application%20001', {
      credentials: 'include',
    });
  });

  it('prompts the applicant to log in when the API rejects the session', async () => {
    const client = {
      getApplication: vi.fn().mockRejectedValue({ status: 401 }),
    };

    render(
      <ApplicantApplicationPage
        applicationId="application-001"
        client={client}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain(
      'กรุณาเข้าสู่ระบบก่อนตรวจสอบข้อมูลการสมัคร',
    );
  });
});
