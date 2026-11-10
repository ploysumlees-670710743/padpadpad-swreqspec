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

describe('Demo API contract (AC-ENR-01, AC-ENR-03, AC-ENR-04, AC-ENR-05)', () => {
  it('saves and reloads form-only Draft data and returns the submitted Application shape', async () => {
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
      status: 'submitted',
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
});
