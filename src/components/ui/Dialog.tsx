import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import type { DialogAction } from '../../context/UIContext';

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  actions?: DialogAction[];
  onClose: () => void;
}

export default function Dialog({ visible, title, message, actions, onClose }: DialogProps) {
  
  // Default action if none provided
  const defaultActions: DialogAction[] = [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  const displayActions = actions && actions.length > 0 ? actions : defaultActions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialogBox}>
              <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {message ? <Text style={styles.message}>{message}</Text> : null}
              </View>
              
              <View style={[styles.actionsContainer, displayActions.length > 2 && { flexDirection: 'column' }]}>
                {displayActions.map((action, index) => {
                  
                  const isDestructive = action.style === 'destructive';
                  const isCancel = action.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionButton,
                        displayActions.length > 2 && { width: '100%', borderTopWidth: 1, borderTopColor: '#1E293B', paddingVertical: Spacing.md },
                        index > 0 && displayActions.length <= 2 && { borderLeftWidth: 1, borderLeftColor: '#1E293B' }
                      ]}
                      onPress={() => {
                        action.onPress();
                        onClose();
                      }}
                    >
                      <Text style={[
                        styles.actionText,
                        isDestructive && { color: Colors.error },
                        isCancel && { color: Colors.textMuted, fontWeight: '500' },
                        !isDestructive && !isCancel && { color: Colors.primaryLight, fontWeight: 'bold' }
                      ]}>
                        {action.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#151928',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: Colors.textMuted,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: FontSizes.base,
  },
});
