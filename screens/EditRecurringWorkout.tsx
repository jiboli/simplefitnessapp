import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkoutLogStackParamList } from '../App';

// Add this to your WorkoutLogStackParamList in App.tsx
// EditRecurringWorkout: { recurring_workout_id: number };

type NavigationProp = StackNavigationProp<
  WorkoutLogStackParamList,
  'EditRecurringWorkout'
>;

type RouteProps = RouteProp<
  WorkoutLogStackParamList,
  'EditRecurringWorkout'
>;

export default function EditRecurringWorkout() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Placeholder values for form elements
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('weekly');

  // Mock intervals for selection
  const intervals = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'biweekly', label: 'Every 2 weeks' },
    { id: 'monthly', label: 'Monthly' },
  ];

  // Get the recurring workout ID from route params
  // For placeholder, default to 1 if not provided
  const recurring_workout_id = route.params?.recurring_workout_id || 1;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {t('editRecurringWorkout')}
      </Text>
      
      <View style={styles.formContainer}>
        {/* Workout Information (read-only) */}
        <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Workout Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text }]}>Workout:</Text>
            <Text style={[styles.value, { color: theme.text }]}>Push Pull Legs</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.text }]}>Day:</Text>
            <Text style={[styles.value, { color: theme.text }]}>Chest Day</Text>
          </View>
        </View>
        
        {/* Recurring Interval Selection */}
        <View style={[styles.selectionSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recurring Interval</Text>
          
          {intervals.map((interval) => (
            <TouchableOpacity
              key={interval.id}
              style={[
                styles.intervalOption,
                selectedInterval === interval.id && 
                {backgroundColor: theme.buttonBackground, borderColor: theme.buttonBackground}
              ]}
              onPress={() => setSelectedInterval(interval.id)}
            >
              <Text
                style={[
                  styles.intervalText,
                  { color: theme.text },
                  selectedInterval === interval.id && {color: theme.buttonText}
                ]}
              >
                {interval.label}
              </Text>
              {selectedInterval === interval.id && (
                <Ionicons name="checkmark" size={22} color={theme.buttonText} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Notification Settings */}
        <View style={[styles.notificationSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: theme.buttonBackground }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          {notificationsEnabled && (
            <TouchableOpacity style={styles.timeSelector}>
              <Text style={[styles.timeSelectorText, { color: theme.text }]}>
                Notification Time: 8:00 AM
              </Text>
              <Ionicons name="time-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.buttonBackground }]}
          onPress={() => {
            // Placeholder for saving changes
            alert('Changes saved (placeholder)');
            navigation.goBack();
          }}
        >
          <Text style={[styles.saveButtonText, { color: theme.buttonText }]}>
            Save Changes
          </Text>
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
  formContainer: {
    marginTop: 10,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectionSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
  intervalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 8,
  },
  intervalText: {
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
  },
  timeSelectorText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
