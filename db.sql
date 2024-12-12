CREATE TABLE IF NOT EXISTS Workouts (
    workout_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_name TEXT NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS Days (
    day_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_id INTEGER NOT NULL,
    day_name TEXT NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id),
    UNIQUE(workout_id, day_name)
);

CREATE TABLE IF NOT EXISTS Exercises (
    exercise_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    day_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    FOREIGN KEY (day_id) REFERENCES Days(day_id)
);

CREATE TABLE IF NOT EXISTS Workout_Log (
    workout_log_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    day_id INTEGER NOT NULL,
    workout_date INTEGER NOT NULL,
    FOREIGN KEY (day_id) REFERENCES     Days(day_id)
);

CREATE TABLE IF NOT EXISTS Exercise_Log (
    exercise_log_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    workout_log_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight_logged REAL NOT NULL,
    FOREIGN KEY (workout_log_id) REFERENCES Workout_Log(workout_log_id),
    FOREIGN KEY (exercise_id) REFERENCES Exercises(exercise_id),
    UNIQUE(workout_log_id, exercise_id, set_number)
);

-- Insert Data into Workouts
INSERT INTO Workouts (workout_name)
VALUES ('Strength Training');

-- Insert Data into Days
INSERT INTO Days (workout_id, day_name)
VALUES (
    (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training'),
    'Day 1'
);

-- Insert Data into Exercises
INSERT INTO Exercises (day_id, exercise_name, sets, reps)
VALUES (
    (SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training')),
    'Bench Press', 4, 8
);

-- Insert Data into Workout_Log
INSERT INTO Workout_Log (day_id, workout_date)
VALUES (
    (SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training')),
    strftime('%s', '2024-12-12') -- Replace '2024-12-12' with the actual date
);

-- Insert Data into Exercise_Log
INSERT INTO Exercise_Log (workout_log_id, exercise_id, set_number, weight_logged)
VALUES (
    (SELECT workout_log_id FROM Workout_Log WHERE day_id = (SELECT day_id FROM Days WHERE day_name = 'Day 1' AND workout_id = (SELECT workout_id FROM Workouts WHERE workout_name = 'Strength Training'))),
    (SELECT exercise_id FROM Exercises WHERE exercise_name = 'Bench Press' AND day_id = (SELECT day_id FROM Days WHERE day_name = 'Day 1')),
    1, -- Replace with the set number
    100.0 -- Replace with the weight logged
);