import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function FloatingCameraButton(props: { onPress?: () => void }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={props.onPress}
        style={({ pressed }): ViewStyle => ({
          ...styles.cameraButton,
          opacity: pressed ? 0.8 : 1,
          transform: [{ translateY: -40 }],
        })}
      >
        <View style={styles.innerButton}>
          <MaterialCommunityIcons name="camera-outline" size={32} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 70,
    zIndex: 2000,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    position: 'relative',
    borderWidth: 8,
    borderColor: 'white',
  },
  innerButton: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: Colors.light.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0, 
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 15,
  }
});
