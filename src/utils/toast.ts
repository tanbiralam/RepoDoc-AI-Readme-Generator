import toast, { ToastPosition } from "react-hot-toast";

// Styles for consistent toast appearance
const toastStyles = {
  style: {
    background: "#18181B",
    color: "#fff",
    padding: "16px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  duration: 5000,
  position: "top-center" as ToastPosition,
};

// Success toasts
export const showGithubConnectedToast = () => {
  toast.success("GitHub successfully connected!", toastStyles);
};

export const showGithubSignInToast = () => {
  toast.success("Successfully signed in with GitHub!", toastStyles);
};

export const showSubscriptionUpdatedToast = () => {
  toast.success(
    "Your subscription has been updated successfully!",
    toastStyles
  );
};

export const showPaymentSuccessToast = () => {
  toast.success(
    "Payment successful! Your subscription has been activated.",
    toastStyles
  );
};

// Info toasts
export const showSubscriptionCancelledToast = () => {
  toast(
    "Your subscription has been cancelled. You will have access until the end of your billing period.",
    {
      ...toastStyles,
      icon: "🔔",
    }
  );
};

// Error toasts
export const showErrorToast = (message: string) => {
  toast.error(message, toastStyles);
};
