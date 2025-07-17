"use client";

import React, { useState, useEffect } from "react";

interface WageSummary {
  daily: number;
  weekly: number;
  monthly: number;
  totalHours: number;
}

interface WorkSession {
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  location: { latitude: number; longitude: number };
}

interface WageData {
  wageSummary: WageSummary;
  workSessions: WorkSession[];
  summary?: {
    totalEvents: number;
    totalWorkSessions: number;
    hourlyRate: number;
    calculationDate: string;
  };
}

export default function WagesPage() {
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [wageData, setWageData] = useState<WageData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [totalEvents, setTotalEvents] = useState<number>(0);

  // Load initial data
  useEffect(() => {
    loadEventsSummary();
  }, []);

  const loadEventsSummary = async () => {
    try {
      const response = await fetch("/api/wages");
      if (response.ok) {
        const data = await response.json();
        setTotalEvents(data.totalEvents || 0);
      }
    } catch (error) {
      console.error("Error loading events summary:", error);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError("");
    setWageData(null);

    try {
      const response = await fetch("/api/wages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hourlyRate })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Could not calculate wages");
        return;
      }

      setWageData(data);
      
    } catch (err: any) {
      console.error("Wage calculation error:", err);
      setError(err.message || "An error occurred while calculating wages");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatLocation = (location: { latitude: number; longitude: number }) => {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wage Calculator
          </h1>
          <p className="text-gray-600">
            Calculate your earnings based on recorded work hours
          </p>
        </div>

        {/* Calculation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.50"
                  placeholder="25.00"
                />
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              disabled={loading || hourlyRate <= 0}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                loading || hourlyRate <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Calculating...' : 'Calculate Wages'}
            </button>

            {totalEvents > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Found {totalEvents} check-in/out events
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 text-center">{error}</div>
          </div>
        )}

        {/* Wage Summary */}
        {wageData && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {wageData.wageSummary.totalHours.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(wageData.wageSummary.daily)}
                </div>
                <div className="text-sm text-gray-600">Daily Average</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(wageData.wageSummary.weekly)}
                </div>
                <div className="text-sm text-gray-600">Weekly Estimate</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {formatCurrency(wageData.wageSummary.monthly)}
                </div>
                <div className="text-sm text-gray-600">Monthly Estimate</div>
              </div>
            </div>

            {/* Calculation Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Calculation Details
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Hourly Rate</div>
                  <div className="text-lg font-semibold">{formatCurrency(wageData.summary?.hourlyRate || hourlyRate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Work Sessions</div>
                  <div className="text-lg font-semibold">{wageData.summary?.totalWorkSessions || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Events</div>
                  <div className="text-lg font-semibold">{wageData.summary?.totalEvents || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Calculated On</div>
                  <div className="text-lg font-semibold">
                    {wageData.summary?.calculationDate ? new Date(wageData.summary.calculationDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Work Sessions */}
            {wageData.workSessions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Work Sessions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Check In</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Check Out</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Hours</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Earnings</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wageData.workSessions.map((session, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{session.date}</td>
                          <td className="py-3 px-4">{session.checkIn}</td>
                          <td className="py-3 px-4">{session.checkOut}</td>
                          <td className="py-3 px-4 font-medium">{session.hours.toFixed(2)}</td>
                          <td className="py-3 px-4 font-medium text-green-600">
                            {formatCurrency(session.hours * (wageData.summary?.hourlyRate || hourlyRate))}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-gray-500">
                            {formatLocation(session.location)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Data Message */}
        {wageData && wageData.workSessions.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              No Work Sessions Found
            </h3>
            <p className="text-yellow-700">
              You need to have check-in and check-out pairs to calculate wages. 
              Visit the Check In/Out page to record your work hours.
            </p>
            <a 
              href="/check-in-out"
              className="inline-block mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Go to Check In/Out
            </a>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How Wages Are Calculated
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Daily wages are calculated based on your average daily work hours</li>
            <li>• Weekly estimates assume 5 working days per week</li>
            <li>• Monthly estimates assume 22 working days per month</li>
            <li>• Only complete check-in/check-out pairs are counted as work sessions</li>
            <li>• GPS locations are recorded for verification purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
