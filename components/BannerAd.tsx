import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import * as FileSystem from 'expo-file-system';

interface BannerAdProps {
  adUnitId?: string;
}

const BannerAdComponent: React.FC<BannerAdProps> = ({
  adUnitId = TestIds.BANNER, // Use TestIds for testing
}) => {
  const [adsRemoved, setAdsRemoved] = useState(false);

  useEffect(() => {
    const checkAdsStatus = async () => {
      const path = `${FileSystem.documentDirectory}ads_removed.json`;
      const fileExists = await FileSystem.getInfoAsync(path);
      if (fileExists.exists) setAdsRemoved(true);
    };
    checkAdsStatus();
  }, []);

  if (adsRemoved) return null; // Do not render ads if user paid to remove them

  return (
    <View style={styles.container}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default BannerAdComponent;
