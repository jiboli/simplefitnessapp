import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { WorkoutLogStackParamList } from '../App';

type NavigationProp = StackNavigationProp<
  WorkoutLogStackParamList,
  'CreateRecurringWorkout'
>;

export default function CreateRecurringWorkout() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>
        {t('createRecurringWorkout')}
      </Text>
      
      <View style={styles.placeholderContainer}>
        <Text style={[styles.placeholderText, { color: theme.text }]}>
          Create Recurring Workout screen placeholder
        </Text>
        <Text style={[styles.instructions, { color: theme.text }]}>
          This screen will allow users to:
        </Text>
        <View style={styles.bulletPoints}>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>• Select a workout</Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>• Choose a day from that workout</Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>• Set recurring interval (daily, weekly, etc.)</Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>• Configure notifications</Text>
        </View>
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  bulletPoints: {
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },
  bulletPoint: {
    fontSize: 16,
    marginBottom: 8,
  },
});