-- Migration: Seed federal universities with segment = 'federal'
-- Run after 013
-- Source: NUC accredited federal universities with email domains

INSERT INTO universities (id, name, domain, email_domains, segment, country, is_active) VALUES
(uuid_generate_v4(), 'Abubakar Tafawa Balewa University, Bauchi', 'atbu.edu.ng', '["atbu.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Ahmadu Bello University, Zaria', 'abu.edu.ng', '["abu.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Bayero University, Kano', 'buk.edu.ng', '["buk.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University Gashua, Yobe', 'fugashua.edu.ng', '["fugashua.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Petroleum Resources, Effurun', 'fupre.edu.ng', '["fupre.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Technology, Akure', 'futa.edu.ng', '["futa.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Technology, Minna', 'futminna.edu.ng', '["futminna.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Technology, Owerri', 'futo.edu.ng', '["futo.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Dutse, Jigawa State', 'fud.edu.ng', '["fud.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Dutsin-Ma, Katsina', 'fudutsinma.edu.ng', '["fudutsinma.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Kashere, Gombe State', 'fukashere.edu.ng', '["fukashere.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Lafia, Nasarawa State', 'fulafia.edu.ng', '["fulafia.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Lokoja, Kogi State', 'fulokoja.edu.ng', '["fulokoja.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Alex Ekwueme University, Ndufu-Alike, Ebonyi State', 'funai.edu.ng', '["funai.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Otuoke, Bayelsa', 'fuotuoke.edu.ng', '["fuotuoke.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Oye-Ekiti, Ekiti State', 'fuoye.edu.ng', '["fuoye.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Wukari, Taraba State', 'fuwukari.edu.ng', '["fuwukari.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Birnin Kebbi', 'fubk.edu.ng', '["fubk.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University, Gusau Zamfara', 'fugusau.edu.ng', '["fugusau.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Michael Okpara University of Agricultural Umudike', 'mouau.edu.ng', '["mouau.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Modibbo Adama University of Technology, Yola', 'mautech.edu.ng', '["mautech.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'National Open University of Nigeria, Abuja', 'noun.edu.ng', '["noun.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Nigeria Police Academy Wudil', 'polac.edu.ng', '["polac.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Nigerian Defence Academy Kaduna', 'nda.edu.ng', '["nda.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Nnamdi Azikiwe University, Awka', 'unizik.edu.ng', '["unizik.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Obafemi Awolowo University, Ile-Ife', 'oauife.edu.ng', '["oauife.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Abuja, Gwagwalada', 'uniabuja.edu.ng', '["uniabuja.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Agriculture, Abeokuta', 'unaab.edu.ng', '["unaab.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Joseph Sarwuan Tarka University, Makurdi', 'uam.edu.ng', '["uam.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Benin', 'uniben.edu', '["uniben.edu"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Calabar', 'unical.edu.ng', '["unical.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Ibadan', 'ui.edu.ng', '["ui.edu.ng", "stu.ui.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Ilorin', 'unilorin.edu.ng', '["unilorin.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Jos', 'unijos.edu.ng', '["unijos.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Lagos', 'unilag.edu.ng', '["unilag.edu.ng", "live.unilag.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Maiduguri', 'unimaid.edu.ng', '["unimaid.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Nigeria, Nsukka', 'unn.edu.ng', '["unn.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Port-Harcourt', 'uniport.edu.ng', '["uniport.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'University of Uyo', 'uniuyo.edu.ng', '["uniuyo.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Usmanu Danfodiyo University, Sokoto', 'udusok.edu.ng', '["udusok.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Nigerian Maritime University Okerenkoko, Delta State', 'nmu.edu.ng', '["nmu.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Air Force Institute of Technology, Kaduna', 'afit.edu.ng', '["afit.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Nigerian Army University Biu', 'naub.edu.ng', '["naub.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'David Nweze Umahi Federal University of Medical Sciences, Uburu', 'kdums.edu.ng', '["kdums.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Admiralty University Ibusa, Delta State', 'adun.edu.ng', '["adun.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Transportation Daura, Katsina', 'futd.edu.ng', '["futd.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'African Aviation and Aerospace University', 'aaau.edu.ng', '["aaau.edu.ng"]', 'federal', 'Nigeria', true),
(uuid_generate_v4(), 'Federal University of Medicine and Medical Sciences, Abeokuta', 'fummsa.net', '["fummsa.net"]', 'federal', 'Nigeria', true)
ON CONFLICT (name) DO UPDATE SET domain = EXCLUDED.domain, email_domains = EXCLUDED.email_domains, segment = EXCLUDED.segment;

-- Federal University of Health Sciences, Otukpo - N/A for email domain; add with empty domains for admin to configure later
INSERT INTO universities (id, name, domain, email_domains, segment, country, is_active) VALUES
(uuid_generate_v4(), 'Federal University of Health Sciences, Otukpo, Benue State', NULL, '[]', 'federal', 'Nigeria', true)
ON CONFLICT (name) DO UPDATE SET segment = EXCLUDED.segment;
