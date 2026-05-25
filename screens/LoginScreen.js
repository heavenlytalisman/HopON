import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { loginAnonymously } from '../services/FirebaseService';

export default function LoginScreen({ navigation }) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nickname.trim()) {
      Alert.alert('Hold up!', 'Please enter a nickname first.');
      return;
    }
    
    setLoading(true);
    try {
      await loginAnonymously(nickname.trim());
      navigation.replace('MainTabs', { 
        screen: 'Home', 
        params: { nickname: nickname.trim() } 
      });
    } catch (error) {
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>HopON</Text>
        <Text style={styles.subtitle}>Get the squad together.</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Choose a Nickname</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. xX_Slayer_Xx"
            placeholderTextColor="#475569"
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.discordButton, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Enter Lobby</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#313338', // Discord Primary
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F2F3F5',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#B5BAC1',
    marginBottom: 60,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: '#B5BAC1',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1E1F22', // Discord Tertiary
    borderRadius: 3,
    padding: 16,
    color: '#F2F3F5',
    fontSize: 16,
  },
  discordButton: {
    backgroundColor: '#5865F2', // Discord blurple
    paddingVertical: 16,
    borderRadius: 3,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
