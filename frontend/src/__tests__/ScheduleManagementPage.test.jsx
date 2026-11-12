import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';

import ScheduleManagementPage from '../pages/ScheduleManagementPage.jsx';

describe('ScheduleManagementPage', () => {
  it('renders activities and allows checklist status updates', async () => {
    const mockClient = {
      getSchedule: vi.fn(async () => ({
        ok: true,
        status: 200,
        data: {
          activities: [
            {
              activity_id: 'act-101',
              activity_name: 'พิธีเปิด',
              activity_date: '2026-01-10',
              start_time: '09:00',
              end_time: '10:00',
              location_id: 'loc-001',
              description: 'พิธีเปิดกิจกรรมค่าย',
              facilitator_or_responsible: 'อาจารย์สมชาย',
              checklist_status: 'Pending',
            },
          ],
        },
        json: async () => ({
          activities: [
            {
              activity_id: 'act-101',
              activity_name: 'พิธีเปิด',
              activity_date: '2026-01-10',
              start_time: '09:00',
              end_time: '10:00',
              location_id: 'loc-001',
              description: 'พิธีเปิดกิจกรรมค่าย',
              facilitator_or_responsible: 'อาจารย์สมชาย',
              checklist_status: 'Pending',
            },
          ],
        }),
      })),
      createScheduleActivity: vi.fn(async () => ({ ok: true, status: 201, data: {} })),
      updateScheduleActivity: vi.fn(async () => ({ ok: true, status: 200, data: {} })),
      deleteScheduleActivity: vi.fn(async () => ({ ok: true, status: 200, data: {} })),
      patchScheduleActivityChecklist: vi.fn(async () => ({ ok: true, status: 200, data: {} })),
    };

    render(<ScheduleManagementPage client={mockClient} />);

    expect(await screen.findByText('จัดการตารางกิจกรรม')).toBeInTheDocument();
    expect(screen.getByText('พิธีเปิด')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark Done' }));

    expect(mockClient.patchScheduleActivityChecklist).toHaveBeenCalledWith('act-101', 'Done');
  });
});
