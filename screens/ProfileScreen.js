import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatarLarge} />
        <Text style={styles.username}>User Profile</Text>
        <Text style={styles.subtitle}>Settings and configuration will go here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338', // Discord Primary
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1F22',
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    color: '#B5BAC1',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F2F3F5',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#5865F2',
    marginBottom: 16,
    marginTop: 32,
  },
  username: {
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
