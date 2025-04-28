// utils/recurringWorkoutUtils.ts

import { useSQLiteContext } from 'expo-sqlite';
import { useNotifications } from './useNotifications';

// Constants
const DAY_IN_SECONDS = 86400; // 24 hours in seconds

// Interface for recurring workout data
interface RecurringWorkout {
  recurring_workout_id: number;
  workout_id: number;
  workout_name: string;
  day_name: string;
  recurring_start_date: number;
  recurring_interval: number;
  recurring_days: string | null;
  notification_enabled: number;
  notification_time: string | null;
}

interface Exercise {
  exercise_name: string;
  sets: number;
  reps: number;
}

/**
 * Check and schedule any pending recurring workouts
 * This should be called on app startup or when the user opens relevant screens
 */
export const checkAndScheduleRecurringWorkouts = async (db: any, scheduleNotification: any) => {
  try {
    // Get all recurring workouts
    const recurringWorkouts = await db.getAllAsync(
      'SELECT * FROM Recurring_Workouts'
    ) as RecurringWorkout[];

    // Current date at midnight (normalized)
    const now = new Date();
    const currentTimestamp = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    );

    // Process each recurring workout
    for (const workout of recurringWorkouts) {
      const nextOccurrence = await calculateNextOccurrence(db, workout, currentTimestamp);
      
      // Skip if next occurrence is in the past
      if (nextOccurrence <= currentTimestamp) {
        continue;
      }
      
      // Check if this occurrence is already scheduled
      const existingLog = await db.getAllAsync(
        `SELECT workout_log_id FROM Workout_Log 
         WHERE workout_date = ? AND day_name = ? AND workout_name = ?`,
        [nextOccurrence, workout.day_name, workout.workout_name]
      );
      
      // Schedule if not already scheduled
      if (existingLog.length === 0) {
        await scheduleWorkout(db, workout, nextOccurrence, scheduleNotification);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in checkAndScheduleRecurringWorkouts:', error);
    return false;
  }
};

/**
 * Calculate the next occurrence date for a recurring workout
 */
const calculateNextOccurrence = async (
  db: any, 
  workout: RecurringWorkout, 
  currentTimestamp: number
): Promise<number> => {
  try {
    // Get the last scheduled date for this workout
    const lastScheduledResults = await db.getAllAsync(
      `SELECT MAX(workout_date) as max_date FROM Workout_Log 
       WHERE workout_name = ? AND day_name = ?`,
      [workout.workout_name, workout.day_name]
    ) as Array<{ max_date: number }>;
    
    const lastScheduled = lastScheduledResults[0];
    
    // If using interval-based scheduling (daily, every N days)
    if (workout.recurring_interval > 0) {
      if (!lastScheduled.max_date) {
        // First occurrence - use start date or current date if start date is in the past
        return Math.max(workout.recurring_start_date, currentTimestamp);
      } else {
        // Calculate next occurrence based on last date + interval
        return lastScheduled.max_date + (workout.recurring_interval * DAY_IN_SECONDS);
      }
    } 
    // If using day-of-week based scheduling
    else if (workout.recurring_days) {
      return findNextMatchingDay(
        workout.recurring_days, 
        lastScheduled.max_date || workout.recurring_start_date,
        currentTimestamp
      );
    }
    
    // Default fallback
    return currentTimestamp;
  } catch (error) {
    console.error('Error calculating next occurrence:', error);
    return currentTimestamp;
  }
};

/**
 * Find the next matching day based on the recurring_days pattern
 */
const findNextMatchingDay = (
  recurringDays: string, 
  lastScheduledDate: number,
  currentTimestamp: number
): number => {
  // Parse selected days (0-6, where 0 is Sunday)
  const selectedDays = recurringDays.split(',').map(day => parseInt(day, 10));
  
  if (selectedDays.length === 0) {
    return currentTimestamp;
  }
  
  // Start checking from the day after last scheduled or current date
  const startDate = Math.max(lastScheduledDate, currentTimestamp);
  let checkDate = new Date(startDate * 1000);
  checkDate.setDate(checkDate.getDate() + 1);
  
  // Look up to 7 days ahead to find the next matching day
  for (let i = 0; i < 7; i++) {
    const dayOfWeek = checkDate.getDay();
    
    if (selectedDays.includes(dayOfWeek)) {
      // Found a matching day
      return Math.floor(
        new Date(
          checkDate.getFullYear(),
          checkDate.getMonth(),
          checkDate.getDate()
        ).getTime() / 1000
      );
    }
    
    // Check the next day
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  // Fallback - should not reach here if selectedDays is valid
  return currentTimestamp;
};

/**
 * Schedule a workout in the Workout_Log table
 */
const scheduleWorkout = async (
  db: any, 
  workout: RecurringWorkout, 
  scheduledDate: number,
  scheduleNotification: any
) => {
  try {
    let notificationId = null;
    
    // Schedule notification if enabled
    if (workout.notification_enabled && workout.notification_time) {
      // Parse notification time (HH:MM format)
      const [hours, minutes] = workout.notification_time.split(':').map(Number);
      
      // Create notification time Date object
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);
      
      // Convert scheduledDate to Date object
      const workoutDate = new Date(scheduledDate * 1000);
      
      // Schedule the notification
      notificationId = await scheduleNotification({
        workoutName: workout.workout_name,
        dayName: workout.day_name,
        scheduledDate: workoutDate,
        notificationTime: notificationTime
      });
    }
    
    // Add the workout to the log
    const { lastInsertRowId: workoutLogId } = await db.runAsync(
      'INSERT INTO Workout_Log (workout_date, day_name, workout_name, notification_id) VALUES (?, ?, ?, ?);',
      [scheduledDate, workout.day_name, workout.workout_name, notificationId]
    );
    
    // Get exercises for this day
    const dayId = await getDayId(db, workout.workout_id, workout.day_name);
    if (!dayId) {
      throw new Error('Day not found');
    }
    
    // Fetch all exercises associated with the selected day
    const exercises = await db.getAllAsync(
      'SELECT exercise_name, sets, reps FROM Exercises WHERE day_id = ?;',
      [dayId]
    ) as Exercise[];
    
    // Insert exercises into the Logged_Exercises table
    const insertExercisePromises = exercises.map((exercise: Exercise) =>
      db.runAsync(
        'INSERT INTO Logged_Exercises (workout_log_id, exercise_name, sets, reps) VALUES (?, ?, ?, ?);',
        [workoutLogId, exercise.exercise_name, exercise.sets, exercise.reps]
      )
    );
    
    await Promise.all(insertExercisePromises);
    return true;
  } catch (error) {
    console.error('Error scheduling workout:', error);
    return false;
  }
};

/**
 * Get the day_id for a workout day
 */
const getDayId = async (db: any, workoutId: number, dayName: string): Promise<number | null> => {
  try {
    const results = await db.getAllAsync(
      'SELECT day_id FROM Days WHERE workout_id = ? AND day_name = ?',
      [workoutId, dayName]
    ) as Array<{ day_id: number }>;
    
    const result = results[0];
    return result ? result.day_id : null;
  } catch (error) {
    console.error('Error getting day ID:', error);
    return null;
  }
};

/**
 * Custom hook to use recurring workout utilities
 */
export const useRecurringWorkouts = () => {
  const db = useSQLiteContext();
  const { scheduleNotification } = useNotifications();
  
  // Check and schedule recurring workouts
  const checkRecurringWorkouts = async () => {
    return await checkAndScheduleRecurringWorkouts(db, scheduleNotification);
  };
  
  // Create a new recurring workout
  const createRecurringWorkout = async (data: {
    workout_id: number;
    workout_name: string;
    day_name: string;
    recurring_interval: number;
    recurring_days?: string;
    notification_enabled?: boolean;
    notification_time?: string;
  }) => {
    try {
      const startDate = Math.floor(new Date().getTime() / 1000);
      
      await db.runAsync(
        `INSERT INTO Recurring_Workouts (
          workout_id, workout_name, day_name, recurring_start_date, 
          recurring_interval, recurring_days, notification_enabled, notification_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          data.workout_id,
          data.workout_name,
          data.day_name,
          startDate,
          data.recurring_interval,
          data.recurring_days || null,
          data.notification_enabled ? 1 : 0,
          data.notification_time || null
        ]
      );
      
      // Immediately check if we should schedule the first occurrence
      await checkRecurringWorkouts();
      
      return true;
    } catch (error) {
      console.error('Error creating recurring workout:', error);
      return false;
    }
  };
  
  // Update an existing recurring workout
  const updateRecurringWorkout = async (
    recurringWorkoutId: number,
    updates: {
      recurring_interval?: number;
      recurring_days?: string;
      notification_enabled?: boolean;
      notification_time?: string;
    }
  ) => {
    try {
      // Build the update query dynamically based on provided fields
      let updateFields = [];
      let params = [];
      
      if (updates.recurring_interval !== undefined) {
        updateFields.push('recurring_interval = ?');
        params.push(updates.recurring_interval);
      }
      
      if (updates.recurring_days !== undefined) {
        updateFields.push('recurring_days = ?');
        params.push(updates.recurring_days);
      }
      
      if (updates.notification_enabled !== undefined) {
        updateFields.push('notification_enabled = ?');
        params.push(updates.notification_enabled ? 1 : 0);
      }
      
      if (updates.notification_time !== undefined) {
        updateFields.push('notification_time = ?');
        params.push(updates.notification_time);
      }
      
      if (updateFields.length === 0) {
        return false; // Nothing to update
      }
      
      // Add the recurring workout ID to params
      params.push(recurringWorkoutId);
      
      await db.runAsync(
        `UPDATE Recurring_Workouts SET ${updateFields.join(', ')} WHERE recurring_workout_id = ?;`,
        params
      );
      
      return true;
    } catch (error) {
      console.error('Error updating recurring workout:', error);
      return false;
    }
  };
  
  // Delete a recurring workout
  const deleteRecurringWorkout = async (recurringWorkoutId: number) => {
    try {
      await db.runAsync(
        'DELETE FROM Recurring_Workouts WHERE recurring_workout_id = ?;',
        [recurringWorkoutId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting recurring workout:', error);
      return false;
    }
  };
  
  // Get all recurring workouts
  const getAllRecurringWorkouts = async () => {
    try {
      return await db.getAllAsync(
        'SELECT * FROM Recurring_Workouts ORDER BY workout_name, day_name;'
      ) as RecurringWorkout[];
    } catch (error) {
      console.error('Error fetching recurring workouts:', error);
      return [];
    }
  };
  
  return {
    checkRecurringWorkouts,
    createRecurringWorkout,
    updateRecurringWorkout,
    deleteRecurringWorkout,
    getAllRecurringWorkouts
  };
};