import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPushNotification } from '../../services/notifications';
import { getGroupMemberTokens } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

export default function SquadDetailScreen({ route, navigation }: RootStackScreenProps<'SquadDetail'>) {
  const { squadName, squadId } = route.params;
  const { firebaseUser, profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();

  const handleHopOn = async () => {
    navigation.navigate('HopOnRoom', { squadName });

    try {
      if (firebaseUser) {
        const tokens = await getGroupMemberTokens(squadId, firebaseUser.uid);
        for (const token of tokens) {
          await sendPushNotification(
            token,
            `HOP ON: ${squadName}`,
            `${profile?.nickname || 'Someone'} is deploying an alert to the squad!`,
            { screen: 'IncomingAlert' },
          );
        }
      }
    } catch (error) {
      console.error('Error sending push alert:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.innerContainer, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{squadName}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.chatContainer}>
          <View style={styles.systemMessageContainer}>
            <View style={styles.systemMessageBubble}>
              <Ionicons name="game-controller" size={12} color={Colors.textMuted} style={{ marginRight: 6 }} />
              <Text style={styles.systemMessageText}>Ranked Matchmaking started by @Viper</Text>
            </View>
          </View>

          <View style={styles.messageRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=3' }} style={styles.avatar} />
            <View style={styles.messageContent}>
              <Text style={styles.senderName}>@Viper</Text>
              <View style={styles.bubbleLeft}>
                <Text style={styles.textLeft}>We need one more for the lobby. Who is online?</Text>
              </View>
            </View>
          </View>

          <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
            <View style={[styles.messageContent, { alignItems: 'flex-end' }]}>
              <View style={styles.bubbleRight}>
                <Text style={styles.textRight}>Give me 5 mins, just finishing up a call.</Text>
              </View>
              <Text style={styles.readReceipt}>Read ✓</Text>
            </View>
          </View>

          <View style={styles.messageRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?u=4' }} style={styles.avatar} />
            <View style={styles.messageContent}>
              <Text style={styles.senderName}>@ApexQueen</Text>
              <View style={styles.bubbleLeft}>
                <Text style={styles.textLeft}>I'm in the lobby now. Setting up the loadout.</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomArea}>
          <View style={styles.lobbyBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.lobbyBadgeText}>Lobby waiting: 3/4</Text>
          </View>

          <TouchableOpacity style={styles.hopOnButton} onPress={handleHopOn}>
            <Ionicons name="flash" size={32} color="#FFF" style={styles.hopOnIcon} />
            <Text style={styles.hopOnText}>HOP ON</Text>
          </TouchableOpacity>

          <Text style={styles.bottomHint}>Instantly join the active voice channel and squad up.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  innerContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { paddingRight: Spacing.lg },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, textAlign: 'center' },
  headerRight: { width: 40 },
  chatContainer: { padding: Spacing.lg, paddingBottom: 20 },
  systemMessageContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  systemMessageBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, paddingVertical: 6, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  systemMessageText: { fontSize: 12, color: Colors.textMuted },
  messageRow: { flexDirection: 'row', marginBottom: Spacing.xl },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: Spacing.md, backgroundColor: Colors.border },
  messageContent: { maxWidth: '75%' },
  senderName: { fontSize: 12, color: Colors.textMuted, marginBottom: 4, fontWeight: '600' },
  bubbleLeft: { backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderTopLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  textLeft: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },
  bubbleRight: { backgroundColor: Colors.primary, padding: Spacing.lg, borderRadius: BorderRadius.lg, borderTopRightRadius: 4 },
  textRight: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  readReceipt: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  bottomArea: { padding: Spacing.xxl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center' },
  lobbyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, paddingVertical: 6, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryLight, marginRight: 8 },
  lobbyBadgeText: { fontSize: 12, color: Colors.primaryLight, fontWeight: '600' },
  hopOnButton: { backgroundColor: Colors.primary, flexDirection: 'row', paddingVertical: 18, paddingHorizontal: 48, borderRadius: BorderRadius.xxl, justifyContent: 'center', alignItems: 'center', width: '100%', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 6, marginBottom: Spacing.lg },
  hopOnIcon: { marginRight: Spacing.md },
  hopOnText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 1.5 },
  bottomHint: { color: Colors.textMuted, fontSize: 13, textAlign: 'center' },
});
