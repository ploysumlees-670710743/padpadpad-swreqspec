// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '../App.jsx';
import { createApiClient } from '../api/client.js';

const camp = {
  camp_id: 'camp-001',
  name: 'ค่ายที่กำหนด',
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

afterEach(cleanup);

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

function renderEnrollment(client) {
  return render(<App client={client} />);
}

describe('AC-ENR-01 approved test cases', () => {
  it('test_TC_ENR_01_1_owner_can_resume_draft', async () => {
    // Given: CAMP_ID is configured to an open camp and the applicant is signed in.
    const storedDraft = {
      draft_id: 'draft-001',
      form_data: { full_name: 'Applicant One', student_id: '1001', food_allergy: 'no' },
    };
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn()
        .mockResolvedValueOnce(jsonResponse({ detail: 'Draft not found.' }, 404))
        .mockResolvedValueOnce(jsonResponse(storedDraft)),
      saveDraft: vi.fn().mockResolvedValue(jsonResponse({ draft_id: 'draft-001' })),
      submitApplication: vi.fn(),
    };
    renderEnrollment(client);
    expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();

    // When: The applicant fills the form, saves, and loads the Draft again.
    fireEvent.change(screen.getByLabelText('ชื่อ-นามสกุล'), {
      target: { value: 'Applicant One' },
    });
    fireEvent.change(screen.getByLabelText('รหัสนักศึกษา'), {
      target: { value: '1001' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก Draft' }));
    await waitFor(() => expect(client.saveDraft).toHaveBeenCalledOnce());
    const savedForm = client.saveDraft.mock.calls[0][0];
    expect(savedForm).toEqual({ full_name: 'Applicant One', student_id: '1001' });

    // Then: The UI displays reloaded data before submit; saving Draft does not submit the application.
    expect(client.getDraft).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Applicant One')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'ตัวอย่างข้อมูลก่อนยืนยัน' })).toBeTruthy();
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' })).toBeTruthy();
    expect(client.submitApplication).not.toHaveBeenCalled();
  });

  it('test_TC_ENR_01_2_partial_draft_can_be_resumed', async () => {
    // Given: CAMP_ID is configured to an open camp and the applicant is signed in.
    const partialDraft = {
      draft_id: 'draft-partial',
      form_data: { full_name: 'Partial Applicant' },
    };
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn().mockResolvedValue(jsonResponse(partialDraft)),
      saveDraft: vi.fn(),
    };
    renderEnrollment(client);

    // When: The applicant returns to load a Draft with only some form data saved.
    expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();

    // Then: The UI shows saved values/files only and does not invent required-field values.
    expect(screen.getByLabelText('ชื่อ-นามสกุล').value).toBe('Partial Applicant');
    expect(screen.getByLabelText('รหัสนักศึกษา').value).toBe('');
    expect(screen.getAllByText('ยังไม่ได้กรอก')).toHaveLength(5);
    expect(document.querySelector('input[type="file"]')).toBeNull();
    expect(screen.getByRole('heading', { name: 'ตัวอย่างข้อมูลก่อนยืนยัน' })).toBeTruthy();
  });

  it('test_TC_ENR_01_3_unauthenticated_user_is_prompted_to_login', async () => {
    // Given: CAMP_ID is configured to an open camp and the requester has no Session.
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(camp))
      .mockResolvedValueOnce({ ok: false, status: 401 });
    const client = createApiClient({ fetchImpl });
    renderEnrollment(client);

    // When: The UI calls a Draft API and receives HTTP 401.
    const alert = await screen.findByRole('alert');

    // Then: The UI prompts the requester to log in and does not display Draft data.
    expect(alert.textContent).toContain('กรุณาเข้าสู่ระบบก่อนดำเนินการสมัคร');
    expect(screen.queryByLabelText('ชื่อ-นามสกุล')).toBeNull();
    expect(fetchImpl).toHaveBeenNthCalledWith(2, '/applications/draft', {
      credentials: 'include',
    });
  });

  it('test_TC_ENR_01_4_other_account_cannot_read_draft', async () => {
    // Given: CAMP_ID is configured to an open camp and the first applicant has saved a Draft.
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({ detail: 'Draft not found.' }, 404)),
      saveDraft: vi.fn(),
    };
    renderEnrollment(client);

    // When: Another signed-in account tries to load the first applicant's Draft.
    expect(await screen.findByLabelText('ชื่อ-นามสกุล')).toBeTruthy();

    // Then: The UI displays no private Draft data or document upload control.
    expect(screen.queryByText('Private Applicant')).toBeNull();
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });
});
