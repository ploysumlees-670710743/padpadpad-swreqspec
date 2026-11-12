// UC-01 / UC-07 demonstration ONLY. In-memory data; never used for authenticated API.
const SAMPLE_LOCATION = 'camp-demo-001';
const SAMPLE_PROJECT = 'project-demo-001';

const initialCommunity = {
  community_id: 'community-demo-001',
  location_id: SAMPLE_LOCATION,
  community_name: 'ชุมชนบ้านคลองใหม่',
  caretaker_name: 'สมใจ ใจดี',
  caretaker_title: 'ผู้ประสานงานชุมชน',
  contact_phone: '0812345678',
  local_rules: 'รักษาความสะอาด และปฏิบัติตามแนวทางของชุมชน',
};

export const prototypeIds = { locationId: SAMPLE_LOCATION, projectId: SAMPLE_PROJECT };

export function createCommunityPrototypeClient() {
  let records = [initialCommunity];
  let nextId = 2;

  function assertLocation(locationId) {
    if (locationId !== SAMPLE_LOCATION) throw new Error('ต้นแบบนี้มีข้อมูลจำลองสำหรับ camp-demo-001 เท่านั้น');
  }

  function verifyFields(data) {
    if (!data.community_name?.trim() || !data.caretaker_name?.trim() || !data.contact_phone?.trim()) {
      throw new Error('กรุณาระบุชื่อชุมชน ชื่อผู้ดูแล และเบอร์ติดต่อ');
    }
  }

  return {
    async locations() {
      return [{ location_id: SAMPLE_LOCATION, location_name: 'สถานที่ค่ายตัวอย่าง' }];
    },
    async list(locationId) {
      assertLocation(locationId);
      return records.map(row => ({ ...row }));
    },
    async create(data) {
      assertLocation(data.location_id);
      verifyFields(data);
      const row = { ...data, community_id: `community-demo-${String(nextId++).padStart(3, '0')}` };
      records = [...records, row];
      return { ...row };
    },
    async update(communityId, data) {
      verifyFields(data);
      const previous = records.find(row => row.community_id === communityId);
      if (!previous) throw new Error('ไม่พบข้อมูลชุมชน');
      const row = { ...previous, ...data, location_id: previous.location_id };
      records = records.map(item => item.community_id === communityId ? row : item);
      return { ...row };
    },
  };
}

// UC-07: simulate a single project's workflow without authentication or network calls.
export function createProjectApprovalPrototypeClient() {
  let status = 'not_submitted';
  let history = [];
  let notifications = [];

  function assertProject(projectId) {
    if (projectId !== SAMPLE_PROJECT) throw new Error('ต้นแบบนี้มีข้อมูลจำลองสำหรับ project-demo-001 เท่านั้น');
  }
  function snapshot() {
    return {
      project_id: SAMPLE_PROJECT,
      project_name: 'โครงการค่ายอาสาพัฒนาชุมชน',
      // Both roles are simulated in the explicitly labeled offline prototype only.
      viewer_role: 'demo',
      status,
      history: history.map(row => ({ ...row })),
    };
  }
  function append(action, feedback, actor) {
    history = [...history, {
      history_id: `history-demo-${history.length + 1}`,
      actor_id: actor, action, feedback,
      occurred_at: new Date().toISOString(),
    }];
  }

  return {
    async status(projectId) {
      assertProject(projectId);
      return snapshot();
    },
    async submit(projectId) {
      assertProject(projectId);
      if (!['not_submitted', 'revision'].includes(status)) {
        throw new Error('ต้องเป็นโครงการใหม่ หรือโครงการที่ถูกส่งกลับแก้ไขเท่านั้น');
      }
      status = 'pending';
      append('submitted', '', 'committee-demo');
      return snapshot();
    },
    async decide(projectId, decision, feedback) {
      assertProject(projectId);
      if (status !== 'pending') throw new Error('โครงการต้องอยู่ระหว่างรอพิจารณา');
      if (!['approved', 'rejected', 'revision'].includes(decision)) {
        throw new Error('ผลพิจารณาไม่ถูกต้อง');
      }
      if (decision !== 'approved' && !feedback?.trim()) {
        throw new Error('กรุณาระบุเหตุผลหรือข้อเสนอแนะ');
      }
      status = decision;
      append(decision, feedback?.trim() ?? '', 'advisor-demo');
      notifications = [...notifications, {
        notification_id: `notification-demo-${notifications.length + 1}`,
        project_id: SAMPLE_PROJECT, status: decision,
        message: feedback?.trim() || 'มีผลการพิจารณาโครงการแล้ว',
      }];
      return snapshot();
    },
    async notifications(projectId) {
      assertProject(projectId);
      return notifications.map(item => ({ ...item }));
    },
  };
}
