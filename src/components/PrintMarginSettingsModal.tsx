import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Sliders, 
  Check, 
  RotateCcw, 
  X, 
  FileText, 
  HelpCircle,
  AlertCircle,
  Sparkles,
  Maximize2
} from "lucide-react";

export interface PrintMarginConfig {
  topMargin: number; // in mm
  bottomMargin: number; // in mm
  leftMargin: number; // in mm
  rightMargin: number; // in mm
  printScale: number; // percentage (e.g. 96)
  rowHeight: number; // in px (e.g. 16.5)
}

export const DEFAULT_PRINT_CONFIG: PrintMarginConfig = {
  topMargin: 3,
  bottomMargin: 3,
  leftMargin: 4,
  rightMargin: 4,
  printScale: 97,
  rowHeight: 16.5
};

interface PrintMarginSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAndPrint: (config: PrintMarginConfig) => void;
  onOpenGuide?: () => void;
}

export const applyPrintMarginStyles = (config: PrintMarginConfig) => {
  if (typeof document === "undefined") return;

  let styleEl = document.getElementById("dynamic-print-margin-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "dynamic-print-margin-style";
    document.head.appendChild(styleEl);
  }

  const css = `
    @media print {
      @page {
        size: A4 portrait !important;
        margin: ${config.topMargin}mm ${config.rightMargin}mm ${config.bottomMargin}mm ${config.leftMargin}mm !important;
      }
      
      #routine-a4-sheet {
        padding: 1mm 2mm 1mm 2mm !important;
        transform: scale(${config.printScale / 100}) !important;
        transform-origin: top center !important;
      }

      #routine-a4-sheet tr {
        height: ${config.rowHeight}px !important;
        max-height: ${config.rowHeight}px !important;
        min-height: ${config.rowHeight}px !important;
      }

      #routine-a4-sheet td {
        height: ${config.rowHeight}px !important;
        max-height: ${config.rowHeight}px !important;
        min-height: ${config.rowHeight}px !important;
      }
    }
  `;

  styleEl.textContent = css;
};

