// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getUserProfile, getUserWeeklyStats } from '../../services/userService';
import { useIsFocused } from '@react-navigation/native';
import Colors from '../../constants/Colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) {
        setProfileLoading(false);
        setStatsLoading(false);
        return;
      }
      try {
        setProfileLoading(true);
        setStatsLoading(true);
        const [profile, stats] = await Promise.all([
          getUserProfile(user.uid),
          getUserWeeklyStats(user.uid),
        ]);
        setProfileData(profile);
        // Calculate total from all types
        const total = Object.values(stats).reduce((sum, n) => sum + n, 0);
        setStatsData({ total, ...stats });
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setProfileLoading(false);
        setStatsLoading(false);
      }
    })();
  }, [user, isFocused]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  if (profileLoading || statsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
        <Text style={{ color: Colors.light.primaryGreen, marginTop: 12 }}>Loading profile...</Text>
      </View>
    );
  }
  const safeStats = statsData || { total: 0, plastic: 0, glass: 0, metal: 0, paper: 0, cardboard: 0, clothes: 0, organic: 0 };
  // Format join date
  let joinedString = '';
  if (profileData?.createdAt) {
    const date = new Date(profileData.createdAt);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    joinedString = `${month} ${year}`;
  } else {
    joinedString = `${new Date().getFullYear()}`;
  }

  const userData = user
    ? {
        avatar: profileData?.photoURL || user.photoURL || 'https://via.placeholder.com/100',
        name: profileData?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email,
        bio: profileData?.bio || '🏞️ Nature lover & recycler',
        following: 0,
        followers: 0,
        joined: joinedString,
        recyclingStats: safeStats,
      }
    : {
        avatar: 'https://via.placeholder.com/100',
        name: 'Mohammed.muallim16',
        email: 'mohammed.muallim16@gmail.com',
        bio: '🏞️ Nature lover & recycler',
        following: 0,
        followers: 0,
        joined: `${new Date().getFullYear()}`,
        recyclingStats: safeStats,
      };

  // Add cache-busting to avatar if it's a Cloudinary URL
  const avatarUrl = userData.avatar && userData.avatar.includes('res.cloudinary.com')
    ? `${userData.avatar}?t=${Date.now()}`
    : userData.avatar;

  const handleLogout = async () => {
    try {
      await logout();
      setSettingsModalVisible(false);
      // Navigation is handled by the auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.primaryGreen} />

      {/* Header with settings icon */}
      <View style={styles.headerBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.settingsIcon}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main content container with curved top */}
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Avatar + name */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            </View>
            <Text style={styles.name}>{userData.name}</Text>
            {userData.email && <Text style={styles.email}>{userData.email}</Text>}
            {userData.bio ? <Text style={styles.bio}>{userData.bio}</Text> : null}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userData.joined}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>

          {/* Recycling Stats Section */}
          <View style={styles.recyclingSection}>
            <Text style={styles.sectionTitle}>My Recycling Stats</Text>
            
            <View style={styles.statsGrid}>
              {/* Total Items Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="leaf" size={28} color="#4CAF50" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.total ?? 0}</Text>
                <Text style={styles.statsLabel}>Total Items</Text>
              </View>

              {/* Plastic Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="cup" size={28} color="#FF8C66" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.plastic ?? 0}</Text>
                <Text style={styles.statsLabel}>Plastic</Text>
              </View>

              {/* Glass Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="bottle-wine" size={28} color="#60CA9A" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.glass ?? 0}</Text>
                <Text style={styles.statsLabel}>Glass</Text>
              </View>

              {/* Metal Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="lightning-bolt" size={28} color="#FFC566" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.metal ?? 0}</Text>
                <Text style={styles.statsLabel}>Metal</Text>
              </View>

              {/* Paper Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="file-document-outline" size={28} color="#2196F3" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.paper ?? 0}</Text>
                <Text style={styles.statsLabel}>Paper</Text>
              </View>

              {/* Cardboard Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="cube-outline" size={28} color="#A1887F" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.cardboard ?? 0}</Text>
                <Text style={styles.statsLabel}>Cardboard</Text>
              </View>

              {/* Clothes Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="tshirt-crew" size={28} color="#FF4081" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.clothes ?? 0}</Text>
                <Text style={styles.statsLabel}>Clothes</Text>
              </View>

              {/* Organic Waste Card */}
              <View style={styles.statsCard}>
                <MaterialCommunityIcons name="leaf-maple" size={28} color="#8BC34A" style={styles.cardIcon} />
                <Text style={styles.statsNumber}>{userData.recyclingStats.organic ?? 0}</Text>
                <Text style={styles.statsLabel}>Organic Waste</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={() => { setSettingsModalVisible(false); router.push('/edit-profile'); }}>
              <Ionicons name="person-outline" size={24} color="#555" />
              <Text style={styles.settingText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            {/* Help & Support item */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                setSettingsModalVisible(false);
                Linking.openURL('mailto:mohammed.muallim16@gmail.com?subject=Help%20%26%20Support');
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color="#555" />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
              onPress={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#fff" />
                  <Text style={styles.logoutText}>Logout</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.primaryGreen,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F6F8F9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    marginTop: -20,
  },
  container: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 120,
    backgroundColor: '#F6F8F9',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  settingsIcon: {
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  recyclingSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 10,
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});
