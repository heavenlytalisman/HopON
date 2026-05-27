import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPushNotification } from '../../services/notifications';
import { getGroupMemberTokens } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

// Mock GIFs
const MOCK_GIFS = [
  'https://media.giphy.com/media/l0HlOBZcl7sbV6Vg8/giphy.gif', // nice
  'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif', // boom
  'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif', // lol
  'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', // whatever
  'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', // cat typing
];

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text?: string;
  gifUrl?: string;
  isMe: boolean;
  system?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', sender: 'System', avatar: '', text: 'Ranked Matchmaking started by @Viper', isMe: false, system: true },
  { id: '2', sender: '@Viper', avatar: 'https://i.pravatar.cc/150?u=3', text: 'We need one more for the lobby. Who is online?', isMe: false },
  { id: '3', sender: 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704z', text: 'Give me 5 mins, just finishing up a call.', isMe: true },
  { id: '4', sender: '@ApexQueen', avatar: 'https://i.pravatar.cc/150?u=4', text: "I'm in the lobby now. Setting up the loadout.", isMe: false },
];

export default function SquadDetailScreen({ route, navigation }: RootStackScreenProps<'SquadDetail'>) {
  const { squadName, squadId, squadAvatar } = route.params;
  const { firebaseUser, profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);

  const myAvatar = profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z';

  useEffect(() => {
    // Scroll to bottom on new message
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      text: inputText.trim(),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setShowGifPicker(false);
  };

  const handleSendGif = (gifUrl: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      gifUrl,
      isMe: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowGifPicker(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.system) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageBubble}>
            <Ionicons name="game-controller" size={12} color={Colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, item.isMe ? { justifyContent: 'flex-end' } : null]}>
        {!item.isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
        
        <View style={[styles.messageContent, item.isMe ? { alignItems: 'flex-end' } : null]}>
          {!item.isMe && <Text style={styles.senderName}>{item.sender}</Text>}
          
          <View style={[item.isMe ? styles.bubbleRight : styles.bubbleLeft, item.gifUrl ? { padding: 0, overflow: 'hidden' } : null]}>
            {item.gifUrl ? (
              <Image source={{ uri: item.gifUrl }} style={styles.gifMessage} />
            ) : (
              <Text style={item.isMe ? styles.textRight : styles.textLeft}>{item.text}</Text>
            )}
          </View>
          
          {item.isMe && <Text style={styles.readReceipt}>Delivered</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          {squadAvatar ? (
            <Image source={{ uri: squadAvatar }} style={styles.headerSquadAvatar} />
          ) : (
            <View style={styles.headerSquadAvatarFallback}>
              <Ionicons name="people" size={18} color={Colors.primaryLight} />
            </View>
          )}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{squadName}</Text>
            <Text style={styles.headerSubtitle}>3/4 Online</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton} onPress={handleHopOn}>
              <Ionicons name="flash-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton}>
              <Ionicons name="settings-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {showGifPicker && (
          <View style={styles.gifPickerContainer}>
            <FlatList
              horizontal
              data={MOCK_GIFS}
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSendGif(item)}>
                  <Image source={{ uri: item }} style={styles.gifOption} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.gifToggleBtn} onPress={() => setShowGifPicker(!showGifPicker)}>
            <Text style={styles.gifToggleText}>GIF</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          <TouchableOpacity style={styles.sendButton} onPress={handleSendText} disabled={!inputText.trim()}>
            <Ionicons name="send" size={20} color={inputText.trim() ? Colors.primaryLight : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { paddingRight: Spacing.md },
  headerSquadAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  headerSquadAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  headerRight: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  headerIconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  
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
  gifMessage: { width: 200, height: 150, borderRadius: BorderRadius.lg },

  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  gifToggleBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, paddingVertical: 8, paddingHorizontal: 12, marginRight: Spacing.sm, height: 40, borderWidth: 1, borderColor: Colors.border },
  gifToggleText: { color: Colors.textPrimary, fontSize: 12, fontWeight: '800' },
  textInput: { flex: 1, backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.lg, paddingTop: 12, paddingBottom: 12, color: Colors.textPrimary, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: Colors.border },
  sendButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: Spacing.sm },

  gifPickerContainer: { backgroundColor: Colors.surfaceAlt, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  gifOption: { width: 100, height: 100, borderRadius: BorderRadius.md, marginLeft: Spacing.md, backgroundColor: Colors.surface },
});
