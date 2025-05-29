import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ProfileScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    email: '',
    displayName: '',
    profilePicture: null,
  });
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    upvotesReceived: 0,
    joinDate: '',
  });

  useEffect(() => {
    loadUserInfo();
    loadUserStats();
  }, []);

  const loadUserInfo = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const displayName = await AsyncStorage.getItem('userDisplayName');
      const profilePicture = await AsyncStorage.getItem('userProfilePicture');

      setUserInfo({
        email: email || 'user@ucla.edu',
        displayName: displayName || 'Bruin Student',
        profilePicture,
      });
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // Replace with actual API call
      setUserStats({
        postsCount: 12,
        upvotesReceived: 45,
        joinDate: 'September 2024',
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'userToken',
                'userEmail',
                'userDisplayName',
                'userProfilePicture'
              ]);
              // Navigation will automatically redirect to login due to auth state change
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const profileMenuItems = [
    {
      icon: 'settings',
      title: 'Settings',
      subtitle: 'Account preferences and privacy',
      onPress: () => navigation.navigate('Settings', { userInfo }),
    },
    {
      icon: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Coming Soon', 'Help & Support will be available soon!'),
    },
    {
      icon: 'info',
      title: 'About BruinNav',
      subtitle: 'App version and information',
      onPress: () => Alert.alert('BruinNav', 'Version 1.0.0\nBuilt for UCLA students by UCLA students'),
    },
    {
      icon: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profilePicContainer}>
          {userInfo.profilePicture ? (
            <Image source={{ uri: userInfo.profilePicture }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <Icon name="person" size={60} color="#666" />
            </View>
          )}
        </View>

        <Text style={styles.displayName}>{userInfo.displayName}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('Settings', { userInfo })}
        >
          <Icon name="edit" size={16} color="#2E86AB" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.postsCount}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userStats.upvotesReceived}</Text>
          <Text style={styles.statLabel}>Upvotes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Joined</Text>
          <Text style={styles.statDate}>{userStats.joinDate}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {profileMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[
                styles.menuIconContainer,
                item.isDestructive && styles.menuIconContainerDestructive
              ]}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.isDestructive ? '#F44336' : '#2E86AB'}
                />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[
                  styles.menuTitle,
                  item.isDestructive && styles.menuTitleDestructive
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with 💙 for UCLA Bruins
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  profilePicContainer: {
    marginBottom: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2E86AB',
    borderRadius: 20,
  },
  editProfileText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '500',
  },
  statsSection: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  menuSection: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIconContainerDestructive: {
    backgroundColor: '#FFEBEE',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuTitleDestructive: {
    color: '#F44336',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});