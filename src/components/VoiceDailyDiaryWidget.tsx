// src/components/VoiceDailyDiaryWidget.tsx
import React, { useState } from "react";
import { Mic, MicOff, Sparkles, Volume2, Save, CheckCircle2, Heart, Award, Trash2, Calendar } from "lucide-react";
import { VoiceInputButton } from "./VoiceInputButton";

interface VoiceDailyDiaryWidgetProps {
  currentStudentName: string;
  onSaveDiaryText?: (date: number, text: string) => void;
  targetDay?: number;
  initialText?: string;
}

const QUICK_VOICE_TEMPLATES = [
  "আজকে আমি ৫ ওয়াক্ত নামাজ সময়মতো আদায় করেছি।",
  "সকালের গণিত ও ইংরেজি পড়া নিখুঁতভাবে শেষ করেছি।",
  "স্কুল ছুটির পর সুন্দর ও স্পষ্ট অক্ষরে ২ পৃষ্ঠা হাতের লেখা লিখেছি।",
  "মা-বাবাকে কাজে সাহায্য করেছি এবং বড়দের সালাম দিয়েছি।",
  "সন্ধ্যায় মোবাইল গেম পরিহার করে ২ ঘণ্টা একাগ্রচিত্তে পড়াশোনা করেছি।",
  "প্রতিদিনের ভুল অভ্যাস দূর করে ভালো মানুষ হওয়ার প্রতিজ্ঞা পালন করেছি।"
];

export const VoiceDailyDiaryWidget: React.FC<VoiceDailyDiaryWidgetProps> = ({
  currentStudentName,
  onSaveDiaryText,
  targetDay = new Date().getDate(),
  initialText = ""
}) => {
  const [diaryText, setDiaryText] = useState<string>(initialText);
  const [selectedDay, setSelectedDay] = useState<number>(targetDay);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleAppendTemplate = (phrase: string) => {
    const updated = diaryText ? `${diaryText.trim()} ${phrase}` : phrase;
    setDiaryText(updated);
    if (onSaveDiaryText) onSaveDiaryText(selectedDay, updated);
  };

  const handleSave = () => {
    if (onSaveDiaryText) {
      onSaveDiaryText(selectedDay, diaryText);
    }
    // Also save to student's voice diary history
    try {
      const savedHist = JSON.parse(localStorage.getItem(`student_voice_diary_${currentStudentName}`) || "[]");
      savedHist.unshift({
        id: "diary-" + Date.now(),
        date: selectedDay,
        text: diaryText,
        savedAt: new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
      });
      localStorage.setItem(`student_voice_diary_${currentStudentName}`, JSON.stringify(savedHist.slice(0, 31)));
    } catch {}

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-400/40 rounded-3xl p-5 text-white shadow-xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Mic className="w-5 h-5 animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                প্রতিদিনের ভয়েস ডায়েরি ও প্রতিফলন (Voice Diary & Speech Input)
              </h3>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                মুখে বলুন • স্বয়ংক্রিয় টাইপ
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              টাইপ না করে সরাসরি মাইক্রোফোনে কথা বললে বাংলা ভাষায় নিখুঁতভাবে লেখা হয়ে যাবে
            </p>
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold">তারিখ:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-amber-300 font-bold rounded-lg px-2.5 py-1 text-xs outline-none"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d} তারিখ
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Textarea with Voice Button Integrated */}
      <div className="relative">
        <textarea
          rows={3}
          value={diaryText}
          onChange={(e) => setDiaryText(e.target.value)}
          placeholder="মাইক্রোফোন বাটনে চাপ দিয়ে কথা বলুন (যেমন: 'আজকে আমি সকালের পড়া শেষ করেছি এবং মা-বাবাকে কাজে সাহায্য করেছি...')"
          className="w-full bg-slate-950/80 border border-indigo-400/40 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 leading-relaxed font-sans pr-36"
        />

        {/* Floating Voice Button inside textarea */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <VoiceInputButton
            onTranscript={(text) => setDiaryText(text)}
            currentValue={diaryText}
            buttonText="মাইকে বলুন 🎙️"
          />
        </div>
      </div>

      {/* Quick Bengali Phrases Chips */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>১-ক্লিকে দ্রুত যোগ করার প্রচলিত অনুভূতিমালা:</span>
          </span>
          {diaryText && (
            <button
              onClick={() => setDiaryText("")}
              className="text-[11px] text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>মুছে ফেলুন</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_VOICE_TEMPLATES.map((phrase, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAppendTemplate(phrase)}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-900/60 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-[11px] font-medium transition cursor-pointer active:scale-95 text-left"
            >
              + {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20 text-xs">
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>ক্রোম ও আধুনিক সব ব্রাউজারে বাংলা ভয়েস সরাসরি টাইপ হবে</span>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>ডায়েরিতে সংরক্ষিত হয়েছে!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-emerald-200" />
              <span>{selectedDay} তারিখের ডায়েরিতে সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
