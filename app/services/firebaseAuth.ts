import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCF0hH5uiUqZ7l4R61x0EEky-7vdbPLAE",
  authDomain: "ecosense-7585a.firebaseapp.com",
  projectId: "ecosense-7585a",
  storageBucket: "ecosense-7585a.firebasestorage.app",
  messagingSenderId: "170805910426",
  appId: "1:170805910426:web:1feb8b45084f5201877823",
  measurementId: "G-Z17TX44RB9"
};

// Firebase Auth REST API endpoints
const API_KEY = firebaseConfig.apiKey;
const SIGN_UP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
const SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
const PASSWORD_RESET_URL = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;
const USER_INFO_URL = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;

// Storage keys
const AUTH_USER_KEY = 'auth_user';
const AUTH_TOKEN_KEY = 'auth_token';

// User type definition
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  authenticated: boolean;
}

// Helper function to store auth data
const storeAuthData = async (user: User, token: string, expiresIn: number) => {
  try {
    const expirationDate = new Date().getTime() + expiresIn * 1000;
    const userData = JSON.stringify({
      ...user,
      expirationDate
    });
    
    await AsyncStorage.setItem(AUTH_USER_KEY, userData);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Helper function to clear auth data
const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Register a new user
export const registerUser = async (email: string, password: string, displayName?: string): Promise<AuthState> => {
  try {
    const response = await fetch(SIGN_UP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    const user: User = {
      uid: data.localId,
      email: data.email,
      displayName: displayName || data.displayName,
      photoURL: data.photoUrl,
      emailVerified: data.emailVerified || false
    };

    await storeAuthData(user, data.idToken, parseInt(data.expiresIn));

    return {
      user,
      token: data.idToken,
      authenticated: true
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Sign in existing user
export const signInUser = async (email: string, password: string): Promise<AuthState> => {
  try {
    const response = await fetch(SIGN_IN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Authentication failed');
    }

    const user: User = {
      uid: data.localId,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoUrl,
      emailVerified: data.emailVerified || false
    };

    await storeAuthData(user, data.idToken, parseInt(data.expiresIn));

    return {
      user,
      token: data.idToken,
      authenticated: true
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const response = await fetch(PASSWORD_RESET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        requestType: 'PASSWORD_RESET'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Password reset failed');
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  await clearAuthData();
};

// Get current user from storage
export const getCurrentUser = async (): Promise<AuthState> => {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

    if (!userData || !token) {
      return { user: null, token: null, authenticated: false };
    }

    const parsedUser = JSON.parse(userData);
    
    // Check if token has expired
    if (parsedUser.expirationDate && new Date().getTime() > parsedUser.expirationDate) {
      await clearAuthData();
      return { user: null, token: null, authenticated: false };
    }

    // Remove expirationDate from user object before returning
    const { expirationDate, ...user } = parsedUser;

    return {
      user,
      token,
      authenticated: true
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, token: null, authenticated: false };
  }
};

// Get fresh user data
export const refreshUserData = async (token: string): Promise<User> => {
  try {
    const response = await fetch(USER_INFO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: token
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get user info');
    }

    const userData = data.users[0];
    
    const user: User = {
      uid: userData.localId,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoUrl,
      emailVerified: userData.emailVerified || false
    };

    return user;
  } catch (error: any) {
    console.error('Refresh user data error:', error);
    throw error;
  }
};

// Firebase error message parser
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'EMAIL_EXISTS':
      return 'This email is already in use';
    case 'OPERATION_NOT_ALLOWED':
      return 'Password sign-in is disabled';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'Too many attempts. Try again later';
    case 'EMAIL_NOT_FOUND':
      return 'Email not found';
    case 'INVALID_PASSWORD':
      return 'Invalid password';
    case 'USER_DISABLED':
      return 'This account has been disabled';
    default:
      return 'An error occurred. Please try again';
  }
};

// Default export for the module
const firebaseAuth = {
  registerUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  resetPassword,
  refreshUserData,
  getFirebaseErrorMessage
};

export default firebaseAuth; 