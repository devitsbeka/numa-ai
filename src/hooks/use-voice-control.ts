"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceCommand {
  command: string;
  action: () => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export function useVoiceControl(commands: VoiceCommand[], enabled: boolean) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandsRef = useRef(commands);
  const isManuallyStoppedRef = useRef(false);

  // Update commands ref
  useEffect(() => {
    commandsRef.current = commands;
  }, [commands]);

  // Initialize recognition
  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Don't auto-restart - this was causing infinite loops
      // User can manually restart by clicking the button again
    };

    recognition.onerror = (event: any) => {
      const ignorable = ['aborted', 'no-speech'];
      if (!ignorable.includes(event.error)) {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          final += text + ' ';
        } else {
          interim += text + ' ';
        }
      }

      // Show transcript
      const displayText = (final + interim).trim();
      if (displayText) {
        setTranscript(displayText);
      }

      // Process final results for commands
      if (final.trim()) {
        const text = final.toLowerCase().trim();
        const words = text.split(/\s+/);
        const firstWord = words[0];
        const normalizedText = text.replace(/[.,!?]/g, '').trim();

        console.log('🎤 Processing command:', normalizedText);
        console.log('🎤 Available commands:', commandsRef.current.map(c => c.command));

        // Try to match commands - check for multi-word commands first
        let matched = false;
        for (const { command, action } of commandsRef.current) {
          const cmd = command.toLowerCase();
          
          // For multi-word commands like "start over" or "change to light theme"
          if (cmd.includes(' ')) {
            // Check if normalized text contains the full command phrase
            if (normalizedText.includes(cmd)) {
              console.log('✅ Matched multi-word command:', command);
              setLastCommand(command);
              action();
              matched = true;
              break;
            }
          } else {
            // Single word commands - check first word or if text contains command
            if (firstWord === cmd || normalizedText.includes(cmd)) {
              console.log('✅ Matched single-word command:', command);
              setLastCommand(command);
              action();
              matched = true;
              break;
            }
          }
        }

        if (matched) {
          setTimeout(() => {
            setTranscript('');
            setLastCommand('');
          }, 2000);
        } else {
          console.log('❌ No command matched');
          // No match - clear after delay
          setTimeout(() => setTranscript(''), 3000);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [enabled]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      // Stop listening
      isManuallyStoppedRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors
      }
      setTranscript('');
      setLastCommand('');
      setIsListening(false);
    } else {
      // Start listening
      isManuallyStoppedRef.current = false;
      // Clear any pending timeouts that might restart
      setTimeout(() => {
        if (!isManuallyStoppedRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e: any) {
            if (e.name === 'InvalidStateError') {
              // Already started, that's fine
              setIsListening(true);
            } else {
              console.error('Failed to start recognition:', e);
            }
          }
        }
      }, 100);
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    toggleListening,
    transcript,
    lastCommand,
  };
}

