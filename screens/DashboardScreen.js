import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

const GAMES = [
  { id: '1', name: 'Valorant', color: '#FA4454' },
  { id: '2', name: 'CS2', color: '#E4A010' },
  { id: '3', name: 'League of Legends', color: '#C8AA6E' },
];

export default function DashboardScreen() {
  const handleHopOn = () => {
    // Logic to send push notification alert to the group
    alert('Alert sent to your squad!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey there,</Text>
          <Text style={styles.title}>Ready to game?</Text>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Select Game</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gamesList}>
            {GAMES.map((game) => (
              <TouchableOpacity key={game.id} style={[styles.gameCard, { borderLeftColor: game.color, borderLeftWidth: 4 }]}>
                <Text style={styles.gameName}>{game.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.hopOnButton} onPress={handleHopOn}>
            <Text style={styles.hopOnText}>HOP ON</Text>
          </TouchableOpacity>
          <Text style={styles.actionHint}>This will alert everyone in your squad.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark theme background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  gamesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 16,
  },
  gamesList: {
    flexDirection: 'row',
  },
  gameCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginRight: 16,
    minWidth: 140,
  },
  gameName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hopOnButton: {
    backgroundColor: '#10B981', // Emerald green for action
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginBottom: 20,
  },
  hopOnText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  actionHint: {
    color: '#64748B',
    fontSize: 14,
  },
});
