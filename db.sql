-- db.sql

-- Create Tables
CREATE TABLE IF NOT EXISTS Workouts (
    workout_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_name TEXT NOT NULL UNIQUE
);

-- Updated Schema

CREATE TABLE IF NOT EXISTS Workouts (
    workout_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Days (
    day_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_id INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id) ON DELETE CASCADE,
    UNIQUE(workout_id, day_name)
);

CREATE TABLE IF NOT EXISTS Exercises (
    exercise_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    day_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    FOREIGN KEY (day_id) REFERENCES Days(day_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Workout_Log (
    workout_log_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_name TEXT NOT NULL,
    day_name TEXT NOT NULL,
    workout_date INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Weight_Log (
    weight_log_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Primary Key
    workout_log_id INTEGER NOT NULL, -- Foreign Key to Workout_Log
    logged_exercise_id INTEGER NOT NULL, -- Foreign Key to Logged_Exercises
    exercise_name TEXT NOT NULL, -- Exercise name copied from Logged_Exercises for better redundancy
    set_number INTEGER NOT NULL, -- Which set (e.g., Set 1, Set 2)
    weight_logged REAL NOT NULL, -- Weight for that set
    reps_logged INTEGER NOT NULL, -- Reps for that set
    FOREIGN KEY (workout_log_id) REFERENCES Workout_Log(workout_log_id) ON DELETE CASCADE,
    FOREIGN KEY (logged_exercise_id) REFERENCES Logged_Exercises(logged_exercise_id),
    UNIQUE (workout_log_id, logged_exercise_id, set_number) -- Ensure no duplicate entries for the same set
);



CREATE TABLE IF NOT EXISTS Logged_Exercises (
    logged_exercise_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_log_id INTEGER NOT NULL, -- Foreign Key to Workout_Log
    exercise_name TEXT NOT NULL, -- Store exercise name
    sets INTEGER NOT NULL, -- Store sets at the time of logging
    reps INTEGER NOT NULL, -- Store reps at the time of logging
    FOREIGN KEY (workout_log_id) REFERENCES Workout_Log(workout_log_id) ON DELETE CASCADE
);



-- Insert Data into Workouts
INSERT INTO Workouts (workout_name) VALUES 
('Strength Training'),
('Cardio Routine'),
('Flexibility Workout');

-- Insert Data into Days
INSERT INTO Days (workout_id, day_name) VALUES
((SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training'), 'Day 1'),
((SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training'), 'Day 2'),
((SELECT workout_id FROM Workouts WHERE workout_name = 'Cardio Routine'), 'Day 1'),
((SELECT workout_id FROM Workouts WHERE workout_name = 'Flexibility Workout'), 'Day 1'),
((SELECT workout_id FROM Workouts WHERE workout_name = 'Flexibility Workout'), 'Day 2');

-- Insert Data into Exercises
INSERT INTO Exercises (day_id, exercise_name, sets, reps) VALUES
((SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training')), 'Bench Press', 4, 8),
((SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training')), 'Squats', 3, 10),
((SELECT day_id FROM Days WHERE day_name = 'Day 2' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training')), 'Deadlift', 4, 6),
((SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Cardio Routine')), 'Running', 1, 0),
((SELECT day_id FROM Days WHERE day_name = 'Day 2' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Flexibility Workout')), 'Yoga', 1, 0);




-- Verification Queries
SELECT * FROM Workouts;
SELECT * FROM Days;
SELECT * FROM Exercises;
