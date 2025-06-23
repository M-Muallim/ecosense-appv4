
// app/(tabs)/_layout.tsx
import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FloatingCameraButton from '../_components/FloatingCameraButton';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      {/* Curve at top of tab bar */}
      <View style={styles.curveContainer}>
        <View style={styles.curve} />
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 65 + insets.bottom,
            paddingBottom: 5 + insets.bottom,
            paddingTop: 5,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarActiveTintColor: '#60CA9A',
          tabBarInactiveTintColor: '#999',
          tabBarItemStyle: {
            paddingVertical: 6,
          },
        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarLabel: "Home",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="home" size={32} color={color} />
            ),
          }}
        />

        {/* Map */}
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarLabel: "Map",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="map-marker" size={32} color={color} />
            ),
          }}
        />

        {/* Camera */}
        <Tabs.Screen
          name="camera"
          options={{
            tabBarButton: ({ onPress, ...rest }: any) => (
              <FloatingCameraButton
                {...rest}
                onPress={() => onPress?.()}
              />
            ),
          }}
        />

        {/* Leaderboard */}
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: "Leaderboard",
            tabBarLabel: "Leaderboard",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="chart-bar"
                size={32}
                color={color}
              />
            ),
          }}
        />

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarLabel: "Profile",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={32} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  curveContainer: {
    position: 'absolute',
    bottom: 65,
    alignItems: 'center',
    width: '100%',
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  curve: {
    width: 100,
    height: 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'white',
    transform: [{ scaleX: 1.1 }],
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
