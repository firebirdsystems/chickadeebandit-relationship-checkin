import { describe, test, expect } from "vitest";
import { isoWeek, weeklyPrompt, buildQuestions, allAnswered, answeredCount, WEEKLY_PROMPTS } from "../src/logic.js";

describe("isoWeek", () => {
  test("first week of 2026", () => {
    // 2026-01-01 is a Thursday → ISO week 1
    expect(isoWeek(new Date("2026-01-01T12:00:00"))).toBe(1);
  });
  test("is stable within a calendar week (same Mon–Sun)", () => {
    const mon = new Date("2026-07-06T09:00:00");
    const sun = new Date("2026-07-12T21:00:00");
    expect(isoWeek(mon)).toBe(isoWeek(sun));
  });
});

describe("weeklyPrompt", () => {
  test("returns a deck prompt under the 'weekly' key", () => {
    const p = weeklyPrompt(new Date("2026-07-08T12:00:00"));
    expect(p.id).toBe("weekly");
    expect(p.builtIn).toBe(true);
    expect(WEEKLY_PROMPTS).toContain(p.text);
  });
  test("both partners on the same date get the same prompt (deterministic)", () => {
    const d = new Date("2026-03-15T12:00:00");
    expect(weeklyPrompt(d).text).toBe(weeklyPrompt(new Date("2026-03-15T23:00:00")).text);
  });
  test("rotates across weeks", () => {
    const texts = new Set();
    for (let w = 0; w < WEEKLY_PROMPTS.length; w++) {
      texts.add(weeklyPrompt(new Date(2026, 0, 1 + w * 7)).text);
    }
    expect(texts.size).toBeGreaterThan(1);
  });
});

describe("buildQuestions", () => {
  test("weekly prompt first, then customs", () => {
    const qs = buildQuestions([{ id: "custom-1", text: "Our own question" }], new Date("2026-07-08T12:00:00"));
    expect(qs).toHaveLength(2);
    expect(qs[0].id).toBe("weekly");
    expect(qs[1]).toMatchObject({ id: "custom-1", text: "Our own question", builtIn: false });
  });
});

describe("allAnswered / answeredCount", () => {
  const qs = [{ id: "weekly" }, { id: "custom-1" }];
  test("false until every prompt has a non-empty answer", () => {
    expect(allAnswered(qs, { weekly: "yes" })).toBe(false);
    expect(allAnswered(qs, { weekly: "yes", "custom-1": "   " })).toBe(false);
    expect(allAnswered(qs, { weekly: "yes", "custom-1": "sure" })).toBe(true);
  });
  test("empty question set is not 'answered'", () => {
    expect(allAnswered([], {})).toBe(false);
  });
  test("answeredCount ignores blank answers", () => {
    expect(answeredCount(qs, { weekly: "hi", "custom-1": " " })).toBe(1);
  });
});
