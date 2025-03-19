import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kayyrfpijdeqfrmylecj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtheXlyZnBpamRlcWZybXlsZWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MjMwOTUsImV4cCI6MjA1NTk5OTA5NX0.LCxdJ15nI8lxDd5BX8DvxH8Cg1MQhljckzvXZFCZn7c';

const supabase = createClient(supabaseUrl, supabaseKey);

const airports = [
  { iata: 'BRS', name: 'Bristol Airport', city: 'Bristol', country: 'United Kingdom', lat: 51.3827, lon: -2.7192 },
  { iata: 'KUN', name: 'Kaunas International Airport', city: 'Kaunas', country: 'Lithuania', lat: 54.9639, lon: 24.0848 },
  { iata: 'VNO', name: 'Vilnius International Airport', city: 'Vilnius', country: 'Lithuania', lat: 54.6341, lon: 25.2858 },
  { iata: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', lat: 51.1537, lon: -0.1821 },
  { iata: 'STN', name: 'London Stansted Airport', city: 'London', country: 'United Kingdom', lat: 51.8860, lon: 0.2389 },
  { iata: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom', lat: 52.4537, lon: -1.7487 },
  { iata: 'RIX', name: 'Riga International Airport', city: 'Riga', country: 'Latvia', lat: 56.9236, lon: 23.9711 },
  { iata: 'TFS', name: 'Tenerife South Airport', city: 'Tenerife', country: 'Spain', lat: 28.0445, lon: -16.5725 },
  { iata: 'GRO', name: 'Girona-Costa Brava Airport', city: 'Girona', country: 'Spain', lat: 41.9007, lon: 2.7606 },
  { iata: 'LBA', name: 'Leeds Bradford Airport', city: 'Leeds', country: 'United Kingdom', lat: 53.8659, lon: -1.6606 },
  { iata: 'PMI', name: 'Palma de Mallorca Airport', city: 'Palma de Mallorca', country: 'Spain', lat: 39.5517, lon: 2.7388 },
  { iata: 'ALC', name: 'Alicante Airport', city: 'Alicante', country: 'Spain', lat: 38.2822, lon: -0.5582 },
  { iata: 'LTN', name: 'London Luton Airport', city: 'London', country: 'United Kingdom', lat: 51.8747, lon: -0.3683 },
  { iata: 'PFO', name: 'Paphos International Airport', city: 'Paphos', country: 'Cyprus', lat: 34.7178, lon: 32.4857 },
  { iata: 'SEN', name: 'London Southend Airport', city: 'London', country: 'United Kingdom', lat: 51.5714, lon: 0.6956 },
  { iata: 'NAP', name: 'Naples International Airport', city: 'Naples', country: 'Italy', lat: 40.8860, lon: 14.2908 },
  { iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', lat: 46.2380, lon: 6.1089 },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', lat: 53.4213, lon: -6.2700 }
];

async function insertAirports() {
  try {
    // First, let's check what's in the table
    const { data: existingData, error: selectError } = await supabase
      .from('all_airport_gps')
      .select('iata');
    
    if (selectError) {
      console.error('Error checking existing data:', selectError);
      return;
    }

    console.log('Existing airports:', existingData?.length || 0);

    // Insert the airports
    const { data, error } = await supabase
      .from('all_airport_gps')
      .insert(airports)
      .select();

    if (error) {
      console.error('Error inserting airports:', error);
    } else {
      console.log('Successfully inserted airports:', data.length);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

insertAirports(); 