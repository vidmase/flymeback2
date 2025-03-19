'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Flight } from '@/types/flights';
import { formatDate } from '@/lib/utils';

const formatDisplayDate = (dateStr: string) => {
  try {
    const date = formatDate(dateStr);
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr;
  }
};

const CURRENCY_SYMBOLS: { [key: string]: string } = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  JPY: '¥',
  // Add more currencies as needed
};

// Reverse mapping from symbol to currency code
const SYMBOL_TO_CURRENCY: { [key: string]: string } = {
  '€': 'EUR',
  '£': 'GBP',
  '$': 'USD',
  '¥': 'JPY',
};

const detectCurrencyFromAmount = (amount: string): string => {
  const firstChar = amount.charAt(0);
  return SYMBOL_TO_CURRENCY[firstChar] || 'EUR';
};

const formatCurrency = (amount: number | string, currency = 'EUR') => {
  const numericAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
    : amount;
    
  if (Number.isNaN(numericAmount)) return amount;
  
  const value = numericAmount.toFixed(2);
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  
  // Handle special cases
  if (currency === 'JPY') return `${symbol}${Math.round(numericAmount)}`; // JPY doesn't use decimals
  
  return `${symbol}${value} ${currency}`;
};

// Component to display amount with currency and tooltip
const CurrencyDisplay = ({ amount }: { amount: string; currency?: string }) => {
  // Extract numeric part and currency from the amount string
  const numericPart = amount.replace(/[^0-9.-]+/g, '');
  const currencyMatch = amount.match(/[A-Z]{3}/);
  const currencyCode = currencyMatch ? currencyMatch[0] : '';
  
  return (
    <div className="text-lg font-bold text-accent">
      {numericPart} {currencyCode}
    </div>
  );
};

const ITEMS_PER_PAGE = 4;

export default function FlightList() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
      const { data, error } = await supabase
        .from('vidmaflights')
        .select('*')
        .order('departure_date', { ascending: false });

        if (error) throw error;
        setFlights(data || []);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  // Calculate pagination values
  const totalPages = Math.ceil(flights.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFlights = flights.slice(startIndex, endIndex);

  // Pagination controls
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-accent/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-t-accent rounded-full animate-spin"></div>
          </div>
          <p className="text-content-secondary">Loading your flight history...</p>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-content-secondary">
        <svg className="w-16 h-16 mb-4 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">No flights found</p>
        <p className="text-content-tertiary mt-1">Start adding your travel history</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentFlights.map((flight) => (
          <div 
            key={flight.id}
            className="relative bg-card rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            {/* Ticket Header - Airline Strip */}
            <div className="bg-accent/10 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl font-bold text-accent">{flight.flight_number}</span>
                </div>
                <div className="text-right">
                  <CurrencyDisplay 
                    amount={flight.total_receipt} 
                    currency={flight.currency || 'EUR'}
                  />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute left-0 right-0 h-px border-t border-dashed border-white/20"></div>
              <div className="absolute -left-2 -ml-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
              <div className="absolute -right-2 -mr-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
            </div>

            {/* Main Ticket Content */}
            <div className="px-6 py-4">
              {/* Route Section */}
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-content-primary">{flight.departure_airport}</div>
                  <div className="text-sm text-content-secondary mt-1">{flight.departure_time}</div>
                </div>
                
                <div className="flex-1 px-4 flex items-center justify-center">
                  <div className="relative w-full flex items-center justify-center">
                    <div className="absolute w-full border-t border-dashed border-accent/30"></div>
                    <div className="relative bg-card px-2">
                      <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-content-primary">{flight.arrival_airport}</div>
                  <div className="text-sm text-content-secondary mt-1">{flight.arrival_time}</div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute left-0 right-0 h-px border-t border-dashed border-white/20"></div>
              <div className="absolute -left-2 -ml-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
              <div className="absolute -right-2 -mr-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
            </div>

            {/* Passenger Info */}
            <div className="px-6 py-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-content-tertiary uppercase tracking-wider">Passenger</div>
                  <div className="text-sm text-content-primary mt-1">{flight.passenger_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-content-tertiary uppercase tracking-wider">Reservation</div>
                  <div className="text-sm text-content-primary mt-1">#{flight.reservation_number}</div>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute left-0 right-0 h-px border-t border-dashed border-white/20"></div>
              <div className="absolute -left-2 -ml-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
              <div className="absolute -right-2 -mr-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-background"></div>
            </div>

            {/* Flight Details */}
            <div className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-content-tertiary uppercase tracking-wider">Date</div>
                  <div className="text-sm text-content-primary mt-1">{formatDisplayDate(flight.departure_date)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-content-tertiary uppercase tracking-wider">Purchased</div>
                  <div className="text-sm text-content-primary mt-1">{flight.purchase_time}</div>
                </div>
              </div>
            </div>

            {/* Ticket Stub */}
            <div className="absolute right-0 top-0 h-full w-8 bg-accent/5 flex items-center justify-center border-l border-dashed border-white/20">
              <div className="transform -rotate-90 whitespace-nowrap text-xs text-content-secondary tracking-wider">
                BOARDING PASS
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-center space-x-2 pt-4 border-t border-white/10">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-card border border-white/10 text-content-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                currentPage === page
                  ? 'bg-accent text-white'
                  : 'bg-card border border-white/10 text-content-secondary hover:text-accent'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-card border border-white/10 text-content-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
} 