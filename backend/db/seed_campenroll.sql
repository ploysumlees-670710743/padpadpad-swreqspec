INSERT INTO camps (camp_id, name, status, open_date, close_date, required_fields_json, required_documents_json, created_at)
VALUES (
    'camp-001',
    'ค่าย AI สำหรับนักศึกษา',
    'open',
    '2569-11-01',
    '2569-11-30',
    '["full_name","nickname","student_id","year_level","phone_number","contact_channel","food_allergy"]',
    '[]',
    NOW()
) ON CONFLICT (camp_id) DO UPDATE SET
    required_fields_json = EXCLUDED.required_fields_json,
    required_documents_json = EXCLUDED.required_documents_json;
