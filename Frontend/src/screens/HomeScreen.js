import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const { email, displayName } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BruinNav 🎓📍</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile', { email, displayName })}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', paddingTop: 300, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});