-- Insert into bus_stops
INSERT INTO bus_stops (name, latitude, longitude) VALUES
('T. Nagar', 13.0417, 80.2144),
('Saidapet', 13.0233, 80.2067),
('Guindy', 12.9911, 80.2178),
('Adyar', 13.0067, 80.2450),
('Central Station', 13.0822, 80.2750),
('Egmore', 13.0827, 80.2500),
('Nungambakkam', 13.0667, 80.2500),
('Kodambakkam', 13.0500, 80.2200),
('Airport', 12.9800, 80.1600),
('Meenambakkam', 12.9900, 80.1700),
('Tirusulam', 12.9750, 80.1550),
('Pallavaram', 12.9550, 80.1750),
('Velachery', 12.9833, 80.2267),
('Tambaram', 12.9200, 80.1300),
('Chromepet', 12.9530, 80.1450),
('Mylapore', 13.0300, 80.2700),
('Anna Nagar', 13.0833, 80.2167),
('Besant Nagar', 13.0000, 80.2750),
('Royapettah', 13.0500, 80.2600),
('Thiruvanmiyur', 12.9800, 80.2650),
('OMR', 12.8500, 80.2500),
('ECR', 12.8000, 80.3000),
('Thirumangalam', 13.0750, 80.2000),
('Ambattur', 13.0900, 80.1500),
('Poonamallee', 13.0300, 80.1100),
('Vadapalani', 13.0500, 80.2000),
('Porur', 13.0200, 80.1600),
('Sholinganallur', 12.9000, 80.2300),
('Perungudi', 12.9700, 80.2400),
('Siruseri', 12.8600, 80.2200),
('Koyambedu', 13.0630, 80.2150),
('Broadway', 13.0900, 80.2800);

-- Insert into bus_routes
INSERT INTO bus_routes (route_number, name, path_coordinates) VALUES
('27B', 'T. Nagar - Adyar', '[{"lat": 13.0417, "lng": 80.2144}, {"lat": 13.0233, "lng": 80.2067}, {"lat": 13.0067, "lng": 80.2450}]'),
('51', 'Central Station - Guindy', '[{"lat": 13.0822, "lng": 80.2750}, {"lat": 13.0827, "lng": 80.2500}, {"lat": 12.9911, "lng": 80.2178}]'),
('M51', 'Egmore - Navalur', '[{"lat": 13.0827, "lng": 80.2500}, {"lat": 13.0300, "lng": 80.2700}, {"lat": 12.8500, "lng": 80.2500}]'),
('109', 'Koyambedu - T.Nagar', '[{"lat": 13.0630, "lng": 80.2150}, {"lat": 13.0833, "lng": 80.2167}, {"lat": 13.0417, "lng": 80.2144}]'),
('29', 'Broadway - Besant Nagar', '[{"lat": 13.0900, "lng": 80.2800}, {"lat": 13.0500, "lng": 80.2600}, {"lat": 13.0000, "lng": 80.2750}]');

-- Insert into bus_route_mappings
INSERT INTO bus_route_mappings (bus_route_id, bus_stop_id, stop_sequence) VALUES
(1, 1, 1),  -- 27B: T. Nagar
(1, 2, 2),  -- 27B: Saidapet
(1, 4, 3),  -- 27B: Adyar
(2, 5, 1),  -- 51: Central Station
(2, 6, 2),  -- 51: Egmore
(2, 3, 3),  -- 51: Guindy
(3, 6, 1),  -- M51: Egmore
(3, 16, 2), -- M51: Mylapore
(3, 21, 3), -- M51: OMR
(4, 31, 1), -- 109: Koyambedu
(4, 17, 2), -- 109: Anna Nagar
(4, 1, 3),  -- 109: T. Nagar
(5, 32, 1), -- 29: Broadway
(5, 19, 2), -- 29: Royapettah
(5, 18, 3); -- 29: Besant Nagar

-- Insert into buses
INSERT INTO buses (route_id, latitude, longitude) VALUES
(1, 13.0350, 80.2200),  -- Route 27B, near Saidapet
(2, 13.0700, 80.2600),  -- Route 51, near Egmore
(3, 13.0400, 80.2680),  -- Route M51, near Mylapore
(1, 13.0430, 80.2180),  -- Another bus on Route 27B
(4, 13.0500, 80.2160);  -- Route 109

-- Insert into accidents
INSERT INTO accidents (latitude, longitude, message, timestamp) VALUES
(13.0400, 80.2300, 'Accident near Saidapet Bridge', NOW() - INTERVAL '10 minutes'),
(13.0750, 80.2450, 'Vehicle collision on Anna Salai', NOW() - INTERVAL '30 minutes'),
(12.9950, 80.2700, 'Accident near Besant Nagar', NOW() - INTERVAL '1 hour');
