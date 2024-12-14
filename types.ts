// types.ts

// Interface for the Workouts table
export interface Workout {
    workout_id: number;
    workout_name: string;
  }
  
  // Interface for the Days table
  export interface Day {
    day_id: number;
    workout_id: number; // Foreign key to Workouts
    day_name: string; // Unique per workout
  }
  
  // Interface for the Exercises table
  export interface Exercise {
    exercise_id: number;
    day_id: number; // Foreign key to Days
    exercise_name: string;
    sets: number;
    reps: number;
  }
  
// Interface for the Workout_Log table
export interface WorkoutLog {
  workout_log_id: number; // Primary Key
  workout_date: number; // Date of the workout (in seconds as UNIX timestamp)
  day_name: string; // Day name (copied at the time of logging)
  workout_name: string; // Workout name (copied at the time of logging)
}

// Interface for the Exercise_Log table
export interface ExerciseLog {
  exercise_log_id: number; // Primary Key
  workout_log_id: number; // Foreign Key to Workout_Log
  exercise_name: string; // Exercise name (copied at the time of logging)
  set_number: number; // Set number (e.g., 1st set, 2nd set, etc.)
  weight_logged: number; // Weight logged for the set
  reps: number; // Reps performed for the set
}


  