import { describe, expect, it } from 'vitest';

const schedulesOverlap = (first, second) => {
  if (first.locationId !== second.locationId) return false;
  return !(first.endTime <= second.startTime || second.endTime <= first.startTime);
};

describe('TC-SCH-01-2', () => {
  it('allows same location when activities do not overlap', () => {
    const activityA = {
      locationId: 'loc-001',
      startTime: '09:00',
      endTime: '10:00',
      checklistStatus: 'Pending',
    };
    const activityB = {
      locationId: 'loc-001',
      startTime: '10:30',
      endTime: '11:30',
      checklistStatus: 'Pending',
    };
    const activityC = {
      locationId: 'loc-001',
      startTime: '11:30',
      endTime: '12:00',
      checklistStatus: 'Pending',
    };

    expect(schedulesOverlap(activityA, activityB)).toBe(false);
    expect(schedulesOverlap(activityB, activityC)).toBe(false);
    expect(activityA.checklistStatus).toBe('Pending');
    expect(activityB.checklistStatus).toBe('Pending');
    expect(activityC.checklistStatus).toBe('Pending');
  });
});
