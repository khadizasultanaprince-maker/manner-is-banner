// src/components/VoiceInputButton.tsx
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Globe, Sparkles, Check, AlertCircle, HelpCircle, Info } from "lucide-react";

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  currentValue?: string;
  className?: string;
  compact?: boolean;
  buttonText?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  currentValue = "",
  className = "",
  compact = false,
  buttonText = "ভয়েসে বলুন"
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lang, setLang] = useState<"bn-BD" | "en-US">("bn-BD");
  const [interimText, setInterimText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [showCommandsTooltip, setShowCommandsTooltip] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMsg("");
    setInterimText("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("আপনার ব্রাউজারে স্পিচ রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে গুগল ক্রোম ব্যবহার করুন।");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript.trim()) {
          const updated = currentValue
            ? `${currentValue.trim()} ${finalTranscript.trim()}`
            : finalTranscript.trim();
          onTranscript(updated);
          setInterimText("");
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। ব্রাউজারের অ্যাড্রেস বারের লক আইকনে ক্লিক করে মাইক্রোফোন Allow করুন।");
        } else if (event.error === "no-speech") {
          // Keep waiting for speech
        } else {
          setErrorMsg(`ভয়েস রিকগনিশন সমস্যা: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition startup error:", e);
      setErrorMsg("ভয়েস ইনপুট চালু করা যায়নি।");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimText("");
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Listening status indicator / button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`inline-flex items-center gap-1.5 rounded-lg transition-all font-bold cursor-pointer select-none active:scale-95 ${
          compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        } ${
          isListening
            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40 ring-2 ring-rose-400 animate-pulse"
            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        }`}
        title={isListening ? "ভয়েস রেকর্ডিং বন্ধ করুন" : "মাইক্রোফোনে কথা বলে লিখুন"}
      >
        {isListening ? (
          <>
            <Mic className="w-3.5 h-3.5 text-amber-300 animate-ping" />
            <span>শুনছি... (থামুন)</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-emerald-300" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Language Switcher */}
      <button
        type="button"
        onClick={() => setLang(lang === "bn-BD" ? "en-US" : "bn-BD")}
        className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-300 transition"
        title="ভাষা পরিবর্তন (বাংলা / English)"
      >
        {lang === "bn-BD" ? "🇧🇩 বাংলা" : "🇺🇸 Eng"}
      </button>

      {/* Info / Tooltip Icon for Common Voice Commands */}
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setShowCommandsTooltip(!showCommandsTooltip)}
          onMouseEnter={() => setShowCommandsTooltip(true)}
          onMouseLeave={() => setShowCommandsTooltip(false)}
          className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition cursor-pointer"
          title="প্রচলিত ভয়েস কমান্ডের নমুনা ও ব্যবহার নির্দেশিকা"
          aria-label="Voice Command Guidelines"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
        </button>

        {/* Floating Tooltip Box */}
        {showCommandsTooltip && (
          <div
            onMouseEnter={() => setShowCommandsTooltip(true)}
            onMouseLeave={() => setShowCommandsTooltip(false)}
            className="absolute right-0 bottom-full mb-2 z-[100] w-64 p-3 bg-slate-950 text-white text-xs rounded-xl shadow-2xl border-2 border-indigo-400 font-sans animate-fadeIn space-y-2"
          >
            <div className="flex items-center justify-between border-b border-indigo-500/40 pb-1.5">
              <span className="font-black text-amber-300 text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>প্রচলিত ভয়েস কমান্ড ও নমুনা</span>
              </span>
              <span className="text-[9px] bg-indigo-900 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
                টিপস
              </span>
            </div>

            <p className="text-[10px] text-slate-300 leading-normal">
              মাইক্রোফোন অন করে আপনি সরাসরি মুখে বলতে পারেন:
            </p>

            <div className="space-y-1.5 text-[11px]">
              <div
                onClick={() => {
                  const phrase = "আজকের লক্ষ্য: ৫ ওয়াক্ত নামাজ জামাতে পড়া ও গণিত অধ্যায় ৩ সমাধান করা।";
                  onTranscript(currentValue ? `${currentValue.trim()} ${phrase}` : phrase);
                  setShowCommandsTooltip(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-900/60 border border-slate-800 hover:border-indigo-400 transition cursor-pointer"
              >
                <span className="font-black text-emerald-400 block">• 'আজকের লক্ষ্য'</span>
                <span className="text-[10px] text-slate-300 italic">
                  "আজকের লক্ষ্য: ৫ ওয়াক্ত নামাজ জামাতে পড়া..."
                </span>
              </div>

              <div
                onClick={() => {
                  const phrase = "আমার ডায়েরি: আজ স্কুল ছুটির পর সুন্দর হস্তাক্ষরে ২ পৃষ্ঠা লিখেছি ও মা-বাবাকে কাজে সাহায্য করেছি।";
                  onTranscript(currentValue ? `${currentValue.trim()} ${phrase}` : phrase);
                  setShowCommandsTooltip(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-900/60 border border-slate-800 hover:border-indigo-400 transition cursor-pointer"
              >
                <span className="font-black text-amber-400 block">• 'আমার ডায়েরি'</span>
                <span className="text-[10px] text-slate-300 italic">
                  "আমার ডায়েরি: আজ হস্তাক্ষর ২ পৃষ্ঠা লিখেছি..."
                </span>
              </div>

              <div
                onClick={() => {
                  const phrase = "রিফ্লেকশন: আজ কারো সাথে রাগ করিনি, সত্য কথা বলেছি এবং সন্ধ্যায় একাগ্রচিত্তে পড়া সম্পন্ন করেছি।";
                  onTranscript(currentValue ? `${currentValue.trim()} ${phrase}` : phrase);
                  setShowCommandsTooltip(false);
                }}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-900/60 border border-slate-800 hover:border-indigo-400 transition cursor-pointer"
              >
                <span className="font-black text-purple-400 block">• 'রিফ্লেকশন'</span>
                <span className="text-[10px] text-slate-300 italic">
                  "রিফ্লেকশন: আজ কারো সাথে রাগ করিনি..."
                </span>
              </div>
            </div>

            <div className="text-[9.5px] text-slate-400 pt-1 border-t border-slate-800">
              💡 <em>(ক্লিক করে কমান্ড যোগ করতে পারেন অথবা মুখে বলুন)</em>
            </div>
          </div>
        )}
      </div>

      {/* Live Interim Transcript Bubble */}
      {isListening && interimText && (
        <div className="absolute left-0 bottom-full mb-1.5 z-50 bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-xl border border-indigo-400 min-w-[200px] max-w-[280px] pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-1 text-[9px] text-amber-300 font-bold mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>ভয়েস ধরা পড়ছে:</span>
          </div>
          <p className="italic text-slate-200 font-sans leading-tight">
            "{interimText}..."
          </p>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMsg && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-rose-950 border border-rose-500 text-white text-[11px] p-2 rounded-lg shadow-xl max-w-[280px] animate-fadeIn">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-tight text-[10px]">
              {errorMsg}
              <button
                type="button"
                onClick={() => setErrorMsg("")}
                className="text-amber-300 font-bold ml-1.5 underline"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
