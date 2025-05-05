"use client";

import React, { createContext, useContext, useState } from "react";
import { Toast } from "@/components/ui/toast";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface ToastState {
  message: string;
  variant: ToastVariant;
  id: number;
}

interface ToastContextProps {
  showToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
  hideToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [nextId, setNextId] = useState(1);

  const showToast = (
    message: string,
    variant: ToastVariant = "default",
    duration = 5000
  ) => {
    const id = nextId;
    setNextId((prev) => prev + 1);

    setToasts((prev) => [...prev, { message, variant, id }]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  };

  const hideToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.variant}
            className="mb-2"
            onClose={() => hideToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
