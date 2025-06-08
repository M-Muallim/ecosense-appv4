import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '@/constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLocalError(null);
    
    // Basic validation
    if (!username || !email || !password) {
      setLocalError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    
    try {
      await register(email, password, username);
      // Navigation is handled by the auth context
    } catch (error: any) {
      // Error is already handled in the auth context
      console.log('Registration error:', error.message);
    }
  };

  const goToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.light.primaryGreen} />
      {Platform.OS === 'android' && (
        <RNStatusBar backgroundColor={Colors.light.primaryGreen} barStyle="light-content" />
      )}

      <KeyboardAwareScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 20}
        bounces={false}
        overScrollMode="never"
      >
        {/* Curved dark-green header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>Logo</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* White card overlapping the header */}
        <View style={styles.card}>
          <Text style={styles.title}>Getting Started</Text>
          {(localError || error) && <Text style={styles.error}>{localError || error}</Text>}

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="johndoe123"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#888"
            />
          </View>

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="johndoe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#888"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPass}
              editable={!isLoading}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} disabled={isLoading}>
              <Ionicons
                name={showPass ? 'eye' : 'eye-off'}
                size={20}
                color="#888"
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor="#888"
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>SIGN UP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
            <Text style={styles.switchText}>
              Already User? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: Colors.light.primaryGreen
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    backgroundColor: Colors.light.primaryGreen,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  logoWrapper: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#A6F4C5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { 
    color: Colors.light.primaryGreen, 
    fontWeight: '700' 
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 30,
    marginTop: -60,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002E2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  error: { 
    color: 'red', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  label: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 12, 
    marginBottom: 4 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  icon: { 
    marginLeft: 12 
  },
  eyeIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    height: 48, 
    paddingHorizontal: 12, 
    color: '#333' 
  },
  button: {
    backgroundColor: Colors.light.primaryGreen,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchText: {
    textAlign: 'center',
    color: Colors.light.primaryGreen,
    fontWeight: '600',
    marginTop: 8,
  },
}); 