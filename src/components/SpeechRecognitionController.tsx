"use client";

import { useState, useEffect, useRef } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RefreshCw } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { VOICE_COMMANDS } from "@/utils/speechRecognition";
import { useRouter, usePathname } from "next/navigation";

// Helper function to check if any phrase in an array is included in the text
const includesAny = (text: string, phrases: string[]): boolean => {
  return phrases.some(phrase => text.includes(phrase));
};

export function SpeechRecognitionController() {
  const { settings, updateSettings, speakText } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [transcriptVisible, setTranscriptVisible] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [pageElements, setPageElements] = useState<{
    buttons: HTMLButtonElement[];
    links: HTMLAnchorElement[];
    inputs: HTMLInputElement[];
    headings: HTMLHeadingElement[];
  }>({ buttons: [], links: [], inputs: [], headings: [] });
  const [dynamicCommands, setDynamicCommands] = useState<string[]>([]);
  const restartCountRef = useRef(0);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Command variations for better recognition
  const commandVariations = {
    help: ['help', 'help me', 'show help', 'what can i say', 'commands', 'show commands', 'available commands'],
    home: ['home', 'go home', 'go to home', 'homepage', 'main page', 'take me home'],
    back: ['back', 'go back', 'previous', 'go back to previous', 'return'],
    profile: ['profile', 'go to profile', 'show profile', 'my profile', 'open profile'],
    settings: ['settings', 'go to settings', 'show settings', 'open settings', 'preferences'],
    jobs: ['jobs', 'go to jobs', 'show jobs', 'job listings', 'find jobs', 'open jobs'],
    refresh: ['refresh', 'refresh page', 'reload', 'reload page', 'update page'],
    highContrast: ['high contrast', 'enable high contrast', 'toggle high contrast', 'contrast mode'],
    largeText: ['large text', 'bigger text', 'increase text size', 'bigger font', 'large font'],
    normalText: ['normal text', 'regular text', 'default text', 'reset text size', 'standard text'],
    normalContrast: ['normal contrast', 'default contrast', 'reset contrast', 'standard contrast'],
    debug: ['debug', 'debug mode', 'debugging', 'show debug', 'developer mode'],
    click: ['click', 'press', 'select', 'choose', 'tap'],
    open: ['open', 'navigate to', 'go to', 'visit', 'show'],
    scroll: ['scroll', 'scroll down', 'scroll up', 'page down', 'page up'],
    read: ['read', 'read page', 'read content', 'read aloud', 'narrate'],
    submit: ['submit', 'send', 'save', 'confirm', 'apply']
  };
  
  // Use the react-speech-recognition hook directly with improved settings
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    clearTranscriptOnListen: false,
    commands: []
  });

  // Only show the controller if speech recognition is enabled
  if (!settings.speechRecognition) {
    return null;
  }

  // Check if speech recognition is supported
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-background border rounded-lg shadow-lg p-2">
        <p className="text-xs text-red-500">
          Speech recognition is not supported in this browser.
        </p>
        <p className="text-xs mt-1">
          Try using Chrome, Edge, or Safari for better compatibility.
        </p>
      </div>
    );
  }

  // Check microphone permission
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setMicPermission(permissionStatus.state as "granted" | "denied" | "prompt");
          
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state as "granted" | "denied" | "prompt");
          };
        })
        .catch(err => {
          console.error('Error checking microphone permission:', err);
        });
    }
  }, []);

  // Scan the page for interactive elements when the path changes
  useEffect(() => {
    const scanPageElements = () => {
      if (typeof document === 'undefined') return;
      
      // Wait a bit for the page to fully render
      setTimeout(() => {
        // Get all buttons
        const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
        
        // Get all links
        const links = Array.from(document.querySelectorAll('a')) as HTMLAnchorElement[];
        
        // Get all inputs
        const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
        
        // Get all headings
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLHeadingElement[];
        
        setPageElements({ buttons, links, inputs, headings });
        
        // Generate dynamic commands based on page elements
        const newDynamicCommands: string[] = [];
        
        // Add button texts
        buttons.forEach(button => {
          const buttonText = button.innerText?.trim();
          if (buttonText && buttonText.length > 0 && buttonText.length < 20) {
            newDynamicCommands.push(`click ${buttonText.toLowerCase()}`);
          }
        });
        
        // Add link texts
        links.forEach(link => {
          const linkText = link.innerText?.trim();
          if (linkText && linkText.length > 0 && linkText.length < 20) {
            newDynamicCommands.push(`open ${linkText.toLowerCase()}`);
          }
        });
        
        // Add heading texts for reading
        headings.forEach(heading => {
          const headingText = heading.innerText?.trim();
          if (headingText && headingText.length > 0) {
            newDynamicCommands.push(`read ${headingText.toLowerCase()}`);
          }
        });
        
        setDynamicCommands(newDynamicCommands);
        
        console.log('Page scanned, found:', {
          buttons: buttons.length,
          links: links.length,
          inputs: inputs.length,
          headings: headings.length,
          dynamicCommands: newDynamicCommands.length
        });
      }, 1000);
    };
    
    // Scan the page when it loads
    scanPageElements();
    
    // Also set up a mutation observer to detect DOM changes
    const observer = new MutationObserver((mutations) => {
      // Only rescan if there were significant changes
      const significantChanges = mutations.some(mutation => 
        mutation.type === 'childList' && mutation.addedNodes.length > 0
      );
      
      if (significantChanges) {
        scanPageElements();
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // Set up fade timeout for transcript
  const setupFadeTimeout = () => {
    // Clear any existing timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    
    // Set transcript to visible
    setTranscriptVisible(true);
    
    // Set up timeout to hide transcript after 5 seconds
    fadeTimeoutRef.current = setTimeout(() => {
      setTranscriptVisible(false);
      // Clear transcript after fade animation completes (300ms)
      setTimeout(() => {
        setCurrentTranscript("");
      }, 300);
    }, 5000);
  };

  // Find the best matching element on the page
  const findBestMatch = (text: string, type: 'button' | 'link' | 'heading'): Element | null => {
    let elements: Element[] = [];
    let searchText = text.toLowerCase();
    
    // Remove common prefixes based on type
    if (type === 'button') {
      commandVariations.click.forEach(prefix => {
        if (searchText.startsWith(prefix + ' ')) {
          searchText = searchText.substring(prefix.length + 1);
        }
      });
      elements = pageElements.buttons;
    } else if (type === 'link') {
      commandVariations.open.forEach(prefix => {
        if (searchText.startsWith(prefix + ' ')) {
          searchText = searchText.substring(prefix.length + 1);
        }
      });
      elements = pageElements.links;
    } else if (type === 'heading') {
      commandVariations.read.forEach(prefix => {
        if (searchText.startsWith(prefix + ' ')) {
          searchText = searchText.substring(prefix.length + 1);
        }
      });
      elements = pageElements.headings;
    }
    
    // Find the element with text that best matches the search text
    let bestMatch: Element | null = null;
    let bestMatchScore = 0;
    
    elements.forEach(element => {
      const elementText = element.textContent?.toLowerCase() || '';
      
      // Calculate a simple match score
      // 1. Exact match gets highest score
      if (elementText === searchText) {
        if (bestMatchScore < 100) {
          bestMatch = element;
          bestMatchScore = 100;
        }
        return;
      }
      
      // 2. Contains the entire search text
      if (elementText.includes(searchText)) {
        const score = 80 + (searchText.length / elementText.length) * 20;
        if (score > bestMatchScore) {
          bestMatch = element;
          bestMatchScore = score;
        }
        return;
      }
      
      // 3. Search text contains the element text
      if (searchText.includes(elementText) && elementText.length > 3) {
        const score = 60 + (elementText.length / searchText.length) * 20;
        if (score > bestMatchScore) {
          bestMatch = element;
          bestMatchScore = score;
        }
        return;
      }
      
      // 4. Partial word matches
      const searchWords = searchText.split(' ');
      const elementWords = elementText.split(' ');
      
      let matchedWords = 0;
      searchWords.forEach(word => {
        if (elementWords.some(eWord => eWord.includes(word) || word.includes(eWord))) {
          matchedWords++;
        }
      });
      
      if (matchedWords > 0) {
        const score = 40 + (matchedWords / searchWords.length) * 40;
        if (score > bestMatchScore) {
          bestMatch = element;
          bestMatchScore = score;
        }
      }
    });
    
    // Only return if we have a decent match
    return bestMatchScore > 50 ? bestMatch : null;
  };

  // Process dynamic page commands
  const processDynamicCommand = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Check for click commands
    if (commandVariations.click.some(cmd => lowerText.startsWith(cmd + ' '))) {
      const buttonElement = findBestMatch(lowerText, 'button');
      if (buttonElement) {
        console.log('Clicking button:', buttonElement.textContent);
        speakText(`Clicking ${buttonElement.textContent}`);
        (buttonElement as HTMLButtonElement).click();
        return true;
      }
    }
    
    // Check for open/navigate commands
    if (commandVariations.open.some(cmd => lowerText.startsWith(cmd + ' '))) {
      const linkElement = findBestMatch(lowerText, 'link');
      if (linkElement) {
        console.log('Opening link:', linkElement.textContent);
        speakText(`Opening ${linkElement.textContent}`);
        (linkElement as HTMLAnchorElement).click();
        return true;
      }
    }
    
    // Check for read commands
    if (commandVariations.read.some(cmd => lowerText.startsWith(cmd + ' '))) {
      const headingElement = findBestMatch(lowerText, 'heading');
      if (headingElement) {
        console.log('Reading heading:', headingElement.textContent);
        speakText(headingElement.textContent || '');
        return true;
      }
    }
    
    // Check for scroll commands
    if (includesAny(lowerText, commandVariations.scroll)) {
      if (lowerText.includes('down')) {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        speakText('Scrolling down');
        return true;
      } else if (lowerText.includes('up')) {
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
        speakText('Scrolling up');
        return true;
      } else {
        window.scrollBy({ top: window.innerHeight * 0.5, behavior: 'smooth' });
        speakText('Scrolling');
        return true;
      }
    }
    
    // Check for read page command
    if (lowerText === 'read page' || lowerText === 'read this page') {
      const mainContent = document.querySelector('main') || document.body;
      const textContent = mainContent.textContent || '';
      speakText(textContent.substring(0, 500)); // Limit to first 500 chars
      return true;
    }
    
    return false;
  };

  // Process commands based on transcript
  const processCommand = (text: string) => {
    // Convert to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase().trim();
    
    // Log the text being processed
    console.log('Processing command:', lowerText);
    
    // First try to process dynamic page-specific commands
    if (processDynamicCommand(lowerText)) {
      return true;
    }
    
    // Navigation commands
    if (includesAny(lowerText, commandVariations.home)) {
      router.push("/");
      speakText("Navigating to home page");
      return true;
    } 
    
    if (includesAny(lowerText, commandVariations.back)) {
      router.back();
      speakText("Going back");
      return true;
    } 
    
    if (includesAny(lowerText, commandVariations.profile)) {
      router.push("/profile");
      speakText("Navigating to profile page");
      return true;
    } 
    
    if (includesAny(lowerText, commandVariations.settings)) {
      router.push("/settings");
      speakText("Navigating to settings page");
      return true;
    } 
    
    if (includesAny(lowerText, commandVariations.jobs)) {
      router.push("/jobs");
      speakText("Navigating to jobs page");
      return true;
    } 
    
    if (includesAny(lowerText, commandVariations.refresh)) {
      window.location.reload();
      speakText("Refreshing page");
      return true;
    }
    
    // Help command
    if (includesAny(lowerText, commandVariations.help)) {
      setShowCommands(true);
      speakText("Available voice commands shown. You can also interact with page elements by saying click, open, or read followed by the element text.");
      return true;
    }
    
    // High contrast command
    if (includesAny(lowerText, commandVariations.highContrast)) {
      updateSettings({ highContrast: !settings.highContrast });
      speakText(`High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`);
      return true;
    }
    
    // Large text command
    if (includesAny(lowerText, commandVariations.largeText)) {
      updateSettings({ largeText: !settings.largeText });
      speakText(`Large text mode ${!settings.largeText ? 'enabled' : 'disabled'}`);
      return true;
    }
    
    // Normal text command
    if (includesAny(lowerText, commandVariations.normalText)) {
      updateSettings({ largeText: false });
      speakText("Normal text mode enabled");
      return true;
    }
    
    // Normal contrast command
    if (includesAny(lowerText, commandVariations.normalContrast)) {
      updateSettings({ highContrast: false });
      speakText("Normal contrast mode enabled");
      return true;
    }
    
    // Debug mode command
    if (includesAny(lowerText, commandVariations.debug)) {
      setDebugMode(prev => !prev);
      speakText(debugMode ? "Debug mode disabled" : "Debug mode enabled");
      return true;
    }
    
    // No command matched
    return false;
  };

  // Update transcript when it changes
  useEffect(() => {
    if (transcript && transcript.trim() !== "") {
      setCurrentTranscript(transcript);
      setupFadeTimeout();
      console.log('Transcript updated in component:', transcript);
      
      // Process the command
      const commandProcessed = processCommand(transcript);
      
      // If a command was processed, reset the transcript
      if (commandProcessed) {
        resetTranscript();
      }
    }
  }, [transcript, settings.highContrast, settings.largeText, updateSettings, speakText, debugMode, router]);

  // Clean up fade timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (settings.speechRecognition) {
      // Start listening
      startListening();
    }
    
    return () => {
      SpeechRecognition.stopListening();
      setIsListening(false);
    };
  }, [settings.speechRecognition]);

  // Update listening state when it changes
  useEffect(() => {
    setIsListening(listening);
    console.log('Listening state changed:', listening);
    
    // If listening stopped unexpectedly, restart it
    if (!listening && isListening) {
      console.log('Listening stopped unexpectedly, restarting...');
      setTimeout(() => {
        startListening();
      }, 1000);
    }
  }, [listening, isListening]);

  // Auto-restart speech recognition periodically to keep it fresh
  useEffect(() => {
    if (!isListening) return;
    
    const restartInterval = setInterval(() => {
      console.log('Periodic restart of speech recognition');
      forceRestart();
    }, 60000); // Restart every minute
    
    return () => {
      clearInterval(restartInterval);
    };
  }, [isListening]);

  // Function to start listening
  const startListening = () => {
    console.log('Starting listening...');
    SpeechRecognition.startListening({ 
      continuous: true,
      language: 'en-US',
      interimResults: true
    });
    setIsListening(true);
    speakText("Voice commands enabled");
  };

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      speakText("Voice commands disabled");
    } else {
      // Check if microphone permission is denied
      if (micPermission === "denied") {
        alert("Microphone access is blocked. Please allow microphone access in your browser settings.");
        return;
      }
      
      startListening();
      // Clear the transcript
      resetTranscript();
      setCurrentTranscript("");
      setTranscriptVisible(false);
    }
  };

  // Force restart speech recognition
  const forceRestart = () => {
    restartCountRef.current += 1;
    console.log(`Force restarting speech recognition (attempt ${restartCountRef.current})`);
    SpeechRecognition.abortListening();
    setTimeout(() => {
      startListening();
      resetTranscript();
      setCurrentTranscript("");
      setTranscriptVisible(false);
    }, 500);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background border rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[250px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleListening}
            aria-label={isListening ? "Disable voice commands" : "Enable voice commands"}
            className={isListening ? "text-green-500" : ""}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          <span className="text-xs font-medium">
            {isListening ? "Listening..." : "Voice off"}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={forceRestart}
            aria-label="Restart speech recognition"
            className="h-6 w-6 ml-1"
            title="Restart speech recognition"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div 
        className={`text-sm border rounded p-2 min-h-[40px] bg-muted/30 transition-opacity duration-300 ${
          transcriptVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {currentTranscript ? (
          <p className="break-words">
            <span className="text-xs text-muted-foreground">You said: </span>
            <span className="font-medium">{currentTranscript}</span>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {isListening ? "Speak now..." : "Voice recognition paused"}
          </p>
        )}
      </div>
      
      {micPermission === "denied" && (
        <div className="text-xs p-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          Microphone access is blocked. Please allow microphone access in your browser settings.
        </div>
      )}
      
      {!isMicrophoneAvailable && (
        <div className="text-xs p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md">
          Microphone not available. Please check your microphone connection.
        </div>
      )}
      
      {debugMode && (
        <div className="text-xs p-2 bg-muted rounded-md">
          <h4 className="font-bold">Debug Info:</h4>
          <ul className="mt-1">
            <li>Listening: {listening ? "Yes" : "No"}</li>
            <li>Component Listening: {isListening ? "Yes" : "No"}</li>
            <li>Mic Permission: {micPermission}</li>
            <li>Browser Support: {browserSupportsSpeechRecognition ? "Yes" : "No"}</li>
            <li>Mic Available: {isMicrophoneAvailable ? "Yes" : "No"}</li>
            <li>Current Path: {pathname}</li>
            <li>Page Elements: {Object.values(pageElements).flat().length}</li>
            <li>Dynamic Commands: {dynamicCommands.length}</li>
            <li>Restart Count: {restartCountRef.current}</li>
            <li>Current Transcript: {currentTranscript}</li>
          </ul>
        </div>
      )}
      
      {showCommands && (
        <div className="text-xs p-2 bg-muted rounded-md max-h-[300px] overflow-y-auto">
          <h4 className="font-bold">Available commands:</h4>
          <ul className="list-disc pl-4 mt-1">
            <li>Help / Show commands</li>
            <li>Settings / Preferences</li>
            <li>High contrast / Toggle contrast</li>
            <li>Large text / Bigger text</li>
            <li>Normal text / Default text</li>
            <li>Normal contrast / Default contrast</li>
            <li>Go home / Home page</li>
            <li>Go back / Previous</li>
            <li>Profile / My profile</li>
            <li>Settings / Preferences</li>
            <li>Jobs / Job listings</li>
            <li>Refresh / Reload page</li>
            <li>Scroll down / Scroll up</li>
            <li>Read page / Read this page</li>
            <li>Debug mode</li>
          </ul>
          
          {dynamicCommands.length > 0 && (
            <>
              <h4 className="font-bold mt-3">Page-specific commands:</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Try saying "click", "open", or "read" followed by any text you see on the page:
              </p>
              <ul className="list-disc pl-4 mt-1 max-h-[100px] overflow-y-auto">
                {dynamicCommands.slice(0, 10).map((cmd, index) => (
                  <li key={index}>{cmd}</li>
                ))}
                {dynamicCommands.length > 10 && (
                  <li className="text-muted-foreground">
                    ...and {dynamicCommands.length - 10} more
                  </li>
                )}
              </ul>
            </>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowCommands(false)}
            className="mt-1 h-6 text-xs w-full"
          >
            Hide
          </Button>
        </div>
      )}
      
      <div className="text-xs text-center text-muted-foreground">
        {!isListening ? "Click mic to enable voice" : micPermission === "granted" ? 
          "Say 'help' for commands" : "Allow microphone access"}
      </div>
    </div>
  );
} 