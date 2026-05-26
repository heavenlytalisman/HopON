import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { createGroup } from '../services/FirebaseService';
import { auth } from '../firebaseConfig';

export default function CreateSquadScreen({ navigation }) {
  const [squadName, setSquadName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSquad = async () => {
    if (!squadName.trim() || !auth.currentUser) return;
    
    setIsCreating(true);
    try {
      await createGroup(squadName.trim(), description.trim(), auth.currentUser.uid);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create squad:', error);
      Alert.alert('Error', 'Error creating squad. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Squad</Text>
          <View style={{ width: 40 }} /> {/* Spacer to center title */}
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="people" size={40} color={Colors.primary} />
            </View>
          </View>

          <Text style={styles.label}>Squad Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Valorant Ranked Comp"
            placeholderTextColor={Colors.placeholder}
            value={squadName}
            onChangeText={setSquadName}
            maxLength={30}
          />

          <Text style={styles.label}>Description / Game</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What are we playing today?"
            placeholderTextColor={Colors.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.privateInfoContainer}>
            <Ionicons name="lock-closed" size={20} color={Colors.primary} />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleLabel}>Invite-Only Squad</Text>
              <Text style={styles.toggleDescription}>
                All squads are private by default. Nobody can join without an invitation from an existing member.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, !squadName.trim() && styles.createButtonDisabled]} 
            onPress={handleCreateSquad}
            disabled={!squadName.trim() || isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Squad</Text>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.avatarMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BEE3F8',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.subtextDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    shadowColor: Colors.placeholder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  privateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginBottom: 24,
  },
  toggleTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: Colors.subtext,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    backgroundColor: Colors.placeholder,
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
