'use client';

import { Toaster, toast } from 'react-hot-toast';
import { ReactNode, createContext, useContext } from 'react';

// Define the toast context type
type ToastContextType = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showLoading: (message: string) => Promise<string>;
  dismissLoading: (toastId: string) => void;
};

// Create the context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: ReactNode;
}

// Toast provider component
export function ToastProvider({ children }: ToastProviderProps) {
  // Success toast
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        fontWeight: 'bold',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
    });
  };

  // Error toast
  const showError = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
        fontWeight: 'bold',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
    });
  };

  // Info toast
  const showInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontWeight: 'bold',
      },
      icon: '📢',
    });
  };

  // Warning toast
  const showWarning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontWeight: 'bold',
      },
      icon: '⚠️',
    });
  };

  // Loading toast that returns the toast ID
  const showLoading = async (message: string): Promise<string> => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6B7280',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  };

  // Dismiss a loading toast
  const dismissLoading = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showLoading,
        dismissLoading,
      }}
    >
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

// Custom hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
