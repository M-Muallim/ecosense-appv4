// app/(tabs)/education.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
// Remove MapViewDirections
// import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';
import { API_BASE } from '../../config/apiConfig';
import polyline from '@mapbox/polyline';

// No need for GOOGLE_MAPS_APIKEY in frontend anymore

type Site = {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
};

const DEFAULT_REGION = {
  latitude: 39.82,
  longitude: 32.75,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function DisposalMapScreen() {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let isActive = true;
    let locationSubscription: Location.LocationSubscription | null = null;
    const fetchData = async () => {
      try {
        const sitesRes = await fetch(`${API_BASE}/locations`);
        if (!sitesRes.ok) throw new Error('Failed to fetch locations');
        const data = await sitesRes.json();
        const fixedData = data.map((site: any) => ({
          ...site,
          latitude: Number(site.latitude),
          longitude: Number(site.longitude),
        }));
        if (isActive) setSites(fixedData);
        // Get user location and start watching
      const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
          if (isActive) {
            setUserLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
            setRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
            });
          }
          // Start watching user location
          locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (loc) => {
              if (isActive) {
                setUserLocation({
                  latitude: loc.coords.latitude,
                  longitude: loc.coords.longitude,
                });
              }
            }
          );
        }
      } catch (error) {
        if (isActive) setErrorMsg('Failed to load map data');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isActive = false;
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    const fetchDirections = async () => {
      if (userLocation && destination) {
        try {
          const originStr = `${userLocation.latitude},${userLocation.longitude}`;
          const destinationStr = `${destination.latitude},${destination.longitude}`;
          const response = await fetch(`${API_BASE}/directions?origin=${originStr}&destination=${destinationStr}`);
          if (!response.ok) throw new Error('Failed to fetch directions');
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const points = polyline.decode(data.routes[0].overview_polyline.points);
            const coords = points.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng }));
            setRouteCoords(coords);
          } else {
            setRouteCoords([]);
          }
        } catch (err) {
          setRouteCoords([]);
        }
      } else {
        setRouteCoords([]);
      }
    };
    fetchDirections();
  }, [destination, userLocation]);

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
        <Text style={{ color: Colors.light.primaryGreen, marginTop: 12 }}>{errorMsg}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
        <Text style={{ color: Colors.light.primaryGreen, marginTop: 12 }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
      >
        {/* Render fetched markers */}
        {sites.map((site: Site) => (
          <Marker
            key={site.id}
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            title={site.name}
            pinColor={Colors.light.primaryGreen}
            onPress={() => setDestination({ latitude: site.latitude, longitude: site.longitude })}
          />
        ))}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={Colors.light.primaryGreen}
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
  routeLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  calloutContainer: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 8,
    borderColor: 'orange',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  calloutText: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
