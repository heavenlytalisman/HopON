import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSquads } from '../../hooks/useSquads';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import type { MainTabScreenProps, Group } from '../../types';

export default function SquadsScreen({ navigation }: MainTabScreenProps<'Squads'>) {
  const { squads, loading } = useSquads();
  const { profile } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('SquadDetail', { squadId: item.id, squadName: item.name, squadAvatar: item.avatar })}
    >
      <View style={styles.groupIcon}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.squadAvatar} />
        ) : item.readOnly ? (
          <Ionicons name="megaphone-outline" size={18} color="#A78BFA" />
        ) : (
          <Text style={styles.groupIconText}>#</Text>
        )}
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.readOnly ? (
          <Text style={styles.groupSubtitle}>Read only • {item.members.length} members</Text>
        ) : (
          <Text style={styles.groupSubtitle}>
            <Text style={{ color: (item.online ?? 0) > 0 ? Colors.success : Colors.textMuted }}>● {item.online ?? 0} online</Text> • {item.members.length} members
          </Text>
        )}
      </View>

      {item.readOnly ? (
        <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} />
      ) : (
        <View style={styles.avatarsContainer}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} style={[styles.overlapAvatar, { zIndex: 3 }]} />
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=2' }} style={[styles.overlapAvatar, { zIndex: 2, marginLeft: -12 }]} />
          {item.members.length > 2 && (
            <View style={[styles.moreAvatar, { zIndex: 1, marginLeft: -12 }]}>
              <Text style={styles.moreAvatarText}>+{item.members.length - 2}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { paddingHorizontal: horizontalPadding, maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.topBar}>
          <Text style={styles.headerTitle}>SQUADS</Text>
        </View>

        <Text style={styles.pageSubtitle}>Manage your active groups and channels.</Text>

        <TouchableOpacity 
          style={styles.createSquadCard} 
          onPress={() => navigation.navigate('CreateSquad')}
        >
          <View style={styles.createSquadIconBox}>
            <Ionicons name="add" size={24} color="#FFF" />
          </View>
          <View style={styles.createSquadInfo}>
            <Text style={styles.createSquadTitle}>Create New Squad</Text>
            <Text style={styles.createSquadSubtitle}>Form a new group and invite your friends</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator color={Colors.primaryLight} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={squads}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingTop: Spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  pageSubtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.xl },
  listContainer: { paddingBottom: 100 },
  groupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  groupIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  squadAvatar: { width: '100%', height: '100%' },
  groupIconText: { color: Colors.primaryLight, fontSize: 18, fontWeight: 'bold' },
  groupInfo: { flex: 1 },
  groupName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  groupSubtitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  avatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  overlapAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.surface },
  moreAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  moreAvatarText: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary },
  createSquadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1E2E', padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.xl, borderWidth: 1, borderColor: '#7C3AED' },
  createSquadIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  createSquadInfo: { flex: 1 },
  createSquadTitle: { color: Colors.textPrimary, fontSize: FontSizes.md, fontWeight: 'bold', marginBottom: 4 },
  createSquadSubtitle: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },
});
