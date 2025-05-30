import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_BASE_URL } from '@env';

export default function SettingsScreen({ route }) {
  const { email, displayName } = route.params || {};

  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState(displayName || '');

  const handleUpdate = async () => {
    if (!currentPassword) {
      Alert.alert("Missing Password", "Please enter your current password to make changes.");
      return;
    }

    if (!newEmail && !newPassword && !newDisplayName) {
      Alert.alert("Nothing to Update", "Please enter a new email, password, or display name.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentEmail,
          currentPassword,
          newEmail,
          newPassword,
          newDisplayName
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", data.msg);
      } else {
        Alert.alert("Error", data.msg);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emailDisplay}>@{currentEmail || 'username'}</Text>

      <View style={styles.profileCircle}>
        <Text style={styles.profileIcon}>👤</Text>
      </View>

      <Text style={styles.usernameLabel}>{newDisplayName || displayName || 'Username'}</Text>

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <Text style={styles.label}>Change Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new email"
        value={newEmail}
        onChangeText={setNewEmail}
      />

      <Text style={styles.label}>Change Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <Text style={styles.label}>Change Display Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new display name"
        value={newDisplayName}
        onChangeText={setNewDisplayName}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#cbe7ff',
  },
  emailDisplay: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 20,
  },
  profileCircle: {
    width: 140,
    height: 140,
    backgroundColor: '#d9d9d9',
    borderRadius: 70,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIcon: {
    fontSize: 48,
  },
  usernameLabel: {
    fontSize: 18,
    textAlign: 'center',
    color: '#3f7bbd',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3f7bbd',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3f7bbd',
    borderRadius: 6,
    backgroundColor: '#d0e4f9',
    padding: 10,
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#3f7bbd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});