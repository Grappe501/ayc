-- Allow public Join form as a person source (PROSPECTIVE pipeline).
ALTER TABLE people DROP CONSTRAINT IF EXISTS people_source_check;
ALTER TABLE people ADD CONSTRAINT people_source_check
  CHECK (source IN ('LEADER_ENTRY', 'BETA_IMPORT', 'MANUAL_ADMIN', 'JOIN_FORM'));
