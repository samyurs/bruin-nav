import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Search from '../components/SearchComponent.js'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Search></Search>
      <Text style={styles.title}>Welcome to BruinNav 🎓📍</Text>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold' }
});