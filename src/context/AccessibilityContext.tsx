"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlindMode: "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
  textToSpeech: boolean;
  enhancedKeyboardNav: boolean;
  speechRecognition: boolean;
  autoReadContent: boolean;
  hasCompletedOnboarding: boolean;
  fontSize: number;
  contrast: "normal" | "high" | "inverted";
  onboardingCompleted: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindMode: "none",
  textToSpeech: false, // Disabled by default
  enhancedKeyboardNav: false, // Disabled by default
  speechRecognition: false, // Disabled by default
  autoReadContent: false, // Disabled by default
  hasCompletedOnboarding: false,
  fontSize: 16,
  contrast: "normal",
  onboardingCompleted: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  // Initialize speech synthesis on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    } else {
      // Check if user has visited the site before
      const hasVisitedBefore = localStorage.getItem("bingo-site-visited");
      if (hasVisitedBefore) {
        // If they've visited before, mark onboarding as completed
        setSettings(prev => ({
          ...prev,
          hasCompletedOnboarding: true
        }));
      } else {
        // Mark that they've visited the site at least once
        localStorage.setItem("bingo-site-visited", "true");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("accessibility-settings", JSON.stringify(settings));
      
      // Apply settings to the document
      document.documentElement.classList.toggle("high-contrast", settings.highContrast);
      document.documentElement.classList.toggle("large-text", settings.largeText);
      document.documentElement.classList.toggle("reduced-motion", settings.reducedMotion);
      document.documentElement.classList.toggle("screen-reader-optimized", settings.screenReader);
      document.documentElement.classList.toggle("enhanced-keyboard-nav", settings.enhancedKeyboardNav);
      
      // Remove any existing color blind mode classes
      document.documentElement.classList.remove(
        "protanopia", 
        "deuteranopia", 
        "tritanopia", 
        "achromatopsia"
      );
      
      // Add the current color blind mode class if not "none"
      if (settings.colorBlindMode !== "none") {
        document.documentElement.classList.add(settings.colorBlindMode);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Function to speak text using the Web Speech API
  const speakText = (text: string) => {
    if (settings.textToSpeech && speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties based on user preferences
      // These could be expanded to include voice selection, rate, pitch, etc.
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Speak the text
      speechSynthesis.speak(utterance);
    }
  };

  // Function to stop any ongoing speech
  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings,
      speakText,
      stopSpeaking
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
} 