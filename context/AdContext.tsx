import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import { getAvailablePurchases } from 'react-native-iap';

interface AdContextProps {
  adsRemoved: boolean;
  setAdsRemoved: (value: boolean) => void;
}

const AdContext = createContext<AdContextProps>({
  adsRemoved: false,
  setAdsRemoved: () => {},
});

export const AdProvider = ({ children }: { children: ReactNode }) => {
  const [adsRemoved, setAdsRemoved] = useState(false);

  const checkIfUserPaid = async () => {
    try {
      const path = `${FileSystem.documentDirectory}ads_removed.json`;
      const fileExists = await FileSystem.getInfoAsync(path);

      if (fileExists.exists) {
        setAdsRemoved(true); // Update context state if local file exists
        console.log('User has already paid')
        return;
      }

      // Fetch purchases from the store if local file is missing
      const purchases = await getAvailablePurchases();

      // Log all product IDs
        console.log('Fetched purchases:', purchases.map(purchase => purchase.productId));
        
      const isRemoveAdsPurchased = purchases.some(
        (purchase) => purchase.productId === 'remove_ads'
      );

      if (isRemoveAdsPurchased) {
        // Save purchase status locally
        await FileSystem.writeAsStringAsync(
          path,
          JSON.stringify({ adsRemoved: true })
        );
        setAdsRemoved(true);
        console.log('User has the purchase, downloading the file')
      }

      else {console.log('User did not pay')}

    } catch (error) {
      console.error('Error checking purchases:', error);
    }
  };

  useEffect(() => {
    checkIfUserPaid(); // Run this when the app starts
  }, []);

  return (
    <AdContext.Provider value={{ adsRemoved, setAdsRemoved }}>
      {children}
    </AdContext.Provider>
  );
};

export const useAdContext = () => useContext(AdContext);
