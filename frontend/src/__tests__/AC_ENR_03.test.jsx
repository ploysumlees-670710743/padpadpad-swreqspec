// @vitest-environment jsdom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CampEnrollmentPage from '../pages/CampEnrollmentPage.jsx';

afterEach(cleanup);

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

const camp = {
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
};

describe('test_AC_ENR_03_food_allergy_validation', () => {
  it('shows and validates the year-level detail when other is selected', async () => {
    const validationError = Object.assign(new Error('Validation failed.'), {
      status: 422,
      errors: [
        {
          field_name: 'year_level_other',
          error_message: 'กรุณากรอกข้อมูลนี้',
        },
      ],
    });
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({ form_data: {} }, 404)),
      saveDraft: vi.fn().mockResolvedValue(jsonResponse({ draft_id: 'draft-001' })),
      submitApplication: vi
        .fn()
        .mockRejectedValueOnce(validationError)
        .mockResolvedValueOnce(jsonResponse({
          application_id: 'application-001',
          status: 'submitted',
        }, 201)),
    };

    render(<CampEnrollmentPage client={client} />);
    fireEvent.change(await screen.findByLabelText('ชื่อ-นามสกุล'), {
      target: { value: 'ผู้สมัคร ตัวอย่าง' },
    });
    fireEvent.change(screen.getByLabelText('ชื่อเล่น'), {
      target: { value: 'น้อง' },
    });
    fireEvent.change(screen.getByLabelText('รหัสนักศึกษา'), {
      target: { value: '66000001' },
    });
    fireEvent.change(screen.getByLabelText('ชั้นปี'), {
      target: { value: 'other' },
    });
    fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์'), {
      target: { value: '0800000000' },
    });
    fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ'), {
      target: { value: 'line-id' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'ไม่มี' }));

    const yearLevelDetail = screen.getByLabelText('โปรดระบุชั้นปี');
    expect(yearLevelDetail).toBeTruthy();
    expect(yearLevelDetail.value).toBe('');

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    expect(await screen.findByText('กรุณากรอกข้อมูลนี้')).toBeTruthy();
    expect(yearLevelDetail.getAttribute('aria-invalid')).toBe('true');
    expect(yearLevelDetail.getAttribute('aria-describedby')).toBe(
      'year_level_other-error',
    );
    expect(document.getElementById('year_level_other-error').textContent).toBe(
      'กรุณากรอกข้อมูลนี้',
    );
    expect(screen.queryByText('รอตรวจสอบ')).toBeNull();

    fireEvent.change(yearLevelDetail, { target: { value: 'ปี 7' } });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    expect(await screen.findByText('รอตรวจสอบ')).toBeTruthy();
    expect(client.saveDraft).toHaveBeenLastCalledWith(
      expect.objectContaining({
        year_level: 'other',
        year_level_other: 'ปี 7',
      }),
    );
    expect(client.submitApplication).toHaveBeenCalledTimes(2);
  });

  it('requires allergy details when yes is selected, then permits submission when provided', async () => {
    const validationError = Object.assign(new Error('Validation failed.'), {
      status: 422,
      errors: [
        {
          field_name: 'food_allergy_details',
          error_message: 'กรุณากรอกข้อมูลนี้',
        },
      ],
    });
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn().mockResolvedValue(jsonResponse({ form_data: {} }, 404)),
      saveDraft: vi.fn(),
      submitApplication: vi
        .fn()
        .mockRejectedValueOnce(validationError)
        .mockResolvedValueOnce(jsonResponse({
          application_id: 'application-001', status: 'submitted',
        }, 201)),
    };

    render(<CampEnrollmentPage client={client} />);
    fireEvent.change(await screen.findByLabelText('ชื่อ-นามสกุล'), {
      target: { value: 'ผู้สมัคร ตัวอย่าง' },
    });
    fireEvent.change(screen.getByLabelText('ชื่อเล่น'), {
      target: { value: 'น้อง' },
    });
    fireEvent.change(screen.getByLabelText('รหัสนักศึกษา'), {
      target: { value: '66000001' },
    });
    fireEvent.change(screen.getByLabelText('ชั้นปี'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('เบอร์โทรศัพท์'), {
      target: { value: '0800000000' },
    });
    fireEvent.change(screen.getByLabelText('ช่องทางติดต่อ'), {
      target: { value: 'line-id' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'มี' }));
    expect(
      document.querySelector('textarea[name="food_allergy_details"]'),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    const detailsError = await screen.findByText('กรุณากรอกข้อมูลนี้');
    expect(detailsError).toBeTruthy();
    expect(
      document.querySelector('textarea[name="food_allergy_details"]').getAttribute('aria-invalid'),
    )
      .toBe('true');
    expect(screen.queryByText('รอตรวจสอบ')).toBeNull();

    fireEvent.change(document.querySelector('textarea[name="food_allergy_details"]'), {
      target: { value: 'แพ้ถั่วลิสง' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันส่งใบสมัคร' }));

    expect(await screen.findByText('รอตรวจสอบ')).toBeTruthy();
    expect(client.submitApplication).toHaveBeenCalledTimes(2);
  });

  it('clears allergy details when switching from yes to no and omits them from the Draft', async () => {
    const formData = {};
    const client = {
      getConfiguredCamp: vi.fn().mockResolvedValue(jsonResponse(camp)),
      getDraft: vi.fn()
        .mockResolvedValueOnce(jsonResponse({ detail: 'Draft not found.' }, 404))
        .mockImplementation(async () => jsonResponse({ form_data: { ...formData } })),
      saveDraft: vi.fn().mockImplementation(async (data) => {
        Object.assign(formData, data);
        return jsonResponse({ draft_id: 'draft-001' });
      }),
      submitApplication: vi.fn(),
    };

    render(<CampEnrollmentPage client={client} />);
    await screen.findByLabelText('ชื่อ-นามสกุล');
    fireEvent.click(screen.getByRole('radio', { name: 'มี' }));
    fireEvent.change(document.querySelector('textarea[name="food_allergy_details"]'), {
      target: { value: 'แพ้ถั่วลิสง' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'ไม่มี' }));

    expect(screen.queryByLabelText('รายละเอียดการแพ้อาหาร')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก Draft' }));

    await waitFor(() => expect(client.saveDraft).toHaveBeenCalledOnce());
    expect(client.saveDraft.mock.calls[0][0]).toEqual({ food_allergy: 'no' });
    expect(client.saveDraft.mock.calls[0][0]).not.toHaveProperty('food_allergy_details');
  });
});
