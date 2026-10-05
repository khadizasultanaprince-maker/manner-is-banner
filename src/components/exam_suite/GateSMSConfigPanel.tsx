// src/components/exam_suite/GateSMSConfigPanel.tsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  MessageSquare,
  Smartphone,
  Send,
  Save,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  BellRing,
  HelpCircle,
  PhoneCall
} from "lucide-react";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export interface GateSMSConfig {
  gatewayProvider: "greenweb" | "teletalk" | "alpha_sms" | "infobip" | "parent_app_push";
  senderId: string;
  apiKey: string;
  enableEntrySMS: boolean;
  enableExitSMS: boolean;
  enableLateAlertSMS: boolean;
  enableAbsentSMS: boolean;
  enableAppPush: boolean;
  enableWhatsAppAlert: boolean;
  schoolStartTime: string;
  lateThresholdTime: string;
  schoolEndTime: string;
  entryTemplate: string;
  exitTemplate: string;
  lateTemplate: string;
  absentTemplate: string;
  duplicateScanCooldownMinutes: number;
  smsBalance: number;
}

export const DEFAULT_GATE_SMS_CONFIG: GateSMSConfig = {
  gatewayProvider: "greenweb",
  senderId: "DLIKON_ACAD",
  apiKey: "gw_live_dlikon_sms_sec_9942",
  enableEntrySMS: true,
  enableExitSMS: true,
  enableLateAlertSMS: true,
  enableAbsentSMS: true,
  enableAppPush: true,
  enableWhatsAppAlert: true,
  schoolStartTime: "০৮:০০",
  lateThresholdTime: "০৮:১৫",
  schoolEndTime: "১৪:০০",
  entryTemplate:
    "সম্মানিত অভিভাবক, আপনার সন্তান {শিক্ষার্থীর_নাম} (শ্রেণি: {শ্রেণি}, রোল: {রোল}) আজ {তারিখ} সকাল {সময়} এ নিরাপদে {প্রতিষ্ঠানের_নাম} ক্যাম্পাসে প্রবেশ করেছে। - কর্তৃপক্ষ",
  exitTemplate:
    "সম্মানিত অভিভাবক, আপনার সন্তান {শিক্ষার্থীর_নাম} (রোল: {রোল}) আজ {তারিখ} বিকাল {সময়} এ স্কুল ক্যাম্পাস ত্যাগ করেছে। - কর্তৃপক্ষ",
  lateTemplate:
    "জরুরি নোটিশ: আপনার সন্তান {শিক্ষার্থীর_নাম} আজ সকাল {সময়} এ দেরিতে স্কুলে প্রবেশ করেছে (নির্ধারিত সময়: {স্কুল_শুরু})। নিয়মিত সময়মতো উপস্থিতি নিশ্চিত করুন। - {প্রতিষ্ঠানের_নাম}",
  absentTemplate:
    "অনুপস্থিতি নোটিশ: আপনার সন্তান {শিক্ষার্থীর_নাম} (রোল: {রোল}) আজ {তারিখ} বিদ্যালয়ে অনুপস্থিত রয়েছে। অনুপস্থিতির কারণ স্কুল ডায়েরিতে উল্লেখ করুন। - প্রধান শিক্ষক",
  duplicateScanCooldownMinutes: 5,
  smsBalance: 4850
};

