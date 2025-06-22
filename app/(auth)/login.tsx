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
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '@/constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Basic validation
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    try {
      setLocalError(null);
      await login(email, password);
      // Navigation is handled by the auth context
    } catch (error: any) {
      // Error is already handled in the auth context
      console.log('Login error:', error.message);
    }
  };

  const goToSignup = () => {
    router.push('/(auth)/register');
  };

  const handleForgotPassword = () => {
    if (!email) {
      setLocalError('Please enter your email first');
      return;
    }
    
    router.push({
      pathname: '/(auth)/forgot-password',
      params: { email }
    });
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
              <Text style={styles.logoText}>EcoS</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* White card overlapping the header */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back!</Text>
          {(localError || error) && <Text style={styles.error}>{localError || error}</Text>}

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

          <View style={styles.row}>
            
            <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={goToSignup} disabled={isLoading}>
            <Text style={styles.switchText}>
              New to EcoS? Sign Up
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
    fontWeight: '700',
    fontSize: 32,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  remember: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.light.primaryGreen,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primaryGreen,
  },
  rememberText: { 
    color: '#444' 
  },
  forgot: { 
    color: Colors.light.primaryGreen, 
    fontWeight: '600', 
    paddingLeft:'auto',
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