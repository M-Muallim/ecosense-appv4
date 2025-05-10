import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import Colors from '@/constants/Colors';

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const hide = requestAnimationFrame(() => SplashScreen.hideAsync().catch(() => {}));
    return () => cancelAnimationFrame(hide);
  }, []);

  return (
    <View style={styles.container}>
      {/* spinner first */}
      <LottieView
        source={require('../../assets/spinner.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={{ width: 140, height: 140 }}
      />

      {/* app name underneath */}
      <Text style={styles.title}>EcoSense</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 36,
    fontWeight: '600',
    color: Colors.light.secondaryGreen,
  },
});
