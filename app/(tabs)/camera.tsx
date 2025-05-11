// app/(tabs)/camera.tsx
import React, { useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';

export default function CameraScreen() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    (async () => {
      // 1) Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Camera permission is needed to take pictures.'
        );
        return;
      }

      // 2) Launch native camera UI
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      console.log('📷 Camera result:', result);
      // TODO: handle result.uri
    })();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Opening camera…</Text>
    </View>
  );
}
//fdsfkjlsdf fdgdfg
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#555',
    fontSize: 16,
  },
});