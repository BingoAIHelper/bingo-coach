declare module 'react-speech-kit' {
  export interface SpeechSynthesisOptions {
    text: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
  }

  export interface UseSpeechSynthesisResult {
    speak: (options: SpeechSynthesisOptions) => void;
    cancel: () => void;
    speaking: boolean;
    supported: boolean;
    voices: SpeechSynthesisVoice[];
  }

  export function useSpeechSynthesis(options?: {
    onEnd?: () => void;
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onError?: (error: any) => void;
  }): UseSpeechSynthesisResult;

  export interface UseSpeechRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
  }

  export interface UseSpeechRecognitionResult {
    listen: (options?: UseSpeechRecognitionOptions) => void;
    listening: boolean;
    stop: () => void;
    transcript: string;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  export function useSpeechRecognition(options?: {
    onResult?: (result: string) => void;
    onEnd?: () => void;
    onStart?: () => void;
    onError?: (error: any) => void;
  }): UseSpeechRecognitionResult;
} 