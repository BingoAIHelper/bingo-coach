"use client";

import { useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";

export function FocusManager() {
  const { settings } = useAccessibility();

  useEffect(() => {
    // Only apply enhanced keyboard navigation if the setting is enabled
    if (!settings.enhancedKeyboardNav) return;

    // Track whether the user is navigating with keyboard
    let usingKeyboard = false;

    // Add data attribute to focused elements for styling
    const handleFocus = (e: FocusEvent) => {
      if (usingKeyboard && e.target instanceof HTMLElement) {
        e.target.setAttribute('data-focus-visible-added', 'true');
      }
    };

    // Remove data attribute when focus is lost
    const handleBlur = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement) {
        e.target.removeAttribute('data-focus-visible-added');
      }
    };

    // Set keyboard navigation flag when Tab key is pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        usingKeyboard = true;
        
        // Add class to document root for global styling
        document.documentElement.classList.add('keyboard-navigation');
      }
    };

    // Reset keyboard navigation flag on mouse use
    const handleMouseDown = () => {
      usingKeyboard = false;
      
      // Remove class from document root
      document.documentElement.classList.remove('keyboard-navigation');
      
      // Remove data attribute from any currently focused element
      const focusedElement = document.querySelector('[data-focus-visible-added]');
      if (focusedElement instanceof HTMLElement) {
        focusedElement.removeAttribute('data-focus-visible-added');
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      
      // Remove class from document root
      document.documentElement.classList.remove('keyboard-navigation');
    };
  }, [settings.enhancedKeyboardNav]);

  // This component doesn't render anything visible
  return null;
} 