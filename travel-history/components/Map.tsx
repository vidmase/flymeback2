'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import type { Flight } from '@/types/flights';
import { formatDate } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

export default function Map({ flights }: { flights: Flight[] }) {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative h-[400px] w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900 bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
        </div>
      )}
      <MapContainer
        center={[51.505, -0.09]}
        zoom={4}
        className="h-full w-full"
        style={{ background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {flights.map((flight) => {
          if (!flight.departure_coordinates || !flight.arrival_coordinates) return null;

          const departureLatLng: [number, number] = [
            Number(flight.departure_coordinates[0]),
            Number(flight.departure_coordinates[1])
          ];
          const arrivalLatLng: [number, number] = [
            Number(flight.arrival_coordinates[0]),
            Number(flight.arrival_coordinates[1])
          ];

          return (
            <React.Fragment key={flight.id}>
              <Marker
                position={departureLatLng}
                icon={L.divIcon({
                  className: 'bg-transparent',
                  html: `<div class="w-3 h-3 bg-cyan-400 rounded-full"></div>`,
                })}
              >
                <Popup className="bg-navy-800 border border-navy-700">
                  <div className="text-cyan-200">
                    <p className="font-semibold">{flight.departure_airport}</p>
                    <p className="text-sm">{format(formatDate(flight.departure_date), 'dd MMM yyyy')}</p>
                  </div>
                </Popup>
              </Marker>
              <Marker
                position={arrivalLatLng}
                icon={L.divIcon({
                  className: 'bg-transparent',
                  html: `<div class="w-3 h-3 bg-cyan-400 rounded-full"></div>`,
                })}
              >
                <Popup className="bg-navy-800 border border-navy-700">
                  <div className="text-cyan-200">
                    <p className="font-semibold">{flight.arrival_airport}</p>
                    <p className="text-sm">{format(formatDate(flight.departure_date), 'dd MMM yyyy')}</p>
                  </div>
                </Popup>
              </Marker>
              <Polyline
                positions={[departureLatLng, arrivalLatLng]}
                pathOptions={{ color: '#22d3ee', weight: 2 }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
} 