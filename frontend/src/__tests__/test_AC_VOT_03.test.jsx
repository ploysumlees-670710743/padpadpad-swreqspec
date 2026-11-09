// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/client.js", () => ({
  castVote: vi.fn(),
  getVoteAccess: vi.fn(),
  getVoteLocations: vi.fn(),
}));

import { getVoteAccess, getVoteLocations } from "../api/client.js";
import VoteLocationPage from "../pages/VoteLocationPage.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const locations = [
  {
    location_id: "location-001",
    name: "สถานที่ตัวอย่าง",
    image_url: "data:image/svg+xml,example",
    survey_summary: "สรุปผลสำรวจตัวอย่าง",
    total_votes: 0,
  },
];

describe("AC-VOT-03", () => {
  let container;
  let root;

  beforeEach(() => {
    vi.mocked(getVoteLocations).mockResolvedValue({
      round_id: "round-001",
      has_voted: false,
      locations,
    });
  });

  afterEach(() => {
    if (root) {
      act(() => root.unmount());
      root = null;
    }
    container?.remove();
    container = null;
    vi.resetAllMocks();
  });

  // Given the authenticated user is a student, when opening voting, then no voting action is shown.
  it("test_AC_VOT_03_hide_vote_action_for_student", async () => {
    vi.mocked(getVoteAccess).mockResolvedValue({ role: "student" });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    expect(container.textContent).toContain("สถานที่ตัวอย่าง");
    expect(container.querySelector('input[type="radio"]')).toBeNull();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
  });

  // Given authentication is unavailable, when opening voting, then show the specified failure notice.
  it("test_AC_VOT_03_show_authentication_failure_notice", async () => {
    vi.mocked(getVoteAccess).mockRejectedValue(new Error("ระบบยืนยันตัวตนขัดข้อง"));
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);

    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "ระบบยืนยันตัวตนขัดข้อง",
    );
    expect(container.querySelector('button[type="submit"]')).toBeNull();
  });
});
