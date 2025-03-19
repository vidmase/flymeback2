'use client';

import React from 'react';
import TravelMap from '@/components/TravelMap';
import TravelStats from '@/components/TravelStats';
import FlightList from '@/components/FlightList';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl font-semibold text-content-primary mb-1">Flight Statistics</h1>
          <p className="text-content-secondary">Your journey through the skies • 200 flights and counting</p>
        </div>

        <div className="mt-6 space-y-6">
          {/* Map Section */}
          <div className="bg-card rounded-lg border border-white/10 shadow-lg overflow-hidden">
            <TravelMap />
          </div>

          {/* Travel Stats Section */}
          <div className="bg-card rounded-lg border border-white/10 shadow-lg p-6">
            <TravelStats />
          </div>

          {/* Flight History Section */}
          <div className="bg-card rounded-lg border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-content-primary">Flight History</h2>
            </div>
            <FlightList />
          </div>
        </div>
      </div>
    </main>
  );
} 