import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps, CallerInfo } from '../../types';

const QUICK_REPLIES = ['Busy rn', 'Give me 10 mins', 'In a match', 'Maybe later'];

export default function IncomingAlertScreen({ navigation, route }: RootStackScreenProps<'IncomingAlert'>) {
  const caller: CallerInfo = route.params?.caller || {
    squadName: 'Night Owls',
    callerName: 'Alex Mercer',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const { contentWidth, horizontalPadding } = useResponsive();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const handleAccept = () => {
    Alert.alert('Accepted', 'You are joining the session!', [
      { text: 'OK', onPress: () => navigation.navigate('HopOnRoom', { squadName: caller.squadName }) },
    ]);
  };

  const handleDeny = () => setShowQuickReplies(!showQuickReplies);

  const handleQuickReply = (message: string) => {
    Alert.alert('Sent', `You replied: "${message}"`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%', justifyContent: 'space-between' }}>
        <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Alert</Text>
      </View>

      <View style={styles.callerInfoContainer}>
        <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={{ uri: caller.avatar }} style={styles.avatar} />
        </Animated.View>
        <Text style={styles.callerName}>{caller.callerName}</Text>
        <Text style={styles.squadName}>is requesting you to HOP ON with {caller.squadName}!</Text>
      </View>

      <View style={styles.actionsContainer}>
        {!showQuickReplies ? (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept}>
              <Ionicons name="call" size={32} color="#FFF" />
              <Text style={styles.actionTextWhite}>ACCEPT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.denyButton]} onPress={handleDeny}>
              <Ionicons name="close" size={32} color={Colors.error} />
              <Text style={styles.actionTextRed}>DENY</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickReplyPrompt}>Send a quick reply:</Text>
            <View style={styles.chipsContainer}>
              {QUICK_REPLIES.map((reply, index) => (
                <TouchableOpacity key={index} style={styles.replyChip} onPress={() => handleQuickReply(reply)}>
                  <Text style={styles.replyChipText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelReplyButton} onPress={() => setShowQuickReplies(false)}>
              <Text style={styles.cancelReplyText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', paddingTop: 40 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 2, textTransform: 'uppercase' },
  callerInfoContainer: { alignItems: 'center', paddingHorizontal: 20 },
  avatarRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24, backgroundColor: Colors.surfaceAlt },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  callerName: { fontSize: 32, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  squadName: { fontSize: 18, color: Colors.textMuted, textAlign: 'center', fontWeight: '500', lineHeight: 24 },
  actionsContainer: { paddingHorizontal: 30, paddingBottom: 60 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: BorderRadius.lg, marginBottom: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  acceptButton: { backgroundColor: Colors.success, shadowColor: Colors.success },
  denyButton: { backgroundColor: Colors.surfaceAlt, borderWidth: 2, borderColor: Colors.border, shadowColor: Colors.error },
  actionTextWhite: { fontSize: 18, fontWeight: '800', color: '#FFF', marginLeft: 12, letterSpacing: 1 },
  actionTextRed: { fontSize: 18, fontWeight: '800', color: Colors.error, marginLeft: 12, letterSpacing: 1 },
  quickRepliesContainer: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: Colors.border },
  quickReplyPrompt: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16, textAlign: 'center' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  replyChip: { backgroundColor: Colors.surfaceAlt, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  replyChipText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  cancelReplyButton: { marginTop: 20, paddingVertical: 10, alignItems: 'center' },
  cancelReplyText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
});
