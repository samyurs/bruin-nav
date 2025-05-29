import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { API_BASE_URL } from '@env';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        navigation.navigate('Home');  // ✅ Navigate to Home on success
      } else {
        const data = await res.json();
        Alert.alert("Login Failed", data.msg || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
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
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#aaa"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <Text style={styles.newText}>New? <Text style={styles.signUp} onPress={() => navigation.navigate('Register')}>Sign up</Text></Text>

      <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('Register')}>
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
    fontFamily: 'System', // or 'Inter' if using a custom font
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
    fontFamily: 'System',
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
  buttonText: {
    fontSize: 18,
    color: '#595959',
    fontWeight: '600',
    fontFamily: 'System',
  },
  newText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
    fontFamily: 'System',
  },
  signUp: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
});