-- First, make sure we have a unique constraint on iata
ALTER TABLE all_airport_gps ADD CONSTRAINT all_airport_gps_iata_key UNIQUE (iata);

-- Insert airport data
INSERT INTO all_airport_gps (iata, name, city, country, lat, lon)
VALUES
('BRS', 'Bristol Airport', 'Bristol', 'United Kingdom', 51.3827, -2.7192),
('KUN', 'Kaunas International Airport', 'Kaunas', 'Lithuania', 54.9639, 24.0848),
('VNO', 'Vilnius International Airport', 'Vilnius', 'Lithuania', 54.6341, 25.2858),
('LGW', 'London Gatwick Airport', 'London', 'United Kingdom', 51.1537, -0.1821),
('STN', 'London Stansted Airport', 'London', 'United Kingdom', 51.8860, 0.2389),
('BHX', 'Birmingham Airport', 'Birmingham', 'United Kingdom', 52.4537, -1.7487),
('RIX', 'Riga International Airport', 'Riga', 'Latvia', 56.9236, 23.9711),
('TFS', 'Tenerife South Airport', 'Tenerife', 'Spain', 28.0445, -16.5725),
('GRO', 'Girona-Costa Brava Airport', 'Girona', 'Spain', 41.9007, 2.7606),
('LBA', 'Leeds Bradford Airport', 'Leeds', 'United Kingdom', 53.8659, -1.6606),
('PMI', 'Palma de Mallorca Airport', 'Palma de Mallorca', 'Spain', 39.5517, 2.7388),
('ALC', 'Alicante Airport', 'Alicante', 'Spain', 38.2822, -0.5582),
('LTN', 'London Luton Airport', 'London', 'United Kingdom', 51.8747, -0.3683),
('PFO', 'Paphos International Airport', 'Paphos', 'Cyprus', 34.7178, 32.4857),
('SEN', 'London Southend Airport', 'London', 'United Kingdom', 51.5714, 0.6956),
('NAP', 'Naples International Airport', 'Naples', 'Italy', 40.8860, 14.2908),
('GVA', 'Geneva Airport', 'Geneva', 'Switzerland', 46.2380, 6.1089),
('DUB', 'Dublin Airport', 'Dublin', 'Ireland', 53.4213, -6.2700); 