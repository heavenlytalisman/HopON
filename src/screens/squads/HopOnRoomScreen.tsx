import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { joinHopOnRoom, leaveHopOnRoom, subscribeToHopOnRoom } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import type { RootStackScreenProps } from '../../types';
import { Image } from 'expo-image';


export default function HopOnRoomScreen({ navigation, route }: RootStackScreenProps<'HopOnRoom'>) {
  const { squadId, squadName, squadWallpaper } = route.params || { squadId: '', squadName: 'Squad' };
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { contentWidth, horizontalPadding } = useResponsive();
  const { profile } = useAuth();
  
  const [activeMembers, setActiveMembers] = useState<User[]>([]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (!squadId || !profile?.uid) return;
    
    // Join the room on mount
    joinHopOnRoom(squadId, (profile.id || profile.uid));
    
    // Subscribe to active members
    const unsubscribe = subscribeToHopOnRoom(squadId, (members) => {
      setActiveMembers(members);
    });
    
    // Leave room on unmount
    return () => {
      leaveHopOnRoom(squadId, (profile.id || profile.uid));
      unsubscribe();
    };
  }, [squadId, profile?.uid]);

  const handleLeave = () => {
    if (squadId && profile?.uid) {
      leaveHopOnRoom(squadId, (profile.id || profile.uid));
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {squadWallpaper && (
        <>
          <Image source={{ uri: squadWallpaper }} style={StyleSheet.absoluteFill} blurRadius={15} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11, 13, 23, 0.4)' }]} />
        </>
      )}

      <View style={{ flex: 1, paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%', justifyContent: 'space-between' }}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CALLING {squadName}</Text>
        </View>

        <View style={styles.gridContainer}>
          {activeMembers.length <= 1 ? (
            <Animated.View style={{ opacity: pulseAnim, alignItems: 'center' }}>
              <Ionicons name="radio-outline" size={64} color={Colors.primaryLight} />
              <Text style={{ color: Colors.textMuted, marginTop: Spacing.md, fontSize: 16, textAlign: 'center' }}>
                You are in the lobby.\nWaiting for members to join...
              </Text>
            </Animated.View>
          ) : (
            activeMembers.map(member => (
              <View key={member.id} style={styles.memberCard}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: member.avatar }} style={styles.avatar} />
                </View>
                <Text style={styles.memberName} numberOfLines={1}>{member.nickname}</Text>
                <Text style={[styles.memberStatus, { color: Colors.success }]}>Ready</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleLeave}>
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
