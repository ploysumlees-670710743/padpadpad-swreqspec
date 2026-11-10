// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CampEnrollmentPage from '../pages/CampEnrollmentPage.jsx';
import { createApiClient } from '../api/client.js';

afterEach(cleanup);

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('test_AC_ENR_04_submit_ui', () => {
  it('submits after preview confirmation and shows the review status', async () => {
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(
        jsonResponse({
          camp_id: 'server-configured-camp',
          name: 'ค่ายตัวอย่าง',
          required_fields: [
            'full_name',
            'nickname',
            'student_id',
            'year_level',
            'phone_number',
            'contact_channel',
            'food_allergy',
          ],
          required_documents: [],
        }),
      ),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({ form_data: {} })),
      saveDraft: vi.fn(),
      submitApplication: vi.fn().mockResolvedValue(jsonResponse({
        application_id: 'application-001', status: 'submitted',
      }, 201)),
    };

    render(<CampEnrollmentPage client={client} />);

    expect(await screen.findByRole('heading', { name: 'ตัวอย่างข้อมูลก่อนยืนยัน' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('ชื่อ-นามสกุล'), {
      target: { value: 'ผู้สมัคร ตัวอย่าง' },
    });
    fireEvent.change(screen.getByLabelText('ชื่อเล่น'), {
      target: { value: 'น้อง' },
    });
    fireEvent.change(screen.getByLabelText('รหัสนักศึกษา'), {
      target: { value: '66000001' },
    });
    fireEvent.change(screen.getByLabelText('ชั้นปี'), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์'), {
      target: { value: '0800000000' },
    });
    fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ'), {
      target: { value: 'line-id' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'ไม่มี' }));
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    expect(await screen.findByText('รอตรวจสอบ')).toBeTruthy();
    expect(client.submitApplication).toHaveBeenCalledOnce();
    expect(client.saveDraft).toHaveBeenCalledWith({
      full_name: 'ผู้สมัคร ตัวอย่าง',
      nickname: 'น้อง',
      student_id: '66000001',
      year_level: '1',
      phone_number: '0800000000',
      contact_channel: 'line-id',
      food_allergy: 'no',
    });
    expect(screen.queryByRole('button', { name: 'ยืนยันส่งใบสมัคร' })).toBeNull();
  });

  it('calls the submit endpoint without sending a camp_id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ status: 'submitted' }, 201));
    const client = createApiClient({ fetchImpl });

    await client.submitApplication();

    expect(fetchImpl).toHaveBeenCalledWith('/applications/submit', {
      credentials: 'include',
      method: 'POST',
    });
  });

  it('reports an invalid Submit response instead of claiming success', async () => {
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse({
        name: 'ค่ายตัวอย่าง', required_fields: ['full_name'],
      })),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({}, 404)),
      saveDraft: vi.fn().mockResolvedValue(jsonResponse({})),
      submitApplication: vi.fn().mockResolvedValue(jsonResponse({ status: 'submitted' }, 201)),
    };
    const onSubmitted = vi.fn();
    render(<CampEnrollmentPage client={client} onSubmitted={onSubmitted} />);
    await screen.findByLabelText('ชื่อ-นามสกุล');
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));
    expect(await screen.findByText('ส่งใบสมัครแล้ว แต่ระบบไม่ได้ส่งรหัสใบสมัครกลับมา')).toBeTruthy();
    expect(onSubmitted).not.toHaveBeenCalled();
    expect(screen.queryByText('รอตรวจสอบ')).toBeNull();
  });
});
