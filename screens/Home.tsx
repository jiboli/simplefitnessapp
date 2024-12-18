import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BannerAdComponent from '../components/BannerAd'; // Import the BannerAdComponent

const { height } = Dimensions.get('window'); // Get screen height for dynamic sizing

export default function Home({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Simple.</Text>
      </View>

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

      {/* Banner Ad Section */}
      <View style={styles.adContainer}>
        <BannerAdComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    color: '#000000',
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blackCard: {
    backgroundColor: '#000000',
    height: height * 0.25,
  },
  grayCard: {
    backgroundColor: '#808080',
    height: height * 0.22,
  },
  lightGrayCard: {
    backgroundColor: '#D3D3D3',
    height: height * 0.22,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  blackText: {
    color: '#000000',
  },
  darkGrayText: {
    color: 'white',
  },
  button: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 10,
    alignSelf: 'center',
  },
  whiteButton: {
    marginTop: 20,
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
    color: 'white',
  },
  adContainer: {
    alignItems: 'center',
  },
});
