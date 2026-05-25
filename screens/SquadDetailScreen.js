import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendPushNotification } from '../services/NotificationService';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function SquadDetailScreen({ route, navigation }) {
  const { squadName } = route.params;

  const handleHopOn = async () => {
    navigation.navigate('HopOnRoom', { squadName });

    try {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        if (userData && userData.pushToken) {
          await sendPushNotification(
            userData.pushToken,
            `HOP ON: ${squadName}`,
            `${userData.nickname || 'Someone'} is deploying an alert to the squad!`,
            { screen: 'IncomingAlert' }
          );
        }
      }
    } catch (error) {
      console.error('Error sending push alert:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2C5282" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{squadName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Chat Area */}
      <ScrollView contentContainerStyle={styles.chatContainer}>
        {/* System Message */}
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageBubble}>
            <Ionicons name="game-controller" size={12} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={styles.systemMessageText}>Ranked Matchmaking started by @Viper</Text>
          </View>
        </View>

        {/* Left Bubble (Viper) */}
        <View style={styles.messageRow}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=3' }} style={styles.avatar} />
          <View style={styles.messageContent}>
            <Text style={styles.senderName}>@Viper</Text>
            <View style={styles.bubbleLeft}>
              <Text style={styles.textLeft}>We need one more for the lobby. Who is online?</Text>
            </View>
          </View>
        </View>

        {/* Right Bubble (Me) */}
        <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
          <View style={[styles.messageContent, { alignItems: 'flex-end' }]}>
            <View style={styles.bubbleRight}>
              <Text style={styles.textRight}>Give me 5 mins, just finishing up a call.</Text>
            </View>
            <Text style={styles.readReceipt}>Read ✓</Text>
          </View>
        </View>

        {/* Left Bubble (ApexQueen) */}
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

      {/* Bottom Action Area */}
      <View style={styles.bottomArea}>
        <View style={styles.lobbyBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.lobbyBadgeText}>Lobby waiting: 3/4</Text>
        </View>

        <TouchableOpacity 
          style={styles.hopOnButton} 
          onPress={handleHopOn}
        >
          <Ionicons name="flash" size={32} color="#FFF" style={styles.hopOnIcon} />
          <Text style={styles.hopOnText}>HOP ON</Text>
        </TouchableOpacity>

        <Text style={styles.bottomHint}>
          Instantly join the active voice channel and squad up.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    paddingRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5282',
    textAlign: 'center',
  },
  settingsButton: {
    paddingLeft: 16,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  systemMessageBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#64748B',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  messageContent: {
    maxWidth: '75%',
  },
  senderName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '600',
  },
  bubbleLeft: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  textLeft: {
    color: '#1E293B',
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleRight: {
    backgroundColor: '#2C5282',
    padding: 16,
    borderRadius: 16,
    borderTopRightRadius: 4,
  },
  textRight: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  readReceipt: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  bottomArea: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  lobbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C5282',
    marginRight: 8,
  },
  lobbyBadgeText: {
    fontSize: 12,
    color: '#2C5282',
    fontWeight: '600',
  },
  hopOnButton: {
    backgroundColor: '#2C5282',
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2C5282',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  hopOnIcon: {
    marginRight: 12,
  },
  hopOnText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  bottomHint: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
});
