import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Colors from '@/constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { forgotPassword, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    // If email was passed as a parameter, use it
    if (params.email && typeof params.email === 'string') {
      setEmail(params.email);
    }
  }, [params]);

  const handleResetPassword = async () => {
    // Basic validation
    if (!email) {
      setLocalError('Email is required');
      return;
    }

    try {
      setLocalError(null);
      await forgotPassword(email);
      setResetSent(true);
    } catch (error: any) {
      // Error is already handled in the auth context
      console.log('Password reset error:', error.message);
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
          <Text style={styles.title}>Reset Password</Text>
          
          {resetSent ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color={Colors.light.primaryGreen} />
              <Text style={styles.successText}>
                Password reset email sent. Please check your inbox.
              </Text>
              <TouchableOpacity style={styles.button} onPress={goToLogin}>
                <Text style={styles.buttonText}>BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
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
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>SEND RESET LINK</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
                <Text style={styles.switchText}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002E2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
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
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
}); 