"use client";

import { useAccessibility } from "@/context/AccessibilityContext";
import { AccessibilityButton } from "@/components/AccessibilityButton";
import { AccessibilityOnboarding } from "@/components/AccessibilityOnboarding";
import { SkipToContent } from "@/components/SkipToContent";
import { FocusManager } from "@/components/FocusManager";
import { TextToSpeechController } from "@/components/TextToSpeechController";
import { SpeechRecognitionController } from "@/components/SpeechRecognitionController";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

export function AccessibilityFeatures() {
  const { settings } = useAccessibility();
  
  return (
    <>
      {/* Always include the onboarding component */}
      <AccessibilityOnboarding />
      
      {/* Always include the accessibility button */}
      <AccessibilityButton />
      
      {/* Skip to content link - only visible on keyboard focus */}
      <SkipToContent />
      
      {/* Focus manager for keyboard navigation */}
      <FocusManager />
      
      {/* Text-to-speech controller - only visible if text-to-speech is enabled */}
      {settings.textToSpeech && <TextToSpeechController />}
      
      {/* Speech recognition controller - only visible if speech recognition is enabled */}
      {settings.speechRecognition && <SpeechRecognitionController />}
      
      {/* Keyboard shortcuts handler */}
      {settings.enhancedKeyboardNav && <KeyboardShortcuts />}
      
      {/* Keyboard shortcuts help dialog */}
      {settings.enhancedKeyboardNav && <KeyboardShortcutsHelp />}
      
      {/* Add any additional accessibility features here */}
    </>
  );
} 