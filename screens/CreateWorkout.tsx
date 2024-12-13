import { useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { WorkoutStackParamList } from '../App'; // Adjust path to where WorkoutStackParamList is defined
import { StackNavigationProp } from '@react-navigation/stack';


type WorkoutListNavigationProp = StackNavigationProp<WorkoutStackParamList, 'WorkoutsList'>;

// Modify this function to accept db as a parameter
async function createWorkout(
  db: any, // Pass the database context
  workoutName: string,
  days: { dayName: string; exercises: { exerciseName: string; sets: number; reps: number }[] }[]
) {
  await db.withTransactionAsync(async () => {
    console.log('Starting transaction...');

    try {
      console.log('Inserting workout...');
      await db.runAsync('INSERT INTO Workouts (workout_name) VALUES (?);', [workoutName]);
      console.log(`Workout inserted: ${workoutName}`);

      console.log('Fetching workout ID...');
      const workoutIdResult = (await db.getAllAsync('SELECT last_insert_rowid() as workout_id;')) as {
        workout_id: number;
      }[];

      if (!workoutIdResult.length) throw new Error('Failed to retrieve workout ID.');

      const workoutId = workoutIdResult[0].workout_id;
      console.log(`Workout ID retrieved: ${workoutId}`);

      for (const day of days) {
        console.log(`Inserting day: ${day.dayName}`);
        await db.runAsync('INSERT INTO Days (workout_id, day_name) VALUES (?, ?);', [
          workoutId,
          day.dayName,
        ]);
        console.log(`Day inserted: ${day.dayName}`);

        console.log('Fetching day ID...');
        const dayIdResult = (await db.getAllAsync('SELECT last_insert_rowid() as day_id;')) as {
          day_id: number;
        }[];

        if (!dayIdResult.length) throw new Error('Failed to retrieve day ID.');

        const dayId = dayIdResult[0].day_id;
        console.log(`Day ID retrieved: ${dayId}`);

        for (const exercise of day.exercises) {
          console.log(`Inserting exercise: ${exercise.exerciseName}`);
          await db.runAsync(
            'INSERT INTO Exercises (day_id, exercise_name, sets, reps) VALUES (?, ?, ?, ?);',
            [dayId, exercise.exerciseName, exercise.sets, exercise.reps]
          );
          console.log(
            `Exercise inserted: ${exercise.exerciseName}, Sets: ${exercise.sets}, Reps: ${exercise.reps}`
          );
        }
      }

      console.log('All operations completed successfully!');
    } catch (error) {
      console.error('Error during transaction:', error);
      throw error; // Re-throw the error to abort the transaction
    }
  });
}




export default function CreateWorkout() {
  const db = useSQLiteContext(); // Use the hook here
  const [workoutName, setWorkoutName] = useState('');
  const [days, setDays] = useState<
    { dayName: string; exercises: { exerciseName: string; sets: number; reps: number }[] }[]
  >([]);

  const navigation = useNavigation<WorkoutListNavigationProp>();

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { dayName: '', exercises: [{ exerciseName: '', sets: 0, reps: 0 }] },
    ]);
  };

  const addExercise = (dayIndex: number) => {
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[dayIndex].exercises.push({ exerciseName: '', sets: 0, reps: 0 });
      return updatedDays;
    });
  };

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name.');
      return;
    }

    if (days.some((day) => !day.dayName.trim())) {
      Alert.alert('Error', 'Please provide names for all days.');
      return;
    }

    if (
      days.some((day) =>
        day.exercises.some(
          (exercise) =>
            !exercise.exerciseName.trim() || exercise.sets <= 0 || exercise.reps <= 0
        )
      )
    ) {
      Alert.alert('Error', 'Please complete all exercises with valid data.');
      return;
    }

    try {
      await createWorkout(db, workoutName, days); // Pass the db context here
      Alert.alert('Success', 'Workout created successfully!');
      navigation.navigate('WorkoutsList'); // Redirect to Workouts
      setWorkoutName('');
      setDays([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create workout. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Workout</Text>

      {/* Input for Workout Name */}
      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      {/* List of Days */}
      <FlatList
        data={days}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.dayContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Day ${index + 1} Name`}
              value={item.dayName}
              onChangeText={(text) => {
                const updatedDays = [...days];
                updatedDays[index].dayName = text;
                setDays(updatedDays);
              }}
            />

            {/* List of Exercises for this Day */}
            {item.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exerciseContainer}>
                <TextInput
                  style={[styles.input, styles.exerciseInput]}
                  placeholder="Exercise Name"
                  value={exercise.exerciseName}
                  onChangeText={(text) => {
                    const updatedDays = [...days];
                    updatedDays[index].exercises[exerciseIndex].exerciseName = text;
                    setDays(updatedDays);
                  }}
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Sets"
                  keyboardType="numeric"
                  value={exercise.sets.toString()}
                  onChangeText={(text) => {
                    const updatedDays = [...days];
                    updatedDays[index].exercises[exerciseIndex].sets = parseInt(text) || 0;
                    setDays(updatedDays);
                  }}
                />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={exercise.reps.toString()}
                  onChangeText={(text) => {
                    const updatedDays = [...days];
                    updatedDays[index].exercises[exerciseIndex].reps = parseInt(text) || 0;
                    setDays(updatedDays);
                  }}
                />
              </View>
            ))}

            {/* Add Exercise Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addExercise(index)}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={addDay}>
            <Text style={styles.addButtonText}>+ Add Day</Text>
          </TouchableOpacity>
        }
      />

      {/* Save Workout Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  dayContainer: {
    marginBottom: 16,
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseInput: {
    flex: 2,
    marginRight: 8,
  },
  smallInput: {
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
