import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { ToastType } from '../../context/UIContext';

interface ToastProps {
  title: string;
  message?: string;
  type: ToastType;
  duration: number;
}

export default function Toast({ title, message, type, duration }: ToastProps) {
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: Platform.OS === 'ios' ? 60 : 40,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Animate out after duration
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, opacity, translateY]);

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'warning';
      default: return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return Colors.success;
      case 'error': return Colors.error;
      default: return Colors.primaryLight;
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={22} color={getIconColor()} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {message ? <Text style={styles.message} numberOfLines={2}>{message}</Text> : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151928',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 400,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
  message: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
