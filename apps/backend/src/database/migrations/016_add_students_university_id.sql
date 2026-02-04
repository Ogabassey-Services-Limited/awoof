-- Migration: Add university_id to students for segment stats and proper FK
-- Description: Links student to university for analytics by segment

ALTER TABLE students
ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id);

-- Backfill: match by university name where possible
UPDATE students s
SET university_id = u.id
FROM universities u
WHERE s.university = u.name AND s.university_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_students_university_id ON students(university_id) WHERE university_id IS NOT NULL;
