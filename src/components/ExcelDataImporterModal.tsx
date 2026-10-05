import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Download, 
  RefreshCw, 
  HelpCircle, 
  Users, 
  X, 
  Copy, 
  ArrowRight,
  Database,
  Check,
  FileText
} from "lucide-react";
import { 
  Student, 
  studentsByClass, 
  saveCustomStudents, 
  resetToDefaultStudents, 
  hasCustomStudents,
  DEFAULT_STUDENTS_BY_CLASS
} from "../studentsData";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface ExcelDataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

// Convert English numbers to Bengali numerals
function toBnNum(val: number | string): string {
  const map: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯"
  };
  return val.toString().replace(/[0-9]/g, (w) => map[w] || w);
}

// Normalize Bengali to English numerals
function fromBnNum(val: number | string): string {
  const map: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  return val.toString().replace(/[০-৯]/g, (w) => map[w] || w);
}

// Map sheet name to standard class name
function normalizeSheetToClassName(sheetName: string): string {
  const s = sheetName.trim().toLowerCase();
  
  if (s.includes("প্লে") || s.includes("play")) return "প্লে";
  if (s.includes("নার্সারি") || s.includes("নার্সারী") || s.includes("nursery") || s.includes("nur")) return "নার্সারি";
  if (s.includes("কেজি") || s.includes("kg")) return "কেজি";
  
  if (s.includes("প্রথম") || s.includes("১ম") || s.includes("1st") || s.includes("class 1") || s.includes("one")) return "প্রথম";
  if (s.includes("দ্বিতীয়") || s.includes("২য়") || s.includes("2nd") || s.includes("class 2") || s.includes("two")) return "দ্বিতীয়";
  if (s.includes("তৃতীয়") || s.includes("৩য়") || s.includes("3rd") || s.includes("class 3") || s.includes("three")) return "তৃতীয়";
  if (s.includes("চতুর্থ") || s.includes("৪র্থ") || s.includes("4th") || s.includes("class 4") || s.includes("four")) return "চতুর্থ";
  if (s.includes("পঞ্চম") || s.includes("৫ম") || s.includes("5th") || s.includes("class 5") || s.includes("five")) return "পঞ্চম";
  if (s.includes("ষষ্ঠ") || s.includes("৬ষ্ঠ") || s.includes("6th") || s.includes("class 6") || s.includes("six")) return "ষষ্ঠ";
  if (s.includes("সপ্তম") || s.includes("৭ম") || s.includes("7th") || s.includes("class 7") || s.includes("seven")) return "সপ্তম";
  if (s.includes("অষ্টম") || s.includes("৮ম") || s.includes("8th") || s.includes("class 8") || s.includes("eight")) return "অষ্টম";
  if (s.includes("নবম") || s.includes("৯ম") || s.includes("9th") || s.includes("class 9") || s.includes("nine")) return "নবম";
  if (s.includes("দশম") || s.includes("১০ম") || s.includes("10th") || s.includes("class 10") || s.includes("ten")) return "দশম";

  // If simple numeric sheet names like "1", "2", "3"
  const cleanDigits = fromBnNum(s).replace(/[^0-9]/g, "");
  if (cleanDigits === "1") return "প্রথম";
  if (cleanDigits === "2") return "দ্বিতীয়";
  if (cleanDigits === "3") return "তৃতীয়";
  if (cleanDigits === "4") return "চতুর্থ";
  if (cleanDigits === "5") return "পঞ্চম";
  if (cleanDigits === "6") return "ষষ্ঠ";
  if (cleanDigits === "7") return "সপ্তম";
  if (cleanDigits === "8") return "অষ্টম";
  if (cleanDigits === "9") return "নবম";
  if (cleanDigits === "10") return "দশম";

  return sheetName.trim();
}

interface ParsedSheet {
  sheetName: string;
  mappedClass: string;
  students: Student[];
  originalRowCount: number;
}

