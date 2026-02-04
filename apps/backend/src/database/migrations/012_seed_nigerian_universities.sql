-- Migration: Seed Nigerian universities (private + state) with name, domain, email_domains
-- Run after 011

INSERT INTO universities (id, name, domain, email_domains, country, is_active) VALUES
(uuid_generate_v4(), 'Covenant University', 'covenantuniversity.edu.ng', '["covenantuniversity.edu.ng", "stu.cu.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Babcock University', 'babcock.edu.ng', '["babcock.edu.ng", "babcockuni.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Lagos State University', 'lasu.edu.ng', '["lasu.edu.ng", "students.lasu.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Olabisi Onabanjo University', 'oouagoiwoye.edu.ng', '["oouagoiwoye.edu.ng", "students.oouagoiwoye.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Bowen University', 'bowen.edu.ng', '["bowen.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Pan-Atlantic University', 'pau.edu.ng', '["pau.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Landmark University', 'lmu.edu.ng', '["lmu.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Adekunle Ajasin University', 'aaua.edu.ng', '["aaua.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Redeemer''s University', 'run.edu.ng', '["run.edu.ng"]', 'Nigeria', true),
(uuid_generate_v4(), 'Afe Babalola University', 'abuad.edu.ng', '["abuad.edu.ng"]', 'Nigeria', true)
ON CONFLICT (name) DO NOTHING;
