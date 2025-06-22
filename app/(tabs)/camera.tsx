// app/(tabs)/camera.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, Button, Image, ActivityIndicator, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';

// Type for the backend response 
type PredictionResult = {
  label: string;
  confidence: number;
  [key: string]: any;
};

if (Platform.OS !== 'web') {
  // import and use react-native-maps
}

const CLASS_NAME_MAP: Record<string, string> = {
  "Clothes": "Plastic",
  "Plastic": "Organic",
  "Organic": "Metal",
  "Metal": "Paper",
  "Paper": "Glass",
  "Glass": "Paper",
};

const FACTS_MAP: Record<string, string[]> = {
  "Paper": [
    "-1 ton of recycled paper saves 17 trees.",
    "-Paper can be recycled 5–7 times.",
    "-Greasy paper can't be recycled.",
    "-Over 60% of paper is recycled globally."
  ],
  "Plastic": [
    "-Only 9% of all plastic ever made is recycled.",
    "-Only plastics labeled PET and HDPE are widely recyclable.",
    "-Plastic is often downcycled into lower-quality products.",
    "-A plastic bottle takes up to 450 years to decompose."
  ],
  "Metal": [
    "-Aluminum and steel can be recycled forever.",
    "-Recycling aluminum saves 95% energy compared to new production.",
    "-A recycled can returns to shelves in 60 days.",
    "-Steel cans are easy to sort using magnets."
  ],
  "Glass": [
    "-Glass can be recycled endlessly with no quality loss.",
    "-One recycled bottle powers a light bulb for 4 hours.",
    "-Glass must be sorted by color (clear, green, brown).",
    "-Ceramics and Pyrex can't be recycled with glass."
  ]
};

export default function CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useIsFocused();
  const hasOpenedCamera = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to take pictures.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setResult(null);
      setError(null);
    }
    hasOpenedCamera.current = false;
  }, []);

  React.useEffect(() => {
    if (isFocused && !image && !hasOpenedCamera.current) {
      hasOpenedCamera.current = true;
      openCamera();
    }
  }, [isFocused, image, openCamera]);

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any); 
      const response = await fetch('http://192.168.1.116:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to get prediction');
      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setResult(null);
    setError(null);
    hasOpenedCamera.current = false;
  };

  useEffect(() => {
    if (result && result.predictions && result.predictions.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [result]);

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {!image ? (
        <Text style={styles.text}>Opening camera…</Text>
      ) : (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <Button title="Upload & Predict" onPress={uploadImage} disabled={uploading} />
          <Button title="Retake" onPress={handleRetake} />
        </>
      )}
      {uploading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            Prediction: {result && result.predictions && result.predictions.length > 0
              ? result.predictions.map((pred: any, idx: number) =>
                  `${CLASS_NAME_MAP[pred.class] || pred.class}${idx < result.predictions.length - 1 ? ', ' : ''}`
                ).join('')
              : 'No prediction'}
          </Text>
        </View>
      )}
      {result && result.predictions && result.predictions.length > 0 && (
        <View style={{ marginTop: 16, backgroundColor: '#e0ffe0', borderRadius: 8, padding: 12 }}>
          <Text style={styles.resultText}>
            Prediction: {(() => {
              const mappedClass: string = CLASS_NAME_MAP[result.predictions[0].class] || result.predictions[0].class;
              return mappedClass;
            })()}
          </Text>
          {(() => {
            const mappedClass: string = CLASS_NAME_MAP[result.predictions[0].class] || result.predictions[0].class;
            const facts: string[] | undefined = FACTS_MAP[mappedClass];
            return facts ? (
              facts.map((fact: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 15, marginBottom: 4 }}>{fact}</Text>
              ))
            ) : (
              <Text style={{ fontSize: 15 }}>No facts available for this item.</Text>
            );
          })()}
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 16,
    borderRadius: 8,
  },
  resultBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
  },
  resultText: {
    color: '#222',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
  },
  text: {
    color: '#555',
    fontSize: 16,
  },
});