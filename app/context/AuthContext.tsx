import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { 
  User, 
  AuthState, 
  registerUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser,
  resetPassword,
  getFirebaseErrorMessage
} from '../services/firebaseAuth';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  forgotPassword: async () => {},
  error: null,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuthStatus = async () => {
      try {
        const authState = await getCurrentUser();
        
        setState({
          user: authState.user,
          token: authState.token,
          isAuthenticated: authState.authenticated,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    checkAuthStatus();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!state.isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page if not authenticated
      router.replace('/(auth)/login');
    } else if (state.isAuthenticated && inAuthGroup) {
      // Redirect to the main app if authenticated
      router.replace('/(tabs)');
    }
  }, [state.isAuthenticated, state.isLoading, segments, router]);

  // Login function
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const authState = await signInUser(email, password);
      
      setState({
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.authenticated,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      // Extract Firebase error code if available
      if (error.message && error.message.includes(':')) {
        const errorCode = error.message.split(':')[0];
        errorMessage = getFirebaseErrorMessage(errorCode);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (email: string, password: string, displayName?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const authState = await registerUser(email, password, displayName);
      
      setState({
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.authenticated,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      // Extract Firebase error code if available
      if (error.message && error.message.includes(':')) {
        const errorCode = error.message.split(':')[0];
        errorMessage = getFirebaseErrorMessage(errorCode);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await signOutUser();
      
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Logout failed',
      }));
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      let errorMessage = 'Password reset failed';
      
      // Extract Firebase error code if available
      if (error.message && error.message.includes(':')) {
        const errorCode = error.message.split(':')[0];
        errorMessage = getFirebaseErrorMessage(errorCode);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
    forgotPassword,
    error: state.error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Default export for the module
const AuthContextExport = {
  AuthProvider,
  useAuth
};

export default AuthContextExport; 