"use client";

import { useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const { settings, updateSettings, speakText } = useAccessibility();
  const router = useRouter();

  useEffect(() => {
    // Only enable keyboard shortcuts if enhanced keyboard navigation is enabled
    if (!settings.enhancedKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea, or contentEditable element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
      ) {
        return;
      }

      // Handle keyboard shortcuts with Alt key
      if (e.altKey) {
        switch (e.key) {
          // Navigation shortcuts
          case "h":
            // Navigate to home
            e.preventDefault();
            router.push("/");
            speakText("Navigating to home page");
            break;
          case "d":
            // Navigate to dashboard
            e.preventDefault();
            router.push("/dashboard");
            speakText("Navigating to dashboard");
            break;
          case "j":
            // Navigate to jobs
            e.preventDefault();
            router.push("/jobs");
            speakText("Navigating to jobs");
            break;
          case "r":
            // Navigate to resources
            e.preventDefault();
            router.push("/resources");
            speakText("Navigating to resources");
            break;
          case "p":
            // Navigate to profile
            e.preventDefault();
            router.push("/profile");
            speakText("Navigating to profile");
            break;

          // Accessibility shortcuts
          case "a":
            // Toggle accessibility settings dialog
            e.preventDefault();
            // This would need to be implemented via a global state or event system
            document.dispatchEvent(new CustomEvent("toggle-accessibility-dialog"));
            speakText("Opening accessibility settings");
            break;
          case "c":
            // Toggle high contrast
            e.preventDefault();
            updateSettings({ highContrast: !settings.highContrast });
            speakText(`High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`);
            break;
          case "t":
            // Toggle large text
            e.preventDefault();
            updateSettings({ largeText: !settings.largeText });
            speakText(`Large text mode ${!settings.largeText ? 'enabled' : 'disabled'}`);
            break;
          case "m":
            // Toggle reduced motion
            e.preventDefault();
            updateSettings({ reducedMotion: !settings.reducedMotion });
            speakText(`Reduced motion ${!settings.reducedMotion ? 'enabled' : 'disabled'}`);
            break;
          case "s":
            // Toggle text-to-speech
            e.preventDefault();
            updateSettings({ textToSpeech: !settings.textToSpeech });
            if (!settings.textToSpeech) {
              speakText("Text-to-speech enabled");
            }
            break;
        }
      }

      // Handle keyboard shortcuts with Ctrl+Shift
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case "?":
            // Show keyboard shortcuts help
            e.preventDefault();
            document.dispatchEvent(new CustomEvent("show-keyboard-shortcuts"));
            speakText("Showing keyboard shortcuts help");
            break;
          case "R":
            // Read current page
            e.preventDefault();
            const mainContent = document.querySelector("main");
            if (mainContent) {
              speakText(mainContent.textContent || "No content to read");
            }
            break;
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settings.enhancedKeyboardNav, settings.highContrast, settings.largeText, settings.reducedMotion, settings.textToSpeech, updateSettings, speakText, router]);

  // This component doesn't render anything visible
  return null;
} 