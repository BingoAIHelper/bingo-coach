// Type definition for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

// Define a global SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type CommandCallback = (text: string) => void;

interface Command {
  command: string;
  callback: CommandCallback;
  isFuzzy?: boolean;
}

// Import react-speech-recognition
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect } from 'react';

class SpeechRecognitionManager {
  private isListening: boolean = false;
  private commands: Command[] = [];
  private onResultCallback: ((text: string) => void) | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private browserSupportsSpeechRecognition: boolean = false;
  private restartTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if browser supports speech recognition
      this.browserSupportsSpeechRecognition = SpeechRecognition.browserSupportsSpeechRecognition();
      
      if (!this.browserSupportsSpeechRecognition) {
        console.warn('Speech Recognition API is not supported in this browser.');
      } else {
        console.log('Speech Recognition API is supported in this browser.');
      }
    }
  }

  public start(): void {
    if (!this.isListening && this.browserSupportsSpeechRecognition) {
      try {
        console.log('Starting speech recognition...');
        
        // First, make sure any previous instances are stopped
        SpeechRecognition.abortListening();
        
        // Start listening with continuous mode
        SpeechRecognition.startListening({ 
          continuous: true,
          language: 'en-US'
        });
        
        this.isListening = true;
        
        if (this.onStartCallback) {
          this.onStartCallback();
        }
        
        // Set up a restart timer to ensure continuous listening
        this.setupRestartTimer();
        
        console.log('Speech recognition started successfully');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }
  }

  public stop(): void {
    if (this.isListening && this.browserSupportsSpeechRecognition) {
      try {
        console.log('Stopping speech recognition...');
        
        // Clear any restart timers
        if (this.restartTimer) {
          clearTimeout(this.restartTimer);
          this.restartTimer = null;
        }
        
        SpeechRecognition.abortListening();
        this.isListening = false;
        
        if (this.onEndCallback) {
          this.onEndCallback();
        }
        
        console.log('Speech recognition stopped successfully');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      }
    }
  }

  private setupRestartTimer(): void {
    // Clear any existing timer
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
    }
    
    // Set up a new timer to restart listening every 30 seconds
    // This helps ensure continuous listening in browsers that might stop after a while
    this.restartTimer = setTimeout(() => {
      if (this.isListening) {
        console.log('Restarting speech recognition to ensure continuous listening');
        SpeechRecognition.abortListening();
        
        setTimeout(() => {
          if (this.isListening) {
            SpeechRecognition.startListening({ 
              continuous: true,
              language: 'en-US'
            });
            this.setupRestartTimer();
          }
        }, 500);
      }
    }, 30000); // 30 seconds
  }

  public addCommand(command: string, callback: CommandCallback, isFuzzy: boolean = false): void {
    this.commands.push({ command: command.toLowerCase(), callback, isFuzzy });
    console.log(`Added command: ${command} (fuzzy: ${isFuzzy})`);
  }

  public removeCommand(command: string): void {
    this.commands = this.commands.filter(cmd => cmd.command !== command.toLowerCase());
  }

  public onResult(callback: (text: string) => void): void {
    this.onResultCallback = callback;
  }

  public onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  public onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  public onError(callback: (error: any) => void): void {
    this.onErrorCallback = callback;
  }

  public processTranscript(transcript: string): void {
    if (!transcript) return;
    
    const text = transcript.trim().toLowerCase();
    console.log('Processing transcript:', text);
    
    if (this.onResultCallback) {
      this.onResultCallback(text);
    }
    
    // Process commands
    for (const { command, callback, isFuzzy } of this.commands) {
      if (isFuzzy ? text.includes(command) : text === command) {
        console.log(`Command matched: ${command}`);
        callback(text);
        break;
      }
    }
  }

  public isSupported(): boolean {
    return this.browserSupportsSpeechRecognition;
  }
}

// Create a singleton instance
let speechRecognitionManager: SpeechRecognitionManager | null = null;

export function getSpeechRecognition(): SpeechRecognitionManager {
  if (!speechRecognitionManager) {
    speechRecognitionManager = new SpeechRecognitionManager();
  }
  return speechRecognitionManager;
}

// Hook to use speech recognition in React components
export function useSpeechRecognitionHook() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    clearTranscriptOnListen: false,
    commands: []
  });
  
  const manager = getSpeechRecognition();
  
  // Process transcript when it changes
  useEffect(() => {
    if (transcript) {
      console.log('Transcript changed:', transcript);
      manager.processTranscript(transcript);
    }
  }, [transcript, manager]);
  
  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    start: () => manager.start(),
    stop: () => manager.stop(),
    addCommand: (command: string, callback: CommandCallback, isFuzzy?: boolean) => 
      manager.addCommand(command, callback, isFuzzy),
    removeCommand: (command: string) => manager.removeCommand(command),
    onResult: (callback: (text: string) => void) => manager.onResult(callback),
    onStart: (callback: () => void) => manager.onStart(callback),
    onEnd: (callback: () => void) => manager.onEnd(callback),
    onError: (callback: (error: any) => void) => manager.onError(callback),
    isSupported: () => manager.isSupported()
  };
}

// Common voice commands for accessibility
export const VOICE_COMMANDS = {
  NEXT: 'next',
  PREVIOUS: 'previous',
  SELECT: 'select',
  SUBMIT: 'submit',
  CANCEL: 'cancel',
  HELP: 'help',
  SETTINGS: 'settings',
  HOME: 'home',
  SCROLL_DOWN: 'scroll down',
  SCROLL_UP: 'scroll up',
  READ_PAGE: 'read page',
  STOP_READING: 'stop reading',
  HIGH_CONTRAST: 'high contrast',
  LARGE_TEXT: 'large text',
  NORMAL_TEXT: 'normal text',
  NORMAL_CONTRAST: 'normal contrast',
}; 