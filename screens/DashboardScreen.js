import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { getUserGroups, createGroup, joinGroup } from '../services/FirebaseService';

export default function DashboardScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinGroupId, setJoinGroupId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await getUserGroups(auth.currentUser.uid);
      setGroups(userGroups);
    } catch (error) {
      Alert.alert('Error', 'Could not load groups.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup(newGroupName.trim(), auth.currentUser.uid);
      setNewGroupName('');
      loadGroups();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinGroupId.trim()) return;
    try {
      await joinGroup(joinGroupId.trim(), auth.currentUser.uid);
      setJoinGroupId('');
      loadGroups();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard}
      onPress={() => navigation.navigate('SquadDetail', { squadId: item.id, squadName: item.name })}
    >
      <View style={styles.groupIcon}>
        <Text style={styles.groupIconText}>#</Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupId}>ID: {item.id}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B5BAC1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Group Management */}
        <View style={styles.managementSection}>
          <Text style={styles.sectionTitle}>Add a Squad</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="New Squad Name"
              placeholderTextColor="#80848E"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateGroup}>
              <Ionicons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Join by ID"
              placeholderTextColor="#80848E"
              value={joinGroupId}
              onChangeText={setJoinGroupId}
            />
            <TouchableOpacity style={styles.actionButton} onPress={handleJoinGroup}>
              <Ionicons name="log-in-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Squads</Text>
        {loading ? (
           <ActivityIndicator color="#5865F2" style={{ marginTop: 20 }} />
        ) : groups.length === 0 ? (
           <Text style={styles.emptyText}>You haven't joined any squads yet.</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#313338' },
  content: { flex: 1, padding: 16 },
  managementSection: {
    backgroundColor: '#2B2D31',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#B5BAC1', 
    textTransform: 'uppercase', 
    marginBottom: 12 
  },
  inputRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  input: { 
    flex: 1, 
    backgroundColor: '#1E1F22', 
    borderRadius: 4, 
    padding: 12, 
    color: '#F2F3F5', 
    marginRight: 8 
  },
  actionButton: { 
    backgroundColor: '#5865F2', 
    width: 48, 
    height: 48, 
    borderRadius: 4, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyText: { color: '#80848E', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  listContainer: { paddingBottom: 20 },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2D31',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1F22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    color: '#B5BAC1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    color: '#F2F3F5',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  groupId: {
    color: '#80848E',
    fontSize: 12,
  },
});
