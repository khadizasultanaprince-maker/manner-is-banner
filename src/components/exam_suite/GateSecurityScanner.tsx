// src/components/exam_suite/GateSecurityScanner.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Scan,
  CheckCircle2,
  AlertCircle,
  Bell,
  Smartphone,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle,
  UserCheck,
  Search,
  Volume2,
  Trash2,
  Send,
  Zap,
  Radio,
  Settings,
  Camera,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Sparkles,
  Heart,
  VolumeX,
  Play,
  Sliders,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { GateLog, StudentSecurityProfile } from "./examTypes";
import { SAMPLE_GATE_LOGS, SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { GateSMSConfigPanel, DEFAULT_GATE_SMS_CONFIG, GateSMSConfig } from "./GateSMSConfigPanel";

export const GateSecurityScanner: React.FC = () => {
  const [logs, setLogs] = useState<GateLog[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_gate_logs");
      return saved ? JSON.parse(saved) : SAMPLE_GATE_LOGS;
    } catch {
      return SAMPLE_GATE_LOGS;
    }
  });

  const [scanMode, setScanMode] = useState<"in" | "out">("in");
  const [activeSubView, setActiveSubView] = useState<"live_scanner" | "sms_setup">("live_scanner");
  const [scannedInput, setScannedInput] = useState<string>("");
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    studentName: string;
    indexNumber?: string;
    message: string;
    type: "in" | "out";
    time: string;
  } | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);

  // Private Secure Gatekeeper Terminal Authentication State
  const [isGatekeeperUnlocked, setIsGatekeeperUnlocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [gatekeeperName, setGatekeeperName] = useState<string>("প্রধান ফটক ডিউটি অফিসার (মোঃ রফিকুল ইসলাম)");
  const GATEKEEPER_PIN = "1234";

  // Phone Camera Scanner State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Sweet Voice Speech Synthesis helper
  const speakSweetVoice = (studentName: string, type: "in" | "out", timeStr: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();

      let speechText = "";
      if (type === "in") {
        speechText = `আসসালামু আলাইকুম সম্মানিত অভিভাবক। আলহামদুলিল্লাহ! আপনার প্রিয় সন্তান ${studentName} এইমাত্র সকাল ${timeStr} এ নিরাপদে ডি-লিকন মডেল একাডেমী ক্যাম্পাসে প্রবেশ করেছে। আপনার সন্তানের মঙ্গলময় ভবিষ্যৎ কামনা করছি।`;
      } else {
        speechText = `সম্মানিত অভিভাবক, আপনার প্রিয় সন্তান ${studentName} সফলভাবে আজকের পাঠদান সম্পন্ন করে বিকাল ${timeStr} এ ক্যাম্পাস ত্যাগ করেছে। নিরাপদে বাড়ি পৌঁছানোর জন্য শুভকামনা।`;
      }

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "bn-BD";
      utterance.pitch = 1.15; // Sweet, gentle tone
      utterance.rate = 0.92; // Polite, clear pace

      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.includes("bn") || v.lang.includes("Bengali"));
      if (bnVoice) utterance.voice = bnVoice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Play audio beep tone on scan
  const playBeep = (type: "in" | "out") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "in" ? 880 : 660, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio playback not allowed:", e);
    }
  };

  // Camera start / stop functions
  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("আপনার ব্রাউজারে ক্যামেরা ব্যবহারের সুবিধা সমর্থিত নয়।");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);

      // Start automatic barcode/QR detection if BarcodeDetector is supported
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39", "ean_13"]
        });

        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedValue = barcodes[0].rawValue;
                if (detectedValue) {
                  handleProcessScan(detectedValue);
                }
              }
            } catch (err) {
              // Ignore frame detection misses
            }
          }
        }, 600);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("ক্যামেরা অন করা সম্ভব হয়নি। ক্যামেরা পারমিশন এলাউ আছে কিনা পরীক্ষা করুন।");
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Process Gate Scan
  const handleProcessScan = async (studentIdToScan: string, forcedType?: "in" | "out") => {
    const typeToUse = forcedType || scanMode;
    let cleanId = studentIdToScan.trim();
    if (!cleanId) return;

    // Check if cleanId is a JSON QR code string
    try {
      if (cleanId.startsWith("{") && cleanId.includes("id")) {
        const parsed = JSON.parse(cleanId);
        cleanId = parsed.indexNo || parsed.id || cleanId;
      }
    } catch {}

    // Load registered profiles from localStorage if any
    let allProfiles = SAMPLE_SECURITY_PROFILES;
    try {
      const savedProfiles = localStorage.getItem("dlikon_student_security_profiles");
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed) && parsed.length > 0) allProfiles = parsed;
      }
    } catch {}

    // Find student in security profiles by ID, roll, or indexNumber
    let student = allProfiles.find(
      s =>
        s.studentId.toLowerCase() === cleanId.toLowerCase() ||
        s.roll === cleanId ||
        (s.indexNumber && s.indexNumber.toLowerCase() === cleanId.toLowerCase())
    );

    if (!student) {
      student = {
        studentId: cleanId,
        indexNumber: cleanId,
        name: `শিক্ষার্থী (${cleanId})`,
        className: "পঞ্চম শ্রেণি",
        roll: cleanId,
        bloodGroup: "A+",
        guardianName: "অভিভাবক",
        guardianPhone: "01711-000000",
        emergencyContact: "01819-000000",
        address: "ডি-লিকন ক্যাম্পাস",
        cardExpiry: "২০২৬"
      };
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
    const dateFormatted = now.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    const timestampStr = `${dateFormatted} ${timeFormatted}`;

    // Load custom SMS config templates
    let customConfig: GateSMSConfig = DEFAULT_GATE_SMS_CONFIG;
    try {
      const savedCfg = localStorage.getItem("dlikon_gate_sms_config");
      if (savedCfg) customConfig = { ...DEFAULT_GATE_SMS_CONFIG, ...JSON.parse(savedCfg) };
    } catch {}

    let notifMsg = "";
    if (typeToUse === "in") {
      notifMsg = (customConfig.entryTemplate || DEFAULT_GATE_SMS_CONFIG.entryTemplate)
        .replace(/{শিক্ষার্থীর_নাম}/g, student.name)
        .replace(/{শ্রেণি}/g, student.className)
        .replace(/{রোল}/g, student.roll)
        .replace(/{সময়}/g, timeFormatted)
        .replace(/{তারিখ}/g, dateFormatted)
        .replace(/{প্রতিষ্ঠানের_নাম}/g, "ডি-লিকন মডেল একাডেমী");
    } else {
      notifMsg = (customConfig.exitTemplate || DEFAULT_GATE_SMS_CONFIG.exitTemplate)
        .replace(/{শিক্ষার্থীর_নাম}/g, student.name)
        .replace(/{শ্রেণি}/g, student.className)
        .replace(/{রোল}/g, student.roll)
        .replace(/{সময়}/g, timeFormatted)
        .replace(/{তারিখ}/g, dateFormatted)
        .replace(/{প্রতিষ্ঠানের_নাম}/g, "ডি-লিকন মডেল একাডেমী");
    }

    const newLog: GateLog = {
      id: "gate-" + Date.now(),
      studentId: student.studentId,
      indexNumber: student.indexNumber,
      studentName: student.name,
      className: student.className,
      roll: student.roll,
      type: typeToUse,
      timestamp: timestampStr,
      timeOnly: timeFormatted,
      dateOnly: dateFormatted,
      guardianPhone: student.guardianPhone,
      notificationMessage: notifMsg,
      status: "delivered",
      guardianAcknowledged: false,
      voiceSpoken: true
    };

    // Update Gate Logs
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("dlikon_gate_logs", JSON.stringify(updatedLogs));

    // PUSH NOTIFICATION TO STUDENT DASHBOARD IN LOCALSTORAGE & FIRESTORE
    try {
      const studentNotifKey = `student_gate_notifs_${student.studentId}`;
      const existingNotifs = JSON.parse(localStorage.getItem(studentNotifKey) || "[]");
      existingNotifs.unshift({
        id: newLog.id,
        title: typeToUse === "in" ? "স্কুলে আগমন নিশ্চিতকরণ" : "স্কুল থেকে প্রস্থান বার্তা",
        message: notifMsg,
        time: timeFormatted,
        date: dateFormatted,
        type: typeToUse,
        guardianAcknowledged: false
      });
      localStorage.setItem(studentNotifKey, JSON.stringify(existingNotifs));

      // Persist to Firestore
      try {
        await addDoc(collection(db, "gate_security_logs"), {
          ...newLog,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore sync fallback to localStorage:", err);
      }
    } catch (e) {
      console.error("Storage error:", e);
    }

    playBeep(typeToUse);

    // Speak sweet voice notification
    speakSweetVoice(student.name, typeToUse, timeFormatted);

    setLastScannedResult({
      success: true,
      studentName: student.name,
      indexNumber: student.indexNumber,
      message: notifMsg,
      type: typeToUse,
      time: timeFormatted
    });

    setScannedInput("");
  };

  const handleClearLogs = () => {
    if (confirm("আপনি কি সমস্ত গেট স্ক্যানিং লগ রেকর্ড খালি করতে চান?")) {
      setLogs([]);
      localStorage.removeItem("dlikon_gate_logs");
    }
  };

  const handleGatekeeperUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === GATEKEEPER_PIN) {
      setIsGatekeeperUnlocked(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("❌ ভুল সিকিউর পিন! ডিফল্ট পিন ১২৩৪ (1234) দিয়ে চেষ্টা করুন।");
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROLLER HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  ডিজিটাল গেট স্ক্যানার ও রিয়েল-টাইম অভিভাবক মেসেজিং
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-ping text-emerald-400" />
                  Live Gate Cloud Sync
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  মিষ্টি মধুর ভয়েস নোটিফিকেশন
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                স্মার্টফোনের ক্যামেরা ও কার্ড রিডারের মাধ্যমে গেট স্ক্যানিং ও অভিভাবকের ফোনে তাৎক্ষণিক স্বয়ংক্রিয় মিষ্টি কণ্ঠের বার্তা
              </p>
            </div>
          </div>

          {/* View Switcher, Sound & Gatekeeper status */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveSubView("live_scanner")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeSubView === "live_scanner"
                    ? "bg-emerald-600 text-white shadow font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📷 লাইভ স্ক্যানার ও লগ
              </button>
              <button
                type="button"
                onClick={() => setActiveSubView("sms_setup")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSubView === "sms_setup"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>⚙️ এসএমএস কনফিগারেশন</span>
              </button>
            </div>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                voiceEnabled
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                  : "bg-slate-800 text-slate-500 border border-slate-700"
              }`}
              title="মিষ্টি মধুর কণ্ঠে বাংলা ভয়েস নোটিফিকেশন চালু/বন্ধ করুন"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-purple-300" /> : <VolumeX className="w-4 h-4" />}
              <span>ভয়েস: {voiceEnabled ? "চালু" : "বন্ধ"}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                soundEnabled
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                  : "bg-slate-800 text-slate-500 border border-slate-700"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>বিপ: {soundEnabled ? "চালু" : "বন্ধ"}</span>
            </button>

            {/* Lock/Unlock Gatekeeper Terminal */}
            <button
              onClick={() => setIsGatekeeperUnlocked(!isGatekeeperUnlocked)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                isGatekeeperUnlocked
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                  : "bg-amber-500 text-slate-950 border-amber-400 font-black"
              }`}
              title="গেটকিপার নিরাপদ একাউন্ট লক বা আনলক করুন"
            >
              {isGatekeeperUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isGatekeeperUnlocked ? "টার্মিনাল আনলকড" : "লগইন করুন"}</span>
            </button>
          </div>
        </div>

        {/* Live Scanner controls (Only visible when activeSubView === 'live_scanner') */}
        {activeSubView === "live_scanner" && (
          <>
            {/* GATEKEEPER LOCK SCREEN (If locked) */}
            {!isGatekeeperUnlocked ? (
              <div className="mt-6 pt-6 border-t border-slate-800 max-w-md mx-auto text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 mx-auto flex items-center justify-center">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    নিরাপদ গেটকিপার / সিকিউরিটি গার্ড অ্যাকাউন্ট
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    স্মার্টফোনের ক্যামেরা দিয়ে লাইভ স্ক্যান ও গেট পরিচালনার জন্য সিকিউর পিন দিন
                  </p>
                </div>
                <form onSubmit={handleGatekeeperUnlock} className="flex flex-col gap-2 max-w-xs mx-auto">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="সিকিউর পিন লিখুন (যেমন: 1234)"
                    className="bg-slate-950 border border-slate-700 text-center font-mono text-base font-black text-amber-300 rounded-xl p-2.5 outline-none focus:border-amber-400"
                    autoFocus
                  />
                  {pinError && <p className="text-rose-400 text-xs font-bold">{pinError}</p>}
                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 cursor-pointer"
                  >
                    গেটকিপার একাউন্টে প্রবেশ করুন
                  </button>
                  <span className="text-[10px] text-slate-500">ডিফল্ট পরীক্ষামূলক পিন: ১২৩৪ (1234)</span>
                </form>
              </div>
            ) : (
              <>
                {/* Active Gatekeeper Officer Badge */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300 font-bold">
                      লগইনকৃত সিকিউরিটি অ্যাকাউন্ট: <span className="text-amber-300">{gatekeeperName}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    🛡️ সিকিউর প্রাইভেট টার্মিনাল সক্রিয়
                  </span>
                </div>

                {/* SCANNER MODES & INPUTS */}
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode Switcher */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-300 mb-2 block">
                      ১. স্ক্যানিং মোড নির্বাচন:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setScanMode("in")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          scanMode === "in"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-400"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-650"
                        }`}
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        <span>প্রবেশ (In-Time)</span>
                      </button>
                      <button
                        onClick={() => setScanMode("out")}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          scanMode === "out"
                            ? "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-lg ring-2 ring-rose-400"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-650"
                        }`}
                      >
                        <ArrowLeftCircle className="w-4 h-4" />
                        <span>প্রস্থান (Out-Time)</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Scanner Input Form */}
                  <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 md:col-span-2 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span>২. বারকোড / QR স্ক্যানার রিডার অথবা শিক্ষার্থী ইউনিক ইনডেক্স/আইডি লিখুন:</span>
                      <span className="text-[10px] text-amber-300 font-mono">
                        [Enter চাপলেই স্বয়ংক্রিয় প্রসেস হবে]
                      </span>
                    </span>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleProcessScan(scannedInput);
                      }}
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <Scan className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={scannedInput}
                          onChange={(e) => setScannedInput(e.target.value)}
                          placeholder="কার্ড স্ক্যান করুন বা DLM-2026-0501 / DLM-501 লিখুন..."
                          className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                          autoFocus
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>স্ক্যান ও বার্তা পাঠান</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* 3. SMARTPHONE LIVE CAMERA QR SCANNER (User Request) */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">
                        ৩. স্মার্টফোন লাইভ ক্যামেরা স্ক্যানার (স্মার্টফোনের ক্যামেরা দিয়ে কার্ডের QR স্ক্যান):
                      </span>
                    </div>

                    <button
                      onClick={isCameraActive ? stopCamera : startCamera}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
                        isCameraActive
                          ? "bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                      }`}
                    >
                      <Camera className="w-4 h-4 text-amber-300" />
                      <span>{isCameraActive ? "⏹️ ক্যামেরা বন্ধ করুন" : "📱 লাইভ ক্যামেরা স্ক্যানার চালু করুন"}</span>
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2 mb-3">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="bg-slate-950 border-2 border-indigo-500/50 rounded-2xl p-4 flex flex-col items-center justify-center animate-fadeIn relative overflow-hidden">
                      {/* FOV Zoom Slider Bar */}
                      <div className="mb-3 w-full max-w-sm flex items-center justify-between gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-500/40">
                        <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-black">
                          <Sliders className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] whitespace-nowrap">ক্যামেরা জুম (FOV):</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setZoomLevel(prev => Math.max(1.0, parseFloat((prev - 0.2).toFixed(1))))}
                            disabled={zoomLevel <= 1.0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
                            title="জুম কমান"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="range"
                            min="1.0"
                            max="3.5"
                            step="0.1"
                            value={zoomLevel}
                            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                            className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                            title={`জুম: ${zoomLevel.toFixed(1)}x`}
                          />
                          <button
                            type="button"
                            onClick={() => setZoomLevel(prev => Math.min(3.5, parseFloat((prev + 0.2).toFixed(1))))}
                            disabled={zoomLevel >= 3.5}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
                            title="জুম বাড়ান"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-black text-amber-300 min-w-[28px] text-center">
                            {zoomLevel.toFixed(1)}x
                          </span>
                        </div>
                      </div>

                      <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden bg-black border-2 border-emerald-400 shadow-2xl flex items-center justify-center">
                        <video
                          ref={videoRef}
                          playsInline
                          muted
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                          className="w-full h-full object-cover transition-transform duration-75 ease-out"
                        />
                        {/* Glowing Green Viewfinder Box & Animated Laser Line */}
                        <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                          <div className="text-center text-[10px] text-emerald-300 font-bold bg-black/60 py-0.5 rounded backdrop-blur-xs">
                            কার্ডের কিউআর কোডটি ক্যামেরার সামনে ধরুন
                          </div>
                          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-[11px] text-slate-300 font-medium">
                          ⚡ ক্যামেরা সক্রিয় রয়েছে — আইডি কার্ড বা কিউআর কোড স্ক্যান করামাত্রই স্বয়ংক্রিয় এন্ট্রি হবে
                        </span>
                        <button
                          onClick={() => {
                            // Quick manual test capture for the first student
                            handleProcessScan("DLM-501");
                          }}
                          className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Scan className="w-3.5 h-3.5" />
                          <span>📸 এক-ট্যাপে ফ্রেম স্ক্যান</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* QUICK ONE-CLICK SIMULATOR BUTTONS FOR NURSERY & CLASS 5 STUDENTS */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    ⚡ তাৎক্ষণিক টেস্ট স্ক্যান (শিক্ষার্থীর বাটনে ক্লিক করে লাইভ মেসেজিং ও মিষ্টি ভয়েস পরীক্ষা করুন):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_SECURITY_PROFILES.map((st) => (
                      <div key={st.studentId} className="flex gap-1">
                        <button
                          onClick={() => handleProcessScan(st.indexNumber || st.studentId, "in")}
                          className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="প্রবেশ স্ক্যান ও মিষ্টি ভয়েস বার্তা পাঠান"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{st.name} (ইন)</span>
                        </button>
                        <button
                          onClick={() => handleProcessScan(st.indexNumber || st.studentId, "out")}
                          className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-800 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                          title="প্রস্থান স্ক্যান ও মিষ্টি ভয়েস বার্তা পাঠান"
                        >
                          <ArrowLeftCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>আউট</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* RENDER GATE SMS CONFIGURATION PANEL IF SMS_SETUP IS ACTIVE */}
      {activeSubView === "sms_setup" && (
        <div className="animate-fadeIn">
          <GateSMSConfigPanel />
        </div>
      )}

      {/* RENDER LIVE SCANNER RESULTS AND LOGS IF LIVE_SCANNER IS ACTIVE */}
      {activeSubView === "live_scanner" && isGatekeeperUnlocked && (
        <>
          {/* LIVE SCAN CONFIRMATION BANNER WITH SWEET VOICE REPLAY */}
          {lastScannedResult && (
            <div
              className={`p-4 rounded-2xl border-2 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn ${
                lastScannedResult.type === "in"
                  ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-400 text-white"
                  : "bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border-rose-400 text-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white/10 rounded-2xl mt-0.5 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-amber-300">
                      {lastScannedResult.type === "in" ? "✅ গেট এন্ট্রি সফল!" : "🚪 ক্যাম্পাস প্রস্থান সম্পন্ন!"}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                      {lastScannedResult.time}
                    </span>
                    {lastScannedResult.indexNumber && (
                      <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        ইনডেক্স: {lastScannedResult.indexNumber}
                      </span>
                    )}
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <Send className="w-3.5 h-3.5" />
                      <span>অভিভাবকের ড্যাশবোর্ডে পুশ ও এসএমএস প্রেরিত</span>
                    </span>
                  </div>
                  <p className="text-xs font-sans text-slate-100 bg-black/40 p-2.5 rounded-xl border border-white/10 leading-relaxed max-w-2xl">
                    📱 <strong>প্রেরিত বার্তা:</strong> "{lastScannedResult.message}"
                  </p>
                </div>
              </div>

              {/* Sweet Voice Announcement Replay Button */}
              <button
                onClick={() =>
                  speakSweetVoice(lastScannedResult.studentName, lastScannedResult.type, lastScannedResult.time)
                }
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                title="মিষ্টি মধুর কণ্ঠে এনাউন্সমেন্টটি শুনুন"
              >
                <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>মিষ্টি কণ্ঠে পুনরায় শুনুন</span>
              </button>
            </div>
          )}

          {/* LIVE GATE ACTIVITY LOGS TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  আজকের ডিজিটাল গেট লগ ও অভিভাবক নোটিফিকেশন হিস্ট্রি ({logs.length}টি রেকর্ড)
                </h3>
              </div>

              <button
                onClick={handleClearLogs}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>লগ খালি করুন</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                আজকে এখনও কোনো শিক্ষার্থী গেট স্ক্যান করেনি। উপরে স্ক্যান ইনপুট দিয়ে পরীক্ষা করুন।
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">সময়</th>
                      <th className="p-2.5">ইউনিক ইনডেক্স / আইডি</th>
                      <th className="p-2.5">শিক্ষার্থীর নাম</th>
                      <th className="p-2.5">শ্রেণি ও রোল</th>
                      <th className="p-2.5">স্ক্যান ধরন</th>
                      <th className="p-2.5">অভিভাবকের ফোন</th>
                      <th className="p-2.5">এসএমএস ও ভয়েস স্ট্যাটাস</th>
                      <th className="p-2.5">অভিভাবক প্রাপ্তি স্বীকার</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-mono text-slate-600 font-bold">
                          {log.timeOnly || log.timestamp}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-indigo-600">
                          {log.indexNumber || log.studentId}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{log.studentName}</td>
                        <td className="p-2.5 text-slate-600">
                          {log.className}, রোল: {log.roll}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              log.type === "in"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {log.type === "in" ? (
                              <ArrowRightCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <ArrowLeftCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{log.type === "in" ? "প্রবেশ (IN)" : "প্রস্থান (OUT)"}</span>
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{log.guardianPhone}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>ডেলিভার্ড ও ভয়েস সম্পন্ন</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          {log.guardianAcknowledged ? (
                            <span className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                              <span>{log.guardianAcknowledgementText || "আলহামদুলিল্লাহ (প্রাপ্তি নিশ্চিত)"}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              ⏳ বার্তা প্রেরিত (অপেক্ষমাণ)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
