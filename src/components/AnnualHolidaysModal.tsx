import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Upload,
  Plus,
  Trash2,
  Download,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Check,
  X,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import {
  SchoolHoliday,
  HOLIDAY_CATEGORY_MAP,
  DEFAULT_BANGLADESH_SCHOOL_HOLIDAYS_2026,
  parseHolidaysFromCSV,
  parseHolidaysFromPlainText,
  exportHolidaysToCSV,
  normalizeDateInput
} from "../holidayData";

interface AnnualHolidaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: SchoolHoliday[];
  onSaveHolidays: (updatedHolidays: SchoolHoliday[]) => Promise<void> | void;
  onApplyHolidaysToRoutineNotes?: (holidays: SchoolHoliday[]) => void;
  currentSelectedMonth: string;
  autoHighlightEnabled: boolean;
  onToggleAutoHighlight: (enabled: boolean) => void;
}

export const AnnualHolidaysModal: React.FC<AnnualHolidaysModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onSaveHolidays,
  onApplyHolidaysToRoutineNotes,
  currentSelectedMonth,
  autoHighlightEnabled,
  onToggleAutoHighlight
}) => {
  const [localHolidays, setLocalHolidays] = useState<SchoolHoliday[]>(holidays);
  const [activeTab, setActiveTab] = useState<"list" | "upload" | "paste" | "add">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // New Holiday Form State
  const [newTitle, setNewTitle] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newCategory, setNewCategory] = useState<SchoolHoliday["category"]>("national");
  const [newDescription, setNewDescription] = useState("");

  // Paste raw text state
  const [pasteText, setPasteText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync prop changes to local state when modal opens
  React.useEffect(() => {
    setLocalHolidays(holidays);
  }, [holidays, isOpen]);

  if (!isOpen) return null;

  const showFeedback = (type: "success" | "error" | "info", text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showFeedback("error", "দয়া করে ছুটির নাম লিখুন!");
      return;
    }
    if (!newStartDate) {
      showFeedback("error", "দয়া করে শুরুর তারিখ নির্বাচন করুন!");
      return;
    }

    const normalizedStart = normalizeDateInput(newStartDate);
    const normalizedEnd = newEndDate ? normalizeDateInput(newEndDate) : normalizedStart;

    const newH: SchoolHoliday = {
      id: `h-manual-${Date.now()}`,
      title: newTitle.trim(),
      startDate: normalizedStart,
      endDate: normalizedEnd,
      category: newCategory,
      description: newDescription.trim() || undefined,
      isGovtHoliday: newCategory === "national" || newCategory === "religious"
    };

    const updated = [...localHolidays, newH].sort((a, b) => a.startDate.localeCompare(b.startDate));
    setLocalHolidays(updated);
    setNewTitle("");
    setNewStartDate("");
    setNewEndDate("");
    setNewDescription("");
    setActiveTab("list");
    showFeedback("success", `"${newH.title}" ছুটির তালিকায় যুক্ত করা হয়েছে। পরিবর্তন সংরক্ষণ করুন।`);
  };

  const handleDelete = (id: string) => {
    const updated = localHolidays.filter(h => h.id !== id);
    setLocalHolidays(updated);
    showFeedback("info", "ছুটির দিনটি তালিকা থেকে অপসারণ করা হয়েছে।");
  };

  const handleLoadPresets = () => {
    if (window.confirm("আপনি কি ২০২৬ শিক্ষাবর্ষের প্রমিত বাৎসরিক ছুটির তালিকা (১৬টি সরকারি ও প্রাতিষ্ঠানিক দিবস) লোড করতে চান? এটি বর্তমান তালিকায় যুক্ত বা আপডেট হবে।")) {
      const existingIds = new Set(localHolidays.map(h => h.startDate + h.title));
      const newItems = DEFAULT_BANGLADESH_SCHOOL_HOLIDAYS_2026.filter(
        d => !existingIds.has(d.startDate + d.title)
      );

      const combined = [...localHolidays, ...newItems].sort((a, b) => a.startDate.localeCompare(b.startDate));
      setLocalHolidays(combined);
      showFeedback("success", "২০২৬ শিক্ষাবর্ষের আদর্শ ছুটির তালিকা সফলভাবে যুক্ত করা হয়েছে!");
      setActiveTab("list");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      try {
        let parsed: SchoolHoliday[] = [];
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            parsed = json.map((item, idx) => ({
              id: item.id || `h-json-${Date.now()}-${idx}`,
              title: item.title || item.name || item.ছুটির_নাম || "ছুটি",
              startDate: normalizeDateInput(item.startDate || item.date || item.তারিখ || ""),
              endDate: normalizeDateInput(item.endDate || item.শেষের_তারিখ || item.startDate || item.date || ""),
              category: item.category || "other",
              description: item.description || item.বিবরণ || undefined
            }));
          }
        } else {
          // CSV or text
          parsed = parseHolidaysFromCSV(content);
          if (parsed.length === 0) {
            parsed = parseHolidaysFromPlainText(content);
          }
        }

        if (parsed.length > 0) {
          const combined = [...localHolidays, ...parsed].sort((a, b) => a.startDate.localeCompare(b.startDate));
          setLocalHolidays(combined);
          showFeedback("success", `সাফল্যের সাথে ${parsed.length}টি ছুটির রেকর্ড ফাইল থেকে লোড করা হয়েছে!`);
          setActiveTab("list");
        } else {
          showFeedback("error", "ফাইল থেকে কোনো বৈধ ছুটির রেকর্ড পাওয়া যায়নি। ফরম্যাট পরীক্ষা করুন।");
        }
      } catch (err) {
        showFeedback("error", "ফাইল প্রসেসিংয়ে ত্রুটি হয়েছে: " + (err instanceof Error ? err.message : String(err)));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePasteParse = () => {
    if (!pasteText.trim()) {
      showFeedback("error", "দয়া করে ছুটির টেক্সট পেস্ট করুন!");
      return;
    }
    const parsed = parseHolidaysFromPlainText(pasteText);
    if (parsed.length > 0) {
      const combined = [...localHolidays, ...parsed].sort((a, b) => a.startDate.localeCompare(b.startDate));
      setLocalHolidays(combined);
      setPasteText("");
      setActiveTab("list");
      showFeedback("success", `পেস্টকৃত টেক্সট থেকে ${parsed.length}টি ছুটির দিন যুক্ত করা হয়েছে!`);
    } else {
      showFeedback("error", "কোনো তারিখ ও ছুটির তথ্য শনাক্ত করা যায়নি। উদাহরণ: '2026-03-26: মহান স্বাধীনতা দিবস'");
    }
  };

  const handleDownloadCSV = () => {
    const csvData = exportHolidaysToCSV(localHolidays);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `school_annual_holidays_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("success", "বাৎসরিক ছুটির তালিকা CSV ফরম্যাটে ডাউনলোড সম্পন্ন হয়েছে!");
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await onSaveHolidays(localHolidays);
      showFeedback("success", "বাৎসরিক ছুটির তালিকা সফলভাবে ক্লাউড ও ডিভাইসে সংরক্ষিত হয়েছে!");
    } catch (err) {
      showFeedback("error", "সংরক্ষণ ব্যর্থ হয়েছে: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoPopulateRoutine = () => {
    if (onApplyHolidaysToRoutineNotes) {
      onApplyHolidaysToRoutineNotes(localHolidays);
      showFeedback("success", `চলতি মাসের (${currentSelectedMonth}) রুটিনের দিনগুলোতে 'ছুটির দিন' নোট স্বয়ংক্রিয়ভাবে প্রয়োগ করা হয়েছে!`);
    }
  };

  // Filtered list
  const filteredHolidays = localHolidays.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.startDate.includes(searchQuery) ||
                          (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === "all" || h.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between border-b border-indigo-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">বিদ্যালয়ের বাৎসরিক ছুটির তালিকা আপলোড ও ব্যবস্থাপনা</h2>
                <span className="text-[10px] bg-amber-300 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-2xs">
                  শিক্ষক ও প্রশাসক প্যানেল
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                বাৎসরিক ছুটির তালিকা আপলোড করুন; রুটিনের নির্দিষ্ট দিনগুলোতে স্বয়ংক্রিয়ভাবে <strong>'ছুটির দিন'</strong> হিসেবে প্রদর্শিত ও হাইলাইট হবে।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Controls & Status Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              বর্তমান রুটিন মাস: <strong className="text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{currentSelectedMonth}</strong>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600 font-semibold">
              মোট সংরক্ষিত ছুটির দিন: <strong className="text-indigo-900 font-mono text-sm">{localHolidays.length}</strong> টি
            </span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-750 select-none">
              <input
                type="checkbox"
                checked={autoHighlightEnabled}
                onChange={(e) => onToggleAutoHighlight(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <span>রুটিনে স্বয়ংক্রিয় ছুটির দিন মার্কিং ও হাইলাইট সক্রিয়</span>
            </label>
          </div>
        </div>

        {/* Feedback Alert if any */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-5 py-2 text-xs font-bold flex items-center gap-2 shrink-0 ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-100 text-emerald-900 border-b border-emerald-300"
                  : feedbackMsg.type === "error"
                  ? "bg-rose-100 text-rose-900 border-b border-rose-300"
                  : "bg-indigo-100 text-indigo-900 border-b border-indigo-300"
              }`}
            >
              {feedbackMsg.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
              {feedbackMsg.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              {feedbackMsg.type === "info" && <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-2 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "list"
                ? "border-indigo-600 text-indigo-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ছুটির তালিকা ও পর্যালোচনা ({localHolidays.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "upload"
                ? "border-indigo-600 text-indigo-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ফাইল আপলোড (.CSV / .JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "paste"
                ? "border-indigo-600 text-indigo-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>দ্রুত টেক্সট পেস্ট</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "add"
                ? "border-indigo-600 text-indigo-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ছুটি যুক্ত করুন</span>
          </button>

          <div className="ml-auto flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={handleLoadPresets}
              className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 rounded-lg hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer shadow-2xs"
              title="২০২৬ সালের জাতীয় ও শিক্ষাবোর্ডের আদর্শ ছুটির তালিকা লোড করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>বাৎসরিক প্রিসেট লোড</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-50/50">
          {/* TAB 1: LIST VIEW */}
          {activeTab === "list" && (
            <div className="space-y-3.5">
              {/* Search & Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ছুটির নাম, তারিখ (যেমন: 2026-03-26) দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="all">সকল ক্যাটাগরি</option>
                    <option value="national">জাতীয় দিবস</option>
                    <option value="religious">ধর্মীয় ছুটি</option>
                    <option value="vacation">বার্ষিক অবকাশ</option>
                    <option value="institutional">প্রাতিষ্ঠানিক ছুটি</option>
                    <option value="other">অন্যান্য ছুটি</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="CSV ডাউনলোড করুন"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>CSV রপ্তানি</span>
                  </button>
                </div>
              </div>

              {/* Holiday Items Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {filteredHolidays.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold">
                      {localHolidays.length === 0
                        ? "কোনো ছুটির তালিকা পাওয়া যায়নি। দয়া করে প্রিসেট লোড করুন অথবা CSV ফাইল আপলোড করুন।"
                        : "খোঁজা অনুযায়ী কোনো ছুটির দিন পাওয়া যায়নি।"}
                    </p>
                    {localHolidays.length === 0 && (
                      <button
                        type="button"
                        onClick={handleLoadPresets}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 mx-auto cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>২০২৬ সালের আদর্শ ছুটির তালিকা লোড করুন</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black">
                          <th className="py-2.5 px-3 w-10 text-center">#</th>
                          <th className="py-2.5 px-3 w-32">তারিখ / সময়সীমা</th>
                          <th className="py-2.5 px-3">ছুটির নাম ও বিবরণ</th>
                          <th className="py-2.5 px-3 w-28 text-center">ধরণ</th>
                          <th className="py-2.5 px-3 w-16 text-center">মুছুন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {filteredHolidays.map((h, index) => {
                          const cat = HOLIDAY_CATEGORY_MAP[h.category] || HOLIDAY_CATEGORY_MAP.other;
                          const isMultiDay = h.endDate && h.endDate !== h.startDate;

                          return (
                            <tr key={h.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                {index + 1}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-950">
                                <div className="flex flex-col">
                                  <span>{h.startDate}</span>
                                  {isMultiDay && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      হতে {h.endDate}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-900 text-[13px]">{h.title}</span>
                                  {h.description && (
                                    <span className="text-[11px] text-slate-500 mt-0.5">{h.description}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black border ${cat.bgBadge} ${cat.textBadge} ${cat.borderBadge}`}>
                                  {cat.label}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(h.id)}
                                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition mx-auto cursor-pointer"
                                  title="তালিকা থেকে মুছুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FILE UPLOAD */}
          {activeTab === "upload" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-250 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">বাৎসরিক ছুটির তালিকা ফাইল আপলোড করুন</h3>
                  <p className="text-xs text-slate-500">
                    বিদ্যালয়ের বার্ষিক ক্যালেন্ডারযুক্ত <strong>CSV</strong>, <strong>JSON</strong> বা <strong>TXT</strong> ফাইল সিলেক্ট করুন।
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.json,.txt"
                  className="hidden"
                  id="holiday-file-input"
                />

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ফাইল বেছে নিন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>নমুনা CSV ডাউনলোড</span>
                  </button>
                </div>
              </div>

              {/* Format instruction */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>CSV ফাইলের কলাম বিন্যাস:</span>
                </p>
                <code className="block p-2.5 bg-white border border-amber-200 rounded text-[11px] font-mono text-slate-800">
                  তারিখ, ছুটির নাম, শেষের তারিখ (ঐচ্ছিক), ধরণ (জাতীয়/ধর্মীয়/অবকাশ), বিবরণ<br />
                  2026-02-21, শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস, 2026-02-21, জাতীয়, একুশে ফেব্রুয়ারি<br />
                  2026-03-26, মহান স্বাধীনতা ও জাতীয় দিবস, 2026-03-26, জাতীয়, স্বাধীনতা দিবস<br />
                  2026-03-29, পবিত্র ঈদ-উল-ফিতর অবকাশ, 2026-04-03, অবকাশ, ঈদ অবকাশ
                </code>
              </div>
            </div>
          )}

          {/* TAB 3: QUICK PASTE */}
          {activeTab === "paste" && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  বিদ্যালয়ের নোটিশ বা ছুটির তালিকা পেস্ট করুন (প্রতি লাইনে একটি ছুটি):
                </label>
                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`2026-02-21: শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস (জাতীয়)&#10;2026-03-17: জাতীয় শিশু দিবস&#10;2026-03-26: মহান স্বাধীনতা ও জাতীয় দিবস&#10;14-04-2026: পহেলা বৈশাখ (বাংলা নববর্ষ)`}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    ফরম্যাট: <code className="bg-slate-100 px-1 py-0.5 rounded">তারিখ : ছুটির নাম</code>
                  </span>

                  <button
                    type="button"
                    onClick={handlePasteParse}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>তালিকা রূপান্তর ও যোগ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADD SINGLE HOLIDAY */}
          {activeTab === "add" && (
            <form onSubmit={handleAddNew} className="space-y-4 max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-black text-slate-900 border-l-4 border-indigo-600 pl-2.5">
                নতুন একক বা দীর্ঘ ছুটির দিন যুক্ত করুন
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ছুটির নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: বিদ্যালয়ের বার্ষিক ক্রীড়া প্রতিযোগিতা অবকাশ"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    শুরুর তারিখ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    শেষের তারিখ (দীর্ঘ ছুটির জন্য ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    ছুটির ধরণ
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as SchoolHoliday["category"])}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
                  >
                    <option value="national">জাতীয় দিবস</option>
                    <option value="religious">ধর্মীয় ছুটি</option>
                    <option value="vacation">বার্ষিক/ঋতুভিত্তিক অবকাশ</option>
                    <option value="institutional">প্রাতিষ্ঠানিক ছুটি</option>
                    <option value="other">অন্যান্য ছুটি</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    বিবরণ বা মন্তব্য (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="বিশেষ নির্দেশনা বা উদ্‌যাপন সূচি"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>তালিকায় যোগ করুন</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onApplyHolidaysToRoutineNotes && (
              <button
                type="button"
                onClick={handleAutoPopulateRoutine}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="চলতি মাসের রুটিনের নির্দিষ্ট দিনগুলোতে ছুটির নাম লিখে দিন"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>চলতি মাসের রুটিনের নোটে প্রয়োগ</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বন্ধ করুন
            </button>

            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>ক্লাউডে সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                  <span>💾 বাৎসরিক ছুটির তালিকা সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
