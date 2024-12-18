import React from 'react';
import { View, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAdContext } from '../context/AdContext'; // Import the context
import { requestPurchase } from 'react-native-iap';
import { TouchableOpacity, Text, StyleSheet } from 'react-native'; // Add these imports

const RemoveAdsButton = () => {
  const { adsRemoved, setAdsRemoved } = useAdContext(); // Access context state

  const handlePurchase = async () => {
    try {
      await requestPurchase({ sku: 'remove_ads' }); // Replace with your real product ID
      const path = `${FileSystem.documentDirectory}ads_removed.json`;
      await FileSystem.writeAsStringAsync(
        path,
        JSON.stringify({ adsRemoved: true })
      );
      setAdsRemoved(true); // Update the global context state
      Alert.alert('Success', 'Ads have been removed!');
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    }
  };

  if (adsRemoved) return null; // Hide button if ads are already removed

  return (
<TouchableOpacity style={styles.button} onPress={handlePurchase}>
  <Text style={styles.buttonText}>Remove Ads for $1</Text>
</TouchableOpacity>
  );

  
};


const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center', // Center the text
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


export default RemoveAdsButton;
