import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'expo-router';
import { updateUserProfile, getUserProfile } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
// import { getUserProfile } from '../../services/userService';
// TODO: Fetch user profile from backend API here if needed

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgcdkuyew/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'StarWalkin';

async function uploadImageToBackend(imageUri, firebaseUid) {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: `${firebaseUid}.jpg`,
  });
  formData.append('firebaseUid', firebaseUid);

  const response = await fetch('http://192.168.1.124:3001/upload-profile-image', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    Alert.alert('Image Upload Failed', JSON.stringify(data));
    throw new Error('Backend upload failed');
  }
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURI, setPhotoURI] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permissions are required to select a profile photo.');
      }
      if (!user) return setLoading(false);
      try {
        const data = await getUserProfile(user.uid);
        if (data?.displayName) setDisplayName(data.displayName);
        if (data?.bio) setBio(data.bio);
        if (data?.photoURL) setPhotoURI(data.photoURL);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.cancelled) {
        const uri = result.assets ? result.assets[0].uri : result.uri;
        setPhotoURI(uri);
      }
    } catch (err) {
      console.error('Image pick error:', err);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let finalPhotoUrl = photoURI;
      if (photoURI && !photoURI.startsWith('http')) {
        console.log('Uploading new image to backend:', photoURI);
        finalPhotoUrl = await uploadImageToBackend(photoURI, user.uid);
        console.log('Backend returned Cloudinary URL:', finalPhotoUrl);
      } else {
        console.log('Using existing image URL:', photoURI);
      }
      await updateUserProfile(user.uid, { displayName, bio, photoUrl: finalPhotoUrl });
      Alert.alert('Profile Updated', 'Your profile has been updated.');
      router.back();
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update profile. ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.primaryGreen }}>
        <Text style={{ color: 'white', fontSize: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={32} color="#4CAF50" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {photoURI ? (
          <Image source={{ uri: photoURI }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Select Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Username"
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          multiline
        />
      </View>
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoContainer: { alignSelf: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderText: { color: '#666' },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, fontSize: 16 },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 6, alignItems: 'center' },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  closeButton: {
    position: 'absolute',
    top: 30,
    left: 16,
    zIndex: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
}); 