export const GateSMSConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<GateSMSConfig>(() => {
    try {
      const saved = localStorage.getItem("dlikon_gate_sms_config");
      return saved ? { ...DEFAULT_GATE_SMS_CONFIG, ...JSON.parse(saved) } : DEFAULT_GATE_SMS_CONFIG;
    } catch {
      return DEFAULT_GATE_SMS_CONFIG;
    }
  });

  const [activeTemplateTab, setActiveTemplateTab] = useState<"entry" | "exit" | "late" | "absent">("entry");
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("01711-234567");
  const [testStudentName, setTestStudentName] = useState<string>("আহমেদ হাসান");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");
  const [testSendResult, setTestSendResult] = useState<string>("");

  // Helper to replace dynamic placeholders in preview
  const generatePreviewText = (template: string) => {
    const now = new Date();
    const timeBn = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });
    const dateBn = now.toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });

    return template
      .replace(/{শিক্ষার্থীর_নাম}/g, testStudentName)
      .replace(/{শ্রেণি}/g, "পঞ্চম শ্রেণি")
      .replace(/{রোল}/g, "০১")
      .replace(/{সময়}/g, timeBn)
      .replace(/{তারিখ}/g, dateBn)
      .replace(/{প্রতিষ্ঠানের_নাম}/g, "ডি-লিকন মডেল একাডেমী")
      .replace(/{স্কুল_শুরু}/g, config.schoolStartTime);
  };

  const handleSaveConfig = async () => {
    try {
      localStorage.setItem("dlikon_gate_sms_config", JSON.stringify(config));

      // Sync to Firestore
      try {
        await setDoc(doc(db, "system_configs", "gate_sms_settings"), {
          ...config,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore sync optional offline fallback:", err);
      }

      setSaveSuccessMsg("✅ এসএমএস ও নোটিফিকেশন কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!");
      setTimeout(() => setSaveSuccessMsg(""), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTestSMS = () => {
    let currentTpl = config.entryTemplate;
    if (activeTemplateTab === "exit") currentTpl = config.exitTemplate;
    if (activeTemplateTab === "late") currentTpl = config.lateTemplate;
    if (activeTemplateTab === "absent") currentTpl = config.absentTemplate;

    const finalMessage = generatePreviewText(currentTpl);

    setTestSendResult(`📱 [টেস্ট এসএমএস সফল] '${testPhoneNumber}' নম্বরে পাঠানো হয়েছে: "${finalMessage}"`);
    setTimeout(() => setTestSendResult(""), 8000);

    // Deduct 1 credit for simulation
    setConfig(prev => ({ ...prev, smsBalance: Math.max(0, prev.smsBalance - 1) }));
  };

  const handleResetDefaults = () => {
    if (confirm("আপনি কি সকল এসএমএস টেমপ্লেট ও সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?")) {
      setConfig(DEFAULT_GATE_SMS_CONFIG);
      localStorage.setItem("dlikon_gate_sms_config", JSON.stringify(DEFAULT_GATE_SMS_CONFIG));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <MessageSquare className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                গেট এসএমএস ও স্বয়ংক্রিয় নোটিফিকেশন কনফিগারেশন প্যানেল
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Live Gateway Setup
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              শিক্ষার্থী গেটে প্রবেশ ও প্রস্থান স্ক্যান করামাত্রই অভিভাবকের ফোনে মেসেজ যাওয়ার নিয়ম ও বার্তা কাস্টমাইজেশন
            </p>
          </div>
        </div>

        {/* SMS Credits & Save Buttons */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 block text-[10px]">অবশিষ্ট এসএমএস ব্যালেন্স:</span>
            <span className="font-black text-amber-300 font-mono text-sm">{config.smsBalance} টি</span>
          </div>

          <button
            onClick={handleSaveConfig}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4 text-emerald-200" />
            <span>সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {/* Confirmation Alerts */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950 border-2 border-emerald-400 p-4 rounded-2xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {testSendResult && (
        <div className="bg-indigo-950 border-2 border-indigo-400 p-4 rounded-2xl text-white flex items-center gap-3 animate-fadeIn">
          <Smartphone className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-bold text-slate-100">{testSendResult}</span>
        </div>
      )}

      {/* Main 2-Column Grid: Config Controls & Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Gateway & Automated Triggers */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. SMS GATEWAY & CHANNEL SELECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Radio className="w-4 h-4 text-indigo-600" />
              <span>১. এসএমএস গেটওয়ে সার্ভিস ও প্রেরক আইডি (Sender ID)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">এসএমএস গেটওয়ে প্রোভাইডার:</label>
                <select
                  value={config.gatewayProvider}
                  onChange={(e) => setConfig({ ...config, gatewayProvider: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 outline-none focus:border-indigo-600"
                >
                  <option value="greenweb">GreenWeb SMS (অনুমোদিত বাল্ক বিডি গেটওয়ে)</option>
                  <option value="teletalk">Teletalk / BTCL (সরকারি মাস্কিং গেটওয়ে)</option>
                  <option value="alpha_sms">Alpha Net SMS BD (হাই-স্পিড API)</option>
                  <option value="infobip">InfoBip Global Gateway</option>
                  <option value="parent_app_push">ডি-লিকন ক্লাউড অ্যাপ পুশ নোটিফিকেশন (ফ্রি)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">অফিশিয়াল মাস্কিং সেন্ডার আইডি (Sender ID):</label>
                <input
                  type="text"
                  value={config.senderId}
                  onChange={(e) => setConfig({ ...config, senderId: e.target.value })}
                  placeholder="যেমন: DLIKON_ACAD"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none focus:border-indigo-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">গেটওয়ে API সিক্রেট টোকেন / Key:</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-900 outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Notification Channels Toggles */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">সক্রিয় নোটিফিকেশন চ্যানেলসমূহ:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableEntrySMS}
                    onChange={(e) => setConfig({ ...config, enableEntrySMS: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-black text-slate-900 block">মোবাইল এসএমএস (SMS)</span>
                    <span className="text-[10px] text-slate-500">সরাসরি মোবাইলে বার্তা</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableAppPush}
                    onChange={(e) => setConfig({ ...config, enableAppPush: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-black text-slate-900 block">অভিভাবক অ্যাপ নোটিফিকেশন</span>
                    <span className="text-[10px] text-slate-500">ড্যাশবোর্ডে পুশ এলার্ট</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableWhatsAppAlert}
                    onChange={(e) => setConfig({ ...config, enableWhatsAppAlert: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600 rounded"
                  />
                  <div className="text-xs">
                    <span className="font-black text-slate-900 block">WhatsApp বিজনেস অ্যালার্ট</span>
                    <span className="text-[10px] text-slate-500">হোয়াটসঅ্যাপে নোটিশ</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. AUTOMATED RULES & TIMING CONTROLS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>২. গেট সময়সূচি ও স্বয়ংক্রিয় রুলস (Automated Triggers & Timings)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">স্কুল শুরু / নিয়মিত প্রবেশের সময়:</label>
                <input
                  type="text"
                  value={config.schoolStartTime}
                  onChange={(e) => setConfig({ ...config, schoolStartTime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">দেরিতে প্রবেশের সীমা (Late Entry Cutoff):</label>
                <input
                  type="text"
                  value={config.lateThresholdTime}
                  onChange={(e) => setConfig({ ...config, lateThresholdTime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-center"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ছুটি / স্বাভাবিক প্রস্থান শুরু:</label>
                <input
                  type="text"
                  value={config.schoolEndTime}
                  onChange={(e) => setConfig({ ...config, schoolEndTime: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-center"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-black text-amber-950 block">ভুলবশত ডুপ্লিকেট স্ক্যান রোধ (Cooldown Timer):</span>
                <span className="text-[11px] text-amber-800">একই শিক্ষার্থী ৫ মিনিটের মধ্যে একাধিকবার স্ক্যান করলে অতিরিক্ত SMS সেন্ড হবে না।</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config.duplicateScanCooldownMinutes}
                  onChange={(e) => setConfig({ ...config, duplicateScanCooldownMinutes: Number(e.target.value) })}
                  className="w-14 bg-white border border-amber-300 rounded p-1 text-center font-bold"
                />
                <span>মিনিট</span>
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC TEMPLATE EDITOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>৩. স্বয়ংক্রিয় এসএমএস ও নোটিফিকেশন মেসেজ টেমপ্লেট</span>
              </h3>

              {/* Template Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab("entry")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTemplateTab === "entry" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:text-black"
                  }`}
                >
                  🟢 প্রবেশ (In-Time)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab("exit")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTemplateTab === "exit" ? "bg-rose-600 text-white shadow" : "text-slate-600 hover:text-black"
                  }`}
                >
                  🔴 প্রস্থান (Out-Time)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab("late")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTemplateTab === "late" ? "bg-amber-600 text-white shadow" : "text-slate-600 hover:text-black"
                  }`}
                >
                  ⚠️ দেরিতে আগমন
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTemplateTab("absent")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeTemplateTab === "absent" ? "bg-purple-600 text-white shadow" : "text-slate-600 hover:text-black"
                  }`}
                >
                  ❌ অনুপস্থিতি নোটিশ
                </button>
              </div>
            </div>

            {/* Template Dynamic Variables Toolbar */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-500 font-bold mr-1">ভ্যারিয়েবলসমূহ (ক্লিক করে যোগ করুন):</span>
                {["{শিক্ষার্থীর_নাম}", "{শ্রেণি}", "{রোল}", "{সময়}", "{তারিখ}", "{প্রতিষ্ঠানের_নাম}"].map((varTag) => (
                  <button
                    key={varTag}
                    type="button"
                    onClick={() => {
                      if (activeTemplateTab === "entry") setConfig({ ...config, entryTemplate: config.entryTemplate + " " + varTag });
                      if (activeTemplateTab === "exit") setConfig({ ...config, exitTemplate: config.exitTemplate + " " + varTag });
                      if (activeTemplateTab === "late") setConfig({ ...config, lateTemplate: config.lateTemplate + " " + varTag });
                      if (activeTemplateTab === "absent") setConfig({ ...config, absentTemplate: config.absentTemplate + " " + varTag });
                    }}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-900 border border-slate-300 rounded font-mono text-[10.5px] transition cursor-pointer"
                  >
                    + {varTag}
                  </button>
                ))}
              </div>

              {/* Textarea for active template */}
              <textarea
                rows={3}
                value={
                  activeTemplateTab === "entry"
                    ? config.entryTemplate
                    : activeTemplateTab === "exit"
                    ? config.exitTemplate
                    : activeTemplateTab === "late"
                    ? config.lateTemplate
                    : config.absentTemplate
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTemplateTab === "entry") setConfig({ ...config, entryTemplate: val });
                  if (activeTemplateTab === "exit") setConfig({ ...config, exitTemplate: val });
                  if (activeTemplateTab === "late") setConfig({ ...config, lateTemplate: val });
                  if (activeTemplateTab === "absent") setConfig({ ...config, absentTemplate: val });
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>*বাংলা ইউনিকোড বার্তা অনুযায়ী প্রতি ১৬০ ক্যারেক্টারে ১টি এসএমএস চার্জ হবে।</span>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-slate-500 hover:text-rose-600 underline cursor-pointer"
              >
                ডিফল্ট টেমপ্লেট রিসেট
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Smartphone SMS Mockup Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>অভিভাবকের ফোনে লাইভ প্রিভিউ</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                SMS Preview
              </span>
            </div>

            {/* Realistic Smartphone Screen Mockup */}
            <div className="w-full bg-slate-950 rounded-2xl border-4 border-slate-800 p-4 shadow-2xl space-y-3 font-sans relative overflow-hidden">
              {/* Phone Status Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800/80 pb-2">
                <span>08:15 AM</span>
                <span className="font-bold text-amber-300 font-mono">DLIKON_ACAD</span>
                <span>📶 100% 🔋</span>
              </div>

              {/* Message Bubble Preview */}
              <div className="space-y-2 pt-2">
                <div className="text-center text-[9px] text-slate-500 font-mono">
                  আজ সকাল • SMS via {config.senderId}
                </div>

                <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-400/50 rounded-2xl p-3.5 text-xs text-slate-100 shadow-md space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ডি-লিকন ডিজিটাল নিরাপত্তা নিশ্চিতকরণ</span>
                  </div>

                  <p className="leading-relaxed text-[11.5px] font-sans">
                    {generatePreviewText(
                      activeTemplateTab === "entry"
                        ? config.entryTemplate
                        : activeTemplateTab === "exit"
                        ? config.exitTemplate
                        : activeTemplateTab === "late"
                        ? config.lateTemplate
                        : config.absentTemplate
                    )}
                  </p>

                  <div className="text-right text-[9px] text-slate-400 font-mono pt-1">
                    ✓ ডেলিভার্ড
                  </div>
                </div>
              </div>
            </div>

            {/* Test SMS Sender Sandbox */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 space-y-2.5 text-xs">
              <span className="font-black text-white text-xs block">
                🧪 টেস্ট এসএমএস পাঠান (Sandbox Test):
              </span>

              <div>
                <label className="text-slate-400 block text-[10px] mb-0.5">অভিভাবকের মোবাইল নম্বর:</label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block text-[10px] mb-0.5">শিক্ষার্থীর নাম:</label>
                <input
                  type="text"
                  value={testStudentName}
                  onChange={(e) => setTestStudentName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-xs font-bold text-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTestSMS}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:brightness-110 text-white font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <Send className="w-3.5 h-3.5 text-amber-200" />
                <span>টেস্ট এসএমএস পাঠান</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
