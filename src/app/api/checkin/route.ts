import { NextResponse } from "next/server";

export type CheckEvent = {
  id: string;
  action: 'checkin' | 'checkout';
  timestamp: number;
  coords: { latitude: number; longitude: number };
};

// Simulate a database with an in-memory array (note: non-persistent)
// In production, replace this with a proper database
let checkEvents: CheckEvent[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, timestamp, coords } = body;
    
    // Validate required fields
    if (!action || !timestamp || !coords) {
      return NextResponse.json(
        { error: "Missing required fields: action, timestamp, coords" }, 
        { status: 400 }
      );
    }
    
    // Validate action type
    if (action !== 'checkin' && action !== 'checkout') {
      return NextResponse.json(
        { error: "Invalid action. Must be 'checkin' or 'checkout'" }, 
        { status: 400 }
      );
    }
    
    // Validate coordinates
    if (typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      return NextResponse.json(
        { error: "Invalid coordinates format" }, 
        { status: 400 }
      );
    }
    
    // Generate unique ID
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const event: CheckEvent = {
      id,
      action,
      timestamp: Number(timestamp),
      coords: {
        latitude: Number(coords.latitude),
        longitude: Number(coords.longitude)
      }
    };
    
    checkEvents.push(event);
    
    console.log(`Employee ${action} recorded:`, {
      id: event.id,
      action: event.action,
      time: new Date(event.timestamp).toLocaleString(),
      location: `${event.coords.latitude.toFixed(6)}, ${event.coords.longitude.toFixed(6)}`
    });
    
    return NextResponse.json({ 
      message: `Successfully recorded ${action}`, 
      event: {
        id: event.id,
        action: event.action,
        timestamp: event.timestamp,
        time: new Date(event.timestamp).toLocaleString(),
        coords: event.coords
      }
    });
    
  } catch (error) {
    console.error("Error in checkin endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      events: checkEvents,
      count: checkEvents.length 
    });
  } catch (error) {
    console.error("Error retrieving check events:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// Export the checkEvents for use in other API routes
export { checkEvents };
