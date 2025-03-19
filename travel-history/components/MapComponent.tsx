'use client';

import { useEffect, useState } from 'react';
import ReactMapGL, { Source, Layer, Marker, Popup } from 'react-map-gl';
import type { LayerProps } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  from: Airport;
  to: Airport;
  count: number;
  type: 'departure' | 'arrival';
}

interface MapComponentProps {
  airports: Airport[];
  routes: Route[];
}

// Replace with your actual Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

function interpolate(t: number, p0: number, p1: number, p2: number) {
  return Math.pow(1 - t, 2) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function createArcGeoJSON(routes: Route[]) {
  const features = routes.map((route) => {
    const start = [route.from.lng, route.from.lat];
    const end = [route.to.lng, route.to.lat];
    
    // Calculate the distance and midpoint
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2)
    );
    
    // Make the arc height proportional to the distance
    const heightFactor = Math.min(distance * 0.15, 1.5);
    
    // Calculate control point for the bezier curve
    const mid = [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2
    ];
    
    // Add altitude to the control point
    const control = [
      mid[0],
      mid[1] + heightFactor
    ];
    
    // Generate points along the bezier curve
    const points = [];
    const numPoints = 50;
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      points.push([
        interpolate(t, start[0], control[0], end[0]),
        interpolate(t, start[1], control[1], end[1])
      ]);
    }

    return {
      type: 'Feature' as const,
      properties: {
        count: route.count,
        distance: distance,
        type: route.type || 'departure'  // Default to departure if not specified
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: points
      }
    };
  });

  return {
    type: 'FeatureCollection' as const,
    features
  };
}

function getBounds(airports: Airport[]) {
  if (!airports.length) return null;
  
  const lngs = airports.map(a => a.lng);
  const lats = airports.map(a => a.lat);
  
  return {
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };
}

// Custom keyframe animation for the flight paths
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 0.4;
      stroke-width: 1;
    }
    50% {
      opacity: 0.8;
      stroke-width: 3;
    }
    100% {
      opacity: 0.4;
      stroke-width: 1;
    }
  }
`;

export default function MapComponent({ airports, routes }: MapComponentProps) {
  const [popupInfo, setPopupInfo] = useState<Airport | null>(null);
  const [viewState, setViewState] = useState(() => {
    const bounds = getBounds(airports);
    if (!bounds) {
      return {
        latitude: 20,
        longitude: 0,
        zoom: 1.5,
        bearing: 0,
        pitch: 0
      };
    }

    const padding = 20;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    
    const lngDiff = bounds.maxLng - bounds.minLng + padding;
    const latDiff = bounds.maxLat - bounds.minLat + padding;
    const maxDiff = Math.max(lngDiff, latDiff);
    const zoom = Math.floor(Math.log2(360 / maxDiff)) - 1;

    return {
      latitude: centerLat,
      longitude: centerLng,
      zoom: Math.min(Math.max(zoom, 1), 4),
      bearing: 0,
      pitch: 0
    };
  });

  const routesGeoJSON = createArcGeoJSON(routes);

  // Departure routes layer (green)
  const departureRouteLayer: LayerProps = {
    id: 'departure-routes',
    type: 'line',
    filter: ['==', ['get', 'type'], 'departure'],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: 'visible'
    },
    paint: {
      'line-color': 'rgba(76, 175, 80, 0.5)',  // Lighter green
      'line-width': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1, 1,
        10, 2
      ],
      'line-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 0.5,
        4, 0.8
      ]
    }
  };

  // Arrival routes layer (red)
  const arrivalRouteLayer: LayerProps = {
    id: 'arrival-routes',
    type: 'line',
    filter: ['==', ['get', 'type'], 'arrival'],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
      visibility: 'visible'
    },
    paint: {
      'line-color': 'rgba(244, 67, 54, 0.5)',  // Lighter red
      'line-width': [
        'interpolate',
        ['linear'],
        ['get', 'count'],
        1, 1,
        10, 2
      ],
      'line-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1, 0.5,
        4, 0.8
      ]
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#f8f9fa' }}>
      <style>
        {pulseAnimation}
        {`
          .flight-path {
            animation: pulse 3s infinite;
          }
          .airport-marker {
            animation: bounce 1s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .mapboxgl-popup-content {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 16px;
            padding: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            min-width: 200px;
          }
          .mapboxgl-popup-close-button {
            font-size: 16px;
            color: #666;
            padding: 8px;
          }
          .airport-marker {
            transition: transform 0.2s;
          }
          .airport-marker:hover {
            transform: scale(1.2);
          }
        `}
      </style>
      <ReactMapGL
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={true}
        maxZoom={5}
        minZoom={1}
      >
        <Source type="geojson" data={routesGeoJSON}>
          <Layer {...departureRouteLayer} />
          <Layer {...arrivalRouteLayer} />
        </Source>

        {airports.map((airport) => (
          <Marker
            key={airport.code}
            longitude={airport.lng}
            latitude={airport.lat}
          >
            <div 
              className="cursor-pointer airport-marker"
              style={{
                width: `${Math.max(4, Math.log(airport.count) * 3)}px`,
                height: `${Math.max(4, Math.log(airport.count) * 3)}px`,
                background: '#333',
                borderRadius: '50%',
                opacity: 0.7,
                border: popupInfo?.code === airport.code ? '2px solid #fff' : 'none',
                boxShadow: popupInfo?.code === airport.code ? '0 0 0 2px rgba(0,0,0,0.2)' : 'none'
              }}
              onClick={() => setPopupInfo(airport)}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            onClose={() => setPopupInfo(null)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {popupInfo.code}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {popupInfo.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    Flights
                  </div>
                  <div className="text-lg font-bold text-accent">
                    {popupInfo.count}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500">City</div>
                    <div className="font-medium">{popupInfo.city || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Country</div>
                    <div className="font-medium">{popupInfo.country || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-1">
                {popupInfo.lat.toFixed(4)}°N, {popupInfo.lng.toFixed(4)}°E
              </div>
            </div>
          </Popup>
        )}
      </ReactMapGL>
    </div>
  );
} 