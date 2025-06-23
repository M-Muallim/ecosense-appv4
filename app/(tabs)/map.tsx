// app/(tabs)/education.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Region, Polyline, Circle } from 'react-native-maps';
// Remove MapViewDirections
// import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';
import { API_BASE } from '../../config/apiConfig';
import polyline from '@mapbox/polyline';
import { useFocusEffect } from '@react-navigation/native';

// No need for GOOGLE_MAPS_APIKEY in frontend anymore

type Site = {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
  eta?: string;
};

const DEFAULT_REGION = {
  latitude: 39.82,
  longitude: 32.75,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Function to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Function to find the closest location
const findClosestLocation = (userLocation: { latitude: number; longitude: number }, sites: Site[]): Site | null => {
  if (!userLocation || sites.length === 0) return null;
  
  let closestSite = sites[0];
  let minDistance = calculateDistance(
    userLocation.latitude, 
    userLocation.longitude, 
    sites[0].latitude, 
    sites[0].longitude
  );
  
  for (let i = 1; i < sites.length; i++) {
    const distance = calculateDistance(
      userLocation.latitude, 
      userLocation.longitude, 
      sites[i].latitude, 
      sites[i].longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestSite = sites[i];
    }
  }
  
  return { ...closestSite, distance: minDistance };
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
  const [closestLocation, setClosestLocation] = useState<Site | null>(null);
  const [showClosestInfo, setShowClosestInfo] = useState(false);
  const [hasShownClosestCard, setHasShownClosestCard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Site | null>(null);
  const [showSelectedInfo, setShowSelectedInfo] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(10); // Default 10km
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);

  // Determine the center for radius and marker: user location if available, otherwise Ankara
  const centerLocation = userLocation || { latitude: 39.9334, longitude: 32.8597 };
  const showAnkaraMarker = !userLocation;

  // Function to get directions and calculate ETA
  const getDirectionsAndETA = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destinationStr = `${destination.latitude},${destination.longitude}`;
      const response = await fetch(`${API_BASE}/directions?origin=${originStr}&destination=${destinationStr}`);
      if (!response.ok) throw new Error('Failed to fetch directions');
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const duration = route.legs[0].duration.text; // e.g., "15 mins"
        const distance = route.legs[0].distance.text; // e.g., "2.3 km"
        return { duration, distance };
      }
      return null;
    } catch (error) {
      console.error('Error fetching directions:', error);
      return null;
    }
  };

  // Function to navigate to closest location
  const navigateToClosest = () => {
    if (closestLocation) {
      setDestination({ latitude: closestLocation.latitude, longitude: closestLocation.longitude });
      setShowClosestInfo(false);
    }
  };

  // Function to handle marker press and show ETA
  const handleMarkerPress = async (site: Site) => {
    if (!userLocation) return;
    
    setSelectedLocation(site);
    setShowSelectedInfo(true);
    
    // Get ETA for the selected location
    const directionsData = await getDirectionsAndETA(userLocation, { 
      latitude: site.latitude, 
      longitude: site.longitude 
    });
    
    if (directionsData) {
      setSelectedLocation({
        ...site,
        eta: directionsData.duration,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, site.latitude, site.longitude)
      });
    } else {
      setSelectedLocation({
        ...site,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, site.latitude, site.longitude)
      });
    }
    
    // Auto-hide after 6 seconds
    setTimeout(() => setShowSelectedInfo(false), 6000);
  };

  // Function to filter sites based on radius
  const filterSitesByRadius = (sites: Site[], userLocation: { latitude: number; longitude: number }, radius: number): Site[] => {
    if (!userLocation) return sites;
    
    return sites.filter(site => {
      // Check for valid coordinates
      if (isNaN(site.latitude) || isNaN(site.longitude) || 
          isNaN(userLocation.latitude) || isNaN(userLocation.longitude)) {
        console.log('Invalid coordinates found:', { site, userLocation });
        return false;
      }
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        site.latitude,
        site.longitude
      );
      
      console.log(`Distance to ${site.name}: ${distance.toFixed(1)}km`);
      return distance <= radius;
    }).map(site => ({
      ...site,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        site.latitude,
        site.longitude
      )
    }));
  };

  // Function to update radius filter
  const updateRadiusFilter = (radius: number) => {
    console.log('Updating radius filter to:', radius);
    console.log('Total sites available:', sites.length);
    setSelectedRadius(radius);
    if (userLocation && sites.length > 0) {
      const filtered = filterSitesByRadius(sites, userLocation, radius);
      setFilteredSites(filtered);
      console.log('Filtered sites count:', filtered.length);
      console.log('Sites within radius:', filtered.map(site => `${site.name} (${site.distance?.toFixed(1)}km)`));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      let locationSubscription: Location.LocationSubscription | null = null;
      // Reset all relevant state
      setUserLocation(null);
      setRegion(DEFAULT_REGION);
      setSites([]);
      setFilteredSites([]);
      setLoading(true);
      setErrorMsg(null);
      setHasShownClosestCard(false);
      setClosestLocation(null);
      setShowClosestInfo(false);
      setSelectedLocation(null);
      setShowSelectedInfo(false);
      setRouteCoords([]);
      // Fetch data as before
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
          if (isActive) {
            setSites(fixedData);
            if (userLocation) {
              const filtered = filterSitesByRadius(fixedData, userLocation, selectedRadius);
              setFilteredSites(filtered);
            }
          }
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
              const filtered = filterSitesByRadius(fixedData, {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              }, selectedRadius);
              setFilteredSites(filtered);
            }
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
          } else {
            if (isActive) {
              setRegion({
                latitude: 39.917492,
                longitude: 32.859737,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              });
              setFilteredSites(fixedData);
            }
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
        if (locationSubscription) locationSubscription.remove && locationSubscription.remove();
      };
    }, [])
  );

  // Effect to find closest location when both user location and sites are available
  useEffect(() => {
    if (userLocation && filteredSites.length > 0 && !hasShownClosestCard) {
      const closest = findClosestLocation(userLocation, filteredSites);
      if (closest) {
        // Get ETA for the closest location
        getDirectionsAndETA(userLocation, { latitude: closest.latitude, longitude: closest.longitude })
          .then((directionsData) => {
            if (directionsData) {
              setClosestLocation({
                ...closest,
                eta: directionsData.duration,
                distance: closest.distance // Keep the calculated distance as fallback
              });
            } else {
              setClosestLocation(closest);
            }
            // Show info about closest location ONCE
            setShowClosestInfo(true);
            setHasShownClosestCard(true);
            // Auto-hide after 8 seconds (longer to read ETA)
            setTimeout(() => setShowClosestInfo(false), 8000);
          })
          .catch(() => {
            setClosestLocation(closest);
            setShowClosestInfo(true);
            setHasShownClosestCard(true);
            setTimeout(() => setShowClosestInfo(false), 5000);
          });
      }
    }
  }, [userLocation, filteredSites, hasShownClosestCard]);

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
        {filteredSites.map((site: Site) => (
          <Marker
            key={site.id}
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            title={site.name}
            pinColor={closestLocation && site.id === closestLocation.id ? 'red' : Colors.light.primaryGreen}
            onPress={() => handleMarkerPress(site)}
          />
        ))}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={Colors.light.primaryGreen}
          />
        )}
        
        {/* Show Ankara marker if user location is not available */}
        {showAnkaraMarker && (
          <Marker
            coordinate={{ latitude: 39.9334, longitude: 32.8597 }}
            title="Ankara Center"
            description="Default center when location is off"
            pinColor="#007AFF"
          />
        )}
        {/* Show radius circle using centerLocation */}
        <Circle
          center={centerLocation}
          radius={selectedRadius * 1000}
          strokeColor="rgba(255, 165, 0, 0.3)"
          strokeWidth={2}
          fillColor="rgba(255, 165, 0, 0.1)"
        />
      </MapView>
      
      {/* Closest location info overlay */}
      {showClosestInfo && closestLocation && (
        <View style={styles.closestOverlay}>
          <View style={styles.closestCard}>
            <View style={styles.closestHeader}>
              <Text style={styles.closestTitle}>📍 Nearest Recycling Center</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowClosestInfo(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.closestName}>{closestLocation.name}</Text>
            
            <View style={styles.closestDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>
                  {closestLocation.distance ? `${closestLocation.distance.toFixed(1)} km` : 'Calculating...'}
                </Text>
              </View>
              
              {closestLocation.eta && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ETA:</Text>
                  <Text style={styles.detailValue}>{closestLocation.eta}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.navigateButton} onPress={navigateToClosest}>
              <Text style={styles.navigateButtonText}>🚗 Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Selected location info overlay */}
      {showSelectedInfo && selectedLocation && (
        <View style={styles.selectedOverlay}>
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedTitle}>📍 {selectedLocation.name}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowSelectedInfo(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.selectedDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>
                  {selectedLocation.distance ? `${selectedLocation.distance.toFixed(1)} km` : 'Calculating...'}
                </Text>
              </View>
              
              {selectedLocation.eta && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ETA:</Text>
                  <Text style={styles.detailValue}>{selectedLocation.eta}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.navigateButton} 
              onPress={() => {
                setDestination({ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude });
                setShowSelectedInfo(false);
              }}
            >
              <Text style={styles.navigateButtonText}>🚗 Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Radius Filter Button */}
      <View style={styles.radiusButtonContainer}>
        <TouchableOpacity 
          style={styles.radiusButton} 
          onPress={() => {
            console.log('Radius button pressed, current radius:', selectedRadius);
            setShowRadiusSelector(true);
          }}
        >
          <Text style={styles.radiusButtonText}>📍 {selectedRadius}km Radius</Text>
        </TouchableOpacity>
      </View>
      
      {/* Radius Selector Overlay */}
      {showRadiusSelector && (
        <View style={styles.radiusOverlay}>
          <View style={styles.radiusCard}>
            <View style={styles.radiusHeader}>
              <Text style={styles.radiusTitle}>Select Search Radius</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowRadiusSelector(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.radiusInfo}>
              Showing {filteredSites.length} of {sites.length} recycling centers within {selectedRadius}km
            </Text>
            <View style={styles.radiusOptions}>
              {[3, 5, 10, 15, 20, 50].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusOption,
                    selectedRadius === radius && styles.radiusOptionSelected
                  ]}
                  onPress={() => {
                    console.log('Radius option selected:', radius);
                    updateRadiusFilter(radius);
                  }}
                >
                  <Text style={[
                    styles.radiusOptionText,
                    selectedRadius === radius && styles.radiusOptionTextSelected
                  ]}>
                    {radius} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
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
  closestOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  closestCard: {
    backgroundColor: 'white',
    padding: 16,
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
  closestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closestTitle: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
  },
  closestName: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  closestDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
  },
  detailValue: {
    color: 'black',
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  navigateButton: {
    backgroundColor: 'orange',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  selectedCard: {
    backgroundColor: 'white',
    padding: 16,
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
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedTitle: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
  },
  selectedDetails: {
    marginBottom: 16,
  },
  radiusButtonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  radiusButton: {
    backgroundColor: 'orange',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  radiusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  radiusCard: {
    backgroundColor: 'white',
    padding: 16,
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
    marginTop: 16,
    marginBottom: 16,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radiusTitle: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 18,
  },
  radiusInfo: {
    color: 'black',
    fontSize: 14,
    marginBottom: 16,
    marginTop: 4,
  },
  radiusOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  radiusOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  radiusOptionSelected: {
    backgroundColor: 'orange',
  },
  radiusOptionText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  radiusOptionTextSelected: {
    color: 'white',
  },
});
