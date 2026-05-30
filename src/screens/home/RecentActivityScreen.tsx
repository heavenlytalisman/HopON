import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { useFeed } from '../../hooks/useFeed';
import { useAuth } from '../../context/AuthContext';
import { useFriends } from '../../hooks/useFriends';
import { EmptyState } from '../../components/ui/EmptyState';
import type { RootStackScreenProps } from '../../types';

export default function RecentActivityScreen({ navigation }: RootStackScreenProps<'RecentActivity'>) {
  const { posts } = useFeed();
  const { profile } = useAuth();
  const { friends } = useFriends();

  const recentActivityPosts = posts.filter(post => {
    if (post.author.name === profile?.nickname) return true;
    return friends.some(friend => friend.nickname === post.author.name);
  });

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
        {recentActivityPosts.length === 0 ? (
          <EmptyState 
            iconName="pulse-outline" 
            title="No recent activity" 
            subtitle="Follow more people or join squads to see their latest updates here." 
          />
        ) : (
          <View style={styles.listContainer}>
            {recentActivityPosts.map((post, index) => (
              <View key={post.id} style={[styles.listItem, index === recentActivityPosts.length - 1 && { borderBottomWidth: 0 }]}>
                <Image source={{ uri: post.author.avatar || 'https://i.pravatar.cc/150' }} style={styles.activityAvatar} />
                <View style={styles.listInfo}>
                  <Text style={styles.activityUserText}>
                    <Text style={{color: Colors.textPrimary, fontWeight: '600'}}>{post.author.name}</Text> posted a new post
                  </Text>
                  <Text style={styles.activityGameText} numberOfLines={2}>"{post.content}"</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityTime}>{post.timestamp}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
