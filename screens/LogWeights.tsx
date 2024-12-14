import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { WorkoutLog, LoggedExercise } from '../types';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LogWeights() {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [exercises, setExercises] = useState<LoggedExercise[]>([]);
  const [weights, setWeights] = useState<{ [key: string]: number }>({});
  const [reps, setReps] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const result = await db.getAllAsync<WorkoutLog>(
        `SELECT * FROM Workout_Log 
         WHERE workout_log_id NOT IN (
           SELECT DISTINCT workout_log_id FROM Weight_Log
         )
         ORDER BY workout_date DESC;`
      );
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchExercises = async (workout_log_id: number) => {
    try {
      const result = await db.getAllAsync<LoggedExercise>(
        'SELECT * FROM Logged_Exercises WHERE workout_log_id = ?;',
        [workout_log_id]
      );
      setExercises(result);

      // Initialize weights and reps
      const initialWeights: { [key: string]: number } = {};
      const initialReps: { [key: string]: number } = {};
      result.forEach((exercise) => {
        for (let i = 1; i <= exercise.sets; i++) {
          initialWeights[`${exercise.logged_exercise_id}_${i}`] = 0; // Default weight = 0
          initialReps[`${exercise.logged_exercise_id}_${i}`] = exercise.reps; // Default reps from Logged_Exercises
        }
      });
      setWeights(initialWeights);
      setReps(initialReps);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const logWeights = async () => {
    if (!selectedWorkout) {
      Alert.alert('Error', 'Please select a workout.');
      return;
    }
  
    // Validate weights and reps
    for (const [key, weight] of Object.entries(weights)) {
      if (weight <= 0) {
        Alert.alert('Error', `Weight for ${key} must be greater than 0.`);
        return;
      }
    }
  
    for (const [key, rep] of Object.entries(reps)) {
      if (rep <= 0) {
        Alert.alert('Error', `Reps for ${key} must be greater than 0.`);
        return;
      }
    }
  
    try {
      // Use db.withTransactionAsync without referencing txn explicitly
      await db.withTransactionAsync(async () => {
        for (const exercise of exercises) {
          for (let i = 1; i <= exercise.sets; i++) {
            const weightKey = `${exercise.logged_exercise_id}_${i}`;
            const repsKey = `${exercise.logged_exercise_id}_${i}`;
  
            await db.runAsync(
              `INSERT INTO Weight_Log 
               (workout_log_id, logged_exercise_id, exercise_name, set_number, weight_logged, reps_logged)
               VALUES (?, ?, ?, ?, ?, ?);`,
              [
                selectedWorkout.workout_log_id,
                exercise.logged_exercise_id,
                exercise.exercise_name,
                i,
                weights[weightKey],
                reps[repsKey],
              ]
            );
          }
        }
      });
  
      Alert.alert('Success', 'Weights logged successfully!');
      navigation.goBack(); // Navigate back to My Progress
    } catch (error) {
      console.error('Error logging weights:', error);
      Alert.alert('Error', 'Failed to log weights.');
    }
  };
  
  const renderExercise = (exercise: LoggedExercise) => {
    return (
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>
        {Array.from({ length: exercise.sets }).map((_, index) => {
          const setNumber = index + 1;
          const weightKey = `${exercise.logged_exercise_id}_${setNumber}`;
          const repsKey = `${exercise.logged_exercise_id}_${setNumber}`;

          return (
            <View key={setNumber} style={styles.setContainer}>
              <Text style={styles.setText}>Set {setNumber}:</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                keyboardType="numeric"
                value={weights[weightKey]?.toString()}
                onChangeText={(text) =>
                  setWeights((prev) => ({
                    ...prev,
                    [weightKey]: parseFloat(text) || 0,
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                keyboardType="numeric"
                value={reps[repsKey]?.toString()}
                onChangeText={(text) =>
                  setReps((prev) => ({
                    ...prev,
                    [repsKey]: parseInt(text, 10) || 0,
                  }))
                }
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>

      <Text style={styles.title}>Log Weights</Text>

      {!selectedWorkout ? (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.workout_log_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.workoutContainer}
              onPress={() => {
                setSelectedWorkout(item);
                fetchExercises(item.workout_log_id);
              }}
            >
              <Text style={styles.workoutName}>{item.workout_name}</Text>
              <Text style={styles.workoutDate}>
                {new Date(item.workout_date * 1000).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No workouts available to log.</Text>
          }
        />
      ) : (
        <>
          <FlatList
            data={exercises}
            keyExtractor={(item) => item.logged_exercise_id.toString()}
            renderItem={({ item }) => renderExercise(item)}
          />
          <TouchableOpacity style={styles.saveButton} onPress={logWeights}>
            <Text style={styles.saveButtonText}>Log Weights</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  workoutContainer: {
    backgroundColor: '#F7F7F7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666666',
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  setText: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
  },
});
