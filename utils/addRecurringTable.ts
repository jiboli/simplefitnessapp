export const addRecurringTable = async (db: any) => {
    try {

        await db.runAsync(
          `CREATE TABLE IF NOT EXISTS Recurring_Workouts (
           recurring_workout_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            workout_id INTEGER NOT NULL,
            workout_name TEXT NOT NULL,
            day_name TEXT NOT NULL,
            recurring_start_date INTEGER NOT NULL,
            recurring_interval INTEGER NOT NULL,
            recurring_days TEXT,
            notification_id TEXT,
            notification_enabled BOOLEAN NOT NULL,
            notification_time TEXT,
            FOREIGN KEY (workout_id) REFERENCES Workouts(workout_id) ON DELETE CASCADE,
            UNIQUE (workout_id, day_name)
          );`
        );

        console.log("tables created")
    } catch (error) {
      console.error('Database initialization error:', error);
    }

  };