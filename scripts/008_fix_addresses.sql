-- Fix and regenerate addresses according to correct ranges
-- This script deletes incorrect addresses and creates the correct ones

-- Delete all current residences to start fresh
DELETE FROM public.residences;

-- Symor Dr: 1-56 (all numbers, both odd and even)
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('1 Symor Dr', 'Symor Dr', 'Thompson', '862-345-0001'),
  ('2 Symor Dr', 'Symor Dr', 'Martinez', '862-345-0002'),
  ('3 Symor Dr', 'Symor Dr', 'Johnson', '862-345-0003'),
  ('4 Symor Dr', 'Symor Dr', 'Williams', '862-345-0004'),
  ('5 Symor Dr', 'Symor Dr', 'Brown', '862-345-0005'),
  ('6 Symor Dr', 'Symor Dr', 'Davis', '862-345-0006'),
  ('7 Symor Dr', 'Symor Dr', 'Miller', '862-345-0007'),
  ('8 Symor Dr', 'Symor Dr', 'Wilson', '862-345-0008'),
  ('9 Symor Dr', 'Symor Dr', 'Moore', '862-345-0009'),
  ('10 Symor Dr', 'Symor Dr', 'Taylor', '862-345-0010'),
  ('11 Symor Dr', 'Symor Dr', 'Anderson', '862-345-0011'),
  ('12 Symor Dr', 'Symor Dr', 'Thomas', '862-345-0012'),
  ('13 Symor Dr', 'Symor Dr', 'Jackson', '862-345-0013'),
  ('14 Symor Dr', 'Symor Dr', 'White', '862-345-0014'),
  ('15 Symor Dr', 'Symor Dr', 'Harris', '862-345-0015'),
  ('16 Symor Dr', 'Symor Dr', 'Martin', '862-345-0016'),
  ('17 Symor Dr', 'Symor Dr', 'Garcia', '862-345-0017'),
  ('18 Symor Dr', 'Symor Dr', 'Rodriguez', '862-345-0018'),
  ('19 Symor Dr', 'Symor Dr', 'Lee', '862-345-0019'),
  ('20 Symor Dr', 'Symor Dr', 'Walker', '862-345-0020'),
  ('21 Symor Dr', 'Symor Dr', 'Hall', '862-345-0021'),
  ('22 Symor Dr', 'Symor Dr', 'Allen', '862-345-0022'),
  ('23 Symor Dr', 'Symor Dr', 'Young', '862-345-0023'),
  ('24 Symor Dr', 'Symor Dr', 'King', '862-345-0024'),
  ('25 Symor Dr', 'Symor Dr', 'Wright', '862-345-0025'),
  ('26 Symor Dr', 'Symor Dr', 'Lopez', '862-345-0026'),
  ('27 Symor Dr', 'Symor Dr', 'Hill', '862-345-0027'),
  ('28 Symor Dr', 'Symor Dr', 'Scott', '862-345-0028'),
  ('29 Symor Dr', 'Symor Dr', 'Green', '862-345-0029'),
  ('30 Symor Dr', 'Symor Dr', 'Adams', '862-345-0030'),
  ('31 Symor Dr', 'Symor Dr', 'Baker', '862-345-0031'),
  ('32 Symor Dr', 'Symor Dr', 'Nelson', '862-345-0032'),
  ('33 Symor Dr', 'Symor Dr', 'Carter', '862-345-0033'),
  ('34 Symor Dr', 'Symor Dr', 'Mitchell', '862-345-0034'),
  ('35 Symor Dr', 'Symor Dr', 'Roberts', '862-345-0035'),
  ('36 Symor Dr', 'Symor Dr', 'Turner', '862-345-0036'),
  ('37 Symor Dr', 'Symor Dr', 'Phillips', '862-345-0037'),
  ('38 Symor Dr', 'Symor Dr', 'Campbell', '862-345-0038'),
  ('39 Symor Dr', 'Symor Dr', 'Parker', '862-345-0039'),
  ('40 Symor Dr', 'Symor Dr', 'Evans', '862-345-0040'),
  ('41 Symor Dr', 'Symor Dr', 'Edwards', '862-345-0041'),
  ('42 Symor Dr', 'Symor Dr', 'Collins', '862-345-0042'),
  ('43 Symor Dr', 'Symor Dr', 'Stewart', '862-345-0043'),
  ('44 Symor Dr', 'Symor Dr', 'Morris', '862-345-0044'),
  ('45 Symor Dr', 'Symor Dr', 'Rogers', '862-345-0045'),
  ('46 Symor Dr', 'Symor Dr', 'Morgan', '862-345-0046'),
  ('47 Symor Dr', 'Symor Dr', 'Peterson', '862-345-0047'),
  ('48 Symor Dr', 'Symor Dr', 'Cooper', '862-345-0048'),
  ('49 Symor Dr', 'Symor Dr', 'Reed', '862-345-0049'),
  ('50 Symor Dr', 'Symor Dr', 'Bell', '862-345-0050'),
  ('51 Symor Dr', 'Symor Dr', 'Howard', '862-345-0051'),
  ('52 Symor Dr', 'Symor Dr', 'Graham', '862-345-0052'),
  ('53 Symor Dr', 'Symor Dr', 'Sullivan', '862-345-0053'),
  ('54 Symor Dr', 'Symor Dr', 'Wallace', '862-345-0054'),
  ('55 Symor Dr', 'Symor Dr', 'Woods', '862-345-0055'),
  ('56 Symor Dr', 'Symor Dr', 'Cole', '862-345-0056');

