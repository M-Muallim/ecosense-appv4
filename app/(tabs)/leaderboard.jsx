import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Platform,
  StatusBar as RNStatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { getLeaderboardData } from '../../services/userService';

// Mock data for the leaderboard
const TOP_USERS = [
  { 
    id: '2',
    name: 'Thomas',
    level: 3,
    avatar: 'https://i.pravatar.cc/300?img=8',
    rank: 2,
  },
  { 
    id: '1',
    name: 'Sarah',
    level: 32,
    avatar: 'https://i.pravatar.cc/300?img=5',
    rank: 1,
  },
  { 
    id: '3',
    name: 'Sandy',
    level: 84,
    avatar: 'https://i.pravatar.cc/300?img=11',
    rank: 3,
  },
];

const OTHER_USERS = [
  {
    id: '10',
    name: 'Sebastian',
    items: 180,
    points: 1124,
    avatar: 'https://i.pravatar.cc/300?img=13',
    rank: 10,
    trend: 'up',
  },
  {
    id: '11',
    name: 'Jason',
    items: 180,
    points: 875,
    avatar: 'https://i.pravatar.cc/300?img=15',
    rank: 11,
    trend: 'down',
  },
  {
    id: '12',
    name: 'Natalie',
    items: 180,
    points: 774,
    avatar: 'https://i.pravatar.cc/300?img=9',
    rank: 12,
    trend: 'up',
  },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = 'light'; // For now hardcoded to light theme
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboardData();
      setLeaderboard(data);
    const sortedData = data.sort((a, b) => a.weightedScore - b.weightedScore);
    } catch (e) {
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadLeaderboard();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  // Split leaderboard into top 3 and next 7
  const top3 = leaderboard.slice(0, 3);
  const next7 = leaderboard.slice(3, 10);

  // Render a user in the top 3 (podium display)
  const renderTopUser = (user, index) => {
    if (!user) return null;
    const isFirst = user.rank === 1;
    return (
      <View style={styles.topUserContainer} key={user.id}>
        <View style={styles.avatarContainer}>
          {isFirst && (
            <View style={styles.crownContainer}>
              <FontAwesome5 name="crown" size={30} color="#FFD700" />
            </View>
          )}
          <View style={[
            styles.avatarCircle,
            { borderColor: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#00A3FF' : '#FF6B6B' }
          ]}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>
          <View style={[
            styles.rankBadge,
            { backgroundColor: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#00A3FF' : '#FF6B6B' }
          ]}>
            <Text style={styles.rankText}>{user.rank}</Text>
          </View>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userLevel}>level {user.level}</Text>
        <Text style={styles.pointsText}>{user.weightedScore} pts</Text>
      </View>
    );
  };

  // Render a user in positions below the podium
  const renderListUser = ({ item }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.rankContainer}>
        <Text style={styles.listRank}>#{item.rank}</Text>
      </View>
      <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
      <View style={styles.userInfoContainer}>
        <Text style={styles.listUserName}>{item.name}</Text>
        <Text style={styles.itemsText}>level {item.level}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>{item.weightedScore} pts</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.light.primaryGreen} />
        <Text style={{ color: Colors.light.primaryGreen, marginTop: 12 }}>Loading leaderboard...</Text>
        </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar style="dark" />
      {Platform.OS === 'android' && (
        <RNStatusBar backgroundColor={Colors[colorScheme].primaryGreen} barStyle="light-content" />
      )}
      <View style={styles.header}></View>
      <View style={styles.contentContainer}>
        {/* Top 3 Users (Podium) */}
        <View style={styles.podiumContainer}>
          {top3.map(renderTopUser)}
      </View>
        {/* Other ranked users */}
        <View style={styles.listContainer}>
      <FlatList
            data={next7}
            renderItem={renderListUser}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryGreen,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    marginTop: 26,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 16,
    marginTop: 30,
    
  },
  topUserContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  crownContainer: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    padding: 2,
    backgroundColor: 'white',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  rankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rankContainer: {
    marginRight: 12,
    width: 40,
  },
  listRank: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfoContainer: {
    flex: 1,
  },
  listUserName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemsText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F2F7',
  },
}); 
