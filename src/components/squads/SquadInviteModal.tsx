import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

const DUMMY_FRIENDS = [
  { id: '1', name: 'Jake Paul', handle: '@jakepaul', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', isOnline: true },
  { id: '2', name: 'Alisha Marie', handle: '@alisha', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e', isOnline: false },
  { id: '3', name: 'Markiplier', handle: '@markiplier', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f', isOnline: true },
  { id: '4', name: 'Lilly Singh', handle: '@lilly', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a', isOnline: false },
];

interface SquadInviteModalProps {
  visible: boolean;
  onClose: () => void;
  squadId: string;
  squadName: string;
  squadAvatar?: string;
}

export default function SquadInviteModal({ visible, onClose, squadId, squadName, squadAvatar }: SquadInviteModalProps) {
  const [inviteTab, setInviteTab] = useState<'friends' | 'qr'>('qr');
  const [invitedFriends, setInvitedFriends] = useState<Set<string>>(new Set());

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite to {squadName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeModalButton}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, inviteTab === 'qr' && styles.activeTabButton]} 
              onPress={() => setInviteTab('qr')}
            >
              <Text style={[styles.tabText, inviteTab === 'qr' && styles.activeTabText]}>QR Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, inviteTab === 'friends' && styles.activeTabButton]} 
              onPress={() => setInviteTab('friends')}
            >
              <Text style={[styles.tabText, inviteTab === 'friends' && styles.activeTabText]}>Friends</Text>
            </TouchableOpacity>
          </View>

          {inviteTab === 'friends' ? (
            <FlatList
              data={DUMMY_FRIENDS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.friendsListContainer}
              renderItem={({ item }) => {
                const isInvited = invitedFriends.has(item.id);
                return (
                  <View style={styles.friendCard}>
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
                      {item.isOnline && <View style={styles.onlineBadge} />}
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.name}</Text>
                      <Text style={styles.friendHandle}>{item.handle}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.inviteButton, isInvited && styles.invitedButton]}
                      onPress={() => {
                        if (!isInvited) {
                          setInvitedFriends(prev => new Set(prev).add(item.id));
                        }
                      }}
                    >
                      <Text style={[styles.inviteButtonText, isInvited && styles.invitedButtonText]}>
                        {isInvited ? 'Sent' : 'Invite'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          ) : (
            <View style={styles.qrContainer}>
              <Text style={styles.qrInstruction}>Scan this QR code with the HopON app to instantly join {squadName}.</Text>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={`hopon://squad/${squadId}`}
                  size={200}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  logo={{ uri: squadAvatar || 'https://i.pravatar.cc/150' }}
                  logoSize={40}
                  logoBackgroundColor="#FFFFFF"
                  logoBorderRadius={20}
                />
              </View>
              <TouchableOpacity style={styles.shareLinkButton}>
                <Ionicons name="share-outline" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.shareLinkText}>Share Join Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, height: '70%', paddingBottom: Spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.textPrimary },
  closeModalButton: { padding: 4 },
  
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
  tabButton: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  activeTabButton: { borderBottomWidth: 2, borderBottomColor: Colors.primaryLight },
  tabText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
  activeTabText: { color: Colors.primaryLight, fontWeight: 'bold' },
  
  friendsListContainer: { padding: Spacing.lg },
  friendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderLight },
  avatarContainer: { position: 'relative', marginRight: Spacing.lg },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.border },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.surfaceAlt },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  friendHandle: { fontSize: 13, color: Colors.textMuted },
  inviteButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.pill, backgroundColor: Colors.primary },
  inviteButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  invitedButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.borderLight },
  invitedButtonText: { color: Colors.textMuted },

  qrContainer: { padding: Spacing.xl, alignItems: 'center' },
  qrInstruction: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 20 },
  qrCodeWrapper: { padding: Spacing.md, backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg, marginBottom: Spacing.xl, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  shareLinkButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: Colors.borderLight },
  shareLinkText: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 15 },
});
