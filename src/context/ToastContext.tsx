"use client";

import React, { createContext, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";

type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

interface ToastContextProps {
  showToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number
  ) => string | void;
  hideToast: (id: string) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showLoading: (message: string) => string;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
  hideToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
  showLoading: () => "",
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Generic toast function
  const showToast = (
    message: string,
    variant: ToastVariant = "default",
    duration = 5000
  ): string | void => {
    switch (variant) {
      case "success":
        return toast.success(message, { duration });
      case "error":
        return toast.error(message, { duration });
      case "loading":
        return toast.loading(message);
      case "warning":
        return toast(message, {
          duration,
          icon: "⚠️",
          style: {
            background: "#FBBF24",
            color: "#fff",
          },
        });
      case "info":
        return toast(message, {
          duration,
          icon: "ℹ️",
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
        });
      default:
        return toast(message, { duration });
    }
  };

  // Hide a specific toast
  const hideToast = (id: string) => {
    toast.dismiss(id);
  };

  // Convenience methods for specific toast types
  const showSuccess = (message: string, duration = 4000) => {
    toast.success(message, {
      duration,
      style: {
        background: "#10B981",
        color: "#fff",
        fontWeight: "500",
      },
    });
  };

  const showError = (message: string, duration = 5000) => {
    toast.error(message, {
      duration,
      style: {
        background: "#EF4444",
        color: "#fff",
        fontWeight: "500",
      },
    });
  };

  const showWarning = (message: string, duration = 4000) => {
    toast(message, {
      duration,
      icon: "⚠️",
      style: {
        background: "#F59E0B",
        color: "#fff",
        fontWeight: "500",
      },
    });
  };

  const showInfo = (message: string, duration = 3000) => {
    toast(message, {
      duration,
      icon: "ℹ️",
      style: {
        background: "#3B82F6",
        color: "#fff",
        fontWeight: "500",
      },
    });
  };

  const showLoading = (message: string): string => {
    return toast.loading(message, {
      style: {
        background: "#6B7280",
        color: "#fff",
        fontWeight: "500",
      },
    });
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showLoading,
      }}
    >
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "react-hot-toast",
          style: {
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </ToastContext.Provider>
  );
};
