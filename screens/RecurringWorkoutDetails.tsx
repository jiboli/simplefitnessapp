import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkoutLogStackParamList } from '../App';

type NavigationProp = StackNavigationProp<
  WorkoutLogStackParamList,
  'RecurringWorkoutDetails'
>;

type RouteProps = RouteProp<
  WorkoutLogStackParamList,
  'RecurringWorkoutDetails'
>;

export default function RecurringWorkoutDetails() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const { recurring_workout_id } = route.params;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {t('recurringWorkoutDetails')}
      </Text>
      
      <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.infoLabel, { color: theme.text }]}>Recurring Workout ID:</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>{recurring_workout_id}</Text>
        
        <Text style={[styles.infoLabel, { color: theme.text }]}>Workout Name:</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>Example Workout</Text>
        
        <Text style={[styles.infoLabel, { color: theme.text }]}>Day Name:</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>Example Day</Text>
        
        <Text style={[styles.infoLabel, { color: theme.text }]}>Recurring Interval:</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>Weekly</Text>
        
        <Text style={[styles.infoLabel, { color: theme.text }]}>Notifications:</Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>Enabled (8:00 AM)</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          onPress={() => navigation.navigate('EditRecurringWorkout', { recurring_workout_id: recurring_workout_id })}
        >
          <Ionicons name="pencil" size={20} color={theme.buttonText} style={styles.buttonIcon} />
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Edit</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
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
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
