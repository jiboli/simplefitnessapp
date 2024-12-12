// Home.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Home({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>Simple.</Text>

      {/* Create a Workout Section */}
      <View style={[styles.card, styles.blackCard]}>
        <Text style={[styles.cardTitle, styles.whiteText]}>Create a workout.</Text>
        <TouchableOpacity
          style={[styles.button, styles.whiteButton]}
          onPress={() => navigation.navigate('My Workouts')}
        >
          <Text style={[styles.buttonText, styles.blackText]}>Go to My Workouts &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Your Workout Section */}
      <View style={[styles.card, styles.grayCard]}>
        <Text style={[styles.cardTitle, styles.darkGrayText]}>Schedule your workout.</Text>
        <TouchableOpacity
          style={[styles.button, styles.darkGrayButton]}
          onPress={() => navigation.navigate('My Calendar')}
        >
          <Text style={[styles.buttonText, styles.lightGrayText]}>Go to My Calendar &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Track Your Progress Section */}
      <View style={[styles.card, styles.lightGrayCard]}>
        <Text style={[styles.cardTitle, styles.blackText]}>Track your progress.</Text>
        <TouchableOpacity
          style={[styles.button, styles.blackButton]}
          onPress={() => navigation.navigate('My Progress')}
        >
          <Text style={[styles.buttonText, styles.whiteText]}>Go to My Progress &gt;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Background color
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000000', // Black text for title
  },
  card: {
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    height: 120, // Uniform height for all cards
    justifyContent: 'center', // Centers content vertically
  },
  blackCard: {
    backgroundColor: '#000000', // Black background
  },
  grayCard: {
    backgroundColor: '#808080', // Medium gray background
  },
  lightGrayCard: {
    backgroundColor: '#D3D3D3', // Light gray background
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center', // Center text horizontally
    marginBottom: 10,
  },
  whiteText: {
    color: '#FFFFFF', // White text
  },
  blackText: {
    color: '#000000', // Black text
  },
  darkGrayText: {
    color: '#505050', // Dark gray text for the "Schedule your workout" card
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: 'center', // Centers button horizontally
  },
  whiteButton: {
    backgroundColor: '#FFFFFF', // White button
  },
  blackButton: {
    backgroundColor: '#000000', // Black button
  },
  darkGrayButton: {
    backgroundColor: '#505050', // Dark gray button for "Schedule your workout" card
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lightGrayText: {
    color: '#B0B0B0', // Light gray text for button on the "Schedule your workout" card
  },
});
