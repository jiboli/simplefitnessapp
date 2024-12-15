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
  const [weights, setWeights] = useState<{ [key: string]: string }>({});
  const [reps, setReps] = useState<{ [key: string]: string }>({});

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

      // Filter out future workouts
      const today = new Date().getTime();
      const filteredWorkouts = result.filter(
        (workout) => workout.workout_date * 1000 <= today
      );

      setWorkouts(filteredWorkouts);
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

      const initialWeights: { [key: string]: string } = {};
      const initialReps: { [key: string]: string } = {};
      result.forEach((exercise) => {
        for (let i = 1; i <= exercise.sets; i++) {
          const key = `${exercise.logged_exercise_id}_${i}`;
          initialWeights[key] = ''; // Empty default for user input
          initialReps[key] = exercise.reps.toString(); // Default reps as string
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

    try {
      await db.withTransactionAsync(async () => {
        for (const exercise of exercises) {
          for (let i = 1; i <= exercise.sets; i++) {
            const weightKey = `${exercise.logged_exercise_id}_${i}`;
            const repsKey = `${exercise.logged_exercise_id}_${i}`;

            const weight = parseFloat(weights[weightKey].replace(',', '.')) || 0; // Convert to number
            const repsCount = parseInt(reps[repsKey], 10) || 0;

            if (weight <= 0 || repsCount <= 0) {
              throw new Error('Weight and reps must be greater than 0.');
            }

            await db.runAsync(
              `INSERT INTO Weight_Log 
               (workout_log_id, logged_exercise_id, exercise_name, set_number, weight_logged, reps_logged)
               VALUES (?, ?, ?, ?, ?, ?);`,
              [
                selectedWorkout.workout_log_id,
                exercise.logged_exercise_id,
                exercise.exercise_name,
                i,
                weight,
                repsCount,
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

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    const yesterday = new Date(today);

    tomorrow.setDate(today.getDate() + 1);
    yesterday.setDate(today.getDate() - 1);

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
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`; // Default format
    }
  };

  const renderExercise = (exercise: LoggedExercise) => {
    return (
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>{exercise.exercise_name}</Text>
        <View style={styles.labelsRow}>
          <Text style={styles.label}>Reps</Text>
          <Text style={styles.label}>Weight (kg)</Text>
        </View>
        {Array.from({ length: exercise.sets }).map((_, index) => {
          const setNumber = index + 1;
          const weightKey = `${exercise.logged_exercise_id}_${setNumber}`;
          const repsKey = `${exercise.logged_exercise_id}_${setNumber}`;

          return (
            <View key={setNumber} style={styles.setContainer}>
              <Text style={styles.setText}>Set {setNumber}:</Text>
              <TextInput
                style={styles.input}
                placeholder="Reps"
                keyboardType="numeric"
                value={reps[repsKey]}
                onChangeText={(text) =>
                  setReps((prev) => ({
                    ...prev,
                    [repsKey]: text.replace(/[^0-9]/g, ''), // Only allow numbers
                  }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Weight"
                keyboardType="decimal-pad"
                value={weights[weightKey]}
                onChangeText={(text) => {
                  const sanitizedText = text.replace(/[^0-9.,]/g, '');
                  setWeights((prev) => ({
                    ...prev,
                    [weightKey]: sanitizedText,
                  }));
                }}
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
              <Text style={styles.dayName}>{item.day_name}</Text>
              <Text style={styles.workoutDate}>{formatDate(item.workout_date)}</Text>
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
    fontSize: 28,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  workoutDate: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  },
  exerciseContainer: {
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 100,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    flex: 1,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  setText: {
    fontSize: 18,
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
  },
});
