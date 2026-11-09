// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CampEnrollmentPage from '../pages/CampEnrollmentPage.jsx';
import { createApiClient } from '../api/client.js';

afterEach(cleanup);

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
  };
}

describe('test_AC_ENR_02_form_error_ui', () => {
  it('identifies incomplete fields and keeps the Draft editable after Submit fails', async () => {
    const savedDraft = {
      form_data: { full_name: 'Applicant One', student_id: '1001' },
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          camp_id: 'camp-001',
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
      )
      .mockResolvedValueOnce(
        jsonResponse({
          form_data: { full_name: 'Applicant One' },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ draft_id: 'draft-001' }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            errors: [
              {
                field_name: 'student_id',
                error_message: 'กรุณากรอกข้อมูลนี้',
              },
            ],
          },
          422,
        ),
      )
      .mockResolvedValueOnce(jsonResponse({ draft_id: 'draft-001' }))
      .mockResolvedValueOnce(jsonResponse(savedDraft));
    const client = createApiClient({ fetchImpl });

    render(<CampEnrollmentPage client={client} />);

    const fullName = await screen.findByLabelText('ชื่อ-นามสกุล');
    const studentId = screen.getByLabelText('รหัสนักศึกษา');
    expect(screen.queryByLabelText('เอกสารประกอบ')).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(fullName.value).toBe('Applicant One');
    expect(studentId.value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    const fieldError = await screen.findByText('กรุณากรอกข้อมูลนี้');
    expect(fieldError).toBeTruthy();
    expect(studentId.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('ข้อมูลไม่ครบถ้วน กรุณาแก้ไขช่องที่ระบุ')).toBeTruthy();
    expect(screen.queryByText('รอตรวจสอบ')).toBeNull();
    expect(screen.getByLabelText('ชื่อ-นามสกุล').value).toBe('Applicant One');

    fireEvent.change(studentId, { target: { value: '1001' } });
    expect(screen.queryByText('กรุณากรอกข้อมูลนี้')).toBeNull();
    expect(studentId.getAttribute('aria-invalid')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก Draft' }));

    await waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(6));
    const saveRequest = fetchImpl.mock.calls[4][1];
    expect(JSON.parse(fetchImpl.mock.calls[2][1].body)).toEqual({
      form_data: { full_name: 'Applicant One' },
    });
    expect(JSON.parse(saveRequest.body)).toEqual({ form_data: {
      full_name: 'Applicant One',
      student_id: '1001',
    } });
    expect(screen.getByLabelText('รหัสนักศึกษา').value).toBe('1001');
  });
});
