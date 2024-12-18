import React from 'react';
import { View, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useAdContext } from '../context/AdContext'; // Import the context
import { requestPurchase } from 'react-native-iap';

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
    <View>
      <Button title="Remove Ads for $1" onPress={handlePurchase} />
    </View>
  );
};

export default RemoveAdsButton;
