"use client";

import { useState, useEffect } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from "lucide-react";

export function TextToSpeechController() {
  const { settings, speakText, stopSpeaking } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [rate, setRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  
  // Only show the controller if text-to-speech is enabled
  if (!settings.textToSpeech) {
    return null;
  }

  // Initialize speech synthesis events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const speechSynthesis = window.speechSynthesis;
    
    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentUtterance(null);
    };
    
    const handleSpeechPause = () => {
      setIsPaused(true);
    };
    
    const handleSpeechResume = () => {
      setIsPaused(false);
    };
    
    // Add event listeners to speech synthesis
    speechSynthesis.addEventListener('voiceschanged', () => {
      // This event fires when the list of available voices changes
      // We could use this to update a voice selector if needed
    });
    
    // Clean up event listeners
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', () => {});
    };
  }, []);

  // Add event listeners to the current utterance
  useEffect(() => {
    if (!currentUtterance) return;
    
    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);
    
    currentUtterance.addEventListener('start', handleStart);
    currentUtterance.addEventListener('end', handleEnd);
    currentUtterance.addEventListener('pause', handlePause);
    currentUtterance.addEventListener('resume', handleResume);
    
    return () => {
      currentUtterance.removeEventListener('start', handleStart);
      currentUtterance.removeEventListener('end', handleEnd);
      currentUtterance.removeEventListener('pause', handlePause);
      currentUtterance.removeEventListener('resume', handleResume);
    };
  }, [currentUtterance]);

  // Function to speak selected text
  const speakSelectedText = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const text = selection.toString();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.volume = volume;
      
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    } else {
      // If no text is selected, try to speak the focused element's text
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        const text = activeElement.textContent || activeElement.getAttribute('aria-label') || '';
        if (text.trim() !== '') {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = rate;
          utterance.volume = volume;
          
          setCurrentUtterance(utterance);
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  };

  // Function to toggle speech pause/resume
  const togglePause = () => {
    if (typeof window === 'undefined') return;
    
    const speechSynthesis = window.speechSynthesis;
    
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    } else if (isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  // Function to stop speech
  const stopSpeech = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentUtterance(null);
  };

  // Function to change speech rate
  const changeRate = (newRate: number) => {
    setRate(newRate);
    
    // If currently speaking, update the rate
    if (currentUtterance) {
      stopSpeaking();
      
      // Create a new utterance with the updated rate
      const text = currentUtterance.text;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = newRate;
      utterance.volume = volume;
      
      setCurrentUtterance(utterance);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to increase rate
  const increaseRate = () => {
    const newRate = Math.min(rate + 0.1, 2.0);
    changeRate(newRate);
  };

  // Function to decrease rate
  const decreaseRate = () => {
    const newRate = Math.max(rate - 0.1, 0.5);
    changeRate(newRate);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-background border rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {isSpeaking ? (
          <>
            {isPaused ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePause}
                aria-label="Resume speech"
              >
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={togglePause}
                aria-label="Pause speech"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={stopSpeech}
              aria-label="Stop speech"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={speakSelectedText}
            aria-label="Speak selected text"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={decreaseRate}
          aria-label="Decrease speech rate"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <span className="text-xs font-mono">
          {rate.toFixed(1)}x
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={increaseRate}
          aria-label="Increase speech rate"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="text-xs text-center text-muted-foreground">
        {isSpeaking ? "Speaking..." : "Select text to speak"}
      </div>
    </div>
  );
} 