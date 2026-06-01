import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import type { RootStackScreenProps } from '../../types';

export default function EmailLoginScreen({ navigation }: RootStackScreenProps<'EmailLogin'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { loginEmail } = useAuth();
  const { contentWidth, horizontalPadding } = useResponsive();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await loginEmail(email.trim(), password);
      navigation.replace('MainTabs', { screen: 'Home' } as any);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.message?.includes('auth/invalid-credential')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg(error.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0B0D17', '#0A0A0A']} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={[styles.scrollContent, { maxWidth: contentWidth, paddingHorizontal: horizontalPadding, alignSelf: 'center', width: '100%' }]}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Log in to hop on with your squad.</Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textPlaceholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.textPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Register')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: Spacing.xl },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  header: { marginBottom: Spacing.xxl },
  title: { fontSize: 32, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  subtitle: { fontSize: FontSizes.md, color: Colors.textSecondary },
  form: { width: '100%' },
  label: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.xs, marginLeft: 4 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: 14, fontSize: 16, color: Colors.textPrimary, marginBottom: Spacing.lg },
  button: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.xl, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  errorText: { color: Colors.error, marginLeft: Spacing.sm, fontSize: FontSizes.sm, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxxl },
  footerText: { color: Colors.textMuted, fontSize: FontSizes.md },
  footerLink: { color: Colors.primaryLight, fontSize: FontSizes.md, fontWeight: 'bold' },
});
