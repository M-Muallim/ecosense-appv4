import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryGreen,
  },
  text: {
    color: '#fff',
    fontSize: 20,
    marginTop: 12,
  },
}); 