import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../hooks/useResponsive';
import { useUI } from '../../context/UIContext';
import { sendMessage, getGroup } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps, CallerInfo } from '../../types';
import { Image } from 'expo-image';


const QUICK_REPLIES = ['Busy rn', 'Give me 10 mins', 'In a match', 'Maybe later'];

export default function IncomingAlertScreen({ navigation, route }: RootStackScreenProps<'IncomingAlert'>) {
  // When opened via push notification, params might be directly in route.params
  const caller: CallerInfo = route.params?.caller || {
    squadName: (route.params as any)?.squadName || 'Night Owls',
    callerName: (route.params as any)?.callerName || 'Alex Mercer',
    avatar: (route.params as any)?.callerAvatar || '',
    squadId: (route.params as any)?.squadId,
  };
  
  const squadWallpaper = caller.squadWallpaper || (route.params as any)?.squadWallpaper;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const { contentWidth, horizontalPadding } = useResponsive();
  const { showToast, showDialog } = useUI();
  const { profile } = useAuth();

  const [player, setPlayer] = useState<AudioPlayer | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();

    let newPlayer: AudioPlayer | null = null;
    let isMounted = true;

    const initSound = async () => {
      try {
        let soundUrl = 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg';

        if (caller.squadId) {
          const group = await getGroup(caller.squadId);
          if (group && group.ringtone) {
            if (!isNaN(Number(group.ringtone))) {
              const res = await fetch(`https://itunes.apple.com/lookup?id=${group.ringtone}`);
              const data = await res.json();
              if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
                soundUrl = data.results[0].previewUrl;
              }
            } else {
              switch (group.ringtone) {
                case 'radar': soundUrl = 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg'; break;
                case 'beacon': soundUrl = 'https://actions.google.com/sounds/v1/alarms/sonar_ping.ogg'; break;
                case 'siren': soundUrl = 'https://actions.google.com/sounds/v1/alarms/phone_alerts_and_rings.ogg'; break;
                case 'chime': soundUrl = 'https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg'; break;
              }
            }
          }
        }

        if (isMounted) {
          newPlayer = createAudioPlayer(soundUrl);
          newPlayer.loop = true;
          newPlayer.play();
          setPlayer(newPlayer);
        }
      } catch (error) {
        console.error("Error loading alert sound", error);
      }
    };

    initSound();

    return () => {
      isMounted = false;
      if (newPlayer) {
        newPlayer.pause();
        newPlayer.remove();
      }
    };
  }, []);

  const handleAccept = () => {
    showDialog({
      title: 'Accepted',
      message: 'You are joining the session!',
      actions: [
        { text: 'Let\'s Go', onPress: () => navigation.navigate('HopOnRoom', { squadId: caller.squadId!, squadName: caller.squadName, squadWallpaper }) },
      ]
    });
  };

  const handleDeny = () => setShowQuickReplies(!showQuickReplies);

  const handleQuickReply = async (message: string) => {
    showToast({
      title: 'Sent',
      message: `You replied: "${message}"`,
      type: 'success'
    });
    
    if (caller.squadId && profile) {
      const messageData = {
        sender: profile.nickname || 'Unknown User',
        avatar: profile.avatar || `https://ui-avatars.com/api/?name=Unknown`,
        text: message,
      };
      await sendMessage(caller.squadId, messageData);
    }
    
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
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
