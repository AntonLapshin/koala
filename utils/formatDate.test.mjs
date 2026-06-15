import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate.js";

describe("formatDate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2026, 5, 14);
    expect(formatDate(d)).toBe("2026-06-14");
  });

  it("pads single-digit month and day", () => {
    const d = new Date(2026, 0, 5);
    expect(formatDate(d)).toBe("2026-01-05");
  });

  it("handles double-digit month and day", () => {
    const d = new Date(2026, 11, 31);
    expect(formatDate(d)).toBe("2026-12-31");
  });

  it("handles leap year", () => {
    const d = new Date(2024, 1, 29);
    expect(formatDate(d)).toBe("2024-02-29");
  });

  it("returns year as integer without padding", () => {
    const d = new Date(999, 0, 1);
    expect(formatDate(d)).toBe("999-01-01");
  });
});
