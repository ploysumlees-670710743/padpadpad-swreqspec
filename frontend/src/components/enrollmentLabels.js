const FIELD_LABELS = {
  full_name: 'ชื่อ-นามสกุล',
  nickname: 'ชื่อเล่น',
  student_id: 'รหัสนักศึกษา',
  year_level: 'ชั้นปี',
  year_level_other: 'โปรดระบุชั้นปี',
  phone_number: 'เบอร์โทรศัพท์',
  contact_channel: 'ช่องทางติดต่อ',
  food_allergy: 'ข้อมูลการแพ้อาหาร',
  food_allergy_details: 'รายละเอียดการแพ้อาหาร',
};

// รองรับ: FR-ENR-02, FR-ENR-04, FR-ENR-05
export function getFieldPresentation(fieldName) {
  const knownFields = {
    full_name: { label: FIELD_LABELS.full_name, type: 'text' },
    nickname: { label: FIELD_LABELS.nickname, type: 'text' },
    student_id: { label: FIELD_LABELS.student_id, type: 'text' },
    year_level: { label: FIELD_LABELS.year_level, type: 'select' },
    year_level_other: { label: FIELD_LABELS.year_level_other, type: 'text' },
    phone_number: { label: FIELD_LABELS.phone_number, type: 'tel' },
    contact_channel: { label: FIELD_LABELS.contact_channel, type: 'text' },
    food_allergy: { label: FIELD_LABELS.food_allergy, type: 'radio' },
    food_allergy_details: {
      label: FIELD_LABELS.food_allergy_details,
      type: 'text',
    },
  };
  return knownFields[fieldName] ?? { label: fieldName, type: 'text' };
}
