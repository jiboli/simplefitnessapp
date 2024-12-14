import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { WorkoutLog } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutLogStackParamList } from '../App';

type MyCalendarNavigationProp = StackNavigationProp<WorkoutLogStackParamList, 'MyCalendar'>;




export default function MyCalendar() {
  const db = useSQLiteContext();
  const navigation = useNavigation<MyCalendarNavigationProp>();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);

  // Fetch logs whenever the screen is focused
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

  const deleteWorkoutLog = (log_id: number) => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM Workout_Log WHERE workout_log_id = ?;', [log_id]);
              fetchWorkoutLogs(); // Refresh logs after deletion
            } catch (error) {
              console.error('Error deleting workout log:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>My Calendar</Text>

      {/* Log Workout Button */}
      <TouchableOpacity
        style={styles.logWorkoutButton}
        onPress={() => navigation.navigate('LogWorkout')}
      >
        <Text style={styles.logWorkoutButtonText}>Log a Workout</Text>
      </TouchableOpacity>

      {/* Workout Logs */}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.workout_log_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => deleteWorkoutLog(item.workout_log_id)}
            style={styles.logContainer}
          >
            <Text style={styles.logDate}>
              {new Date(item.workout_date * 1000).toLocaleDateString()}
            </Text>
            <Text style={styles.logDetails}>{item.workout_name}</Text>
            <Text style={styles.logDetails}>Day: {item.day_name}</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 20,
    alignItems: 'center',
  },
  logWorkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logContainer: {
    backgroundColor: '#F7F7F7',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  logDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  logDetails: {
    fontSize: 14,
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 20,
  },
});
