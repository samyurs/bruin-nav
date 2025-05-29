import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ route, navigation }) {
  const { email, displayName } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image source={require('../assets/logo.png')} style={styles.icon} />
        <View style={styles.usernameBox}>
          <Text style={styles.username}>@{email}</Text>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profilePicPlaceholder}>
          <Text style={styles.profileIcon}>👤</Text>
        </View>
        <Text style={styles.name}>{displayName || 'name'}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Settings', { email, displayName })}
        >
          <Text style={styles.editButtonText}>edit profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cbe7ff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 10,
  },
  usernameBox: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profilePicPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileIcon: {
    fontSize: 60,
  },
  name: {
    fontSize: 20,
    color: '#3b71ca',
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#fff5c8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    borderColor: '#000',
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
});