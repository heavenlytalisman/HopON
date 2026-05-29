import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../components/ui/Toast';
import Dialog from '../components/ui/Dialog';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

export interface DialogAction {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DialogOptions {
  title: string;
  message: string;
  actions?: DialogAction[];
}

interface UIContextType {
  showToast: (options: ToastOptions) => void;
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  // Toast State
  const [toastOptions, setToastOptions] = useState<ToastOptions | null>(null);
  const [toastKey, setToastKey] = useState(0); // Used to remount/retrigger toast

  // Dialog State
  const [dialogOptions, setDialogOptions] = useState<DialogOptions | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const showToast = (options: ToastOptions) => {
    setToastOptions(options);
    setToastKey(k => k + 1);
  };

  const showDialog = (options: DialogOptions) => {
    setDialogOptions(options);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  return (
    <UIContext.Provider value={{ showToast, showDialog, hideDialog }}>
      {children}
      {toastOptions && (
        <Toast 
          key={toastKey}
          title={toastOptions.title}
          message={toastOptions.message}
          type={toastOptions.type || 'info'}
          duration={toastOptions.duration || 2500}
        />
      )}
      <Dialog 
        visible={dialogVisible}
        title={dialogOptions?.title || ''}
        message={dialogOptions?.message || ''}
        actions={dialogOptions?.actions}
        onClose={hideDialog}
      />
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
