import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function WeightLogDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { workoutName } = route.params as { workoutName: string };

  const [days, setDays] = useState<
    { day_name: string; workout_date: number }[]
  >([]);
  const [filteredDays, setFilteredDays] = useState<
    { day_name: string; workout_date: number }[]
  >([]);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [logs, setLogs] = useState<{ [key: string]: any[] }>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchDays();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterDaysByDate(selectedDate);
    } else {
      setFilteredDays(days); // Reset filter when no date is selected
    }
  }, [selectedDate, days]);

  const fetchDays = async () => {
    try {
      const result = await db.getAllAsync<{
        day_name: string;
        workout_date: number;
      }>(
        `SELECT DISTINCT Workout_Log.day_name, Workout_Log.workout_date
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id
         WHERE Workout_Log.workout_name = ?;`,
        [workoutName]
      );

      setDays(result);
      setFilteredDays(result); // Initially show all days
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const fetchLogsForDay = async (dayName: string, workoutDate: number) => {
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
         WHERE Workout_Log.day_name = ? AND Workout_Log.workout_date = ? 
         ORDER BY Weight_Log.exercise_name, Weight_Log.set_number;`,
        [dayName, workoutDate]
      );

      setLogs((prev) => ({
        ...prev,
        [`${dayName}_${workoutDate}`]: result,
      }));
    } catch (error) {
      console.error('Error fetching logs for day:', error);
    }
  };

  const toggleDayExpansion = (dayName: string, workoutDate: number) => {
    const key = `${dayName}_${workoutDate}`;
    setExpandedDays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // Fetch logs if the day is being expanded and hasn't been fetched yet
    if (!logs[key]) {
      fetchLogsForDay(dayName, workoutDate);
    }
  };

  const filterDaysByDate = (date: Date) => {
    const selectedDateTimestamp = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    const filtered = days.filter(
      (day) =>
        new Date(day.workout_date * 1000).toDateString() ===
        new Date(selectedDateTimestamp).toDateString()
    );

    setFilteredDays(filtered);
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    const yesterday = new Date(today);

    tomorrow.setDate(today.getDate() + 1);
    yesterday.setDate(today.getDate() - 1);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    } else if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday';
    } else {
      return `${day}-${month}-${year}`; // Default format
    }
  };

  const deleteDayLogs = async (dayName: string, workoutDate: number) => {
    try {
      await db.runAsync(
        `DELETE FROM Weight_Log
         WHERE workout_log_id IN (
           SELECT workout_log_id 
           FROM Workout_Log 
           WHERE day_name = ? AND workout_date = ?
         );`,
        [dayName, workoutDate]
      );
      // Refresh days after deletion
      fetchDays();
    } catch (error) {
      console.error('Error deleting logs for day:', error);
    }
  };

  const confirmDeleteDay = (dayName: string, workoutDate: number) => {
    Alert.alert(
      'Delete Logs',
      'Are you sure you want to delete all logs for this day? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDayLogs(dayName, workoutDate),
        },
      ]
    );
  };

  const renderDay = ({
    day_name,
    workout_date,
  }: {
    day_name: string;
    workout_date: number;
  }) => {
    const key = `${day_name}_${workout_date}`;
    const isExpanded = expandedDays[key];
    const formattedDate = formatDate(workout_date);

    return (
      <View key={key} style={styles.logContainer}>
        <TouchableOpacity
          style={styles.logHeader}
          onPress={() => toggleDayExpansion(day_name, workout_date)}
          onLongPress={() => confirmDeleteDay(day_name, workout_date)} // Handle long press for day deletion
        >
          <View>
            <Text style={styles.logDayName}>{day_name}</Text>
            <Text style={styles.logDate}>{formattedDate}</Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#000"
          />
        </TouchableOpacity>

        {isExpanded && logs[key] && (
          <View style={styles.logList}>
            {logs[key].map((log) => (
              <View key={`${log.exercise_name}_${log.set_number}`} style={styles.logItem}>
                <Text style={styles.exerciseName}>{log.exercise_name}</Text>
                <Text style={styles.logDetail}>
                  Set {log.set_number}: {log.reps_logged} reps, {log.weight_logged} kg
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleDateChange = (event: any, date?: Date) => {
    setDatePickerVisible(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setDatePickerVisible(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
        <Text style={styles.filterButtonText}>Filter by Date</Text>
      </TouchableOpacity>

      {/* Date Picker */}
      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* FlatList */}
      <FlatList
        data={filteredDays}
        keyExtractor={(item) => `${item.day_name}_${item.workout_date}`}
        renderItem={({ item }) => renderDay(item)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No logs available for this workout.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 8,
  },
  logContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#000000',
  },
  logDayName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  logList: {
    marginTop: 10,
    paddingLeft: 10,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
