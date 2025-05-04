import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-chart-kit';

// Define the type for route params
type GraphsParamList = {
  GraphsWorkoutDetails: { workoutName: string };
};

type GraphsWorkoutDetailsRouteProp = RouteProp<GraphsParamList, 'GraphsWorkoutDetails'>;

// Define data types
type DayOption = { label: string; value: string };
type ExerciseOption = { label: string; value: string };
type LogData = {
  date: number;
  exercise_name: string;
  weight_logged: number;
  reps_logged: number;
  set_number: number;
  workout_log_id: number;
  logged_exercise_id: number;
};
type TimeFrame = 'week' | 'month' | 'year' | 'all';
type CalculationType = 'CES' | '1RM';
type ProcessedDataPoint = {
  x: string; // Date string for display
  y: number; // Value (CES or 1RM)
  timestamp: number; // Raw timestamp for sorting
};

export default function GraphsWorkoutDetails() {
  const navigation = useNavigation();
  const route = useRoute<GraphsWorkoutDetailsRouteProp>();
  const { workoutName } = route.params;
  const db = useSQLiteContext();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width - 40; // Account for padding

  // State variables
  const [days, setDays] = useState<DayOption[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [calculationType, setCalculationType] = useState<CalculationType>('CES');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logData, setLogData] = useState<LogData[]>([]);
  const [chartData, setChartData] = useState<ProcessedDataPoint[]>([]);

  // Fetch days for the selected workout
  useEffect(() => {
    fetchDays();
  }, [workoutName]);

  // Fetch exercises when day changes
  useEffect(() => {
    if (selectedDay) {
      fetchExercises();
    }
  }, [selectedDay]);

  // Fetch and process data when exercise, timeframe, or calculation type changes
  useEffect(() => {
    if (selectedExercise) {
      fetchData();
    }
  }, [selectedExercise, timeFrame, calculationType]);

  // Process log data into chart data
  useEffect(() => {
    if (logData.length > 0) {
      processDataForChart();
    }
  }, [logData, calculationType]);

  const fetchDays = async () => {
    try {
      const result = await db.getAllAsync<{ day_name: string }>(
        `SELECT DISTINCT day_name FROM Workout_Log 
         WHERE workout_name = ? 
         ORDER BY day_name ASC`,
        [workoutName]
      );
      
      const dayOptions = result.map(day => ({
        label: day.day_name,
        value: day.day_name
      }));
      
      setDays(dayOptions);
      
      if (dayOptions.length > 0) {
        setSelectedDay(dayOptions[0].value);
      }
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const result = await db.getAllAsync<{ exercise_name: string }>(
        `SELECT DISTINCT Weight_Log.exercise_name 
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id
         WHERE Workout_Log.workout_name = ? AND Workout_Log.day_name = ?
         ORDER BY Weight_Log.exercise_name ASC`,
        [workoutName, selectedDay]
      );
      
      const exerciseOptions = result.map(exercise => ({
        label: exercise.exercise_name,
        value: exercise.exercise_name
      }));
      
      setExercises(exerciseOptions);
      
      if (exerciseOptions.length > 0) {
        setSelectedExercise(exerciseOptions[0].value);
      } else {
        setSelectedExercise('');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Calculate date based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case 'all':
          startDate = new Date(0); // Beginning of time (1970)
          break;
      }
      
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      
      const result = await db.getAllAsync<LogData>(
        `SELECT Weight_Log.exercise_name, Weight_Log.weight_logged, Weight_Log.reps_logged, 
                Weight_Log.set_number, Workout_Log.workout_date as date,
                Weight_Log.workout_log_id, Weight_Log.logged_exercise_id
         FROM Weight_Log
         INNER JOIN Workout_Log 
         ON Weight_Log.workout_log_id = Workout_Log.workout_log_id
         WHERE Workout_Log.workout_name = ? 
         AND Workout_Log.day_name = ?
         AND Weight_Log.exercise_name = ?
         AND Workout_Log.workout_date >= ?
         ORDER BY Workout_Log.workout_date ASC`,
        [workoutName, selectedDay, selectedExercise, startTimestamp]
      );
      
      setLogData(result);
    } catch (error) {
      console.error('Error fetching log data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate CES (Combined Effort Score)
  const calculateCES = (sets: LogData[]): number => {
    return sets.reduce((total, set) => {
      const setScore = set.weight_logged * set.reps_logged * (1 + set.reps_logged / 30);
      return total + setScore;
    }, 0);
  };

  // Calculate estimated 1RM (one-rep max)
  const calculate1RM = (sets: LogData[]): number => {
    if (sets.length === 0) return 0;
    
    // Find the set with the most weight
    const maxWeightSet = sets.reduce((maxSet, currentSet) => {
      return (currentSet.weight_logged > maxSet.weight_logged) ? currentSet : maxSet;
    }, sets[0]);
    
    // Apply the e1RM formula: weight * (1 + reps / 30)
    return maxWeightSet.weight_logged * (1 + maxWeightSet.reps_logged / 30);
  };

  const processDataForChart = () => {
    // Group logs by date
    const logsByDate = logData.reduce((acc, log) => {
      const date = log.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    }, {} as Record<number, LogData[]>);
    
    // Process each date's data
    const processedData: ProcessedDataPoint[] = Object.entries(logsByDate).map(([dateStr, logs]) => {
      const date = new Date(parseInt(dateStr) * 1000);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Calculate the value based on selected calculation type
      const value = calculationType === 'CES' 
        ? calculateCES(logs)
        : calculate1RM(logs);
      
      return {
        x: formattedDate,
        y: Number(value.toFixed(1)),
        timestamp: parseInt(dateStr)
      };
    });
    
    // Sort by timestamp and take only the last 10 points if there are more
    const sortedData = processedData
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-10);
    
    setChartData(sortedData);
  };

  // Render the chart
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Ionicons name="analytics-outline" size={60} color={theme.text} style={{ opacity: 0.5 }} />
          <Text style={[styles.noDataText, { color: theme.text }]}>
            {t('No data available for the selected criteria')}
          </Text>
        </View>
      );
    }

    const data = {
      labels: chartData.map(point => point.x),
      datasets: [
        {
          data: chartData.map(point => point.y),
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: [calculationType === 'CES' ? 'Combined Effort Score' : 'Estimated 1RM']
    };

    const chartConfig = {
      backgroundColor: theme.card,
      backgroundGradientFrom: theme.card,
      backgroundGradientTo: theme.card,
      decimalPlaces: 1,
      color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
      labelColor: (opacity = 1) => theme.text,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726'
      }
    };

    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          verticalLabelRotation={30}
        />
      </View>
    );
  };

  // Render timeframe selector buttons
  const renderTimeFrameButtons = () => {
    const timeFrames: { value: TimeFrame; label: string }[] = [
      { value: 'week', label: t('Week') },
      { value: 'month', label: t('Month') },
      { value: 'year', label: t('Year') },
      { value: 'all', label: t('All Time') }
    ];

    return (
      <View style={styles.timeFrameContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('Time Frame')}
        </Text>
        <View style={styles.buttonRow}>
          {timeFrames.map((frame) => (
            <TouchableOpacity
              key={frame.value}
              style={[
                styles.timeFrameButton,
                timeFrame === frame.value && styles.timeFrameButtonActive,
                { 
                  backgroundColor: timeFrame === frame.value ? theme.buttonBackground : theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setTimeFrame(frame.value)}
            >
              <Text 
                style={[
                  styles.timeFrameButtonText, 
                  timeFrame === frame.value && styles.timeFrameButtonTextActive,
                  { color: timeFrame === frame.value ? theme.buttonText : theme.text }
                ]}
              >
                {frame.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: theme.text }]}>
        {workoutName}
      </Text>
      
      {/* Calculation Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            calculationType === 'CES' && styles.toggleButtonActive,
            { backgroundColor: calculationType === 'CES' ? theme.buttonBackground : theme.card }
          ]}
          onPress={() => setCalculationType('CES')}
        >
          <Ionicons 
            name="fitness" 
            size={20} 
            color={calculationType === 'CES' ? theme.buttonText : theme.text} 
          />
          <Text style={[
            styles.toggleText, 
            { color: calculationType === 'CES' ? theme.buttonText : theme.text }
          ]}>
            {t('CES')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            calculationType === '1RM' && styles.toggleButtonActive,
            { backgroundColor: calculationType === '1RM' ? theme.buttonBackground : theme.card }
          ]}
          onPress={() => setCalculationType('1RM')}
        >
          <Ionicons 
            name="barbell" 
            size={20} 
            color={calculationType === '1RM' ? theme.buttonText : theme.text} 
          />
          <Text style={[
            styles.toggleText, 
            { color: calculationType === '1RM' ? theme.buttonText : theme.text }
          ]}>
            {t('1RM')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Day and Exercise Selectors */}
      <View style={styles.selectionContainer}>
        {/* Day selection */}
        <View style={styles.pickerContainer}>
          <Text style={[styles.pickerLabel, { color: theme.text }]}>
            {t('Select Day')}
          </Text>
          <View style={[styles.pickerWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
            >
              {days.map((day) => (
                <Picker.Item key={day.value} label={day.label} value={day.value} />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Exercise selection */}
        <View style={styles.pickerContainer}>
          <Text style={[styles.pickerLabel, { color: theme.text }]}>
            {t('Select Exercise')}
          </Text>
          <View style={[styles.pickerWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Picker
              selectedValue={selectedExercise}
              onValueChange={(itemValue) => setSelectedExercise(itemValue)}
              style={[styles.picker, { color: theme.text }]}
              dropdownIconColor={theme.text}
              enabled={exercises.length > 0}
            >
              {exercises.map((exercise) => (
                <Picker.Item key={exercise.value} label={exercise.label} value={exercise.value} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      
      {/* Graph Area */}
      <View style={styles.graphSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {calculationType === 'CES' ? t('Combined Effort Score') : t('Estimated 1RM')}
        </Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.buttonBackground} style={styles.loader} />
        ) : (
          renderChart()
        )}
        
        {/* Info about calculation */}
        <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            {calculationType === 'CES' ? t('About CES') : t('About 1RM')}
          </Text>
          <Text style={[styles.infoText, { color: theme.text }]}>
            {calculationType === 'CES' 
              ? t('CES (Combined Effort Score) measures your total workout volume accounting for weight, reps, and intensity.')
              : t('1RM (One Rep Max) estimates the maximum weight you could lift for a single repetition based on your performance.')}
          </Text>
        </View>
      </View>
      
      {/* Timeframe selector */}
      {renderTimeFrameButtons()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 10,
    padding: 8,
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  selectionContainer: {
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerWrapper: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  graphSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 220,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  infoBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeFrameContainer: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeFrameButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    minWidth: '22%',
    alignItems: 'center',
  },
  timeFrameButtonActive: {
    elevation: 2,
  },
  timeFrameButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeFrameButtonTextActive: {
    fontWeight: 'bold',
  },
  loader: {
    height: 220,
    justifyContent: 'center',
  },
}); 