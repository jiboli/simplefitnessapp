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

CREATE TABLE IF NOT EXISTS Exercise_Log (
    exercise_log_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_log_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight_logged REAL NOT NULL,
    reps INTEGER NOT NULL,
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