-- Brothers Pl: 2-18
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('2 Brothers Pl', 'Brothers Pl', 'West', '862-345-0201'),
  ('3 Brothers Pl', 'Brothers Pl', 'Jordan', '862-345-0202'),
  ('4 Brothers Pl', 'Brothers Pl', 'Owens', '862-345-0203'),
  ('5 Brothers Pl', 'Brothers Pl', 'Reynolds', '862-345-0204'),
  ('6 Brothers Pl', 'Brothers Pl', 'Fisher', '862-345-0205'),
  ('7 Brothers Pl', 'Brothers Pl', 'Ellis', '862-345-0206'),
  ('8 Brothers Pl', 'Brothers Pl', 'Harper', '862-345-0207'),
  ('9 Brothers Pl', 'Brothers Pl', 'Mason', '862-345-0208'),
  ('10 Brothers Pl', 'Brothers Pl', 'Holley', '862-345-0209'),
  ('11 Brothers Pl', 'Brothers Pl', 'Shannon', '862-345-0210'),
  ('12 Brothers Pl', 'Brothers Pl', 'Shields', '862-345-0211'),
  ('13 Brothers Pl', 'Brothers Pl', 'Haley', '862-345-0212'),
  ('14 Brothers Pl', 'Brothers Pl', 'Myers', '862-345-0213'),
  ('15 Brothers Pl', 'Brothers Pl', 'Weaver', '862-345-0214'),
  ('16 Brothers Pl', 'Brothers Pl', 'Curry', '862-345-0215'),
  ('17 Brothers Pl', 'Brothers Pl', 'Powers', '862-345-0216'),
  ('18 Brothers Pl', 'Brothers Pl', 'Summers', '862-345-0217');

-- Hadley Way: 1-8
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('1 Hadley Way', 'Hadley Way', 'Payne', '862-345-0301'),
  ('2 Hadley Way', 'Hadley Way', 'Miles', '862-345-0302'),
  ('3 Hadley Way', 'Hadley Way', 'Stafford', '862-345-0303'),
  ('4 Hadley Way', 'Hadley Way', 'Walls', '862-345-0304'),
  ('5 Hadley Way', 'Hadley Way', 'Bartlett', '862-345-0305'),
  ('6 Hadley Way', 'Hadley Way', 'Benson', '862-345-0306'),
  ('7 Hadley Way', 'Hadley Way', 'Bostic', '862-345-0307'),
  ('8 Hadley Way', 'Hadley Way', 'Bottoms', '862-345-0308');

-- Herms Pl: 2-19
INSERT INTO public.residences (address, street_name, last_name, phone_number) VALUES
  ('2 Herms Pl', 'Herms Pl', 'Brackett', '862-345-0401'),
  ('3 Herms Pl', 'Herms Pl', 'Bradshaw', '862-345-0402'),
  ('4 Herms Pl', 'Herms Pl', 'Brady', '862-345-0403'),
  ('5 Herms Pl', 'Herms Pl', 'Brandt', '862-345-0404'),
  ('6 Herms Pl', 'Herms Pl', 'Brant', '862-345-0405'),
  ('7 Herms Pl', 'Herms Pl', 'Braun', '862-345-0406'),
  ('8 Herms Pl', 'Herms Pl', 'Brazell', '862-345-0407'),
  ('9 Herms Pl', 'Herms Pl', 'Breaux', '862-345-0408'),
  ('10 Herms Pl', 'Herms Pl', 'Breen', '862-345-0409'),
  ('11 Herms Pl', 'Herms Pl', 'Breland', '862-345-0410'),
  ('12 Herms Pl', 'Herms Pl', 'Breton', '862-345-0411'),
  ('13 Herms Pl', 'Herms Pl', 'Brewster', '862-345-0412'),
  ('14 Herms Pl', 'Herms Pl', 'Brian', '862-345-0413'),
  ('15 Herms Pl', 'Herms Pl', 'Brice', '862-345-0414'),
  ('16 Herms Pl', 'Herms Pl', 'Bridgewater', '862-345-0415'),
  ('17 Herms Pl', 'Herms Pl', 'Bridges', '862-345-0416'),
  ('18 Herms Pl', 'Herms Pl', 'Brier', '862-345-0417'),
  ('19 Herms Pl', 'Herms Pl', 'Briggs', '862-345-0418');

-- Fanok Street: Individual addresses (to be added as needed)
-- This is currently empty as user will add addresses individually
