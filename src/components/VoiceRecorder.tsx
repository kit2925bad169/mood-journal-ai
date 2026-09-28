import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';

type VoiceRecorderProps = {
  language?: string;
  languageName?: string;
  onTranscriptionComplete?: (text: string) => void;
  onTranscript?: (text: string) => void;
  onTextChange?: (text: string) => void;
  onChange?: (text: string) => void;
  disabled?: boolean;
  className?: string;
  isAnalyzing?: boolean;
  [key: string]: any;
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ta: 'Tamil',
  tanglish: 'Tanglish',
  te: 'Telugu',
  hi: 'Hindi',
  ur: 'Urdu',
  kn: 'Kannada',
  ml: 'Malayalam'
};

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    return '';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4'
  ];

  return (
    types.find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ''
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      try {
        const result = String(reader.result || '');

        const base64 = result.includes(',')
          ? result.split(',')[1]
          : result;

        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(
        new Error(
          'Unable to read the recorded audio.'
        )
      );
    };

    reader.readAsDataURL(blob);
  });
}

export function VoiceRecorder({
  language = 'en',
  languageName,
  onTranscriptionComplete,
  onTranscript,
  onTextChange,
  onChange,
  disabled = false,
  className = '',
  isAnalyzing = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] =
    useState(false);

  const [isTranscribing, setIsTranscribing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [seconds, setSeconds] =
    useState(0);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<number | null>(null);

  const stoppingRef =
    useRef(false);

  const cleanLanguage =
    String(language || 'en')
      .toLowerCase()
      .trim();

  const selectedLanguageName =
    languageName ||
    LANGUAGE_NAMES[cleanLanguage] ||
    'English';

  useEffect(() => {
    return () => {
      stopTimer();

      if (mediaRecorderRef.current) {
        try {
          if (
            mediaRecorderRef.current.state !==
            'inactive'
          ) {
            mediaRecorderRef.current.stop();
          }
        } catch {
          // Ignore cleanup errors.
        }
      }

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  function stopTimer() {
    if (timerRef.current !== null) {
      window.clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }
  }

  function startTimer() {
    stopTimer();

    setSeconds(0);

    timerRef.current =
      window.setInterval(() => {
        setSeconds(
          (current) => current + 1
        );
      }, 1000);
  }

  function formatTime(value: number) {
    const minutes = Math.floor(
      value / 60
    )
      .toString()
      .padStart(2, '0');

    const secs = (value % 60)
      .toString()
      .padStart(2, '0');

    return `${minutes}:${secs}`;
  }

  async function transcribeAudio(
    blob: Blob
  ) {
    setIsTranscribing(true);
    setError('');

    try {
      const token =
        localStorage.getItem(
          'mood_journal_token'
        );

      if (!token) {
        throw new Error(
          'Please log in again before using voice input.'
        );
      }

      if (
        !blob ||
        blob.size === 0
      ) {
        throw new Error(
          'No audio was recorded. Please try again.'
        );
      }

      const audio =
        await blobToBase64(blob);

      if (!audio) {
        throw new Error(
          'The recorded audio could not be processed.'
        );
      }

      const response =
        await fetch(
          '/api/voice/transcribe',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Authorization:
                `Bearer ${token}`
            },
            body: JSON.stringify({
              audio,
              mimeType:
                blob.type ||
                'audio/webm',
              language:
                cleanLanguage,
              languageName:
                selectedLanguageName
            })
          }
        );

      let result: any = null;

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          `Voice transcription failed (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.details ||
            result?.error ||
            `Voice transcription failed (${response.status}).`
        );
      }

      const text =
        String(
          result?.text ||
            result?.transcript ||
            result?.transcription ||
            ''
        ).trim();

      if (!text) {
        throw new Error(
          'No speech was detected. Please try again.'
        );
      }

      console.log(
        'Gemini transcript:',
        text
      );

      onTranscriptionComplete?.(
        text
      );

      onTranscript?.(text);

      onTextChange?.(text);

      onChange?.(text);
    } catch (err: any) {
      console.error(
        'Voice transcription error:',
        err
      );

      setError(
        err?.message ||
          'Unable to transcribe the recording.'
      );
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    if (
      disabled ||
      isRecording ||
      isTranscribing ||
      isAnalyzing
    ) {
      return;
    }

    setError('');
    setSeconds(0);
    stoppingRef.current = false;

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        throw new Error(
          'Your browser does not support microphone recording.'
        );
      }

      if (
        typeof MediaRecorder ===
        'undefined'
      ) {
        throw new Error(
          'Your browser does not support audio recording.'
        );
      }

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 48000
            }
          });

      streamRef.current = stream;

      chunksRef.current = [];

      const mimeType =
        getSupportedMimeType();

      const recorder =
        mimeType
          ? new MediaRecorder(
              stream,
              { mimeType }
            )
          : new MediaRecorder(
              stream
            );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable =
        (event: BlobEvent) => {
          if (
            event.data &&
            event.data.size > 0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onerror = () => {
        setError(
          'The microphone recording failed. Please try again.'
        );
      };

      recorder.onstop =
        async () => {
          stopTimer();

          setIsRecording(false);

          const actualMimeType =
            recorder.mimeType ||
            mimeType ||
            'audio/webm';

          const recordedChunks = [
            ...chunksRef.current
          ];

          const blob =
            new Blob(
              recordedChunks,
              {
                type: actualMimeType
              }
            );

          streamRef.current
            ?.getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );

          streamRef.current =
            null;

          mediaRecorderRef.current =
            null;

          chunksRef.current = [];

          stoppingRef.current =
            false;

          if (blob.size === 0) {
            setError(
              'No audio was recorded. Please try again.'
            );

            return;
          }

          await transcribeAudio(
            blob
          );
        };

      recorder.start(250);

      setIsRecording(true);

      startTimer();
    } catch (err: any) {
      console.error(
        'Microphone error:',
        err
      );

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      streamRef.current = null;

      mediaRecorderRef.current =
        null;

      setIsRecording(false);

      stopTimer();

      if (
        err?.name ===
        'NotAllowedError'
      ) {
        setError(
          'Microphone permission was denied. Please allow microphone access and try again.'
        );
      } else if (
        err?.name ===
        'NotFoundError'
      ) {
        setError(
          'No microphone was found on this device.'
        );
      } else if (
        err?.name ===
        'NotReadableError'
      ) {
        setError(
          'The microphone is being used by another application.'
        );
      } else {
        setError(
          err?.message ||
            'Unable to start recording.'
        );
      }
    }
  }

  function stopRecording() {
    const recorder =
      mediaRecorderRef.current;

    if (
      !recorder ||
      recorder.state ===
        'inactive'
    ) {
      return;
    }

    if (stoppingRef.current) {
      return;
    }

    stoppingRef.current = true;

    try {
      recorder.stop();
    } catch (err) {
      console.error(
        'Stop recording error:',
        err
      );

      stoppingRef.current =
        false;

      setIsRecording(false);

      stopTimer();

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      streamRef.current =
        null;

      mediaRecorderRef.current =
        null;
    }
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 w-full py-2 ${className}`}
    >
      {/* VOICE BUTTON */}

      <button
        type="button"
        disabled={
          disabled ||
          isTranscribing ||
          isAnalyzing
        }
        onClick={
          isRecording
            ? stopRecording
            : startRecording
        }
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-sm shadow-md transition-all duration-200 ${
          isRecording
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-label={
          isRecording
            ? 'Stop voice recording'
            : 'Start voice recording'
        }
      >
        {isTranscribing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />

            <span>
              Transcribing...
            </span>
          </>
        ) : isRecording ? (
          <>
            <Square className="h-5 w-5 fill-current" />

            <span>
              Stop Recording
            </span>

            <span className="ml-1">
              {formatTime(seconds)}
            </span>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />

            <span>
              Start Voice Recording
            </span>
          </>
        )}
      </button>

      {/* RECORDING MESSAGE */}

      {isRecording && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Listening... Speak naturally.
          </p>
        </div>
      )}

      {/* TRANSCRIBING MESSAGE */}

      {isTranscribing && (
        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Gemini is processing your voice...
        </p>
      )}

      {/* ERROR */}

      {error && (
        <div className="w-full max-w-lg px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-center text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;