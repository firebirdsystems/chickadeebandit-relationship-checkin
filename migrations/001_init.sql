-- Relationship Check-In — couple-private "answer privately, reveal together".
--
-- All confidentiality is enforced server-side:
--   * partner_config / responses / submissions are owner_only + endpoint_writes_only
--     so a member can only read their OWN rows and can never write these tables via
--     /api/db — every write goes through the trusted partner_link / mutual_reveal
--     endpoints. Each partner's free-text answers stay private until BOTH partners
--     submit AND reveal, at which point /api/mutual-reveal releases them.
--   * custom_questions is couple_scoped (a member + their reciprocal partner) so a
--     couple's own prompts are visible only to the two of them; delete_owner_only
--     lets the author remove a prompt they added.
--
-- `answer` and `text` are free-text and therefore encrypted at rest (they are not
-- on the encryption skip-list); do NOT add them to db_plaintext_columns.

CREATE TABLE IF NOT EXISTS app_relationship_checkin__partner_config (
  member_id  TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  session_id TEXT,
  PRIMARY KEY (member_id)
);

CREATE TABLE IF NOT EXISTS app_relationship_checkin__responses (
  member_id   TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer      TEXT NOT NULL,
  session_id  TEXT,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (member_id, question_id)
);

CREATE TABLE IF NOT EXISTS app_relationship_checkin__submissions (
  member_id    TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  revealed_at  TEXT,
  session_id   TEXT,
  PRIMARY KEY (member_id)
);

CREATE TABLE IF NOT EXISTS app_relationship_checkin__custom_questions (
  id         TEXT PRIMARY KEY,
  created_by TEXT NOT NULL,
  text       TEXT NOT NULL,
  session_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS app_relationship_checkin__idx_custom_session
  ON app_relationship_checkin__custom_questions (session_id, created_at);
