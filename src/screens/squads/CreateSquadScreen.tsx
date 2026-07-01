import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSquads } from '../../hooks/useSquads';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

export default function CreateSquadScreen({ navigation }: RootStackScreenProps<'CreateSquad'>) {
  const [squadName, setSquadName] = useState('');
  const [description, setDescription] = useState('');
  const { createSquad } = useSquads();
  const { contentWidth, horizontalPadding } = useResponsive();

  const handleCreateSquad = async () => {
    try {
      const groupId = await createSquad(squadName);
      if (groupId) {
        navigation.replace('SquadDetail', { squadId: groupId, squadName });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error creating squad:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1, width: '100%', maxWidth: contentWidth, alignSelf: 'center', paddingHorizontal: horizontalPadding }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Squad</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={40} color={Colors.primaryLight} />
            </View>
          </View>

          <Text style={styles.label}>Squad Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Valorant Ranked Comp" placeholderTextColor={Colors.textPlaceholder} value={squadName} onChangeText={setSquadName} maxLength={30} />

          <Text style={styles.label}>Description / Game</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="What are we playing today?" placeholderTextColor={Colors.textPlaceholder} value={description} onChangeText={setDescription} multiline numberOfLines={4} textAlignVertical="top" />

          <View style={styles.privateInfoContainer}>
            <Ionicons name="lock-closed" size={20} color={Colors.primaryLight} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Invite-Only Squad</Text>
              <Text style={styles.toggleDescription}>All squads are private by default. Nobody can join without an invitation from an existing member.</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.createButton, !squadName.trim() && styles.createButtonDisabled]} onPress={handleCreateSquad} disabled={!squadName.trim()}>
            <Text style={styles.createButtonText}>Create Squad</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.lg, paddingBottom: Spacing.lg },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  content: { flex: 1 },
  iconContainer: { alignItems: 'center', marginVertical: Spacing.xxl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.sm, marginLeft: 4 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.xl },
  textArea: { height: 100, paddingTop: Spacing.lg },
  privateInfoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceAlt, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xxl },
  toggleTextContainer: { flex: 1, paddingLeft: Spacing.md },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  toggleDescription: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },
  footer: { paddingVertical: Spacing.xl, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border },
  createButton: { backgroundColor: Colors.primary, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md, alignItems: 'center' },
  createButtonDisabled: { backgroundColor: Colors.surfaceAlt },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
