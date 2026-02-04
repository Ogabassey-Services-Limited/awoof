-- Migration: Add segment column to universities (federal/state/private)
-- Description: For analytics and filtering by university type

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS segment VARCHAR(20) CHECK (segment IN ('federal', 'state', 'private'));

-- Backfill: infer segment from existing data (e.g. Covenant, Babcock = private; LASU, OOU = state)
UPDATE universities SET segment = 'private' WHERE name IN ('Covenant University', 'Babcock University', 'Bowen University', 'Pan-Atlantic University', 'Landmark University', 'Redeemer''s University', 'Afe Babalola University');
UPDATE universities SET segment = 'state' WHERE name IN ('Lagos State University', 'Olabisi Onabanjo University', 'Adekunle Ajasin University');