export const ExcelDataImporterModal: React.FC<ExcelDataImporterModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeMode, setActiveMode] = useState<"upload" | "paste" | "guide">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([]);
  const [selectedPreviewClass, setSelectedPreviewClass] = useState<string>("");
  const [isConfirmingWipe, setIsConfirmingWipe] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Manual paste state
  const [pasteClass, setPasteClass] = useState<string>("প্লে");
  const [pasteText, setPasteText] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process uploaded Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processExcelFile(selectedFile);
  };

  const processExcelFile = async (uploadedFile: File) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setFile(uploadedFile);
    setParsedSheets([]);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("এক্সেল ফাইলে কোনো শিট পাওয়া যায়নি।");
      }

      const results: ParsedSheet[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        // Convert sheet to row arrays
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (!rows || rows.length === 0) continue;

        // Smart column detection
        let rollColIdx = -1;
        let nameColIdx = -1;
        let dataStartRowIdx = 0;

        // Check first 15 rows for header row
        for (let r = 0; r < Math.min(rows.length, 15); r++) {
          const row = rows[r];
          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || "").trim().toLowerCase();
            
            // Check for Roll header
            if (
              (cellVal.includes("রোল") || cellVal.includes("roll") || cellVal.includes("sl") || 
               cellVal.includes("ক্রমিক") || cellVal === "নং" || cellVal === "id") && 
              rollColIdx === -1
            ) {
              rollColIdx = c;
            }
            
            // Check for Name header
            if (
              (cellVal.includes("নাম") || cellVal.includes("name") || cellVal.includes("শিক্ষার্থী") || 
               cellVal.includes("student")) && 
              nameColIdx === -1
            ) {
              nameColIdx = c;
            }
          }

          if (rollColIdx !== -1 && nameColIdx !== -1) {
            dataStartRowIdx = r + 1;
            break;
          }
        }

        // Fallback: If no header row explicitly found, guess column 0 = roll, column 1 = name
        if (rollColIdx === -1 || nameColIdx === -1) {
          rollColIdx = 0;
          nameColIdx = 1;
          dataStartRowIdx = 0;
        }

        // Extract student records
        const students: Student[] = [];
        let autoRoll = 1;

        for (let r = dataStartRowIdx; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          let rawRoll = String(row[rollColIdx] || "").trim();
          let rawName = String(row[nameColIdx] || "").trim();

          // If name is empty, also check subsequent columns in case column index shifted
          if (!rawName) {
            for (let c = 0; c < row.length; c++) {
              if (c !== rollColIdx && String(row[c] || "").trim().length > 1) {
                const val = String(row[c]).trim();
                // Check if it's text (not purely numbers)
                if (/[a-zA-Z\u0980-\u09FF]/.test(val) && !val.includes("উপস্থিত") && !val.includes("মোট")) {
                  rawName = val;
                  break;
                }
              }
            }
          }

          // Skip summary or footer rows
          if (
            rawName.includes("মোট") || 
            rawName.includes("স্বাক্ষর") || 
            rawName.includes("মন্তব্য") || 
            rawName.includes("উপস্থিতি") ||
            rawName.includes("Total")
          ) {
            continue;
          }

          if (rawName && rawName.length > 0) {
            // Clean roll number
            let rollStr = "";
            const numOnly = rawRoll.replace(/[^0-9০-৯]/g, "");
            if (numOnly) {
              rollStr = toBnNum(fromBnNum(numOnly));
            } else {
              rollStr = toBnNum(autoRoll);
            }
            autoRoll++;

            // Clean student name
            const cleanedName = rawName.replace(/^[\d\.\-\s]+/, "").trim();
            if (cleanedName.length > 0) {
              students.push({
                roll: rollStr,
                name: cleanedName
              });
            }
          }
        }

        const mappedClass = normalizeSheetToClassName(sheetName);

        results.push({
          sheetName,
          mappedClass,
          students,
          originalRowCount: rows.length
        });
      }

      if (results.length === 0) {
        throw new Error("এক্সেল শিট থেকে কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। ফাইলের ফরম্যাট ঠিক আছে কিনা দেখে নিন।");
      }

      setParsedSheets(results);
      setSelectedPreviewClass(results[0]?.mappedClass || "");
      setSuccessMsg(`অভিনন্দন! আপনার এক্সেল ফাইল থেকে ${toBnNum(results.length)}টি শিটের তথ্য সফলভাবে শনাক্ত করা হয়েছে।`);
    } catch (err: any) {
      console.error("Excel parse error:", err);
      setErrorMsg(err.message || "এক্সেল ফাইল পড়তে সমস্যা হয়েছে। দয়া করে সঠিক .xlsx বা .xls ফাইল দিন।");
    } finally {
      setIsLoading(false);
    }
  };

  // Process manual paste text
  const handleProcessPasteText = () => {
    if (!pasteText.trim()) {
      setErrorMsg("দয়া করে টেক্সট বক্সে রোল ও নামের তালিকা পেস্ট করুন।");
      return;
    }

    const lines = pasteText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const newStudents: Student[] = [];
    let autoRoll = 1;

    for (const line of lines) {
      // Split by tab, comma, dash or multiple spaces
      let parts = line.split(/\t/);
      if (parts.length < 2) parts = line.split(/[,;|]/);
      if (parts.length < 2) {
        const spaceMatch = line.match(/^([০-৯0-9]+)[\.\-\s]+(.*)$/);
        if (spaceMatch) {
          parts = [spaceMatch[1], spaceMatch[2]];
        }
      }

      let roll = "";
      let name = "";

      if (parts.length >= 2) {
        roll = toBnNum(fromBnNum(parts[0].trim().replace(/[^0-9০-৯]/g, ""))) || toBnNum(autoRoll);
        name = parts[1].trim();
      } else {
        roll = toBnNum(autoRoll);
        name = line.replace(/^[\d\.\-\s]+/, "").trim();
      }

      if (name && !name.includes("মোট") && !name.includes("স্বাক্ষর")) {
        newStudents.push({ roll, name });
        autoRoll++;
      }
    }

    if (newStudents.length === 0) {
      setErrorMsg("কোনো শিক্ষার্থীর নাম পাওয়া যায়নি। ফরম্যাট চেক করে আবার পেস্ট করুন।");
      return;
    }

    // Merge or add to parsedSheets
    setParsedSheets(prev => {
      const filtered = prev.filter(p => p.mappedClass !== pasteClass);
      return [
        ...filtered,
        {
          sheetName: `কপি-পেস্ট (${pasteClass})`,
          mappedClass: pasteClass,
          students: newStudents,
          originalRowCount: lines.length
        }
      ];
    });

    setSelectedPreviewClass(pasteClass);
    setPasteText("");
    setSuccessMsg(`"${pasteClass}" শ্রেণির ${toBnNum(newStudents.length)} জন শিক্ষার্থীর তথ্য সফলভাবে প্রস্তুত করা হয়েছে।`);
  };

  // Perform full wipe and replace
  const handleExecuteWipeAndReplace = async () => {
    if (parsedSheets.length === 0) {
      setErrorMsg("প্রতিস্থাপন করার জন্য কোনো ডেটা পাওয়া যায়নি। আগে এক্সেল ফাইল আপলোড করুন।");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      // Build new dataset
      const newDataset: Record<string, Student[]> = {};

      for (const item of parsedSheets) {
        const cls = item.mappedClass.trim();
        if (!cls) continue;
        newDataset[cls] = item.students;
      }

      // Also ensure alias for নার্সারি/নার্সারী
      if (newDataset["নার্সারি"] && !newDataset["নার্সারী"]) {
        newDataset["নার্সারী"] = newDataset["নার্সারি"];
      }

      // 1. Save to localStorage & in-memory studentsByClass
      saveCustomStudents(newDataset);

      // 2. Sync to Firebase Firestore so it's permanently stored in the project
      try {
        const rosterRef = doc(db, "students", "classes_roster");
        await setDoc(rosterRef, {
          id: "classes_roster",
          classes: Object.keys(newDataset),
          data: newDataset,
          totalClasses: Object.keys(newDataset).length,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (fbErr) {
        console.warn("Firestore sync optional warning:", fbErr);
      }

      const totalCount = Object.values(newDataset).reduce((acc, s) => acc + s.length, 0);

      setIsConfirmingWipe(false);
      const doneMsg = `সফল হয়েছে! পুরনো সমস্ত তথ্য বাতিল করে নতুন ${toBnNum(Object.keys(newDataset).length)}টি শ্রেণির মোট ${toBnNum(totalCount)} জন শিক্ষার্থীর হাজিরা তালিকা সফলভাবে প্রতিস্থাপন ও পুনর্গঠন করা হয়েছে।`;
      setSuccessMsg(doneMsg);
      if (onSuccess) onSuccess(doneMsg);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMsg("ডেটা সংরক্ষণ করতে সমস্যা হয়েছে: " + (err.message || "অজানা ত্রুটি"));
    } finally {
      setIsSaving(false);
    }
  };

  // Restore factory defaults
  const handleResetToDefault = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে বর্তমান কাস্টম ডেটা মুছে প্রাথমিক ডিফল্ট তালিকায় ফেরত যেতে চান?")) {
      resetToDefaultStudents();
      setParsedSheets([]);
      setSuccessMsg("সকল ডেটা প্রাথমিক ডিফল্ট তালিকায় সফলভাবে পুনঃস্থাপন করা হয়েছে।");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  // Generate and download a sample 10-class Excel file
  const handleDownloadSampleExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const sampleClasses = [
        "প্লে", "নার্সারি", "কেজি", "প্রথম", "দ্বিতীয়", 
        "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম"
      ];

      for (const cls of sampleClasses) {
        const list = DEFAULT_STUDENTS_BY_CLASS[cls] || [
          { roll: "১", name: "নমুনা শিক্ষার্থী ১" },
          { roll: "২", name: "নমুনা শিক্ষার্থী ২" }
        ];

        const sheetData = [
          ["ডি-লিকন মডেল একাডেমী"],
          [`শ্রেণি: ${cls} - শিক্ষার্থীর মাসিক হাজিরা খাতা`],
          [""],
          ["রোল নং", "শিক্ষার্থীর নাম", "১", "২", "৩", "৪", "৫", "মন্তব্য"]
        ];

        for (const s of list) {
          sheetData.push([s.roll, s.name, "", "", "", "", "", ""]);
        }

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, cls);
      }

      XLSX.writeFile(wb, "ডি-লিকন_মডেল_একাডেমী_১০টি_শ্রেণির_হাজিরা_খাতা_নমুনা.xlsx");
    } catch (err) {
      console.error("Download error:", err);
      alert("নমুনা ফাইল ডাউনলোডে সমস্যা হয়েছে।");
    }
  };

  const currentPreviewSheet = parsedSheets.find(p => p.mappedClass === selectedPreviewClass) || parsedSheets[0];
  const totalStudentsInParsed = parsedSheets.reduce((sum, p) => sum + p.students.length, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/40 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 p-4 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 rounded-xl border border-indigo-400/30 text-indigo-400">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>১০টি শ্রেণির এক্সেল ফাইল আপলোড ও তথ্য প্রতিস্থাপন</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Excel Reorganizer
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                পুরনো সব তথ্য সম্পূর্ণ বাতিল করে আপনার ১০টি শিটের এক্সেল ফাইল থেকে তথ্য পুনর্গঠন করুন
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveMode("upload")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === "upload"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>১. এক্সেল ফাইল আপলোড (.xlsx)</span>
          </button>

          <button
            onClick={() => setActiveMode("paste")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === "paste"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>২. সরাসরি কপি-পেস্ট (Quick Paste)</span>
          </button>

          <button
            onClick={() => setActiveMode("guide")}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeMode === "guide"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>৩. চ্যাটে ফাইল দেওয়ার নিয়ম ও সাহায্য</span>
          </button>
        </div>

        {/* ALERTS */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BODY */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* TAB 1: FILE UPLOAD */}
          {activeMode === "upload" && (
            <div className="space-y-4">
              
              {/* Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/40 hover:border-emerald-400 bg-slate-950/40 hover:bg-indigo-950/20 p-6 rounded-2xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 group-hover:bg-emerald-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 group-hover:text-emerald-400 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-200 group-hover:text-white">
                    আপনার ১০টি আলাদা ক্লাসের শিট সংবলিত এক্সেল ফাইলটি ড্রপ করুন বা ক্লিক করে সিলেক্ট করুন
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    সমর্থিত ফরম্যাট: .xlsx, .xls, .csv (প্রতিটি শিট থেকে স্বয়ংক্রিয়ভাবে রোল ও নাম পড়া হবে)
                  </p>
                </div>
                {file && (
                  <div className="mt-2 text-xs font-mono bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-400/30 text-indigo-300 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>সিলেক্টেড ফাইল: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Sample Excel Helper */}
              <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>১০টি ক্লাসের আদর্শ হাজিরা খাতার নমুনা এক্সেল ফরম্যাট দেখতে চান?</span>
                </div>
                <button
                  onClick={handleDownloadSampleExcel}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>নমুনা এক্সেল ডাউনলোড</span>
                </button>
              </div>

              {/* Parsed sheets view */}
              {parsedSheets.length > 0 && (
                <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-sm text-white">
                        শনাক্তকৃত ১০টি শিটের তালিকা (মোট {toBnNum(totalStudentsInParsed)} জন শিক্ষার্থী)
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      {toBnNum(parsedSheets.length)}টি ক্লাস প্রস্তুত
                    </span>
                  </div>

                  {/* Class chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {parsedSheets.map((ps) => {
                      const isSelected = selectedPreviewClass === ps.mappedClass;
                      return (
                        <button
                          key={ps.sheetName}
                          onClick={() => setSelectedPreviewClass(ps.mappedClass)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-400 text-white shadow-md"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
                          }`}
                        >
                          <span>{ps.mappedClass}</span>
                          <span className="text-[10px] bg-black/40 px-1.5 py-0.2 rounded-full font-mono text-emerald-300">
                            {toBnNum(ps.students.length)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preview table of active selected sheet */}
                  {currentPreviewSheet && (
                    <div className="mt-2 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90">
                      <div className="bg-slate-800/80 px-3 py-2 flex items-center justify-between text-xs font-bold border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">শ্রেণি: {currentPreviewSheet.mappedClass}</span>
                          <span className="text-slate-400 text-[10px]">
                            (মূল এক্সেল শিট নাম: "{currentPreviewSheet.sheetName}")
                          </span>
                        </div>
                        <span className="text-emerald-400">
                          {toBnNum(currentPreviewSheet.students.length)} জন শিক্ষার্থী পাওয়া গেছে
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-950/70 text-slate-400 sticky top-0 border-b border-slate-800">
                            <tr>
                              <th className="p-2 w-16 text-center">ক্রমিক / রোল</th>
                              <th className="p-2">শিক্ষার্থীর নাম</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {currentPreviewSheet.students.map((st, i) => (
                              <tr key={i} className="hover:bg-slate-800/50">
                                <td className="p-2 text-center font-mono font-bold text-amber-300">
                                  {st.roll}
                                </td>
                                <td className="p-2 font-semibold text-slate-200">
                                  {st.name}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL QUICK PASTE */}
          {activeMode === "paste" && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-2">
                <p className="text-slate-300">
                  যদি আপনার এক্সেল ফাইলটি আপলোড করতে সমস্যা হয়, তাহলে এক্সেল ফাইলটি খুলে যেকোনো ক্লাসের রোল ও নামের দুটি কলাম কপি করে সরাসরি নিচে পেস্ট করে দিন:
                </p>
                
                <div className="flex flex-wrap items-center gap-2">
                  <label className="font-bold text-slate-300">কোন শ্রেণির তথ্য:</label>
                  <select
                    value={pasteClass}
                    onChange={(e) => setPasteClass(e.target.value)}
                    className="bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-xs text-white font-bold outline-none"
                  >
                    {["প্লে", "নার্সারি", "কেজি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম"].map((c) => (
                      <option key={c} value={c}>{c} শ্রেণি</option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`উদাহরণস্বরূপ এক্সেল থেকে কপি করে পেস্ট করুন:\n১\tমোঃ মাজিদ\n২\tসালমান\n৩\tমাহিরা`}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 resize-y"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleProcessPasteText}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>এই শ্রেণির তথ্য প্রিভিউতে যুক্ত করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDE ON GIVING THE FILE */}
          {activeMode === "guide" && (
            <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>আপনি কীভাবে এক্সেল ফাইল বা এর ভেতরের ডেটা আমাকে (AI ইঞ্জিনিয়ার) দিতে পারেন:</span>
              </div>

              <div className="space-y-3 text-slate-300 leading-relaxed">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs">১</span>
                    <span>সরাসরি অ্যাপ্লিকেশনেই আপলোড করুন (সবচেয়ে সুবিধাজনক ও দ্রুত)</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    এখনই এই মডালের <strong>"এক্সেল ফাইল আপলোড"</strong> ট্যাবে গিয়ে আপনার ১০টি শিটের এক্সেল ফাইলটি সিলেক্ট করে দিন। সিস্টেম স্বয়ংক্রিয়ভাবে সবগুলো শ্রেণি পড়বে এবং এক ক্লিকেই পুরনো সব তথ্য বাতিল করে নতুন এক্সেল ডেটা প্রতিস্থাপন করে দেবে।
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs">২</span>
                    <span>এই চ্যাট বক্সে সরাসরি ডেটা পেস্ট করে দেওয়া</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    আপনার এক্সেল ফাইলটি ওপেন করুন। তারপর প্রতিটি শিটের রোল ও নামের কলামগুলো কপি (Ctrl+C) করে আমাদের এই চ্যাট বক্সে পাঠিয়ে দিন। আমি নিজে কোডে আপনার স্কুলের সবগুলো শ্রেণির তালিকা স্থায়ীভাবে বসিয়ে দেব।
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 flex items-center justify-center text-xs">৩</span>
                    <span>গুগল ড্রাইভ বা ক্লাউড লিংক শেয়ার করা</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    যদি ফাইলটি সরাসরি দিতে না পারেন, তবে এটি গুগল ড্রাইভে আপলোড করে "Anyone with the link can view" করে লিংকটি এই চ্যাটে পাঠিয়ে দিতে পারেন।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CONFIRMATION OVERLAY FOR WIPE & REPLACE */}
          {isConfirmingWipe && (
            <div className="p-4 bg-rose-950/80 border-2 border-rose-500 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>চূড়ান্ত নিশ্চিতকরণ: সকল পুরনো ডেটা সম্পূর্ণ বাতিলকরণ</span>
              </div>
              <p className="text-slate-200">
                আপনি কি নিশ্চিত যে বর্তমান সিস্টেমে থাকা সমস্ত পুরাতন শ্রেণির তালিকা সম্পূর্ণ মুছে ফেলে 
                এখন শনাক্তকৃত <strong>{toBnNum(parsedSheets.length)}টি শ্রেণির মোট {toBnNum(totalStudentsInParsed)} জন শিক্ষার্থীর নতুন এক্সেল তালিকা</strong> প্রতিস্থাপন করতে চান?
              </p>
              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  onClick={() => setIsConfirmingWipe(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={handleExecuteWipeAndReplace}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>হ্যাঁ, সম্পূর্ণ বাতিল করে প্রতিস্থাপন করুন</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {hasCustomStudents() && (
              <button
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>ডিফল্ট তালিকায় ফেরত যান</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              বন্ধ করুন
            </button>

            {parsedSheets.length > 0 && !isConfirmingWipe && (
              <button
                onClick={() => setIsConfirmingWipe(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/30"
              >
                <Database className="w-4 h-4 text-amber-300" />
                <span>⚠️ পুরনো সব ডেটা বাতিল করে নতুন এক্সেল ডেটা প্রতিস্থাপন করুন</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
