import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutDetails() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout Details</Text>
      {/* Add your form or other components here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
