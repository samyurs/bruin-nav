import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BruinNav 🎓📍</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', paddingTop: 300, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' }
});