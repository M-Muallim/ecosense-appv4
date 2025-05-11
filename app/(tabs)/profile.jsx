// app/(tabs)/profile.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading } = useAuth();
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Fallback user data if auth user is not available
  const userData = user ? {
    avatar: user.photoURL || 'https://via.placeholder.com/100',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email,
    bio: '🏞️ Nature lover & recycler',
    following: 0,
    followers: 0,
    joinedYear: new Date().getFullYear(),
    recyclingStats: {
      total: 0,
      plastic: 0,
      glass: 0,
      metal: 0,
    }
  } : {
    avatar: 'https://via.placeholder.com/100',
    name: 'Mohammed.muallim16',
    email: 'mohammed.muallim16@gmail.com',
    bio: '🏞️ Nature lover & recycler',
    following: 0,
    followers: 0,
    joinedYear: 2025,
    recyclingStats: {
      total: 0,
      plastic: 0,
      glass: 0,
      metal: 0,
    }
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FA" />

      {/* Header with settings icon */}
      <View style={styles.headerBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity 
          style={styles.settingsIcon}
          onPress={() => setSettingsModalVisible(true)}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar + name */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="pencil-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{userData.name}</Text>
          {userData.email && <Text style={styles.email}>{userData.email}</Text>}
          {userData.bio ? <Text style={styles.bio}>{userData.bio}</Text> : null}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{userData.joinedYear}</Text>
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
              <Text style={styles.statsNumber}>{userData.recyclingStats.total}</Text>
              <Text style={styles.statsLabel}>Total Items</Text>
            </View>

            {/* Plastic Card */}
            <View style={styles.statsCard}>
              <MaterialCommunityIcons name="cup" size={28} color="#FF8C66" style={styles.cardIcon} />
              <Text style={styles.statsNumber}>{userData.recyclingStats.plastic}</Text>
              <Text style={styles.statsLabel}>Plastic</Text>
            </View>

            {/* Glass Card */}
            <View style={styles.statsCard}>
              <MaterialCommunityIcons name="bottle-wine" size={28} color="#60CA9A" style={styles.cardIcon} />
              <Text style={styles.statsNumber}>{userData.recyclingStats.glass}</Text>
              <Text style={styles.statsLabel}>Glass</Text>
            </View>

            {/* Metal Card */}
            <View style={styles.statsCard}>
              <MaterialCommunityIcons name="lightning-bolt" size={28} color="#FFC566" style={styles.cardIcon} />
              <Text style={styles.statsNumber}>{userData.recyclingStats.metal}</Text>
              <Text style={styles.statsLabel}>Metal</Text>
            </View>
          </View>
        </View>
      </ScrollView>

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

            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="person-outline" size={24} color="#555" />
              <Text style={styles.settingText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications-outline" size={24} color="#555" />
              <Text style={styles.settingText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="lock-closed-outline" size={24} color="#555" />
              <Text style={styles.settingText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
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
    backgroundColor: '#F5F8FA',
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  editAvatarButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
