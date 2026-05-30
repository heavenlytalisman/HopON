import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
  fullScreen?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'planet-outline',
  title,
  subtitle,
  actionTitle,
  onAction,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={36} color={Colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionTitle && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullScreen: {
    flex: 1,
    height: '100%',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    borderStyle: 'dashed',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  actionText: {
    color: '#FFF',
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
  },
});
