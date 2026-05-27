import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const MOCK_ACTIVITY = [
  { id: '1', user: 'Rahid', action: 'posted a new post', game: '"Just hit Diamond in Valorant! Let\'s go 🔥"', time: '2m ago', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '2', user: 'Aman', action: 'posted a new post', game: '"Anyone looking for a duo in EA FC 24?"', time: '15m ago', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '3', user: 'Karan', action: 'posted a new post', game: '"Anyone up for late night chill?"', time: '1h ago', avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '4', user: 'Prem', action: 'posted a new post', game: '"Watching the new anime episode"', time: '2h ago', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', user: 'Vasif', action: 'posted a new post', game: '"Need 1 for CS2 premier"', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=1' },
];

export default function RecentActivityScreen({ navigation }: RootStackScreenProps<'RecentActivity'>) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Activity</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.listContainer}>
          {MOCK_ACTIVITY.map(activity => (
            <View key={activity.id} style={styles.listItem}>
              <Image source={{ uri: activity.avatar }} style={styles.activityAvatar} />
              <View style={styles.listInfo}>
                <Text style={styles.activityUserText}>
                  <Text style={{color: Colors.textPrimary, fontWeight: '600'}}>{activity.user}</Text> {activity.action}
                </Text>
                <Text style={styles.activityGameText} numberOfLines={2}>{activity.game}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  listContainer: {
    backgroundColor: '#151928',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  listInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  activityUserText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  activityGameText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
