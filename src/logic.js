// Pure, browser-free logic for Relationship Check-In — unit-tested in
// __tests__/logic.test.mjs.

// Built-in curated deck (couples-therapy / "36 questions"-inspired). One prompt
// is featured each week, rotating deterministically by ISO week so BOTH partners
// see the same prompt without any shared state.
export const WEEKLY_PROMPTS = [
  "What's one moment this week when you felt close to me?",
  "What's something I did recently that you appreciated but I might not know about?",
  "What's a small thing I could do more of that would make you feel loved?",
  "What's something you're looking forward to us doing together?",
  "When did you feel most like a team this week?",
  "Is there anything you've been wanting to talk about but haven't found the moment for?",
  "What's one way you've grown since we got together?",
  "What made you laugh this week — and did I get to see it?",
  "What's a worry that's been on your mind lately?",
  "What does a really good weekend together look like to you right now?",
  "What's something you're proud of yourself for this week?",
  "How full is your emotional tank right now, and what would help fill it?",
  "What's a memory of us that you thought about recently?",
  "What's one thing you need more of from me lately: time, space, help, or affection?",
];

/** ISO-8601 week number (1..53) for a date. */
export function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;            // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day);    // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/** The featured built-in prompt for a given date. Stable within a calendar week. */
export function weeklyPrompt(date = new Date(), deck = WEEKLY_PROMPTS) {
  const idx = ((isoWeek(date) - 1) % deck.length + deck.length) % deck.length;
  return { id: "weekly", text: deck[idx], builtIn: true };
}

/**
 * All prompts to answer this check-in: the featured weekly one plus any custom
 * prompts the couple added.
 * @param {Array<{id,text,created_at?}>} customs
 */
export function buildQuestions(customs = [], date = new Date(), deck = WEEKLY_PROMPTS) {
  return [
    weeklyPrompt(date, deck),
    ...customs.map((c) => ({ id: c.id, text: c.text, builtIn: false })),
  ];
}

/** True when every prompt has a non-empty trimmed answer. */
export function allAnswered(questions, answers) {
  return questions.length > 0 && questions.every((q) => {
    const a = answers[q.id];
    return typeof a === "string" && a.trim().length > 0;
  });
}

/** Count of prompts answered so far. */
export function answeredCount(questions, answers) {
  return questions.filter((q) => {
    const a = answers[q.id];
    return typeof a === "string" && a.trim().length > 0;
  }).length;
}
