// screens/Home.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const { height } = Dimensions.get('window'); // Get screen height for dynamic sizing

export default function Home({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* App Title */}
      <Text style={styles.title}>Simple.</Text>

      {/* Create a Workout Section */}
      <View style={[styles.card, styles.blackCard]}>
        <Text style={[styles.cardTitle, styles.whiteText]}>
          Create a{"\n"}workout.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.whiteButton]}
          onPress={() => navigation.navigate('My Workouts')}
        >
          <Text style={[styles.buttonText, styles.blackText]}>Go to My Workouts &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Schedule Your Workout Section */}
      <View style={[styles.card, styles.grayCard]}>
        <Text style={[styles.cardTitle, styles.darkGrayText]}>
          Schedule{"\n"}your{"\n"}workout.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.darkGrayButton]}
          onPress={() => navigation.navigate('My Calendar')}
        >
          <Text style={[styles.buttonText, styles.lightGrayText]}>Go to My Calendar &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Track Your Progress Section */}
      <View style={[styles.card, styles.lightGrayCard]}>
        <Text style={[styles.cardTitle, styles.blackText]}>
          Track{"\n"}your{"\n"}progress.
        </Text>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 30, // Reduced spacing above the title
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    marginBottom: 20, // Compact spacing between title and first card
    textAlign: 'center',
    color: '#000000',
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 10, // Compact spacing between cards
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackCard: {
    backgroundColor: '#000000',
    height: height * 0.25, // Adjusted to 25% of screen height
  },
  grayCard: {
    backgroundColor: '#808080',
    height: height * 0.22, // Slightly smaller than the first card
  },
  lightGrayCard: {
    backgroundColor: '#D3D3D3',
    height: height * 0.22, // Matches the gray card
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30, // Add line spacing for better readability
  },
  whiteText: {
    color: '#FFFFFF',
  },
  blackText: {
    color: '#000000',
  },
  darkGrayText: {
    color: '#404040',
  },
  button: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 10, // Space between text and button
    alignSelf: 'center',
  },
  whiteButton: {
    marginTop:20,
    backgroundColor: '#FFFFFF',
  },
  blackButton: {
    backgroundColor: '#000000',
  },
  darkGrayButton: {
    backgroundColor: '#505050',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  lightGrayText: {
    color: '#bfbfbf',
  },
});
