import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { WorkoutStackParamList } from '../App';




type WorkoutListNavigationProp = StackNavigationProp<WorkoutStackParamList, 'WorkoutDetails'>;



export default function EditWorkout() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { workout_id, workoutName } = route.params as { workout_id: number; workoutName: string };

  const [newWorkoutName, setNewWorkoutName] = useState(workoutName);

  const saveWorkoutName = () => {
    // Logic to update the workout name in the database
    console.log('Save new name:', newWorkoutName);
    navigation.goBack(); // Return to WorkoutDetails
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Edit Workout</Text>
      <TextInput
        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
        value={newWorkoutName}
        onChangeText={setNewWorkoutName}
      />
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]} onPress={saveWorkoutName}>
        <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20 },
  saveButton: { padding: 15, borderRadius: 10, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: 'bold' },
});
