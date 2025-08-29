import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const shortcutsRef = useRef(shortcuts);
  
  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
    
    // Allow some shortcuts even in input fields (like Ctrl+S)
    const allowInInputs = ['s', 'Enter'];
    if (isInputElement && !allowInInputs.includes(event.key) && !event.ctrlKey && !event.metaKey) {
      return;
    }

    shortcutsRef.current.forEach((shortcut) => {
      const {
        key,
        ctrlKey = false,
        altKey = false,
        shiftKey = false,
        metaKey = false,
        action,
        preventDefault = true,
      } = shortcut;

      // Check if the current key combination matches the shortcut
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.altKey === altKey &&
        event.shiftKey === shiftKey &&
        event.metaKey === metaKey
      ) {
        if (preventDefault) {
          event.preventDefault();
        }
        action();
      }
    });
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
}

/**
 * Hook for Todo app specific shortcuts
 */
export function useTodoShortcuts(callbacks: {
  onNewTodo?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onToggleTheme?: () => void;
}) {
  const {
    onNewTodo,
    onSearch,
    onSave,
    onEscape,
    onToggleTheme,
  } = callbacks;

  const shortcuts: KeyboardShortcut[] = [
    // New todo (N)
    {
      key: 'n',
      action: () => onNewTodo?.(),
      description: 'Create new todo',
    },
    // Search (/)
    {
      key: '/',
      action: () => onSearch?.(),
      description: 'Focus search',
    },
    // Save (Ctrl/Cmd + S)
    {
      key: 's',
      ctrlKey: true,
      action: () => onSave?.(),
      description: 'Save',
    },
    {
      key: 's',
      metaKey: true,
      action: () => onSave?.(),
      description: 'Save (Mac)',
    },
    // Escape
    {
      key: 'Escape',
      action: () => onEscape?.(),
      description: 'Cancel/Close',
      preventDefault: false,
    },
    // Toggle theme (Ctrl/Cmd + Shift + T)
    {
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      action: () => onToggleTheme?.(),
      description: 'Toggle theme',
    },
    {
      key: 't',
      metaKey: true,
      shiftKey: true,
      action: () => onToggleTheme?.(),
      description: 'Toggle theme (Mac)',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

/**
 * Hook for global app shortcuts
 */
export function useGlobalShortcuts() {
  const shortcuts: KeyboardShortcut[] = [
    // Help (Ctrl/Cmd + ?)
    {
      key: '?',
      ctrlKey: true,
      action: () => {
        // TODO: Show help modal
        console.log('Help shortcuts');
      },
      description: 'Show help',
    },
    {
      key: '?',
      metaKey: true,
      action: () => {
        // TODO: Show help modal
        console.log('Help shortcuts');
      },
      description: 'Show help (Mac)',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}"