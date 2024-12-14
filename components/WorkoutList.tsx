// components/WorkoutList.tsx

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutStackParamList } from '../App'; // Adjust path to where WorkoutStackParamList is defined
import { Workout } from '../types';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

type WorkoutListNavigationProp = StackNavigationProp<WorkoutStackParamList, 'WorkoutsList'>;

export default function WorkoutList({
  workouts,
  deleteWorkout,
}: {
  workouts: Workout[];
  deleteWorkout: (workout_id: number, workout_name: string) => Promise<void>;
}) {
  const navigation = useNavigation<WorkoutListNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Workouts</Text>

      {/* Create New Workout Button */}
      <TouchableOpacity
        style={styles.createButton}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('CreateWorkout')}
      >
        <Text style={styles.createButtonText}>Create a new workout</Text>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>

      {/* Workout List */}
      {workouts.map((workout) => (
        <TouchableOpacity
          key={workout.workout_id}
          style={styles.workoutCard}
          activeOpacity={0.7}
          onLongPress={() => deleteWorkout(workout.workout_id, workout.workout_name)} 
          onPress={() => navigation.navigate('WorkoutDetails', { workout_id: workout.workout_id })}
>
          <Text style={styles.workoutText}>{workout.workout_name}</Text>
          <Ionicons name="chevron-forward" size={20} color="gray" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: 'white',
      marginTop: 50, // Move everything down
    },
    title: {
      fontSize: 50, // Larger font size
      fontWeight: '900', // Extra bold
      marginBottom: 24,
      textAlign: 'center', // Centered text
    },
    createButton: {
      backgroundColor: '#000000',
      borderRadius: 20,
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      marginBottom: 30, // Add space below the button
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 5,
    },
    createButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
    },
    plus: {
      color: 'white',
      fontSize: 28,
      fontWeight: 'bold',
    },
    workoutCard: {
      backgroundColor: '#F7F7F7',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    workoutText: {
      fontSize: 20, // Slightly larger
      color: 'black',
      fontWeight: '700', // More bold
    },
  });
  