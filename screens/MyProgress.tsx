import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { WeightLogStackParamList } from '../App'; // Adjust the path to where WeightLogStackParamList is defined
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

type WeightLogNavigationProp = StackNavigationProp<
  WeightLogStackParamList,
  'LogWeights' | 'WeightLogDetail'
>;

export default function MyProgress() {
  const navigation = useNavigation<WeightLogNavigationProp>();
  const db = useSQLiteContext();

  const [workouts, setWorkouts] = useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkoutsWithLogs();
    }, [db])
  );

  const fetchWorkoutsWithLogs = async () => {
    try {
      const result = await db.getAllAsync<{ workout_name: string }>(
        `SELECT DISTINCT Workout_Log.workout_name
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id;`
      );

      const workouts = result.map((row) => row.workout_name);
      setWorkouts(workouts);
    } catch (error) {
      console.error('Error fetching workouts with logs:', error);
    }
  };

  const handleWorkoutPress = (workoutName: string) => {
    navigation.navigate('WeightLogDetail', { workoutName });
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Progress</Text>

      {/* Log Weights Button */}
      <TouchableOpacity
        style={styles.logWeightsButton}
        onPress={() => navigation.navigate('LogWeights')}
      >
        <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
        <Text style={styles.logWeightsButtonText}>Log Weights</Text>
      </TouchableOpacity>

      {/* List of Workouts with Logs */}
      <FlatList
        data={workouts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.workoutCard}
            onPress={() => handleWorkoutPress(item)}
          >
            <Text style={styles.workoutText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No logged workouts available.</Text>
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
    color: '#000000',
  },
  logWeightsButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logWeightsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  workoutCard: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginTop: 20,
  },
  workoutText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 20,
  },
});
