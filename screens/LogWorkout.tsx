import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { useSQLiteContext } from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

export default function LogWorkout() {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workouts, setWorkouts] = useState<{ workout_id: number; workout_name: string }[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<number | null>(null);
  const [days, setDays] = useState<{ day_id: number; day_name: string }[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const result = await db.getAllAsync<{ workout_id: number; workout_name: string }>(
        'SELECT * FROM Workouts;'
      );
      setWorkouts(result);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const fetchDays = async (workout_id: number) => {
    try {
      const result = await db.getAllAsync<{ day_id: number; day_name: string }>(
        'SELECT * FROM Days WHERE workout_id = ?;',
        [workout_id]
      );
      setDays(result);
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const logWorkout = async () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    if (!selectedWorkout) {
      Alert.alert('Error', 'Please select a workout.');
      return;
    }
    if (!selectedDay) {
      Alert.alert('Error', 'Please select a day.');
      return;
    }

    try {
      const workoutDate = Math.floor(selectedDate.getTime() / 1000); // Convert date to seconds
      await db.runAsync(
        'INSERT INTO Workout_Log (day_id, workout_date) VALUES (?, ?);',
        [selectedDay, workoutDate]
      );
      Alert.alert('Success', 'Workout logged successfully!');
      navigation.goBack(); // Navigate back to MyCalendar or previous screen
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Select Date */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.inputText}>
          {selectedDate ? selectedDate.toDateString() : 'Select a date'}
        </Text>
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={selectedDate || new Date()}
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Select Workout */}
      <Text style={styles.sectionTitle}>Select Workout</Text>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.workout_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.listItem,
              selectedWorkout === item.workout_id && styles.selectedItem,
            ]}
            onPress={() => {
              setSelectedWorkout(item.workout_id);
              setDays([]); // Reset days when selecting a new workout
              setSelectedDay(null);
              fetchDays(item.workout_id);
            }}
          >
            <Text style={styles.listItemText}>{item.workout_name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No workouts available.</Text>
        }
      />

      {/* Select Day */}
      {selectedWorkout && (
        <>
          <Text style={styles.sectionTitle}>Select Day</Text>
          <FlatList
            data={days}
            keyExtractor={(item) => item.day_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedDay === item.day_id && styles.selectedItem,
                ]}
                onPress={() => setSelectedDay(item.day_id)}
              >
                <Text style={styles.listItemText}>{item.day_name}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No days available for this workout.</Text>
            }
          />
        </>
      )}

      {/* Log Workout Button */}
      <TouchableOpacity style={styles.saveButton} onPress={logWorkout}>
        <Text style={styles.saveButtonText}>Log Workout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  inputText: {
    fontSize: 16,
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000000',
  },
  listItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F7F7F7',
  },
  listItemText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedItem: {
    backgroundColor: '#000000',
  },
  selectedItemText: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
