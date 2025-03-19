export interface Flight {
  id: number;
  passenger_name: string;
  reservation_number: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  total_receipt: string;
  currency: string;
  purchased_date: string;
  purchase_time: string;
  // Additional computed properties for the map
  departure_coordinates?: [number, number];
  arrival_coordinates?: [number, number];
} 