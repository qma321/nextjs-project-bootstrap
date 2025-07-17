export type CheckLog = {
  id: string;
  action: 'checkin' | 'checkout';
  timestamp: number; // Unix timestamp
  coords: { latitude: number; longitude: number };
};

export interface WageSummary {
  daily: number;
  weekly: number;
  monthly: number;
  totalHours: number;
}

/**
 * Calculate wages based on check-in/check-out logs
 * Pairs checkin and checkout events to calculate worked hours
 */
export function calculateWages(logs: CheckLog[], hourlyRate: number): WageSummary {
  let totalWorkedHours = 0;
  const workSessions: { start: number; end: number; hours: number }[] = [];
  
  // Sort logs by timestamp to ensure proper pairing
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  
  // Group logs by day and calculate work sessions
  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const current = sortedLogs[i];
    const next = sortedLogs[i + 1];
    
    // If we have a checkin followed by a checkout, calculate the work session
    if (current.action === 'checkin' && next.action === 'checkout') {
      const workedMs = next.timestamp - current.timestamp;
      const workedHours = workedMs / (1000 * 60 * 60); // Convert to hours
      
      workSessions.push({
        start: current.timestamp,
        end: next.timestamp,
        hours: workedHours
      });
      
      totalWorkedHours += workedHours;
      i++; // Skip the next log since we've processed the pair
    }
  }
  
  // Calculate daily average (based on actual work sessions)
  const uniqueDays = new Set(
    workSessions.map(session => 
      new Date(session.start).toDateString()
    )
  ).size;
  
  const dailyAverage = uniqueDays > 0 ? totalWorkedHours / uniqueDays : 0;
  
  // Calculate wages
  const dailyWage = dailyAverage * hourlyRate;
  const weeklyWage = dailyWage * 5; // Assuming 5 working days per week
  const monthlyWage = dailyWage * 22; // Assuming 22 working days per month
  
  return {
    daily: Math.round(dailyWage * 100) / 100, // Round to 2 decimal places
    weekly: Math.round(weeklyWage * 100) / 100,
    monthly: Math.round(monthlyWage * 100) / 100,
    totalHours: Math.round(totalWorkedHours * 100) / 100
  };
}

/**
 * Get work sessions from logs for detailed reporting
 */
export function getWorkSessions(logs: CheckLog[]): Array<{
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  location: { latitude: number; longitude: number };
}> {
  const sessions: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    hours: number;
    location: { latitude: number; longitude: number };
  }> = [];
  
  const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp);
  
  for (let i = 0; i < sortedLogs.length - 1; i++) {
    const current = sortedLogs[i];
    const next = sortedLogs[i + 1];
    
    if (current.action === 'checkin' && next.action === 'checkout') {
      const workedMs = next.timestamp - current.timestamp;
      const workedHours = workedMs / (1000 * 60 * 60);
      
      sessions.push({
        date: new Date(current.timestamp).toLocaleDateString(),
        checkIn: new Date(current.timestamp).toLocaleTimeString(),
        checkOut: new Date(next.timestamp).toLocaleTimeString(),
        hours: Math.round(workedHours * 100) / 100,
        location: current.coords
      });
      
      i++; // Skip the next log
    }
  }
  
  return sessions;
}
