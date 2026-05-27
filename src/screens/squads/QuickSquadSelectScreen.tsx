import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSquads } from '../../hooks/useSquads';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

const { height } = Dimensions.get('window');

export default function QuickSquadSelectScreen({ navigation }: RootStackScreenProps<'QuickSquadSelect'>) {
  const { squads, loading } = useSquads();

  const handleSelectSquad = (squadName: string) => {
    navigation.goBack();
    navigation.navigate('HopOnRoom', { squadName });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Hop On</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Select a squad to deploy an alert</Text>

        {loading ? (
          <Text style={styles.loadingText}>Loading your squads...</Text>
        ) : squads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You are not in any squads yet.</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => {
              navigation.goBack();
              navigation.navigate('CreateSquad');
            }}>
              <Text style={styles.createBtnText}>Create a Squad</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={squads}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.squadItem} onPress={() => handleSelectSquad(item.name)}>
                <View style={styles.squadIconBox}>
                  {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.squadAvatar} />
                  ) : (
                    <Ionicons name="people" size={24} color={Colors.primaryLight} />
                  )}
                </View>
                <View style={styles.squadInfo}>
                  <Text style={styles.squadName}>{item.name}</Text>
                  <Text style={styles.squadMembers}>{item.members?.length || 0} Members</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 13, 23, 0.7)',
  },
  bottomSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    maxHeight: height * 0.7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xl,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  squadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  squadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  squadAvatar: {
    width: '100%',
    height: '100%',
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  squadMembers: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  loadingText: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
