import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkoutLogStackParamList } from '../App';

type NavigationProp = StackNavigationProp<
  WorkoutLogStackParamList,
  'ManageRecurringWorkouts'
>;

export default function ManageRecurringWorkouts() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Placeholder recurring workouts
  const placeholderRecurringWorkouts = [
    { id: 1, name: 'Example Workout 1', day: 'Day 1', interval: 'Daily' },
    { id: 2, name: 'Example Workout 2', day: 'Chest Day', interval: 'Weekly' },
    { id: 3, name: 'Example Workout 3', day: 'Leg Day', interval: 'Every 3 days' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.workoutItem, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('RecurringWorkoutDetails', { recurring_workout_id: item.id })}
    >
      <Text style={[styles.workoutName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.workoutDetails, { color: theme.text }]}>{item.day} • {item.interval}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.text} style={styles.arrow} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {t('manageRecurringWorkouts')}
      </Text>
      
      {placeholderRecurringWorkouts.length > 0 ? (
        <FlatList
          data={placeholderRecurringWorkouts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No recurring workouts found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.text }]}>
            Create a recurring workout to see it here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    padding: 8,
    zIndex: 10,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  workoutItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  workoutDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginRight: 10,
  },
  arrow: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
  },
});