// app/(tabs)/education.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';

type Site = {
  id: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
};

export default function DisposalMapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dummy disposal sites offset for testting reasons 
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    (async () => {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied');
        return;
      }

      // Get current position
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(initialRegion);

      // dummy nearby sites
      setSites([
        {
          id: 'a',
          title: 'Recycling Bin 1',
          coordinate: { latitude: latitude + 0.003, longitude: longitude + 0.002 },
        },
        {
          id: 'b',
          title: 'Recycling Bin 2',
          coordinate: { latitude: latitude - 0.0025, longitude: longitude - 0.003 },
        },
        {
          id: 'c',
          title: 'Recycling Center',
          coordinate: { latitude: latitude + 0.0015, longitude: longitude - 0.002 },
        },
      ]);
    })();
  }, []);

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!region) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation>
        <Marker coordinate={region} title="You are here" />
        {sites.map((site) => (
          <Marker
            key={site.id}
            coordinate={site.coordinate}
            title={site.title}
            pinColor={Colors.light.primaryGreen}
          />
        ))}
      </MapView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'tomato',
    fontSize: 16,
  },
});
