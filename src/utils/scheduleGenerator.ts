export interface SchedulePreferences {
  subjectIds: string[];
  startDate?: Date;
  endDate?: Date;
  dailyStudyHours?: number;
  preferredStartTime?: string;
  daysPerWeek?: number[];
}

export interface GeneratedScheduleEntry {
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  duration: number;
}

/**
 * Generate a weekly study schedule based on selected subjects and preferences
 */
export const generateSchedule = (
  preferences: SchedulePreferences
): GeneratedScheduleEntry[] => {
  const {
    subjectIds,
    dailyStudyHours = 2,
    preferredStartTime = '09:00',
    daysPerWeek = [0, 1, 2, 3, 4, 5, 6], // All days by default
  } = preferences;

  if (!subjectIds || subjectIds.length === 0) {
    throw new Error('At least one subject must be selected');
  }

  const schedule: GeneratedScheduleEntry[] = [];
  const totalSubjects = subjectIds.length;
  
  // Calculate time allocation per subject per day
  const minutesPerDay = dailyStudyHours * 60;
  const minutesPerSubject = Math.floor(minutesPerDay / totalSubjects);
  
  // Ensure minimum 15 minutes per subject
  if (minutesPerSubject < 15) {
    throw new Error('Too many subjects for the available study time. Please reduce subjects or increase daily study hours.');
  }

  // Distribute subjects across the week
  let subjectIndex = 0;
  
  for (const dayOfWeek of daysPerWeek) {
    let currentTime = parseTime(preferredStartTime);
    
    // Assign subjects to this day
    const subjectsForDay = Math.ceil(totalSubjects / daysPerWeek.length);
    
    for (let i = 0; i < subjectsForDay && subjectIndex < totalSubjects; i++) {
      const subjectId = subjectIds[subjectIndex];
      const startTime = formatTime(currentTime);
      
      // Add duration
      currentTime += minutesPerSubject;
      const endTime = formatTime(currentTime);
      
      schedule.push({
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        duration: minutesPerSubject,
      });
      
      subjectIndex++;
      
      // Reset for next week if we've assigned all subjects
      if (subjectIndex >= totalSubjects) {
        subjectIndex = 0;
      }
    }
  }

  return schedule;
};

/**
 * Generate a balanced schedule that distributes subjects evenly across the week
 */
export const generateBalancedSchedule = (
  preferences: SchedulePreferences
): GeneratedScheduleEntry[] => {
  const {
    subjectIds,
    dailyStudyHours = 2,
    preferredStartTime = '09:00',
    daysPerWeek = [1, 2, 3, 4, 5], // Weekdays by default
  } = preferences;

  if (!subjectIds || subjectIds.length === 0) {
    throw new Error('At least one subject must be selected');
  }

  const schedule: GeneratedScheduleEntry[] = [];
  const totalSubjects = subjectIds.length;
  const totalDays = daysPerWeek.length;
  
  // Calculate sessions per subject per week
  const sessionsPerSubject = Math.max(1, Math.floor(totalDays / totalSubjects));
  const minutesPerSession = Math.floor((dailyStudyHours * 60) / Math.ceil(totalSubjects / totalDays));
  
  // Ensure minimum 30 minutes per session
  const sessionDuration = Math.max(30, minutesPerSession);

  let dayIndex = 0;
  
  // Assign each subject to multiple days
  for (const subjectId of subjectIds) {
    for (let session = 0; session < sessionsPerSubject; session++) {
      if (dayIndex >= totalDays) {
        dayIndex = 0; // Wrap around
      }
      
      const dayOfWeek = daysPerWeek[dayIndex];
      const startTime = preferredStartTime;
      const endTime = addMinutesToTime(startTime, sessionDuration);
      
      schedule.push({
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        duration: sessionDuration,
      });
      
      dayIndex++;
    }
  }

  // Sort by day and time
  schedule.sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek;
    }
    return a.startTime.localeCompare(b.startTime);
  });

  return schedule;
};

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Format minutes since midnight to time string (HH:MM)
 */
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Add minutes to a time string
 */
const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  const totalMinutes = parseTime(timeStr) + minutesToAdd;
  return formatTime(totalMinutes);
};

/**
 * Validate schedule for conflicts
 */
export const validateSchedule = (
  schedule: GeneratedScheduleEntry[]
): { valid: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  
  // Group by day
  const scheduleByDay: { [key: number]: GeneratedScheduleEntry[] } = {};
  
  for (const entry of schedule) {
    if (!scheduleByDay[entry.dayOfWeek]) {
      scheduleByDay[entry.dayOfWeek] = [];
    }
    scheduleByDay[entry.dayOfWeek].push(entry);
  }
  
  // Check for time conflicts within each day
  for (const [day, entries] of Object.entries(scheduleByDay)) {
    const sortedEntries = entries.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = sortedEntries[i];
      const next = sortedEntries[i + 1];
      
      if (current.endTime > next.startTime) {
        conflicts.push(
          `Time conflict on day ${day}: ${current.startTime}-${current.endTime} overlaps with ${next.startTime}-${next.endTime}`
        );
      }
    }
  }
  
  return {
    valid: conflicts.length === 0,
    conflicts,
  };
};
