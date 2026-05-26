import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { MainTabScreenProps } from '../../types';

export default function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const { profile, loading, updateNickname, updateAvatar, getHandle } = useProfile();
  const { logout } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();

  const [isModalVisible, setModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      await updateAvatar(asset.uri);
    }
  };

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    setIsSaving(true);
    try {
      const success = await updateNickname(tempNickname.trim());
      if (success) {
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update nickname.');
      }
    } catch {
      Alert.alert('Error', 'Failed to update nickname.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login' as any);
        },
      },
    ]);
  };

  const displayAvatar = avatarUri || profile?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704z';

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }} />
        ) : (
          <>
            <View style={styles.headerArea}>
              <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                <Image source={{ uri: displayAvatar }} style={styles.avatar} />
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>{profile?.nickname || 'User'}</Text>
              <Text style={styles.userHandle}>{getHandle()}</Text>
            </View>

            <View style={styles.settingsCard}>
              <TouchableOpacity style={styles.settingRow} onPress={() => { setTempNickname(profile?.nickname || ''); setModalVisible(true); }}>
                <View style={styles.settingIconBox}><Ionicons name="person" size={18} color={Colors.primaryLight} /></View>
                <Text style={styles.settingText}>Change Nickname</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow} onPress={pickImage}>
                <View style={styles.settingIconBox}><Ionicons name="image" size={18} color={Colors.primaryLight} /></View>
                <Text style={styles.settingText}>Change Avatar</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.settingRow}>
                <View style={styles.settingIconBox}><Ionicons name="notifications" size={18} color={Colors.primaryLight} /></View>
                <Text style={styles.settingText}>Push Notifications</Text>
                <Switch trackColor={{ false: Colors.borderLight, true: Colors.primary }} thumbColor="#FFFFFF" ios_backgroundColor={Colors.borderLight} onValueChange={setPushEnabled} value={pushEnabled} />
              </View>
              <TouchableOpacity style={[styles.settingRow, {borderBottomWidth: 0}]} onPress={() => Alert.alert('Settings', 'App settings menu not yet implemented.')}>
                <View style={styles.settingIconBox}><Ionicons name="settings" size={18} color={Colors.primaryLight} /></View>
                <Text style={styles.settingText}>App Settings</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} style={{marginRight: 8}} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Nickname</Text>
            <TextInput style={styles.modalInput} value={tempNickname} onChangeText={setTempNickname} placeholder="Enter new nickname" placeholderTextColor={Colors.textMuted} autoFocus maxLength={20} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={handleSaveNickname} disabled={isSaving}>
                {isSaving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.modalButtonTextSave}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingTop: Spacing.xl },
  headerArea: { alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xxxl },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#1E293B', backgroundColor: Colors.surfaceAlt },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.background },
  userName: { fontSize: 28, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: 4 },
  userHandle: { fontSize: FontSizes.md, color: Colors.textMuted },
  settingsCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxxl },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingIconBox: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  settingText: { flex: 1, fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F1626', paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: '#7F1D1D' },
  logoutText: { fontSize: 16, color: Colors.error, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, width: '85%', borderRadius: BorderRadius.xl, padding: Spacing.xxl, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.textPrimary, marginBottom: Spacing.lg },
  modalInput: { backgroundColor: Colors.surfaceAlt, borderRadius: BorderRadius.md, padding: Spacing.lg, fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.xxl, borderWidth: 1, borderColor: Colors.borderLight },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.md },
  modalButtonCancel: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md },
  modalButtonTextCancel: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  modalButtonSave: { backgroundColor: Colors.primary, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  modalButtonTextSave: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
