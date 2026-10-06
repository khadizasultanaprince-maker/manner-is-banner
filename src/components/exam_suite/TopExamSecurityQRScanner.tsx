// src/components/exam_suite/TopExamSecurityQRScanner.tsx
import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import {
  Camera,
  Scan,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  AlertCircle,
  User,
  Sparkles,
  Phone,
  ArrowRight,
  ExternalLink,
  Zap,
  Radio,
  Check,
  RotateCcw,
  History,
  Search,
  ZoomIn,
  ZoomOut,
  Sliders,
  Printer,
  Trash2,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle,
  UserCheck
} from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { StudentSecurityProfile, GateLog } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES, SAMPLE_GATE_LOGS } from "./examMockData";
import { DEFAULT_GATE_SMS_CONFIG, GateSMSConfig } from "./GateSMSConfigPanel";

interface TopExamSecurityQRScannerProps {
  onClose: () => void;
  onViewSuite?: () => void;
  initialTab?: "scanner" | "history";
  zoomLevel?: number;
  onZoomChange?: (newZoom: number) => void;
}

// Convert English numbers to Bengali numerals
const toBnDigits = (n: number | string | undefined | null): string => {
  if (n === undefined || n === null) return "";
  const bDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().replace(/[0-9]/g, d => bDigits[parseInt(d, 10)]);
};

