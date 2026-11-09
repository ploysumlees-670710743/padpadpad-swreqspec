// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetVoteDemo } from "../api/client.js";
import VoteLocationPage from "../pages/VoteLocationPage.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("AC-VOT-01", () => {
  let container;
  let root;

  beforeEach(() => {
    resetVoteDemo();
  });

  afterEach(() => {
    if (root) {
      act(() => root.unmount());
      root = null;
    }
    container?.remove();
    container = null;
    vi.unstubAllGlobals();
  });

  it("test_AC_VOT_01_vote_page_select_and_confirm", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          round_id: "prototype-round",
          has_voted: false,
          locations: [
            {
              location_id: "demo-location-001",
              name: "ศูนย์เรียนรู้ชุมชน",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีพื้นที่ทำกิจกรรมและพื้นที่พักผ่อน",
              total_votes: 3,
            },
            {
              location_id: "demo-location-002",
              name: "อุทยานการเรียนรู้",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีพื้นที่ธรรมชาติและจุดเรียนรู้ภายในพื้นที่",
              total_votes: 2,
            },
            {
              location_id: "demo-location-003",
              name: "ศูนย์กิจกรรมเยาวชน",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีอาคารกิจกรรมและพื้นที่รองรับกลุ่มผู้เข้าร่วม",
              total_votes: 1,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    expect(container.textContent).toContain("ต้นแบบเพื่อสาธิต — ข้อมูลจำลอง ไม่บันทึกลงระบบจริง");
    expect(container.textContent).toContain("ศูนย์เรียนรู้ชุมชน");
    expect(container.textContent).toContain("ตัวอย่าง: มีพื้นที่ทำกิจกรรมและพื้นที่พักผ่อน");
    expect(container.textContent).toContain("คะแนนรวม: 3");
    expect(container.querySelector("img").getAttribute("src")).toContain("data:image/svg+xml");

    const radio = container.querySelector('input[type="radio"]');
    await act(async () => {
      radio.click();
    });
    const confirmButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent.includes("ยืนยันการลงคะแนน"),
    );
    await act(async () => {
      confirmButton.click();
    });

    expect(container.textContent).toContain("คะแนนรวม: 4");
    expect(container.textContent).toContain("ท่านได้ใช้สิทธิ์ไปแล้ว");
    expect(container.querySelector('input[type="radio"]').disabled).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/votes/locations?round_id=prototype-round",
      { credentials: "include" },
    );
  });

  it("test_AC_VOT_01_loads_simulated_locations_without_calling_the_backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          round_id: "prototype-round",
          has_voted: false,
          locations: [
            {
              location_id: "demo-location-001",
              name: "ศูนย์เรียนรู้ชุมชน",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีพื้นที่ทำกิจกรรมและพื้นที่พักผ่อน",
              total_votes: 3,
            },
            {
              location_id: "demo-location-002",
              name: "อุทยานการเรียนรู้",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีพื้นที่ธรรมชาติและจุดเรียนรู้ภายในพื้นที่",
              total_votes: 2,
            },
            {
              location_id: "demo-location-003",
              name: "ศูนย์กิจกรรมเยาวชน",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "ตัวอย่าง: มีอาคารกิจกรรมและพื้นที่รองรับกลุ่มผู้เข้าร่วม",
              total_votes: 1,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);
    expect(container.textContent).toContain("อุทยานการเรียนรู้");
    expect(container.textContent).toContain("ศูนย์กิจกรรมเยาวชน");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("test_tied_top_scores_show_all_tied_locations_without_selecting_a_winner", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          round_id: "prototype-round",
          has_voted: false,
          locations: [
            {
              location_id: "location-001",
              name: "สถานที่หนึ่ง",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "สรุปสถานที่หนึ่ง",
              total_votes: 3,
            },
            {
              location_id: "location-002",
              name: "สถานที่สอง",
              image_url: "data:image/svg+xml,prototype",
              survey_summary: "สรุปสถานที่สอง",
              total_votes: 2,
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    await act(async () => {
      container.querySelectorAll('input[type="radio"]')[1].click();
    });
    await act(async () => {
      container.querySelector('button[type="submit"]').click();
    });

    const tieNotice = container.querySelector('[role="status"]');
    expect(tieNotice.textContent).toContain("สถานที่หนึ่ง");
    expect(tieNotice.textContent).toContain("สถานที่สอง");
    expect(tieNotice.textContent).toContain("คณะกรรมการโปรดพิจารณาตัดสินใจต่อ");
    expect(tieNotice.textContent).toContain("ระบบจะไม่เลือกผู้ชนะ");
    expect(container.querySelectorAll(".vote-location-card")).toHaveLength(2);
  });
});
