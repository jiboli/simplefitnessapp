import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateWorkout() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create a New Workout</Text>
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
