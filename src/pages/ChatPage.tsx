import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { ChatMessage } from '../types.js';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  Square,
  X
} from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const ChatPage: React.FC = () => {
  const { language, localeCode, t } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedPromptsByLanguage: Record<string, string[]> = {
    en: [
      'What did I write recently?',
      'Why did my mood change?',
      'What patterns do you see in my journals?',
      'How can I improve my routine?'
    ],
    ta: [
      'சமீபத்தில் நான் என்ன எழுதினேன்?',
      'என் மனநிலை ஏன் மாறியது?',
      'என் ஜர்னலில் என்ன மாதிரி போக்குகள் உள்ளன?',
      'என் தினசரி முறையை எப்படி மேம்படுத்தலாம்?'
    ],
    hi: [
      'मैंने हाल में क्या लिखा?',
      'मेरा मूड क्यों बदला?',
      'मेरी डायरी में कौन से पैटर्न हैं?',
      'मैं अपनी दिनचर्या कैसे बेहतर कर सकता हूँ?'
    ],
    te: [
      'నేను ఇటీవల ఏమి రాశాను?',
      'నా మూడ్ ఎందుకు మారింది?',
      'నా జర్నల్స్‌లో ఏ నమూనాలు ఉన్నాయి?',
      'నా రోజువారీ అలవాటును ఎలా మెరుగుపరుచుకోవాలి?'
    ],
    kn: [
      'ನಾನು ಇತ್ತೀಚೆಗೆ ಏನು ಬರೆದಿದ್ದೇನೆ?',
      'ನನ್ನ ಮನಸ್ಥಿತಿ ಏಕೆ ಬದಲಾಗಿದೆ?',
      'ನನ್ನ ಜರ್ನಲ್‌ನಲ್ಲಿ ಯಾವ ಮಾದರಿಗಳು ಕಾಣುತ್ತವೆ?',
      'ನನ್ನ ದಿನಚರಿಯನ್ನು ಹೇಗೆ ಉತ್ತಮಗೊಳಿಸಬಹುದು?'
    ],
    ur: [
      'میں نے حال میں کیا لکھا؟',
      'میرا موڈ کیوں بدلا؟',
      'میری ڈائری میں کون سے رجحانات ہیں؟',
      'میں اپنی روزمرہ روٹین کیسے بہتر کر سکتا ہوں؟'
    ],
    ml: [
      'ഞാൻ അടുത്തിടെ എന്താണ് എഴുതിയത്?',
      'എന്റെ മൂഡ് എന്തുകൊണ്ട് മാറി?',
      'എന്റെ ജേർണലിൽ എന്ത് പാറ്റേണുകൾ കാണുന്നു?',
      'എന്റെ ദിനചര്യ എങ്ങനെ മെച്ചപ്പെടുത്താം?'
    ],
    tanglish: [
      'Recent-a naan enna ezhuthinen?',
      'En mood yen change aachu?',
      'En journal-la enna patterns irukku?',
      'En routine-a eppadi improve pannalaam?'
    ]
  };

  const suggestedPrompts =
    suggestedPromptsByLanguage[language] ||
    suggestedPromptsByLanguage.en;

  const chatErrorByLanguage: Record<string, string> = {
    en: 'I could not process that question. Please try again.',
    ta: 'அந்த கேள்வியை செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    hi: 'मैं उस सवाल को संसाधित नहीं कर पाया। कृपया फिर से प्रयास करें।',
    te: 'ఆ ప్రశ్నను ప్రాసెస్ చేయలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.',
    kn: 'ಆ ಪ್ರಶ್ನೆಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    ur: 'میں اس سوال پر کارروائی نہیں کر سکا۔ براہ کرم دوبارہ کوشش کریں۔',
    ml: 'ആ ചോദ്യം പ്രോസസ്സ് ചെയ്യാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    tanglish: 'Andha question-a process panna mudiyala. Please try again.'
  };

  const clearedWelcomeByLanguage: Record<string, string> = {
    en: 'Chat history cleared. What would you like to talk about?',
    ta: 'சாட் வரலாறு அழிக்கப்பட்டது. இப்போது எதைப் பற்றி பேச விரும்புகிறீர்கள்?',
    hi: 'चैट इतिहास साफ कर दिया गया है। अब आप किस बारे में बात करना चाहते हैं?',
    te: 'చాట్ చరిత్ర తొలగించబడింది. ఇప్పుడు మీరు ఏ విషయం గురించి మాట్లాడాలనుకుంటున్నారు?',
    kn: 'ಚಾಟ್ ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ಈಗ ನೀವು ಯಾವುದರ ಬಗ್ಗೆ ಮಾತನಾಡಲು ಬಯಸುತ್ತೀರಿ?',
    ur: 'چیٹ کی تاریخ صاف کر دی گئی ہے۔ اب آپ کس بارے میں بات کرنا چاہتے ہیں؟',
    ml: 'ചാറ്റ് ചരിത്രം മായ്ച്ചു. ഇപ്പോൾ എന്തിനെക്കുറിച്ചാണ് സംസാരിക്കാൻ ആഗ്രഹിക്കുന്നത്?',
    tanglish: 'Chat history clear aayiduchu. Ippo enna pathi pesa virumbureenga?'
  };

  useEffect(() => {
    loadChatHistory();

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors.
        }
      }
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    try {
      const res = await api.getChatHistory();

      if (res.messages.length === 0) {
        const welcome =
          language === 'ta'
            ? 'வணக்கம்! நான் உங்கள் Mood Journal AI பிரதிபலிப்பு உதவியாளர். உங்கள் சமீபத்திய குறிப்புகளை வைத்து உங்களுடன் பேசத் தயாராக இருக்கிறேன். இப்போது எப்படி உணர்கிறீர்கள்?'
            : language === 'hi'
              ? 'नमस्ते! मैं आपका Mood Journal AI चिंतन सहायक हूँ। आपकी हाल की डायरी के आधार पर बात करने के लिए तैयार हूँ। अभी आप कैसा महसूस कर रहे हैं?'
              : language === 'te'
                ? 'నమస్తే! నేను మీ Mood Journal AI ప్రతిబింబ సహాయకుడిని. మీ తాజా జర్నల్ ఆధారంగా మీతో మాట్లాడటానికి సిద్ధంగా ఉన్నాను. ఇప్పుడు మీరు ఎలా అనుభవిస్తున్నారు?'
                : language === 'kn'
                  ? 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ Mood Journal AI ಚಿಂತನಾ ಸಹಾಯಕ. ನಿಮ್ಮ ಇತ್ತೀಚಿನ ದಿನಚರಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು ಮಾತನಾಡಲು ಸಿದ್ಧನಿದ್ದೇನೆ. ಈಗ ನೀವು ಹೇಗಿದ್ದೀರಿ?'
                  : language === 'ur'
                    ? 'السلام علیکم! میں آپ کا Mood Journal AI معاون ہوں۔ آپ کی حالیہ ڈائری کو سمجھتے ہوئے بات کرنے کے لیے تیار ہوں۔ ابھی آپ کیسا محسوس کر رہے ہیں؟'
                    : language === 'tanglish'
                      ? 'Hi! Naan unga Mood Journal AI reflection assistant. Unga recent journals-a base panni pesi help panna ready-a irukken. Ippo epdi feel panreenga?'
                      : 'Hello! I am your personal Mood Journal AI reflection companion. I am aware of your recent journal reflections and ready to help you unpack your thoughts. How are you feeling right now?';

        setMessages([
          {
            id: 'init_welcome',
            role: 'model',
            text: welcome,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();

    if (!text || isLoading) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore.
      }
    }

    setIsRecording(false);
    setLiveTranscript('');
    setVoiceError('');
    setInputText('');

    const tempUserMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, language);

      const tempBotMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        text: res.reply,
        createdAt: res.createdAt
      };

      setMessages((prev) => [...prev, tempBotMsg]);
    } catch (err) {
      console.error('Chat error:', err);

      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'model',
          text:
            chatErrorByLanguage[language] ||
            chatErrorByLanguage.en,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore.
        }
      }

      setIsRecording(false);
      setLiveTranscript('');
      setVoiceError('');

      await api.clearChatHistory();

      setMessages([
        {
          id: 'cleared_welcome',
          role: 'model',
          text:
            clearedWelcomeByLanguage[language] ||
            clearedWelcomeByLanguage.en,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        'Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // Ignore.
      }

      setIsRecording(false);
      return;
    }

    setVoiceError('');
    setLiveTranscript('');

    const recognition = new SpeechRecognition();

    recognition.lang = localeCode;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setVoiceError('');
      setLiveTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0]?.transcript || '';

        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      const combinedLiveText = (
        finalText || interimText
      ).trim();

      if (combinedLiveText) {
        setLiveTranscript(combinedLiveText);
      }

      if (finalText.trim()) {
        setInputText((previous) => {
          const previousText = previous.trim();

          if (!previousText) {
            return finalText.trim();
          }

          return `${previousText} ${finalText.trim()}`;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error(
        'Speech recognition error:',
        event?.error
      );

      setIsRecording(false);

      switch (event?.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setVoiceError(
            'Microphone permission was denied. Please allow microphone access in your browser settings.'
          );
          break;

        case 'no-speech':
          setVoiceError(
            'No speech was detected. Please try speaking again.'
          );
          break;

        case 'audio-capture':
          setVoiceError(
            'No microphone was found. Please check your microphone.'
          );
          break;

        case 'network':
          setVoiceError(
            'Speech recognition needs a network connection. Please try again.'
          );
          break;

        default:
          setVoiceError(
            'Voice recognition could not start. Please try again.'
          );
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        'Could not start speech recognition:',
        error
      );

      setIsRecording(false);
      setVoiceError(
        'Could not start the microphone. Please try again.'
      );
      recognitionRef.current = null;
    }
  };

  const clearLiveTranscript = () => {
    setLiveTranscript('');
    setVoiceError('');
  };

  const handlePlayVoice = (
    id: string,
    text: string
  ) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    if (playingMsgId === id) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = localeCode;
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setPlayingMsgId(id);
    };

    utterance.onend = () => {
      setPlayingMsgId(null);
    };

    utterance.onerror = () => {
      setPlayingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.chatbot.title}</span>

              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.chatbot.subtitle} •{' '}
              {language === 'ta'
                ? 'உங்கள் சமீபத்திய ஜர்னல் பதிவுகளை அடிப்படையாகக் கொண்டது'
                : language === 'hi'
                  ? 'आपकी हाल की डायरी पर आधारित'
                  : language === 'te'
                    ? 'మీ తాజా జర్నల్ ఆధారంగా'
                    : language === 'kn'
                      ? 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಜರ್ನಲ್ ಆಧಾರಿತ'
                      : language === 'ur'
                        ? 'آپ کی حالیہ ڈائری پر مبنی'
                        : language === 'ml'
                          ? 'നിങ്ങളുടെ സമീപകാല ജേർണലിനെ അടിസ്ഥാനമാക്കി'
                          : language === 'tanglish'
                            ? 'Unga recent journal base panni'
                            : 'Based on your recent journal insights'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-semibold flex items-center gap-1.5"
          title={t.chatbot.clearChat}
        >
          <Trash2 className="w-4 h-4" />

          <span className="hidden sm:inline">
            {t.chatbot.clearChat}
          </span>
        </button>
      </div>

      {/* SUGGESTIONS */}

      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-2 text-xs">

        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />

          {language === 'ta'
            ? 'பரிந்துரைகள்:'
            : language === 'hi'
              ? 'सुझाव:'
              : language === 'te'
                ? 'సూచనలు:'
                : language === 'kn'
                  ? 'ಸಲಹೆಗಳು:'
                  : language === 'ur'
                    ? 'تجاویز:'
                    : language === 'ml'
                      ? 'നിർദ്ദേശങ്ങൾ:'
                      : language === 'tanglish'
                        ? 'Suggestions:'
                        : 'Suggestions:'}
        </span>

        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap transition-all shadow-2xs disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isUser
                  ? 'flex-row-reverse'
                  : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {isUser ? (
                  <UserIcon className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text}
                </p>

                {!isUser &&
                  'speechSynthesis' in window && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">

                      <button
                        onClick={() =>
                          handlePlayVoice(
                            msg.id,
                            msg.text
                          )
                        }
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {playingMsgId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            {t.journal.stopAudio}
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            {t.journal.listenAudio}
                          </>
                        )}
                      </button>

                      <span className="text-[10px] opacity-60">
                        {new Date(
                          msg.createdAt
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          );
        })}

        {/* GEMINI THINKING INDICATOR */}

        {isLoading && (
          <div className="flex items-start gap-3">

            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />

              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">
                {t.chatbot.typing}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* LIVE VOICE TRANSCRIPTION */}

      {(isRecording ||
        liveTranscript ||
        voiceError) && (
        <div className="px-3 sm:px-4 pb-2">

          <div
            className={`rounded-2xl border p-4 ${
              voiceError
                ? 'border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20'
                : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20'
            }`}
          >

            <div className="flex items-center justify-between gap-3 mb-2">

              <div className="flex items-center gap-2">

                {isRecording ? (
                  <>
                    <div className="relative">
                      <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

                      <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-40" />
                    </div>

                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {language === 'ta'
                        ? 'கேட்கிறது...'
                        : language === 'hi'
                          ? 'सुन रहा है...'
                          : language === 'te'
                            ? 'వింటోంది...'
                            : language === 'kn'
                              ? 'ಕೇಳುತ್ತಿದೆ...'
                              : language === 'ml'
                                ? 'കേൾക്കുന്നു...'
                                : language === 'ur'
                                  ? 'سن رہا ہے...'
                                  : language === 'tanglish'
                                    ? 'Listening...'
                                    : 'Listening...'}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {language === 'ta'
                      ? 'உங்கள் குரல் உரையாக மாற்றப்பட்டது'
                      : language === 'hi'
                        ? 'आपकी आवाज़ को टेक्स्ट में बदला गया'
                        : language === 'te'
                          ? 'మీ వాయిస్ టెక్స్ట్‌గా మార్చబడింది'
                          : language === 'kn'
                            ? 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗಿದೆ'
                            : language === 'ml'
                              ? 'നിങ്ങളുടെ ശബ്ദം ടെക്സ്റ്റാക്കി'
                              : language === 'ur'
                                ? 'آپ کی آواز کو متن میں تبدیل کر دیا گیا'
                                : language === 'tanglish'
                                  ? 'Unga voice text-a convert aayiduchu'
                                  : 'Voice transcription'}
                  </span>
                )}
              </div>

              {liveTranscript && (
                <button
                  type="button"
                  onClick={clearLiveTranscript}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="Clear transcription"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {liveTranscript ? (
              <div className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                <span className="font-medium">
                  {liveTranscript}
                </span>

                {isRecording && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
                )}
              </div>
            ) : isRecording ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ta'
                  ? 'இப்போது பேசுங்கள்... நீங்கள் பேசும் வார்த்தைகள் இங்கே தோன்றும்.'
                  : language === 'hi'
                    ? 'अब बोलें... आपके शब्द यहाँ दिखाई देंगे।'
                    : language === 'te'
                      ? 'ఇప్పుడు మాట్లాడండి... మీరు చెప్పే మాటలు ఇక్కడ కనిపిస్తాయి.'
                      : language === 'kn'
                        ? 'ಈಗ ಮಾತನಾಡಿ... ನೀವು ಹೇಳುವ ಪದಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.'
                        : language === 'ml'
                          ? 'ഇപ്പോൾ സംസാരിക്കൂ... നിങ്ങൾ പറയുന്ന വാക്കുകൾ ഇവിടെ കാണിക്കും.'
                          : language === 'ur'
                            ? 'اب بولیں... آپ کے الفاظ یہاں دکھائی دیں گے۔'
                            : language === 'tanglish'
                              ? 'Ippo pesunga... neenga pesura words inga live-a varum.'
                              : 'Start speaking... your words will appear here live.'}
              </p>
            ) : null}

            {voiceError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
                {voiceError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* INPUT BAR */}

      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >

          {/* VOICE BUTTON */}

          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={`p-2.5 rounded-xl border transition-all ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            } disabled:opacity-50`}
            title={
              isRecording
                ? 'Stop recording'
                : 'Voice input'
            }
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* TEXT INPUT */}

          <input
            type="text"
            value={inputText}
            onChange={(e) =>
              setInputText(e.target.value)
            }
            placeholder={
              isRecording
                ? t.chatbot.listening
                : t.chatbot.inputPlaceholder
            }
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />

          {/* SEND */}

          <button
            type="submit"
            disabled={
              !inputText.trim() ||
              isLoading
            }
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold shadow-sm transition-all"
            title={t.chatbot.send}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-2">
          Mood Journal AI is for self-reflection and general wellness only. Not a medical service.
        </p>
      </div>
    </div>
  );
};