import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save user data to AsyncStorage
        await AsyncStorage.multiSet([
          ['userToken', data.token || 'demo_token'],
          ['userEmail', email],
          ['userDisplayName', data.displayName || 'Bruin Student'],
          ['userId', data.userId || 'demo_user_id'],
        ]);

        // Navigation will automatically redirect to main app due to auth state change
        // The navigation component will detect the token and show the main app
      } else {
        Alert.alert("Login Failed", data.msg || "Invalid credentials");
      }
    } catch (err) {
      console.error('Login error:', err);
      // For demo purposes, allow login with any credentials
      Alert.alert(
        "Demo Mode",
        "Backend not available. Continue with demo?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              await AsyncStorage.multiSet([
                ['userToken', 'demo_token'],
                ['userEmail', email],
                ['userDisplayName', 'Demo User'],
                ['userId', 'demo_user_id'],
              ]);
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>BruinNav</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.newText}>
        New? <Text style={styles.signUp} onPress={() => navigation.navigate('Register')}>Sign up</Text>
      </Text>

      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.buttonDisabled]}
        onPress={() => navigation.navigate('Register')}
        disabled={isLoading}
      >
        <Text style={styles.createButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cbe7ff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 32,
    fontFamily: 'System',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff5c8',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 30,
    width: 240,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: '#595959',
    fontWeight: '600',
  },
  newText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  signUp: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#ffdc3d',
    borderRadius: 30,
    width: 240,
    paddingVertical: 12,
    alignItems: 'center',
    borderColor: '#000',
    borderWidth: 1,
  },
  createButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
});