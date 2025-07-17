import { NextResponse } from "next/server";
import { calculateWages, getWorkSessions, type CheckLog } from "@/lib/wages";

// Shared in-memory storage (in production, use a database)
let checkEvents: CheckLog[] = [];

// Function to get check events from shared storage
async function getCheckEvents(): Promise<CheckLog[]> {
  // Import the checkEvents from the checkin route
  try {
    const { checkEvents: sharedEvents } = await import('../checkin/route');
    return sharedEvents || [];
  } catch (error) {
    console.log("Using local checkEvents array");
    return checkEvents;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hourlyRate, dateRange } = body;
    
    // Validate hourly rate
    if (!hourlyRate || isNaN(hourlyRate) || hourlyRate <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing hourlyRate. Must be a positive number." }, 
        { status: 400 }
      );
    }
    
    // Get all check events
    const events = await getCheckEvents();
    
    if (events.length === 0) {
      return NextResponse.json({
        wageSummary: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          totalHours: 0
        },
        workSessions: [],
        message: "No check-in/check-out events found"
      });
    }
    
    // Filter events by date range if provided
    let filteredEvents = events;
    if (dateRange && dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime();
      
      filteredEvents = events.filter(event => 
        event.timestamp >= startDate && event.timestamp <= endDate
      );
    }
    
    // Calculate wages
    const wageSummary = calculateWages(filteredEvents, Number(hourlyRate));
    const workSessions = getWorkSessions(filteredEvents);
    
    console.log("Wage calculation completed:", {
      totalEvents: events.length,
      filteredEvents: filteredEvents.length,
      hourlyRate: Number(hourlyRate),
      totalHours: wageSummary.totalHours,
      dailyWage: wageSummary.daily
    });
    
    return NextResponse.json({
      wageSummary,
      workSessions,
      summary: {
        totalEvents: filteredEvents.length,
        totalWorkSessions: workSessions.length,
        hourlyRate: Number(hourlyRate),
        calculationDate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error in wages endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error while calculating wages" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const events = await getCheckEvents();
    const workSessions = getWorkSessions(events);
    
    return NextResponse.json({
      totalEvents: events.length,
      workSessions,
      events: events.map(event => ({
        id: event.id,
        action: event.action,
        timestamp: event.timestamp,
        time: new Date(event.timestamp).toLocaleString(),
        coords: event.coords
      }))
    });
    
  } catch (error) {
    console.error("Error retrieving wage data:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
