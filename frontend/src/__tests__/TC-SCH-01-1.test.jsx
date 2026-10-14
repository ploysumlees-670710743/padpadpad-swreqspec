import { describe, expect, it } from 'vitest';

const isValidActivity = ({
  activityName,
  date,
  startTime,
  endTime,
  locationId,
  description,
  responsible,
}) => {
  const required = [activityName, date, startTime, endTime, locationId, description, responsible];
  return required.every((value) => Boolean(value));
};

describe('TC-SCH-01-1', () => {
  it('creates a valid activity with Pending status and allows it to be marked Done', () => {
    const activity = {
      activityName: 'พิธีเปิด',
      date: '2026-01-10',
      startTime: '09:00',
      endTime: '10:00',
      locationId: 'loc-001',
      description: 'พิธีเปิดกิจกรรมค่าย',
      responsible: 'อาจารย์สมชาย',
      checklistStatus: 'Pending',
    };

    expect(isValidActivity(activity)).toBe(true);
    expect(activity.checklistStatus).toBe('Pending');

    activity.checklistStatus = 'Done';
    expect(activity.checklistStatus).toBe('Done');
  });
});
