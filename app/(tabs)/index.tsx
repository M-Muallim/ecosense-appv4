// app/(tabs)/index.tsx
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primaryGreen} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=15' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.usernameText}>johndeo</Text>
          </View>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.contentArea}>
        <View style={styles.backgroundCurve} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Level Card */}
          <View style={styles.levelCard}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <MaterialCommunityIcons 
                  name="coffee" 
                  size={80} 
                  color={Colors.light.primaryGreen} 
                />
                <Text style={styles.levelLabel}>Level 1</Text>
              </View>
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>2/50 Recycle needed</Text>
            </View>
          </View>

          {/* Challenges Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Challenges</Text>
            </View>
            
            <View style={styles.challengesContainer}>
              {/* Challenge 1 */}
              <View style={styles.challengeCard}>
                <View style={[styles.challengeIconContainer, { backgroundColor: '#E8FFF3' }]}>
                  <MaterialCommunityIcons name="cup" size={24} color="#60CA9A" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>Recycle 5 Plastic Items</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: '40%' }]} />
                  </View>
                  <Text style={styles.challengeProgress}>2/5 completed</Text>
                </View>
              </View>

              {/* Challenge 2 */}
              <View style={styles.challengeCard}>
                <View style={[styles.challengeIconContainer, { backgroundColor: '#FFF7E8' }]}>
                  <MaterialCommunityIcons name="bottle-wine" size={24} color="#FFC566" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>Recycle 3 Glass Items</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: '33%' }]} />
                  </View>
                  <Text style={styles.challengeProgress}>1/3 completed</Text>
                </View>
              </View>

              {/* Challenge 3 */}
              <View style={styles.challengeCard}>
                <View style={[styles.challengeIconContainer, { backgroundColor: '#FFE8E8' }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FF8C66" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>Recycle 4 Metal Items</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: '0%' }]} />
                  </View>
                  <Text style={styles.challengeProgress}>0/4 completed</Text>
                </View>
              </View>

              {/* Challenge 4 */}
              <View style={styles.challengeCard}>
                <View style={[styles.challengeIconContainer, { backgroundColor: '#E5F6FF' }]}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color="#64B5F6" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>Recycle 3 Days in a Row</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: '66%' }]} />
                  </View>
                  <Text style={styles.challengeProgress}>2/3 days</Text>
                </View>
              </View>

              {/* Challenge 5 */}
              <View style={styles.challengeCard}>
                <View style={[styles.challengeIconContainer, { backgroundColor: '#F3E5FF' }]}>
                  <MaterialCommunityIcons name="recycle" size={24} color="#9C64F6" />
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>Recycle 10 Items Total</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: '30%' }]} />
                  </View>
                  <Text style={styles.challengeProgress}>3/10 items</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
