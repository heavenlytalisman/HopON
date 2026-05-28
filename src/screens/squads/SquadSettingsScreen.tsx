import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

export default function SquadSettingsScreen({ route, navigation }: RootStackScreenProps<'SquadSettings'>) {
  const { squadId, squadName: initialName, squadAvatar: initialAvatar } = route.params;

  const [squadName, setSquadName] = useState(initialName);
  const [squadAvatar, setSquadAvatar] = useState(initialAvatar || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to change the squad icon.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSquadAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // In a real app, this would dispatch an update to Firebase or the backend
    if (!squadName.trim()) {
      Alert.alert('Error', 'Squad name cannot be empty.');
      return;
    }
    
    Alert.alert('Success', 'Squad settings updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Squad Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: squadAvatar }} style={styles.avatarLarge} />
              <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarLabel}>Change Squad Icon</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Squad Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={squadName}
                onChangeText={setSquadName}
                placeholder="Enter squad name"
                placeholderTextColor={Colors.textMuted}
                maxLength={30}
              />
              {squadName.length > 0 && (
                <TouchableOpacity onPress={() => setSquadName('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.charCount}>{squadName.length}/30</Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.leaveBtn} onPress={() => Alert.alert('Leave Squad', 'Are you sure you want to leave this squad? This action cannot be undone.')}>
            <Ionicons name="exit-outline" size={20} color={Colors.error} />
            <Text style={styles.leaveBtnText}>Leave Squad</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  content: {
    padding: Spacing.xl,
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.surfaceAlt,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  avatarLabel: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
  },
  inputSection: {
    marginBottom: Spacing.xxl,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.md,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: FontSizes.md,
    fontWeight: 'bold',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  leaveBtnText: {
    color: Colors.error,
    fontSize: FontSizes.md,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
