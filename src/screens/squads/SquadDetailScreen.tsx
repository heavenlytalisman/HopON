import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, Image, Modal, ScrollView, Animated, PanResponder, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPushNotification } from '../../services/notifications';
import { getGroupMemberTokens } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useUI } from '../../context/UIContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';
import SquadInviteModal from '../../components/squads/SquadInviteModal';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  sender: string;
  avatar: string;
  text?: string;
  gifUrl?: string;
  stickerUrl?: string;
  viewOncePhotoUrl?: string;
  viewOnceViewed?: boolean;
  isMe: boolean;
  system?: boolean;
  replyTo?: {
    sender: string;
    text: string;
  };
}

interface StickerPack {
  id: string;
  name: string;
  stickers: string[];
}

const INITIAL_MESSAGES: Message[] = [
  { id: '2', sender: '@Viper', avatar: 'https://i.pravatar.cc/150?u=3', text: 'We need one more for the lobby. Who is online?', isMe: false },
  { id: '3', sender: 'You', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704z', text: 'Give me 5 mins, just finishing up a call.', isMe: true },
  { id: '4', sender: '@ApexQueen', avatar: 'https://i.pravatar.cc/150?u=4', text: "I'm in the lobby now. Setting up the loadout.", isMe: false },
  { id: '5', sender: '@AlexM', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', stickerUrl: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=150&q=80', isMe: false },
];

const SwipeableMessage = ({ item, onReply, onLongPress, children }: any) => {
  const pan = useRef(new Animated.ValueXY()).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        return gestureState.dx > 15 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderGrant: () => {
        pan.setOffset({ x: 0, y: 0 });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
           pan.setValue({ x: Math.min(gestureState.dx, 80), y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        if (gestureState.dx > 50) {
          onReply(item);
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          bounciness: 10,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          bounciness: 10,
        }).start();
      }
    })
  ).current;

  return (
    <Animated.View
      style={{ transform: [{ translateX: pan.x }] }}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        onLongPress={() => onLongPress(item)}
        delayLongPress={200}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SquadDetailScreen({ route, navigation }: RootStackScreenProps<'SquadDetail'>) {
  const { squadName, squadId, squadAvatar } = route.params;
  const { firebaseUser, profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifTab, setGifTab] = useState<'trending' | 'recent' | 'favorites'>('trending');
  const [recentGifs, setRecentGifs] = useState<string[]>([]);
  const [favoriteGifs, setFavoriteGifs] = useState<string[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<{ url: string }[]>([]);
  const [searchGifs, setSearchGifs] = useState<{ url: string }[]>([]);
  const [isLoadingGifs, setIsLoadingGifs] = useState(false);
  const TENOR_API_KEY = 'LIVDSRZULELA';

  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([
    { id: '1', name: 'My Pack', stickers: [] }
  ]);
  const [activePackIndex, setActivePackIndex] = useState(0);

  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [packModalVisible, setPackModalVisible] = useState(false);
  const [packNameInput, setPackNameInput] = useState('');
  const [editingPackId, setEditingPackId] = useState<string | null>(null);

  const [saveStickerModalVisible, setSaveStickerModalVisible] = useState(false);
  const [stickerToSaveUrl, setStickerToSaveUrl] = useState<string | null>(null);
  const [selectedStickerDetails, setSelectedStickerDetails] = useState<{ url: string; packName: string } | null>(null);
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const myAvatar = profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (showGifPicker && trendingGifs.length === 0) {
      fetchTrendingGifs();
    }
  }, [showGifPicker]);

  useEffect(() => {
    if (gifSearchQuery.trim()) {
      const delayDebounceFn = setTimeout(() => {
        fetchSearchGifs(gifSearchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchGifs([]);
    }
  }, [gifSearchQuery]);

  const fetchTrendingGifs = async () => {
    setIsLoadingGifs(true);
    try {
      const response = await fetch(`https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&limit=20`);
      const data = await response.json();
      if (data.results) {
        const gifs = data.results.map((r: any) => ({ url: r.media[0].tinygif.url }));
        setTrendingGifs(gifs);
      }
    } catch (error) {
      console.error('Error fetching trending GIFs:', error);
    } finally {
      setIsLoadingGifs(false);
    }
  };

  const fetchSearchGifs = async (query: string) => {
    setIsLoadingGifs(true);
    try {
      const response = await fetch(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`);
      const data = await response.json();
      if (data.results) {
        const gifs = data.results.map((r: any) => ({ url: r.media[0].tinygif.url }));
        setSearchGifs(gifs);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setIsLoadingGifs(false);
    }
  };

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
    
    const replyData = replyingTo ? {
      sender: replyingTo.sender,
      text: replyingTo.text || (replyingTo.gifUrl ? 'GIF' : 'Sticker')
    } : undefined;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      text: inputText.trim(),
      isMe: true,
      replyTo: replyData,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setShowGifPicker(false);
    setShowStickerPicker(false);
    setReplyingTo(null);
  };

  const handleSendGif = (gifUrl: string) => {
    const replyData = replyingTo ? {
      sender: replyingTo.sender,
      text: replyingTo.text || (replyingTo.gifUrl ? 'GIF' : 'Sticker')
    } : undefined;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      gifUrl,
      isMe: true,
      replyTo: replyData,
    };
    setMessages((prev) => [...prev, newMessage]);
    setRecentGifs((prev) => {
      const filtered = prev.filter(url => url !== gifUrl);
      return [gifUrl, ...filtered].slice(0, 20);
    });
    setShowGifPicker(false);
    setReplyingTo(null);
  };

  const toggleFavoriteGif = (gifUrl: string) => {
    setFavoriteGifs((prev) => {
      if (prev.includes(gifUrl)) return prev.filter(url => url !== gifUrl);
      return [gifUrl, ...prev];
    });
  };

  const handleSendSticker = (stickerUrl: string) => {
    const replyData = replyingTo ? {
      sender: replyingTo.sender,
      text: replyingTo.text || (replyingTo.gifUrl ? 'GIF' : 'Sticker')
    } : undefined;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      stickerUrl,
      isMe: true,
      replyTo: replyData,
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowStickerPicker(false);
    setReplyingTo(null);
  };

  const pickStickerImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newSticker = result.assets[0].uri;
      setStickerPacks((prev) => {
        const newPacks = [...prev];
        newPacks[activePackIndex].stickers = [newSticker, ...newPacks[activePackIndex].stickers];
        return newPacks;
      });
    }
  };

  const pickViewOncePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      handleSendViewOncePhoto(result.assets[0].uri);
      setShowStickerPicker(false);
      setShowGifPicker(false);
    }
  };

  const handleSendViewOncePhoto = (uri: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      avatar: myAvatar,
      viewOncePhotoUrl: uri,
      viewOnceViewed: false,
      isMe: true,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleOpenNewPackModal = () => {
    setEditingPackId(null);
    setPackNameInput('');
    setPackModalVisible(true);
  };

  const handleOpenEditPackModal = (pack: StickerPack) => {
    setEditingPackId(pack.id);
    setPackNameInput(pack.name);
    setPackModalVisible(true);
  };

  const handleSavePackName = () => {
    if (!packNameInput.trim()) return;

    if (editingPackId) {
      setStickerPacks(prev => prev.map(p => p.id === editingPackId ? { ...p, name: packNameInput.trim() } : p));
    } else {
      const newPack: StickerPack = {
        id: Date.now().toString(),
        name: packNameInput.trim(),
        stickers: [],
      };
      setStickerPacks([...stickerPacks, newPack]);
      setActivePackIndex(stickerPacks.length);
    }
    setPackModalVisible(false);
  };

  const handleOpenSaveStickerModal = (url: string) => {
    setStickerToSaveUrl(url);
    setSaveStickerModalVisible(true);
  };

  const handleSaveStickerToPack = (packId: string) => {
    if (!stickerToSaveUrl) return;
    setStickerPacks(prev => prev.map(p => {
      if (p.id === packId && !p.stickers.includes(stickerToSaveUrl)) {
        return { ...p, stickers: [stickerToSaveUrl, ...p.stickers] };
      }
      return p;
    }));
    setSaveStickerModalVisible(false);
    setStickerToSaveUrl(null);
  };

  const handleStickerPress = (url: string) => {
    let packName = 'Custom Sticker';
    for (const pack of stickerPacks) {
      if (pack.stickers.includes(url)) {
        packName = pack.name;
        break;
      }
    }
    setSelectedStickerDetails({ url, packName });
  };

  const getGifsForTab = () => {
    let baseGifs: { url: string }[] = [];
    if (gifTab === 'trending') {
      baseGifs = gifSearchQuery.trim() ? searchGifs : trendingGifs;
    } else if (gifTab === 'recent') {
      baseGifs = recentGifs.map(url => ({ url }));
    } else if (gifTab === 'favorites') {
      baseGifs = favoriteGifs.map(url => ({ url }));
    }

    return baseGifs;
  };

  const displayedGifs = getGifsForTab();

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
        {!item.isMe && (
          <TouchableOpacity onPress={() => navigation.navigate('FriendProfile', { friendId: item.sender, friendName: item.sender, friendAvatar: item.avatar })}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          </TouchableOpacity>
        )}
        
        <View style={[styles.messageContent, item.isMe ? { alignItems: 'flex-end' } : null]}>
          {!item.isMe && <Text style={styles.senderName}>{item.sender}</Text>}
          
          <SwipeableMessage item={item} onReply={(msg: Message) => setReplyingTo(msg)} onLongPress={(msg: Message) => setSelectedMessage(msg)}>
            <View style={[
              item.isMe ? styles.bubbleRight : styles.bubbleLeft, 
              (item.gifUrl || item.stickerUrl || item.viewOncePhotoUrl) ? { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0, borderWidth: 0 } : {}
            ]}>
              {item.replyTo && (
                <View style={[styles.replyQuoteBubble, item.isMe ? styles.replyQuoteBubbleRight : styles.replyQuoteBubbleLeft]}>
                  <Text style={styles.replyQuoteSender}>Replying to {item.replyTo.sender}</Text>
                  <Text style={styles.replyQuoteText} numberOfLines={1}>{item.replyTo.text}</Text>
                </View>
              )}
              {item.gifUrl ? (
                <Image source={{ uri: item.gifUrl }} style={styles.gifMessage} />
              ) : item.stickerUrl ? (
                <TouchableOpacity onPress={() => handleStickerPress(item.stickerUrl!)}>
                  <Image source={{ uri: item.stickerUrl }} style={styles.stickerMessage} />
                </TouchableOpacity>
              ) : item.viewOncePhotoUrl ? (
                <TouchableOpacity 
                  style={[
                    styles.viewOnceBtnMinimal, 
                    item.isMe ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.surfaceAlt },
                    item.viewOnceViewed && styles.viewOnceBtnViewedMinimal
                  ]}
                  onPress={() => {
                    if (!item.viewOnceViewed) {
                      setViewingPhoto(item.viewOncePhotoUrl!);
                      setMessages(prev => prev.map(m => m.id === item.id ? { ...m, viewOnceViewed: true } : m));
                    }
                  }}
                  activeOpacity={item.viewOnceViewed ? 1 : 0.7}
                >
                  <Ionicons name={item.viewOnceViewed ? "eye-off-outline" : "timer-outline"} size={18} color={item.isMe ? '#FFF' : Colors.textPrimary} />
                  <Text style={[styles.viewOnceTextMinimal, item.isMe ? { color: '#FFF' } : { color: Colors.textPrimary }]}>
                    {item.viewOnceViewed ? 'Opened' : 'View Once'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={item.isMe ? styles.textRight : styles.textLeft}>{item.text}</Text>
              )}
            </View>
          </SwipeableMessage>
          
          {item.isMe && <Text style={styles.readReceipt}>Delivered</Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerInfoTouchable}
            onPress={() => navigation.navigate('SquadEdit', { squadId, squadName, squadAvatar })}
            activeOpacity={0.7}
          >
            <Image source={{ uri: squadAvatar || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80' }} style={styles.headerSquadAvatar} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>{squadName}</Text>
              <Text style={styles.headerSubtitle}>3/4 Online</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconButton} onPress={handleHopOn}>
              <Ionicons name="flash-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => setInviteModalVisible(true)}>
              <Ionicons name="person-add-outline" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('SquadSettings', { squadId, squadName, squadAvatar })}>
              <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
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

        {(showGifPicker || showStickerPicker) && (
          <View style={styles.mediaTabBar}>
            <TouchableOpacity onPress={() => { setShowStickerPicker(true); setShowGifPicker(false); }} style={[styles.mediaTab, showStickerPicker && styles.mediaTabActive]}>
              <Text style={[styles.mediaTabText, showStickerPicker && styles.mediaTabTextActive]}>Stickers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowGifPicker(true); setShowStickerPicker(false); }} style={[styles.mediaTab, showGifPicker && styles.mediaTabActive]}>
              <Text style={[styles.mediaTabText, showGifPicker && styles.mediaTabTextActive]}>GIFs</Text>
            </TouchableOpacity>
          </View>
        )}

        {showGifPicker && (
          <View style={styles.gifPickerContainer}>
            <View style={styles.packSelectorBar}>
              <TouchableOpacity style={[styles.packTab, gifTab === 'trending' && styles.activePackTab]} onPress={() => setGifTab('trending')}>
                <Text style={[styles.packTabText, gifTab === 'trending' && styles.activePackTabText]}>Trending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.packTab, gifTab === 'recent' && styles.activePackTab]} onPress={() => setGifTab('recent')}>
                <Text style={[styles.packTabText, gifTab === 'recent' && styles.activePackTabText]}>Recent</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.packTab, gifTab === 'favorites' && styles.activePackTab]} onPress={() => setGifTab('favorites')}>
                <Text style={[styles.packTabText, gifTab === 'favorites' && styles.activePackTabText]}>Favorites</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.gifSearchContainer, { marginTop: Spacing.md }]}>
              <Ionicons name="search" size={16} color={Colors.textMuted} />
              <TextInput 
                style={styles.gifSearchInput} 
                placeholder="Search GIFs..." 
                placeholderTextColor={Colors.textMuted}
                value={gifSearchQuery}
                onChangeText={setGifSearchQuery}
              />
            </View>

            {isLoadingGifs ? (
              <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primaryLight} />
              </View>
            ) : displayedGifs.length === 0 ? (
              <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <Text style={{ color: Colors.textMuted }}>No GIFs found.</Text>
              </View>
            ) : (
              <FlatList
                horizontal
                data={displayedGifs}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isFav = favoriteGifs.includes(item.url);
                  return (
                    <View style={styles.gifOptionWrapper}>
                      <TouchableOpacity onPress={() => handleSendGif(item.url)}>
                        <Image source={{ uri: item.url }} style={styles.gifOption} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.favoriteBtn} onPress={() => toggleFavoriteGif(item.url)}>
                        <Ionicons name={isFav ? "star" : "star-outline"} size={18} color={isFav ? Colors.warning : '#FFF'} />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}

        {showStickerPicker && (
          <View style={styles.stickerPickerContainer}>
            <View style={styles.packSelectorBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packSelectorContent}>
                {stickerPacks.map((pack, index) => (
                  <TouchableOpacity 
                    key={pack.id} 
                    style={[styles.packTab, activePackIndex === index && styles.activePackTab]}
                    onPress={() => setActivePackIndex(index)}
                  >
                    <Text style={[styles.packTabText, activePackIndex === index && styles.activePackTabText]}>{pack.name}</Text>
                    {activePackIndex === index && (
                      <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => handleOpenEditPackModal(pack)}>
                        <Ionicons name="pencil" size={12} color={Colors.primaryLight} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleOpenNewPackModal} style={styles.newPackBtn}>
                  <Ionicons name="add" size={16} color={Colors.primaryLight} />
                  <Text style={styles.newPackText}>New Pack</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: Spacing.md }}>
              <TouchableOpacity onPress={pickStickerImage} style={styles.createStickerBtn}>
                <Ionicons name="add" size={24} color={Colors.textMuted} />
                <Text style={styles.createStickerText}>Add</Text>
              </TouchableOpacity>
              {stickerPacks[activePackIndex]?.stickers.map((stickerUri, index) => (
                <TouchableOpacity key={index.toString()} onPress={() => handleSendSticker(stickerUri)}>
                  <Image source={{ uri: stickerUri }} style={styles.gifOption} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {replyingTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerContent}>
              <Text style={styles.replyBannerSender}>Replying to {replyingTo.sender}</Text>
              <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.text || (replyingTo.gifUrl ? 'GIF' : 'Sticker')}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.replyBannerClose}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputArea}>
          <View style={styles.inputActionsRow}>
            <TouchableOpacity 
              style={styles.mediaToggleBtn} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => { 
                if (showGifPicker || showStickerPicker) {
                  setShowGifPicker(false);
                  setShowStickerPicker(false);
                } else {
                  setShowStickerPicker(true);
                }
              }}
            >
              <Ionicons 
                name={(showGifPicker || showStickerPicker) ? "close-circle-outline" : "add-circle-outline"} 
                size={26} 
                color={(showGifPicker || showStickerPicker) ? Colors.primaryLight : Colors.textMuted} 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaToggleBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={pickViewOncePhoto}>
              <Ionicons name="camera-outline" size={26} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          
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

        <SquadInviteModal 
          visible={inviteModalVisible} 
          onClose={() => setInviteModalVisible(false)} 
          squadId={squadId}
          squadName={squadName}
          squadAvatar={squadAvatar}
        />

        <Modal visible={packModalVisible} animationType="fade" transparent={true} onRequestClose={() => setPackModalVisible(false)}>
          <View style={styles.modalOverlayCentered}>
            <View style={styles.smallModalContent}>
              <Text style={styles.modalTitle}>{editingPackId ? 'Rename Pack' : 'New Pack'}</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Pack Name"
                placeholderTextColor={Colors.textMuted}
                value={packNameInput}
                onChangeText={setPackNameInput}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setPackModalVisible(false)}>
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnSave} onPress={handleSavePackName}>
                  <Text style={styles.modalBtnSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Save Sticker Modal */}
        <Modal visible={saveStickerModalVisible} animationType="slide" transparent={true} onRequestClose={() => setSaveStickerModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Save Sticker To...</Text>
                <TouchableOpacity onPress={() => setSaveStickerModalVisible(false)} style={styles.closeModalButton}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={{ padding: Spacing.lg }}>
                {stickerPacks.map(pack => (
                  <TouchableOpacity key={pack.id} style={styles.packSelectOption} onPress={() => handleSaveStickerToPack(pack.id)}>
                    <Ionicons name="folder-outline" size={20} color={Colors.textPrimary} />
                    <Text style={styles.packSelectOptionText}>{pack.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Sticker Details Modal */}
        <Modal visible={!!selectedStickerDetails} animationType="fade" transparent={true} onRequestClose={() => setSelectedStickerDetails(null)}>
          <View style={styles.modalOverlayCentered}>
            {selectedStickerDetails && (
              <View style={styles.minimalStickerModal}>
                <TouchableOpacity style={styles.minimalCloseBtn} onPress={() => setSelectedStickerDetails(null)}>
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
                <Image source={{ uri: selectedStickerDetails.url }} style={styles.largeStickerPreview} />
                <Text style={styles.stickerPackInfo}>From <Text style={{fontWeight: 'bold', color: Colors.textPrimary}}>{selectedStickerDetails.packName}</Text></Text>
                
                <TouchableOpacity 
                  style={styles.saveToPackBtnMinimal} 
                  onPress={() => {
                    const url = selectedStickerDetails.url;
                    setSelectedStickerDetails(null);
                    setTimeout(() => handleOpenSaveStickerModal(url), 300);
                  }}
                >
                  <Ionicons name="bookmark-outline" size={14} color={Colors.primaryLight} />
                  <Text style={styles.saveToPackBtnMinimalText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

        {/* Message Actions Modal */}
        <Modal visible={!!selectedMessage} animationType="fade" transparent={true} onRequestClose={() => setSelectedMessage(null)}>
          <View style={styles.modalOverlayCentered}>
            <View style={styles.messageActionModalContent}>
              {selectedMessage?.text && (
                <TouchableOpacity style={styles.messageActionOption} onPress={() => {
                  Clipboard.setStringAsync(selectedMessage.text!);
                  setSelectedMessage(null);
                }}>
                  <Ionicons name="copy-outline" size={20} color={Colors.textPrimary} />
                  <Text style={styles.messageActionOptionText}>Copy</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity style={[styles.messageActionOption, !selectedMessage?.isMe && { borderBottomWidth: 0 }]} onPress={() => {
                setReplyingTo(selectedMessage);
                setSelectedMessage(null);
              }}>
                <Ionicons name="arrow-undo-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.messageActionOptionText}>Reply</Text>
              </TouchableOpacity>

              {selectedMessage?.isMe && (
                <TouchableOpacity style={[styles.messageActionOption, { borderBottomWidth: 0 }]} onPress={() => {
                  setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
                  setSelectedMessage(null);
                }}>
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                  <Text style={[styles.messageActionOptionText, { color: Colors.error }]}>Unsend</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.messageActionCloseBtn} onPress={() => setSelectedMessage(null)}>
              <Text style={styles.messageActionCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* View Once Photo Modal */}
        <Modal visible={!!viewingPhoto} animationType="fade" transparent={true} onRequestClose={() => setViewingPhoto(null)}>
          <View style={styles.viewOnceFullscreen}>
            {viewingPhoto && (
              <Image source={{ uri: viewingPhoto }} style={styles.viewOnceImage} resizeMode="contain" />
            )}
            <View style={styles.viewOnceHeader}>
              <View style={styles.viewOnceBadge}>
                <Ionicons name="flash" size={14} color="#000" style={{ marginRight: 4 }} />
                <Text style={styles.viewOnceBadgeText}>View Once</Text>
              </View>
              <TouchableOpacity style={styles.viewOnceCloseBtn} onPress={() => setViewingPhoto(null)}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  headerInfoTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  headerIconBtn: { padding: Spacing.sm, marginLeft: Spacing.xs },
  
  chatContainer: { padding: Spacing.lg, paddingBottom: 20 },
  systemMessageContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  systemMessageBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, paddingVertical: 6, paddingHorizontal: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  systemMessageText: { fontSize: 12, color: Colors.textMuted },
  messageRow: { flexDirection: 'row', marginBottom: Spacing.xl },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: Spacing.md, backgroundColor: Colors.border },
  messageContent: { maxWidth: '75%' },
  senderName: { fontSize: 12, color: Colors.textMuted, marginBottom: 4, fontWeight: '600' },
  bubbleLeft: { backgroundColor: Colors.surfaceAlt, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderTopLeftRadius: 4 },
  textLeft: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22 },
  bubbleRight: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderTopRightRadius: 4 },
  textRight: { color: '#FFFFFF', fontSize: 15, lineHeight: 22 },
  readReceipt: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  gifMessage: { width: 200, height: 150, borderRadius: BorderRadius.lg },
  stickerMessage: { width: 120, height: 120, resizeMode: 'contain' },

  replyQuoteBubble: { padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.xs, borderLeftWidth: 3 },
  replyQuoteBubbleLeft: { backgroundColor: Colors.surfaceAlt, borderLeftColor: Colors.primaryLight },
  replyQuoteBubbleRight: { backgroundColor: 'rgba(255,255,255,0.2)', borderLeftColor: '#FFFFFF' },
  replyQuoteSender: { fontSize: 11, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  replyQuoteText: { fontSize: 12, color: Colors.textMuted },

  replyBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  replyBannerContent: { flex: 1 },
  replyBannerSender: { fontSize: 12, fontWeight: 'bold', color: Colors.primaryLight, marginBottom: 2 },
  replyBannerText: { fontSize: 13, color: Colors.textMuted },
  replyBannerClose: { padding: Spacing.sm },

  inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8, backgroundColor: 'transparent' },
  inputActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 8 },
  mediaToggleBtn: { justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.pill, paddingHorizontal: 16, paddingVertical: 8, color: Colors.textPrimary, fontSize: 15, maxHeight: 100 },
  sendButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: 8, backgroundColor: Colors.surface, borderRadius: 18 },

  mediaTabBar: { flexDirection: 'row', backgroundColor: Colors.surfaceAlt, paddingHorizontal: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  mediaTab: { paddingVertical: 10, paddingHorizontal: Spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  mediaTabActive: { borderBottomColor: Colors.primaryLight },
  mediaTabText: { color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  mediaTabTextActive: { color: Colors.primaryLight, fontWeight: 'bold' },

  gifPickerContainer: { backgroundColor: Colors.surfaceAlt, paddingVertical: Spacing.md },
  gifSearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.pill, height: 36, borderWidth: 1, borderColor: Colors.border },
  gifSearchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 13, color: Colors.textPrimary },
  gifOptionWrapper: { position: 'relative' },
  gifOption: { width: 100, height: 100, borderRadius: BorderRadius.md, marginLeft: Spacing.md, backgroundColor: Colors.surface },
  favoriteBtn: { position: 'absolute', top: 4, right: 4 + Spacing.md, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  createStickerBtn: { width: 100, height: 100, borderRadius: BorderRadius.md, marginLeft: Spacing.md, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  createStickerText: { color: Colors.textMuted, fontSize: 12, marginTop: 4, fontWeight: 'bold' },

  stickerPickerContainer: { backgroundColor: Colors.surfaceAlt },
  packSelectorBar: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  packSelectorContent: { paddingHorizontal: Spacing.sm, alignItems: 'center' },
  packTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activePackTab: { borderBottomColor: Colors.primaryLight },
  packTabText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  activePackTabText: { color: Colors.primaryLight, fontWeight: 'bold' },
  newPackBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.pill, marginVertical: 6, marginLeft: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  newPackText: { fontSize: 12, color: Colors.primaryLight, fontWeight: 'bold', marginLeft: 4 },

  // Modal Styles (used by Message Action Modal)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, height: '70%', paddingBottom: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  closeModalButton: { padding: 4 },

  modalOverlayCentered: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  smallModalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, width: '100%', padding: Spacing.xl },
  modalTextInput: { backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 12, color: Colors.textPrimary, fontSize: 16, marginTop: Spacing.lg, marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.pill },
  modalBtnCancelText: { color: Colors.textMuted, fontWeight: 'bold' },
  modalBtnSave: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.pill },
  modalBtnSaveText: { color: '#FFF', fontWeight: 'bold' },
  
  packSelectOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  packSelectOptionText: { fontSize: 16, color: Colors.textPrimary, marginLeft: Spacing.md, fontWeight: '500' },

  minimalStickerModal: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', minWidth: 220, position: 'relative' },
  minimalCloseBtn: { position: 'absolute', top: Spacing.md, right: Spacing.md, padding: 4 },
  largeStickerPreview: { width: 120, height: 120, resizeMode: 'contain', marginBottom: Spacing.md, marginTop: Spacing.sm },
  stickerPackInfo: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.lg },
  saveToPackBtnMinimal: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: Colors.borderLight },
  saveToPackBtnMinimalText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', marginLeft: 4 },

  messageActionModalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, width: 250, overflow: 'hidden' },
  messageActionOption: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  messageActionOptionText: { fontSize: 16, color: Colors.textPrimary, marginLeft: Spacing.md, fontWeight: '500' },
  messageActionCloseBtn: { backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, width: 250, padding: Spacing.lg, alignItems: 'center', marginTop: Spacing.md },
  messageActionCloseText: { fontSize: 16, color: Colors.primaryLight, fontWeight: 'bold' },

  // View Once Styles
  viewOnceBtnMinimal: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  viewOnceBtnViewedMinimal: { opacity: 0.5, borderColor: 'transparent' },
  viewOnceTextMinimal: { marginLeft: 6, fontSize: 13, fontWeight: '600' },
  viewOnceFullscreen: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  viewOnceImage: { width: '100%', height: '100%' },
  viewOnceHeader: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl },
  viewOnceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.pill },
  viewOnceBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#000' },
  viewOnceCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
});