export const PrintMarginSettingsModal: React.FC<PrintMarginSettingsModalProps> = ({
  isOpen,
  onClose,
  onApplyAndPrint,
  onOpenGuide
}) => {
  const [config, setConfig] = useState<PrintMarginConfig>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("print_custom_margins_config");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.topMargin === "number") {
            return parsed;
          }
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PRINT_CONFIG;
  });

  const [activePreset, setActivePreset] = useState<string>("ultra");

  useEffect(() => {
    applyPrintMarginStyles(config);
  }, [config]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: "ultra" | "standard" | "balanced") => {
    setActivePreset(preset);
    let newConf: PrintMarginConfig;
    if (preset === "ultra") {
      newConf = {
        topMargin: 2,
        bottomMargin: 2,
        leftMargin: 3,
        rightMargin: 3,
        printScale: 96,
        rowHeight: 16.2
      };
    } else if (preset === "standard") {
      newConf = {
        topMargin: 4,
        bottomMargin: 4,
        leftMargin: 5,
        rightMargin: 5,
        printScale: 97,
        rowHeight: 16.5
      };
    } else {
      newConf = {
        topMargin: 5,
        bottomMargin: 5,
        leftMargin: 6,
        rightMargin: 6,
        printScale: 95,
        rowHeight: 16.0
      };
    }
    setConfig(newConf);
    try {
      localStorage.setItem("print_custom_margins_config", JSON.stringify(newConf));
    } catch {}
  };

  const handleCustomChange = (field: keyof PrintMarginConfig, value: number) => {
    setActivePreset("custom");
    const updated = { ...config, [field]: value };
    setConfig(updated);
    try {
      localStorage.setItem("print_custom_margins_config", JSON.stringify(updated));
    } catch {}
  };

  const handleReset = () => {
    setConfig(DEFAULT_PRINT_CONFIG);
    setActivePreset("ultra");
    try {
      localStorage.removeItem("print_custom_margins_config");
    } catch {}
  };

  const handleSaveAndPrint = () => {
    try {
      localStorage.setItem("print_custom_margins_config", JSON.stringify(config));
    } catch {}
    applyPrintMarginStyles(config);
    onApplyAndPrint(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/50 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-4 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30 text-indigo-400">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>A4 পেজ মার্জিন ও প্রিন্ট স্কেলিং কাস্টমাইজেশন</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono">
                  Custom Margins
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                প্রিন্টারে তারিখ যেন নিচে কাটা না পড়ে সেজন্য পেজ মার্জিন ও সারির উচ্চতা পরিবর্তন করুন
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* NOTICE BANNER */}
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-xl flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-200 leading-relaxed text-[11.5px]">
                <strong className="text-emerald-300 font-bold">৩১ দিনের সম্পূর্ণ রুটিন ১ পেজে ফিট রাখার টিপস:</strong>
                <p className="text-slate-300 mt-0.5">
                  যদি আপনার প্রিন্টারে (যেমন: Epson L380, Canon, HP) নিচের ৭টি তারিখ বাদ পড়ার ঝুঁকি থাকে, তবে 
                  <strong> "আল্ট্রা-কম্প্যাক্ট (২ মিমি - ৩ মিমি)"</strong> মার্জিন সিলেক্ট করুন। এতে পুরো ৩১ দিনের তালিকা ও স্বাক্ষর নিখুঁতভাবে ১ পৃষ্ঠায় প্রিন্ট হবে।
                </p>
              </div>
            </div>
            {onOpenGuide && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGuide();
                }}
                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>স্কেল গাইড ↗</span>
              </button>
            )}
          </div>

          {/* QUICK PRESET BUTTONS */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 block text-xs">
              ⚡ দ্রুত প্রিসেট সিলেক্ট করুন (Quick Presets):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSelect("ultra")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activePreset === "ultra"
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full font-bold">
                  <span>আল্ট্রা-কম্প্যাক্ট</span>
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black">সেরা</span>
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1">মার্জিন: ২-৩ মিমি • স্কেল: ৯৬%</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect("standard")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activePreset === "standard"
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full font-bold">
                  <span>স্ট্যান্ডার্ড ফিট</span>
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1">মার্জিন: ৪ মিমি • স্কেল: ৯৭%</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect("balanced")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activePreset === "balanced"
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between w-full font-bold">
                  <span>ব্যালেন্সড মার্জিন</span>
                </div>
                <span className="text-[10.5px] text-slate-400 mt-1">মার্জিন: ৫ মিমি • স্কেল: ৯৫%</span>
              </button>
            </div>
          </div>

          {/* DETAILED MARGIN CONTROLS */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>মার্জিন কাস্টমাইজেশন (Custom mm Margins):</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* TOP MARGIN */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  উপরের মার্জিন (Top)
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    step={1}
                    value={config.topMargin}
                    onChange={(e) => handleCustomChange("topMargin", Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-indigo-500/40 rounded px-2 py-1 text-center font-bold text-amber-400 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-[10px]">মিমি</span>
                </div>
              </div>

              {/* BOTTOM MARGIN */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  নিচের মার্জিন (Bottom)
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    step={1}
                    value={config.bottomMargin}
                    onChange={(e) => handleCustomChange("bottomMargin", Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-indigo-500/40 rounded px-2 py-1 text-center font-bold text-amber-400 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-[10px]">মিমি</span>
                </div>
              </div>

              {/* LEFT MARGIN */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  বাম মার্জিন (Left)
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={config.leftMargin}
                    onChange={(e) => handleCustomChange("leftMargin", Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-indigo-500/40 rounded px-2 py-1 text-center font-bold text-amber-400 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-[10px]">মিমি</span>
                </div>
              </div>

              {/* RIGHT MARGIN */}
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  ডান মার্জিন (Right)
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    step={1}
                    value={config.rightMargin}
                    onChange={(e) => handleCustomChange("rightMargin", Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-indigo-500/40 rounded px-2 py-1 text-center font-bold text-amber-400 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-[10px]">মিমি</span>
                </div>
              </div>
            </div>

            {/* SLIDERS FOR PRINT SCALE & ROW HEIGHT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-300 text-[11px]">প্রিন্ট জুম / স্কেল:</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">{config.printScale}%</span>
                </div>
                <input
                  type="range"
                  min={85}
                  max={102}
                  step={1}
                  value={config.printScale}
                  onChange={(e) => handleCustomChange("printScale", Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  স্কেল সামান্য কম রাখলে (যেমন ৯৫%-৯৭%) কোনো তারিখ কাটা পড়বে না।
                </span>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-300 text-[11px]">প্রতিটি সারির উচ্চতা (Row Height):</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">{config.rowHeight} px</span>
                </div>
                <input
                  type="range"
                  min={15.0}
                  max={18.5}
                  step={0.5}
                  value={config.rowHeight}
                  onChange={(e) => handleCustomChange("rowHeight", Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ১৬ থেকে ১৬.৫ পিক্সেল ৩১ দিনের জন্য নিখুঁত।
                </span>
              </div>
            </div>

          </div>

          {/* VISUAL A4 PAPER DIAGRAM */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 bg-white rounded border-2 border-indigo-400 relative shadow-sm flex flex-col justify-between p-1 shrink-0">
                <div className="w-full h-1.5 bg-indigo-200 rounded-2xs" />
                <div className="w-full space-y-0.5">
                  <div className="w-full h-0.5 bg-slate-300" />
                  <div className="w-full h-0.5 bg-slate-300" />
                  <div className="w-full h-0.5 bg-slate-300" />
                  <div className="w-full h-0.5 bg-slate-300" />
                </div>
                <div className="w-1/2 h-1 bg-emerald-300 rounded-2xs" />
              </div>
              <div className="text-slate-300 text-[11px] leading-tight">
                <p className="font-bold text-white">A4 পোর্ট্রেট প্রিভিউ সিঙ্ক সক্রিয়</p>
                <p className="text-slate-400 mt-0.5">
                  টপ: {config.topMargin}mm | বটম: {config.bottomMargin}mm | লেফট: {config.leftMargin}mm | রাইট: {config.rightMargin}mm
                </p>
                <p className="text-emerald-400 font-semibold text-[10px] mt-0.5">
                  ✓ সম্পূর্ণ ৩১টি তারিখ ১ পৃষ্ঠায় সংরক্ষিত হবে
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer border border-slate-700"
              title="ডিফল্ট সেটিংস এ ফেরত যান"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>রিসেট</span>
            </button>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>

          <button
            onClick={handleSaveAndPrint}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40 active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>মার্জিন প্রয়োগ করুন ও এখনই প্রিন্ট দিন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
