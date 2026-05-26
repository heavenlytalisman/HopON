import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
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
    const loop = Animated.loop(
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
    );
    loop.start();
    return () => loop.stop();
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
              <Ionicons name="call" size={32} color={Colors.white} />
              <Text style={styles.actionTextWhite}>ACCEPT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.denyButton]} onPress={handleDeny}>
              <Ionicons name="close" size={32} color={Colors.danger} />
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
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.placeholder,
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
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: Colors.primaryLight,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  callerName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  squadName: {
    fontSize: 18,
    color: Colors.subtext,
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
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  denyButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    shadowColor: Colors.danger,
  },
  actionTextWhite: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginLeft: 12,
    letterSpacing: 1,
  },
  actionTextRed: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.danger,
    marginLeft: 12,
    letterSpacing: 1,
  },
  quickRepliesContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.placeholder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  quickReplyPrompt: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
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
    backgroundColor: Colors.divider,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  replyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.subtextDark,
  },
  cancelReplyButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelReplyText: {
    color: Colors.placeholder,
    fontSize: 14,
    fontWeight: '600',
  },
});
