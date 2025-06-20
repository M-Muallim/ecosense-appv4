// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserChallenges, getUserWeeklyStats, getUserLevel, completeUserChallenge } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.primaryGreen,
  },
  header: {
    backgroundColor: Colors.light.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  profileRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginLeft: 16 
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF33',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 9,
  },
  nameContainer: { 
    marginLeft: 12 
  },
  helloText: { 
    color: '#fff', 
    fontSize: 14,
    opacity: 0.9,
  },
  usernameText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '600', 
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F6F8F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    marginTop: -20,
  },
  scrollContent: { 
    paddingTop: 30,
    paddingBottom: 100,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  levelCard: {
    backgroundColor: '#fff',
    width: '95%',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 25,
    marginTop: 10,
  },
  progressCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FCFD',
  },
  progressInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  levelLabel: { 
    fontSize: 22, 
    fontWeight: '700',
    color: '#333',
    marginTop: 6,
  },
  progressTextContainer: {
    backgroundColor: '#F0F9FD',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  progressText: { 
    color: Colors.light.primaryGreen, 
    fontWeight: '600',
    fontSize: 16,
  },
  section: { 
    marginTop: 30,
    width: '95%',
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#333',
  },
  // Challenge styles
  challengesContainer: {
    width: '100%',
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  challengeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    marginBottom: 6,
    width: '100%',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.primaryGreen,
    borderRadius: 3,
  },
  challengeProgress: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  // Existing styles below
  cardsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '100%',
  },
  backgroundCurve: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.light.primaryGreen,
    borderRadius: 5,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 9,
  },
});

// Add a type for challenge
interface UserChallenge {
  id: number;
  challengeId: number;
  title: string;
  description: string;
  points: number;
  completed: boolean;
  completedAt: string | null;
  userCount?: number;
  required?: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [statsData, setStatsData] = useState<Record<string, number> | null>(null);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [levelProgress, setLevelProgress] = useState<{progress:number,needed:number,total:number} | null>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load profile, stats, and level only once (on mount or user change)
  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        setProfileData(profile);
        // Fetch weekly stats
        const stats = await getUserWeeklyStats(user.uid);
        setStatsData(stats);
        // Fetch user level/progress
        const levelData = await getUserLevel(user.uid);
        setUserLevel(levelData.level);
        setLevelProgress(levelData);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Load challenges every time the screen is focused
  useEffect(() => {
    (async () => {
      if (!user || !isFocused) return;
      try {
        const userChallenges = await getUserChallenges(user.uid);
        setChallenges(userChallenges);
      } catch (err) {
        console.error('Error loading challenges:', err);
      }
    })();
  }, [user, isFocused]);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      setProfileData(profile);
      const stats = await getUserWeeklyStats(user.uid);
      setStatsData(stats);
      const levelData = await getUserLevel(user.uid);
      setUserLevel(levelData.level);
      setLevelProgress(levelData);
      const userChallenges = await getUserChallenges(user.uid);
      setChallenges(userChallenges);
    } catch (err) {
      console.error('Error refreshing home data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
        <Text style={{ color: Colors.light.primaryGreen, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  // Compute progress within the current level
  const totalItems = statsData?.total ?? 0;
  const threshold = userLevel <= 10 ? 20 : 40;
  const offsetStart = userLevel <= 10 ? 20 * (userLevel - 1) : 200 + 40 * (userLevel - 11);
  let progressInLevel = totalItems - offsetStart;
  if (progressInLevel < 0) progressInLevel = 0;
  if (progressInLevel > threshold) progressInLevel = threshold;

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  profileData?.photoURL ||
                  user?.photoURL ||
                  'https://via.placeholder.com/100',
              }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.usernameText}>
              {profileData?.displayName ||
                user?.displayName ||
                user?.email?.split('@')[0] ||
                'User'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.contentArea}>
        <View style={styles.backgroundCurve} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primaryGreen]}
              tintColor={Colors.light.primaryGreen}
            />
          }
        >
          {/* Level Card */}
          <View style={styles.levelCard}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <MaterialCommunityIcons 
                  name="leaf-maple" 
                  size={80} 
                  color={Colors.light.primaryGreen} 
                />
                <Text style={styles.levelLabel}>
                  {`Level ${userLevel}`}
                </Text>
              </View>
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {levelProgress ? `${levelProgress.progress}/${levelProgress.needed} Recycle needed` : ''}
              </Text>
            </View>
          </View>

          {/* Challenges Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Challenges</Text>
            </View>
            
            <View style={styles.challengesContainer}>
              {challenges.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>No challenges assigned yet.</Text>
              ) : (
                challenges.map((challenge, idx) => {
                  const bgColor = '#E8FFF3';
                  // Use userCount and required from backend for accurate progress
                  const userCount = challenge.userCount ?? 0;
                  const required = challenge.required ?? 1;
                  const progress = Math.min((userCount / required) * 100, 100);
                  const left = Math.max(required - userCount, 0);
                  return (
                    <View key={challenge.id} style={styles.challengeCard}>
                      <View style={[styles.challengeIconContainer, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center' }]}> 
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#60CA9A' }}>{idx + 1}</Text>
                      </View>
                      <View style={styles.challengeContent}>
                        <Text style={styles.challengeTitle}>{challenge.title}</Text>
                        <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{challenge.description}</Text>
                        <View style={styles.progressBarContainer}>
                          <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.challengeProgress}>{userCount}/{required} completed ({left} left)</Text>
                        {!challenge.completed && null}
                        {challenge.completed && (
                          <Text style={{ color: '#60CA9A', fontWeight: 'bold', marginTop: 8 }}>Completed!</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
