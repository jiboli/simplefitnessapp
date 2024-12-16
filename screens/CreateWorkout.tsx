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
import Ionicons from 'react-native-vector-icons/Ionicons';


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
        }
      }
    } catch (error) {
      console.error('Error during transaction:', error);
      throw error; // Re-throw the error to abort the transaction
    }
  });
}

export default function CreateWorkout() {
  const db = useSQLiteContext();
  const [workoutName, setWorkoutName] = useState('');
  const [days, setDays] = useState<
    { dayName: string; exercises: { exerciseName: string; sets: string; reps: string }[] }[]
  >([]);

  const navigation = useNavigation<WorkoutListNavigationProp>();

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { dayName: '', exercises: [{ exerciseName: '', sets: '', reps: '' }] },
    ]);
  };

  const addExercise = (dayIndex: number) => {
    setDays((prev) => {
      const updatedDays = [...prev];
      updatedDays[dayIndex].exercises.push({ exerciseName: '', sets: '', reps: '' });
      return updatedDays;
    });
  };

  const deleteDay = (index: number) => {
    Alert.alert(
      'Delete Day',
      `Are you sure you want to delete Day ${index + 1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDays((prev) => prev.filter((_, dayIndex) => dayIndex !== index));
          },
        },
      ]
    );
  };

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    Alert.alert(
      'Delete Exercise',
      `Are you sure you want to delete this exercise?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDays((prev) => {
              const updatedDays = [...prev];
              updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter(
                (_, exIndex) => exIndex !== exerciseIndex
              );
              return updatedDays;
            });
          },
        },
      ]
    );
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
            !exercise.exerciseName.trim() || !exercise.sets || !exercise.reps
        )
      )
    ) {
      Alert.alert('Error', 'Please complete all exercises with valid data.');
      return;
    }

    const formattedDays = days.map((day) => ({
      ...day,
      exercises: day.exercises.map((exercise) => ({
        ...exercise,
        sets: parseInt(exercise.sets),
        reps: parseInt(exercise.reps),
      })),
    }));

    try {
      await createWorkout(db, workoutName, formattedDays);
      navigation.goBack();
      setWorkoutName('');
      setDays([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create workout. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
       style={styles.backButton}
       onPress={() => navigation.goBack()}
      > 
      <Ionicons name="arrow-back" size={40} color="#000000" />
      </TouchableOpacity>

      <Text style={styles.title}>Create a New Workout</Text>

      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <FlatList
        data={days}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onLongPress={() => deleteDay(index)}
            activeOpacity={0.8}
            style={styles.dayContainer}
          >
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

            {item.exercises.map((exercise, exerciseIndex) => (
              <TouchableOpacity
                key={exerciseIndex}
                onLongPress={() => deleteExercise(index, exerciseIndex)}
                activeOpacity={0.8}
                style={styles.exerciseContainer}
              >
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
                value={exercise.sets}
                onChangeText={(text) => {
                  const sanitizedText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                  let value = parseInt(sanitizedText || '0'); // Convert to integer
                  if (value > 0 && value <= 100) { // Ensure value is > 0 and <= 100
                    const updatedDays = [...days];
                    updatedDays[index].exercises[exerciseIndex].sets = value.toString();
                    setDays(updatedDays);
                  }
                }}
              />
                <TextInput
                  style={[styles.input, styles.smallInput]}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={exercise.reps}
                  onChangeText={(text) => {
                    const sanitizedText = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                    let value = parseInt(sanitizedText || '0'); // Convert to integer
                    if (value > 0 && value <= 10000) { // Ensure value is > 0 and <= 10,000
                      const updatedDays = [...days];
                      updatedDays[index].exercises[exerciseIndex].reps = value.toString();
                      setDays(updatedDays);
                    }
                  }}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addExercise(index)}
            >
              <Text style={styles.addButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={addDay}>
            <Text style={styles.addButtonText}>+ Add Day</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
        <Text style={styles.saveButtonText}>Save Workout</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
    borderRadius: 20, // Softer corners
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#000000',
  },
  dayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
  },
  dayInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#000000',
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
  },
  exerciseInput: {
    flex: 2,
    marginRight: 10,
    borderRadius: 15,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
    fontSize: 14,
    color: '#000000',
  },
  smallInput: {
    flex: 1,
    textAlign: 'center',
    borderRadius: 15,
    marginRight: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)', // Subtle border
    fontSize: 14,
    color: '#000000',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginLeft: 8,
  },
  backButton: {
    position: 'absolute',
    top: 33, // A little spacing from the top for tidy alignment
    left: 5, // Align neatly with the left edge
    zIndex: 10,
    padding: 8, // Smaller padding for a tighter look
  },
  
  
});
