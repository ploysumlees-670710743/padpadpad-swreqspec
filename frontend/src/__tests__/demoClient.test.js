import { describe, expect, it } from 'vitest';

import { createDemoApiClient } from '../api/demoClient.js';

const validForm = {
  full_name: 'ผู้สมัคร ตัวอย่าง',
  nickname: 'น้อง',
  student_id: '66000001',
  year_level: '2',
  phone_number: '0800000000',
  contact_channel: 'line-id',
  food_allergy: 'no',
};

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

async function submitForm(formData) {
  const client = createDemoApiClient();
  await client.saveDraft({ ...validForm, ...formData });
  return client.submitApplication();
}

async function submitForApplicant(storage, applicantId, formData = validForm) {
  const client = createDemoApiClient({ storage, applicantId });
  await client.saveDraft({ ...formData });
  const response = await client.submitApplication();
  return { client, application: await response.json() };
}

describe('Demo API contract (AC-ENR-01, AC-ENR-03, AC-ENR-04, AC-ENR-05)', () => {
  it('saves and reloads Draft data and returns the approved Demo Application shape', async () => {
    const client = createDemoApiClient();
    const camp = await client.getConfiguredCamp();
    const campData = await camp.json();
    expect(campData.required_documents).toEqual([]);
    expect(campData.required_fields).toEqual(Object.keys(validForm));

    await client.saveDraft(validForm);
    const draft = await client.getDraft();
    const draftData = await draft.json();
    expect(draftData).toMatchObject({
      draft_id: 'demo-draft',
      camp_id: 'demo-camp',
      form_data: validForm,
    });
    expect(draftData).not.toHaveProperty('documents');

    const submitted = await client.submitApplication();
    expect(submitted.status).toBe(201);
    const submittedData = await submitted.json();
    expect(submittedData).toMatchObject({
      application_id: 'demo-application-001',
      camp_id: 'demo-camp',
      form_data: validForm,
      status: 'approved',
    });
    expect(submittedData).not.toHaveProperty('submitted_at');
    const application = await client.getApplication('demo-application-001');
    expect((await application.json()).form_data).toEqual(validForm);
  });

  it('rejects missing allergy details and document data using the active contract', async () => {
    const client = createDemoApiClient();
    const camp = await client.getConfiguredCamp();
    expect((await camp.json()).required_documents).toEqual([]);
    await expect(
      client.saveDraft({ ...validForm, documents: [] }),
    ).rejects.toMatchObject({
      status: 422,
      errors: [
        { field_name: 'documents', error_message: 'ไม่รองรับข้อมูลช่องนี้' },
      ],
    });

    await client.saveDraft({
      ...validForm,
      food_allergy: 'yes',
    });
    await expect(client.submitApplication()).rejects.toMatchObject({
      status: 422,
      errors: [
        {
          field_name: 'food_allergy_details',
          error_message: 'กรุณากรอกข้อมูลนี้',
        },
      ],
    });
  });

  it('matches Backend errors when submitting or editing after an Application exists', async () => {
    const client = createDemoApiClient();
    await expect(client.submitApplication()).rejects.toMatchObject({
      status: 404,
    });

    await client.saveDraft(validForm);
    await client.submitApplication();

    await expect(client.saveDraft(validForm)).rejects.toMatchObject({
      status: 409,
    });
    await expect(client.submitApplication()).rejects.toMatchObject({
      status: 409,
    });
  });

  it('restores a saved Draft in a new client after a page refresh', async () => {
    const storage = createMemoryStorage();
    const firstClient = createDemoApiClient({ storage });
    const draftForm = { ...validForm, full_name: 'Draft ก่อน Refresh' };

    await firstClient.saveDraft(draftForm);
    const refreshedClient = createDemoApiClient({ storage });
    const response = await refreshedClient.getDraft();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      draft_id: 'demo-draft',
      camp_id: 'demo-camp',
      form_data: draftForm,
    });
  });

  it('keeps saved Drafts separate for different applicants', async () => {
    const storage = createMemoryStorage();
    const applicantOne = createDemoApiClient({ storage, applicantId: 'applicant-one' });
    const applicantTwo = createDemoApiClient({ storage, applicantId: 'applicant-two' });
    const firstForm = { ...validForm, full_name: 'ผู้สมัครหนึ่ง' };
    const secondForm = { ...validForm, full_name: 'ผู้สมัครสอง' };

    await applicantOne.saveDraft(firstForm);
    expect((await applicantTwo.getDraft()).status).toBe(404);
    await applicantTwo.saveDraft(secondForm);

    const refreshedApplicantOne = createDemoApiClient({
      storage,
      applicantId: 'applicant-one',
    });
    const refreshedApplicantTwo = createDemoApiClient({
      storage,
      applicantId: 'applicant-two',
    });
    expect((await (await refreshedApplicantOne.getDraft()).json()).form_data).toEqual(firstForm);
    expect((await (await refreshedApplicantTwo.getDraft()).json()).form_data).toEqual(secondForm);
  });

  it('removes the Draft after submit and restores the approved Application after refresh', async () => {
    const storage = createMemoryStorage();
    const client = createDemoApiClient({ storage, applicantId: 'submitted-applicant' });
    await client.saveDraft(validForm);
    await client.submitApplication();

    const refreshedClient = createDemoApiClient({
      storage,
      applicantId: 'submitted-applicant',
    });
    expect((await refreshedClient.getDraft()).status).toBe(404);
    expect(await (await refreshedClient.getApplicantApplication()).json()).toMatchObject({
      form_data: validForm,
      status: 'approved',
    });
  });

  it('restricts Demo Staff Review to the Mock Admin and lists applicant statuses for AC-ENR-04', async () => {
    const storage = createMemoryStorage();
    const applicant = createDemoApiClient({
      storage,
      applicantId: 'demo-applicant-001',
      identity: 'applicant',
    });
    const otherApplicant = createDemoApiClient({
      storage,
      applicantId: 'demo-applicant-002',
      identity: 'applicant',
    });
    const admin = createDemoApiClient({
      storage,
      applicantId: 'demo-admin-001',
      identity: 'admin',
    });

    await applicant.saveDraft(validForm);
    await applicant.submitApplication();
    await otherApplicant.saveDraft({ ...validForm, full_name: 'Draft only' });

    const listResponse = await admin.getReviewApplications();
    const applications = await listResponse.json();
    expect(applications).toHaveLength(1);
    expect(applications[0]).toMatchObject({
      applicant_id: 'demo-applicant-001',
      camp_id: 'demo-camp',
      form_data: validForm,
      status: 'approved',
    });
    const detailResponse = await admin.getReviewApplication(applications[0].application_id);
    expect(await detailResponse.json()).toMatchObject({
      form_data: validForm,
      status: 'approved',
    });
    await expect(applicant.getReviewApplications()).rejects.toMatchObject({ status: 403 });
    await expect(
      applicant.getReviewApplication(applications[0].application_id),
    ).rejects.toMatchObject({ status: 403 });

    const otherDraft = await otherApplicant.getDraft();
    expect((await otherDraft.json()).form_data.full_name).toBe('Draft only');
  });

  it('approves up to Demo Capacity and assigns the next submission a waitlist position', async () => {
    const storage = createMemoryStorage();
    const submitted = [];
    for (let index = 1; index <= 4; index += 1) {
      submitted.push(await submitForApplicant(
        storage,
        `capacity-applicant-${index}`,
        { ...validForm, full_name: `Applicant ${index}` },
      ));
    }

    expect(submitted.slice(0, 3).map(({ application }) => application.status))
      .toEqual(['approved', 'approved', 'approved']);
    expect(submitted[3].application).toMatchObject({
      status: 'waitlisted',
      waitlist_position: 1,
    });
    const refreshedWaitlisted = createDemoApiClient({
      storage,
      applicantId: 'capacity-applicant-4',
    });
    expect(await (await refreshedWaitlisted.getApplicantApplication()).json())
      .toMatchObject({ status: 'waitlisted', waitlist_position: 1 });
    await expect(submitted[3].client.submitApplication()).rejects.toMatchObject({
      status: 409,
    });
    await expect(refreshedWaitlisted.submitApplication()).rejects.toMatchObject({
      status: 409,
    });
  });

  it('promotes the first waitlisted applicant after withdrawal and recalculates remaining positions', async () => {
    const storage = createMemoryStorage();
    const applicants = [];
    for (let index = 1; index <= 5; index += 1) {
      applicants.push(await submitForApplicant(
        storage,
        `queue-applicant-${index}`,
        { ...validForm, full_name: `Queue Applicant ${index}` },
      ));
    }

    const withdrawalResponse = await applicants[0].client.withdrawApplication();
    expect(await withdrawalResponse.json()).toMatchObject({ status: 'withdrawn' });

    const promotedApplicant = createDemoApiClient({
      storage,
      applicantId: 'queue-applicant-4',
    });
    const remainingWaitlisted = createDemoApiClient({
      storage,
      applicantId: 'queue-applicant-5',
    });
    expect(await (await promotedApplicant.getApplicantApplication()).json())
      .toMatchObject({ status: 'approved' });
    expect(await (await remainingWaitlisted.getApplicantApplication()).json())
      .toMatchObject({ status: 'waitlisted', waitlist_position: 1 });
    expect(await (await createDemoApiClient({
      storage,
      applicantId: 'queue-applicant-1',
    }).getApplicantApplication()).json()).toMatchObject({ status: 'withdrawn' });
  });

  it('preserves legacy submitted records and excludes them from Demo Capacity', async () => {
    const storage = createMemoryStorage();
    const legacyApplication = {
      application_id: 'demo-application-legacy',
      applicant_id: 'legacy-applicant',
      camp_id: 'demo-camp',
      form_data: validForm,
      status: 'submitted',
      submitted_at: '2026-01-01T00:00:00.000Z',
    };
    storage.setItem(
      'camp-enrollment-demo:submitted-applications',
      JSON.stringify([legacyApplication]),
    );
    storage.setItem(
      'camp-enrollment-demo:legacy-applicant:application',
      JSON.stringify(legacyApplication),
    );

    const { application } = await submitForApplicant(storage, 'new-demo-applicant');
    const legacyApplicant = createDemoApiClient({ storage, applicantId: 'legacy-applicant' });
    const admin = createDemoApiClient({
      storage,
      applicantId: 'demo-admin-001',
      identity: 'admin',
    });
    const listedApplications = await (await admin.getReviewApplications()).json();

    expect(application.status).toBe('approved');
    expect(await (await legacyApplicant.getApplicantApplication()).json())
      .toMatchObject({ status: 'submitted' });
    expect(listedApplications.find((item) => item.applicant_id === 'legacy-applicant'))
      .toMatchObject({ status: 'submitted', form_data: validForm });
  });

  it('accepts omitted or blank allergy details when food allergy is no', async () => {
    for (const formData of [
      {},
      { food_allergy_details: '' },
      { food_allergy_details: '   ' },
    ]) {
      const submitted = await submitForm({ food_allergy: 'no', ...formData });
      expect(submitted.status).toBe(201);
    }
  });

  it.each([
    ['non-empty string', 'แพ้ถั่วลิสง'],
    ['empty array', []],
    ['array with value', ['แพ้ถั่วลิสง']],
    ['empty object', {}],
    ['object with value', { allergy: 'ถั่ว' }],
    ['number', 0],
    ['boolean', false],
    ['null', null],
  ])('rejects %s allergy details when food allergy is no', async (_label, details) => {
    await expect(
      submitForm({ food_allergy: 'no', food_allergy_details: details }),
    ).rejects.toMatchObject({
      status: 422,
      errors: [
        {
          field_name: 'food_allergy_details',
          error_message: 'ไม่ต้องระบุรายละเอียดเมื่อเลือกไม่มี',
        },
      ],
    });
  });

  it('accepts non-empty string allergy details when food allergy is yes', async () => {
    const submitted = await submitForm({
      food_allergy: 'yes',
      food_allergy_details: 'แพ้ถั่วลิสง',
    });

    expect(submitted.status).toBe(201);
  });

  it.each([
    ['missing field', {}],
    ['empty string', { food_allergy_details: '' }],
    ['whitespace string', { food_allergy_details: '   ' }],
    ['empty array', { food_allergy_details: [] }],
    ['array with value', { food_allergy_details: ['แพ้ถั่วลิสง'] }],
    ['empty object', { food_allergy_details: {} }],
    ['object with value', { food_allergy_details: { allergy: 'ถั่ว' } }],
    ['number', { food_allergy_details: 0 }],
    ['boolean', { food_allergy_details: false }],
    ['null', { food_allergy_details: null }],
  ])('rejects %s allergy details when food allergy is yes', async (_label, details) => {
    await expect(submitForm({ food_allergy: 'yes', ...details })).rejects.toMatchObject({
      status: 422,
      errors: [
        {
          field_name: 'food_allergy_details',
          error_message: 'กรุณากรอกข้อมูลนี้',
        },
      ],
    });
  });
});
