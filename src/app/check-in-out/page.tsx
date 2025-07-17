"use client";

import React, { useState, useEffect } from "react";
import { getCurrentLocation, type Coordinates } from "@/lib/geolocation";

interface CheckEvent {
  id: string;
  action: 'checkin' | 'checkout';
  timestamp: number;
  time: string;
  coords: Coordinates;
}

export default function CheckInOutPage() {
  const [status, setStatus] = useState<string>("Ready to check in");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<CheckEvent | null>(null);
  const [recentEvents, setRecentEvents] = useState<CheckEvent[]>([]);
  const [locationInfo, setLocationInfo] = useState<string>("");

  // Load recent events on component mount
  useEffect(() => {
    loadRecentEvents();
  }, []);

  const loadRecentEvents = async () => {
    try {
      const response = await fetch("/api/checkin");
      if (response.ok) {
        const data = await response.json();
        const events = data.events || [];
        setRecentEvents(events.slice(-5).reverse()); // Show last 5 events
        
        if (events.length > 0) {
          const latest = events[events.length - 1];
          setLastEvent(latest);
          setStatus(latest.action === 'checkin' ? 'Checked in' : 'Checked out');
        }
      }
    } catch (error) {
      console.error("Error loading recent events:", error);
    }
  };

  const handleAction = async (action: "checkin" | "checkout") => {
    setLoading(true);
    setMessage("");
    setLocationInfo("");

    try {
      // Get current location
      setMessage("Getting your location...");
      const coords: Coordinates = await getCurrentLocation();
      
      setLocationInfo(`Location: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
      setMessage("Recording your check " + (action === 'checkin' ? 'in' : 'out') + "...");

      const timestamp = Date.now();

      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, timestamp, coords })
      });

      const result = await response.json();
      
      if (!response.ok) {
        setMessage(result.error || "Error processing request");
        return;
      }
      
      // Update status and last event
      setStatus(action === "checkin" ? "Checked in" : "Checked out");
      setLastEvent(result.event);
      setMessage(result.message);
      
      // Reload recent events
      await loadRecentEvents();
      
    } catch (err: any) {
      console.error("Check in/out error:", err);
      setMessage(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getNextAction = () => {
    if (!lastEvent) return 'checkin';
    return lastEvent.action === 'checkin' ? 'checkout' : 'checkin';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GPS Check In/Out
          </h1>
          <p className="text-gray-600">
            Track your work hours with GPS-verified check-ins and check-outs
          </p>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
              status.includes('Checked in') 
                ? 'bg-green-100 text-green-800' 
                : status.includes('Checked out')
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                status.includes('Checked in') 
                  ? 'bg-green-500' 
                  : status.includes('Checked out')
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
              }`}></div>
              {status}
            </div>
            
            {lastEvent && (
              <div className="text-sm text-gray-600 mb-4">
                Last {lastEvent.action}: {formatDateTime(lastEvent.timestamp).date} at {formatDateTime(lastEvent.timestamp).time}
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => handleAction("checkin")}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  getNextAction() === 'checkin'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading && getNextAction() === 'checkin' ? 'Checking In...' : 'Check In'}
              </button>
              
              <button 
                onClick={() => handleAction("checkout")}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  getNextAction() === 'checkout'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading && getNextAction() === 'checkout' ? 'Checking Out...' : 'Check Out'}
              </button>
            </div>

            {locationInfo && (
              <div className="mt-4 text-xs text-gray-500 font-mono">
                {locationInfo}
              </div>
            )}

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                message.includes('Error') || message.includes('error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : message.includes('Successfully')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {recentEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const dateTime = formatDateTime(event.timestamp);
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.action === 'checkin' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <span className="font-medium capitalize">{event.action}</span>
                        <div className="text-sm text-gray-600">
                          {dateTime.date} at {dateTime.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {event.coords.latitude.toFixed(4)}, {event.coords.longitude.toFixed(4)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to Use
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Click "Check In" when you arrive at a job location</li>
            <li>• Click "Check Out" when you finish work at that location</li>
            <li>• Your GPS location will be recorded with each check-in/out</li>
            <li>• Make sure to allow location access when prompted</li>
            <li>• View your wage calculations in the Wages section</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
