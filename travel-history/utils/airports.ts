interface AirportData {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  elevation: number;
  lat: number;
  lon: number;
  tz: string;
}

interface AirportCache {
  [iata: string]: {
    code: string;
    lat: number;
    lng: number;
    name: string;
    city: string;
    country: string;
  };
}

let airportCache: AirportCache = {};

export async function getAirportData(iataCode: string) {
  // If in cache, return immediately
  if (airportCache[iataCode]) {
    return airportCache[iataCode];
  }

  try {
    // Fetch from public airports database
    const response = await fetch(
      `https://raw.githubusercontent.com/mwgg/Airports/master/airports.json`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch airport data');
    }

    const airports: Record<string, AirportData> = await response.json();
    
    // Find airport by IATA code
    const airport = Object.values(airports).find(a => a.iata === iataCode);
    
    if (!airport) {
      throw new Error(`Airport not found: ${iataCode}`);
    }

    // Cache the result
    const airportInfo = {
      code: airport.iata,
      lat: airport.lat,
      lng: airport.lon,
      name: airport.name,
      city: airport.city,
      country: airport.country
    };

    airportCache[iataCode] = airportInfo;
    return airportInfo;

  } catch (error) {
    console.error('Error fetching airport data:', error);
    return null;
  }
}

export async function enrichRouteWithAirportData(route: { 
  fromCode: string; 
  toCode: string; 
  count: number;
}) {
  const [fromAirport, toAirport] = await Promise.all([
    getAirportData(route.fromCode),
    getAirportData(route.toCode)
  ]);

  if (!fromAirport || !toAirport) {
    return null;
  }

  return {
    from: fromAirport,
    to: toAirport,
    count: route.count
  };
}

export function clearAirportCache() {
  airportCache = {};
} 