import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import type { RootStackScreenProps, SquadMember } from '../../types';

const { width } = Dimensions.get('window');

const DUMMY_SQUAD_MEMBERS: SquadMember[] = [
  { id: '1', name: 'Alex Mercer', status: 'accepted', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: '2', name: 'Sarah K.', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  { id: '3', name: 'Marcus Chen', status: 'denied', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
  { id: '4', name: 'Elena R.', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704g' },
];

export default function HopOnRoomScreen({ navigation, route }: RootStackScreenProps<'HopOnRoom'>) {
  const { squadName } = route.params || { squadName: 'Squad' };
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { contentWidth, horizontalPadding } = useResponsive();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const getStatusColor = (status: SquadMember['status']) => {
    switch (status) {
      case 'accepted': return Colors.success;
      case 'denied': return Colors.error;
      case 'pending': return Colors.warning;
      default: return Colors.textMuted;
    }
  };

  const getStatusText = (status: SquadMember['status']) => {
    switch (status) {
      case 'accepted': return 'Joined';
      case 'denied': return 'Declined';
      case 'pending': return 'Calling...';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%', justifyContent: 'space-between' }}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CALLING {squadName}</Text>
        </View>

        <View style={styles.gridContainer}>
          {DUMMY_SQUAD_MEMBERS.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <Animated.View style={[styles.avatarContainer, member.status === 'pending' && { opacity: pulseAnim }]}>
                <Image source={{ uri: member.avatar }} style={[styles.avatar, member.status === 'denied' && styles.avatarMuted]} />
              </Animated.View>
              <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
              <Text style={[styles.memberStatus, { color: getStatusColor(member.status) }]}>{getStatusText(member.status)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Ionicons name="call" size={32} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 24, paddingHorizontal: 20 },
  memberCard: { width: '40%', alignItems: 'center', marginBottom: 20 },
  avatarContainer: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surfaceAlt },
  avatarMuted: { opacity: 0.3 },
  memberName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 4 },
  memberStatus: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  footer: { paddingBottom: 60, alignItems: 'center' },
  cancelButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.error, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
});
