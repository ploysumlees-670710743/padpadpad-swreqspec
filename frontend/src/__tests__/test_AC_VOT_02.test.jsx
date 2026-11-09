// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/client.js", () => ({
  castVote: vi.fn(),
  getVoteAccess: vi.fn(),
  getVoteLocations: vi.fn(),
}));

import { castVote, getVoteAccess, getVoteLocations } from "../api/client.js";
import VoteLocationPage from "../pages/VoteLocationPage.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("AC-VOT-02", () => {
  let container;
  let root;

  beforeEach(() => {
    vi.mocked(getVoteAccess).mockResolvedValue({ role: "lecturer" });
    vi.mocked(getVoteLocations).mockResolvedValue({
      round_id: "round-001",
      has_voted: false,
      locations: [
        {
          location_id: "location-001",
          name: "สถานที่ตัวอย่าง",
          image_url: "data:image/svg+xml,example",
          survey_summary: "สรุปผลสำรวจตัวอย่าง",
          total_votes: 3,
        },
      ],
    });
    vi.mocked(castVote).mockResolvedValue({ total_votes: 4, has_voted: true });
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

  // Given the voter has already voted, prevent another confirmation and show the required notice.
  it("test_AC_VOT_02_disable_repeat_confirmation", async () => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
      root.render(<VoteLocationPage />);
    });

    const firstOption = container.querySelector('input[type="radio"]');
    await act(async () => {
      firstOption.click();
    });
    const confirmButton = container.querySelector('button[type="submit"]');
    await act(async () => {
      confirmButton.click();
    });

    expect(container.textContent).toContain("ท่านได้ใช้สิทธิ์ไปแล้ว");
    expect(confirmButton.disabled).toBe(true);
    expect(firstOption.disabled).toBe(true);
    expect(container.textContent).toContain("คะแนนรวม: 4");

    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(container.textContent).toContain("คะแนนรวม: 4");
    expect(container.textContent).toContain("ท่านได้ใช้สิทธิ์ไปแล้ว");
    expect(castVote).toHaveBeenCalledTimes(1);
  });
});
