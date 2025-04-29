import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useSQLiteContext } from 'expo-sqlite';
import { StartWorkoutStackParamList } from '../App';

type StartedWorkoutRouteProps = RouteProp<
  StartWorkoutStackParamList,
  'StartedWorkoutInterface'
>;

export default function StartedWorkoutInterface() {
  const navigation = useNavigation();
  const route = useRoute<StartedWorkoutRouteProps>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const db = useSQLiteContext();
  
  const { workout_log_id } = route.params;
  
  // States for workout data
  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<{
    workout_name: string;
    workout_date: number;
    day_name: string;
  } | null>(null);
  const [exercises, setExercises] = useState<{
    exercise_name: string;
    sets: number;
    reps: number;
    logged_exercise_id: number;
  }[]>([]);
  
  // Timer state
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Current exercise state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  useEffect(() => {
    fetchWorkoutDetails();
    
    // Start timer when component mounts
    startTimer();
    
    // Cleanup timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const fetchWorkoutDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch workout details
      const workoutResult = await db.getAllAsync<{
        workout_name: string;
        workout_date: number;
        day_name: string;
      }>(
        `SELECT workout_name, workout_date, day_name 
         FROM Workout_Log 
         WHERE workout_log_id = ?;`,
        [workout_log_id]
      );
      
      if (workoutResult.length > 0) {
        setWorkout(workoutResult[0]);
        
        // Fetch exercises for this workout
        const exercisesResult = await db.getAllAsync<{
          exercise_name: string;
          sets: number;
          reps: number;
          logged_exercise_id: number;
        }>(
          `SELECT exercise_name, sets, reps, logged_exercise_id 
           FROM Logged_Exercises 
           WHERE workout_log_id = ?;`,
          [workout_log_id]
        );
        
        setExercises(exercisesResult);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout details:', error);
      setLoading(false);
    }
  };
  
  const startTimer = () => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };
  
  const pauseTimer = () => {
    setTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const toggleTimer = () => {
    if (timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  };
  
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };
  
  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };
  
  const finishWorkout = async () => {
    // For now, just navigate back
    // Later, this would save workout data to Weight_Log
    pauseTimer();
    navigation.goBack();
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading workout...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {workout?.workout_name} - {workout?.day_name}
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.timerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity onPress={toggleTimer} style={styles.timerButton}>
            <Ionicons name={timerRunning ? "pause" : "play"} size={30} color={theme.text} />
            <Text style={[styles.timerText, { color: theme.text }]}>{formatTime(time)}</Text>
          </TouchableOpacity>
          <Text style={[styles.timerLabel, { color: theme.text }]}>Elapsed Time</Text>
        </View>
        
        {exercises.length > 0 ? (
          <>
            <View style={styles.exerciseNavigation}>
              <TouchableOpacity 
                onPress={prevExercise} 
                disabled={currentExerciseIndex === 0}
                style={[styles.navButton, { opacity: currentExerciseIndex === 0 ? 0.5 : 1 }]}
              >
                <Ionicons name="chevron-back" size={24} color={theme.text} />
              </TouchableOpacity>
              
              <Text style={[styles.exerciseCounter, { color: theme.text }]}>
                {currentExerciseIndex + 1} / {exercises.length}
              </Text>
              
              <TouchableOpacity 
                onPress={nextExercise} 
                disabled={currentExerciseIndex === exercises.length - 1}
                style={[styles.navButton, { opacity: currentExerciseIndex === exercises.length - 1 ? 0.5 : 1 }]}
              >
                <Ionicons name="chevron-forward" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Current Exercise</Text>
            <View style={[styles.exerciseCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.exerciseName, { color: theme.text }]}>
                {exercises[currentExerciseIndex]?.exercise_name}
              </Text>
              <Text style={[styles.exerciseDetails, { color: theme.text }]}>
                {exercises[currentExerciseIndex]?.sets} Sets x {exercises[currentExerciseIndex]?.reps} Reps
              </Text>
              
              <TouchableOpacity 
                style={[styles.logButton, { backgroundColor: theme.buttonBackground }]}
                onPress={() => {
                  // TODO: Navigate to weight logging screen for this exercise
                  // This would be implemented in future updates
                }}
              >
                <Text style={[styles.logButtonText, { color: theme.buttonText }]}>
                  Log Exercise
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Exercises</Text>
            <View style={styles.upcomingExercises}>
              {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((exercise, index) => (
                <View 
                  key={exercise.logged_exercise_id} 
                  style={[styles.upcomingExerciseCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <Text style={[styles.upcomingExerciseName, { color: theme.text }]}>
                    {exercise.exercise_name}
                  </Text>
                  <Text style={[styles.upcomingExerciseDetails, { color: theme.text }]}>
                    {exercise.sets} Sets x {exercise.reps} Reps
                  </Text>
                </View>
              ))}
              
              {exercises.slice(currentExerciseIndex + 1).length === 0 && (
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  No more exercises
                </Text>
              )}
            </View>
          </>
        ) : (
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No exercises found for this workout
          </Text>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.finishButton, { backgroundColor: theme.buttonBackground }]}
          onPress={finishWorkout}
        >
          <Text style={[styles.buttonText, { color: theme.buttonText }]}>Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timerCard: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  timerButton: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  timerLabel: {
    fontSize: 16,
  },
  exerciseNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  navButton: {
    padding: 10,
  },
  exerciseCounter: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  exerciseDetails: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  logButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upcomingExercises: {
    marginBottom: 30,
  },
  upcomingExerciseCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  upcomingExerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  upcomingExerciseDetails: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  finishButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 