'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import * as HoverCard from '@radix-ui/react-hover-card';
import * as Progress from '@radix-ui/react-progress';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Tabs from '@radix-ui/react-tabs';
import * as Popover from '@radix-ui/react-popover';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#60A5FA', '#3B82F6'];

interface MonthlySpending {
  month: string;
  amount: number;
  flights: number;
}

interface PopularRoute {
  from: string;
  to: string;
  count: number;
}

interface CurrencyTotal {
  currency: string;
  amount: number;
}

interface StatsData {
  totalFlights: number;
  totalSpent: number;
  uniqueAirports: number;
  uniqueCountries: number;
  monthlySpending: MonthlySpending[];
  popularRoutes: PopularRoute[];
  yearOverYearGrowth: number;
  budgetProgress: number;
  destinationsCount: number;
  exploredPercentage: number;
  currencyTotals: CurrencyTotal[];
}

export default function TravelStats() {
  const [stats, setStats] = useState<StatsData>({
    totalFlights: 0,
    totalSpent: 0,
    uniqueAirports: 0,
    uniqueCountries: 0,
    monthlySpending: [],
    popularRoutes: [],
    yearOverYearGrowth: 66,
    budgetProgress: 55,
    destinationsCount: 18,
    exploredPercentage: 42,
    currencyTotals: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

    const fetchStats = async () => {
    try {
      const { data: flights, error } = await supabase
        .from('vidmaflights')
        .select('*')
        .order('departure_date', { ascending: true });

      if (error) throw error;

      // Process flights data
      const processedStats = processFlightData(flights || []);
      setStats(processedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Tabs.Root defaultValue="overview" className="space-y-8">
      <Tabs.List className="flex space-x-4 mb-6 border-b border-white/10">
        <Tabs.Trigger 
          value="overview"
          className="px-4 py-2 text-sm font-medium text-content-secondary data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
        >
          Overview
        </Tabs.Trigger>
        <Tabs.Trigger 
          value="details"
          className="px-4 py-2 text-sm font-medium text-content-secondary data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent"
        >
          Detailed Stats
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview" className="space-y-8">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Flights Card */}
          <HoverCard.Root>
            <HoverCard.Trigger asChild>
              <div className="bg-card rounded-xl p-6 border border-white/10 transition-colors hover:border-accent/20 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                      </svg>
                      <span className="text-sm font-medium text-content-secondary">Total Flights</span>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-content-primary">{stats.totalFlights}</span>
                      <span className="ml-2 text-sm text-accent">+{stats.yearOverYearGrowth}% from last year</span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content 
                className="bg-card p-4 rounded-lg border border-white/10 shadow-xl w-64"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-content-primary">Flight Growth</h4>
                  <Progress.Root 
                    className="h-2 bg-white/5 rounded-full overflow-hidden relative"
                    value={stats.yearOverYearGrowth}
                  >
                    <Progress.Indicator 
                      className="bg-accent h-full transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${100 - stats.yearOverYearGrowth}%)` }}
                    />
                  </Progress.Root>
                  <p className="text-sm text-content-secondary">
                    Your flight activity has increased significantly compared to last year
                  </p>
                </div>
                <HoverCard.Arrow className="fill-white/10" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>

          {/* Total Spent Card */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <div className="bg-card rounded-xl p-6 border border-white/10 transition-colors hover:border-accent/20 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-content-secondary">Total Spent</span>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-content-primary">
                        €{stats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress.Root 
                        className="h-1.5 bg-white/5 rounded-full overflow-hidden relative w-full"
                        value={stats.budgetProgress}
                      >
                        <Progress.Indicator 
                          className="bg-accent h-full transition-transform duration-500 ease-out"
                          style={{ transform: `translateX(-${100 - stats.budgetProgress}%)` }}
                        />
                      </Progress.Root>
                      <span className="text-xs text-content-secondary mt-1 inline-block">
                        {stats.budgetProgress}% of budget used
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content 
                className="bg-card p-5 rounded-lg border border-white/10 shadow-xl w-80 z-50"
                sideOffset={5}
                align="end"
                side="bottom"
              >
      <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h4 className="font-medium text-content-primary">Spending Breakdown</h4>
                    <Popover.Close className="rounded-full p-1 hover:bg-white/5 text-content-secondary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Popover.Close>
                  </div>
                  <div className="space-y-3">
                    {stats.currencyTotals.map((total) => (
                      <div key={total.currency} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-accent/80"></div>
                          <span className="text-content-secondary">{total.currency}</span>
                        </div>
                        <span className="text-content-primary font-medium tabular-nums">
                          {total.amount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-content-secondary">Per Flight Average (EUR)</span>
                      <span className="text-content-primary font-medium tabular-nums">
                        €{(stats.totalSpent / stats.totalFlights).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Popover.Arrow className="fill-white/10" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Airports Card */}
          <HoverCard.Root>
            <HoverCard.Trigger asChild>
              <div className="bg-card rounded-xl p-6 border border-white/10 transition-colors hover:border-accent/20 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-content-secondary">Airports</span>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-content-primary">{stats.uniqueAirports}</span>
                      <span className="ml-2 text-sm text-accent">{stats.destinationsCount} destinations</span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content 
                className="bg-card p-4 rounded-lg border border-white/10 shadow-xl w-64"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-content-primary">Airport Information</h4>
                  <p className="text-content-secondary">
                    You've visited {stats.uniqueAirports} unique airports across {stats.destinationsCount} destinations.
                  </p>
                </div>
                <HoverCard.Arrow className="fill-white/10" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>

          {/* Countries Card */}
          <HoverCard.Root>
            <HoverCard.Trigger asChild>
              <div className="bg-card rounded-xl p-6 border border-white/10 transition-colors hover:border-accent/20 cursor-pointer">
                <div className="flex items-start justify-between">
        <div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                      <span className="text-sm font-medium text-content-secondary">Countries</span>
                    </div>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold text-content-primary">{stats.uniqueCountries}</span>
                      <span className="ml-2 text-sm text-accent">{stats.exploredPercentage}% explored</span>
                    </div>
                  </div>
                </div>
              </div>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content 
                className="bg-card p-4 rounded-lg border border-white/10 shadow-xl w-64"
                sideOffset={5}
              >
                <div className="space-y-2">
                  <h4 className="font-medium text-content-primary">Country Exploration</h4>
                  <p className="text-content-secondary">
                    You've explored {stats.uniqueCountries} countries, covering {stats.exploredPercentage}% of the world.
                  </p>
                </div>
                <HoverCard.Arrow className="fill-white/10" />
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Tooltip.Provider>
            {/* Monthly Spending Chart */}
            <div className="bg-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-content-primary">Monthly Spending</h3>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content 
                      className="bg-card px-3 py-2 rounded-lg border border-white/10 shadow-xl text-sm text-content-secondary"
                      sideOffset={5}
                    >
                      View your monthly spending and flight frequency trends
                      <Tooltip.Arrow className="fill-white/10" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: stats.monthlySpending.map(m => m.month),
                    datasets: [
                      {
                        label: 'Spent',
                        data: stats.monthlySpending.map(m => m.amount),
                        backgroundColor: COLORS[0],
                        borderRadius: 6,
                      },
                      {
                        label: 'Flights',
                        data: stats.monthlySpending.map(m => m.flights),
                        backgroundColor: COLORS[2],
                        borderRadius: 6,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255, 255, 255, 0.05)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)',
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.6)',
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.8)',
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
        </div>

            {/* Popular Routes Chart */}
            <div className="bg-card rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-content-primary">Popular Routes</h3>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-content-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content 
                      className="bg-card px-3 py-2 rounded-lg border border-white/10 shadow-xl text-sm text-content-secondary"
                      sideOffset={5}
                    >
                      Your most frequently traveled flight routes
                      <Tooltip.Arrow className="fill-white/10" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>
              <div className="h-[300px] flex items-center">
                <Pie
                  data={{
                    labels: stats.popularRoutes.map(r => `${r.from} → ${r.to}`),
                    datasets: [{
                      data: stats.popularRoutes.map(r => r.count),
                      backgroundColor: COLORS,
                      borderWidth: 0
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.8)',
                          padding: 20,
                          font: {
                            size: 12
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </Tooltip.Provider>
        </div>
      </Tabs.Content>

      <Tabs.Content value="details" className="space-y-8">
        {/* Additional detailed statistics can be added here */}
        <div className="bg-card rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-medium text-content-primary mb-4">Detailed Statistics</h3>
          <div className="space-y-4">
            {stats.popularRoutes.map((route, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-content-primary">{route.from} → {route.to}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-content-secondary">{route.count} flights</span>
                  <Progress.Root 
                    className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden relative"
                    value={(route.count / stats.totalFlights) * 100}
                  >
                    <Progress.Indicator 
                      className="bg-accent h-full transition-transform duration-500 ease-out"
                      style={{ 
                        transform: `translateX(-${100 - (route.count / stats.totalFlights) * 100}%)`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </Progress.Root>
                </div>
              </div>
            ))}
      </div>
    </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}

function processFlightData(flights: any[]) {
  // Calculate stats from flights data
  const totalFlights = flights.length;
  
  // Process currency totals
  const currencyTotals = flights.reduce((acc, flight) => {
    const amount = parseFloat(flight.total_receipt.replace(/[^0-9.-]+/g, ''));
    const currencyMatch = flight.total_receipt.match(/[A-Z]{3}/);
    const currency = currencyMatch ? currencyMatch[0] : 'EUR';
    
    const existingTotal = acc.find((t: CurrencyTotal) => t.currency === currency);
    if (existingTotal) {
      existingTotal.amount += amount;
    } else {
      acc.push({ currency, amount });
    }
    return acc;
  }, [] as CurrencyTotal[]);

  // Sort currency totals by amount in descending order
  currencyTotals.sort((a: CurrencyTotal, b: CurrencyTotal) => b.amount - a.amount);
  
  const totalSpent = currencyTotals.reduce((sum: number, curr: CurrencyTotal) => {
    if (curr.currency === 'EUR') return sum + curr.amount;
    return sum;
  }, 0);
  
  // Get unique airports and countries
  const airports = new Set(flights.flatMap(f => [f.departure_airport, f.arrival_airport]));
  const countries = new Set(flights.flatMap(f => [f.departure_country, f.arrival_country]));

  // Process monthly spending
  const monthlySpending = processMonthlySpending(flights);

  // Process popular routes
  const popularRoutes = processPopularRoutes(flights);

  return {
    totalFlights,
    totalSpent,
    uniqueAirports: airports.size,
    uniqueCountries: countries.size,
    monthlySpending,
    popularRoutes,
    yearOverYearGrowth: 66,
    budgetProgress: 55,
    destinationsCount: 18,
    exploredPercentage: 42,
    currencyTotals,
  };
}

function processMonthlySpending(flights: any[]) {
  const monthlyData = flights.reduce((acc, flight) => {
    const date = formatDate(flight.purchased_date);
    const month = format(date, 'MMM yyyy');
    
    if (!acc[month]) {
      acc[month] = { amount: 0, flights: 0 };
    }
    
    acc[month].amount += parseFloat(flight.total_receipt) || 0;
    acc[month].flights += 1;
    
    return acc;
  }, {});

  return Object.entries(monthlyData)
    .map(([month, data]: [string, any]) => ({
      month,
      amount: data.amount,
      flights: data.flights
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
}

function processPopularRoutes(flights: any[]) {
  const routeCounts = flights.reduce((acc, flight) => {
    const route = `${flight.departure_airport} → ${flight.arrival_airport}`;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(routeCounts)
    .map(([route, count]: [string, any]) => {
      const [from, to] = route.split(' → ');
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
} 