import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { EmptyState } from '../../components/ui/EmptyState';
import FeedPost from '../../components/feed/FeedPost';
import { useFeed } from '../../hooks/useFeed';
import type { MainTabScreenProps, FeedPostData } from '../../types';

export default function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const { profile, loading, updateAvatar, updateProfileDetails, getHandle } = useProfile();
  const { logout } = useAuth();
  const { showToast, showDialog } = useUI();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);

  const [tempNickname, setTempNickname] = useState('');
  const [tempHandle, setTempHandle] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempBannerUri, setTempBannerUri] = useState<string | null>(null);
  const [tempAvatarUri, setTempAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { posts, loading: feedLoading } = useFeed();
  const myPosts = posts.filter((p) => p.author.handle === getHandle());

  const handleLogout = () => {
    setSettingsVisible(false);
    showDialog({
      title: 'Log Out',
      message: 'Are you sure you want to log out?',
      actions: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login' as any);
          },
        },
      ]
    });
  };

  const openEditModal = () => {
    setTempNickname(profile?.nickname || '');
    setTempHandle(getHandle().replace('@', ''));
    setTempBio(profile?.bio || '');
    setTempBannerUri(null);
    setTempAvatarUri(null);
    setEditModalVisible(true);
  };

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempBannerUri(result.assets[0].uri);
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempAvatarUri(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      // If a new avatar was picked, update it via the dedicated hook method
      if (tempAvatarUri) {
        await updateAvatar(tempAvatarUri);
      }
      
      // Update other details
      const success = await updateProfileDetails({
        nickname: tempNickname,
        handle: tempHandle,
        bio: tempBio,
        bannerUri: tempBannerUri || undefined,
      });

      if (success) {
        setEditModalVisible(false);
      }
    } catch {
      showToast({ title: 'Error', message: 'Failed to save profile changes.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const displayAvatar = profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.nickname || 'G')}&background=7C3AED&color=FFF&size=150`;
  const displayBanner = profile?.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'; // Fallback retro gaming pattern

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scrollable Profile Content */}
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: displayBanner }} style={styles.bannerImage} />
          <View style={styles.headerOverlay}>
            <SafeAreaView style={styles.safeHeaderRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsVisible(true)}>
                <Ionicons name="settings-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </View>

        {/* Profile Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
            </View>
            <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
              <Text style={styles.editProfileBtnText}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.textDetails}>
            <Text style={styles.userName}>{profile?.nickname || 'User'}</Text>
            <Text style={styles.userHandle}>{getHandle()}</Text>
            
            {profile?.bio ? (
              <Text style={styles.bioText}>{profile.bio}</Text>
            ) : null}

            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('FollowList', { type: 'following', userName: profile?.nickname || 'User' })}>
                <Text style={styles.statCount}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} onPress={() => navigation.navigate('FollowList', { type: 'followers', userName: profile?.nickname || 'User' })}>
                <Text style={styles.statCount}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs Row */}
        <View style={styles.tabsRow}>
          <View style={[styles.tabItem, styles.tabItemActive]}>
            <Text style={[styles.tabText, styles.tabTextActive]}>Posts</Text>
          </View>
        </View>

        {/* Feed Section */}
        <View style={styles.feedSection}>
          {myPosts.length === 0 && !feedLoading ? (
            <View style={{ paddingTop: Spacing.xl }}>
              <EmptyState 
                iconName="document-text-outline" 
                title="No posts yet" 
                subtitle="When you share your gaming moments, they'll show up here." 
              />
            </View>
          ) : (
            myPosts.map(p => (
              <TouchableOpacity 
                key={p.id}
                activeOpacity={0.9} 
                onPress={() => navigation.getParent()?.navigate('PostDetail', { postId: p.id, postData: p })}
              >
                <FeedPost post={p} variant="feed" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.headerBtnText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleText}>Edit Profile</Text>
              <TouchableOpacity onPress={saveProfile} disabled={isSaving}>
                {isSaving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={[styles.headerBtnText, {color: Colors.primary, fontWeight: 'bold'}]}>Save</Text>}
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.editBannerContainer}>
                <Image source={{ uri: tempBannerUri || displayBanner }} style={styles.editBannerImage} />
                <TouchableOpacity style={styles.cameraIconOverlay} onPress={pickBanner}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.editAvatarWrapper}>
                <Image source={{ uri: tempAvatarUri || displayAvatar }} style={styles.editAvatarImage} />
                <TouchableOpacity style={styles.cameraIconOverlay} onPress={pickAvatar}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={tempNickname} 
                    onChangeText={setTempNickname} 
                    maxLength={30} 
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={tempHandle} 
                    onChangeText={setTempHandle} 
                    maxLength={15} 
                    autoCapitalize="none"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput 
                    style={[styles.textInput, styles.bioInput]} 
                    value={tempBio} 
                    onChangeText={setTempBio} 
                    maxLength={160} 
                    multiline 
                    placeholder="Add a bio to your profile"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Settings Action Sheet Modal */}
      <Modal visible={isSettingsVisible} transparent animationType="fade" onRequestClose={() => setSettingsVisible(false)}>
        <TouchableOpacity style={styles.actionSheetOverlay} activeOpacity={1} onPress={() => setSettingsVisible(false)}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.actionSheetItem} onPress={() => { setSettingsVisible(false); showToast({ title: 'Settings', message: 'App Settings not yet implemented.', type: 'info' }); }}>
              <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} style={styles.actionSheetIcon} />
              <Text style={styles.actionSheetText}>App Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color={Colors.error} style={styles.actionSheetIcon} />
              <Text style={[styles.actionSheetText, { color: Colors.error }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  bannerContainer: { width: '100%', height: 140, position: 'relative' },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  headerOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  safeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  iconButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  
  infoSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: -40, marginBottom: Spacing.sm },
  avatarWrapper: { borderRadius: 45, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  editProfileBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'transparent', marginTop: 45 },
  editProfileBtnText: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  
  textDetails: { marginTop: Spacing.xs },
  userName: { fontSize: 22, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 2 },
  userHandle: { fontSize: 15, color: Colors.textMuted, marginBottom: Spacing.md },
  bioText: { color: Colors.textPrimary, fontSize: 15, lineHeight: 20, marginBottom: Spacing.md },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginTop: Spacing.xs },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statCount: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  statLabel: { color: Colors.textMuted, fontSize: 14 },
  
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  tabItem: { paddingVertical: Spacing.md, marginRight: Spacing.xl },
  tabItemActive: { borderBottomWidth: 3, borderBottomColor: Colors.primaryLight },
  tabText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  tabTextActive: { color: Colors.textPrimary, fontWeight: 'bold' },
  
  feedSection: { flex: 1, paddingBottom: 40 },

  // Edit Modal Styles
  modalOverlay: { flex: 1, backgroundColor: Colors.background },
  editModalContainer: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? 40 : 50 },
  editModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerBtnText: { color: Colors.textPrimary, fontSize: 16 },
  modalTitleText: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  editBannerContainer: { height: 150, width: '100%', position: 'relative', backgroundColor: Colors.surfaceAlt },
  editBannerImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.7 },
  cameraIconOverlay: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }], width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  editAvatarWrapper: { position: 'absolute', top: 110, left: Spacing.lg, width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: Colors.background, backgroundColor: Colors.surfaceAlt, overflow: 'hidden' },
  editAvatarImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.7 },
  editForm: { paddingHorizontal: Spacing.lg, paddingTop: 60 },
  inputGroup: { marginBottom: Spacing.xl },
  inputLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 4, marginLeft: 4 },
  textInput: { backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: Colors.border, color: Colors.textPrimary, fontSize: 16, paddingVertical: 8, paddingHorizontal: 4 },
  bioInput: { minHeight: 60, textAlignVertical: 'top' },

  // Action Sheet Styles
  actionSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, padding: Spacing.lg, paddingBottom: 40 },
  actionSheetHandle: { width: 40, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  actionSheetTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'center' },
  actionSheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  actionSheetIcon: { marginRight: Spacing.md },
  actionSheetText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' }
});
