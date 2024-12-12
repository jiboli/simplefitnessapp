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
    workout_log_id: number;
    day_id: number; // Foreign key to Days
    workout_date: number; // Date in ISO format (YYYY-MM-DD)
  }
  
  // Interface for the Exercise_Log table
  export interface ExerciseLog {
    exercise_log_id: number;
    workout_log_id: number; // Foreign key to Workout_Log
    exercise_id: number; // Foreign key to Exercises
    set_number: number;
    weight_logged: number;
  }
  