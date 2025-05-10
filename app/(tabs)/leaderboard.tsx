import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

// Define types for our user data
type TopUser = {
  id: string;
  name: string;
  level: number;
  avatar: string;
  rank: number;
};

type RankedUser = {
  id: string;
  name: string;
  items: number;
  points: number;
  avatar: string;
  rank: number;
  trend: 'up' | 'down';
};

// Mock data for the leaderboard
const TOP_USERS: TopUser[] = [
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

const OTHER_USERS: RankedUser[] = [
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

// Filter/time period options
const FILTER_OPTIONS = ['Today', 'This Week', 'All Time'];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState(0); // 0 = Today, 1 = This Week, 2 = All Time
  const colorScheme = 'light'; // For now hardcoded to light theme

  // Render a user in the top 3 (podium display)
  const renderTopUser = (user: TopUser, index: number) => {
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
      </View>
    );
  };

  // Render a user in positions below the podium
  const renderListUser = ({ item }: { item: RankedUser }) => (
    <View style={styles.listItemContainer}>
      <View style={styles.rankContainer}>
        <Text style={styles.listRank}>#{item.rank}</Text>
      </View>
      <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
      <View style={styles.userInfoContainer}>
        <Text style={styles.listUserName}>{item.name}</Text>
        <Text style={styles.itemsText}>{item.items} Items</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>{item.points}</Text>
        <Ionicons 
          name={item.trend === 'up' ? 'caret-up' : 'caret-down'} 
          size={16} 
          color={item.trend === 'up' ? '#4CAF50' : '#FF5252'} 
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      {Platform.OS === 'android' && (
        <RNStatusBar backgroundColor={Colors[colorScheme].primaryGreen} barStyle="light-content" />
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Filter tabs */}
        <View style={styles.filterContainer}>
          <View style={styles.filterTabs}>
            {FILTER_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterTab,
                  selectedFilter === index && styles.selectedFilterTab
                ]}
                onPress={() => setSelectedFilter(index)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === index && styles.selectedFilterText
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Top 3 Users (Podium) */}
        <View style={styles.podiumContainer}>
          {renderTopUser(TOP_USERS[0], 0)}
          {renderTopUser(TOP_USERS[1], 1)}
          {renderTopUser(TOP_USERS[2], 2)}
        </View>
        
        {/* Other ranked users */}
        <View style={styles.listContainer}>
          <FlatList
            data={OTHER_USERS}
            renderItem={renderListUser}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  filterTabs: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 4,
    marginRight: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 24,
  },
  selectedFilterTab: {
    backgroundColor: Colors.light.primaryGreen,
  },
  filterText: {
    color: '#8E8E93',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: Colors.light.secondaryGreen,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 16,
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
