import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { getUserGroups } from '../services/FirebaseService';

export default function DashboardScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for the UI if firebase is empty/offline for UI demo
  const MOCK_SQUADS = [
    { id: '1', name: 'valorant-comp', members: 12, online: 4 },
    { id: '2', name: 'apex-legends-casual', members: 3, online: 0 },
    { id: '3', name: 'announcements', members: 46, readOnly: true },
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await getUserGroups(auth.currentUser.uid);
      setGroups(userGroups.length > 0 ? userGroups : MOCK_SQUADS);
    } catch (error) {
      setGroups(MOCK_SQUADS); // Fallback for UI demo
    } finally {
      setLoading(false);
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard}
      onPress={() => navigation.navigate('SquadDetail', { squadId: item.id, squadName: item.name })}
    >
      <View style={styles.groupIcon}>
        {item.readOnly ? (
          <Ionicons name="megaphone-outline" size={18} color="#2C5282" />
        ) : (
          <Text style={styles.groupIconText}>#</Text>
        )}
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.readOnly ? (
          <Text style={styles.groupSubtitle}>Read only • {item.members} members</Text>
        ) : (
          <Text style={styles.groupSubtitle}>
            <Text style={{ color: item.online > 0 ? '#10B981' : '#94A3B8' }}>● {item.online} online</Text> • {item.members} members
          </Text>
        )}
      </View>
      
      {item.readOnly ? (
        <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />
      ) : (
        <View style={styles.avatarsContainer}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=1' }} style={[styles.overlapAvatar, { zIndex: 3 }]} />
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=2' }} style={[styles.overlapAvatar, { zIndex: 2, marginLeft: -12 }]} />
          {item.members > 2 && (
             <View style={[styles.moreAvatar, { zIndex: 1, marginLeft: -12 }]}>
               <Text style={styles.moreAvatarText}>+{item.members - 2}</Text>
             </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Top Header matching Mockup */}
        <View style={styles.topBar}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=a042581f4e29026704z' }} style={styles.myAvatar} />
          <Text style={styles.headerTitle}>SquadUp</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Your Squads</Text>
        <Text style={styles.pageSubtitle}>Manage your active groups and channels.</Text>

        {loading ? (
           <ActivityIndicator color="#2C5282" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FC' },
  content: { flex: 1, padding: 20 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  myAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2C5282',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  listContainer: { paddingBottom: 100 },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    color: '#2C5282',
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  groupSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlapAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C5282',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2C5282',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
