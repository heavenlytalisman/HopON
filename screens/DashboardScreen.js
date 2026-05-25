import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../firebaseConfig';
import { getUserGroups, createGroup, joinGroup } from '../services/FirebaseService';

const GAMES = [
  { id: '1', name: 'Valorant', color: '#FA4454' },
  { id: '2', name: 'CS2', color: '#E4A010' },
  { id: '3', name: 'League', color: '#C8AA6E' },
];

export default function DashboardScreen({ route }) {
  const { nickname } = route.params || { nickname: 'Gamer' };
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
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
      if (userGroups.length > 0 && !selectedGroup) {
        setSelectedGroup(userGroups[0]);
      }
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

  const handleHopOn = () => {
    if (!selectedGroup) {
      Alert.alert('Error', 'Please select a group first!');
      return;
    }
    // Logic to send push notification alert to the group (Phase 3 next step)
    Alert.alert('Alert Sent!', `Notified ${selectedGroup.name} to hop on ${selectedGame.name}!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey {nickname},</Text>
          <Text style={styles.title}>Ready to game?</Text>
        </View>

        {/* Game Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Game</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {GAMES.map((game) => (
              <TouchableOpacity 
                key={game.id} 
                style={[
                  styles.card, 
                  { borderLeftColor: game.color, borderLeftWidth: 4 },
                  selectedGame.id === game.id && styles.selectedCard
                ]}
                onPress={() => setSelectedGame(game)}
              >
                <Text style={styles.cardText}>{game.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Group Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Squad</Text>
          {loading ? (
             <ActivityIndicator color="#10B981" />
          ) : groups.length === 0 ? (
             <Text style={styles.hintText}>You aren't in any groups yet.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
              {groups.map((group) => (
                <TouchableOpacity 
                  key={group.id} 
                  style={[
                    styles.card, 
                    { borderLeftColor: '#3B82F6', borderLeftWidth: 4 },
                    selectedGroup?.id === group.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={styles.cardText}>{group.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Group Management */}
        <View style={styles.groupManagement}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="New Group Name"
              placeholderTextColor="#475569"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity style={styles.smallButton} onPress={handleCreateGroup}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Join Group by ID"
              placeholderTextColor="#475569"
              value={joinGroupId}
              onChangeText={setJoinGroupId}
            />
            <TouchableOpacity style={styles.smallButton} onPress={handleJoinGroup}>
              <Text style={styles.buttonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.hopOnButton} onPress={handleHopOn}>
            <Text style={styles.hopOnText}>HOP ON</Text>
          </TouchableOpacity>
          <Text style={styles.actionHint}>
            Alerts everyone in {selectedGroup ? selectedGroup.name : 'your squad'}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { flexGrow: 1, padding: 20 },
  header: { marginTop: 20, marginBottom: 30 },
  greeting: { fontSize: 16, color: '#94A3B8', marginBottom: 4 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#F8FAFC' },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#CBD5E1', marginBottom: 16 },
  horizontalList: { flexDirection: 'row' },
  card: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginRight: 12, minWidth: 120, opacity: 0.7 },
  selectedCard: { opacity: 1, borderWidth: 1, borderColor: '#475569' },
  cardText: { color: '#F8FAFC', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  hintText: { color: '#64748B', fontStyle: 'italic' },
  groupManagement: { backgroundColor: '#1E293B', padding: 16, borderRadius: 12, marginBottom: 40 },
  inputRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#0F172A', borderRadius: 8, padding: 12, color: '#F8FAFC', marginRight: 12, borderWidth: 1, borderColor: '#334155' },
  smallButton: { backgroundColor: '#3B82F6', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  actionSection: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  hopOnButton: { backgroundColor: '#10B981', width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, marginBottom: 20 },
  hopOnText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  actionHint: { color: '#64748B', fontSize: 14, textAlign: 'center' },
});
