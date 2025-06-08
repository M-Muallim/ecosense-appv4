// app/(tabs)/education.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';

const GOOGLE_MAPS_APIKEY = '<YOUR_API_KEY_HERE>'; // replace with your Google Maps API key

type Site = {
  id: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
};

export default function DisposalMapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [destination, setDestination] = useState<Site['coordinate'] | null>(null);

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
      <View style={[styles.center, { backgroundColor: Colors.light.primaryGreen }] }>
        <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
      >
        <Marker coordinate={region} title="You are here" />
        {sites.map((site) => (
          <Marker
            key={site.id}
            coordinate={site.coordinate}
            title={site.title}
            pinColor={Colors.light.primaryGreen}
            onPress={() => setDestination(site.coordinate)}
          />
        ))}
        {destination && (
          <MapViewDirections
            origin={region}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor={Colors.light.primaryGreen}
            onError={(err) => console.error('Directions error:', err)}
          />
        )}
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
