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
        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>

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

        <View style={styles.iconsRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
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

          {/* Most Recycled Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Most Recycled Items</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>
            <View style={styles.cardsRow}>
              {/* Plastic Card */}
              <View style={styles.bigCard}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="cup" size={24} color="#FF8C66" />
                </View>
                <Text style={styles.plasticTitle}>Plastic</Text>
                <Text style={styles.bigCardNumber}>62</Text>
                <Text style={styles.bigCardUnit}>times</Text>
              </View>
              
              <View style={styles.smallCards}>
                {/* Glass Card */}
                <View style={styles.smallCard}>
                  <View style={styles.smallCardTop}>
                    <View style={[styles.smallIconContainer, { backgroundColor: '#E8FFF3' }]}>
                      <MaterialCommunityIcons name="bottle-wine" size={22} color="#60CA9A" />
                    </View>
                    <Text style={styles.smallCardTitle}>Glass</Text>
                  </View>
                  <View style={styles.smallCardBottom}>
                    <Text style={styles.smallCardNumber}>15</Text>
                    <Text style={styles.smallCardUnit}>times</Text>
                  </View>
                </View>
                
                {/* Metal Card */}
                <View style={styles.smallCard}>
                  <View style={styles.smallCardTop}>
                    <View style={[styles.smallIconContainer, { backgroundColor: '#FFF7E8' }]}>
                      <MaterialCommunityIcons name="lightning-bolt" size={22} color="#FFC566" />
                    </View>
                    <Text style={styles.smallCardTitle}>Metal</Text>
                  </View>
                  <View style={styles.smallCardBottom}>
                    <Text style={styles.smallCardNumber}>15</Text>
                    <Text style={styles.smallCardUnit}>times</Text>
                  </View>
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
  iconsRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  viewAll: { 
    color: Colors.light.primaryGreen, 
    fontWeight: '600',
    fontSize: 16,
  },
  cardsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '100%',
  },
  bigCard: {
    width: '49%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCards: { 
    width: '49%', 
    justifyContent: 'space-between',
    height: 180,
  },
  smallCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 15,
    height: 80,
    width: '100%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFEDE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#E8FFF3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plasticTitle: { 
    color: '#333', 
    fontWeight: '600', 
    fontSize: 18,
    marginVertical: 5,
  },
  smallCardTitle: { 
    color: '#333', 
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 12,
  },
  bigCardNumber: {
    fontSize: 60,
    fontWeight: '700',
    color: '#20293A',
    lineHeight: 65,
  },
  bigCardUnit: { 
    color: '#999',
    fontSize: 16,
    alignSelf: 'center',
    marginTop: -5,
  },
  smallCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  smallCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingLeft: 20,
  },
  smallCardNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#20293A',
  },
  smallCardUnit: { 
    color: '#999',
    fontSize: 14,
    marginLeft: 5,
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
