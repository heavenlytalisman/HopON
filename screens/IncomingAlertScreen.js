import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QUICK_REPLIES = [
  "Busy rn",
  "Give me 10 mins",
  "In a match",
  "Maybe later"
];

export default function IncomingAlertScreen({ navigation, route }) {
  const caller = route.params?.caller || {
    squadName: 'Unknown Squad',
    callerName: 'Unknown Caller',
    avatar: 'https://i.pravatar.cc/150',
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleAccept = () => {
    Alert.alert("Accepted", "You are joining the session!", [
      { text: "OK", onPress: () => navigation.navigate('HopOnRoom', { squadName: caller.squadName }) }
    ]);
  };

  const handleDeny = () => {
    setShowQuickReplies(!showQuickReplies);
  };

  const handleQuickReply = (message) => {
    Alert.alert("Sent", `You replied: "${message}"`, [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
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
              <Ionicons name="close" size={32} color="#EF4444" />
              <Text style={styles.actionTextRed}>DENY</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.quickRepliesContainer}>
            <Text style={styles.quickReplyPrompt}>Send a quick reply:</Text>
            <View style={styles.chipsContainer}>
              {QUICK_REPLIES.map((reply, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.replyChip}
                  onPress={() => handleQuickReply(reply)}
                >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FC',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  callerInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#2C5282',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#EBF8FF',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  squadName: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  actionsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButton: {
    backgroundColor: '#10B981', // Green
    shadowColor: '#10B981',
  },
  denyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FEE2E2',
    shadowColor: '#EF4444',
  },
  actionTextWhite: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginLeft: 12,
    letterSpacing: 1,
  },
  actionTextRed: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
    marginLeft: 12,
    letterSpacing: 1,
  },
  quickRepliesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  quickReplyPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  replyChip: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  replyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  cancelReplyButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
});
