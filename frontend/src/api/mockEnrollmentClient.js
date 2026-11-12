const STORAGE_KEY = 'camp-enrollment-demo-draft';
const APPLICATIONS_KEY = 'camp-enrollment-demo-applications';

const mockCamp = {
  camp_id: 'camp-001',
  name: 'ค่าย AI สำหรับนักศึกษา',
  status: 'open',
  open_date: '2569-11-01',
  close_date: '2569-11-30',
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

function response(status, data) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data,
  };
}

function readApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '{}');
  } catch {
    return {};
  }
}

export const mockEnrollmentClient = {
  async getConfiguredCamp() {
    return response(200, mockCamp);
  },

  async getDraft() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return response(404, { detail: 'Draft not found' });
    }

    return response(200, {
      form_data: JSON.parse(saved),
    });
  },

  async saveDraft(formData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    return response(200, { message: 'Draft saved' });
  },

  async submitApplication() {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    const formData = savedDraft ? JSON.parse(savedDraft) : {};

    const applicationId = `DEMO-${Date.now()}`;

    const application = {
      application_id: applicationId,
      status: 'submitted',
      form_data: formData,
    };

    const applications = readApplications();
    applications[applicationId] = application;

    localStorage.setItem(
      APPLICATIONS_KEY,
      JSON.stringify(applications)
    );

    return response(200, {
      application_id: applicationId,
      status: 'submitted',
    });
  },

  async getApplication(applicationId) {
    const applications = readApplications();
    const application = applications[applicationId];

    if (!application) {
      return response(404, {
        application_id: applicationId,
        status: 'not_found',
        form_data: {},
      });
    }

    return response(200, application);
  },
};
