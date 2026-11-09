// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-05, FR-ENR-06, FR-ENR-07
const DEMO_CAMP = {
  camp_id: 'demo-camp',
  name: 'ค่าย AI สำหรับนักศึกษา (ข้อมูลจำลอง)',
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

const DEMO_APPLICATIONS_STORAGE_KEY = 'camp-enrollment-demo:submitted-applications';
const DEMO_APPLICATION_CAPACITY = 3;
const DEMO_IDENTITIES = {
  applicant: { user_id: 'demo-applicant-001', role: 'applicant' },
  admin: { user_id: 'demo-admin-001', role: 'admin' },
};
const DEMO_APPLICATION_STATUSES = new Set([
  'submitted',
  'approved',
  'waitlisted',
  'withdrawn',
]);

function createResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
  };
}

function createDemoState() {
  return {
    draft: null,
    application: null,
  };
}

function currentTimestamp() {
  return new Date().toISOString();
}

function throwValidationError(errors) {
  const error = new Error('Demo submission validation failed.');
  error.status = 422;
  error.errors = errors;
  throw error;
}

function throwDemoError(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

// รองรับ: FR-ENR-03, FR-ENR-04, FR-ENR-05, CON-ENR-03, CON-ENR-04
function validateForm(formData) {
  const errors = DEMO_CAMP.required_fields
    .filter((fieldName) => !['year_level', 'food_allergy'].includes(fieldName))
    .flatMap((fieldName) =>
      typeof formData[fieldName] !== 'string' || !formData[fieldName].trim()
        ? [{ field_name: fieldName, error_message: 'กรุณากรอกข้อมูลนี้' }]
        : [],
    );
  const yearLevel = formData.year_level;
  if (typeof yearLevel !== 'string' || !yearLevel.trim()) {
    errors.push({ field_name: 'year_level', error_message: 'กรุณากรอกข้อมูลนี้' });
  } else if (!['1', '2', '3', '4', '5', '6', 'other'].includes(yearLevel)) {
    errors.push({
      field_name: 'year_level',
      error_message: 'กรุณาเลือกระดับชั้นปีที่กำหนด',
    });
  }
  if (yearLevel === 'other' && !hasText(formData.year_level_other)) {
    errors.push({ field_name: 'year_level_other', error_message: 'กรุณากรอกข้อมูลนี้' });
  } else if (yearLevel !== 'other' && hasText(formData.year_level_other)) {
    errors.push({
      field_name: 'year_level_other',
      error_message: 'ไม่ต้องระบุรายละเอียดเมื่อไม่ได้เลือกอื่นๆ',
    });
  }

  const allergy = formData.food_allergy;
  if (typeof allergy !== 'string' || !allergy.trim()) {
    errors.push({ field_name: 'food_allergy', error_message: 'กรุณากรอกข้อมูลนี้' });
  } else if (!['no', 'yes'].includes(allergy)) {
    errors.push({
      field_name: 'food_allergy',
      error_message: 'กรุณาเลือกข้อมูลการแพ้อาหาร',
    });
  } else if (allergy === 'yes' && !hasText(formData.food_allergy_details)) {
    errors.push({
      field_name: 'food_allergy_details',
      error_message: 'กรุณากรอกข้อมูลนี้',
    });
  } else if (
    allergy === 'no'
    && (
      (
        Object.prototype.hasOwnProperty.call(formData, 'food_allergy_details')
        && typeof formData.food_allergy_details !== 'string'
      )
      || hasText(formData.food_allergy_details)
    )
  ) {
    errors.push({
      field_name: 'food_allergy_details',
      error_message: 'ไม่ต้องระบุรายละเอียดเมื่อเลือกไม่มี',
    });
  }

  return errors.concat(validateFormFieldNames(formData));
}

function validateFormFieldNames(formData) {
  const allowedFields = new Set([
    ...DEMO_CAMP.required_fields,
    'year_level_other',
    'food_allergy_details',
  ]);
  return Object.keys(formData)
    .filter((fieldName) => !allowedFields.has(fieldName))
    .map((fieldName) => ({
      field_name: fieldName,
      error_message: 'ไม่รองรับข้อมูลช่องนี้',
    }));
}

function hasText(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function assertReviewPermission(identity) {
  if (identity.role !== 'admin') {
    throwDemoError(403, 'ไม่มีสิทธิ์เข้าถึงรายการตรวจสอบใบสมัคร');
  }
}

function readSubmittedApplications(storage) {
  if (!storage) return [];
  const saved = storage.getItem(DEMO_APPLICATIONS_STORAGE_KEY);
  if (!saved) return [];

  const applications = JSON.parse(saved);
  if (!Array.isArray(applications)
      || applications.some((application) =>
        !application
        || typeof application.application_id !== 'string'
        || typeof application.camp_id !== 'string'
        || !DEMO_APPLICATION_STATUSES.has(application.status)
        || !application.form_data
        || typeof application.form_data !== 'object'
        || Array.isArray(application.form_data))) {
    throw new Error('ข้อมูลรายการใบสมัคร Demo ที่บันทึกไว้ไม่ถูกต้อง');
  }
  return applications;
}

function getApplicantApplicationStorageKey(applicantId) {
  return `camp-enrollment-demo:${encodeURIComponent(applicantId)}:application`;
}

function saveSubmittedApplication(storage, application, applicantId) {
  if (!storage) return;
  const applications = readSubmittedApplications(storage)
    .filter((savedApplication) => savedApplication.applicant_id !== applicantId);
  applications.push({ ...application, applicant_id: applicantId });
  storage.setItem(DEMO_APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
}

function persistApplicationUpdates(storage, applications) {
  if (!storage) return;
  storage.setItem(DEMO_APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  applications.forEach((application) => {
    if (application.applicant_id) {
      storage.setItem(
        getApplicantApplicationStorageKey(application.applicant_id),
        JSON.stringify(application),
      );
    }
  });
}

function sortWaitlistedApplications(applications) {
  return applications
    .filter((application) => application.status === 'waitlisted')
    .sort((left, right) =>
      (left.waitlist_position ?? Number.MAX_SAFE_INTEGER)
        - (right.waitlist_position ?? Number.MAX_SAFE_INTEGER)
      || String(left.submitted_at).localeCompare(String(right.submitted_at))
      || left.application_id.localeCompare(right.application_id));
}

function recalculateWaitlistPositions(applications) {
  sortWaitlistedApplications(applications).forEach((application, index) => {
    application.waitlist_position = index + 1;
  });
}

// รองรับ: FR-ENR-01, FR-ENR-02, FR-ENR-03, FR-ENR-04, FR-ENR-05, FR-ENR-06, FR-ENR-07
export function createDemoApiClient({
  storage,
  applicantId = 'demo-applicant',
  identity: identityName = 'applicant',
} = {}) {
  const identity = DEMO_IDENTITIES[identityName];
  if (!identity) throw new TypeError('Unknown Demo identity.');
  const state = createDemoState();
  const storagePrefix = `camp-enrollment-demo:${encodeURIComponent(applicantId)}`;
  const draftStorageKey = `${storagePrefix}:draft`;
  const applicationStorageKey = getApplicantApplicationStorageKey(applicantId);

  function getSavedDraft() {
    if (state.draft || !storage) return state.draft;
    const saved = storage.getItem(draftStorageKey);
    if (!saved) return null;
    const draft = JSON.parse(saved);
    if (!draft || typeof draft.draft_id !== 'string' || !draft.form_data
        || typeof draft.form_data !== 'object' || Array.isArray(draft.form_data)) {
      throw new Error('ข้อมูล Draft Demo ที่บันทึกไว้ไม่ถูกต้อง');
    }
    state.draft = draft;
    return state.draft;
  }

  function getSavedApplication() {
    if (state.application || !storage) return state.application;
    const saved = storage.getItem(applicationStorageKey);
    if (!saved) return null;
    const application = JSON.parse(saved);
    if (!application || typeof application.application_id !== 'string'
        || !DEMO_APPLICATION_STATUSES.has(application.status) || !application.form_data
        || typeof application.form_data !== 'object' || Array.isArray(application.form_data)) {
      throw new Error('ข้อมูลใบสมัคร Demo ที่บันทึกไว้ไม่ถูกต้อง');
    }
    state.application = application;
    return state.application;
  }

  function getCurrentApplicantApplication() {
    const savedApplication = readSubmittedApplications(storage)
      .find((application) => application.applicant_id === applicantId);
    if (savedApplication) {
      state.application = savedApplication;
      if (storage) storage.setItem(applicationStorageKey, JSON.stringify(savedApplication));
      return savedApplication;
    }
    return getSavedApplication();
  }

  return {
    getConfiguredCamp() {
      return Promise.resolve(createResponse({ ...DEMO_CAMP }));
    },

    getDraft() {
      if (getCurrentApplicantApplication()) {
        state.draft = null;
        if (storage) storage.removeItem(draftStorageKey);
        return Promise.resolve(createResponse({ detail: 'Draft not found.' }, 404));
      }
      const draft = getSavedDraft();
      if (!draft) {
        return Promise.resolve(createResponse({ detail: 'Draft not found.' }, 404));
      }

      return Promise.resolve(
        createResponse({
          draft_id: draft.draft_id,
          camp_id: DEMO_CAMP.camp_id,
          form_data: { ...draft.form_data },
          last_saved_at: draft.last_saved_at,
        }),
      );
    },

    async saveDraft(formData) {
      if (getCurrentApplicantApplication()) {
        throwDemoError(409, 'A submitted application already exists for this camp.');
      }
      const fieldErrors = validateFormFieldNames(formData);
      if (fieldErrors.length > 0) throwValidationError(fieldErrors);
      const lastSavedAt = currentTimestamp();
      state.draft = {
        draft_id: getSavedDraft()?.draft_id ?? 'demo-draft',
        form_data: { ...formData },
        last_saved_at: lastSavedAt,
      };
      if (storage) storage.setItem(draftStorageKey, JSON.stringify(state.draft));
      return createResponse({
        draft_id: state.draft.draft_id,
        camp_id: DEMO_CAMP.camp_id,
        form_data: { ...state.draft.form_data },
        last_saved_at: lastSavedAt,
      });
    },

    async submitApplication() {
      if (getCurrentApplicantApplication()) {
        throwDemoError(409, 'An application has already been submitted for this camp.');
      }
      const draft = getSavedDraft();
      if (!draft) {
        throwDemoError(404, 'Draft not found.');
      }
      const formData = draft.form_data;
      const errors = validateForm(formData);
      if (errors.length > 0) throwValidationError(errors);

      const applications = readSubmittedApplications(storage);
      if (applications.some((application) => application.applicant_id === applicantId)) {
        throwDemoError(409, 'An application has already been submitted for this camp.');
      }
      const approvedCount = applications
        .filter((application) => application.status === 'approved').length;
      const status = approvedCount < DEMO_APPLICATION_CAPACITY ? 'approved' : 'waitlisted';
      const application = {
        application_id: applicantId === 'demo-applicant'
          ? 'demo-application-001'
          : `demo-application-${encodeURIComponent(applicantId)}`,
        camp_id: DEMO_CAMP.camp_id,
        form_data: { ...formData },
        status,
        ...(status === 'waitlisted'
          ? {
            waitlist_position: sortWaitlistedApplications(applications).length + 1,
          }
          : {}),
        submitted_at: currentTimestamp(),
      };
      if (storage) storage.setItem(applicationStorageKey, JSON.stringify(application));
      saveSubmittedApplication(storage, application, applicantId);
      state.application = application;
      state.draft = null;
      if (storage) storage.removeItem(draftStorageKey);
      return createResponse(
        {
          application_id: state.application.application_id,
          camp_id: state.application.camp_id,
          form_data: { ...state.application.form_data },
          status: state.application.status,
          ...(state.application.waitlist_position
            ? { waitlist_position: state.application.waitlist_position }
            : {}),
        },
        201,
      );
    },

    async getApplication(applicationId) {
      const localApplication = getSavedApplication();
      const application = getCurrentApplicantApplication();
      if (!application
          || (
            application.application_id !== applicationId
            && localApplication?.application_id !== applicationId
          )) {
        const error = new Error('Demo application not found.');
        error.status = 404;
        throw error;
      }
      return createResponse({ ...application });
    },

    async getApplicantApplication() {
      if (identity.role !== 'applicant') {
        throwDemoError(403, 'ไม่มีสิทธิ์เข้าถึงข้อมูลใบสมัครผู้สมัคร');
      }
      const application = getCurrentApplicantApplication();
      if (!application) return createResponse({ detail: 'Application not found.' }, 404);
      return createResponse({ ...application });
    },

    async withdrawApplication() {
      if (identity.role !== 'applicant') {
        throwDemoError(403, 'ไม่มีสิทธิ์สละสิทธิ์ใบสมัคร');
      }
      const applications = readSubmittedApplications(storage);
      let application = applications.find(
        (item) => item.applicant_id === applicantId,
      );
      if (!application) {
        const savedApplication = getSavedApplication();
        if (savedApplication) {
          application = { ...savedApplication, applicant_id: applicantId };
          applications.push(application);
        }
      }
      if (!application) throwDemoError(404, 'ไม่พบใบสมัคร');
      if (application.status !== 'approved') {
        throwDemoError(409, 'สละสิทธิ์ได้เฉพาะใบสมัครที่ได้รับอนุมัติ');
      }

      application.status = 'withdrawn';
      application.waitlist_position = null;
      const nextApplicant = sortWaitlistedApplications(applications)[0];
      if (nextApplicant) {
        nextApplicant.status = 'approved';
        nextApplicant.waitlist_position = null;
      }
      recalculateWaitlistPositions(applications);
      persistApplicationUpdates(storage, applications);
      state.application = application;
      if (storage) storage.setItem(applicationStorageKey, JSON.stringify(application));
      return createResponse({ ...application });
    },

    async getReviewApplications() {
      assertReviewPermission(identity);
      const applications = readSubmittedApplications(storage);
      const statusOrder = {
        approved: 0,
        waitlisted: 1,
        withdrawn: 2,
        submitted: 3,
      };
      applications.sort((left, right) =>
        statusOrder[left.status] - statusOrder[right.status]
        || (left.waitlist_position ?? 0) - (right.waitlist_position ?? 0)
        || String(left.submitted_at).localeCompare(String(right.submitted_at)));
      return createResponse(applications);
    },

    async getReviewApplication(applicationId) {
      assertReviewPermission(identity);
      const application = readSubmittedApplications(storage)
        .find((item) => item.application_id === applicationId);
      if (!application) throwDemoError(404, 'ไม่พบใบสมัครที่ส่งแล้ว');
      return createResponse({ ...application });
    },
  };
}
