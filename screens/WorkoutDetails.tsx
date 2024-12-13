import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSQLiteContext } from 'expo-sqlite';

type Day = {
  day_id: number;
  day_name: string;
  exercises: { exercise_name: string; sets: number; reps: number }[];
};

export default function WorkoutDetails() {
  const db = useSQLiteContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { workout_id } = route.params as { workout_id: number };

  const [workoutName, setWorkoutName] = useState('');
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      // Fetch workout name
      const workoutResult = await db.getAllAsync<{ workout_name: string }>(
        'SELECT workout_name FROM Workouts WHERE workout_id = ?',
        [workout_id]
      );
      setWorkoutName(workoutResult[0]?.workout_name || '');

      // Fetch days and exercises
      const daysResult = await db.getAllAsync<{ day_id: number; day_name: string }>(
        'SELECT day_id, day_name FROM Days WHERE workout_id = ?',
        [workout_id]
      );

      const daysWithExercises = await Promise.all(
        daysResult.map(async (day) => {
          const exercises = await db.getAllAsync<{ exercise_name: string; sets: number; reps: number }>(
            'SELECT exercise_name, sets, reps FROM Exercises WHERE day_id = ?',
            [day.day_id]
          );
          return { ...day, exercises };
        })
      );

      setDays(daysWithExercises);
    };

    fetchWorkoutDetails();
  }, [workout_id]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000000" />
      </TouchableOpacity>

      {/* Workout Name */}
      <Text style={styles.title}>{workoutName}</Text>

      {/* Days and Exercises */}
      <FlatList
        data={days}
        keyExtractor={(item) => item.day_id.toString()}
        renderItem={({ item: day }) => (
          <View style={styles.dayContainer}>
            {/* Day Title */}
            <Text style={styles.dayTitle}>{day.day_name}</Text>
            
            {/* Exercises */}
            {day.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseContainer}>
                <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} sets x {exercise.reps} reps
                </Text>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No days or exercises available for this workout.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
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
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    color: '#000000',
  },
  dayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 12,
    paddingBottom: 8,
  },
  exerciseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 15,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  exerciseDetails: {
    fontSize: 16,
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    marginTop: 20,
  },
});
