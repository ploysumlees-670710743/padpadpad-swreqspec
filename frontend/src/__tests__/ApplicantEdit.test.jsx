// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  getApplicantForEdit: vi.fn(),
  updateApplicant: vi.fn(),
  validateApplicant: vi.fn(),
  cancelApplicantEdit: vi.fn(),
}));

vi.mock("../api/client.js", () => api);

import ApplicantEditPage from "../pages/ApplicantEditPage.jsx";

const originalApplicant = {
  applicant_id: "app-001",
  full_name: "ผู้สมัครตัวอย่าง",
  phone_number: "0811111111",
  email: "applicant@example.test",
  address: "ที่อยู่เดิม",
  status: "pending",
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderApplicantEdit() {
  api.getApplicantForEdit.mockResolvedValue(originalApplicant);
  return render(<ApplicantEditPage applicantId="app-001" />);
}

describe("Applicant Edit", () => {
  it("test_TC_REG_01_1_save_phone_and_create_audit_log", async () => {
    api.validateApplicant.mockResolvedValue({ valid: true, errors: {} });
    api.updateApplicant.mockResolvedValue({
      applicant: { ...originalApplicant, phone_number: "0822222222" },
      audit_log: [{ field_name: "phone_number" }],
    });
    renderApplicantEdit();

    const phone = await screen.findByLabelText("เบอร์โทรศัพท์");
    expect(screen.getByDisplayValue("ผู้สมัครตัวอย่าง")).toBeTruthy();
    expect(screen.getByDisplayValue("applicant@example.test")).toBeTruthy();
    expect(screen.getByDisplayValue("ที่อยู่เดิม")).toBeTruthy();
    expect(screen.getByDisplayValue("pending")).toBeTruthy();
    fireEvent.change(phone, { target: { value: "0822222222" } });
    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));

    await waitFor(() => {
      expect(api.updateApplicant).toHaveBeenCalledWith("app-001", {
        ...originalApplicant,
        phone_number: "0822222222",
      });
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "บันทึกข้อมูลและประวัติการเปลี่ยนแปลงแล้ว",
    );
  });

  it("test_TC_REG_02_1_reject_short_phone_and_keep_input", async () => {
    api.validateApplicant.mockResolvedValue({
      valid: false,
      errors: { phone_number: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" },
    });
    renderApplicantEdit();

    const phone = await screen.findByLabelText("เบอร์โทรศัพท์");
    fireEvent.change(phone, { target: { value: "08123" } });
    fireEvent.click(screen.getByRole("button", { name: "ยืนยัน" }));

    expect(
      await screen.findByText("กรุณาแก้ไขข้อมูลในช่องที่มีข้อผิดพลาด"),
    ).toBeTruthy();
    expect(phone.value).toBe("08123");
    expect(phone.getAttribute("aria-invalid")).toBe("true");
    expect(
      screen.getAllByRole("alert").some((element) =>
        element.textContent.includes("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก"),
      ),
    ).toBe(true);
    expect(api.updateApplicant).not.toHaveBeenCalled();
  });

  it("test_TC_REG_03_1_cancel_restores_original_and_closes_form", async () => {
    api.cancelApplicantEdit.mockResolvedValue({
      status: "cancelled",
      applicant: originalApplicant,
    });
    renderApplicantEdit();

    await screen.findByLabelText("เบอร์โทรศัพท์");
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    expect(await screen.findByLabelText("ข้อมูลเดิมของผู้สมัคร")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "ยืนยัน" })).toBeNull();
    expect(screen.getByText("เบอร์โทรศัพท์: 0811111111")).toBeTruthy();
  });

  it("test_TC_REG_03_2_cancel_all_changed_fields", async () => {
    api.cancelApplicantEdit.mockResolvedValue({
      status: "cancelled",
      applicant: originalApplicant,
    });
    renderApplicantEdit();

    for (const [label, value] of [
      ["ชื่อ-นามสกุล", "ชื่อใหม่"],
      ["เบอร์โทรศัพท์", "0822222222"],
      ["อีเมล", "new@example.test"],
      ["ที่อยู่", "ที่อยู่ใหม่"],
      ["สถานะ", "approved"],
    ]) {
      fireEvent.change(await screen.findByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิก" }));

    await waitFor(() => {
      expect(api.cancelApplicantEdit).toHaveBeenCalledWith("app-001");
    });
    expect(screen.getByText("ชื่อ-นามสกุล: ผู้สมัครตัวอย่าง")).toBeTruthy();
    expect(screen.getByText("เบอร์โทรศัพท์: 0811111111")).toBeTruthy();
    expect(screen.getByText("อีเมล: applicant@example.test")).toBeTruthy();
    expect(screen.getByText("ที่อยู่: ที่อยู่เดิม")).toBeTruthy();
    expect(screen.getByText("สถานะ: pending")).toBeTruthy();
  });
});
