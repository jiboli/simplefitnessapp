import React, { useEffect, useState } from 'react';
import { View, Button, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {
  getAvailablePurchases,
  requestPurchase,
  useIAP,
  Purchase,
  Product,
  finishTransaction,
} from 'react-native-iap';

const productId = 'remove_ads'; // Replace with your real product ID

const RemoveAdsButton = () => {
  const [hasPaid, setHasPaid] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const { getProducts, currentPurchase } = useIAP();

  // Check if user already paid (on startup)
  const checkIfUserPaid = async () => {
    try {
      // Check locally first
      const path = `${FileSystem.documentDirectory}ads_removed.json`;
      const fileExists = await FileSystem.getInfoAsync(path);

      if (fileExists.exists) {
        setHasPaid(true);
        return;
      }

      // If no local record, fetch purchases from the store
      const purchases = await getAvailablePurchases();
      const isRemoveAdsPurchased = purchases.some(
        (purchase) => purchase.productId === productId
      );

      if (isRemoveAdsPurchased) {
        // Persist state locally
        await FileSystem.writeAsStringAsync(
          path,
          JSON.stringify({ adsRemoved: true })
        );
        setHasPaid(true);
      }
    } catch (error) {
      console.error('Error checking purchases:', error);
    }
  };

  // Fetch products (getProducts)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const items = await getProducts({ skus: [productId] });
        if (Array.isArray(items)) {
          setProducts(items);
        } else {
          console.error('getProducts did not return a valid array:', items);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
    checkIfUserPaid();
  }, []);

  // Handle purchase completion
  useEffect(() => {
    const completePurchase = async () => {
      if (currentPurchase && currentPurchase.productId === productId) {
        try {
          // Save "ads_removed" to filesystem
          await FileSystem.writeAsStringAsync(
            `${FileSystem.documentDirectory}ads_removed.json`,
            JSON.stringify({ adsRemoved: true })
          );
          setHasPaid(true);
          Alert.alert('Success', 'Ads have been removed!');
          await finishTransaction({ purchase: currentPurchase, isConsumable: false });
        } catch (error) {
          console.error('Error finishing purchase:', error);
        }
      }
    };

    completePurchase();
  }, [currentPurchase]);

  // Initiate purchase
  const handlePurchase = async () => {
    try {
      await requestPurchase({ sku: productId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Purchase Failed', errorMessage);
    }
  };

  // If user already paid, hide the button
  if (hasPaid) return null;

  return (
    <View>
      <Button title="Remove Ads for $1" onPress={handlePurchase} />
    </View>
  );
};

export default RemoveAdsButton;
