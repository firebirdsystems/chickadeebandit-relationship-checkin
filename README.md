# Relationship Check-In

A weekly prompt for couples. Each partner answers **privately**, then both
answers are **revealed at the same time** — no scoring, no right answers, just a
structured conversation starter. Draws from a built-in deck of connection
prompts (couples-therapy / "36 questions"-style), and partners can add their own.

---

## How the privacy works (server-enforced)

This app is built on the hub's **`partner_link`** + **`mutual_reveal`** protocols,
with free-text answers (`mutual_reveal.answers: { kind: "text" }`):

- `partner_config`, `responses`, and `submissions` are **`owner_only` +
  `endpoint_writes_only`** — a member can only read their **own** rows and can
  **never** write these tables via `/api/db`. All writes go through the trusted
  `api/partner` and `api/mutual-reveal` endpoints.
- Each partner's answers stay sealed until **both** partners have **submitted
  and revealed**; only then does `api/mutual-reveal` release the partner's
  answers. Neither partner can peek early — there is no client-writable "reveal"
  flag.
- `custom_questions` is **`couple_scoped`** (`delete_owner_only`) so a couple's
  own prompts are visible only to the two of them.

Answer and prompt text are free-form, so they're **encrypted at rest** (not on
the skip-list, and deliberately not in `db_plaintext_columns`).

## Flow

`Pick partner → (partner picks you back) → answer this week's prompt →
lock in → reveal together → compare → start a new check-in`

The weekly prompt rotates deterministically by ISO week, so both partners always
see the same one without any shared state (`src/logic.js`, unit-tested).

## Quick start

```bash
npm run dev     # preview at http://localhost:3001 (demo mode, no partner needed)
npm run build   # produce dist/bundle.json
npm test        # manifest + logic tests
```
