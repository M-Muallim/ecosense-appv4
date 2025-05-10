import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the auth login screen
  return <Redirect href="/(auth)/login" />;
} 