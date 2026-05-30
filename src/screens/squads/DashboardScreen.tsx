import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSquads } from '../../hooks/useSquads';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { EmptyState } from '../../components/ui/EmptyState';
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
        {item.readOnly && !item.avatar ? (
          <Ionicons name="megaphone-outline" size={18} color="#A78BFA" />
        ) : (
          <Image 
            source={{ uri: item.avatar  }} 
            style={styles.squadAvatar} 
          />
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
          <Image source={{ uri: '' }} style={[styles.overlapAvatar, { zIndex: 3 }]} />
          <Image source={{ uri: '' }} style={[styles.overlapAvatar, { zIndex: 2, marginLeft: -12 }]} />
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
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate('QRScanner' as any)} style={styles.headerBtn}>
              <Ionicons name="qr-code-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateSquad')} style={styles.headerBtn}>
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.pageSubtitle}>Manage your active groups and channels.</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primaryLight} style={{ marginTop: 40 }} />
        ) : squads.length === 0 ? (
          <EmptyState 
            iconName="people-circle-outline" 
            title="No squads yet" 
            subtitle="Create a new squad or join an existing one to hop on with friends." 
          />
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
  groupIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden' },
  squadAvatar: { width: '100%', height: '100%' },
  groupIconText: { color: Colors.primaryLight, fontSize: 20, fontWeight: 'bold' },
  groupInfo: { flex: 1 },
  groupName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  groupSubtitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
  avatarsContainer: { flexDirection: 'row', alignItems: 'center' },
  overlapAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.surface },
  moreAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  moreAvatarText: { fontSize: 10, fontWeight: 'bold', color: Colors.textSecondary },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerBtn: { padding: Spacing.xs, marginLeft: Spacing.sm },
});
