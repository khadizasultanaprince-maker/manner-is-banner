import React, { useState } from "react";
import { 
  Printer, 
  X, 
  HelpCircle, 
  CheckCircle2, 
  Percent, 
  Sliders, 
  Sparkles, 
  AlertTriangle, 
  Settings2, 
  FileText, 
  ChevronRight,
  Monitor,
  ExternalLink
} from "lucide-react";

interface PrintingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMarginSettings?: () => void;
  onPrintNow: () => void;
}

export const PrintingGuideModal: React.FC<PrintingGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenMarginSettings,
  onPrintNow
}) => {
  const [activeTab, setActiveTab] = useState<"scale" | "browser" | "printer">("scale");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/50 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-4 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>A4 প্রিন্টিং ও ব্রাউজার স্কেলিং গাইড</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Scale Guide
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                তারিখ, বার বা কলাম যেন নিচে কেটে না যায় সেজন্য ব্রাউজার প্রিন্ট ডায়ালগের ৩টি সহজ সেটিংস
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

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab("scale")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "scale"
                ? "bg-slate-900 text-amber-300 border-t-2 border-amber-400 font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>১. স্কেল (Scale) কমানোর নিয়ম</span>
          </button>

          <button
            onClick={() => setActiveTab("browser")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "browser"
                ? "bg-slate-900 text-amber-300 border-t-2 border-amber-400 font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>২. প্রিন্ট ডায়ালগ সেটিংস চেকলিস্ট</span>
          </button>

          <button
            onClick={() => setActiveTab("printer")}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "printer"
                ? "bg-slate-900 text-amber-300 border-t-2 border-amber-400 font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>৩. মাসভিত্তিক স্কেল চার্ট</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs flex-1">
          
          {/* TAB 1: HOW TO REDUCE SCALE */}
          {activeTab === "scale" && (
            <div className="space-y-4">
              
              {/* HIGHLIGHT BANNER */}
              <div className="bg-amber-950/60 border border-amber-500/50 p-3.5 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-200 text-xs leading-relaxed">
                  <strong className="text-amber-300 text-sm font-bold block mb-0.5">
                    তারিখ নিচে কাটা পড়ার মূল কারণ এবং ১০ সেকেন্ডের সমাধান:
                  </strong>
                  কম্পিউটারের ব্রাউজারে ডিফল্ট স্কেল থাকে <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-bold">100%</code>। 
                  ৩১ দিনের রুটিনের ক্ষেত্রে আপনার প্রিন্টার (যেমন Epson, Canon, HP) পেপারের নিচের অংশকে মার্জিনের বাইরে মনে করে কেটে দেয়। 
                  স্কেল মাত্র <strong className="text-emerald-400 font-bold">90% থেকে 95%</strong> এ নামিয়ে দিলেই সম্পূর্ণ ৩১টি দিন ও নিচের স্বাক্ষর <strong>১ম পেজে ম্যাজিকের মতো ফিট হয়ে যায়!</strong>
                </div>
              </div>

              {/* STEP BY STEP GUIDE WITH VISUAL MOCKUP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* LEFT: STEP BY STEP INSTRUCTIONS */}
                <div className="space-y-2.5">
                  <h3 className="font-black text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>ধাপগুলো অনুসরণ করুন:</span>
                  </h3>

                  {/* STEP 1 */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                        ১
                      </span>
                      <h4 className="font-bold text-white text-xs">
                        "More settings" (আরও সেটিংস) এ ক্লিক করুন
                      </h4>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-7">
                      প্রিন্ট ডায়ালগ ওপেন হলে ডানদিকের প্যানেলে নিচের দিকে থাকা <strong className="text-amber-300">More settings ⌵</strong> অপশনে ক্লিক করে অপশনগুলো বড় করুন।
                    </p>
                  </div>

                  {/* STEP 2 */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                        ২
                      </span>
                      <h4 className="font-bold text-emerald-300 text-xs">
                        Scale অপশনে "Custom" নির্বাচন করে 90% বা 95% লিখুন
                      </h4>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-7">
                      <strong className="text-white">Scale</strong> ড্রপডাউনে "Default" এর বদলে <strong className="text-emerald-300">"Custom"</strong> বেছে নিন এবং পাশের বক্সে <strong className="text-emerald-400 font-mono font-bold text-xs bg-black/60 px-1.5 py-0.5 rounded">95</strong> অথবা <strong className="text-emerald-400 font-mono font-bold text-xs bg-black/60 px-1.5 py-0.5 rounded">92</strong> টাইপ করুন।
                    </p>
                  </div>

                  {/* STEP 3 */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-black flex items-center justify-center text-[10px]">
                        ৩
                      </span>
                      <h4 className="font-bold text-white text-xs">
                        Margins অপশনে "Minimum" দিন
                      </h4>
                    </div>
                    <p className="text-slate-300 text-[11px] pl-7">
                      <strong className="text-white">Margins</strong> ড্রপডাউন থেকে <strong className="text-indigo-300">"Minimum"</strong> (সর্বনিম্ন) বা "None" সিলেক্ট করুন যাতে পেজের উপরের ও নিচের সাদা ফাঁকা জায়গা কমে আসে।
                    </p>
                  </div>
                </div>

                {/* RIGHT: INTERACTIVE BROWSER PRINT PREVIEW SIMULATOR */}
                <div className="bg-slate-950 p-3.5 rounded-xl border-2 border-indigo-500/40 space-y-2.5 font-mono text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5 font-sans">
                      <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ব্রাউজার প্রিন্ট ডায়ালগ চিত্র (Preview)</span>
                    </span>
                    <span className="text-[9.5px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Chrome / Edge</span>
                  </div>

                  {/* Simulated Printer UI rows */}
                  <div className="space-y-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center py-1 border-b border-slate-800/70">
                      <span className="text-slate-400">Destination:</span>
                      <span className="text-slate-200 font-bold truncate max-w-[140px]">EPSON L380 / Canon...</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/70">
                      <span className="text-slate-400">Pages:</span>
                      <span className="text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/40">Custom: 1 (শুধু ১ম পেজ)</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/70">
                      <span className="text-slate-400">Paper size:</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/40">A4 (210 x 297 mm) ✓</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-800/70">
                      <span className="text-slate-400">Margins:</span>
                      <span className="text-indigo-300 font-bold bg-indigo-500/20 px-1.5 py-0.2 rounded border border-indigo-500/40">Minimum (সর্বনিম্ন) ✓</span>
                    </div>

                    {/* Scale Row Highlighted */}
                    <div className="flex justify-between items-center py-1.5 bg-emerald-950/60 p-2 rounded-md border-2 border-emerald-500/80 animate-pulse">
                      <div className="flex items-center gap-1 text-emerald-300 font-bold">
                        <span>Scale:</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold bg-emerald-600 px-2 py-0.5 rounded text-xs">Custom: 95%</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-1 text-slate-400">
                      <span>Options:</span>
                      <span className="text-slate-200">☑ Background graphics</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-slate-400 font-sans italic">
                    💡 উপরের সেটিংসে প্রিন্ট দিলে ১ থেকে ৩১ তারিখ ও স্বাক্ষর সম্পূর্ণ দৃশ্যমান থাকবে।
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: COMPLETE PRINT CHECKLIST */}
          {activeTab === "browser" && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-200 text-xs">
                প্রিন্ট করার সময় এই ৪টি চেকলিস্ট নিশ্চিত করুন:
              </h3>

              <div className="space-y-2">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">১. পেপার সাইজ সবসময় "A4" নির্বাচন করুন</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      অনেক সময় ব্রাউজারে ডিফল্টভাবে 'Letter' সাইজ থাকে। Letter সাইজ A4 এর চেয়ে খাটো হওয়ায় নিচে তারিখ কাটা পড়তে পারে। তাই অবশ্যই <strong className="text-amber-300">Paper size: A4</strong> নির্বাচন করবেন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">২. "Background graphics" বক্সে টিক চিহ্ন দিন</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      টেবিল হেডারের চমৎকার রং, রঙিন ব্যাজ এবং বর্ডারগুলো প্রিন্টারে নিখুঁতভাবে পেতে Options সেকশন থেকে <strong className="text-emerald-300">Background graphics</strong> চেকবক্সে টিক দিন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">৩. কত পৃষ্ঠা প্রিন্ট করবেন (Pages)?</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      রুটিনের পেজ মোট ২টি:
                      <br />• <strong>১ম পেজ:</strong> শিক্ষার্থীর পূর্ণাঙ্গ ৩১ দিনের শিষ্টাচার ও পড়ার রুটিন।
                      <br />• <strong>২য় পেজ:</strong> অভিভাবকদের প্রতি বিশেষ ৫টি নির্দেশনা ও অঙ্গীকার পত্র।
                      <br />আপনি শুধু রুটিন প্রিন্ট করতে চাইলে <strong className="text-amber-300">Pages: Custom → 1</strong> দিন।
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-xs block">৪. নতুন ট্যাবে ওপেন করে প্রিন্ট দেওয়া</strong>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      যদি কোনো কারণে প্রিন্ট ডায়ালগ পপআপ ব্লক হয়ে যায়, তবে উপরের ডানদিকের <strong className="text-amber-300">"↗ নতুন ট্যাবে খুলুন"</strong> বাটনে ক্লিক করে ফুল উইন্ডোতে ওপেন করে প্রিন্ট করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTHLY SCALE CHEATSHEET */}
          {activeTab === "printer" && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-200 text-xs">
                📅 কোন মাসের জন্য কত স্কেল (Scale) ব্যবহার করবেন:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-slate-800/70 rounded-xl border border-indigo-500/40">
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                    ৩১ দিনের মাসসমূহ
                  </span>
                  <h4 className="font-bold text-white text-xs mt-1.5">জানুয়ারি, মার্চ, মে, জুলাই, আগস্ট, অক্টোবর, ডিসেম্বর</h4>
                  <div className="mt-2 text-center p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">সুপারিশকৃত স্কেল:</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">92% - 95%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    ৩১টি সারি ও অভিভাবকের স্বাক্ষর ১ পৃষ্ঠায় সম্পূর্ণ সুরক্ষিত থাকে।
                  </p>
                </div>

                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    ৩০ দিনের মাসসমূহ
                  </span>
                  <h4 className="font-bold text-white text-xs mt-1.5">এপ্রিল, জুন, সেপ্টেম্বর, নভেম্বর</h4>
                  <div className="mt-2 text-center p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">সুপারিশকৃত স্কেল:</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">95% - 97%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    ৩০টি সারির জন্য ৯৬% স্কেলে চমৎকার বড় বড় ফন্ট পাওয়া যায়।
                  </p>
                </div>

                <div className="p-3 bg-slate-800/70 rounded-xl border border-slate-700">
                  <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    ফেব্রুয়ারি মাস
                  </span>
                  <h4 className="font-bold text-white text-xs mt-1.5">২৮ বা ২৯ দিন</h4>
                  <div className="mt-2 text-center p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">সুপারিশকৃত স্কেল:</span>
                    <span className="text-emerald-400 font-mono font-black text-sm">98% - 100%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    দিন কম হওয়ায় ফুল ১০০% স্কেলেও কোনো কিছু কাটে না।
                  </p>
                </div>
              </div>

              {/* QUICK IN-APP MARGIN LINK */}
              {onOpenMarginSettings && (
                <div className="bg-indigo-950/50 p-3 rounded-xl border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-indigo-300 text-xs block">ইন-অ্যাপ মার্জিন কাস্টমাইজেশন টুল ব্যবহার করতে চান?</span>
                    <span className="text-slate-300 text-[11px]">আমাদের সিস্টেমে ৩ মিমি ও ৫ মিমি মার্জিনের বিল্ট-ইন টুল রয়েছে।</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMarginSettings();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>মার্জিন সেটিংসে যান</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            বন্ধ করুন
          </button>

          <button
            onClick={() => {
              onClose();
              onPrintNow();
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-650 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-950/60 active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>বুঝতে পেরেছি, প্রিন্ট ডায়ালগ খুলুন</span>
          </button>
        </div>

      </div>
    </div>
  );
};
