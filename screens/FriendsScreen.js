import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>No friends online right now.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338', // Discord Primary
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F2F3F5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B5BAC1',
  },
});
