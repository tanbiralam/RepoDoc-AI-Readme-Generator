import { useEffect, useCallback } from "react";

interface ShortcutHandlers {
  onBold: () => void;
  onItalic: () => void;
  onHeading: () => void;
  onLink: () => void;
  onInlineCode: () => void;
  onCodeBlock: () => void;
}

export function useMarkdownShortcuts({
  onBold,
  onItalic,
  onHeading,
  onLink,
  onInlineCode,
  onCodeBlock,
}: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "b":
            event.preventDefault();
            onBold();
            break;
          case "i":
            event.preventDefault();
            onItalic();
            break;
          case "h":
            event.preventDefault();
            onHeading();
            break;
          case "k":
            event.preventDefault();
            onLink();
            break;
          case "`":
            event.preventDefault();
            if (event.shiftKey) {
              onCodeBlock();
            } else {
              onInlineCode();
            }
            break;
        }
      }
    },
    [onBold, onItalic, onHeading, onLink, onInlineCode, onCodeBlock]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
