import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';

export default function ProfileScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {
          auth.signOut();
          navigation.replace('Login');
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dimmed Background */}
      <TouchableOpacity 
        style={styles.dimmedBackground} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()}
      />

      {/* Profile Card Bottom Sheet */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.avatar} />
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color="#FFF" />
          </View>
        </View>

        <Text style={styles.userName}>Alex Chen</Text>
        <Text style={styles.userHandle}>@alexc_gaming</Text>

        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="person-outline" size={20} color="#2C5282" style={styles.settingIcon} />
            <Text style={styles.settingText}>Change Nickname</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="image-outline" size={20} color="#2C5282" style={styles.settingIcon} />
            <Text style={styles.settingText}>Change Avatar</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <Ionicons name="notifications-outline" size={20} color="#2C5282" style={styles.settingIcon} />
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#2C5282' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
              onValueChange={setPushEnabled}
              value={pushEnabled}
              style={{ marginLeft: 'auto' }}
            />
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#2C5282" style={styles.settingIcon} />
            <Text style={styles.settingText}>Privacy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.settingIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#64748B', // Gray dim background
    justifyContent: 'flex-end',
  },
  dimmedBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 48, // Space for overlapping avatar
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  avatarContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2C5282',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
  },
  settingsList: {
    width: '100%',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 24,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  logoutRow: {
    width: '100%',
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
  },
});
