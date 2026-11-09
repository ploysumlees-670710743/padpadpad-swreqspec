// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { createApiClient } from '../api/client.js';

const camp = {
  camp_id: 'camp-001',
  name: 'ค่ายตัวอย่าง',
  status: 'open',
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
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe('test_AC_ENR_01_form_preview_before_submit', () => {
  it('uses the single-camp API and saves/loads form data without document attachments', async () => {
    const storedDraft = {
      draft_id: 'draft-001',
      form_data: {
        full_name: 'นามสกุล ตัวอย่าง',
        nickname: 'ตัวอย่าง',
        student_id: '66000001',
        year_level: '2',
        phone_number: '0800000000',
        contact_channel: 'line-id',
        food_allergy: 'no',
      },
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(camp))
      .mockResolvedValueOnce(jsonResponse(storedDraft))
      .mockResolvedValueOnce(jsonResponse({ draft_id: 'draft-001' }))
      .mockResolvedValueOnce(jsonResponse(storedDraft));
    const client = createApiClient({ fetchImpl });
    render(<App client={client} />);

    expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();
    expect(screen.getByLabelText('ชื่อเล่น').value).toBe('ตัวอย่าง');
    expect(screen.getByLabelText('รหัสนักศึกษา').value).toBe('66000001');
    expect(screen.getByLabelText('ชั้นปี').value).toBe('2');
    expect(
      Array.from(screen.getByLabelText('ชั้นปี').options, (option) => option.value),
    ).toEqual(['', '1', '2', '3', '4', '5', '6', 'other']);
    expect(screen.getByLabelText('เบอร์โทรศัพท์').getAttribute('type')).toBe('tel');
    expect(screen.getByLabelText('ช่องทางติดต่อ').value).toBe('line-id');
    expect(screen.getByRole('radio', { name: 'ไม่มี' }).checked).toBe(true);
    expect(screen.getByRole('heading', { name: 'ตัวอย่างข้อมูลก่อนยืนยัน' })).toBeTruthy();
    expect(screen.queryByLabelText('เอกสารประกอบ')).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();

    fireEvent.change(screen.getByLabelText('ชื่อ-นามสกุล'), {
      target: { value: 'เปลี่ยนชื่อผู้สมัคร' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก Draft' }));
    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(4));

    const saveRequest = fetchImpl.mock.calls[2][1];
    expect(saveRequest.method).toBe('PUT');
    expect(JSON.parse(saveRequest.body)).toEqual({
      form_data: { ...storedDraft.form_data, full_name: 'เปลี่ยนชื่อผู้สมัคร' },
    });
    expect(fetchImpl.mock.calls[2][0]).toBe('/applications/draft');
    expect(screen.getByText('บันทึก Draft แล้ว')).toBeTruthy();
  });

  it('shows a login prompt when a Draft API responds with 401', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(camp))
      .mockResolvedValueOnce({ ok: false, status: 401 });
    const client = createApiClient({ fetchImpl });

    render(<App client={client} />);

    expect((await screen.findByRole('alert')).textContent).toContain(
      'กรุณาเข้าสู่ระบบก่อนดำเนินการสมัคร',
    );
    expect(screen.queryByText('นามสกุล ตัวอย่าง')).toBeNull();
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/applications/draft', {
      credentials: 'include',
    });
  });
});
