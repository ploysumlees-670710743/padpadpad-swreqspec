import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import ScheduleManagementPage from '../pages/ScheduleManagementPage.jsx';

function buildClient(overrides = {}) {
  return {
    getSchedule: vi.fn(async () => ({
      ok: true,
      status: 200,
      data: {
        activities: [
          {
            activity_id: 'act-100',
            activity_name: 'กิจกรรมเดิม',
            activity_date: '2026-01-10',
            start_time: '09:00',
            end_time: '10:00',
            location_id: 'loc-001',
            description: 'มีอยู่แล้ว',
            facilitator_or_responsible: 'อาจารย์สมชาย',
            checklist_status: 'Pending',
          },
        ],
      },
      json: async () => ({
        activities: [
          {
            activity_id: 'act-100',
            activity_name: 'กิจกรรมเดิม',
            activity_date: '2026-01-10',
            start_time: '09:00',
            end_time: '10:00',
            location_id: 'loc-001',
            description: 'มีอยู่แล้ว',
            facilitator_or_responsible: 'อาจารย์สมชาย',
            checklist_status: 'Pending',
          },
        ],
      }),
    })),
    createScheduleActivity: vi.fn(async () => {
      const error = new Error('Activity overlaps with an existing schedule entry in the same location and time window.');
      error.status = 422;
      throw error;
    }),
    updateScheduleActivity: vi.fn(async () => {
      const error = new Error('Activity overlaps with an existing schedule entry in the same location and time window.');
      error.status = 422;
      throw error;
    }),
    deleteScheduleActivity: vi.fn(async () => ({ ok: true, status: 200, data: {} })),
    patchScheduleActivityChecklist: vi.fn(async () => ({ ok: true, status: 200, data: {} })),
    ...overrides,
  };
}

describe('TC-SCH-02', () => {
  it('rejects overlapping activity creation with field-related error feedback', async () => {
    const client = buildClient();

    render(<ScheduleManagementPage client={client} />);

    const activityName = await screen.findByRole('textbox', { name: 'ชื่อกิจกรรม' });
    fireEvent.change(activityName, { target: { value: 'กิจกรรมซ้อนทับ' } });
    fireEvent.change(screen.getByLabelText('วันที่'), { target: { value: '2026-01-10' } });
    fireEvent.change(screen.getByLabelText('เวลาเริ่ม'), { target: { value: '09:30' } });
    fireEvent.change(screen.getByLabelText('เวลาเสร็จ'), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText('สถานที่'), { target: { value: 'loc-001' } });
    fireEvent.change(screen.getByLabelText('ผู้รับผิดชอบ'), { target: { value: 'อาจารย์หญิง' } });
    fireEvent.change(screen.getByLabelText('รายละเอียด'), { target: { value: 'ซ้อนทับ' } });

    fireEvent.submit(screen.getByRole('button', { name: /บันทึกกิจกรรม/i }).closest('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ซ้อนทับ|overlaps|ไม่สามารถ/i);
  });

  it('allows a non-overlapping activity when the next slot starts exactly at the previous end time', async () => {
    const client = buildClient();

    render(<ScheduleManagementPage client={client} />);

    const activityName = await screen.findByRole('textbox', { name: 'ชื่อกิจกรรม' });
    fireEvent.change(activityName, { target: { value: 'กิจกรรมที่สอง' } });
    fireEvent.change(screen.getByLabelText('วันที่'), { target: { value: '2026-01-10' } });
    fireEvent.change(screen.getByLabelText('เวลาเริ่ม'), { target: { value: '10:00' } });
    fireEvent.change(screen.getByLabelText('เวลาเสร็จ'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('สถานที่'), { target: { value: 'loc-001' } });
    fireEvent.change(screen.getByLabelText('ผู้รับผิดชอบ'), { target: { value: 'อาจารย์หญิง' } });
    fireEvent.change(screen.getByLabelText('รายละเอียด'), { target: { value: 'เริ่มตรงเวลา 10:00' } });

    fireEvent.submit(screen.getByRole('button', { name: /บันทึกกิจกรรม/i }).closest('form'));

    await screen.findByText('จัดการตารางกิจกรรม');
    expect(screen.getByText('กิจกรรมเดิม')).toBeInTheDocument();
  });

  it('keeps the original schedule unchanged when a duplicate update is rejected', async () => {
    const client = buildClient();

    render(<ScheduleManagementPage client={client} />);

    fireEvent.click(await screen.findByRole('button', { name: 'แก้ไข' }));
    fireEvent.change(screen.getByLabelText('เวลาเริ่ม'), { target: { value: '08:30' } });
    fireEvent.change(screen.getByLabelText('เวลาเสร็จ'), { target: { value: '09:30' } });
    fireEvent.submit(screen.getByRole('button', { name: /บันทึกการเปลี่ยนแปลง/i }).closest('form'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ซ้อนทับ|overlaps/i);
    expect(screen.getByText('กิจกรรมเดิม')).toBeInTheDocument();
  });
});
