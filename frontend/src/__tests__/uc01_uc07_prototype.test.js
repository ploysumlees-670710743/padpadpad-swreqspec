import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createCommunityPrototypeClient,
  createProjectApprovalPrototypeClient,
  prototypeIds,
} from '../api/ucPrototypeClients.js';

// Offline DEMO contract only: not evidence of authentication or DB persistence.
describe('UC-01 prototype: AC-01 / AF-01-01 / C-01', () => {
  it('shows only the configured demo camp location', async () => {
    const client = createCommunityPrototypeClient();
    const locations = await client.locations();
    assert.deepEqual(locations, [
      { location_id: prototypeIds.locationId, location_name: 'สถานที่ค่ายตัวอย่าง' },
    ]);
    const rows = await client.list(prototypeIds.locationId);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].location_id, prototypeIds.locationId);
    await assert.rejects(client.list('another-camp'), /ข้อมูลจำลอง/);
  });

  it('saves and edits community data without moving a record to a different camp', async () => {
    const client = createCommunityPrototypeClient();
    const fields = {
      location_id: prototypeIds.locationId,
      community_name: 'ชุมชนทดสอบ',
      caretaker_name: 'ผู้ดูแลทดสอบ',
      caretaker_title: 'หัวหน้าชุมชน',
      contact_phone: '0811111111',
      local_rules: 'รักษาความสะอาด',
    };
    const created = await client.create(fields);
    for (const [key, value] of Object.entries(fields)) assert.equal(created[key], value);
    const changed = await client.update(created.community_id, {
      ...fields, location_id: 'another-camp', community_name: 'ชุมชนที่แก้ไข',
    });
    assert.equal(changed.community_name, 'ชุมชนที่แก้ไข');
    assert.equal(changed.location_id, prototypeIds.locationId);
    assert.equal((await client.list(prototypeIds.locationId)).length, 2);
  });

  for (const field of ['community_name', 'caretaker_name', 'contact_phone']) {
    it('rejects blank required field ' + field + ' without saving', async () => {
      const client = createCommunityPrototypeClient();
      const fields = {
        location_id: prototypeIds.locationId,
        community_name: 'ชุมชน',
        caretaker_name: 'ผู้ดูแล',
        contact_phone: '0811111111',
        [field]: '  ',
      };
      await assert.rejects(client.create(fields), /กรุณาระบุ/);
      assert.equal((await client.list(prototypeIds.locationId)).length, 1);
    });
  }
});

describe('UC-07 prototype: AC-07 / AF-07-01 / AF-07-02 / C-02', () => {
  it('records approval history and an in-app notification', async () => {
    const client = createProjectApprovalPrototypeClient();
    const startingState = await client.status(prototypeIds.projectId);
    assert.equal(startingState.status, 'not_submitted');
    assert.equal(startingState.viewer_role, 'demo');
    const submitted = await client.submit(prototypeIds.projectId);
    assert.equal(submitted.status, 'pending');
    assert.deepEqual(submitted.history.map(row => row.action), ['submitted']);
    const approved = await client.decide(prototypeIds.projectId, 'approved', '');
    assert.equal(approved.status, 'approved');
    assert.deepEqual(approved.history.map(row => row.action), ['submitted', 'approved']);
    const notices = await client.notifications(prototypeIds.projectId);
    assert.equal(notices.length, 1);
    assert.equal(notices[0].status, 'approved');
    await assert.rejects(client.submit(prototypeIds.projectId));
  });

  for (const decision of ['rejected', 'revision']) {
    it('requires a reason for ' + decision + ' without modifying pending status', async () => {
      const client = createProjectApprovalPrototypeClient();
      await client.submit(prototypeIds.projectId);
      await assert.rejects(client.decide(prototypeIds.projectId, decision, '  '), /เหตุผล/);
      assert.equal((await client.status(prototypeIds.projectId)).status, 'pending');
      assert.equal((await client.notifications(prototypeIds.projectId)).length, 0);
    });
  }

  it('allows resubmission after revision and keeps all previous decisions', async () => {
    const client = createProjectApprovalPrototypeClient();
    await client.submit(prototypeIds.projectId);
    await client.decide(prototypeIds.projectId, 'revision', 'กรุณาปรับเอกสาร');
    assert.equal((await client.status(prototypeIds.projectId)).status, 'revision');
    await client.submit(prototypeIds.projectId);
    const approved = await client.decide(prototypeIds.projectId, 'approved', 'ปรับแล้ว');
    assert.deepEqual(approved.history.map(row => row.action), [
      'submitted', 'revision', 'submitted', 'approved',
    ]);
    assert.equal((await client.notifications(prototypeIds.projectId)).length, 2);
  });

  it('rejects resubmission after final rejection', async () => {
    const client = createProjectApprovalPrototypeClient();
    await client.submit(prototypeIds.projectId);
    await client.decide(prototypeIds.projectId, 'rejected', 'ไม่ผ่านเงื่อนไข');
    await assert.rejects(client.submit(prototypeIds.projectId));
  });

  it('rejects unknown projects and decisions', async () => {
    const client = createProjectApprovalPrototypeClient();
    await assert.rejects(client.status('other-project'), /ข้อมูลจำลอง/);
    await client.submit(prototypeIds.projectId);
    await assert.rejects(client.decide(prototypeIds.projectId, 'unknown', ''), /ผลพิจารณา/);
  });
});
