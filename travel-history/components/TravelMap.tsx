'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';

interface Airport {
  code: string;
  lat: number;
  lng: number;
  count: number;
  name?: string;
  city?: string;
  country?: string;
}

interface Route {
  from: string;
  to: string;
  count: number;
  type: 'departure' | 'arrival';
}

// Extract IATA code from strings like "Bristol (BRS)" -> "BRS"
const extractIataCode = (airportString: string) => {
  const match = airportString.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : airportString;
};

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[500px] bg-card rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        <p className="text-content-secondary">Loading map...</p>
      </div>
    </div>
  ),
});

export default function TravelMap() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [homeAirport, setHomeAirport] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Starting data fetch...');
        
        // Fetch all flights
        const { data: flights, error: flightsError } = await supabase
          .from('vidmaflights')
          .select('departure_airport, arrival_airport');

        if (flightsError) {
          console.error('Error fetching flights:', flightsError);
          throw flightsError;
        }

        console.log('Flights fetched:', flights?.length || 0, 'flights found');
        console.log('Sample flight:', flights?.[0]);

        if (!flights || flights.length === 0) {
          throw new Error('No flights found in the database');
        }

        // Get unique airport codes from flights
        const airportCodes = new Set<string>();
        flights.forEach((flight) => {
          const depCode = extractIataCode(flight.departure_airport);
          const arrCode = extractIataCode(flight.arrival_airport);
          
          airportCodes.add(depCode);
          airportCodes.add(arrCode);
        });

        console.log('Unique airports found:', airportCodes.size);
        console.log('Airport codes from flights (IATA only):', Array.from(airportCodes));

        // First, let's check if we can get any data from the table
        const { data: testData, error: testError } = await supabase
          .from('all_airport_gps')
          .select('*')
          .limit(1);

        console.log('Test query result:', testData);
        if (testError) {
          console.error('Error testing airport table:', testError);
        }

        // Now try to fetch airport data for visited airports
        const { data: airportData, error: airportError } = await supabase
          .from('all_airport_gps')
          .select('iata, name, city, country, lat, lon');

        if (airportError) {
          console.error('Error fetching airports:', airportError);
          throw airportError;
        }

        console.log('All airports in database:', airportData?.length || 0);
        
        // Log some sample data to check format
        if (airportData && airportData.length > 0) {
          console.log('First few airports in database:');
          airportData.slice(0, 5).forEach(airport => {
            console.log('Airport:', {
              iata: airport.iata,
              name: airport.name,
              city: airport.city,
              lat: airport.lat,
              lon: airport.lon
            });
          });
        } else {
          console.log('No airports found in database!');
          
          // Let's try to insert some test data for one airport
          const testAirport = {
            iata: 'LGW',
            name: 'London Gatwick Airport',
            city: 'London',
            country: 'United Kingdom',
            lat: 51.1537,
            lon: -0.1821
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('all_airport_gps')
            .insert([testAirport])
            .select();
            
          if (insertError) {
            console.error('Error inserting test airport:', insertError);
          } else {
            console.log('Test airport inserted:', insertData);
          }
        }

        // Check which airport codes from flights are missing in the database
        const availableAirportCodes = new Set(airportData?.map(a => a.iata?.toUpperCase()) || []);
        console.log('Available airport codes:', Array.from(availableAirportCodes));
        const missingAirports = Array.from(airportCodes).filter(code => !availableAirportCodes.has(code));
        
        console.log('Missing airports:', missingAirports);
        console.log('First few available airport codes:', Array.from(availableAirportCodes).slice(0, 5));

        // Filter airports to match our codes
        const filteredAirportData = airportData?.filter(airport => 
          airport.iata && airportCodes.has(airport.iata)
        );

        if (!filteredAirportData || filteredAirportData.length === 0) {
          throw new Error('No matching airport data found');
        }

        // Create a map for quick airport lookups
        const airportMap = new Map(
          filteredAirportData.map(airport => [
            airport.iata.toUpperCase(),
            {
              code: airport.iata.toUpperCase(),
              name: airport.name,
              city: airport.city,
              country: airport.country,
              lat: airport.lat,
              lng: airport.lon,
              count: 0
            }
          ])
        );

        // Count flights for each airport and create routes
        const routeMap = new Map<string, { count: number; type: 'departure' | 'arrival' }>();
        
        flights.forEach(flight => {
          const depCode = extractIataCode(flight.departure_airport);
          const arrCode = extractIataCode(flight.arrival_airport);
          
          // Skip if we don't have coordinates for either airport
          if (!airportMap.has(depCode) || !airportMap.has(arrCode)) {
            console.log(`Skipping flight ${depCode} -> ${arrCode} due to missing airport data`);
            return;
          }

          // Increment departure airport count
          const depAirport = airportMap.get(depCode)!;
          depAirport.count++;
          airportMap.set(depCode, depAirport);

          // Increment arrival airport count
          const arrAirport = airportMap.get(arrCode)!;
          arrAirport.count++;
          airportMap.set(arrCode, arrAirport);

          // Create unique route keys and update counts
          const departureKey = `${depCode}-${arrCode}`;
          const arrivalKey = `${arrCode}-${depCode}`;

          // Update departure route
          const existingDepRoute = routeMap.get(departureKey) || { count: 0, type: 'departure' as const };
          routeMap.set(departureKey, { ...existingDepRoute, count: existingDepRoute.count + 1 });

          // Update arrival route (if it's a return flight)
          const existingArrRoute = routeMap.get(arrivalKey);
          if (!existingArrRoute) {
            routeMap.set(arrivalKey, { count: 1, type: 'arrival' });
          } else {
            routeMap.set(arrivalKey, { ...existingArrRoute, count: existingArrRoute.count + 1 });
          }
        });

        // Convert airports map to array
        const airportsArray = Array.from(airportMap.values());

        // Convert routes map to array
        const routesArray = Array.from(routeMap.entries()).map(([key, value]) => {
          const [from, to] = key.split('-');
          return {
            from,
            to,
            count: value.count,
            type: value.type
          };
        });

        console.log('Processed airports:', airportsArray.length);
        console.log('Processed routes:', routesArray.length);

        // Find home airport (most departures)
        const homeAirport = airportsArray.reduce((prev, current) => 
          (current.count > prev.count) ? current : prev
        ).code;

        setAirports(airportsArray);
        setRoutes(routesArray);
        setHomeAirport(homeAirport);
        setError(null);
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-card rounded-lg">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-[500px] bg-card rounded-lg overflow-hidden">
      <LeafletMap
        airports={airports}
        routes={routes}
        homeAirport={homeAirport}
        loading={loading}
      />
    </div>
  );
} 