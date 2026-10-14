import { describe, expect, it } from 'vitest';

const isValidActivity = ({ activityName, date, startTime, endTime, locationId, description, responsible }) => {
  const required = [activityName, date, startTime, endTime, locationId, description, responsible];
  return required.every((value) => Boolean(value));
};

describe('TC-SCH-01-3', () => {
  it('rejects incomplete required fields before saving', () => {
    const incompleteActivity = {
      activityName: 'กิจกรรมไม่สมบูรณ์',
      date: '2026-01-10',
      startTime: '13:00',
      endTime: '14:00',
      locationId: 'loc-001',
      description: '',
      responsible: '',
    };

    expect(isValidActivity(incompleteActivity)).toBe(false);
  });
});
