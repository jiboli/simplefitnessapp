import React, {useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { WorkoutLog, WeightLog } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutLogStackParamList } from '../App';
import Ionicons from 'react-native-vector-icons/Ionicons';



type MyCalendarNavigationProp = StackNavigationProp<WorkoutLogStackParamList, 'MyCalendar'>;

export default function MyCalendar() {
  const db = useSQLiteContext();
  const navigation = useNavigation<MyCalendarNavigationProp>();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkoutLogs();
    }, [db])
  );

  const fetchWorkoutLogs = async () => {
    try {
      const result = await db.getAllAsync<WorkoutLog>(
        `SELECT * FROM Workout_Log ORDER BY workout_date DESC;`
      );
      setLogs(result);
    } catch (error) {
      console.error('Error fetching workout logs:', error);
    }
  };

  const fetchLoggedWeights = async (workoutLogId: number) => {
    try {
      const weights = await db.getAllAsync<WeightLog>(
        `SELECT wl.*, le.exercise_name 
         FROM Weight_Log wl
         JOIN Logged_Exercises le ON wl.logged_exercise_id = le.logged_exercise_id
         WHERE wl.workout_log_id = ?;`,
        [workoutLogId]
      );
      console.log('Logged Weights:', weights);
    } catch (error) {
      console.error('Error fetching logged weights:', error);
    }
  };

  const deleteWorkoutLog = (log_id: number) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this workout log? Its progress is also going to be deleted.  ',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM Workout_Log WHERE workout_log_id = ?;', [log_id]);
              fetchWorkoutLogs();
            } catch (error) {
              console.error('Error deleting workout log:', error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>My Calendar</Text>
      

      <TouchableOpacity
  style={styles.logWorkoutButton}
  onPress={() => navigation.navigate('LogWorkout')}
>
  <Ionicons name="calendar" size={24} color="#FFFFFF" style={styles.icon} />
  <Text style={styles.logWorkoutButtonText}>Schedule a Workout</Text>
</TouchableOpacity>


      <FlatList
        data={logs}
        keyExtractor={(item) => item.workout_log_id.toString()}
        renderItem={({ item }) => {
          const date = new Date(item.workout_date * 1000);
          const dayOfWeek = daysOfWeek[date.getDay()];
          return (
            <TouchableOpacity
              onLongPress={() => deleteWorkoutLog(item.workout_log_id)}
              onPress={() => fetchLoggedWeights(item.workout_log_id)}
              style={styles.logContainer}
            >
              <Text style={styles.logDate}>
                {formatDate(item.workout_date)} ({dayOfWeek})
              </Text>
              <Text style={styles.logWorkoutName}>{item.workout_name}</Text>
              <Text style={styles.logDayName}>{item.day_name}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No workout logs available.</Text>}
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  logWorkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row', // Ensures icon and text are in a row
    alignItems: 'center', // Vertically centers icon and text
    justifyContent: 'center', // Centers icon and text horizontally
    marginTop: 20,
    marginBottom: 30, // Adds space between this button and the others below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  icon: {
    marginRight: 10, // Adds space between the icon and text
  },
  logWorkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },

  logContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    padding: 30,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  logDate: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  logWorkoutName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    color: '#000000',
  },
  logDayName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 20,
  },
});
