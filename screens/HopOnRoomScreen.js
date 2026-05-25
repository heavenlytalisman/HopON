import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DUMMY_SQUAD_MEMBERS = [
  { id: '1', name: 'Alex Mercer', status: 'accepted', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: '2', name: 'Sarah K.', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  { id: '3', name: 'Marcus Chen', status: 'denied', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
  { id: '4', name: 'Elena R.', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704g' },
];

export default function HopOnRoomScreen({ navigation, route }) {
  const { squadName } = route.params || { squadName: 'Squad' };
  
  // Pulsing animation for "Pending" status
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10B981'; // Green
      case 'denied': return '#EF4444'; // Red
      case 'pending': return '#F59E0B'; // Orange
      default: return '#94A3B8';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'denied': return 'close-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.pulsingDot, { opacity: pulseAnim }]} />
        <Text style={styles.headerTitle}>Deploying Alert to {squadName}...</Text>
      </View>

      <View style={styles.gridContainer}>
        {DUMMY_SQUAD_MEMBERS.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={[styles.avatarContainer, { borderColor: getStatusColor(member.status) }]}>
              <Image 
                source={{ uri: member.avatar }} 
                style={[styles.avatar, member.status === 'denied' && styles.avatarMuted]} 
              />
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(member.status) }]}>
                <Ionicons name={getStatusIcon(member.status)} size={14} color="#FFF" />
              </View>
            </View>
            <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
            <Text style={[styles.memberStatus, { color: getStatusColor(member.status) }]}>
              {member.status.toUpperCase()}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.waitingText}>Waiting for responses...</Text>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="call" size={28} color="#FFF" style={styles.callIcon} />
        </TouchableOpacity>
        <Text style={styles.cancelText}>Cancel Alert</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Darker theme for the call room makes it feel serious
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  memberCard: {
    width: width / 2 - 30, // 2 columns
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarMuted: {
    opacity: 0.4,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  waitingText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
  },
  cancelButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444', // Big red hang-up button
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
    transform: [{ rotate: '135deg' }], // Rotate standard call icon to make it a "hang up" icon
  },
  callIcon: {
    marginLeft: 2, // Slight optical alignment adjustment due to rotation
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
