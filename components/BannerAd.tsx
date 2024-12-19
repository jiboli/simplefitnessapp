import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAdContext } from '../context/AdContext';

interface BannerAdProps {
  adUnitId?: string;
}

const BannerAdComponent: React.FC<BannerAdProps> = ({
  adUnitId = 'ca-app-pub-9707948896132362/8972963349',
}) => {
  const { adsRemoved } = useAdContext(); // Access adsRemoved from context

  if (adsRemoved) return null; // Do not render ads if user paid to remove them
 const requestOptions = {requestNonPersonalizedAdsOnly: true,};


  return (
    <View style={styles.container}>
      <BannerAd unitId={adUnitId} size={BannerAdSize.BANNER} requestOptions={requestOptions} />
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
