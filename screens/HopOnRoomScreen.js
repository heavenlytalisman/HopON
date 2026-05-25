import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function HopOnRoomScreen({ navigation, route }) {
  const { squadName, squadId } = route.params || { squadName: 'Squad', squadId: null };
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    if (squadId) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [squadId]);

  const loadMembers = async () => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', squadId));
      if (groupDoc.exists()) {
        const memberIds = groupDoc.data().members || [];
        const fetchedMembers = [];
        for (const mId of memberIds) {
          const userDoc = await getDoc(doc(db, 'users', mId));
          if (userDoc.exists()) {
            fetchedMembers.push({
              id: userDoc.id,
              name: userDoc.data().nickname || 'User',
              avatar: userDoc.data().avatar || 'https://i.pravatar.cc/150',
              status: 'pending' // Default status for UI in this screen
            });
          }
        }
        setMembers(fetchedMembers);
      }
    } catch (error) {
      console.error('Error fetching squad members:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {loading ? (
        <ActivityIndicator size="large" color="#2C5282" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.gridContainer}>
          {members.length === 0 ? (
            <Text style={{ color: '#64748B', marginTop: 20 }}>No members found.</Text>
          ) : (
            members.map((member) => (
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
            ))
          )}
        </View>
      )}

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
    backgroundColor: '#F4F7FC',
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
    color: '#2C5282',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  memberCard: {
    width: width / 2 - 30,
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
    borderColor: '#F4F7FC',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
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
    color: '#64748B',
    fontSize: 14,
    marginBottom: 24,
  },
  cancelButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 12,
    transform: [{ rotate: '135deg' }],
  },
  callIcon: {
    marginLeft: 2,
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
