import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUI } from '../../context/UIContext';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useSquads } from '../../hooks/useSquads';
import { removeMemberFromGroup } from '../../services/firebase';
import type { RootStackScreenProps } from '../../types';
import SquadInviteModal from '../../components/squads/SquadInviteModal';

export default function SquadEditScreen({ route, navigation }: RootStackScreenProps<'SquadEdit'>) {
  const { squadId, squadName: initialName, squadAvatar: initialAvatar } = route.params;

  const [squadName, setSquadName] = useState(initialName);
  const [squadAvatar, setSquadAvatar] = useState(initialAvatar );
  
  // Extract parameters passed back from SquadWallpaperScreen (or default to null/0.6)
  const squadWallpaper = (route.params as any).squadWallpaper || null;
  const wallpaperOpacity = (route.params as any).wallpaperOpacity || 0.6;
  
  const { squads } = useSquads();
  const squad = squads.find(s => s.id === squadId);
  const members = squad?.members || [];
  
  const [inviteModalVisible, setInviteModalVisible] = useState(false);

  const { showToast, showDialog } = useUI();

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSquadAvatar(result.assets[0].uri);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    showDialog({
      title: 'Remove Member',
      message: `Are you sure you want to remove ${memberName} from the squad?`,
      actions: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            const success = await removeMemberFromGroup(squadId, memberId);
            if (success) {
              showToast({ title: 'Removed', message: `${memberName} removed from squad.`, type: 'info' });
              navigation.goBack();
            } else {
              showToast({ title: 'Error', message: `Failed to remove ${memberName}`, type: 'error' });
            }
          } 
        }
      ]
    });
  };

  const handleSave = () => {
    if (!squadName.trim()) {
      showToast({ title: 'Invalid Name', message: 'Squad name cannot be empty.', type: 'error' });
      return;
    }
    
    // In a real app, we would make a Firebase call here.
    showToast({ title: 'Success', message: 'Squad details updated successfully!', type: 'success' });
    setTimeout(() => {
      navigation.navigate({
        name: 'SquadDetail',
        params: { squadId, squadName, squadWallpaper, wallpaperOpacity },
        merge: true,
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.headerBtnTextCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Squad</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={handleSave}>
            <Text style={styles.headerBtnTextSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.topProfileSection}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
              <Image source={{ uri: squadAvatar }} style={styles.squadAvatar} />
              <View style={styles.avatarOverlay}>
                <Ionicons name="camera" size={32} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>

            <TextInput
              style={styles.nameInput}
              value={squadName}
              onChangeText={setSquadName}
              placeholder="Squad Name"
              placeholderTextColor={Colors.textMuted}
              textAlign="center"
              maxLength={30}
            />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Customization</Text>
            </View>
            <View style={styles.settingsGroup}>
              <TouchableOpacity 
                style={styles.settingsItem}
                onPress={() => navigation.navigate('SquadWallpaper', { squadId, squadWallpaper, wallpaperOpacity })}
              >
                <View style={styles.settingsItemLeft}>
                  <View style={[styles.settingsIconWrapper, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                    <Ionicons name="color-palette-outline" size={18} color={Colors.primaryLight} />
                  </View>
                  <Text style={styles.settingsItemText}>Chat Wallpaper</Text>
                </View>
                <View style={styles.settingsItemRight}>
                  {squadWallpaper && <View style={styles.activeDot} />}
                  <Ionicons name="chevron-forward" size={20} color={Colors.border} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Members</Text>
              <TouchableOpacity style={styles.addMemberIconBtn} onPress={() => setInviteModalVisible(true)}>
                <Ionicons name="person-add" size={18} color={Colors.primaryLight} />
                <Text style={styles.addMemberText}>Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.membersList}>
              {members.map((memberId) => (
                <View key={memberId} style={styles.memberRow}>
                  <Image source={{ uri: '' + memberId }} style={styles.memberAvatar} />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>Member {memberId.slice(0, 4)}</Text>
                    <Text style={styles.memberHandle}>@{memberId.slice(0, 4)}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeBtn}
                    onPress={() => handleRemoveMember(memberId, 'Member')}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>

      <SquadInviteModal 
        visible={inviteModalVisible} 
        onClose={() => setInviteModalVisible(false)} 
        squadId={squadId}
        squadName={squadName}
        squadAvatar={squadAvatar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    minWidth: 60,
    justifyContent: 'center',
  },
  headerBtnTextCancel: {
    color: Colors.textMuted,
    fontSize: FontSizes.md,
  },
  headerBtnTextSave: {
    color: Colors.primaryLight,
    fontSize: FontSizes.md,
    fontWeight: '700',
    textAlign: 'right',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.base,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
  topProfileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  squadAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    width: '80%',
    paddingVertical: Spacing.sm,
    letterSpacing: 1,
  },
  sectionContainer: {
    paddingTop: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingsItemText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
    marginRight: Spacing.md,
  },
  addMemberIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addMemberText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  membersList: {
    paddingHorizontal: Spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    color: Colors.textPrimary,
    fontSize: FontSizes.base,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberHandle: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  removeBtn: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtnText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
});
