'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Extend PolylineOptions to include count
interface CustomPolylineOptions extends L.PolylineOptions {
  count?: number;
}

interface LeafletMapProps {
  airports: Airport[];
  routes: Route[];
  homeAirport: string;
  loading: boolean;
}

// Create a curved line between two points
function createCurvedLine(from: [number, number], to: [number, number]): [number, number][] {
  const latlngs: [number, number][] = [];
  const offsetX = to[1] - from[1];
  const offsetY = to[0] - from[0];
  
  // Calculate control point for quadratic curve
  const center = [from[0] + offsetY / 2, from[1] + offsetX / 2] as [number, number];
  const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  
  // Adjust curvature based on distance - longer routes curve more
  const minCurvature = 0.15;
  const maxCurvature = 0.4;
  const normalizedDistance = Math.min(distance / 180, 1); // 180 degrees is max distance on Earth
  const curvature = minCurvature + (maxCurvature - minCurvature) * normalizedDistance;
  
  // Calculate perpendicular offset for control point
  const angle = Math.atan2(offsetY, offsetX) + Math.PI / 2;
  const controlPoint: [number, number] = [
    center[0] + distance * curvature * Math.sin(angle),
    center[1] + distance * curvature * Math.cos(angle)
  ];

  // Generate more points for smoother curves
  const steps = Math.max(20, Math.min(50, Math.floor(distance * 2)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    
    // Use cubic bezier curve for smoother animation
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    const lat = from[0] * mt3 + 3 * controlPoint[0] * mt2 * t + 3 * controlPoint[0] * mt * t2 + to[0] * t3;
    const lng = from[1] * mt3 + 3 * controlPoint[1] * mt2 * t + 3 * controlPoint[1] * mt * t2 + to[1] * t3;
    
    latlngs.push([lat, lng]);
  }
  
  return latlngs;
}

export default function LeafletMap({ airports, routes, homeAirport, loading }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    console.log('LeafletMap useEffect - Airports:', airports.length);
    console.log('LeafletMap useEffect - Routes:', routes.length);
    console.log('LeafletMap useEffect - Home Airport:', homeAirport);

    // Initialize map
    if (!mapRef.current) {
      console.log('Initializing map...');
      mapRef.current = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
      });

      // Add tile layer (modern theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(mapRef.current);

      // Create layers for markers and routes
      markersRef.current = L.layerGroup().addTo(mapRef.current);
      routesRef.current = L.layerGroup().addTo(mapRef.current);
      console.log('Map initialized');
    }

    // Clear existing markers and routes
    if (markersRef.current) markersRef.current.clearLayers();
    if (routesRef.current) routesRef.current.clearLayers();

    if (!loading && mapRef.current && markersRef.current && routesRef.current) {
      console.log('Adding markers and routes...');
      
      // Add airport markers
      const bounds = L.latLngBounds([[0, 0], [0, 0]]);
      
      // First add routes so they appear under markers
      routes.forEach((route) => {
        const fromAirport = airports.find(a => a.code === route.from);
        const toAirport = airports.find(a => a.code === route.to);

        if (fromAirport && toAirport) {
          const from: [number, number] = [fromAirport.lat, fromAirport.lng];
          const to: [number, number] = [toAirport.lat, toAirport.lng];
          
          // Create curved line
          const curvedPath = createCurvedLine(from, to);
          
          // Calculate line properties based on flight frequency
          const maxCount = Math.max(...Array.from(routesRef.current?.getLayers() || [])
            .filter(layer => layer instanceof L.Polyline)
            .map(layer => (layer as L.Polyline & { options: CustomPolylineOptions }).options.count || 0)
            .concat(route.count));

          const minThickness = 1.5;
          const maxThickness = 6;
          const minOpacity = 0.4;
          const maxOpacity = 0.9;

          // Calculate normalized values
          const normalizedCount = route.count / maxCount;
          const thickness = minThickness + (maxThickness - minThickness) * normalizedCount;
          const opacity = minOpacity + (maxOpacity - minOpacity) * normalizedCount;
          
          // Create animated line with dynamic properties
          const line = L.polyline(curvedPath, {
            color: route.type === 'departure' ? '#00C853' : '#FF1744',
            weight: thickness,
            opacity: opacity,
            className: `animated-line ${route.type === 'departure' ? 'departure' : 'arrival'}`,
            count: route.count // Store count for future reference
          } as CustomPolylineOptions);

          // Add hover effect with glow
          line.on('mouseover', () => {
            line.setStyle({
              weight: thickness * 1.5,
              opacity: Math.min(1, opacity * 1.3),
              className: `animated-line ${route.type === 'departure' ? 'departure glow-green' : 'arrival glow-red'}`
            });
          }).on('mouseout', () => {
            line.setStyle({
              weight: thickness,
              opacity: opacity,
              className: `animated-line ${route.type === 'departure' ? 'departure' : 'arrival'}`
            });
          });

          // Add popup with route information and frequency indicator
          line.bindPopup(`
            <div class="p-3 min-w-[250px] popup-content">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">✈️</span>
                <div class="flex-1">
                  <div class="font-bold text-lg">${fromAirport.city} → ${toAirport.city}</div>
                  <div class="text-sm opacity-75">${fromAirport.code} → ${toAirport.code}</div>
                </div>
              </div>
              <div class="mt-2 bg-gray-50 rounded-lg p-2">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full ${route.type === 'departure' ? 'bg-green-500' : 'bg-red-500'}"
                      style="width: ${Math.round(normalizedCount * 100)}%"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-600">${Math.round(normalizedCount * 100)}%</span>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 ${route.type === 'departure' ? 'text-green-600' : 'text-red-600'}">
                <span class="font-medium">${route.count} flight${route.count !== 1 ? 's' : ''}</span>
                <span class="text-xs">${route.type === 'departure' ? '(outbound)' : '(inbound)'}</span>
              </div>
            </div>
          `, {
            className: 'custom-popup fade-in'
          });

          line.addTo(routesRef.current!);
        }
      });

      // Then add airport markers
      airports.forEach((airport) => {
        console.log('Processing airport:', airport.code, airport.lat, airport.lng);
        if (airport.count > 0) {
          // Calculate marker size based on flight count
          const size = Math.max(6, Math.min(12, 6 + Math.log2(airport.count) * 2));
          const isHome = airport.code === homeAirport;

          // Create custom SVG icon for the marker
          const markerHtml = `
            <div class="relative">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         ${isHome ? 'airport-marker-home' : 'airport-marker'}"
                   style="--marker-size: ${size}px">
                <svg viewBox="0 0 24 24" class="marker-svg">
                  <path class="marker-base" d="M12 2C7.58 2 4 5.58 4 10c0 6 8 12 8 12s8-6 8-12c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                  <path class="marker-ring" d="M12 0C5.38 0 0 5.38 0 12s5.38 12 12 12 12-5.38 12-12S18.62 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
                </svg>
              </div>
            </div>
          `;

          // Create marker with custom icon
          const icon = L.divIcon({
            html: markerHtml,
            className: 'custom-marker',
            iconSize: [size * 3, size * 3],
            iconAnchor: [size * 1.5, size * 1.5]
          });

          const marker = L.marker([airport.lat, airport.lng], {
            icon: icon,
            zIndexOffset: isHome ? 1000 : 0
          });

          // Add hover effect
          const element = marker.getElement();
          if (element) {
            element.addEventListener('mouseenter', () => {
              const markerDiv = element.querySelector('.airport-marker, .airport-marker-home');
              if (markerDiv) {
                markerDiv.classList.add('marker-hover');
              }
            });
            element.addEventListener('mouseleave', () => {
              const markerDiv = element.querySelector('.airport-marker, .airport-marker-home');
              if (markerDiv) {
                markerDiv.classList.remove('marker-hover');
              }
            });
          }

          // Add popup with enhanced information
          marker.bindPopup(`
            <div class="p-4 min-w-[280px] popup-content">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${isHome ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-purple-400 to-purple-600'} text-white shadow-lg">
                  <span class="text-xl">✈️</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-xl ${isHome ? 'text-blue-600' : 'text-purple-600'}">${airport.code}</span>
                    ${isHome ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Home Base</span>' : ''}
                  </div>
                  <div class="font-medium text-gray-800">${airport.name || 'Unknown Airport'}</div>
                </div>
              </div>
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 mb-3 shadow-inner">
                <div class="text-gray-600 font-medium">
                  ${airport.city}${airport.country ? `, ${airport.country}` : ''}
                </div>
                <div class="text-gray-500 text-xs mt-1">
                  ${airport.lat.toFixed(4)}° N, ${airport.lng.toFixed(4)}° E
                </div>
              </div>
              <div class="flex items-center justify-between">
                <div class="text-green-600 font-medium text-lg">
                  ${airport.count} flight${airport.count !== 1 ? 's' : ''}
                </div>
                <div class="text-xs text-gray-500">
                  Click to zoom in
                </div>
              </div>
            </div>
          `, {
            className: 'custom-popup fade-in'
          });

          // Add click handler to center and zoom on airport
          marker.on('click', () => {
            mapRef.current?.setView([airport.lat, airport.lng], 7, {
              animate: true,
              duration: 1
            });
          });

          marker.addTo(markersRef.current!);
          bounds.extend([airport.lat, airport.lng]);
          console.log('Added marker for:', airport.code);
        }
      });

      // Fit bounds with padding
      if (bounds.getNorthEast() && bounds.getSouthWest()) {
        console.log('Fitting bounds to show all markers');
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 7,
          animate: true,
          duration: 1
        });
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [airports, routes, homeAirport, loading]);

  return (
    <>
      <style jsx global>{`
        .animated-line {
          stroke-dasharray: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
          pointer-events: all;
        }
        .departure {
          animation: dash-departure var(--duration) linear infinite;
          --duration: 30s;
        }
        .arrival {
          animation: dash-arrival var(--duration) linear infinite;
          --duration: 30s;
        }
        @keyframes dash-departure {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
          }
        }
        @keyframes dash-arrival {
          0% {
            stroke-dashoffset: -1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animated-line:hover {
          --duration: 15s;
          transition: --duration 0.3s ease;
        }
        .pulse {
          animation: pulse-animation 2s infinite;
        }
        @keyframes pulse-animation {
          0% {
            box-shadow: 0 0 0 0 rgba(41, 98, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(41, 98, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(41, 98, 255, 0);
          }
        }
        .marker-hover {
          transition: all 0.3s ease;
        }
        .glow-blue {
          filter: drop-shadow(0 0 8px rgba(41, 98, 255, 0.8));
        }
        .glow-purple {
          filter: drop-shadow(0 0 8px rgba(101, 31, 255, 0.8));
        }
        .glow-green {
          filter: drop-shadow(0 0 8px rgba(0, 200, 83, 0.6));
          transition: filter 0.3s ease;
        }
        .glow-red {
          filter: drop-shadow(0 0 8px rgba(255, 23, 68, 0.6));
          transition: filter 0.3s ease;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(8px);
        }
        .popup-content {
          opacity: 0;
          animation: fade-in 0.3s ease forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        #map {
          transition: all 0.3s ease;
        }
        #map:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }
        .custom-marker {
          contain: layout style;
        }

        .airport-marker,
        .airport-marker-home {
          width: calc(var(--marker-size) * 3);
          height: calc(var(--marker-size) * 3);
          transform-origin: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .airport-marker .marker-svg,
        .airport-marker-home .marker-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .airport-marker .marker-base {
          fill: #651FFF;
        }

        .airport-marker-home .marker-base {
          fill: #2962FF;
        }

        .airport-marker .marker-ring,
        .airport-marker-home .marker-ring {
          fill: white;
          opacity: 0.2;
          transform-origin: center;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .airport-marker-home .marker-ring {
          animation: pulse-ring-home 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .marker-hover {
          transform: scale(1.3);
        }

        .marker-hover .marker-svg {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .marker-hover .marker-base {
          filter: brightness(1.2);
        }

        .marker-hover .marker-ring {
          opacity: 0.4;
          animation-duration: 1.5s;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.2;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-home {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
      <div id="map" className="w-full h-full rounded-lg overflow-hidden shadow-lg" />
    </>
  );
} 