export const TopExamSecurityQRScanner: React.FC<TopExamSecurityQRScannerProps> = ({
  onClose,
  onViewSuite,
  initialTab = "scanner",
  zoomLevel: propZoomLevel,
  onZoomChange: propOnZoomChange
}) => {
  const [activeTab, setActiveTab] = useState<"scanner" | "history">(initialTab);
  const [scanMode, setScanMode] = useState<"in" | "out">("in");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>("");
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Field of View & Camera Zoom State (1.0x to 3.5x)
  const [zoomLevel, setZoomLevel] = useState<number>(propZoomLevel !== undefined ? propZoomLevel : 1.0);
  const [hardwareZoomSupported, setHardwareZoomSupported] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (propZoomLevel !== undefined && propZoomLevel !== zoomLevel) {
      const clamped = Math.min(3.5, Math.max(1.0, parseFloat(propZoomLevel.toFixed(1))));
      setZoomLevel(clamped);
      zoomLevelRef.current = clamped;
    }
  }, [propZoomLevel]);

  // Scanned Student Result State
  const [scannedStudent, setScannedStudent] = useState<StudentSecurityProfile | null>(null);
  const [scanLog, setScanLog] = useState<GateLog | null>(null);
  const [spokenAudioText, setSpokenAudioText] = useState<string>("");

  // Scanned ID Card Logs History State
  const [logs, setLogs] = useState<GateLog[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_gate_logs");
      return saved ? JSON.parse(saved) : SAMPLE_GATE_LOGS;
    } catch {
      return SAMPLE_GATE_LOGS;
    }
  });

  // History Filter & Search State
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState<"all" | "in" | "out">("all");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const zoomLevelRef = useRef<number>(zoomLevel);
  zoomLevelRef.current = zoomLevel;

  // Friendly Bengali Voice Notification Synthesizer
  const speakFriendlyVoice = (studentName: string, type: "in" | "out", timeStr: string, guardianName?: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();

      let speechText = "";
      if (type === "in") {
        speechText = `আসসালামু আলাইকুম সম্মানিত অভিভাবক ${guardianName ? guardianName + "," : ""}। আলহামদুলিল্লাহ! আপনার প্রিয় সন্তান ${studentName} এইমাত্র সকাল ${timeStr} এ নিরাপদে ডি-লিকন মডেল একাডেমী ক্যাম্পাসে প্রবেশ করেছে। আপনার সন্তানের মঙ্গলময় দিন ও সুন্দর ভবিষ্যৎ কামনা করছি।`;
      } else {
        speechText = `সম্মানিত অভিভাবক, আপনার প্রিয় সন্তান ${studentName} সফলভাবে আজকের পাঠদান সম্পন্ন করে বিকাল ${timeStr} এ ক্যাম্পাস ত্যাগ করেছে। নিরাপদে বাড়ি পৌঁছানোর জন্য শুভকামনা। ধন্যবাদ।`;
      }

      setSpokenAudioText(speechText);

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "bn-BD";
      utterance.pitch = 1.15; // Sweet, warm, friendly tone
      utterance.rate = 0.92; // Clear, polite Bengali tempo

      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => v.lang.includes("bn") || v.lang.includes("Bengali") || v.name.toLowerCase().includes("bangla"));
      if (bnVoice) utterance.voice = bnVoice;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
    }
  };

  // Positive acoustic beep tone on scan
  const playBeepTone = (type: "in" | "out") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "in" ? 880 : 660, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } catch {
      // AudioContext unavailable
    }
  };

  // Zoom Handler (Hardware Camera Zoom + Canvas Optical FOV Zoom)
  const handleZoomChange = async (newZoom: number) => {
    const clampedZoom = Math.min(3.5, Math.max(1.0, parseFloat(newZoom.toFixed(1))));
    setZoomLevel(clampedZoom);
    zoomLevelRef.current = clampedZoom;
    if (propOnZoomChange) {
      propOnZoomChange(clampedZoom);
    }

    // Apply hardware camera track zoom if supported by mobile/webcam
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities as any)?.();
          if (capabilities && capabilities.zoom) {
            const minZ = capabilities.zoom.min || 1;
            const maxZ = capabilities.zoom.max || 4;
            const targetZ = Math.min(maxZ, Math.max(minZ, clampedZoom));
            await (track as any).applyConstraints({
              advanced: [{ zoom: targetZ }]
            });
            setHardwareZoomSupported(true);
          }
        } catch (e) {
          console.warn("Hardware zoom constraint error:", e);
        }
      }
    }
  };

  // Start Camera Stream
  const startCamera = async (currentFacing: "environment" | "user" = facingMode) => {
    stopCamera();
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("আপনার ডিভাইসে বা ব্রাউজারে ক্যামেরা ব্যবহারের সুবিধা সমর্থিত নয়। দয়া করে নিচে কোড টাইপ করে বা সিমুলেটরে পরীক্ষা করুন।");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
      }

      // Check for hardware zoom support on track
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities as any)?.();
        if (capabilities && capabilities.zoom) {
          setHardwareZoomSupported(true);
          if (zoomLevel > 1.0) {
            try {
              await (track as any).applyConstraints({ advanced: [{ zoom: zoomLevel }] });
            } catch {}
          }
        }
      }

      setIsCameraActive(true);
      setIsScanningActive(true);
      startQRScanLoop();
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errMsg = "ক্যামেরা চালু করতে ব্যর্থ হয়েছে। ব্রাউজারের ক্যামেরা পারমিশন (Camera Permission) চেক করুন।";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errMsg = "ক্যামেরা ব্যবহারের অনুমতি দেওয়া হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে ক্যামেরা এলাউ (Allow) করুন।";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        errMsg = "কোনো সংযুক্ত ক্যামেরা পাওয়া যায়নি। নিচে টেস্ট বারকোড বোতামে ক্লিক করে পরীক্ষা করতে পারেন।";
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
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

  // Continuous Frame Analysis with jsQR (taking FOV zoom into account!)
  const startQRScanLoop = () => {
    const scanTick = () => {
      if (!videoRef.current || !canvasRef.current || !isScanningActive) {
        animFrameIdRef.current = requestAnimationFrame(scanTick);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = 640;
        canvas.height = 480;

        // FOV Zoom adaptation: Crop to center based on zoom level so the scanner engine matches the user's optical zoom!
        const currentZoom = zoomLevelRef.current || 1.0;
        const sWidth = video.videoWidth / currentZoom;
        const sHeight = video.videoHeight / currentZoom;
        const sx = (video.videoWidth - sWidth) / 2;
        const sy = (video.videoHeight - sHeight) / 2;

        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data && code.data.trim()) {
          // Found QR Code!
          handleProcessQRCode(code.data.trim());
          return;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(scanTick);
    };

    animFrameIdRef.current = requestAnimationFrame(scanTick);
  };

  // Flip Camera between back and front
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Toggle Torch/Flashlight
  const toggleFlashlight = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track.getCapabilities as any)?.().torch) {
      try {
        const nextState = !isFlashOn;
        await (track as any).applyConstraints({ advanced: [{ torch: nextState }] });
        setIsFlashOn(nextState);
      } catch (e) {
        console.warn("Torch constraint error:", e);
      }
    }
  };

  // PROCESS SCANNED QR CODE
  const handleProcessQRCode = async (rawCode: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setIsScanningActive(false);

    try {
      // 1. Clean and parse raw QR string
      let targetId = rawCode.trim();
      let matchedClass = "";
      let matchedRoll = "";

      // Check if QR data is JSON
      try {
        if (targetId.startsWith("{") && targetId.endsWith("}")) {
          const parsed = JSON.parse(targetId);
          if (parsed.studentId) targetId = parsed.studentId;
          else if (parsed.indexNumber) targetId = parsed.indexNumber;
          else if (parsed.id) targetId = parsed.id;
          if (parsed.className) matchedClass = parsed.className;
          if (parsed.roll) matchedRoll = parsed.roll;
        }
      } catch {
        // Not JSON
      }

      // Check if format is class_roll e.g. 5_1, 7_4
      if (/^\d+_\d+$/.test(targetId)) {
        const [cNum, rNum] = targetId.split("_");
        matchedRoll = rNum;
        const clsNames: Record<string, string> = {
          "1": "প্রথম শ্রেণি",
          "2": "দ্বিতীয় শ্রেণি",
          "3": "তৃতীয় শ্রেণি",
          "4": "চতুর্থ শ্রেণি",
          "5": "পঞ্চম শ্রেণি",
          "6": "ষষ্ঠ শ্রেণি",
          "7": "সপ্তম শ্রেণি",
          "8": "অষ্টম শ্রেণি",
          "9": "নবম শ্রেণি",
          "10": "দশম শ্রেণি"
        };
        if (clsNames[cNum]) matchedClass = clsNames[cNum];
      }

      // 2. Fetch Student Profile from all sources
      let studentProfile: StudentSecurityProfile | null = null;

      // 2a. Check Local Registered Profiles
      let allProfiles = SAMPLE_SECURITY_PROFILES;
      try {
        const saved = localStorage.getItem("dlikon_student_security_profiles");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) allProfiles = parsed;
        }
      } catch {}

      studentProfile = allProfiles.find(s => 
        s.studentId.toLowerCase() === targetId.toLowerCase() ||
        (s.indexNumber && s.indexNumber.toLowerCase() === targetId.toLowerCase()) ||
        (matchedClass && matchedRoll && s.className.includes(matchedClass) && s.roll === matchedRoll)
      ) || null;

      // 2b. Check Cloud Firestore if not found locally
      if (!studentProfile) {
        try {
          const docSnap = await getDoc(doc(db, "student_security_profiles", targetId));
          if (docSnap.exists()) {
            studentProfile = docSnap.data() as StudentSecurityProfile;
          }
        } catch (e) {
          console.warn("Firestore profile lookup fallback:", e);
        }
      }

      // 2c. Fallback generic profile if completely new code
      if (!studentProfile) {
        studentProfile = {
          studentId: targetId,
          indexNumber: targetId.startsWith("DLM-") ? targetId : `DLM-2026-${targetId}`,
          name: `শিক্ষার্থী (${targetId})`,
          className: matchedClass || "পঞ্চম শ্রেণি",
          roll: matchedRoll || "০১",
          bloodGroup: "B+",
          guardianName: "অভিভাবক",
          guardianPhone: "01711-XXXXXX",
          emergencyContact: "01819-XXXXXX",
          address: "ডি-লিকন মডেল একাডেমি ক্যাম্পাস",
          cardExpiry: "২০২৬"
        };
      }

      // 3. Format Date, Time & Bengali Timestamps
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
      const dateFormatted = now.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
      const timestampStr = `${dateFormatted} ${timeFormatted}`;

      // 4. Generate notification text based on configured SMS templates
      let customConfig: GateSMSConfig = DEFAULT_GATE_SMS_CONFIG;
      try {
        const savedCfg = localStorage.getItem("dlikon_gate_sms_config");
        if (savedCfg) customConfig = { ...DEFAULT_GATE_SMS_CONFIG, ...JSON.parse(savedCfg) };
      } catch {}

      let notifMsg = "";
      if (scanMode === "in") {
        notifMsg = (customConfig.entryTemplate || DEFAULT_GATE_SMS_CONFIG.entryTemplate)
          .replace(/{শিক্ষার্থীর_নাম}/g, studentProfile.name)
          .replace(/{শ্রেণি}/g, studentProfile.className)
          .replace(/{রোল}/g, studentProfile.roll)
          .replace(/{সময়}/g, timeFormatted)
          .replace(/{তারিখ}/g, dateFormatted)
          .replace(/{প্রতিষ্ঠানের_নাম}/g, "ডি-লিকন মডেল একাডেমী");
      } else {
        notifMsg = (customConfig.exitTemplate || DEFAULT_GATE_SMS_CONFIG.exitTemplate)
          .replace(/{শিক্ষার্থীর_নাম}/g, studentProfile.name)
          .replace(/{শ্রেণি}/g, studentProfile.className)
          .replace(/{রোল}/g, studentProfile.roll)
          .replace(/{সময়}/g, timeFormatted)
          .replace(/{তারিখ}/g, dateFormatted)
          .replace(/{প্রতিষ্ঠানের_নাম}/g, "ডি-লিকন মডেল একাডেমী");
      }

      // 5. Construct Gate Log Entry
      const newGateLog: GateLog = {
        id: "gate-" + Date.now(),
        studentId: studentProfile.studentId,
        indexNumber: studentProfile.indexNumber,
        studentName: studentProfile.name,
        className: studentProfile.className,
        roll: studentProfile.roll,
        type: scanMode,
        timestamp: timestampStr,
        timeOnly: timeFormatted,
        dateOnly: dateFormatted,
        guardianPhone: studentProfile.guardianPhone || studentProfile.fatherPhone || "01711-XXXXXX",
        notificationMessage: notifMsg,
        status: "delivered",
        guardianAcknowledged: false,
        voiceSpoken: true
      };

      // 6. Update Firestore Database Entry Status
      try {
        // Record in gate_logs collection
        await addDoc(collection(db, "gate_logs"), {
          ...newGateLog,
          createdAt: serverTimestamp()
        });

        // Update live gate status entry in Firestore
        await setDoc(doc(db, "gate_status", studentProfile.studentId), {
          studentId: studentProfile.studentId,
          indexNumber: studentProfile.indexNumber,
          studentName: studentProfile.name,
          className: studentProfile.className,
          roll: studentProfile.roll,
          lastStatus: scanMode,
          lastScanTime: timestampStr,
          currentInside: scanMode === "in",
          guardianPhone: studentProfile.guardianPhone,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Firestore gate status update error, fallback to local:", err);
      }

      // 7. Update Local Storage for Instant App-wide Sync
      try {
        const savedLogs = JSON.parse(localStorage.getItem("dlikon_gate_logs") || "[]");
        const updatedLogsList = [newGateLog, ...savedLogs];
        localStorage.setItem("dlikon_gate_logs", JSON.stringify(updatedLogsList));
        setLogs(updatedLogsList);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gate_log_added"));
        }

        // Dispatch notification directly to Guardian Portal in localStorage
        const notifKey = `student_gate_notifs_${studentProfile.studentId}`;
        const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || "[]");
        existingNotifs.unshift({
          id: newGateLog.id,
          title: scanMode === "in" ? "স্কুলে নিরাপদ আগমন" : "ক্যাম্পাস থেকে প্রস্থান",
          message: notifMsg,
          time: timeFormatted,
          date: dateFormatted,
          type: scanMode,
          guardianAcknowledged: false
        });
        localStorage.setItem(notifKey, JSON.stringify(existingNotifs));
      } catch (e) {
        console.error("Local storage sync error:", e);
      }

      // 8. Acoustic Confirmation Beep
      playBeepTone(scanMode);

      // 9. Trigger Friendly Bengali Voice Notification for Guardian's App
      speakFriendlyVoice(
        studentProfile.name,
        scanMode,
        timeFormatted,
        studentProfile.guardianName || studentProfile.fatherName
      );

      // 10. Update Active UI State
      setScannedStudent(studentProfile);
      setScanLog(newGateLog);
      setManualInput("");
    } catch (err) {
      console.error("QR Code processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resume camera scanning for next student card
  const handleScanNext = () => {
    setScannedStudent(null);
    setScanLog(null);
    setSpokenAudioText("");
    setIsScanningActive(true);
    if (!isCameraActive && activeTab === "scanner") {
      startCamera();
    }
  };

  // Delete single log entry
  const handleDeleteLog = (logId: string) => {
    const updated = logs.filter(l => l.id !== logId);
    setLogs(updated);
    localStorage.setItem("dlikon_gate_logs", JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("gate_log_added"));
    }
  };

  // Clear all gate logs
  const handleClearAllLogs = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে সমস্ত স্ক্যান করা আইডি কার্ডের ইতিহাস মুছে ফেলতে চান?")) {
      setLogs([]);
      localStorage.removeItem("dlikon_gate_logs");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gate_log_added"));
      }
    }
  };

  // Toggle guardian acknowledgment
  const handleToggleAcknowledge = (logId: string) => {
    const updated = logs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          guardianAcknowledged: !l.guardianAcknowledged,
          guardianAcknowledgedAt: new Date().toLocaleTimeString("bn-BD")
        };
      }
      return l;
    });
    setLogs(updated);
    localStorage.setItem("dlikon_gate_logs", JSON.stringify(updated));
  };

  // Auto start camera when on scanner tab
  useEffect(() => {
    if (activeTab === "scanner") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeTab]);

  // Filtered logs for history tab
  const filteredLogs = logs.filter(item => {
    const matchesSearch =
      !historySearchQuery ||
      item.studentName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.roll.includes(historySearchQuery) ||
      item.className.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      (item.indexNumber && item.indexNumber.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
      item.guardianPhone.includes(historySearchQuery);

    const matchesType =
      historyTypeFilter === "all" ||
      item.type === historyTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* TOP MODAL HEADER WITH TAB SWITCHER */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center">
              {activeTab === "scanner" ? <Scan className="w-4 h-4 animate-pulse" /> : <History className="w-4 h-4 text-indigo-300" />}
            </div>
            <div>
              <h3 className="text-sm font-black flex items-center gap-2">
                <span>{activeTab === "scanner" ? "স্মার্ট গেট ক্যামেরা কিউআর স্ক্যানার" : "স্ক্যান করা আইডি কার্ডের ইতিহাস"}</span>
                <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full shadow-2xs font-mono">
                  {activeTab === "scanner" ? "LIVE CAMERA" : `${toBnDigits(logs.length)}টি রেকর্ড`}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                ক্যামেরা জুম অ্যাডজাস্টমেন্ট • রিয়েল-টাইম ডাটাবেস আপডেট • অভিভাবক মিষ্টি কন্ঠে ভয়েস নোটিফিকেশন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tab switch buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("scanner");
                  setScannedStudent(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "scanner"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="ক্যামেরা স্ক্যানার খুলুন"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>স্ক্যানার</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer ${
                  activeTab === "history"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="স্ক্যান ইতিহাস ও সংরক্ষিত আইডি কার্ড তালিকা দেখুন"
              >
                <History className="w-3.5 h-3.5" />
                <span>ইতিহাস ({toBnDigits(logs.length)})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                voiceEnabled ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50" : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title={voiceEnabled ? "মিষ্টি ভয়েস নোটিফিকেশন চালু" : "ভয়েস নোটিফিকেশন বন্ধ"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ===================== TAB 1: SCANNER VIEW ===================== */}
        {activeTab === "scanner" && (
          <>
            {/* SCANNER CONTROLLER & ZOOM SLIDER BAR */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Mode Switcher: Entry vs Exit */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setScanMode("in")}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    scanMode === "in"
                      ? "bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>প্রবেশ (IN)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("out")}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    scanMode === "out"
                      ? "bg-rose-600 text-white shadow-md ring-1 ring-rose-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                  <span>প্রস্থান (OUT)</span>
                </button>
              </div>

              {/* CAMERA FIELD OF VIEW & ZOOM SLIDER (ক্যামেরা জুম স্লাইডার) */}
              <div
                id="camera-fov-slider-container"
                className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-500/40 shadow-inner"
              >
                <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-black">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] whitespace-nowrap">ক্যামেরা জুম (FOV):</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel - 0.2)}
                  disabled={zoomLevel <= 1.0}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
                  title="জুম কমান"
                  id="scanner-zoom-out-btn"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {/* Range Slider for Field of View Customization */}
                <input
                  type="range"
                  min="1.0"
                  max="3.5"
                  step="0.1"
                  value={zoomLevel}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  id="scanner-zoom-slider"
                  className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  title={`জুম স্তর: ${toBnDigits(zoomLevel.toFixed(1))}x`}
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoomLevel + 0.2)}
                  disabled={zoomLevel >= 3.5}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition cursor-pointer"
                  title="জুম বাড়ান"
                  id="scanner-zoom-in-btn"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {/* Zoom Value Display */}
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-xs font-black border border-amber-400/40 min-w-[34px] text-center">
                  {toBnDigits(zoomLevel.toFixed(1))}x
                </span>

                {/* Quick 1x / 2x presets */}
                <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-slate-750">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(1.0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                      zoomLevel === 1.0 ? "bg-amber-400 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ১x
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomChange(2.0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                      zoomLevel === 2.0 ? "bg-amber-400 text-slate-950 font-black" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ২x
                  </button>
                </div>
              </div>

              {/* Camera Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                  title="ক্যামেরা পরিবর্তন করুন"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ফ্লিপ</span>
                </button>
                <button
                  type="button"
                  onClick={toggleFlashlight}
                  className={`p-1.5 rounded-lg text-xs font-bold transition border ${
                    isFlashOn ? "bg-amber-500 text-slate-950 border-amber-400" : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                  title="ফ্ল্যাশলাইট"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SCANNER BODY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!scannedStudent ? (
                <div className="relative w-full aspect-video sm:aspect-[4/3] max-h-[340px] bg-black rounded-xl overflow-hidden border-2 border-indigo-500/40 shadow-inner flex flex-col items-center justify-center">
                  {/* Video Element with Dynamic CSS FOV Scale Transform */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover transition-transform duration-75 ease-out"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                    playsInline
                    muted
                  />

                  {/* Hidden Canvas for Frame Decoding */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Camera Scanner Target HUD / Overlay */}
                  {isCameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                      {/* Target Box */}
                      <div className="relative w-52 h-52 sm:w-60 sm:h-60 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col justify-between p-2">
                        {/* Corner Reticles */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                        {/* Animated Scanning Laser Line */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-bounce"></div>

                        <div className="text-center text-[10px] font-black text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded mx-auto backdrop-blur-xs">
                          আইডি কার্ডের কিউআর কোডটি এখানে ধরুন ({toBnDigits(zoomLevel.toFixed(1))}x FOV)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Camera Inactive / Error Display */}
                  {(!isCameraActive || cameraError) && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
                      <Camera className="w-10 h-10 text-slate-500 mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-slate-300 max-w-sm mb-3">
                        {cameraError || "ক্যামেরা সক্রিয় করতে নিচে বাটনে চাপুন অথবা অনুমতি দিন।"}
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>ক্যামেরা পুনরায় চালু করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* SCANNED STUDENT PROFILE CARD */
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-2xl text-white animate-scaleUp">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                          <span>সফলভাবে স্ক্যান ও ডাটাবেস আপডেট সম্পন্ন!</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            scanLog?.type === "in" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                          }`}>
                            {scanLog?.type === "in" ? "ক্যাম্পাসে প্রবেশ ✓" : "ক্যাম্পাস থেকে প্রস্থান ✓"}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          সময়: {scanLog?.timeOnly} • তারিখ: {scanLog?.dateOnly}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleScanNext}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>পরবর্তী স্ক্যান</span>
                    </button>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 sm:border-r sm:border-slate-800 sm:pr-3">
                      <div className="w-14 h-16 rounded-lg bg-slate-800 border border-indigo-400/50 overflow-hidden shrink-0 flex items-center justify-center">
                        {scannedStudent.photoUrl ? (
                          <img src={scannedStudent.photoUrl} alt={scannedStudent.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-amber-400 block">শিক্ষার্থীর পরিচয়</span>
                        <h5 className="text-sm font-black text-white truncate">{scannedStudent.name}</h5>
                        <p className="text-[11px] text-slate-300 font-semibold">{scannedStudent.className} • রোল: {toBnDigits(scannedStudent.roll)}</p>
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold bg-indigo-900/60 text-indigo-200 px-1.5 py-0.2 rounded border border-indigo-700/60">
                          {scannedStudent.indexNumber || scannedStudent.studentId}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:border-r sm:border-slate-800 sm:pr-3">
                      <div className="w-12 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                        {scannedStudent.fatherPhotoUrl || scannedStudent.motherPhotoUrl ? (
                          <img src={scannedStudent.fatherPhotoUrl || scannedStudent.motherPhotoUrl} alt="Guardian" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block">অভিভাবকের তথ্য</span>
                        <h6 className="text-xs font-bold text-white truncate">{scannedStudent.guardianName || scannedStudent.fatherName || "অভিভাবক"}</h6>
                        <p className="text-[10px] text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{scannedStudent.guardianPhone || scannedStudent.fatherPhone || "01711-XXXXXX"}</span>
                        </p>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">রক্তের গ্রুপ: {scannedStudent.bloodGroup}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-1 bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30">
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>স্বয়ংক্রিয় এসএমএস প্রেরিত</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-sky-300">
                        <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
                        <span>গার্ডিয়ান অ্যাপে নোটিফিকেশন ডেলিভার্ড</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>মিষ্টি কণ্ঠে ভয়েস প্রচারিত হয়েছে</span>
                      </div>
                    </div>
                  </div>

                  {/* Spoken Voice Text Card */}
                  {spokenAudioText && (
                    <div className="mt-3 p-3 bg-indigo-950/60 rounded-xl border border-indigo-500/40 flex items-start gap-2.5">
                      <Volume2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">অভিভাবকের ফোনে প্রচারিত ভয়েস নোটিফিকেশন:</span>
                        <p className="text-xs font-medium text-slate-200 mt-0.5 italic leading-relaxed">
                          "{spokenAudioText}"
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakFriendlyVoice(scannedStudent.name, scanLog?.type || "in", scanLog?.timeOnly || "", scannedStudent.guardianName)}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                        title="পুনরায় মিষ্টি কণ্ঠে শুনুন"
                      >
                        🔊 শুনুন
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL INPUT & TEST SAMPLES */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>হাতে কোড বা ইনডেক্স নম্বর দিয়ে পরীক্ষা করুন (Manual Entry):</span>
                  </label>
                  <span className="text-[10px] text-slate-500">যেমন: DLM-2026-0501</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualInput.trim()) {
                      handleProcessQRCode(manualInput.trim());
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="কিউআর কোড বা ইনডেক্স নম্বর পেস্ট / লিখুন..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold focus:border-emerald-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim() || isProcessing}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1"
                  >
                    <span>স্ক্যান</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Sample Student Barcode Chips */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                    দ্রুত এক-ক্লিকে টেস্ট স্ক্যান করুন (Sample QR Profiles):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_SECURITY_PROFILES.slice(0, 4).map((stud) => (
                      <button
                        key={stud.studentId}
                        type="button"
                        onClick={() => handleProcessQRCode(stud.indexNumber || stud.studentId)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900/60 border border-slate-700 hover:border-indigo-500 text-slate-200 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <span>{stud.name} ({toBnDigits(stud.roll)})</span>
                        <span className="text-[9px] font-mono text-amber-300">[{stud.indexNumber || stud.studentId}]</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================== TAB 2: SCAN HISTORY VIEW (স্ক্যান ইতিহাস) ===================== */}
        {activeTab === "history" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* History Statistics Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">মোট স্ক্যান</span>
                <span className="text-lg font-mono font-black text-indigo-400">{toBnDigits(logs.length)}টি</span>
              </div>
              <div className="p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-800/40 text-center">
                <span className="text-[10px] text-emerald-400 font-bold block">ক্যাম্পাসে প্রবেশ (IN)</span>
                <span className="text-lg font-mono font-black text-emerald-300">
                  {toBnDigits(logs.filter(l => l.type === "in").length)}টি
                </span>
              </div>
              <div className="p-2.5 bg-rose-950/30 rounded-xl border border-rose-800/40 text-center">
                <span className="text-[10px] text-rose-400 font-bold block">প্রস্থান (OUT)</span>
                <span className="text-lg font-mono font-black text-rose-300">
                  {toBnDigits(logs.filter(l => l.type === "out").length)}টি
                </span>
              </div>
              <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-800/40 text-center">
                <span className="text-[10px] text-amber-400 font-bold block">অভিভাবক নিশ্চিতকরণ</span>
                <span className="text-lg font-mono font-black text-amber-300">
                  {toBnDigits(logs.filter(l => l.guardianAcknowledged).length)}টি
                </span>
              </div>
            </div>

            {/* History Search & Filter Control Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="নাম, রোল বা ইনডেক্স দিয়ে খুঁজুন..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setHistoryTypeFilter("all")}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      historyTypeFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400"
                    }`}
                  >
                    সকল ({toBnDigits(logs.length)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTypeFilter("in")}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      historyTypeFilter === "in" ? "bg-emerald-600 text-white" : "text-slate-400"
                    }`}
                  >
                    প্রবেশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryTypeFilter("out")}
                    className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                      historyTypeFilter === "out" ? "bg-rose-600 text-white" : "text-slate-400"
                    }`}
                  >
                    প্রস্থান
                  </button>
                </div>

                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllLogs}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="সমস্ত ইতিহাস মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* History Items List */}
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">কোনো স্ক্যান করা আইডি কার্ডের রেকর্ড পাওয়া যায়নি।</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("scanner")}
                  className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>ক্যামেরা স্ক্যানারে যান</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredLogs.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950/70 hover:bg-slate-850/80 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                        item.type === "in" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/40" : "bg-rose-500/20 text-rose-400 border border-rose-400/40"
                      }`}>
                        {item.type === "in" ? <ArrowRightCircle className="w-4 h-4" /> : <ArrowLeftCircle className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-white truncate">{item.studentName}</h5>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            item.type === "in" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                          }`}>
                            {item.type === "in" ? "প্রবেশ" : "প্রস্থান"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {item.className} • রোল: {toBnDigits(item.roll)} • {item.timeOnly} ({item.dateOnly})
                        </p>
                        {item.indexNumber && (
                          <span className="text-[9px] font-mono text-indigo-300 bg-indigo-950 px-1 py-0.2 rounded border border-indigo-800">
                            {item.indexNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions and Status */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Play Voice Notification Button */}
                      <button
                        type="button"
                        onClick={() => speakFriendlyVoice(item.studentName, item.type, item.timeOnly)}
                        className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-indigo-500/40"
                        title="অভিভাবক ভয়েস বার্তা শুনুন"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>ভয়েস</span>
                      </button>

                      {/* Guardian Acknowledgment Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleAcknowledge(item.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border ${
                          item.guardianAcknowledged
                            ? "bg-emerald-950/60 text-emerald-300 border-emerald-500"
                            : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
                        }`}
                        title="অভিভাবক প্রাপ্তি স্বীকার"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span>{item.guardianAcknowledged ? "স্বীকৃত ✓" : "অস্বীকৃত"}</span>
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="রেকর্ড মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM MODAL FOOTER */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>নিরাপদ এনক্রিপ্টেড ডাটাবেস গেটওয়ে • ডি-লিকন সিকিউরিটি</span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "scanner" ? (
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                <History className="w-3.5 h-3.5" />
                <span>স্ক্যান ইতিহাস দেখুন ({toBnDigits(logs.length)})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("scanner")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ক্যামেরা স্ক্যানারে ফিরুন</span>
              </button>
            )}

            {onViewSuite && (
              <button
                type="button"
                onClick={onViewSuite}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
              >
                <span>সিকিউরিটি সুইট</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
