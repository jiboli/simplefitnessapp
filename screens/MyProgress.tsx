import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { WeightLogStackParamList} from '../App'; // Adjust path to where WorkoutStackParamList is defined

type WeightLogNavigationProp = StackNavigationProp<WeightLogStackParamList, 'LogWeights'>;

export default function MyProgress() {
    const navigation = useNavigation<WeightLogNavigationProp>();
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Progress</Text>

      {/* Log Weights Button */}
      <TouchableOpacity
        style={styles.logWeightsButton}
        onPress={() => navigation.navigate('LogWeights')}
      >
        <Ionicons name="barbell-outline" size={24} color="#FFFFFF" />
        <Text style={styles.logWeightsButtonText}>Log Weights</Text>
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
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
    color: '#000000',
  },
  logWeightsButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  logWeightsButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});
