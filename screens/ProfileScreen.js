import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  Switch, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../firebaseConfig';
import { getUserProfile, updateUserProfile } from '../services/FirebaseService';

export default function ProfileScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [nickname, setNickname] = useState('');
  const [avatarUri, setAvatarUri] = useState('https://i.pravatar.cc/150?u=a042581f4e29026704z');
  const [handle, setHandle] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const data = await getUserProfile(auth.currentUser.uid);
      if (data) {
        if (data.nickname) setNickname(data.nickname);
        if (data.avatar) setAvatarUri(data.avatar);
        // If handle doesn't exist, we fallback to formatting the nickname
        setHandle(data.handle || `@${(data.nickname || 'user').toLowerCase().replace(/\\s+/g, '')}`);
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Request base64 so we can easily save it to Firestore without Firebase Storage
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const base64Image = `data:image/jpeg;base64,${asset.base64}`;
      setAvatarUri(base64Image);
      
      // Save to Firebase
      try {
        await updateUserProfile(auth.currentUser.uid, { avatar: base64Image });
      } catch (error) {
        Alert.alert('Error', 'Failed to save avatar.');
      }
    }
  };

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    setIsSaving(true);
    
    try {
      const newNickname = tempNickname.trim();
      const newHandle = `@${newNickname.toLowerCase().replace(/\\s+/g, '')}`;
      
      await updateUserProfile(auth.currentUser.uid, { 
        nickname: newNickname,
        handle: newHandle 
      });
      
      setNickname(newNickname);
      setHandle(newHandle);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update nickname.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {
          auth.signOut();
          navigation.replace('Login');
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dimmed Background */}
      <TouchableOpacity 
        style={styles.dimmedBackground} 
        activeOpacity={1} 
        onPress={() => navigation.goBack()}
      />

      {/* Profile Card Bottom Sheet */}
      <View style={styles.card}>
        {loading ? (
          <ActivityIndicator size="large" color="#2C5282" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={styles.userName}>{nickname || 'User'}</Text>
            <Text style={styles.userHandle}>{handle}</Text>

            <View style={styles.settingsList}>
              <TouchableOpacity style={styles.settingRow} onPress={() => {
                setTempNickname(nickname);
                setModalVisible(true);
              }}>
                <Ionicons name="person-outline" size={20} color="#2C5282" style={styles.settingIcon} />
                <Text style={styles.settingText}>Change Nickname</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#2C5282" style={styles.settingIcon} />
                <Text style={styles.settingText}>Change Avatar</Text>
              </TouchableOpacity>

              <View style={styles.settingRow}>
                <Ionicons name="notifications-outline" size={20} color="#2C5282" style={styles.settingIcon} />
                <Text style={styles.settingText}>Push Notifications</Text>
                <Switch
                  trackColor={{ false: '#E2E8F0', true: '#2C5282' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#E2E8F0"
                  onValueChange={setPushEnabled}
                  value={pushEnabled}
                  style={{ marginLeft: 'auto' }}
                />
              </View>

              <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Settings', 'App settings menu not yet implemented.')}>
                <Ionicons name="settings-outline" size={20} color="#2C5282" style={styles.settingIcon} />
                <Text style={styles.settingText}>App Settings</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.settingIcon} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Nickname Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Nickname</Text>
            <TextInput
              style={styles.modalInput}
              value={tempNickname}
              onChangeText={setTempNickname}
              placeholder="Enter new nickname"
              autoFocus
              maxLength={20}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButtonCancel} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonSave} 
                onPress={handleSaveNickname}
                disabled={isSaving}
              >
                {isSaving ? (
                   <ActivityIndicator size="small" color="#FFF" />
                ) : (
                   <Text style={styles.modalButtonTextSave}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Darker dim background
    justifyContent: 'flex-end',
  },
  dimmedBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    minHeight: 350,
  },
  avatarContainer: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#E2E8F0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2C5282',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 32,
  },
  settingsList: {
    width: '100%',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 24,
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  logoutRow: {
    width: '100%',
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalButtonTextCancel: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSave: {
    backgroundColor: '#2C5282',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  modalButtonTextSave: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
