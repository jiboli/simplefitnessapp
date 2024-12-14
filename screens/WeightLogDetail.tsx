import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function WeightLogDetail() {
  const route = useRoute();
  const db = useSQLiteContext();
  const { workoutName } = route.params as { workoutName: string };

  const [days, setDays] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const [logs, setLogs] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    fetchDays();
  }, []);

  const fetchDays = async () => {
    try {
      const result = await db.getAllAsync<{ day_name: string }>(
        `SELECT DISTINCT Workout_Log.day_name 
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id
         WHERE Workout_Log.workout_name = ?;`,
        [workoutName]
      );

      const uniqueDays = result.map((row) => row.day_name);
      setDays(uniqueDays);
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const fetchLogsForDay = async (dayName: string) => {
    try {
      const result = await db.getAllAsync<{
        exercise_name: string;
        set_number: number;
        weight_logged: number;
        reps_logged: number;
      }>(
        `SELECT Weight_Log.exercise_name, Weight_Log.set_number, 
                Weight_Log.weight_logged, Weight_Log.reps_logged
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id
         WHERE Workout_Log.day_name = ? AND Workout_Log.workout_name = ? 
         ORDER BY Weight_Log.exercise_name, Weight_Log.set_number;`,
        [dayName, workoutName]
      );

      setLogs((prev) => ({ ...prev, [dayName]: result }));
    } catch (error) {
      console.error('Error fetching logs for day:', error);
    }
  };

  const toggleDayExpansion = (dayName: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayName]: !prev[dayName],
    }));

    // Fetch logs if the day is being expanded and hasn't been fetched yet
    if (!logs[dayName]) {
      fetchLogsForDay(dayName);
    }
  };

  const renderDay = (dayName: string) => {
    const isExpanded = expandedDays[dayName];
    return (
      <View key={dayName} style={styles.dayContainer}>
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={() => toggleDayExpansion(dayName)}
        >
          <Text style={styles.dayTitle}>{dayName}</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#000"
          />
        </TouchableOpacity>

        {isExpanded && logs[dayName] && (
          <View style={styles.logList}>
            {logs[dayName].map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.exerciseName}>{log.exercise_name}</Text>
                <Text style={styles.logDetail}>
                  Set {log.set_number}: {log.reps_logged} reps, {log.weight_logged}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        keyExtractor={(item) => item}
        renderItem={({ item }) => renderDay(item)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No logs available for this workout.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  logList: {
    marginTop: 10,
    paddingLeft: 15,
  },
  logItem: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  logDetail: {
    fontSize: 14,
    color: '#666666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
  },
});
