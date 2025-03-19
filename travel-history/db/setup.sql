-- First, drop the existing table if it exists
DROP TABLE IF EXISTS all_airport_gps;

-- Create the table with proper constraints
CREATE TABLE all_airport_gps (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    iata text UNIQUE NOT NULL,
    name text,
    city text,
    state text,
    country text,
    elevation numeric,
    lat numeric,
    lon numeric,
    tz text
);

-- Enable RLS
ALTER TABLE all_airport_gps ENABLE ROW LEVEL SECURITY; 