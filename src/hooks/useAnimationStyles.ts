import { useEffect } from "react";

/**
 * Custom hook for adding global animation styles to the document
 */
export const useAnimationStyles = () => {
  useEffect(() => {
    // Add animation styles to the document
    const styleEl = document.createElement("style");
    styleEl.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-out forwards;
      }
    `;
    document.head.appendChild(styleEl);

    // Cleanup function to remove the style element
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
};
