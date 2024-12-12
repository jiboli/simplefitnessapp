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
    workout_date DATE NOT NULL,
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

