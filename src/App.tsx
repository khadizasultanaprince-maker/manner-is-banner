import { useState, useMemo, useEffect, Fragment } from "react";
import { motion } from "motion/react";
import { 
  Printer, 
  RotateCcw, 
  Sparkles, 
  User, 
  Calendar, 
  Award, 
  Info, 
  Sliders, 
  CheckSquare, 
  Trash2, 
  BookOpen, 
  FileText,
  Clock,
  UserCheck,
  Cloud,
  CheckCircle,
  Check,
  AlertTriangle,
  RefreshCw,
  Heart,
  ChevronRight,
  ClipboardList,
  Flame,
  HelpCircle,
  AwardIcon,
  BookOpenCheck,
  Award as AwardLucide,
  BarChart2,
  TrendingUp,
  Target,
  Search,
  Database,
  Github,
  ExternalLink,
  Code,
  Terminal,
  ArrowLeftRight
} from "lucide-react";
import { db } from "./firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

// Convert numbers to Bengali digits
const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
function toBnNum(num: number | string): string {
  if (num === undefined || num === null) return "";
  return num
    .toString()
    .split("")
    .map(char => {
      const charCode = char.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) {
        return BENGALI_DIGITS[charCode - 48];
      }
      return char;
    })
    .join("");
}

// Bengali Weekdays Configuration starting from Saturday
const WEEKDAYS = [
  { name: "শনিবার", short: "শনি", isHoliday: false },
  { name: "রবিবার", short: "রবি", isHoliday: false },
  { name: "সোমবার", short: "সোম", isHoliday: false },
  { name: "মঙ্গলবার", short: "মঙ্গল", isHoliday: false },
  { name: "বুধবার", short: "বুধ", isHoliday: false },
  { name: "বৃহস্পতিবার", short: "বৃহস্পতি", isHoliday: false },
  { name: "শুক্রবার", short: "শুক্র", isHoliday: true } // Friday highlight
];

const PRESET_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", 
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const SCHOOL_CLASSES = [
  "প্লে", "নার্সারি", "কেজি", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ", "পঞ্চম", "ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম"
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const getPreviousMonthName = (currentMonthName: string): string => {
  const cleanMonth = currentMonthName.trim();
  const parts = cleanMonth.split(/\s+/);
  if (parts.length < 1) return "";
  const name = parts[0];
  const yearStr = parts[1] || "২০২৬";
  const idx = PRESET_MONTHS.indexOf(name);
  if (idx > 0) {
    return `${PRESET_MONTHS[idx - 1]} ${yearStr}`;
  } else if (idx === 0) {
    if (yearStr === "২০২৬") return "ডিসেম্বর ২০২৫";
    if (yearStr === "২০২৭") return "ডিসেম্বর ২০২৬";
    return "ডিসেম্বর ২০২৫";
  }
  return "";
};

const getSmoothedTrend = (arr: number[]): number[] => {
  return arr.map((val, i) => {
    const v0 = arr[i];
    const v1 = i > 0 ? arr[i - 1] : v0;
    const v2 = i > 1 ? arr[i - 2] : v1;
    return (v0 + v1 + v2) / 3;
  });
};

interface DayRow {
  date: number; // 1 to 31
  col1Checked: boolean; // Morning
  col2Checked: boolean; // Study
  col3Checked: boolean; // School / Handwriting
  col4Checked: boolean; // Afternoon sports
  col5Checked?: boolean; // New Checkable Evening / Play Sports
  col6Checked?: boolean; // New Checkable Night Study
  eveningSubject: string; // Evening subject custom text
  dailyNote: string; // Daily Note from parents or teachers
  dailyGoal?: string; // New: Daily Goal / reflections
  col1Val?: string; // Actual time/input if not checked/met
  col2Val?: string; // Actual deviation/input if not checked/met
  col3Val?: string; // Actual deviation/input if not checked/met
  col4Val?: string; // Actual deviation/input if not checked/met
  col5Val?: string; // Actual deviation/input if not checked/met
  col6Val?: string; // Actual deviation/input if not checked/met
  fajrChecked?: boolean;
  dhuhrChecked?: boolean;
  asrChecked?: boolean;
  maghribChecked?: boolean;
  ishaChecked?: boolean;
}

export default function App() {
  // --- Persistent & Local States ---
  const [studentName, setStudentName] = useState(() => localStorage.getItem("studentName") || "আহমেদ হাসান");
  const [studentClass, setStudentClass] = useState(() => localStorage.getItem("studentClass") || "পঞ্চম শ্রেণী");
  const [studentRoll, setStudentRoll] = useState(() => localStorage.getItem("studentRoll") || "০৫");
  const [selectedMonth, setSelectedMonth] = useState(() => localStorage.getItem("selectedMonth") || "জানুয়ারি ২০২৬");
  
  const [daysCount, setDaysCount] = useState<number>(() => Number(localStorage.getItem("daysCount")) || 31);
  const [startDayIndex, setStartDayIndex] = useState<number>(() => Number(localStorage.getItem("startDayIndex")) || 3); // Wednesday

  // Header Titles (Customizable values)
  const [col1Header, setCol1Header] = useState(() => localStorage.getItem("col1Header") || "১। নামাজের জন্য ঘুম জাগা ০৪:৩০");
  const [col2Header, setCol2Header] = useState(() => localStorage.getItem("col2Header") || "২। ফজর, কোরআন তিলাওয়াত ও ৫ ওয়াক্ত নামাজ");
  const [col3Header, setCol3Header] = useState(() => localStorage.getItem("col3Header") || "৩। সকালের পড়া ০৫:৩০ থেকে ০৮:৩০ পর্যন্ত (৩ ঘন্টা)");
  const [col4Header, setCol4Header] = useState(() => localStorage.getItem("col4Header") || "৪। স্কুল ছুটির পর প্রথম কাজ হাতের লেখা সম্পন্ন করা");
  const [col5Header, setCol5Header] = useState(() => localStorage.getItem("col5Header") || "৫। খেলাধুলা ও সুস্থ বিনোদন");
  const [col6Header, setCol6Header] = useState(() => localStorage.getItem("col6Header") || "৬। রাতের পড়া সন্ধ্যা ০৭:০০ থেকে ০৯:০০ পর্যন্ত (২ ঘন্টা)");

  // Bulk Apply Input Text
  const [bulkEveningText, setBulkEveningText] = useState("");
  const [monthlyAdvice, setMonthlyAdvice] = useState(() => 
    localStorage.getItem("monthlyAdvice") || "পাঁচ ওয়াক্ত নামাজ সময়মত আদায় করা এবং প্রতিদিনের রুটিন অনুযায়ী অধ্যয়নে মনোযোগী হওয়া সুন্দর ভবিষ্যৎ গঠনের মূল ভিত্তি।"
  );

  // Layout states for Printer-Friendly styles (compact, normal, spacious)
  const [density, setDensity] = useState<"compact" | "normal" | "spacious">("compact");
  const [themeMode, setThemeMode] = useState<"professional-polish" | "mono-black">("professional-polish");

  // Multi-tab design: Routine Tracker sheet vs. Dynamic Award Certificate vs. Statistical Summary vs. Developer Integrations
  const [activeTab, setActiveTab] = useState<"routine" | "certificate" | "summary" | "integrations">("routine");

  // Supabase & Cloud Integrations states
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem("supabase_url") || "");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem("supabase_anon_key") || "");
  const [isSupabaseSaving, setIsSupabaseSaving] = useState(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);
  const [supabaseSyncMsg, setSupabaseSyncMsg] = useState<{ type: "success" | "error" | "info" | ""; text: string }>({ type: "", text: "" });
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVercelEnv, setCopiedVercelEnv] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  // Principal's Evaluation & Approval states
  const [principalApproved, setPrincipalApproved] = useState<boolean>(() => {
    return localStorage.getItem("principalApproved") === "true";
  });
  const [principalInstruction, setPrincipalInstruction] = useState<string>(() => {
    return localStorage.getItem("principalInstruction") || "প্রগতি সন্তোষজনক, প্রতিদিনের এই নৈতিক চর্চা অব্যাহত রাখো।";
  });
  const [principalName, setPrincipalName] = useState<string>(() => {
    return localStorage.getItem("principalName") || "প্রিন্সিপাল (স্বাক্ষর ও সিল)";
  });

  // Certificate customization states
  const [certTitle, setCertTitle] = useState("উত্তম শিষ্টাচার ও অনুকরণীয় চরিত্র প্রশংসাপত্র");
  const [certDescription, setCertDescription] = useState(
    "নৈতিক মূল্যবোধ, সৌজন্যবোধ, বিনম্র আচরণ এবং প্রতিদিনের রুটিন অনুযায়ী সময়ের সুপরিকল্পিত ব্যবহারে অত্যন্ত প্রশংসনীয় সাফল্য অর্জনের জন্য এই প্রশংসাপত্র প্রদান করা হলো।"
  );

  // --- Missing/Durable States & Controllers ---
  const [rows, setRows] = useState<DayRow[]>(() => {
    const saved = localStorage.getItem("routineRows");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DayRow[];
        return parsed.map(row => ({
          ...row,
          dailyGoal: row.dailyGoal || "",
          col1Val: row.col1Val || "",
          col2Val: row.col2Val || "",
          col3Val: row.col3Val || "",
          col4Val: row.col4Val || "",
          col5Val: row.col5Val || "",
          col6Val: row.col6Val || "",
          col5Checked: row.col5Checked !== undefined ? row.col5Checked : false,
          col6Checked: row.col6Checked !== undefined ? row.col6Checked : false,
          fajrChecked: row.fajrChecked !== undefined ? row.fajrChecked : false,
          dhuhrChecked: row.dhuhrChecked !== undefined ? row.dhuhrChecked : false,
          asrChecked: row.asrChecked !== undefined ? row.asrChecked : false,
          maghribChecked: row.maghribChecked !== undefined ? row.maghribChecked : false,
          ishaChecked: row.ishaChecked !== undefined ? row.ishaChecked : false,
        }));
      } catch (e) {
        // fallback
      }
    }
    return Array.from({ length: 31 }, (_, i) => ({
      date: i + 1,
      col1Checked: false,
      col2Checked: false,
      col3Checked: false,
      col4Checked: false,
      col5Checked: false,
      col6Checked: false,
      eveningSubject: "",
      dailyNote: "",
      dailyGoal: "",
      col1Val: "",
      col2Val: "",
      col3Val: "",
      col4Val: "",
      col5Val: "",
      col6Val: "",
      fajrChecked: false,
      dhuhrChecked: false,
      asrChecked: false,
      maghribChecked: false,
      ishaChecked: false,
    }));
  });

  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [customCompareId, setCustomCompareId] = useState<string>("");
  const [goalsSearchQuery, setGoalsSearchQuery] = useState<string>("");
  const [activePreset, setActivePreset] = useState<"moral" | "study" | "prayer_academic">(() => {
    const saved = localStorage.getItem("activePreset") as "moral" | "study" | "prayer_academic";
    return saved ? saved : "prayer_academic";
  });
  const [focusedRowDate, setFocusedRowDate] = useState<number | null>(null);
  const [suggestionShuffleSeed, setSuggestionShuffleSeed] = useState<number>(0);

  // Student Manager states
  const [entryName, setEntryName] = useState("");
  const [entryRoll, setEntryRoll] = useState("");
  const [entryClass, setEntryClass] = useState("পঞ্চম শ্রেণী");
  const [entryMonth, setEntryMonth] = useState("জানুয়ারি ২০২৬");
  const [entryPreset, setEntryPreset] = useState<"moral" | "study" | "prayer_academic">("prayer_academic");
  const [managerTab, setManagerTab] = useState<"directory" | "add">("directory");
  const [classFilter, setClassFilter] = useState("all");
  const [rollFilterQuery, setRollFilterQuery] = useState("");

  // Iframe printing state and handler
  const [showIframePrintModal, setShowIframePrintModal] = useState(false);

  const handlePrint = () => {
    if (window.self !== window.top) {
      setShowIframePrintModal(true);
    } else {
      window.print();
    }
  };

  const getAISuggestions = (row: DayRow, name: string, preset: "moral" | "study" | "prayer_academic", seed: number) => {
    const sName = name.trim() || "আমি";
    const checkedHabits: string[] = [];
    
    if (preset === "moral") {
      if (row.col1Checked) checkedHabits.push("ভোরে ঘুম থেকে ওঠা");
      if (row.col2Checked) checkedHabits.push("বড়দের সম্মান ও সালাম/শ্রদ্ধা");
      if (row.col3Checked) checkedHabits.push("সুশৃঙ্খল পড়াশোনা");
      if (row.col4Checked) checkedHabits.push("বাবা-মাকে কাজে সাহায্য করা");
    } else if (preset === "study") {
      if (row.col1Checked) checkedHabits.push("ভোরে জাগা ও সকালের পাঠ");
      if (row.col2Checked) checkedHabits.push("নিবিড় পড়াশোনা");
      if (row.col3Checked) checkedHabits.push("হাতের লেখা সুন্দর করার চর্চা");
      if (row.col4Checked) checkedHabits.push("বিকালের ব্যায়াম ও খেলাধুলা");
    } else {
      if (row.col1Checked) checkedHabits.push("নামাজের জন্য সময়মত ঘুম জাগা");
      if (row.col2Checked) checkedHabits.push("ফজর ও কোরআন তেলাওয়াত");
      if (row.col3Checked) checkedHabits.push("সকালের ৩ ঘন্টা নিবিড় অধ্যয়ন");
      if (row.col4Checked) checkedHabits.push("হাতের লেখা সুন্দরীকরণ কাজ");
      if (row.col5Checked) checkedHabits.push("বিকালবেলা খেলাধুলা ও বিনোদন");
      if (row.col6Checked) checkedHabits.push("রাতের ২ ঘন্টা মনোযোগ দিয়ে পড়া");
    }

    // Include the individual prayers in evaluated habits
    if (row.fajrChecked) checkedHabits.push("ফজর নামাজ");
    if (row.dhuhrChecked) checkedHabits.push("জোহর নামাজ");
    if (row.asrChecked) checkedHabits.push("আসর নামাজ");
    if (row.maghribChecked) checkedHabits.push("মাগরিব নামাজ");
    if (row.ishaChecked) checkedHabits.push("এশা নামাজ");

    const count = checkedHabits.length;
    const maxVal = (preset === "prayer_academic" ? 6 : 4) + 5;
    let suggestion1 = "";
    let suggestion2 = "";
    let suggestion3 = "";

    const variation = seed % 3;

    if (count === maxVal) {
      if (preset === "moral") {
        if (variation === 0) {
          suggestion1 = `${sName} আজ শতভাগ সফলতার সাথে সকল শিষ্টাচার সম্পন্ন করেছি। বিশেষ করে নম্র আচরণ ও গুরুজনদের সম্মান নিয়ে দিনটি অসাধারণ ছিল।`;
          suggestion2 = `আজকে আমার অভ্যাসের একটি সুবর্ণ দিন কাটলো! বড়দের প্রতি শ্রদ্ধা জানানো এবং বাবা-মাকে সাহায্য করার মাধ্যমে আমার নৈতিক মূল্যবোধ সুদৃঢ় হচ্ছে।`;
          suggestion3 = `সুন্দর চরিত্রের বৈশিষ্ট্য হচ্ছে নিজের ওপর সম্পূর্ণ নিয়ন্ত্রণ। ${sName} আজ প্রতিটি গঠনমূলক কাজ সফলভাবে করতে পেরে গর্বিত।`;
        } else if (variation === 1) {
          suggestion1 = `নিয়মনিষ্ঠা ও বিনম্র ব্যবহারের মাধ্যমে ${sName} আজ প্রমাণ করেছি যে সদিচ্ছা থাকলে সদাচারী ভদ্র মানুষ হওয়া সহজ।`;
          suggestion2 = `আজ সারাদিন বড়দের অনুগত থেকে, সবার মিষ্টি কথা বলে এবং নিজের কাজটি পরিচ্ছন্ন উপায়ে শেষ করে পরম শান্তি পেয়েছি।`;
          suggestion3 = `আজকের শতভাগ সাফল্য ধরে রেখে আগামী দিনগুলোতেও নিজের আচরণের এই মার্জিত ও আদর্শ মান ধরে রাখতে আমি অঙ্গীকারবদ্ধ।`;
        } else {
          suggestion1 = `সকল দায়িত্ব ঠিকঠাক সম্পন্ন করে ${sName} আজ অনুভব করেছি যে, বাবা-মাকে কাজে সাহায্য করলে ও বড়দের শ্রদ্ধা জানালে মনের গভীরতা কত বৃদ্ধি পায়।`;
          suggestion2 = `আজ আমার শিষ্টাচারের লক্ষ্যসমূহ ১০০% অর্জিত। সদাচরণ বজায় রেখে ও সময়ের পূর্ণ মর্যাদা দিয়ে দিনশেষে নিজেকে ধন্য বোধ করছি।`;
          suggestion3 = `আজ আমি শিষ্টাচারের চমৎকার বাস্তব প্রতিফলন ঘটিয়েছি। সদাচরণ ও সঠিক আচরণই যে উন্নত জীবনের শ্রেষ্ঠ অলঙ্কার, তা আজ প্রমাণিত।`;
        }
      } else if (preset === "study") {
        if (variation === 0) {
          suggestion1 = `${sName} আজ পরম অধ্যবসায়ের সাথে পড়ার রুটিন ও সকাল-সন্ধ্যার বাড়ির কাজ নির্ধারিত সময়ে সম্পন্ন করেছি।`;
          suggestion2 = `সকালের নিবিড় পড়াশোনা ও সুন্দর হাতের লেখার চর্চা সুন্দরভাবে করতে পেরে ${sName} পড়ালেখায় আজ চমৎকার সংযোগ পেয়েছি।`;
          suggestion3 = `আজ পড়াশোনার পাশাপাশি বৈকালিক ব্যায়াম ও সুশৃঙ্খল সময়ানুসারী দিন কাটানোর মাধ্যমে আমার কাজের সক্ষমতা অনেক বৃদ্ধি পেয়েছে।`;
        } else if (variation === 1) {
          suggestion1 = `রুটিনের শতভাগ পড়ার উদ্দেশ্য জয় করতে পেরে ${sName} শিক্ষাশিক্ষায় এক প্রশংসনীয় উচ্চতায় প্রবেশ করেছি।`;
          suggestion2 = `আলস্যকে সম্পূর্ণ পেছনে ফেলে আজ সকাল ও বিকালের গঠনমূলক রুটিন নিখুঁতভাবে শেষ করতে পেরে নিজেকে দারুণ আত্মবিশ্বাসী লাগছে।`;
          suggestion3 = `আজকের চমৎকার অধ্যবসায় প্রমাণ করে যে, পূর্বপরিকল্পনা ও রুটিন মাফিক চললে সারাদিন প্রফুল্ল ও অত্যন্ত মনোযোগী থাকা কতটা আনন্দের।`;
        } else {
          suggestion1 = `আজ পড়ালেখা ও সুশীল আচরণের একটি নিখুঁত সমন্বয় বজায় ছিল। পড়ার টেবিলে মনোযোগ আজ যেকোনো দিনের চেয়ে বেশি ছিল।`;
          suggestion2 = `আজকের ৪টি গুরুত্বপূর্ণ শিখন লক্ষ্য মাত্রা স্পর্শ করার অনুভূতি অত্যন্ত চিত্তাকর্ষক ও আনন্দদায়ক。`;
          suggestion3 = `দিনান্তের আত্মতুষ্টি আমাকে শেখাল যে, দৈনিক অধ্যয়ন যদি নিয়মিত ও সঠিক সময়ে হয়, তবে পাঠ দ্রুত হৃদয়ঙ্গম করা সম্ভব।`;
        }
      } else {
        if (variation === 0) {
          suggestion1 = `আলহামদুলিল্লাহ! আজ ৫ ওয়াক্ত সালাত জামায়াতে আদায় ও ৫ ঘন্টা গভীর মনোযোগে পড়াশোনার সুবর্ণ লক্ষ্য অর্জন করেছি।`;
          suggestion2 = `জ্ঞানার্জন ও ইবাদতের কী অপূর্ব মিলনমেলা আজ! সারা দিন রুটিনমাফিক কাজ করে আমি অত্যন্ত আত্মতৃপ্ত।`;
          suggestion3 = `আজকের এই মহান প্রগতি প্রমাণ করে যে, নিজের ওপর বিশ্বাস ও চেষ্টা থাকলে ইবাদত ও জ্ঞান অর্জন উভয়ই নিখুঁতভাবে শেষ করা সম্ভব।`;
        } else if (variation === 1) {
          suggestion1 = `আজ পড়ালেখা ও ইবাদতের এক অনন্য সমন্বয় বজায় ছিল। আমার মনে প্রশান্তি ও চেতনায় নতুন শক্তির উদয় হয়েছে।`;
          suggestion2 = `রুটিনের প্রতিটি গুরুত্বপূর্ণ লক্ষ্য ছোঁয়ার আনন্দ অসাধারণ। আগামীকালও এই প্রগতি বজায় রাখতে আমি দৃঢ় সংকল্পবদ্ধ।`;
          suggestion3 = `আজকের প্রগতি যথেষ্ট সন্তোষজনক। আগামী সপ্তাহে এই ধারাবাহিকতা বজায় রাখতে কাল থেকে সর্বোচ্চ চেষ্টা করব।`;
        } else {
          suggestion1 = `আজ মনের জোরে ৫ ওয়াক্ত নামাজ ও অত্যন্ত গভীর মনোসংযোগে পড়াশোনা সুচারুরূপে পালন করতে পেরেছি। পড়াশোনায় কোনো ঘাটতি রাখবো না।`;
          suggestion2 = `আজকের রুটিনের সব কাজ সফল হয়েছে। আগামীকাল ফজর সালাত সময়মত আদায়ের চেষ্টা অব্যাহত রাখতে হবে।`;
          suggestion3 = `ব্যর্থতাগুলো পিছনে ফেলে আজ ভালো প্রগতি পেয়েছি। আগামীকালের লক্ষ্য হচ্ছে নিজেকে আরও শৃঙ্খলিত করা।`;
        }
      }
    } else {
      if (preset === "moral") {
        if (variation === 0) {
          suggestion1 = `আজ প্রগতির হার কিছুটা মন্থর হলেও ${sName} আগামীকাল থেকে বড়দের শ্রদ্ধা, মিষ্টি আচরণ ও বাবা-মার আদেশ মেনে চলার জন্য পূর্ণ সংকল্পবদ্ধ।`;
          suggestion2 = `আজকের ভুলত্রুটি থেকে শিক্ষা নিয়ে নৈতিক আচরণ সুগঠিত করতে এবং অলসতা পেছনে ফেলে নিজেকে আদর্শ মানুষ হিসেবে উপস্থাপন করতে আগামীকাল নতুন উদ্যমে শুরু করব।`;
          suggestion3 = `আজকের দিনশেষে গভীরভাবে উপলব্ধি করেছি যে, সফল শিষ্ট মনের অধিকারী হতে প্রতিদিনের নিয়মতান্ত্রিক অভ্যাসের বিকল্প অন্যকিছু নেই।`;
        } else if (variation === 1) {
          suggestion1 = `আজকের অলস স্বভাব ও ব্যবহারের অপ্রতুল প্রগতি আমাকে হতাশ করলেও চমৎকার চরিত্র গড়ে তুলতে আগামীকাল সর্বোচ্চ বিনম্র ও শ্রদ্ধাশীল হব।`;
          suggestion2 = `আজকের দিনটি আশানুরূপ যায়নি, তবে আমি পিছপা হব না। আগামীকাল মা-বাবার নির্দেশ ও নিজের ঘরদোর পরিচ্ছন্ন রাখার প্রতি মনোযোগ দ্বিগুণ দেবো।`;
          suggestion3 = `চরিত্রের শোভাময় রূপ একদিনে হয় না। আজকের আচরণিক পদস্খলন কাটিয়ে নৈতিক সদাচরণ সুদৃঢ় করতে কালকে রুটিনের সাথে পথ মেলাবো।`;
        } else {
          suggestion1 = `দিনের সীমাবদ্ধতা শুধরে নিয়ে চরিত্রের চমৎকার সৌন্দর্য বাড়াতে আগামীকাল থেকে মুখে মিষ্টি ভাষা ও অনুগত ব্যবহারের শপথ নিচ্ছি।`;
          suggestion2 = `আজকের দিন শেষে নিজের ব্যবহারের ঘাটতিগুলো নিয়ে ভেবেছি এবং গুরুজনদের যথাযথ সম্মান ও অভিবাদন জানাতে আগামীকাল দৃঢ়ভাবে প্রস্তুত।`;
          suggestion3 = `ভুল করার মাধ্যমেই একজন সচেতন শিক্ষার্থী জীবনের খাঁটি মূল্যবোধ শেখে। আজকের দিন থেকে অনুপ্রাণিত হয়ে আগামীকাল বাধ্য হওয়ার অঙ্গীকার রইল।`;
        }
      } else if (preset === "study") {
        if (variation === 0) {
          suggestion1 = `আজ প্রগতির হার অনেক কম হলেও আমি আশাহত নই। পড়াশোনা ও একাগ্রতা বাড়াতে কাল থেকে পড়ার রুটিন পুঙ্খানুপুঙ্খ অনুসরণ করব।`;
          suggestion2 = `আজকের পড়ালেখার ঘাটতিগুলো পর্যালোচনা করে ${sName} আগামীকাল আরও নিষ্ঠার সাথে সকালে জাগরণ ও নিবিড় অনুশীলনে ফিরতে দৃঢ় প্রতিজ্ঞাবদ্ধ।`;
          suggestion3 = `আজ পড়ালেখায় মনোযোগ কম থাকলেও কালকে সময়সূচী অনুযায়ী পড়া মুখস্থ করা ও হাতের লেখার অনুশীলন শেষ করতে সর্বোচ্চ চেষ্টা খাটাব।`;
        } else if (variation === 1) {
          suggestion1 = `আজ পড়ার টেবিলে উপযুক্ত মনোযোগ দিতে পারিনি। আগামীকাল নিজেকে সুসংগঠিত করে প্রতিটি বিষয়ের رুটিন মানার কঠোর চ্যালেঞ্জ কাঁধে নিচ্ছি।`;
          suggestion2 = `আজকের পড়ালেখার অপচয় হওয়া সময়গুলোর বিপরীতে আগামীকাল প্রাতঃকালেই হাতের লেখা ও সকালের পড়ার পাঠগুলো ঝালিয়ে নেব।`;
          suggestion3 = `ব্যর্থতা ও সামান্য বিরতি আমাদের জয় করা থামাবে না। আমার আজকের পড়ার দুর্বলতা দূরে ঠেলে আগামীকাল সকাল থেকে নতুন প্রেরণা সাজাবো।`;
        } else {
          suggestion1 = `রুটিনে আজ বড় ছন্দপতন হয়েছে, তবে চমৎকার অধ্যবসায়ী শিক্ষার্থী হতে আগামীকাল থেকে পড়ার টেবিলে কোনো ক্লান্তি আসতে দেবো না।`;
          suggestion2 = `আজ পড়ায় চরম অলসতা ছিল। আত্মতুষ্টি পরিহার করে আগামীকালের কঠিন ও গুরুত্বপূর্ণ পড়াশোনা নিখুঁতভাবে শেষ করার উচ্চ লক্ষ্যমাত্রা গ্রহণ করলাম।`;
          suggestion3 = `আজকের পড়ালেখার বড় ক্ষতি পুষিয়ে নিতে এবং সুন্দর লেখার ধারা সচল করতে কালকে পড়ার টেবিলে বাড়তি মনোযোগ দেবো।`;
        }
      } else {
        // prayer_academic
        if (variation === 0) {
          suggestion1 = `আজকের রুটিনের কিছু কাজে আলস্য এসে গেছিল। আগামীকাল ভোরবেলা সময়মত জাগা ও পাঁচ নামাজ আদায়ে সচেষ্ট থাকবো।`;
          suggestion2 = `পড়াশোনা ও ইবাদতের চমৎকার ধারায় আগামীকাল নতুন উদ্যমে সুসংগঠিত হয়ে উঠবো। প্রগতির মাত্রা ফিরে পাওয়ার প্রত্যয় রইল।`;
          suggestion3 = `অনমনোযোগের কারণে আজকে রুটিন মাফিক কাজের ক্ষতি পুষিয়ে নিতে আগামীকালের পড়ার সময়গুলো দ্বিগুণ নিষ্ঠার সাথে কাটাব।`;
        } else {
          suggestion1 = `আজকে চমৎকার কিছু অভ্যাস অপূরিত থেকে গেছে। কাল ভোরের ঘুম জাগা থেকেই রুটিনের নিখুঁত বাস্তবায়ন শুরু করার জন্য আমি প্রতিজ্ঞাবদ্ধ।`;
          suggestion2 = `দিনের অল্প অগ্রগতি নিয়ে হতাশ না হয়ে আগামীকাল পড়াশোনায় এবং নৈতিক রুটিনে সর্বোচ্চ সংযোগ স্থাপন করব।`;
          suggestion3 = `নিয়মানুবর্তীতাই সমৃদ্ধির বাহন। আজকের ত্রুটিগুলো কাটিয়ে কাল ৫ ওয়াক্ত নামাজ সময়মতো পড়া ও ৫ ঘন্টা পড়াশোনা সম্পন্ন করার পরিকল্পনা করলাম।`;
        }
      }
    }

    return [suggestion1, suggestion2, suggestion3];
  };

  // --- Bulk Actions ---
  const checkAllBoxes = () => {
    setRows(prev => prev.map(row => ({
      ...row,
      col1Checked: true,
      col2Checked: true,
      col3Checked: true,
      col4Checked: true,
      fajrChecked: true,
      dhuhrChecked: true,
      asrChecked: true,
      maghribChecked: true,
      ishaChecked: true
    })));
  };

  const clearAllBoxes = () => {
    setRows(prev => prev.map(row => ({
      ...row,
      col1Checked: false,
      col2Checked: false,
      col3Checked: false,
      col4Checked: false,
      fajrChecked: false,
      dhuhrChecked: false,
      asrChecked: false,
      maghribChecked: false,
      ishaChecked: false
    })));
  };

  const bulkApplyEveningText = () => {
    if (!bulkEveningText.trim()) return;
    setRows(prev => prev.map(row => ({
      ...row,
      eveningSubject: bulkEveningText
    })));
  };

  const resetAllData = () => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে সব তথ্য মুছে দিয়ে প্রথম থেকে শুরু করতে চান?")) {
      setStudentName("আহমেদ হাসান");
      setStudentClass("পঞ্চম শ্রেণী");
      setStudentRoll("০৫");
      setSelectedMonth("জানুয়ারি ২০২৬");
      setDaysCount(31);
      setStartDayIndex(3);
      setCol1Header("ভোর ৫:০০ (ঘুম থেকে ওঠা, ফজর নামাজ ও নিয়মানুবর্তী আমল)");
      setCol2Header("সব বড়দের সালাম দেওয়া, নম্র আচরণ ও সৌজন্য প্রকাশ");
      setCol3Header("সুপরিকল্পিত পড়াশোনা ও সময়ের সঠিক ব্যবহার");
      setCol4Header("পরিষ্কার-পরিচ্ছন্নতা রক্ষা ও বাবা-মাকে কাজে সাহায্য");
      setCol5Header("সন্ধ্যা ৭:০০-৯:০০ (শিষ্টাচার পাঠ, নৈতিক গল্প ও সাধারণ জ্ঞান)");
      setCol6Header("দৈনিক উৎসাহমূলক মন্তব্য এবং পরামর্শ (অভিভাবক/শিক্ষক)");
      setMonthlyAdvice("উত্তম চরিত্র ও সুন্দর আচরণই মানুষের শ্রেষ্ঠ সম্পদ। সর্বদা সত্য কথা বলবে ও সুশৃঙ্খলভাবে নিজের কাজ সম্পন্ন করবে।");
      setBulkEveningText("");
      setRows(Array.from({ length: 31 }, (_, i) => ({
        date: i + 1,
        col1Checked: false,
        col2Checked: false,
        col3Checked: false,
        col4Checked: false,
        eveningSubject: "",
        dailyNote: "",
        dailyGoal: "",
        col1Val: "",
        col2Val: "",
        col3Val: "",
        col4Val: "",
        col5Val: "",
        col6Val: "",
        fajrChecked: false,
        dhuhrChecked: false,
        asrChecked: false,
        maghribChecked: false,
        ishaChecked: false
      })));
      setActiveTab("routine");
    }
  };

  const toggleRowExpand = (date: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const updateDailyGoalText = (date: number, text: string) => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return { ...row, dailyGoal: text };
      }
      return row;
    }));
  };

  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "success" | "error">("idle");
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [certAwardOverride, setCertAwardOverride] = useState<"auto" | "gold" | "silver" | "bronze">("auto");
  const [certSignerLeft, setCertSignerLeft] = useState(() => localStorage.getItem("certSignerLeft") || "অভিভাবক");
  const [certSignerRight, setCertSignerRight] = useState(() => localStorage.getItem("certSignerRight") || "শ্রেণী শিক্ষক");

  useEffect(() => {
    localStorage.setItem("certSignerLeft", certSignerLeft);
    localStorage.setItem("certSignerRight", certSignerRight);
  }, [certSignerLeft, certSignerRight]);

  const toggleCell = (date: number, colKey: "col1Checked" | "col2Checked" | "col3Checked" | "col4Checked" | "col5Checked" | "col6Checked") => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return {
          ...row,
          [colKey]: !row[colKey]
        };
      }
      return row;
    }));
  };

  const togglePrayer = (date: number, key: "fajrChecked" | "dhuhrChecked" | "asrChecked" | "maghribChecked" | "ishaChecked") => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return {
          ...row,
          [key]: !row[key]
        };
      }
      return row;
    }));
  };

  useEffect(() => {
    setIsLoadingCloud(true);
    const q = query(collection(db, "routines"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setSavedRoutines(list);
      setIsLoadingCloud(false);
    }, (error) => {
      console.error("Firestore Loading Error:", error);
      setIsLoadingCloud(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("studentName", studentName);
    localStorage.setItem("studentClass", studentClass);
    localStorage.setItem("studentRoll", studentRoll);
    localStorage.setItem("selectedMonth", selectedMonth);
    localStorage.setItem("daysCount", daysCount.toString());
    localStorage.setItem("startDayIndex", startDayIndex.toString());
    localStorage.setItem("col1Header", col1Header);
    localStorage.setItem("col2Header", col2Header);
    localStorage.setItem("col3Header", col3Header);
    localStorage.setItem("col4Header", col4Header);
    localStorage.setItem("col5Header", col5Header);
    localStorage.setItem("col6Header", col6Header);
    localStorage.setItem("monthlyAdvice", monthlyAdvice);
  }, [studentName, studentClass, studentRoll, selectedMonth, daysCount, startDayIndex, col1Header, col2Header, col3Header, col4Header, col5Header, col6Header, monthlyAdvice]);

  useEffect(() => {
    localStorage.setItem("routineRows", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    localStorage.setItem("principalApproved", principalApproved ? "true" : "false");
    localStorage.setItem("principalInstruction", principalInstruction);
    localStorage.setItem("principalName", principalName);
  }, [principalApproved, principalInstruction, principalName]);

  // Handle evening subject text update
  const updateEveningText = (date: number, text: string) => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return { ...row, eveningSubject: text };
      }
      return row;
    }));
  };

  // Handle actual custom inputs/deviations for each checkbox column
  const updateCellValue = (date: number, key: "col1Val" | "col2Val" | "col3Val" | "col4Val" | "col5Val" | "col6Val", text: string) => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return { ...row, [key]: text };
      }
      return row;
    }));
  };

  // Handle daily encouraging note update
  const updateDailyNoteText = (date: number, text: string) => {
    setRows(prev => prev.map(row => {
      if (row.date === date) {
        return { ...row, dailyNote: text };
      }
      return row;
    }));
  };

  const exportData = (format: "json" | "csv") => {
    try {
      const fileNameStudent = studentName.trim().replace(/\s+/g, "_") || "student";
      const fileNameMonth = selectedMonth.trim().replace(/\s+/g, "_") || "month";
      
      if (format === "json") {
        const exportObj = {
          exportDate: new Date().toISOString(),
          studentName,
          studentClass,
          studentRoll,
          selectedMonth,
          daysCount,
          startDayIndex,
          col1Header,
          col2Header,
          col3Header,
          col4Header,
          col5Header,
          col6Header,
          monthlyAdvice,
          rows
        };
        const jsonStr = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `shuddhachar_progress_${fileNameStudent}_${fileNameMonth}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const csvHeaders = [
          "Date",
          "Weekday",
          `Morning Habit (${col1Header.slice(0, 35)}...)`,
          `Politeness Habit (${col2Header.slice(0, 35)}...)`,
          `Study Habit (${col3Header.slice(0, 35)}...)`,
          `Parent Help Habit (${col4Header.slice(0, 35)}...)`,
          "Evening Subject Detail",
          "Daily Comments/Evaluation",
          "Daily Reflection text (Goal)"
        ];

        const csvRows = rows.map(r => {
          const wk = getWeekday(r.date);
          const col1 = r.col1Checked ? "Yes" : "No";
          const col2 = r.col2Checked ? "Yes" : "No";
          const col3 = r.col3Checked ? "Yes" : "No";
          const col4 = r.col4Checked ? "Yes" : "No";
          const evening = r.eveningSubject || "";
          const note = r.dailyNote || "";
          const goal = r.dailyGoal || "";

          return [
            r.date,
            wk.name,
            col1,
            col2,
            col3,
            col4,
            `"${evening.replace(/"/g, '""')}"`,
            `"${note.replace(/"/g, '""')}"`,
            `"${goal.replace(/"/g, '""')}"`
          ];
        });

        const csvContent = [
          `"Student Name","${studentName.replace(/"/g, '""')}"`,
          `"Class","${studentClass.replace(/"/g, '""')}"`,
          `"Roll","${studentRoll.replace(/"/g, '""')}"`,
          `"Month","${selectedMonth.replace(/"/g, '""')}"`,
          "",
          csvHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
          ...csvRows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `shuddhachar_progress_${fileNameStudent}_${fileNameMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("তথ্য রফতানি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  // Convert row index to weekday object
  const getWeekday = (dateNum: number) => {
    const idx = (startDayIndex + dateNum - 1) % 7;
    return WEEKDAYS[idx];
  };

  const handleSupabasePush = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSupabaseSyncMsg({ type: "error", text: "দয়া করে সুপাবেস ইউআরএল (URL) এবং অ্যানন কি (Anon Key) প্রদান করুন!" });
      return;
    }

    setIsSupabaseSaving(true);
    setSupabaseSyncMsg({ type: "info", text: "সুপাবেস ডেটাবেজের সাথে যোগাযোগ করা হচ্ছে..." });

    let targetUrl = supabaseUrl.trim();
    if (!targetUrl.startsWith("http")) {
      targetUrl = `https://${targetUrl}`;
    }
    targetUrl = targetUrl.replace(/\/$/, "");

    const endpoint = `${targetUrl}/rest/v1/routines`;
    const cleanedId = studentName.trim() ? `${studentName.trim().replace(/\s+/g, "-")}-${studentRoll}` : `student-${studentRoll}`;
    
    const payload = {
      id: cleanedId,
      student_name: studentName,
      student_roll: studentRoll,
      student_class: studentClass,
      month_name: selectedMonth,
      total_days: daysCount,
      last_updated: new Date().toISOString(),
      rows: rows
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "apikey": supabaseAnonKey.trim(),
          "Authorization": `Bearer ${supabaseAnonKey.trim()}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        localStorage.setItem("supabase_url", supabaseUrl.trim());
        localStorage.setItem("supabase_anon_key", supabaseAnonKey.trim());
        setSupabaseSyncMsg({ 
          type: "success", 
          text: `সফলভাবে ক্লাউডে আপলোড হয়েছে! সুপাবেসে আপনার শিক্ষার্থীর আইডি '${cleanedId}' নামে ডেটাবেজে ব্যাকআপ করা হয়েছে।` 
        });
      } else {
        const errText = await response.text();
        let banglaErr = "সংযুক্ত হতে ব্যর্থ হয়েছে। ";
        if (errText.includes("relation") && errText.includes("does not exist")) {
          banglaErr += "নিচে দেওয়া SQL রান করে 'routines' টেবিলটি সুপাবেসে তৈরি করে নিন।";
        } else if (response.status === 401 || response.status === 403) {
          banglaErr += "আপনার সুপাবেস Anon Key সঠিক নয়। দয়া করে কী-টি চেক করুন।";
        } else {
          try {
            const parsedErr = JSON.parse(errText);
            banglaErr += parsedErr.message || errText;
          } catch {
            banglaErr += `সিস্টেম উত্তর: ${errText || `স্ট্যাটাস কোড ${response.status}`}`;
          }
        }
        setSupabaseSyncMsg({ type: "error", text: banglaErr });
      }
    } catch (error: any) {
      setSupabaseSyncMsg({ type: "error", text: `নেটওয়ার্ক ত্রুটি: ${error?.message || "সার্ভারে সংযোগ করা সম্ভব হয়নি।"}` });
    } finally {
      setIsSupabaseSaving(false);
    }
  };

  const handleSupabasePull = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setSupabaseSyncMsg({ type: "error", text: "দয়া করে সুপাবেস ইউআরএল (URL) এবং অ্যানন কি (Anon Key) প্রদান করুন!" });
      return;
    }

    setIsSupabaseLoading(true);
    setSupabaseSyncMsg({ type: "info", text: "সুপাবেস ডেটাবেজ থেকে ডেটা খোঁজা হচ্ছে..." });

    let targetUrl = supabaseUrl.trim();
    if (!targetUrl.startsWith("http")) {
      targetUrl = `https://${targetUrl}`;
    }
    targetUrl = targetUrl.replace(/\/$/, "");

    const cleanedId = studentName.trim() ? `${studentName.trim().replace(/\s+/g, "-")}-${studentRoll}` : `student-${studentRoll}`;
    const endpoint = `${targetUrl}/rest/v1/routines?id=eq.${encodeURIComponent(cleanedId)}`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "apikey": supabaseAnonKey.trim(),
          "Authorization": `Bearer ${supabaseAnonKey.trim()}`,
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const item = data[0];
          
          if (item.student_name) setStudentName(item.student_name);
          if (item.student_roll) setStudentRoll(item.student_roll);
          if (item.student_class) setStudentClass(item.student_class);
          if (item.month_name) setSelectedMonth(item.month_name);
          
          const loadedRows = Array.isArray(item.rows)
            ? item.rows.map((r: any) => ({
                ...r,
                dailyGoal: r.dailyGoal || "",
                col1Val: r.col1Val || "",
                col2Val: r.col2Val || "",
                col3Val: r.col3Val || "",
                col4Val: r.col4Val || ""
              }))
            : [];
            
          if (loadedRows.length > 0) {
            setRows(loadedRows);
            setDaysCount(loadedRows.length);
            localStorage.setItem("supabase_url", supabaseUrl.trim());
            localStorage.setItem("supabase_anon_key", supabaseAnonKey.trim());
            setSupabaseSyncMsg({ 
              type: "success", 
              text: `সফলভাবে ক্লাউড থেকে ডেটা লোড হয়েছে! শিক্ষার্থীর রুটিন গ্রিড আপডেট করা হয়েছে।` 
            });
          } else {
            setSupabaseSyncMsg({ type: "error", text: "লোডেড ডেটার রুটিন গ্রিড ফাঁকা ছিল।" });
          }
        } else {
          setSupabaseSyncMsg({ 
            type: "error", 
            text: `সুপাবেস টেবিলে এই শিক্ষার্থীর আইডি (${cleanedId}) দিয়ে কোনো রেকর্ড পাওয়া যায়নি। প্রথমে ডানের বাটনটি চেপে পুশ (Push) করুন।` 
          });
        }
      } else {
        const errText = await response.text();
        let banglaErr = "ডেটা আনতে ব্যর্থ হয়েছে। ";
        if (response.status === 401 || response.status === 403) {
          banglaErr += "আপনার সুপাবেস Anon Key সঠিক নয়।";
        } else {
          banglaErr += `সিস্টেম উত্তর: ${errText || `স্ট্যাটাস কোড ${response.status}`}`;
        }
        setSupabaseSyncMsg({ type: "error", text: banglaErr });
      }
    } catch (error: any) {
      setSupabaseSyncMsg({ type: "error", text: `নেটওয়ার্ক ত্রুটি: ${error?.message || "সার্ভারে সংযোগ করা সম্ভব হয়নি।"}` });
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  const applyPreset = (presetType: "moral" | "study") => {
    setActivePreset(presetType);
    localStorage.setItem("activePreset", presetType);
    if (presetType === "moral") {
      setCol1Header("ভোর ৫:০০ (ঘুম থেকে ওঠা, ফজর নামাজ ও নিয়মানুবর্তী আমল)");
      setCol2Header("সব বড়দের সালাম দেওয়া, নম্র আচরণ ও সৌজন্য প্রকাশ");
      setCol3Header("সুপরিকল্পিত পড়াশোনা ও সময়ের সঠিক ব্যবহার");
      setCol4Header("পরিষ্কার-পরিচ্ছন্নতা রক্ষা ও বাবা-মাকে কাজে সাহায্য");
      setCol5Header("সন্ধ্যা ৭:০০-৯:০০ (শিষ্টাচার পাঠ, নৈতিক গল্প ও সাধারণ জ্ঞান)");
      setCol6Header("দৈনিক উৎসাহমূলক মন্তব্য এবং পরামর্শ (অভিভাবক/শিক্ষক)");
      setMonthlyAdvice("উত্তম চরিত্র ও সুন্দর আচরণই মানুষের শ্রেষ্ঠ সম্পদ। সর্বদা সত্য কথা বলবে ও সুশৃঙ্খলভাবে নিজের কাজ সম্পন্ন করবে।");
    } else {
      setCol1Header("৫:০০ টা (ঘুম থেকে জাগা, ফজর ও কুরআন পাঠ)");
      setCol2Header("৫:৩০-৮:৩০ (নিবিড় পড়াশোনা ও সকালের পাঠ প্রস্তুত করা)");
      setCol3Header("স্কুল থেকে বিনম্রভাবে ফেরা ও সুন্দর হাতের লেখা অনুশীলন");
      setCol4Header("বিকাল ৪:৩০-৫:৩০ (শারীরিক ব্যায়াম ও খেলাধুলা)");
      setCol5Header("সন্ধ্যা ৭:০০-৯:০০ (নিজে পড়ার গুরুত্বপূর্ণ বিষয় ও বাড়ির কাজ)");
      setCol6Header("অভিভাবকের অনুপ্রেরণামূলক দৈনিক পরামর্শ ও পর্যবেক্ষণ মন্তব্য");
      setMonthlyAdvice("সময়ের সুপরিকল্পিত ব্যবহার এবং নিয়মানুবর্তীতাই জীবনের সাফল্যের মূল চাবিকাঠি। অলসতা ত্যাগ করে সময়ানুসারী হও।");
    }
  };

  // --- Standard Security Firestore Error Handler ---
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: { userId: null, email: null },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    return errInfo;
  };

  // --- Calculate Student Checklist Progress Percentage ---
  const calculateProgress = (item: any) => {
    if (!item.rows || !Array.isArray(item.rows)) return 0;
    const dCount = Number(item.daysCount) || 31;
    
    const hasPrayersTracked = item.rows.some((row: any) => 
      row.fajrChecked !== undefined || 
      row.dhuhrChecked !== undefined || 
      row.asrChecked !== undefined || 
      row.maghribChecked !== undefined || 
      row.ishaChecked !== undefined
    );

    const maxPossible = dCount * (hasPrayersTracked ? 9 : 4);
    let earned = 0;
    item.rows.forEach((row: any) => {
      if (row.col1Checked) earned++;
      if (row.col2Checked) earned++;
      if (row.col3Checked) earned++;
      if (row.col4Checked) earned++;
      if (hasPrayersTracked) {
        if (row.fajrChecked) earned++;
        if (row.dhuhrChecked) earned++;
        if (row.asrChecked) earned++;
        if (row.maghribChecked) earned++;
        if (row.ishaChecked) earned++;
      }
    });
    return maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;
  };

  // --- Cloud Database operations ---
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setSavingStatus("idle");
    const formattedClass = studentClass.trim() || "অনির্ধারিত_শ্রেণি";
    const formattedRoll = studentRoll.trim() || "০";
    const formattedName = studentName.trim() || "অনামিকা";
    const formattedMonth = selectedMonth.trim() || "অনির্ধারিত_মাস";
    const cleanedId = `${formattedClass}_রোল-${formattedRoll}_${formattedName}_${formattedMonth}`.replace(/[\s./#$[\]]/g, "_");
    
    try {
      const docRef = doc(db, "routines", cleanedId);
      await setDoc(docRef, {
        id: cleanedId,
        studentName,
        studentClass,
        studentRoll,
        selectedMonth,
        daysCount,
        startDayIndex,
        col1Header,
        col2Header,
        col3Header,
        col4Header,
        col5Header,
        col6Header,
        monthlyAdvice,
        themeMode,
        density,
        rows,
        principalApproved,
        principalInstruction,
        principalName,
        updatedAt: serverTimestamp()
      });
      setSavingStatus("success");
      setTimeout(() => setSavingStatus("idle"), 3000);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `routines/${cleanedId}`);
      setSavingStatus("error");
      setTimeout(() => setSavingStatus("idle"), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadFromCloud = (item: any) => {
    if (window.confirm(`আপনি কি "${item.studentName}"-এর "${item.selectedMonth}" মাসের রুটিন রেকর্ডটি লোড করতে চান? এটি আপনার বর্তমান স্ক্রিন ডাটা পরিবর্তন করবে।`)) {
      if (item.studentName !== undefined) setStudentName(item.studentName);
      if (item.studentClass !== undefined) setStudentClass(item.studentClass);
      if (item.studentRoll !== undefined) setStudentRoll(item.studentRoll);
      if (item.selectedMonth !== undefined) setSelectedMonth(item.selectedMonth);
      if (item.daysCount !== undefined) setDaysCount(Number(item.daysCount));
      if (item.startDayIndex !== undefined) setStartDayIndex(Number(item.startDayIndex));
      if (item.col1Header !== undefined) setCol1Header(item.col1Header);
      if (item.col2Header !== undefined) setCol2Header(item.col2Header);
      if (item.col3Header !== undefined) setCol3Header(item.col3Header);
      if (item.col4Header !== undefined) setCol4Header(item.col4Header);
      if (item.col5Header !== undefined) setCol5Header(item.col5Header);
      if (item.col6Header !== undefined) setCol6Header(item.col6Header);
      if (item.monthlyAdvice !== undefined) setMonthlyAdvice(item.monthlyAdvice);
      if (item.themeMode !== undefined) setThemeMode(item.themeMode);
      if (item.density !== undefined) setDensity(item.density);
      if (item.principalApproved !== undefined) setPrincipalApproved(!!item.principalApproved);
      if (item.principalInstruction !== undefined) setPrincipalInstruction(item.principalInstruction);
      if (item.principalName !== undefined) setPrincipalName(item.principalName);
      if (item.rows !== undefined) {
        const loadedRows = Array.isArray(item.rows)
          ? item.rows.map((r: any) => ({
              ...r,
              dailyGoal: r.dailyGoal || "",
              col1Val: r.col1Val || "",
              col2Val: r.col2Val || "",
              col3Val: r.col3Val || "",
              col4Val: r.col4Val || ""
            }))
          : item.rows;
        setRows(loadedRows);
      }
      
      alert("সাফল্যের সাথে ক্লাউড ডেটা রিস্টোর করা হয়েছে!");
    }
  };

  const handleLoadAndDirectPrint = (item: any) => {
    if (item.studentName !== undefined) setStudentName(item.studentName);
    if (item.studentClass !== undefined) setStudentClass(item.studentClass);
    if (item.studentRoll !== undefined) setStudentRoll(item.studentRoll);
    if (item.selectedMonth !== undefined) setSelectedMonth(item.selectedMonth);
    if (item.daysCount !== undefined) setDaysCount(Number(item.daysCount));
    if (item.startDayIndex !== undefined) setStartDayIndex(Number(item.startDayIndex));
    if (item.col1Header !== undefined) setCol1Header(item.col1Header);
    if (item.col2Header !== undefined) setCol2Header(item.col2Header);
    if (item.col3Header !== undefined) setCol3Header(item.col3Header);
    if (item.col4Header !== undefined) setCol4Header(item.col4Header);
    if (item.col5Header !== undefined) setCol5Header(item.col5Header);
    if (item.col6Header !== undefined) setCol6Header(item.col6Header);
    if (item.monthlyAdvice !== undefined) setMonthlyAdvice(item.monthlyAdvice);
    if (item.themeMode !== undefined) setThemeMode(item.themeMode);
    if (item.density !== undefined) setDensity(item.density);
    if (item.principalApproved !== undefined) setPrincipalApproved(!!item.principalApproved);
    if (item.principalInstruction !== undefined) setPrincipalInstruction(item.principalInstruction);
    if (item.principalName !== undefined) setPrincipalName(item.principalName);
    if (item.rows !== undefined) {
      const loadedRows = Array.isArray(item.rows)
        ? item.rows.map((r: any) => ({
            ...r,
            dailyGoal: r.dailyGoal || "",
            col1Val: r.col1Val || "",
            col2Val: r.col2Val || "",
            col3Val: r.col3Val || "",
            col4Val: r.col4Val || ""
          }))
        : item.rows;
      setRows(loadedRows);
    }
    
    // Switch to routine printed tab
    setActiveTab("routine");
    
    // Delay to let React render completed modifications and then print
    setTimeout(() => {
      handlePrint();
    }, 200);
  };

  const handleCreateNewStudentAndSave = async () => {
    const sName = entryName.trim();
    const sRoll = entryRoll.trim();
    if (!sName) {
      alert("দয়া করে শিক্ষার্থীর নাম প্রদান করুন।");
      return;
    }
    if (!sRoll) {
      alert("দয়া করে রোল নম্বর প্রদান করুন।");
      return;
    }
    
    setIsSaving(true);
    setSavingStatus("idle");
    const formattedClass = entryClass.trim();
    const formattedRoll = sRoll;
    const formattedName = sName;
    const formattedMonth = entryMonth.trim() || selectedMonth;
    const cleanedId = `${formattedClass}_রোল-${formattedRoll}_${formattedName}_${formattedMonth}`.replace(/[\s./#$[\]]/g, "_");
    
    try {
      // Setup default column names relative to the selected target preset of the entry
      let col1Name = "ভোর ৫:০০ (ঘুম থেকে ওঠা, ফজর নামাজ ও নিয়মানুবর্তী আমল)";
      let col2Name = "সব বড়দের সালাম দেওয়া, নম্র আচরণ ও সৌজন্য প্রকাশ";
      let col3Name = "সুপরিকল্পিত পড়াশোনা ও সময়ের সঠিক ব্যবহার";
      let col4Name = "পরিষ্কার-পরিচ্ছন্নতা রক্ষা ও বাবা-মাকে কাজে সাহায্য";
      let col5Name = "সন্ধ্যা ৭:০০-৯:০০ (শিষ্টাচার পাঠ, নৈতিক গল্প ও সাধারণ জ্ঞান)";
      let col6Name = "দৈনিক উৎসাহমূলক মন্তব্য এবং পরামর্শ (অভিভাবক/শিক্ষক)";
      let adviceText = "উত্তম চরিত্র ও সুন্দর আচরণই মানুষের শ্রেষ্ঠ সম্পদ। সর্বদা সত্য কথা বলবে ও সুশৃঙ্খলভাবে নিজের কাজ সম্পন্ন করবে।";

      if (entryPreset === "study") {
        col1Name = "৫:০০ টা (ঘুম থেকে জাগা, ফজর ও কুরআন পাঠ)";
        col2Name = "৫:৩০-৮:৩০ (নিবিড় পড়াশোনা ও সকালের পাঠ প্রস্তুত করা)";
        col3Name = "স্কুল থেকে বিনম্রভাবে ফেরা ও সুন্দর হাতের লেখা অনুশীলন";
        col4Name = "বিকাল ৪:৩০-৫:৩০ (শারীরিক ব্যায়াম ও খেলাধুলা)";
        col5Name = "সন্ধ্যা ৭:০০-৯:০০ (নিজে পড়ার গুরুত্বপূর্ণ বিষয় ও বাড়ির কাজ)";
        col6Name = "অভিভাবকের অনুপ্রেরণামূলক দৈনিক পরামর্শ ও পর্যবেক্ষণ মন্তব্য";
        adviceText = "সময়ের সুপরিকল্পিত ব্যবহার এবং নিয়মানুবর্তীতাই জীবনের সাফল্যের মূল চাবিকাঠি। অলসতা ত্যাগ করে সময়ানুসারী হও।";
      }

      const blankRows = Array.from({ length: daysCount }, (_, i) => ({
        date: i + 1,
        col1Checked: false,
        col2Checked: false,
        col3Checked: false,
        col4Checked: false,
        eveningSubject: "",
        dailyNote: "",
        dailyGoal: "",
        col1Val: "",
        col2Val: "",
        col3Val: "",
        col4Val: ""
      }));

      const docRef = doc(db, "routines", cleanedId);
      await setDoc(docRef, {
        id: cleanedId,
        studentName: formattedName,
        studentClass: formattedClass,
        studentRoll: formattedRoll,
        selectedMonth: formattedMonth,
        daysCount,
        startDayIndex,
        col1Header: col1Name,
        col2Header: col2Name,
        col3Header: col3Name,
        col4Header: col4Name,
        col5Header: col5Name,
        col6Header: col6Name,
        monthlyAdvice: adviceText,
        themeMode,
        density,
        rows: blankRows,
        updatedAt: serverTimestamp()
      });
      
      setSavingStatus("success");
      
      // Auto populate the active workspace with the newly registered student
      setStudentName(formattedName);
      setStudentClass(formattedClass);
      setStudentRoll(formattedRoll);
      setSelectedMonth(formattedMonth);
      setRows(blankRows);
      
      // Clear form inputs
      setEntryName("");
      setEntryRoll("");
      
      // Switch back to checklist directory
      setManagerTab("directory");
      setClassFilter(formattedClass);
      
      alert(`সাফল্যের সাথে '${formattedName}' (শ্রেণী: ${formattedClass}, রোল: ${formattedRoll})-কে সিস্টেমে রেজিস্টার ও তার রুটিন প্রস্তুত করা হয়েছে!`);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `routines/${cleanedId}`);
      setSavingStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFromCloud = async (id: string, e: any) => {
    e.stopPropagation();
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই রেকর্ডটি ক্লাউড ডাটাবেজ থেকে মুছে ফেলতে চান? এটি আর পুনরায় উদ্ধার করা যাবে না।")) {
      try {
        const { doc, deleteDoc } = require("firebase/firestore");
        const { db } = require("./lib/firebase"); // Or wherever db is imported from
        await deleteDoc(doc(db, "routines", id));
        alert("রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে!");
      } catch (err) {
        alert("রেকর্ডটি মুছতে ত্রুটি হয়েছে!");
      }
    }
  };

  // --- Filtered Saved Student Routines in Directory ---
  const filteredRoutines = useMemo(() => {
    return savedRoutines.filter(item => {
      const matchClass = classFilter === "all" || item.studentClass?.trim() === classFilter.trim();
      
      const query = rollFilterQuery.trim().toLowerCase();
      const matchQuery = !query || 
        (item.studentRoll && item.studentRoll.toString().toLowerCase().includes(query)) ||
        (item.studentName && item.studentName.toLowerCase().includes(query));
      
      return matchClass && matchQuery;
    });
  }, [savedRoutines, classFilter, rollFilterQuery]);

  // --- Statistics Calculations for Progress Tab ---
  const statistics = useMemo(() => {
    const hasPrayers = rows.some(r => 
      r.fajrChecked !== undefined || 
      r.dhuhrChecked !== undefined || 
      r.asrChecked !== undefined || 
      r.maghribChecked !== undefined || 
      r.ishaChecked !== undefined
    );

    const columnsList = [
      { label: col1Header, count: 0, percentage: 0, color: "bg-amber-500", stroke: "#d97706", fill: "#fef3c7", trend: [] as number[] },
      ...(hasPrayers ? [{ label: "নামাজ (৫ ওয়াক্ত)", count: 0, percentage: 0, color: "bg-emerald-500", stroke: "#059669", fill: "#d1fae5", trend: [] as number[] }] : []),
      { label: col3Header, count: 0, percentage: 0, color: "bg-indigo-500", stroke: "#4f46e5", fill: "#e0e7ff", trend: [] as number[] },
      { label: col4Header, count: 0, percentage: 0, color: "bg-violet-500", stroke: "#7c3aed", fill: "#ede9fe", trend: [] as number[] },
      { label: col5Header, count: 0, percentage: 0, color: "bg-cyan-500", stroke: "#0891b2", fill: "#ecfeff", trend: [] as number[] },
      { label: col6Header, count: 0, percentage: 0, color: "bg-pink-500", stroke: "#db2777", fill: "#fdf2f8", trend: [] as number[] },
    ];

    rows.forEach(r => {
      const isCol1Checked = !!r.col1Checked;
      if (isCol1Checked) columnsList[0].count++;
      columnsList[0].trend.push(isCol1Checked ? 1 : 0);

      if (hasPrayers) {
        let dailyPrayers = 0;
        if (r.fajrChecked) dailyPrayers++;
        if (r.dhuhrChecked) dailyPrayers++;
        if (r.asrChecked) dailyPrayers++;
        if (r.maghribChecked) dailyPrayers++;
        if (r.ishaChecked) dailyPrayers++;
        
        columnsList[1].count += dailyPrayers;
        columnsList[1].trend.push(dailyPrayers / 5);
        
        const isCol3Checked = !!r.col3Checked;
        if (isCol3Checked) columnsList[2].count++;
        columnsList[2].trend.push(isCol3Checked ? 1 : 0);

        const isCol4Checked = !!r.col4Checked;
        if (isCol4Checked) columnsList[3].count++;
        columnsList[3].trend.push(isCol4Checked ? 1 : 0);

        const isCol5Checked = !!r.col5Checked;
        if (isCol5Checked) columnsList[4].count++;
        columnsList[4].trend.push(isCol5Checked ? 1 : 0);

        const isCol6Checked = !!r.col6Checked;
        if (isCol6Checked) columnsList[5].count++;
        columnsList[5].trend.push(isCol6Checked ? 1 : 0);
      } else {
        const isCol3Checked = !!r.col3Checked;
        if (isCol3Checked) columnsList[1].count++;
        columnsList[1].trend.push(isCol3Checked ? 1 : 0);

        const isCol4Checked = !!r.col4Checked;
        if (isCol4Checked) columnsList[2].count++;
        columnsList[2].trend.push(isCol4Checked ? 1 : 0);

        const isCol5Checked = !!r.col5Checked;
        if (isCol5Checked) columnsList[3].count++;
        columnsList[3].trend.push(isCol5Checked ? 1 : 0);

        const isCol6Checked = !!r.col6Checked;
        if (isCol6Checked) columnsList[4].count++;
        columnsList[4].trend.push(isCol6Checked ? 1 : 0);
      }
    });

    columnsList.forEach((col, idx) => {
      if (hasPrayers && idx === 1) {
        col.percentage = daysCount > 0 ? Math.round((col.count / (daysCount * 5)) * 100) : 0;
      } else {
        col.percentage = daysCount > 0 ? Math.round((col.count / daysCount) * 100) : 0;
      }
    });

    let bestColumn = columnsList[0];
    columnsList.forEach(col => {
      if (col.percentage > bestColumn.percentage) {
        bestColumn = col;
      }
    });

    // Max consecutive streak (days with satisfying ticks)
    let maxStreak = 0;
    let currentStreak = 0;
    rows.forEach(r => {
      let tickedCount = 0;
      if (r.col1Checked) tickedCount++;
      if (r.col3Checked) tickedCount++;
      if (r.col4Checked) tickedCount++;
      if (r.col5Checked) tickedCount++;
      if (r.col6Checked) tickedCount++;
      if (hasPrayers) {
        if (r.fajrChecked) tickedCount++;
        if (r.dhuhrChecked) tickedCount++;
        if (r.asrChecked) tickedCount++;
        if (r.maghribChecked) tickedCount++;
        if (r.ishaChecked) tickedCount++;
      }
      
      const threshold = hasPrayers ? 5 : 3;
      if (tickedCount >= threshold) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    });

    return {
      columnsList,
      bestColumn,
      maxStreak
    };
  }, [rows, daysCount, col1Header, col2Header, col3Header, col4Header, col5Header, col6Header]);

  const getSizingClasses = () => {
    switch (density) {
      case "compact":
        return {
          rowHeight: "h-7 sm:h-8",
          cellPadding: "py-0.5 px-1",
          fontSize: "text-[11px] sm:text-[12px]",
          titleSize: "text-xl sm:text-2xl",
          gapSize: "gap-2"
        };
      case "spacious":
        return {
          rowHeight: "h-10",
          cellPadding: "py-2 px-1.5",
          fontSize: "text-[14px]",
          titleSize: "text-2xl sm:text-3xl",
          gapSize: "gap-4"
        };
      default: // normal
        return {
          rowHeight: "h-8 sm:h-9",
          cellPadding: "py-1 px-1",
          fontSize: "text-[12px] sm:text-[13px]",
          titleSize: "text-2xl",
          gapSize: "gap-3"
        };
    }
  };

  const sizes = getSizingClasses();

  // --- Derived Calculations from rows state ---
  const hasPrayersTracked = useMemo(() => {
    return rows.some(row => 
      row.fajrChecked !== undefined || 
      row.dhuhrChecked !== undefined || 
      row.asrChecked !== undefined || 
      row.maghribChecked !== undefined || 
      row.ishaChecked !== undefined
    );
  }, [rows]);

  const maxPossiblePoints = useMemo(() => {
    return daysCount * (hasPrayersTracked ? 10 : 5);
  }, [daysCount, hasPrayersTracked]);

  const totalEarnedPoints = useMemo(() => {
    let earned = 0;
    rows.forEach(r => {
      // 5 prayers: 1 point each
      if (hasPrayersTracked) {
        if (r.fajrChecked) earned += 1;
        if (r.dhuhrChecked) earned += 1;
        if (r.asrChecked) earned += 1;
        if (r.maghribChecked) earned += 1;
        if (r.ishaChecked) earned += 1;
      }
      
      // 5 custom columns: 1.0 point if checked, 0.5 point if not checked but has manual value written
      if (r.col1Checked) {
        earned += 1;
      } else if (r.col1Val && r.col1Val.trim() !== "") {
        earned += 0.5;
      }

      if (r.col3Checked) {
        earned += 1;
      } else if (r.col3Val && r.col3Val.trim() !== "") {
        earned += 0.5;
      }

      if (r.col4Checked) {
        earned += 1;
      } else if (r.col4Val && r.col4Val.trim() !== "") {
        earned += 0.5;
      }

      if (r.col5Checked) {
        earned += 1;
      } else if (r.col5Val && r.col5Val.trim() !== "") {
        earned += 0.5;
      }

      if (r.col6Checked) {
        earned += 1;
      } else if (r.col6Val && r.col6Val.trim() !== "") {
        earned += 0.5;
      }
    });
    return earned;
  }, [rows, hasPrayersTracked]);

  const earnedPercentage = useMemo(() => {
    return maxPossiblePoints > 0 ? Math.round((totalEarnedPoints / maxPossiblePoints) * 100) : 0;
  }, [totalEarnedPoints, maxPossiblePoints]);

  const currentMedal = useMemo(() => {
    if (certAwardOverride && certAwardOverride !== "auto") {
      return certAwardOverride; // Let manual override win if set ("gold", "silver", "bronze")
    }
    // Auto assignment
    if (earnedPercentage >= 85) return "gold";
    if (earnedPercentage >= 70) return "silver";
    if (earnedPercentage >= 50) return "bronze";
    return "";
  }, [earnedPercentage, certAwardOverride]);

  const weeklyProgress = useMemo(() => {
    const weeksList = [
      { label: "১ম সপ্তাহ", startDay: 1, endDay: 7 },
      { label: "২য় সপ্তাহ", startDay: 8, endDay: 14 },
      { label: "৩য় সপ্তাহ", startDay: 15, endDay: 21 },
      { label: "৪র্থ সপ্তাহ", startDay: 22, endDay: 28 },
      { label: "৫ম সপ্তাহ", startDay: 29, endDay: daysCount },
    ];
    
    return weeksList.map((wk) => {
      let scored = 0;
      let totalDays = 0;
      
      rows.forEach(r => {
        if (r.date >= wk.startDay && r.date <= wk.endDay) {
          totalDays++;
          if (r.col1Checked) scored++;
          if (r.col2Checked) scored++;
          if (r.col3Checked) scored++;
          if (r.col4Checked) scored++;
          if (hasPrayersTracked) {
            if (r.fajrChecked) scored++;
            if (r.dhuhrChecked) scored++;
            if (r.asrChecked) scored++;
            if (r.maghribChecked) scored++;
            if (r.ishaChecked) scored++;
          }
        }
      });
      
      const maxScore = totalDays * (hasPrayersTracked ? 9 : 4);
      const percentage = maxScore > 0 ? Math.round((scored / maxScore) * 100) : 0;
      
      return {
        label: wk.label,
        scored,
        maxScore,
        percentage
      };
    }).filter(wk => wk.maxScore > 0); // Don't return empty weeks if daysCount < startDay
  }, [rows, daysCount]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col font-sans selection:bg-black selection:text-white" id="container-root">
      
      {/* UPPER CONTROLLER HEADER & PRINT ALERTS - HIDDEN DURING PRINTING */}
      <div className="no-print w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded">
                শিষ্টাচার, শুদ্ধাচার ও নৈতিক প্রজেক্ট ২০২৬
              </span>
              <span className="text-xs text-gray-500 font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                A4 Portrait Format
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              শিশু-কিশোর শিষ্টাচার ও নিয়মানুবর্তীতা ট্র্যাকার
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              ভুল অভ্যাস দূরীকরণ, সৌজন্য ও শুদ্ধাচার শিক্ষণ এবং অভিভাবক ক্লাউড রেকর্ড ডেটাবেস।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={resetAllData}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-red-650 transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              id="reset-state-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>রিসেট করুন</span>
            </button>

            <button
               onClick={handlePrint}
               className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-md active:scale-95 cursor-pointer bg-black"
               id="print-action-btn"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>
                {activeTab === "routine" 
                  ? "A4 রুটিন প্রিন্ট / PDF ডাউনলোড" 
                  : activeTab === "certificate" 
                  ? "A4 এওয়ার্ড সার্টিফিকেট প্রিন্ট" 
                  : activeTab === "summary"
                  ? "A4 প্রগতি প্রতিবেদন প্রিন্ট"
                  : "প্রিন্ট প্রযোজ্য নয়"
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL ALIGNMENT ERROR RESOLUTION BANNER (DELIGHTFUL USER EXPERIENCE) */}
      <div className="no-print bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">⚠️ প্রিন্ট বাটন কাজ করছে না / ডাউনলোড পপআপ আসছে না? </span>
            ভঙ্গুর আইফ্রেম (Iframe) নিরাপত্তা ব্লকের কারণে ব্রাউজার সরাসরি প্রিন্ট রিকোয়েস্ট আটকে দেয়। সমাধান খুবই সহজ! অনুগ্রহ করে এখনই উপরে ডান দিকের মেম্বর কর্নারে থাকা <span className="font-bold bg-amber-100 px-1 py-0.5 border border-amber-350 rounded">"Open in new tab / নতুন ট্যাবে খুলুন (↗)"</span> বাটনে ক্লিক করে অ্যাপ্লিকেশনটি নতুন উইন্ডোতে লোড করুন। নতুন ট্যাবে গিয়ে "প্রিন্ট" বাটনে ক্লিক করলেই ম্যাজিকের মতো ১০০% সফলভাবে A4 পিডিএফ প্রিন্ট করতে পারবেন।
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* SIDEBAR SIDE CONTROLLER BAR */}
        <section className="no-print w-full lg:w-[24rem] shrink-0 flex flex-col gap-5">
          
          {/* Mission & Preset Config Panel */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>১. অভ্যাস সংশোধন ও মিশন প্রিসেট</span>
              </span>
            </h2>
            <p className="text-[11px] text-gray-500 mb-3.5 leading-relaxed">
              লালিত ভুল অভ্যাস দূর করে শিশুদের মার্জিত সৌজন্যবোধ, সঠিক শিষ্টাচার ও শুদ্ধাচার চর্চার লক্ষ্যে কলামগুলো সাজাতে নিচের যে কোনো একটি প্রিসেট বাটন চাপুন:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => applyPreset("moral")}
                type="button"
                className="py-2.5 px-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold text-center transition active:scale-95 cursor-pointer"
              >
                🤝 সৌজন্য ও শিষ্টাচার ফোকাস
              </button>
              <button
                onClick={() => applyPreset("study")}
                type="button"
                className="py-2.5 px-2 bg-gradient-to-br from-indigo-50 to-indigo-100/50 hover:from-indigo-100 hover:to-indigo-200 text-indigo-900 border border-indigo-200 rounded-lg text-[11px] font-bold text-center transition active:scale-95 cursor-pointer"
              >
                📖 নিয়মানুবর্তী অধ্যয়ন ফোকাস
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">মিশনের মূল উদ্দেশ্য:</span>
              <p className="text-[11px] text-slate-650 leading-normal">
                শিশুদের মার্জিত ব্যবহার, মেজাজ নিয়ন্ত্রণ করা, মা-বাবার অবাধ্যতা পরিহার করা, বড়দের শ্রদ্ধা ও সালাম প্রদান এবং নিজের কাজ নিয়মতান্ত্রিক উপায়ে শেষ করার স্থায়ী অভ্যাস গঠন।
              </p>
            </div>
          </div>

          {/* Student Identifiers Card */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-750" />
              <span>২. শিক্ষার্থীর ও মাসের পরিচিতি</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">শিক্ষার্থীর নাম (Name)</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black outline-none transition"
                  placeholder="যেমন: আহমেদ হাসান"
                  id="student-name-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণী (Class)</label>
                  <select
                    value={SCHOOL_CLASSES.includes(studentClass) ? studentClass : (studentClass === "" ? "" : "other")}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "other") {
                        setStudentClass("কাস্টম শ্রেণি");
                      } else {
                        setStudentClass(val);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black outline-none transition font-semibold text-slate-800"
                    id="student-class-field-select"
                  >
                    <option value="">শ্রেণি নির্বাচন...</option>
                    {SCHOOL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls} শ্রেণি</option>
                    ))}
                    <option value="other">অন্যান্য (Custom)...</option>
                  </select>
                  
                  {!SCHOOL_CLASSES.includes(studentClass) && studentClass !== "" && (
                    <input
                      type="text"
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      className="w-full mt-1.5 px-3 py-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg focus:bg-white focus:border-black outline-none transition font-bold text-amber-900"
                      placeholder="হাতে টাইপ করুন..."
                      id="student-class-field"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">রোল নম্বর (Roll)</label>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black outline-none transition text-center font-bold"
                    placeholder="যেমন: ০৫"
                    id="student-roll-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মাস ও বছর (Month Name)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-black outline-none transition font-semibold text-indigo-900"
                    placeholder="যেমন: জানুয়ারি ২০২৬"
                    id="selected-month-field"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {PRESET_MONTHS.slice(0, 6).map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMonth(`${m} ২০২৬`)}
                      type="button"
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded px-2 py-1 transition-all"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Persistent Cloud Database List & Sync */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-600" />
                <span>৩. রুটিন ও প্রগ্রেস রেকর্ড ক্লাউড</span>
              </span>
              <span className="animate-ping w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
              সরাসরি ক্লাউড ফায়ারস্টোর ডাটাবেজে আপনার শিক্ষার্থীর তথ্য সেভ ও আগের মাসের রেকর্ডসমূহ পুনরুদ্ধার করুন।
            </p>

            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isSaving 
                  ? "bg-slate-100 text-slate-400 border border-slate-350 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
              <span>{isSaving ? "সংরক্ষণ করা হচ্ছে..." : "চলতি রুটিন ক্লাউডে সংরক্ষণ করুন"}</span>
            </button>

            {/* Cloud Feedback Indicators */}
            {savingStatus === "success" && (
              <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1.5 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>সাফল্যের সাথে ক্লাউড ডাটাবেজে রেকর্ড করা হয়েছে!</span>
              </div>
            )}
            {savingStatus === "error" && (
              <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>সংরক্ষণ ব্যর্থ! ডাটাবেজ সংযোগ পুনরায় পরীক্ষা করুন।</span>
              </div>
            )}

            {/* Database saved record items display list */}
            <div className="mt-5 border-t border-slate-150 pt-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">সংরক্ষিত রুটিনসমূহ (ডাটাবেজ রেকর্ড)</span>
              {isLoadingCloud ? (
                <div className="text-center py-4 flex flex-col items-center justify-center gap-1.5">
                  <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">রেকর্ড পড়া হচ্ছে...</span>
                </div>
              ) : savedRoutines.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  কোনো সংরক্ষিত ডেটা রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {savedRoutines.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleLoadFromCloud(item)}
                      className="group p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-lg cursor-pointer transition flex items-center justify-between text-left"
                    >
                      <div className="truncate flex-1 pr-2">
                        <p className="text-xs font-black text-slate-800 truncate group-hover:text-indigo-900">
                          {item.studentName || "অনামিকা"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          {item.selectedMonth} • {item.studentClass}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                          লোড
                        </span>
                        <button
                          onClick={(e) => handleDeleteFromCloud(item.id, e)}
                          className="p-1 text-slate-450 hover:text-red-650 hover:bg-red-50 rounded transition"
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
          </div>

          {/* Calendar Geometry Adjuster */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-750" />
              <span>৪. ক্যালেন্ডার পেজ জ্যামিতি</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মোট দিন সংখ্যা</label>
                  <select
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
                    id="days-count-dropdown"
                  >
                    <option value={31}>৩১ দিন (জানু, মার্চ, মে)</option>
                    <option value={30}>৩০ দিন (এপ্রিল, জুন)</option>
                    <option value={29}>২৯ দিন (লিপইয়ার ফেব্রুয়ারি)</option>
                    <option value={28}>২৮ দিন (সাধারণ ফেব্রুয়ারি)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">১ তারিখ শুরু (বার)</label>
                  <select
                    value={startDayIndex}
                    onChange={(e) => setStartDayIndex(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none cursor-pointer"
                    id="week-start-dropdown"
                  >
                    {WEEKDAYS.map((day, ix) => (
                      <option key={ix} value={ix}>
                        {day.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">পৃষ্ঠার ঘনত্ব (Density on Print)</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                  {[
                    { id: "compact", label: "কম্প্যাক্ট" },
                    { id: "normal", label: "স্বাভাবিক" },
                    { id: "spacious", label: "উন্মুক্ত" }
                  ].map(option => (
                    <button
                      key={option.id}
                      onClick={() => setDensity(option.id as any)}
                      type="button"
                      className={`text-[11px] py-1 px-2 rounded font-medium transition cursor-pointer ${
                        density === option.id 
                          ? "bg-white text-slate-900 shadow-sm font-bold" 
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">প্রিন্ট ভিজ্যুয়াল থিম</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setThemeMode("professional-polish")}
                    type="button"
                    className={`py-1.5 px-3 text-xs rounded-lg border text-center transition cursor-pointer ${
                      themeMode === "professional-polish"
                        ? "border-black bg-black text-white font-bold"
                        : "border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    প্রফেশনাল পলিশ
                  </button>
                  <button
                    onClick={() => setThemeMode("mono-black")}
                    type="button"
                    className={`py-1.5 px-3 text-xs rounded-lg border text-center transition cursor-pointer ${
                      themeMode === "mono-black"
                        ? "border-black bg-black text-white font-bold"
                        : "border-gray-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    বিশুদ্ধ মনো-ব্ল্যাক
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Customization Settings (Active when Certificate is Selected) */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AwardLucide className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>৫. প্রশংসাপত্র / মেডেল সেটিং</span>
              </span>
            </h2>
            <p className="text-[11px] text-gray-500 mb-4 leading-normal">
              রুটিন পালনের অগ্রগতি ও গুণগত ব্যবহারের স্বীকৃতিস্বরূপ প্রশংসাপত্রের টেক্সট এখানে কাস্টমাইজ করুন:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-750 mb-0.5">প্রশংসাপত্রের শিরোনাম</label>
                <input
                  type="text"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-black outline-none font-semibold text-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-755 mb-0.5">প্রশংসা বাক্য (সার্টিফিকেট টেক্সট)</label>
                <textarea
                  value={certDescription}
                  onChange={(e) => setCertDescription(e.target.value)}
                  rows={3}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:border-black outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-755 mb-0.5">বামের স্বাক্ষর ক্ষেত্র</label>
                  <input
                    type="text"
                    value={certSignerLeft}
                    onChange={(e) => setCertSignerLeft(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-755 mb-0.5">ডানের স্বাক্ষর ক্ষেত্র</label>
                  <input
                    type="text"
                    value={certSignerRight}
                    onChange={(e) => setCertSignerRight(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-755 mb-1.5">পদক নির্বাচনের ধরণ</label>
                <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg text-[10px] text-center font-bold">
                  {[
                    { id: "auto", label: "অটো" },
                    { id: "gold", label: "স্বর্ণ" },
                    { id: "silver", label: "রৌপ্য" },
                    { id: "bronze", label: "ব্রোঞ্জ" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setCertAwardOverride(opt.id as any)}
                      type="button"
                      className={`py-1 rounded transition cursor-pointer ${
                        certAwardOverride === opt.id 
                          ? "bg-amber-500 text-white shadow-sm" 
                          : "text-slate-650 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Time Header Customizers */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-750" />
              <span>৬. দৈনিক কলামগুলির অনুচ্ছেদ পরিবর্তন</span>
            </h2>

            <div className="space-y-3.5 font-semibold">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">কলাম ১ (ভোর বেলার অভ্যাস ও আমল)</label>
                <input
                  type="text"
                  value={col1Header}
                  onChange={(e) => setCol1Header(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">কলাম ৩ (অধ্যয়ন ও সময় সুপরিকল্পনা)</label>
                <input
                  type="text"
                  value={col3Header}
                  onChange={(e) => setCol3Header(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">কলাম ৪ (পরিষ্কার থাকা ও সাহায্য করা)</label>
                <input
                  type="text"
                  value={col4Header}
                  onChange={(e) => setCol4Header(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">কলাম ৫ (সন্ধ্যা বেলার বিষয়াদি)</label>
                <input
                  type="text"
                  value={col5Header}
                  onChange={(e) => setCol5Header(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Tracking Panel */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-indigo-600 pl-2.5 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-750" />
              <span>৭. কুইক-টিকিং ও বডি এডিটিং</span>
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">ডিজিটাল কুইক-টিকিং (ক্লিক একবারে):</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={checkAllBoxes}
                    type="button"
                    className="py-1.5 px-2 bg-slate-100 hover:bg-black hover:text-white rounded border border-slate-200 text-xs text-slate-800 transition font-medium flex items-center justify-center gap-1 cursor-pointer"
                    id="check-all-button"
                  >
                    সব টিক করুন
                  </button>
                  <button
                    onClick={clearAllBoxes}
                    type="button"
                    className="py-1.5 px-2 bg-slate-50 hover:bg-red-50 hover:text-red-650 border border-slate-200 text-xs text-slate-700 rounded transition font-medium flex items-center justify-center gap-1 cursor-pointer"
                    id="uncheck-all-button"
                  >
                    টিকিং খালি করুন
                  </button>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  *কাগজে কলমে পূরণের জন্য প্রিন্ট করার পূর্বে "টিকিং খালি করুন" দিয়ে ফাঁকা পেজ বের করুন।
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সন্ধ্যা বেলার বিষয়মালা (একবারে সব দিনে বসান)</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={bulkEveningText}
                    onChange={(e) => setBulkEveningText(e.target.value)}
                    placeholder="যেমন: নৈতিক গল্প ও গণিত চর্চা"
                    className="flex-1 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-black"
                    id="bulk-evening-input"
                  />
                  <button
                    onClick={bulkApplyEveningText}
                    type="button"
                    className="bg-black hover:bg-slate-800 text-white text-xs px-3 rounded-lg font-bold transition cursor-pointer"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রুটিনের নিচের মূল উপদেশ / লক্ষ্য</label>
                <textarea
                  value={monthlyAdvice}
                  onChange={(e) => setMonthlyAdvice(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-black outline-none resize-none leading-relaxed"
                  placeholder="রুটিনের একদম নিচের ফুটারে শোভা পাবে।"
                />
              </div>
            </div>
          </div>

          {/* Section 8: Principal Approval Panel */}
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-600 pl-2.5 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>৮. প্রিন্সিপাল মহোদয়ের মূল্যায়ন ও অনুমোদন</span>
            </h2>
            <p className="text-[11px] text-gray-500 mb-4 leading-normal">
              প্রিন্সিপাল মহোদয় তার ডিভাইস থেকে পুরো পরিস্থিতি মূল্যায়ন করে নির্দেশনাসহ অনুমোদন দিলে সেটি রুটিন ও সামারি সিটের ৩য় কলামে স্বয়ংক্রিয়ভাবে সিল ও স্বাক্ষরসহ যুক্ত হয়ে যাবে।
            </p>

            <div className="space-y-3 font-semibold text-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রিন্সিপাল মহোদয়ের নাম / পদবি</label>
                <input
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                  placeholder="যেমন: প্রিন্সিপাল"
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-black outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রিন্সিপাল মহোদয়ের মূল্যায়ন / নির্দেশনা</label>
                <textarea
                  value={principalInstruction}
                  onChange={(e) => setPrincipalInstruction(e.target.value)}
                  rows={2}
                  placeholder="যেমন: প্রগতি সন্তোষজনক, প্রতিদিনের এই নৈতিক চর্চা অব্যাহত রাখো।"
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-black outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 mt-2 select-none">
                <input
                  type="checkbox"
                  id="principal-approved-toggle"
                  checked={principalApproved}
                  onChange={(e) => setPrincipalApproved(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="principal-approved-toggle" className="text-xs font-bold text-slate-750 cursor-pointer">
                  প্রিন্সিপাল অনুমোদন ও স্বাক্ষর সিল যোগ করুন
                </label>
              </div>
            </div>
          </div>
        </section>

        <div className="flex-1 min-w-0 flex flex-col items-center">

        {/* TAB SYSTEM BUTTONS */}
        <div className="no-print w-full max-w-[21cm] flex flex-wrap gap-2 mb-4 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab("routine")}
            className={`flex-1 min-w-[130px] py-3 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "routine"
                ? "bg-black text-white shadow border border-indigo-300"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>১. 📅 মাসিক রুটিন গ্রিড</span>
            </button>
            
            <button
              onClick={() => setActiveTab("certificate")}
              className={`flex-1 min-w-[130px] py-3 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "certificate"
                  ? "bg-black text-white shadow border border-amber-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <AwardLucide className="w-4 h-4 text-amber-500" />
              <span>২. 🏆 অর্জন প্রশংসাপত্র</span>
            </button>

            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 min-w-[130px] py-3 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "summary"
                  ? "bg-black text-white shadow border border-indigo-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              <span>৩. 📊 প্রগতি রিপোর্ট ও পরিসংখ্যান</span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`flex-1 min-w-[130px] py-3 px-3 rounded-lg font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "integrations"
                  ? "bg-black text-white shadow border border-emerald-300"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Database className="w-4 h-4 text-emerald-500" />
              <span>৪. 🔌 গিটহাব, সুপাবেস ও ভার্সেল</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded animate-pulse">
                যুক্ত করুন
              </span>
            </button>
          </div>

          {/* Web Interactive Status scoreboard (Hidden on Print) */}
          {activeTab === "routine" && (
            <>
              <div className="no-print w-full max-w-[21cm] mb-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shrink-0 border border-indigo-200">
                    <Award className="w-5 h-5 text-amber-500 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      অভিভাবক ও মেন্টর প্রগ্রেস স্কোর বোর্ড
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                        {earnedPercentage}% টিক অর্জিত
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      দৈনন্দিন রুটিন পালনের অগ্রগতি। ৫০% এর বেশি অর্জন প্রশংসাপত্র আনলক করবে!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase">মোট টিক সংখ্যা</span>
                    <span className="text-lg font-mono font-black text-slate-800">
                      {toBnNum(totalEarnedPoints)} / {toBnNum(maxPossiblePoints)}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-full border-2 border-gray-200 flex items-center justify-center relative font-mono text-xs font-bold text-slate-800">
                    {toBnNum(earnedPercentage)}%
                    <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90 pointer-events-none">
                      <circle
                        cx="22"
                        cy="22"
                        r="19"
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                        strokeDasharray={119}
                        strokeDashoffset={119 - (119 * earnedPercentage) / 100}
                        className="transition-all"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Grid Legend & Instructions */}
              <div className="no-print w-full max-w-[21cm] mb-4 bg-slate-50/80 border border-slate-200 p-4 rounded-xl shadow-sm">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>গ্রিড নির্দেশিকা ও আইকন পরিচিতি (Parent-Student Legend & Guide)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Legend item 1: Prayers */}
                  <div className="bg-white p-3 rounded-lg border border-slate-150 flex items-start gap-2.5">
                    <div className="flex gap-0.5 shrink-0 mt-0.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-[8px] flex items-center justify-center shadow-xs">ফ</span>
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 font-extrabold text-[8px] flex items-center justify-center border border-slate-200">য</span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                        ৫ ওয়াক্ত সালাত
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        প্রতিটি ওয়াক্তের সালাত আদায়ের অবস্থা (ফ=ফজর, য=যোহর, আ=আসর, ম=মাগরিব, এ=এশা)। সবুজ বৃত্ত মানে আদায়কৃত সালাত, ধূসর মানে বাকি আছে।
                      </p>
                    </div>
                  </div>

                  {/* Legend item 2: Completed Task */}
                  <div className="bg-white p-3 rounded-lg border border-slate-150 flex items-start gap-2.5">
                    <div className="flex shrink-0 mt-0.5 bg-emerald-50 text-emerald-600 border border-emerald-250 p-1 rounded-full w-5 h-5 items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900">
                        সম্পন্ন কাজ (Completed Task)
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        সবুজ টিক চিহ্ন দ্বারা সুনির্দিষ্ট নীতি ও চমৎকার দৈনন্দিন রুটিন সঠিকভাবে সম্পন্ন হওয়ার নিশ্চয়তা বোঝায়।
                      </p>
                    </div>
                  </div>

                  {/* Legend item 3: Sparkles Daily Goal */}
                  <div className="bg-white p-3 rounded-lg border border-slate-150 flex items-start gap-2.5">
                    <div className="flex shrink-0 mt-0.5 bg-amber-50 border border-amber-200/60 p-1.5 rounded-full w-6 h-6 items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900">
                        প্রতিদিনের লক্ষ্য ও প্রতিফলন (Daily Reflection Goals)
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        জাদুকরী তারকা (Sparkles) চিহ্নের মাধ্যমে প্রতিদিনের লক্ষ্য নির্ধারণ, আত্ম-উন্নয়ন এবং চমৎকার অনুভূতিসমূহ ট্র্যাকিং ও সংরক্ষণ করা যায়।
                      </p>
                    </div>
                  </div>

                  {/* Legend item 4: Calendar Date/Activity */}
                  <div className="bg-white p-3 rounded-lg border border-slate-150 flex items-start gap-2.5">
                    <div className="flex shrink-0 mt-0.5 bg-indigo-50 border border-indigo-200 p-1.5 rounded-lg w-6 h-6 items-center justify-center">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-900">
                        তারিখ ও কার্যকলাপ (Date/Activity)
                      </h5>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        মাসিক ক্যালেন্ডারের দিন ও সাপ্তাহিক বার অনুযায়ী আপনার সকল প্রশংসনীয় কার্যকলাপের সময়ানুগ ট্র্যাকিং ও রেফারেন্স নিশ্চিত করে।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "certificate" && (
            <div className="no-print w-full max-w-[21cm] mb-4 bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Flame className="w-5 h-5 text-amber-100" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">এওয়ার্ড জেনারেটর মোড সক্রিয়</h4>
                  <p className="text-xs text-amber-100">
                    বাচ্চাদের কোমল হৃদয়ে ভালো অভ্যাসের স্পৃহা জোগাতে এই প্রশংসাপত্রটি রঙিন প্রিন্ট করে ঘরের দেয়ালে টানিয়ে দিন!
                  </p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="bg-white hover:bg-slate-100 text-amber-950 text-xs font-black px-4 py-2 rounded-lg transition active:scale-95 cursor-pointer shadow"
              >
                এওয়ার্ড সনদ ডাউনলোড করুন (A4)
              </button>
            </div>
          )}

          {activeTab === "summary" && (
            <div className="no-print w-full max-w-[21cm] mb-4 bg-gradient-to-r from-teal-600 via-indigo-600 to-violet-700 p-4 rounded-xl text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white shrink-0">
                  <BarChart2 className="w-5 h-5 text-teal-100 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">আর্কাইভ ও প্রগতি ডেটা রফতানি প্যানেল</h4>
                  <p className="text-xs text-teal-500 bg-white/10 px-2 py-0.5 rounded inline-block mt-0.5 font-bold">
                    ডেটা রফতানি করুন এবং অফলাইনে সংরক্ষণ করুন
                  </p>
                  <p className="text-[11px] text-indigo-100 mt-1">
                    শিক্ষার্থীর দিনলিপি, পূরণকৃত লক্ষ্যসমূহ এবং সচিত্র অনুভবসমূহ এক্সেল (CSV) বা সুবিন্যস্ত JSON ফাইলে ব্যাকআপ নিন।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData("csv")}
                  className="bg-white hover:bg-teal-50 text-teal-950 text-xs font-black px-4 py-2.5 rounded-lg transition active:scale-95 cursor-pointer shadow flex items-center gap-1.5"
                >
                  📊 Excel / CSV ফাইল রফতানি
                </button>
                <button
                  onClick={() => exportData("json")}
                  className="bg-indigo-950 hover:bg-indigo-900 text-white text-xs font-black px-4 py-2.5 rounded-lg transition active:scale-95 cursor-pointer shadow border border-indigo-500 flex items-center gap-1.5"
                >
                  📥 JSON ব্যাকআপ রফতানি
                </button>
              </div>
            </div>
          )}

          {/* Canvas sheet layout container info (Hidden on Print) */}
          <div className="no-print w-full max-w-[21cm] mb-3 flex items-center justify-between text-[11px] text-slate-500 bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {activeTab === "routine" 
                  ? "নিচের রুটিনটি ১ পৃষ্ঠায় নিখুঁতভাবে প্রিন্ট করার জন্য ১০০% পরিমিত করা হয়েছে।" 
                  : activeTab === "certificate"
                  ? "নিচের প্রশংসাপত্রটি A4 সাইজ কাগজে মেডেলসহ রঙিন প্রিন্ট দেওয়ার জন্য প্রস্তুত।"
                  : activeTab === "summary"
                  ? "নিচের প্রগতি প্রতিবেদন ও পরিসংখ্যানটি ১ পৃষ্ঠায় নিখুঁতভাবে প্রিন্ট করার জন্য পরিমিত করা হয়েছে।"
                  : "গিটহাব, সুপাবেস ও ভার্সেল ক্লাউড ড্যাশবোর্ড ও ডেভেলপার প্যানেল।"
                }
              </span>
            </span>
            <button 
              onClick={() => {
                if (activeTab === "routine") {
                  clearAllBoxes();
                } else if (activeTab === "certificate") {
                  setCertDescription("নৈতিক মূল্যবোধ, সৌজন্যবোধ, বিনম্র আচরণ এবং প্রতিদিনের রুটিন অনুযায়ী সময়ের সুপরিকল্পিত ব্যবহারে অত্যন্ত প্রশংসনীয় অগ্রগতি প্রদর্শন করার জন্য এই গৌরবান্বিত শুভেচ্ছা স্মারক প্রদান করা হলো।");
                } else if (activeTab === "summary") {
                  clearAllBoxes();
                }
              }} 
              className="px-2 py-0.5 bg-white hover:bg-slate-200 text-slate-800 rounded border border-slate-250 cursor-pointer font-bold transition"
            >
              রিসেট করুন
            </button>
          </div>

          {/* ======================= DYNAMIC PRINT CONTAINER ======================= */}
          
          {/* TAB 1: PORTRAIT STUDY ROUTINE GRID */}
          {activeTab === "routine" && (
            <div 
              className="print-area w-full max-w-[21cm] bg-white text-black p-5 md:p-8 flex flex-col justify-between border border-black shadow-[0_0_15px_rgba(0,0,0,0.08)] relative"
              style={{ 
                fontFamily: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
                minHeight: '28.0cm' 
              }}
              id="routine-a4-sheet"
            >
              {/* Dynamic printable content */}
              <div>
                
                {/* Top border decor for "Professional Polish" */}
                {themeMode === "professional-polish" && (
                  <div className="w-full h-1.5 bg-black mb-4 no-print" />
                )}

                {/* Printable Header Section */}
                <div className={`border-b-2 border-black pb-4 mb-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-end ${sizes.gapSize}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-black text-black border-l-4 border-black pl-3 tracking-tight">
                        ডি-লিকন মডেল একাডেমীর  ছাত্র-ছাত্রীদের শিষ্টাচার, আমলনামা ও পড়ার রুটিন
                      </h1>
                      <span className="inline-flex items-center gap-1.5 bg-yellow-100/90 text-yellow-950 border-2 border-yellow-500 rounded-full px-3 py-1 text-[11px] sm:text-xs font-serif italic font-black shadow-sm select-none tracking-wider uppercase rotate-[-1.5deg] hover:rotate-0 transition duration-150">
                        ✨ "Manner is Banner"
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold font-mono">
                        Student Morals & Daily Study Routine Grid
                      </span>
                      <span className="text-[9px] inline-block font-extrabold border border-black px-1.5 py-0.2 rounded bg-neutral-100">
                        সংশোধন ও শুদ্ধাচার মিশন
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold sm:w-auto w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">নাম:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[110px] font-bold text-black italic pb-0.5 px-1 bg-gray-50/50">
                        {studentName || "...................................."}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">শ্রেণি:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[65px] font-bold text-black italic pb-0.5 px-1 bg-gray-50/50 text-center font-bold">
                        {studentClass || "............"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">রোল:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[65px] font-bold text-black italic pb-0.5 px-1 bg-gray-50/50 text-center font-mono">
                        {toBnNum(studentRoll) || "............"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">মাস:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[110px] font-black text-indigo-900 pb-0.5 px-1 bg-neutral-100/70 text-center">
                        {selectedMonth || "...................."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Version Progress Scoreboard block */}
                <div className="flex justify-between items-center mb-3.5 bg-neutral-50 px-3 py-1.5 border border-neutral-300 rounded text-[11px] font-semibold">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[8.5px] block">সর্বমোট রুটিন লক্ষ্য</span>
                      <span className="font-bold text-black text-xs">
                        {toBnNum(daysCount)} দিনে মোট {toBnNum(maxPossiblePoints)} টি সৎ অভ্যাস লক্ষ্য
                      </span>
                    </div>
                    <div className="w-[1px] h-6 bg-neutral-300" />
                    <div>
                      <span className="text-gray-500 font-bold uppercase text-[8.5px] block">ডিজিটাল প্রগ্রেস অর্জন</span>
                      <span className="font-bold text-black text-xs font-mono bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200">
                        {toBnNum(totalEarnedPoints)} টি সফল টিক্স ({toBnNum(earnedPercentage)}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-[8.5px] block">পর্যালোচনা ও তদারকি</span>
                    <p className="text-black text-[10px] font-bold">অভিভাবক ও বিদ্যালয়ের নিয়মিত মূল্যায়ন</p>
                  </div>
                </div>

                {/* Routine main structured grid table */}
                <div className="w-full">
                  <table className="w-full border-collapse border border-black text-center">
                    <thead>
                      <tr className="bg-neutral-100 h-9 text-[10px] font-extrabold text-black">
                        <th className="border border-black w-[8%] font-black py-1 px-0.5">তারিখ ও বার</th>
                        <th className="border border-black w-[15%] font-black py-1 px-0.5 leading-tight">{col2Header}</th>
                        <th className="border border-black w-[13%] font-black py-1 px-0.5 leading-tight">{col1Header}</th>
                        <th className="border border-black w-[13%] font-black py-1 px-0.5 leading-tight">{col3Header}</th>
                        <th className="border border-black w-[13%] font-black py-1 px-0.5 leading-tight">{col4Header}</th>
                        <th className="border border-black w-[13%] font-black py-1 px-0.5 leading-tight">{col5Header}</th>
                        <th className="border border-black w-[13%] font-black py-1 px-0.5 leading-tight">{col6Header}</th>
                        <th className="border border-black w-[8%] font-black py-1 px-0.5">স্বাক্ষর / অভিভাবক</th>
                        <th className="border border-black w-[4%] font-black py-1 px-0.5">দৈনিক স্কোর</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const wkdayIndex = (startDayIndex + row.date - 1) % 7;
                        const wkday = WEEKDAYS[wkdayIndex];
                        const isFriday = wkday.short === "শুক্র";
                        const isExpanded = !!expandedDays[row.date];

                        let rowScore = 0;
                        if (hasPrayersTracked) {
                          if (row.fajrChecked) rowScore += 1;
                          if (row.dhuhrChecked) rowScore += 1;
                          if (row.asrChecked) rowScore += 1;
                          if (row.maghribChecked) rowScore += 1;
                          if (row.ishaChecked) rowScore += 1;
                        }
                        if (row.col1Checked) rowScore += 1;
                        else if (row.col1Val && row.col1Val.trim() !== "") rowScore += 0.5;

                        if (row.col3Checked) rowScore += 1;
                        else if (row.col3Val && row.col3Val.trim() !== "") rowScore += 0.5;

                        if (row.col4Checked) rowScore += 1;
                        else if (row.col4Val && row.col4Val.trim() !== "") rowScore += 0.5;

                        if (row.col5Checked) rowScore += 1;
                        else if (row.col5Val && row.col5Val.trim() !== "") rowScore += 0.5;

                        if (row.col6Checked) rowScore += 1;
                        else if (row.col6Val && row.col6Val.trim() !== "") rowScore += 0.5;

                        return (
                          <Fragment key={row.date}>
                            <tr className={isFriday ? "bg-red-50/45 text-red-950 font-bold" : "bg-white"}>
                              {/* 1. Date & Day Name */}
                              <td className={`border border-black font-extrabold text-black ${sizes.cellPadding} ${sizes.fontSize} select-none`}>
                                <div className="flex flex-col items-center justify-center leading-none">
                                  <span className="font-black text-[13px]">{toBnNum(row.date)}</span>
                                  <span className={`text-[9.2px] font-black mt-0.5 ${isFriday ? "text-red-700 font-bold" : "text-gray-600"}`}>
                                    ({wkday.short})
                                  </span>
                                </div>
                              </td>

                              {/* ৫ ওয়াক্ত নামাজ (ফজর, যোহর, আসর, মাগরিব, এশা) */}
                              <td className="border border-black p-0.5 relative bg-white select-none">
                                <div className="flex items-center justify-center gap-0.5 sm:gap-1 min-h-[44px] print:min-h-0 print:gap-[3px] print:py-1">
                                  {[
                                    { key: "fajrChecked", label: "ফ", fullName: "ফজর" },
                                    { key: "dhuhrChecked", label: "য", fullName: "যোহর" },
                                    { key: "asrChecked", label: "আ", fullName: "আসর" },
                                    { key: "maghribChecked", label: "ম", fullName: "মাগরিব" },
                                    { key: "ishaChecked", label: "এ", fullName: "এশা" }
                                  ].map((p) => {
                                    const isChecked = !!row[p.key as keyof typeof row];
                                    return (
                                      <button
                                        key={p.key}
                                        type="button"
                                        onClick={() => togglePrayer(row.date, p.key as any)}
                                        className={`
                                          w-5 h-5 sm:w-6 sm:h-6 rounded-full flex flex-col items-center justify-center border text-[9px] sm:text-[10px] font-extrabold transition-all duration-150 cursor-pointer select-none relative group/pr focus:outline-none focus:ring-1 focus:ring-emerald-400
                                          print:w-[19px] print:h-[19px] print:rounded-full print:border-[1.5px] print:shadow-none print:m-0 print:p-0 print:flex print:items-center print:justify-center
                                          ${isChecked 
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm font-black scale-105 print:bg-emerald-600 print:border-emerald-700 print:text-white" 
                                            : "bg-slate-50 text-slate-400 border-neutral-250 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-350 print:bg-white print:border-slate-350 print:text-slate-400"
                                          }
                                        `}
                                      >
                                        <span className={`
                                          leading-none text-center flex items-center justify-center w-full h-full
                                          print:text-[10.5px] print:font-extrabold print:leading-none
                                          ${isChecked 
                                            ? "font-black text-white print:text-white print:font-black" 
                                            : "text-slate-400 print:text-slate-500 print:font-bold"
                                          }
                                        `}>
                                          {p.label}
                                        </span>
                                        {isChecked && (
                                          <span className="text-[7px] -mt-1 leading-none font-bold text-white/95 print:hidden">✓</span>
                                        )}
                                        {/* HTML Interactive Tooltip */}
                                        <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 scale-0 group-hover/pr:scale-100 transition-all duration-150 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none font-extrabold">
                                          {p.fullName}: {isChecked ? "আদায়কৃত ✓" : "বাকি রয়েছে ✗"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* 2. Checkbox 1 */}
                              <td className="border border-black relative p-0.5">
                                <div className="flex flex-col items-center justify-center h-full w-full min-h-[44px] gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCell(row.date, "col1Checked")}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                                  >
                                    {row.col1Checked ? (
                                      <span className="text-emerald-600 text-sm font-extrabold">✔</span>
                                    ) : (
                                      <span className="text-slate-350 hover:text-slate-800 text-sm">☐</span>
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    value={row.col1Val || ""}
                                    onChange={(e) => updateCellValue(row.date, "col1Val", e.target.value)}
                                    placeholder={row.col1Checked ? "" : "..."}
                                    disabled={row.col1Checked}
                                    className={`w-full text-center bg-transparent border-none text-[9.5px] p-0 focus:outline-none placeholder:text-slate-350 leading-none ${
                                      row.col1Checked 
                                        ? "text-slate-400 line-through select-none" 
                                        : "text-indigo-900 font-bold focus:border-b focus:border-indigo-500 font-mono"
                                    }`}
                                    title="বাস্তব সময় বা বিচ্যুতি লিখুন (যদি শর্ত পূরণ না হয়)"
                                  />
                                </div>
                                <span className="sr-only font-mono">Check Column 1 for day {row.date}</span>
                              </td>

                              {/* 4. Checkbox 3 */}
                              <td className="border border-black relative p-0.5">
                                <div className="flex flex-col items-center justify-center h-full w-full min-h-[44px] gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCell(row.date, "col3Checked")}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                                  >
                                    {row.col3Checked ? (
                                      <span className="text-emerald-600 text-sm font-extrabold">✔</span>
                                    ) : (
                                      <span className="text-slate-350 hover:text-slate-800 text-sm">☐</span>
                                    )}
                                  </button>
                                  

                                  <input
                                    type="text"
                                    value={row.col3Val || ""}
                                    onChange={(e) => updateCellValue(row.date, "col3Val", e.target.value)}
                                    placeholder={row.col3Checked ? "" : "..."}
                                    disabled={row.col3Checked}
                                    className={`w-full text-center bg-transparent border-none text-[9.5px] p-0 focus:outline-none placeholder:text-slate-350 leading-none ${
                                      row.col3Checked 
                                        ? "text-slate-400 line-through select-none" 
                                        : "text-indigo-900 font-bold focus:border-b focus:border-indigo-500 font-mono"
                                    }`}
                                    title="বাস্তব সময় বা বিচ্যুতি লিখুন (যদি শর্ত পূরণ না হয়)"
                                  />
                                </div>
                                <span className="sr-only font-mono">Check Column 3 for day {row.date}</span>
                              </td>

                              {/* 5. Checkbox 4 */}
                              <td className="border border-black relative p-0.5">
                                <div className="flex flex-col items-center justify-center h-full w-full min-h-[44px] gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCell(row.date, "col4Checked")}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                                  >
                                    {row.col4Checked ? (
                                      <span className="text-emerald-600 text-sm font-extrabold">✔</span>
                                    ) : (
                                      <span className="text-slate-350 hover:text-slate-800 text-sm">☐</span>
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    value={row.col4Val || ""}
                                    onChange={(e) => updateCellValue(row.date, "col4Val", e.target.value)}
                                    placeholder={row.col4Checked ? "" : "..."}
                                    disabled={row.col4Checked}
                                    className={`w-full text-center bg-transparent border-none text-[9.5px] p-0 focus:outline-none placeholder:text-slate-350 leading-none ${
                                      row.col4Checked 
                                        ? "text-slate-400 line-through select-none" 
                                        : "text-indigo-900 font-bold focus:border-b focus:border-indigo-500 font-mono"
                                    }`}
                                    title="বাস্তব সময় বা বিচ্যুতি লিখুন (যদি শর্ত পূরণ না হয়)"
                                  />
                                </div>
                                <span className="sr-only font-mono">Check Column 4 for day {row.date}</span>
                              </td>

                              {/* 6. Checkbox 5 (from col5Header) */}
                              <td className="border border-black relative p-0.5">
                                <div className="flex flex-col items-center justify-center h-full w-full min-h-[44px] gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCell(row.date, "col5Checked")}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                                  >
                                    {row.col5Checked ? (
                                      <span className="text-emerald-600 text-sm font-extrabold">✔</span>
                                    ) : (
                                      <span className="text-slate-350 hover:text-slate-800 text-sm">☐</span>
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    value={row.col5Val || ""}
                                    onChange={(e) => updateCellValue(row.date, "col5Val", e.target.value)}
                                    placeholder={row.col5Checked ? "" : "..."}
                                    disabled={row.col5Checked}
                                    className={`w-full text-center bg-transparent border-none text-[9.5px] p-0 focus:outline-none placeholder:text-slate-350 leading-none ${
                                      row.col5Checked 
                                        ? "text-slate-400 line-through select-none" 
                                        : "text-indigo-900 font-bold focus:border-b focus:border-indigo-500 font-mono"
                                    }`}
                                    title="বাস্তব সময় বা বিচ্যুতি লিখুন (যদি শর্ত পূরণ না হয়)"
                                  />
                                </div>
                                <span className="sr-only font-mono">Check Column 5 for day {row.date}</span>
                              </td>

                              {/* 7. Checkbox 6 (from col6Header) */}
                              <td className="border border-black relative p-0.5">
                                <div className="flex flex-col items-center justify-center h-full w-full min-h-[44px] gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => toggleCell(row.date, "col6Checked")}
                                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                                  >
                                    {row.col6Checked ? (
                                      <span className="text-emerald-600 text-sm font-extrabold">✔</span>
                                    ) : (
                                      <span className="text-slate-350 hover:text-slate-800 text-sm">☐</span>
                                    )}
                                  </button>
                                  <input
                                    type="text"
                                    value={row.col6Val || ""}
                                    onChange={(e) => updateCellValue(row.date, "col6Val", e.target.value)}
                                    placeholder={row.col6Checked ? "" : "..."}
                                    disabled={row.col6Checked}
                                    className={`w-full text-center bg-transparent border-none text-[9.5px] p-0 focus:outline-none placeholder:text-slate-350 leading-none ${
                                      row.col6Checked 
                                        ? "text-slate-400 line-through select-none" 
                                        : "text-indigo-900 font-bold focus:border-b focus:border-indigo-500 font-mono"
                                    }`}
                                    title="বাস্তব সময় বা বিচ্যুতি লিখুন (যদি শর্ত পূরণ না হয়)"
                                  />
                                </div>
                                <span className="sr-only font-mono">Check Column 6 for day {row.date}</span>
                              </td>

                              {/* 8. Signature area for physical pen ticks */}
                              <td className="border border-black text-center"></td>

                              {/* 9. Daily Score and Goal Toggle Button */}
                              <td className="border border-black text-center p-0.5 relative bg-indigo-50/10">
                                <button
                                  type="button"
                                  onClick={() => toggleRowExpand(row.date)}
                                  className="w-full min-h-[40px] flex items-center justify-center gap-1 rounded hover:bg-slate-100/60 transition focus:outline-none cursor-pointer"
                                  title="দৈনিক লক্ষ্য ও প্রতিফলন"
                                >
                                  <div className="flex items-center gap-1 justify-center">
                                    <span className="font-mono font-extrabold text-[12.5px] text-indigo-950 leading-none">
                                      {toBnNum(rowScore)}
                                    </span>
                                    <Sparkles className={`w-3.5 h-3.5 transition-all duration-200 no-print ${
                                      row.dailyGoal ? "text-amber-500 fill-amber-400" : "text-neutral-400"
                                    }`} />
                                    <ChevronRight className={`w-3 h-3 text-neutral-500 transition-transform duration-200 no-print ${
                                      isExpanded ? "rotate-90 text-indigo-600 font-bold" : ""
                                    }`} />
                                  </div>
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-gradient-to-r from-indigo-50/40 to-cyan-50/30 transition-all duration-300 print:bg-white no-print">
                                <td colSpan={9} className="border border-black p-3.5 text-left bg-indigo-50/10">
                                  <motion.div 
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-2 relative"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                                          🎯
                                        </span>
                                        <p className="text-indigo-950 font-black text-xs sm:text-[13px] tracking-tight">
                                          {toBnNum(row.date)}ই {selectedMonth}-এর দৈনিক লক্ষ্য এবং বিস্তারিত প্রতিফলন (Daily Reflections)
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setFocusedRowDate(focusedRowDate === row.date ? null : row.date)}
                                          className={`text-[10px] font-extrabold flex items-center gap-1 transition px-2 py-0.5 rounded border cursor-pointer no-print ${
                                            focusedRowDate === row.date
                                              ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                                              : "bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100"
                                          }`}
                                          title="এআই বুদ্ধিমান পরামর্শ প্যানেল খুলুন বা বন্ধ করুন"
                                        >
                                          ✨ এআই সহায়িকা (AI Guide)
                                        </button>
                                        <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded border transition-colors duration-200 ${
                                          row.dailyGoal ? "text-indigo-600 bg-indigo-100/60 border-indigo-200/40" : "text-amber-700 bg-amber-50 border-amber-200"
                                        }`}>
                                          {row.dailyGoal ? "সংরক্ষিত লক্ষাবলি" : "লক্ষ্য খালি রয়েছে"}
                                        </span>
                                      </div>
                                    </div>

                                    {(!row.dailyGoal || !row.dailyGoal.trim()) && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-start gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 shadow-sm animate-pulse"
                                      >
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="leading-relaxed">
                                          <span className="font-extrabold text-amber-950">লক্ষ্যটি ফাঁকা রয়েছে!</span> এই দিনের জন্য কোনো শিষ্টাচার লক্ষ্য বা পড়াশোনার পরিকল্পনা সেট করা হয়নি। অনুগ্রহ করে নিচের বক্সে আজকের লক্ষ্য বা সচিত্র অনুভূতিটি লিখুন যা স্বয়ংক্রিয়ভাবে ক্লাউডে সেভ হবে।
                                        </div>
                                      </motion.div>
                                    )}
                                    
                                    <motion.textarea
                                      initial={{ opacity: 0, y: 15 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
                                      rows={2}
                                      value={row.dailyGoal || ""}
                                      onChange={(e) => updateDailyGoalText(row.date, e.target.value)}
                                      onFocus={() => setFocusedRowDate(row.date)}
                                      placeholder="আজকের নির্ধারিত শিষ্টাচার লক্ষ্য বা বিশেষ প্রচেষ্টা এবং অর্জিত দিনান্তের সচিত্র অনুভূতি ও শিক্ষনীয় বিষয় এখানে বিস্তারিত বিবরণ দিন..."
                                      className={`w-full bg-white rounded p-2 text-xs sm:text-[12.5px] focus:outline-none focus:ring-1 tracking-wide leading-relaxed shadow-sm transition-all duration-200 ${
                                        !row.dailyGoal || !row.dailyGoal.trim()
                                          ? "border-2 border-dashed border-amber-300 focus:ring-amber-500 focus:border-amber-500 text-neutral-800 placeholder:text-gray-400"
                                          : "border border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500 text-neutral-800 placeholder:text-gray-400 font-sans"
                                      }`}
                                      id={`dailygoal-inp-${row.date}`}
                                    />

                                    {/* AI Autocomplete suggestion dropdown (When focused/activated) */}
                                    {focusedRowDate === row.date && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-indigo-50/75 rounded-lg p-2.5 border border-indigo-200/80 mt-1 space-y-2 no-print overflow-hidden text-left"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5 text-[11.5px] font-black text-indigo-950">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                                            <span>এআই প্রগতি-ভিত্তিক বুদ্ধিমান পরামর্শ (Active Copilot)</span>
                                            <span className="text-[9px] bg-indigo-100 border border-indigo-200 px-1.5 py-0.2 rounded text-indigo-800 font-black ml-1 uppercase">
                                              {activePreset === "moral" ? "শিষ্টাচার ফোকাস" : "অধ্যয়ন ফোকাস"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() => setSuggestionShuffleSeed((s) => s + 1)}
                                              className="text-[9.5px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                                              title="শব্দ রিমিক্স করুন বা আরো সাজেশনের রূপ দেখান"
                                            >
                                              🔄 রিমিক্স করুন
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setFocusedRowDate(null)}
                                              className="text-gray-405 hover:text-indigo-950 font-black text-xs px-1.5 cursor-pointer"
                                              title="পরামর্শ উইজেট বন্ধ করুন"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        </div>

                                        <p className="text-[10px] text-indigo-900 font-semibold leading-normal">
                                          আজকের পূরণকৃত প্রাত্যহিক অভ্যাস এবং আপনার বাছাই করা মিশনের মূল উদ্দেশ্য বিশ্লেষণ করে এআই নিচের ৩টি বুদ্ধিদীপ্ত পরামর্শ প্রস্তুত করেছে। ক্লিক করলেই আপনার আজকের প্রতিফলন হিসেবে সেট হবে:
                                        </p>

                                        <div className="grid grid-cols-1 gap-1.5 mt-1">
                                          {getAISuggestions(row, studentName, activePreset, suggestionShuffleSeed).map((sugg, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => {
                                                updateDailyGoalText(row.date, sugg);
                                              }}
                                              className="bg-white hover:bg-indigo-100/50 text-left p-2 rounded-lg border border-indigo-100 hover:border-indigo-400 text-[11px] text-slate-855 leading-relaxed font-sans font-medium transition active:scale-[0.99] cursor-pointer shadow-sm relative group flex flex-col"
                                            >
                                              <span className="text-indigo-600 font-extrabold text-[9px] uppercase tracking-wider mb-0.5 flex items-center justify-between">
                                                <span>পরামর্শ {toBnNum(idx + 1)}:</span>
                                                <span className="opacity-0 group-hover:opacity-100 text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded transition duration-200">
                                                  এই পরামর্শটি বেছে নিন ✍️
                                                </span>
                                              </span>
                                              <span className="text-left font-semibold">"{sugg}"</span>
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Reflection Depth & Character Progress Bar Chart */}
                                    {(() => {
                                      const charCount = (row.dailyGoal || "").length;
                                      const targetLimit = 120;
                                      const percent = Math.min(Math.round((charCount / targetLimit) * 100), 100);
                                      
                                      const m1Active = charCount > 0;
                                      const m2Active = charCount >= 25;
                                      const m3Active = charCount >= 60;
                                      const m4Active = charCount >= 100;

                                      return (
                                        <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 flex flex-col sm:flex-row items-center gap-3 justify-between mt-1 select-none">
                                          {/* Left side: text details */}
                                          <div className="flex flex-col gap-0.5 text-left w-full sm:w-auto">
                                            <p className="text-slate-800 font-extrabold text-[11px] sm:text-xs flex items-center gap-1">
                                              <span>📊</span> প্রতিফলন গভীরতা সূচক (Reflections Progress): 
                                              <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 ml-1">
                                                {toBnNum(charCount)} / {toBnNum(targetLimit)} অক্ষর
                                              </span>
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                              {charCount === 0 && "আজকের অনুভূতি বা বিশেষ লক্ষ্য লিখে আপনার প্রতিফলন শুরু করুন।"}
                                              {charCount > 0 && charCount < 25 && "চমৎকার শুরু! আরও একটু বিস্তারিত লিখলে ভালো হবে।"}
                                              {charCount >= 25 && charCount < 60 && "ভালো প্রগতি! আপনার চিন্তাভাবনা চমৎকার ফুটিয়ে তুলেছেন।"}
                                              {charCount >= 60 && charCount < 100 && "খুব সুন্দর! যথেষ্ট গভীর ও বিশ্লেষণধর্মী ডায়েরি লেখা হয়েছে।"}
                                              {charCount >= 100 && "অসাধারণ ও পরিপূর্ণ প্রতিফলন! আপনার নৈতিক পরিপক্বতা প্রশংসনীয়।"}
                                            </p>
                                          </div>
                                          
                                          {/* Progress representation */}
                                          <div className="flex items-center gap-1.5 font-bold text-slate-850 select-none shrink-0 w-full sm:w-auto justify-end">
                                            <div className="flex items-center gap-0.5">
                                              {[
                                                { label: "শুরু", active: m1Active, color: "bg-orange-500 border-orange-400 text-white" },
                                                { label: "মৌলিক", active: m2Active, color: "bg-amber-500 border-amber-400 text-white" },
                                                { label: "গভীর", active: m3Active, color: "bg-cyan-500 border-cyan-400 text-white" },
                                                { label: "পূর্ণাঙ্গ", active: m4Active, color: "bg-emerald-600 border-emerald-500 text-white" }
                                              ].map((milestone, mIdx) => (
                                                <span 
                                                  key={mIdx} 
                                                  className={`text-[8.5px] px-1.5 py-0.5 rounded border leading-none transition-all duration-300 font-extrabold uppercase ${
                                                    milestone.active 
                                                      ? milestone.color 
                                                      : "bg-slate-100 text-slate-400 border-neutral-250 font-semibold"
                                                  }`}
                                                >
                                                  {milestone.label}
                                                </span>
                                              ))}
                                            </div>
                                            <div className="text-right leading-none shrink-0 min-w-[35px] font-mono font-black text-xs text-indigo-950">
                                              {toBnNum(percent)}%
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </motion.div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Print bottom footer decor */}
                <div className="mt-16 sm:mt-24 print:mt-28 flex justify-between items-end border-t border-dashed border-gray-400 pt-5 font-semibold text-[11px] leading-tight select-none">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="font-extrabold text-black">তদারককারী / অভিভাবক মন্তব্য ও স্বাক্ষর:</span>
                    <span className="text-gray-400 italic">"নিয়মিত ডায়েরি লিখন ও নৈতিক মূল্যবোধ চর্চায় শিক্ষার্থীর একাগ্রতা প্রশংসনীয়।"</span>
                    <div className="border-b border-gray-300 w-[240px] mt-16" />
                  </div>
                  
                  {principalApproved && (
                    <div className="flex flex-col items-center shrink-0 border border-emerald-300 bg-emerald-50/40 rounded-lg p-2 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 border-2 border-emerald-500/30 rounded-full flex items-center justify-center font-bold text-emerald-600/30 text-[10px] select-none -rotate-12 pointer-events-none">
                        অনুমোদিত
                      </div>
                      <span className="font-extrabold text-emerald-800 text-[9px] uppercase tracking-wider mb-0.5">বিদ্যালয় অনুমোদন ও সিল</span>
                      <div className="font-bold text-black border-b border-gray-300 w-[140px] pb-1 font-mono text-center mb-1 text-[11.5px]">
                        {principalName || "প্রিন্সিপাল"}
                      </div>
                      <span className="text-[9.5px] text-emerald-700 italic font-medium leading-tight max-w-[150px] text-center">
                        "{principalInstruction || "মূল্যায়ন সন্তোষজনক"}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATISTICS & GRAPHS */}
          {activeTab === "summary" && (
            <div className="w-full max-w-[21cm] bg-white p-5 md:p-8 rounded-xl border border-gray-250/70 shadow-sm print:shadow-none font-sans flex flex-col justify-between" id="statistics-a4-sheet" style={{ minHeight: '28.0cm' }}>
              <div>
                <div className="border-b-2 border-slate-900 pb-3 mb-5 flex justify-between items-end">
                  <div>
                    <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-indigo-600" />
                      <span>মাসিক প্রগতি ও শুদ্ধাচার বিশ্লেষণ সামারি সিট</span>
                    </h2>
                    <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider font-mono mt-0.5">Student Habits Progress Report & Statistical Summary</p>
                  </div>
                  <div className="text-right text-[11px] font-semibold text-slate-700">
                    <span className="font-bold text-slate-900 block">{studentName} ({studentClass})</span>
                    <span>রোল: {toBnNum(studentRoll)} | {selectedMonth}</span>
                  </div>
                </div>

                {/* Section 1: Top Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-slate-50/70 border border-slate-200/80 p-3 rounded-lg text-center shadow-xs">
                    <span className="text-[9.5px] text-slate-500 uppercase tracking-widest font-extrabold block">মোট সম্ভাব্য অভ্যাস</span>
                    <span className="text-2xl font-black text-indigo-950 font-mono mt-1 block">{toBnNum(maxPossiblePoints)}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">১০০% অর্জনের লক্ষ্যমাত্রা</span>
                  </div>
                  <div className="bg-emerald-50/40 border border-emerald-200/60 p-3 rounded-lg text-center shadow-xs">
                    <span className="text-[9.5px] text-emerald-700 uppercase tracking-widest font-extrabold block">মোট অর্জিত অভ্যাস</span>
                    <span className="text-2xl font-black text-emerald-800 font-mono mt-1 block">{toBnNum(totalEarnedPoints)}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">সফলভাবে টিক সম্পন্ন</span>
                  </div>
                  <div className="bg-indigo-50/50 border border-indigo-200/50 p-3 rounded-lg text-center shadow-xs">
                    <span className="text-[9.5px] text-indigo-700 uppercase tracking-widest font-extrabold block">সাফল্য ও অগ্রগতি হার</span>
                    <span className="text-2xl font-black text-indigo-900 font-mono mt-1 block">{toBnNum(earnedPercentage)}%</span>
                    <span className="text-[10px] text-indigo-500 font-bold block mt-0.5">সামগ্রিক সম্পাদন স্কোর</span>
                  </div>
                  <div className="bg-cyan-50/40 border border-cyan-200/60 p-3 rounded-lg text-center shadow-xs">
                    <span className="text-[9.5px] text-cyan-700 uppercase tracking-widest font-extrabold block">রুটিন সক্রিয়তা</span>
                    <span className="text-2xl font-black text-cyan-800 mt-1 block font-mono">{toBnNum(daysCount)} দিন</span>
                    <span className="text-[10px] text-cyan-600 font-bold block mt-0.5">১ম থেকে শেষ দিন পর্যন্ত</span>
                  </div>
                </div>

                {/* Section 2: Habits Column-wise Progress Report */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
                    <span>২. অভ্যাস কলাম ওয়ারী সাফল্য হার (Percentage per Column)</span>
                  </h2>

                  <div className="space-y-2">
                    {statistics.columnsList.map((col, idx) => {
                      const achievementText = col.percentage >= 85 ? "চমৎকার (Excellent)" : col.percentage >= 70 ? "সন্তোষজনক (Satisfactory)" : col.percentage >= 50 ? "চলনসই (Developing)" : "উন্নতি প্রয়োজন (Needs Improvement)";
                      const statusColor = col.percentage >= 85 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : col.percentage >= 70 ? "text-cyan-700 bg-cyan-50 border-cyan-200" : col.percentage >= 50 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                      
                      const trendArr = col.trend || [];
                      const smoothed = getSmoothedTrend(trendArr);
                      const pts = smoothed.map((v, i) => {
                        const x = smoothed.length > 1 ? 4 + (i / (smoothed.length - 1)) * 72 : 40;
                        const y = 20 - (v * 16); // Map 0..1 to 20..4
                        return { x, y };
                      });

                      const pathD = pts.length > 0 
                        ? pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
                        : "";

                      const fillD = pts.length > 0
                        ? `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} 22 L ${pts[0].x.toFixed(1)} 22 Z`
                        : "";

                      return (
                        <div key={idx} className="border border-neutral-200 p-2.5 sm:p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50/30">
                          <div className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span className="font-extrabold text-slate-900 text-[11px] max-w-[80%] leading-tight">
                                {toBnNum(idx + 1)}. {col.label}
                              </span>
                              <span className="font-black text-indigo-950 font-mono">
                                {toBnNum(col.count)} / {toBnNum(daysCount)} দিন
                              </span>
                            </div>
 
                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex relative">
                              <motion.div 
                                className={`h-full ${col.color} rounded-full relative overflow-hidden`}
                                initial={{ width: 0 }}
                                animate={{ width: `${col.percentage}%` }}
                                transition={{ type: "spring", stiffness: 60, damping: 12, restDelta: 0.01 }}
                              >
                                {/* Subtle animated sheen sweep */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                              </motion.div>
                            </div>
                          </div>
 
                          <div className="flex items-center gap-2.5 shrink-0 sm:self-center self-end w-full sm:w-auto justify-between sm:justify-end">
                            {/* Sparkline Visualizer */}
                            <div className="flex flex-col items-center justify-center bg-white border border-slate-200/80 rounded px-1.5 py-0.5 w-24 h-8 select-none shrink-0" title="মাসিক প্রগতি ট্রেন্ড (Habit Trend Sparkline)">
                              <span className="text-[7px] text-slate-500 font-extrabold tracking-tight leading-none mb-0.5 uppercase">ট্রেন্ড / Trend</span>
                              <div className="w-full h-4">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 80 22" preserveAspectRatio="none">
                                  <defs>
                                    <linearGradient id={`spark-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={col.stroke} stopOpacity="0.25" />
                                      <stop offset="100%" stopColor={col.stroke} stopOpacity="0.0" />
                                    </linearGradient>
                                  </defs>
                                  
                                  {/* Dotted threshold baseline (50% mark) */}
                                  <line x1="0" y1="12" x2="80" y2="12" stroke="#f1f5f9" strokeWidth="0.75" strokeDasharray="1.5,1.5" />
                                  
                                  {pts.length > 0 && (
                                    <>
                                      {/* Faded background area under the trend line */}
                                      <path d={fillD} fill={`url(#spark-grad-${idx})`} stroke="none" />
                                      
                                      {/* High-quality anti-aliased path line */}
                                      <path 
                                        d={pathD} 
                                        fill="none" 
                                        stroke={col.stroke} 
                                        strokeWidth="1.25" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                      />
                                      
                                      {/* Highlight dot on the last day */}
                                      <circle 
                                        cx={pts[pts.length - 1].x} 
                                        cy={pts[pts.length - 1].y} 
                                        r="1.5" 
                                        fill={col.stroke} 
                                      />
                                    </>
                                  )}
                                </svg>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded border border-neutral-250 leading-tight font-mono text-slate-800 bg-white shadow-xs">
                                {toBnNum(col.percentage)}%
                              </span>
                              <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded border leading-tight ${statusColor} bg-white/70`}>
                                {achievementText}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GORGEOUS PRINTABLE AWARD CERTIFICATE */}
          {activeTab === "certificate" && (
            <div 
              className="print-area w-full max-w-[21cm] bg-[#fdfdf7] text-black p-8 md:p-12 flex flex-col justify-between border-8 border-double border-amber-600 shadow-[0_0_20px_rgba(0,0,0,0.15)] relative"
              style={{ 
                fontFamily: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
                minHeight: '28.0cm' 
              }}
              id="certificate-a4-sheet"
            >
              
              {/* Decorative Corner Ornaments (Pure CSS borders matching gold aesthetics) */}
              <div className="absolute top-3 left-3 w-16 h-16 border-t-4 border-l-4 border-amber-650 pointer-events-none"></div>
              <div className="absolute top-3 right-3 w-16 h-16 border-t-4 border-r-4 border-amber-650 pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 w-16 h-16 border-b-4 border-l-4 border-amber-650 pointer-events-none"></div>
              <div className="absolute bottom-3 right-3 w-16 h-16 border-b-4 border-r-4 border-amber-650 pointer-events-none"></div>

              {/* Inner thin decorative border lines */}
              <div className="border border-amber-500/40 p-4 h-full flex flex-col justify-between items-center text-center">
                
                {/* 1. Header Badges & Callout */}
                <div className="space-y-3.5 my-3 w-full">
                  <div className="flex justify-center items-center gap-2">
                    <div className="h-[2px] bg-amber-600 w-12 sm:w-20"></div>
                    <span className="text-[11px] sm:text-xs font-black tracking-widest text-amber-700 uppercase font-mono bg-amber-50 px-2 py-0.5 border border-amber-350 rounded">
                      CERTIFICATE OF EXCELLENCE IN CONDUCT
                    </span>
                    <div className="h-[2px] bg-amber-600 w-12 sm:w-20"></div>
                  </div>

                  <h1 className="text-2xl sm:text-3.5xl font-black text-amber-950 font-sans tracking-tight">
                    {certTitle || "উত্তম শিষ্টাচার ও অনুকরণীয় চরিত্র প্রশংসাপত্র"}
                  </h1>

                  <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent w-1/2 mx-auto"></div>
                </div>

                {/* 2. Core Certificate Body Announcement Text */}
                <div className="my-6 space-y-6 max-w-2xl px-4">
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
                    এই বিশেষ গৌরবময় প্রশংসাপত্রটি অত্যন্ত গৌরব ও আনন্দের সাথে দেওয়া হচ্ছে:
                  </p>

                  <div className="my-5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-900 border-b-2 border-dashed border-amber-400 pb-2 inline-block px-12 italic">
                      {studentName || "........................................."}
                    </span>
                    <div className="flex justify-center items-center gap-4 text-xs sm:text-sm font-bold text-slate-705 mt-2">
                      <span>শ্রেণি: <span className="text-slate-900 italic font-medium">{studentClass || "N/A"}</span></span>
                      <span>•</span>
                      <span>রোল নম্বর: <span className="text-indigo-900 font-bold">{toBnNum(studentRoll) || "N/A"}</span></span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-800 leading-loose text-center font-medium">
                    {certDescription || "আমাদের রুটিন অনুযায়ী নৈতিক মূল্যবোধ, শিষ্টাচার এবং প্রতিদিনের রুটিন পালনে অত্যন্ত প্রশংসনীয় অগ্রগতি প্রদর্শন করার জন্য এই প্রশংসাপত্র প্রদান করা হলো।"}
                  </p>
                </div>

                {/* 3. Medal Graphical display - Based on total earned ticks! */}
                <div className="my-6 flex flex-col items-center justify-center">
                  
                  {currentMedal === "gold" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-lg relative ring-4 ring-amber-500 animate-pulse">
                        <Flame className="w-9 h-9 text-amber-900" />
                        <span className="absolute bottom-1 font-mono text-[8px] font-black tracking-widest text-amber-950">GOLD</span>
                      </div>
                      <div>
                        <span className="text-xs bg-amber-100 text-amber-900 font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                          🏆 গোল্ডেন শুদ্ধাচার মেডেল ({toBnNum(earnedPercentage)}% প্রগ্রেস)
                        </span>
                      </div>
                    </div>
                  )}

                  {currentMedal === "silver" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-lg relative ring-4 ring-slate-400">
                        <AwardIcon className="w-9 h-9 text-slate-850" />
                        <span className="absolute bottom-1 font-mono text-[8px] font-black tracking-widest text-slate-900">SILVER</span>
                      </div>
                      <div>
                        <span className="text-xs bg-slate-100 text-slate-850 font-extrabold px-3 py-1 rounded-full border border-slate-300 shadow-sm">
                          🥈 রৌপ্য নিয়মানুবর্তীতা মেডেল ({toBnNum(earnedPercentage)}% প্রগ্রেস)
                        </span>
                      </div>
                    </div>
                  )}

                  {currentMedal === "bronze" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-lg relative ring-4 ring-amber-800">
                        <CheckSquare className="w-9 h-9 text-amber-200" />
                        <span className="absolute bottom-1 font-mono text-[8px] font-black tracking-widest text-white">BRONZE</span>
                      </div>
                      <div>
                        <span className="text-xs bg-amber-50 text-amber-950 font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-sm">
                          🥉 ব্রোঞ্জ শিষ্টাচার মেডেল ({toBnNum(earnedPercentage)}% প্রগ্রেস)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3.5 text-[11px] font-bold text-slate-400 max-w-md">
                    *মেডেলের ধরণ শিক্ষার্থীর রুটিনের শতকরা অগ্রগতি ({earnedPercentage}%) এর উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে প্রদান করা হয়েছে।
                  </div>
                </div>

                {/* 4. Bottom Signature Layout - Space for Real ink signing */}
                <div className="w-full grid grid-cols-2 gap-12 sm:gap-24 items-end mt-8 max-w-3xl text-slate-800 text-[11px] sm:text-xs">
                  <div className="text-center font-bold">
                    <div className="border-b border-amber-950/40 pb-5 text-amber-950 italic font-medium font-sans">
                      {studentClass ? `শ্রেণি শিক্ষক` : `........................`}
                    </div>
                    <div className="mt-2 text-slate-600 font-extrabold tracking-wide uppercase">
                      {certSignerLeft || "শ্রেণি শিক্ষকের স্বাক্ষর"}
                    </div>
                  </div>

                  <div className="text-center font-bold">
                    <div className="border-b border-amber-950/40 pb-5 text-amber-950 italic font-medium font-sans">
                      {studentName ? `অভিভাবক ও মেন্টর` : `........................`}
                    </div>
                    <div className="mt-2 text-slate-600 font-extrabold tracking-wide uppercase">
                      {certSignerRight || "অভিভাবকের স্বাক্ষর"}
                    </div>
                  </div>
                </div>

                {/* Certificate Footer Notes */}
                <div className="mt-6 text-[9px] text-slate-400 font-mono tracking-widest uppercase flex items-center gap-2">
                  <span>© ২০২৬ শিষ্টাচার ও নিয়মানুবর্তীতা মিশন</span>
                  <span>•</span>
                  <span>RECORD REF: {selectedMonth}</span>
                  <span>•</span>
                  <span>VERIFIED BY CLOUD INTERNAL RECORD</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: GORGEOUS PORTRAIT PROGRESS ANALYTICS REPORT */}
          {activeTab === "summary" && (
            <div 
              className="print-area w-full max-w-[21cm] bg-white text-black p-6 md:p-10 flex flex-col justify-between border border-black shadow-[0_0_15px_rgba(0,0,0,0.08)] relative animate-fadeIn"
              style={{ 
                fontFamily: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
                minHeight: '28.0cm' 
              }}
              id="summary-a4-sheet"
            >
              <div>
                {/* Visual border decor */}
                {themeMode === "professional-polish" && (
                  <div className="w-full h-1.5 bg-indigo-650 mb-4" />
                )}

                {/* Printable Header Section */}
                <div className="border-b-2 border-black pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 font-semibold font-sans">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-black border-l-4 border-indigo-650 pl-3 tracking-tight">
                      শিশু-কিশোর শিষ্টাচার ও নৈতিক প্রগতি মূল্যায়ন
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                        Monthly Discipline & Conduct Analytics Report
                      </span>
                      <span className="text-[9.5px] inline-block font-extrabold border border-indigo-600 text-indigo-800 px-1.5 py-0.2 rounded bg-indigo-50/70">
                        পরিসংখ্যান ও প্রগতি বিবরণী
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold sm:w-auto w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">শিক্ষার্থী:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[100px] font-black text-black italic pb-0.5 px-0.5 bg-gray-50/50">
                        {studentName || "...................................."}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">শ্রেণি:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[65px] font-bold text-black italic pb-0.5 px-0.5 bg-gray-50/50 text-center">
                        {studentClass || "............"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">রোল:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[65px] font-bold text-black italic pb-0.5 px-0.5 bg-gray-50/50 text-center font-mono">
                        {toBnNum(studentRoll) || "............"}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-800 whitespace-nowrap">মাসের নাম:</span>
                      <div className="border-b border-gray-400 flex-1 min-w-[100px] font-black text-indigo-900 pb-0.5 px-0.5 bg-neutral-100/70 text-center">
                        {selectedMonth || "...................."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 1: Dashboard Core Metric Scoreboard (Bento Grid) */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>১. সামষ্টিক অগ্রগতি ও নৈতিক চালচিত্র</span>
                  </h2>

                  <div className="grid grid-cols-4 gap-3 font-semibold">
                    <div className="border border-neutral-300 p-2.5 rounded-lg text-center bg-indigo-50/20 hover:border-indigo-400 transition-colors flex flex-col justify-between">
                      <span className="text-[9.5px] text-gray-500 font-bold leading-tight uppercase block">মোট অর্জিত টিক</span>
                      <p className="text-base sm:text-lg font-black text-black mt-1 font-mono">
                        {toBnNum(totalEarnedPoints)} <span className="text-[10px] font-medium text-gray-450">/ {toBnNum(maxPossiblePoints)}</span>
                      </p>
                      <span className="text-[8.5px] mt-1 text-indigo-750 font-bold block">সৎ আচরণ লক্ষ্য</span>
                    </div>

                    <div className="border border-neutral-300 p-2.5 rounded-lg text-center bg-amber-50/20 hover:border-amber-400 transition-colors flex flex-col justify-between">
                      <span className="text-[9.5px] text-gray-500 font-bold leading-tight uppercase block">সাফল্য শতকরা হার</span>
                      <p className="text-base sm:text-lg font-black text-amber-700 mt-1 font-mono">
                        {toBnNum(earnedPercentage)}%
                      </p>
                      <span className="text-[8.5px] mt-1 font-bold text-amber-800 block">
                        {earnedPercentage >= 85 ? "অনন্য চরিত্র (Gold)" : earnedPercentage >= 70 ? "অতি উত্তম (Silver)" : earnedPercentage >= 50 ? "উত্তম প্রচেষ্টা (Bronze)" : "অনুপ্রেরণাদায়ক"}
                      </span>
                    </div>

                    <div className="border border-neutral-300 p-2.5 rounded-lg text-center bg-emerald-50/20 hover:border-emerald-400 transition-colors flex flex-col justify-between">
                      <span className="text-[9.5px] text-gray-500 font-bold leading-tight uppercase block">সর্বোচ্চ ধারাবাহিক স্ট্রিক</span>
                      <p className="text-base sm:text-lg font-black text-emerald-700 mt-1 font-mono">
                        {toBnNum(statistics.maxStreak)} দিন
                      </p>
                      <span className="text-[8.5px] mt-1 text-emerald-800 font-bold block">টানা ৩+ টিক অর্জন</span>
                    </div>

                    <div className="border border-neutral-300 p-2.5 rounded-lg text-left bg-purple-50/20 hover:border-purple-400 transition-colors flex flex-col justify-between">
                      <span className="text-[9.5px] text-gray-500 font-bold leading-tight uppercase block text-center">সেরা পারফর্মিং অভ্যাস</span>
                      <p className="text-[10.5px] font-black text-purple-900 mt-1 line-clamp-1 leading-snug">
                        {statistics.bestColumn.label.split("(")[0]}
                      </p>
                      <span className="text-[9.5px] mt-1 text-purple-850 font-extrabold block text-center font-mono">
                        অর্জন হার: {toBnNum(statistics.bestColumn.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Habits Column-wise Progress Report */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
                    <span>২. অভ্যাস কলাম ওয়ারী সাফল্য হার (Percentage per Column)</span>
                  </h2>

                  <div className="space-y-2">
                    {statistics.columnsList.map((col, idx) => {
                      const achievementText = col.percentage >= 85 ? "চমৎকার (Excellent)" : col.percentage >= 70 ? "সন্তোষজনক (Satisfactory)" : col.percentage >= 50 ? "চলনসই (Developing)" : "উন্নতি প্রয়োজন (Needs Improvement)";
                      const statusColor = col.percentage >= 85 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : col.percentage >= 70 ? "text-cyan-700 bg-cyan-50 border-cyan-200" : col.percentage >= 50 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-rose-700 bg-rose-50 border-rose-200";
                      
                      return (
                        <div key={idx} className="border border-neutral-200 p-2.5 sm:p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-neutral-50/30">
                          <div className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-1 text-xs">
                              <span className="font-extrabold text-slate-900 text-[11px] max-w-[80%] leading-tight">
                                {toBnNum(idx + 1)}. {col.label}
                              </span>
                              <span className="font-black text-indigo-950 font-mono">
                                {toBnNum(col.count)} / {toBnNum(daysCount)} দিন
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex relative">
                              <motion.div 
                                className={`h-full ${col.color} rounded-full relative overflow-hidden`}
                                initial={{ width: 0 }}
                                animate={{ width: `${col.percentage}%` }}
                                transition={{ type: "spring", stiffness: 60, damping: 12, restDelta: 0.01 }}
                              >
                                {/* Subtle animated sheen sweep */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                              </motion.div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 sm:self-center self-end">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded border leading-tight font-mono text-slate-800">
                              {toBnNum(col.percentage)}%
                            </span>
                            <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded border leading-tight ${statusColor}`}>
                              {achievementText}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Performance Trend (Simple Bar Chart) */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>৩. প্রগতি ও উন্নতির মেহনত চার্ট (Performance Trend)</span>
                  </h2>
                  <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                    চলতি মাসের দিনগুলোকে রুটিন অনুযায়ী সাপ্তাহিক অন্তরালে ভাগ করে প্রতিটি সপ্তাহে সৎ অভ্যাস পালনের ইতিবাচক উন্নতির চার্ট:
                  </p>

                  {/* Clean SVG Vector Bar Chart */}
                  <div className="w-full h-40 bg-neutral-50/50 p-3 border border-neutral-250 rounded-lg flex flex-col justify-between" id="summary-svg-chart">
                    <div className="flex-1 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 130" preserveAspectRatio="none">
                        {/* Horizontal Grid lines (0, 50, 100) */}
                        {[0, 50, 100].map((val, i) => {
                          const y = 110 - (val * 0.9); // Map 0..105 to 110..20
                          return (
                            <g key={i}>
                              <line x1="35" y1={y} x2="385" y2={y} stroke="#e5e5e5" strokeWidth="1" strokeDasharray="3,3" />
                              <text x="8" y={y + 3.5} className="text-[8px] fill-gray-500 font-black font-mono" textAnchor="start">
                                {toBnNum(val)}%
                              </text>
                            </g>
                          );
                        })}

                        {/* X-axis line */}
                        <line x1="35" y1="110" x2="385" y2="110" stroke="#737373" strokeWidth="1" />

                        {/* Map Bars for each week */}
                        {weeklyProgress.map((wp, i) => {
                          const count = weeklyProgress.length;
                          const secWidth = 350 / count;
                          const barW = 32;
                          const x = 35 + (i * secWidth) + (secWidth - barW) / 2;
                          const h = wp.percentage * 0.9;
                          const y = 110 - h;

                          return (
                            <g key={i} className="group animate-fadeIn">
                              {/* Background Bar */}
                              <rect x={x} y={20} width={barW} height="90" className="fill-neutral-100/30" rx="3" />
                              {/* Progress Filled Bar */}
                              <rect
                                x={x}
                                y={y}
                                width={barW}
                                height={Math.max(h, 2)}
                                fill={themeMode === "professional-polish" ? "#4f46e5" : "#000000"}
                                className="transition-all duration-350 hover:opacity-90"
                                rx="3.5"
                              />
                              {/* Percentage Text value above Bar */}
                              <text x={x + barW / 2} y={Math.min(y - 5, 95)} className="text-[9px] font-black fill-indigo-950 font-mono" textAnchor="middle">
                                {toBnNum(wp.percentage)}%
                              </text>
                              {/* Checked fraction inside Bar */}
                              {wp.percentage > 25 && (
                                <text x={x + barW / 2} y={y + 11} className="text-[7.5px] font-black fill-white" textAnchor="middle">
                                  {toBnNum(wp.scored)}/{toBnNum(wp.maxScore)}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* X-Axis labels on bottom */}
                    <div className="flex justify-between pl-[35px] pr-[10px] border-t border-neutral-200 mt-1 pt-1.5">
                      {weeklyProgress.map((wp, i) => (
                        <div key={i} className="text-[10px] font-extrabold text-neutral-850 text-center w-[75px] truncate leading-tight">
                          {wp.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Quality Analytics Summary Text */}
                  <div className="mt-3 bg-indigo-50/15 p-2.5 rounded-lg border border-indigo-200 text-[11px] leading-relaxed">
                    <span className="font-extrabold text-indigo-900 block mb-0.5">📊 ট্রেন্ড ও চরিত্র প্রগতি বিশ্লেষণ মূলক মেন্টর মন্তব্য:</span>
                    <p className="text-gray-800 font-medium font-sans">
                      শিক্ষার্থীর কলামভিত্তিক প্রাপ্ত সাফল্য হার এবং সাপ্তাহিক ট্রেন্ড চার্ট থেকে সামগ্রিক ইতিবাচক অগ্রগতি পর্যালোচনা করা হয়েছে।{' '}
                      {earnedPercentage >= 75 ? (
                        <span className="font-bold text-emerald-800">
                          অত্যন্ত আনন্দের বিষয় যে, শিক্ষার্থী নিয়মিত চমৎকার রুটিন সচেতনতা ও মার্জিত ব্যবহারের ধারাবাহিকতা রক্ষা করছে। শেষ সপ্তাহে তার প্রগতির চার্ট উর্ধ্বমুখী ও অত্যন্ত চমৎকার চরিত্র গঠনে সফল দৃষ্টান্ত স্থাপন করেছে।
                        </span>
                      ) : earnedPercentage >= 50 ? (
                        <span className="font-bold text-indigo-800">
                          শিক্ষার্থীর মধ্যে শিষ্টাচার ও পড়াশোনার সুন্দর ও নিয়মতান্ত্রিক আগ্রহ দেখা দিচ্ছে, কিছু কলামে সামান্য মেন্টরিং বৃদ্ধির অবকাশ রয়েছে। নিয়মিত প্রশংসার মাধ্যমে শিশুকে আরও এগিয়ে নিতে সাহায্য করুন।
                        </span>
                      ) : (
                        <span className="font-bold text-amber-850">
                          শিক্ষার্থী তার জীবনে সৎ অভ্যাস রোপণের প্রাথমিক ধাপে পা রেখেছে এবং সাপ্তাহিক চার্ট ওঠানামা নির্দেশ করছে। অভিভাবকের নিয়মিত সহচর্য, কোমল তদারকি ও উৎসাহ শিশুর আত্মোন্নয়নকে ব্যাপকভাবে গতিশীল করবে।
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Section 4: Monthly Goals & Reflections Overview */}
                <div className="mb-4">
                  <h2 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>৪. বিশেষ লক্ষ্যমাত্রা ও দৈনিক প্রতিফলনের মাসিক সংকলন (Monthly Goals & Reflections Overview)</span>
                  </h2>
                  <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                    চলতি মাসে সংগৃহীত দিনলিপি ও গভীর নিয়মানুবর্তী লক্ষ্যসমূহের বিস্তারিত মাসিক প্রতিবেদন:
                  </p>

                  {/* Monthly Goal Achievement Percentage Comparison Chart */}
                  {(() => {
                    const currentDaysWithGoals = rows.filter(r => r.dailyGoal && r.dailyGoal.trim()).length;
                    const currentGoalPercentage = rows.length > 0 ? Math.round((currentDaysWithGoals / rows.length) * 100) : 0;

                    const prevMonthName = getPreviousMonthName(selectedMonth);
                    const previousMonthRecord = savedRoutines.find(item => 
                      item.selectedMonth === prevMonthName &&
                      (item.studentName?.trim() === studentName?.trim() || !studentName)
                    );

                    const compareRecord = customCompareId 
                      ? savedRoutines.find(r => r.id === customCompareId)
                      : previousMonthRecord;

                    const hasCompareRecord = !!compareRecord;
                    const compareMonthLabel = compareRecord ? compareRecord.selectedMonth : (prevMonthName || "পূর্ববর্তী মাস");
                    const compareDaysWithGoals = compareRecord && Array.isArray(compareRecord.rows)
                      ? compareRecord.rows.filter((r: any) => r.dailyGoal && r.dailyGoal.trim()).length 
                      : 0;
                    const compareTotalDays = compareRecord && Array.isArray(compareRecord.rows)
                      ? compareRecord.rows.length 
                      : 0;

                    const compareGoalPercentage = hasCompareRecord && compareTotalDays > 0
                      ? Math.round((compareDaysWithGoals / compareTotalDays) * 100)
                      : 35; // Standard 35% benchmark baseline

                    const hasIncreased = currentGoalPercentage >= compareGoalPercentage;
                    const diffPercent = Math.abs(currentGoalPercentage - compareGoalPercentage);

                    return (
                      <div className="bg-[#fcfdff] border border-slate-200 rounded-xl p-3 mb-4 select-none">
                        {/* Dropdown Comparison Selector (Only visible on web) */}
                        <div className="no-print mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-150 p-2 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-700 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">🧭</span>
                            <span>তুলনামূলক লক্ষ্য প্রগতি ট্র্যাক করুন:</span>
                          </div>
                          <select
                            value={customCompareId}
                            onChange={(e) => setCustomCompareId(e.target.value)}
                            className="bg-slate-50 border border-gray-300 rounded px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800 cursor-pointer"
                          >
                            <option value="">স্বয়ংক্রিয় পূর্ববর্তী মাস ({prevMonthName || "সংরক্ষিত নেই"})</option>
                            {savedRoutines.map(item => (
                              <option key={item.id} value={item.id}>
                                {item.studentName || "অনামিকা"} ({item.selectedMonth})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Side by side chart display (Visual comparison) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                          {/* Left text column */}
                          <div className="md:col-span-4 flex flex-col justify-center text-left">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">লক্ষ্য অর্জন প্রগতি তুলনা</p>
                            <h3 className="text-indigo-950 font-black text-xs sm:text-[13px] mt-0.5 leading-snug">
                              দীর্ঘমেয়াদী চরিত্র গঠন সূচক
                            </h3>
                            <p className="text-[9.5px] text-slate-600 mt-1 leading-relaxed">
                              প্রতিটি দিনলিপিতে শিক্ষার্থীর নিজের জন্য নির্ধারণ করা "দৈনিক লক্ষ্য" ও "Detailed Reflection" পূরণ করার তুলনামূলক পর্যালোচনা।
                            </p>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                hasIncreased 
                                  ? "text-emerald-800 bg-emerald-50 border border-emerald-100" 
                                  : "text-amber-800 bg-amber-50 border border-amber-100"
                              }`}>
                                <span>{hasIncreased ? "📈" : "📉"}</span>
                                <span>প্রগতি হার: {toBnNum(diffPercent)}% {hasIncreased ? "উন্নত হয়েছে" : "হ্রাস পেয়েছে"}</span>
                              </span>
                            </div>
                          </div>

                          {/* Right bar columns */}
                          <div className="md:col-span-8 flex flex-col gap-3 py-1 bg-white border border-slate-100 rounded-lg p-2.5 shadow-sm">
                            {/* Bar 1: Comparison Month */}
                            <div>
                              <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-700 mb-1">
                                <span className="flex items-center gap-1">
                                  <span>📅</span> {compareMonthLabel} {!hasCompareRecord && "(বেঞ্চমার্ক বেসরেট)"}
                                </span>
                                <span className="font-mono text-slate-900 font-extrabold">{toBnNum(compareGoalPercentage)}% লক্ষ্যপূর্ণ</span>
                              </div>
                              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative border border-slate-200">
                                <div 
                                  className="h-full bg-slate-400 rounded-full transition-all duration-500 relative"
                                  style={{ width: `${compareGoalPercentage}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>
                                <span className="absolute left-2.5 inset-y-0 flex items-center text-[7.5px] font-black text-slate-600">
                                  {compareTotalDays > 0 ? `${toBnNum(compareDaysWithGoals)} / ${toBnNum(compareTotalDays)} দিন সংরক্ষিত` : "অনুমিত ঐতিহাসিক মান"}
                                </span>
                              </div>
                            </div>

                            {/* Bar 2: Current Month */}
                            <div>
                              <div className="flex justify-between items-center text-[9.5px] font-bold text-indigo-950 mb-1">
                                <span className="flex items-center gap-1 font-black">
                                  <span>🚀</span> চলতি মাস ({selectedMonth})
                                </span>
                                <span className="font-mono text-indigo-700 font-black">{toBnNum(currentGoalPercentage)}% লক্ষ্যপূর্ণ</span>
                              </div>
                              <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden relative border-2 border-indigo-100">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 relative"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${currentGoalPercentage}%` }}
                                  style={{ width: `${currentGoalPercentage}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                </motion.div>
                                <span className="absolute left-2.5 inset-y-0 flex items-center text-[8px] font-black text-indigo-950">
                                  {toBnNum(currentDaysWithGoals)} / {toBnNum(rows.length)} দিন সম্পূর্ণ (Your Live Tracking)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const rowsWithGoals = rows.filter(row => row.dailyGoal && row.dailyGoal.trim());
                    if (rowsWithGoals.length === 0) {
                      return (
                        <div className="border border-dashed border-amber-300 bg-amber-50/40 rounded-lg p-3 text-center">
                          <p className="text-[11px] font-bold text-amber-800 leading-tight">
                            চলতি মাসে কোনো বিশেষ লক্ষ্য বা সমাধানযোগ্য প্রতিফলন এখনও লিপিবদ্ধ করা হয়নি।
                          </p>
                          <p className="text-[9.5px] text-gray-500 mt-1">
                            আপনার ট্র্যাকার গ্রিড শীটে গিয়ে প্রতিটি দিনের শেষ কলামের জাদুকরী তারকা (Sparkles) বাটনে ক্লিক করে সহজেই দৈনিক লক্ষ্য বা চমৎকার অনুভূতিসমূহ সংরক্ষণ করতে পারেন।
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {/* Search & Filter Bar (Only visible on web) */}
                        <div className="no-print mb-2.5 flex flex-col sm:flex-row gap-2 items-center justify-between">
                          <div className="relative w-full">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                              <Search className="h-3.5 w-3.5 text-indigo-500" />
                            </span>
                            <input
                              type="text"
                              placeholder="কীওয়ার্ড বা তারিখ দিয়ে প্রতিফলন খুঁজুন (যেমন: '১৫', '১৫ই', 'শনিবার', 'ভোর', 'মনোযোগ')..."
                              value={goalsSearchQuery}
                              onChange={(e) => setGoalsSearchQuery(e.target.value)}
                              className="block w-full pl-8 pr-10 py-1.5 text-[11px] bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none transition-all font-semibold text-slate-850 placeholder-gray-400"
                            />
                            {goalsSearchQuery && (
                              <button
                                onClick={() => setGoalsSearchQuery("")}
                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-indigo-600 font-extrabold text-sm"
                                title="সার্চের ফিল্টার মুছুন"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Summary Metrics of Goals */}
                        <div className="grid grid-cols-3 gap-2 text-[9.5px] font-bold text-slate-700 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5">
                          <div className="flex items-center gap-1">
                            <span>🎯</span>
                            <span>নির্ধারিত লক্ষ্য: <span className="font-extrabold text-indigo-950 font-mono">{toBnNum(rowsWithGoals.length)} দিন</span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>📝</span>
                            <span>গভীর প্রতিফলন: <span className="font-extrabold text-emerald-700 font-mono">
                              {toBnNum(rowsWithGoals.filter(r => (r.dailyGoal || "").length >= 60).length)} দিন
                            </span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⚡</span>
                            <span>মোট অক্ষর সংখ্যা: <span className="font-extrabold text-purple-700 font-mono">
                              {toBnNum(rowsWithGoals.reduce((sum, r) => sum + (r.dailyGoal || "").length, 0))} অক্ষর
                            </span></span>
                          </div>
                        </div>

                        {/* List of goals - grid on web / print-block */}
                        {(() => {
                          const query = goalsSearchQuery.toLowerCase().trim();
                          const filtered = rowsWithGoals.filter(row => {
                            if (!query) return true;
                            const goalText = (row.dailyGoal || "").toLowerCase();
                            const dateStr = row.date.toString();
                            const dateBn = toBnNum(row.date);
                            const suffixBn = `${dateBn}ই`;
                            const wk = getWeekday(row.date);
                            const wkFull = wk.name;
                            const wkShort = wk.short;

                            return (
                              goalText.includes(query) ||
                              dateStr.includes(query) ||
                              dateBn.includes(query) ||
                              suffixBn.includes(query) ||
                              wkFull.includes(query) ||
                              wkShort.includes(query)
                            );
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="border border-dashed border-slate-200 bg-slate-50/40 rounded-lg py-5 px-3 text-center no-print">
                                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                                  আপনার অনুসন্ধান কীওয়ার্ড "<span className="text-indigo-600 font-black">{goalsSearchQuery}</span>" এর সাথে মিলে যায় এমন কোনো প্রতিফলন খুঁজে পাওয়া যায়নি।
                                </p>
                                <button
                                  onClick={() => setGoalsSearchQuery("")}
                                  className="mt-1.5 text-[9.5px] font-black text-indigo-700 hover:underline cursor-pointer"
                                >
                                  🔄 সমস্ত প্রতিফলন দেখতে ফিল্টার মুছুন
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 bg-neutral-50/20 p-1.5 rounded-lg border border-neutral-100 print:max-h-none print:overflow-visible print:bg-transparent print:border-none print:p-0">
                              {filtered.map((r) => {
                                const wordCount = (r.dailyGoal || "").length;
                                const isDeep = wordCount >= 60;
                                const wk = getWeekday(r.date);
                                return (
                                  <div key={r.date} className="bg-white border border-neutral-200 rounded-lg p-2 flex flex-col justify-between hover:border-indigo-300 transition-colors shadow-sm print:shadow-none print:border-neutral-300">
                                    <div className="flex items-center justify-between mb-1 text-[9.5px] border-b border-neutral-100 pb-1">
                                      <span className="font-extrabold text-indigo-950 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        {toBnNum(r.date)}ই {selectedMonth} ({wk.short})
                                      </span>
                                      <span className={`text-[8.5px] font-black font-mono px-1 py-0.2 rounded ${
                                        isDeep ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-slate-600 bg-slate-100"
                                      }`}>
                                        {isDeep ? "গভীর প্রতিফলন" : "স্বাভাবিক মান"}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-800 leading-relaxed font-sans italic my-1 font-medium select-text">
                                      "{(r.dailyGoal || "").trim()}"
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                </div>

                {/* Section 5: Print Signature details for Mentors/Parents/Teachers */}
                <div className="mt-4 border-t border-dashed border-neutral-400 pt-3 mb-2 font-semibold font-sans">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 mb-1">
                    ৫. অভিভাবক মূল্যায়ন ও শিক্ষক রিভিউ স্বাক্ষর বোর্ড
                  </h3>
                  <p className="text-[10px] text-gray-500 mb-4 leading-none">
                    এই প্রগতি মূল্যায়ন প্রতিবেদন সংগৃহীত ডেটাবেস রেফারেন্স অনুযায়ী সঠিক এবং বিদ্যালয়ের মূল্যায়নে ব্যবহারের উপযুক্ত।
                  </p>

                  <div className="grid grid-cols-3 gap-6 text-[10.5px] font-extrabold text-black mt-8">
                    <div className="text-center flex flex-col justify-end h-20">
                      <div className="border-t border-black pt-1.5">
                        ১. অভিভাবকের মন্তব্য ও স্বাক্ষর
                      </div>
                    </div>
                    <div className="text-center flex flex-col justify-end h-20">
                      <div className="border-t border-black pt-1.5">
                        ২. বিদ্যালয়ের মেন্টর / শিক্ষকের স্বাক্ষর
                      </div>
                    </div>
                    {principalApproved ? (
                      <div className="text-center flex flex-col justify-end h-20 relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-32 h-14 border border-emerald-600/30 bg-emerald-50/10 rounded-lg flex flex-col items-center justify-center -rotate-2 select-none print:bg-white">
                          <span className="text-[7.5px] text-emerald-700 font-extrabold uppercase tracking-widest leading-none">APPROVED • অনুমোদিত</span>
                          <span className="font-mono text-[9px] text-emerald-800 font-black italic mt-0.5">
                            {principalName.split(" ")[0]}
                          </span>
                          <span className="text-[6.5px] text-emerald-600 font-medium font-mono leading-none">
                            Ref: {selectedMonth.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[8.5px] font-semibold italic text-emerald-950 mb-1 leading-snug font-sans normal-case">
                          💡 নির্দেশনা: "{principalInstruction}"
                        </div>
                        <div className="border-t border-black pt-1.5 text-black font-extrabold text-[10px]">
                          ৩. {principalName}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col justify-end h-20">
                        <div className="border-t border-black border-dashed pt-1.5 text-slate-400">
                          ৩. প্রিন্সিপাল মহোদয়ের অনুমোদন ও স্বাক্ষর
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Summary Print view footer details */}
              <div className="border-t border-black pt-2 flex justify-between items-center text-[9.5px] font-semibold text-neutral-500 font-sans mt-2">
                <span>© ২০২৬ শিশু-কিশোর শিষ্টাচার, নৈতিকতা ও নিয়মানুবর্তী প্রজেক্ট</span>
                <span className="font-mono text-[8.5px] text-slate-450 normal-case">
                  REF: ANALYTICS-REPORT-{selectedMonth.toUpperCase()} • {new Date().toLocaleDateString("bn-BD")}
                </span>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="no-print w-full max-w-[21cm] bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 animate-fadeIn flex flex-col gap-6">
              {/* Header with Title and Description */}
              <div className="border-b border-gray-150 pb-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-200 text-emerald-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 leading-snug font-sans">
                      🔌 ক্লাউড ডাটাবেজ, গিটহাব ও ভার্সেল ডিপ্লয়মেন্ট সেন্টার
                    </h2>
                    <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      Developer Integrations & Cloud Deployment Guide
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-650 leading-relaxed font-sans mt-1">
                  অ্যাপ্লিকেশনটি প্রিন্সিপাল মহোদয়, মেন্টর শিক্ষক এবং অভিভাবকদের মাঝে ভাগাভাগি করার জন্য এটিতে দ্বৈত ক্লাউড ডাটাবেজ (স্বয়ংক্রিয় <strong>Google Firebase Firestore</strong> এবং কাস্টম কাস্টমাইজড <strong>Supabase PostgreSQL</strong>) সংযোগ ব্যবস্থা রাখা হয়েছে। নিচে সম্পূর্ণ গাইড এবং ক্লাউড সিঙ্ক প্যানেল দেওয়া হলো।
                </p>
              </div>

              {/* Grid of database and deployment cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Database Card 1: Google Firebase Firestore (Built-in) */}
                <div className="bg-gradient-to-br from-indigo-50/45 to-indigo-50/10 border border-indigo-150/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Google Cloud • Live Database
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <span>সরাসরি সক্রিয় (ACTIVE)</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-indigo-950 mb-2 flex items-center gap-1.5">
                      <Cloud className="w-4 h-4 text-indigo-600" />
                      <span>১. ফায়ারবেস ফায়ারস্টোর (Firebase)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-3">
                      এই অ্যাপটিতে ইতিমধ্যেই গুগল ফায়ারবেস সরাসরি যুক্ত করা আছে! প্রিন্সিপাল মহোদয় বা অভিভাবক যে কোনো ডিভাইস থেকে রুটিনটি সেভ করলে তা স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেজে সংরক্ষিত থাকে।
                    </p>
                    <ul className="text-[10.5px] text-slate-700 space-y-1.5 leading-snug font-semibold mb-4">
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600">✓</span>
                        <span>রুটিন ড্যাশবোর্ডে "ক্লাউডে সংরক্ষণ করুন" বাটনে ক্লিক করলেই ডেটা সংরক্ষিত হয়।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600">✓</span>
                        <span>শিক্ষার্থীকেন্দ্রিক নাম, শ্রেণি ও রোল দিয়ে সার্চ করলেই যেকোনো ডিভাইস থেকে প্রগতি রিপোর্ট পুনরুদ্ধার করা যায়।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-indigo-600">✓</span>
                        <span>প্রিন্সিপাল মহোদয় তার ফোন বা কম্পিউটার থেকে অনুমোদন দিলে তা সেকেন্ডের মধ্যে সিঙ্ক হয়ে যায়!</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 text-[10.5px] text-indigo-950 leading-relaxed font-sans font-bold">
                    💡 কোনো কাস্টম কনফিগারেশন ছাড়াই বর্তমান <strong>মেম্বার প্রিভিউ লিংক</strong> অথবা <strong>ভার্সেল লিংক</strong> এর মাধ্যমে প্রিন্সিপাল মহোদয় এবং অন্যান্য শিক্ষকেরা সরাসরি এটি লাইভ ব্যবহার করতে পারবেন।
                  </div>
                </div>

                {/* Database Card 2: Supabase (Custom SQL database) */}
                <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/5 border border-emerald-150/70 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-250/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        SUPABASE • POSTGRESQL
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        ঐচ্ছিক ব্যাকআপ (OPTIONAL)
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-emerald-950 mb-2 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>২. সুপাবেস ডাটাবেজ (Supabase Integration)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-3">
                      আপনার নিজের তৈরি করা কোনো ব্যক্তিগত বা প্রাতিষ্ঠানিক সুপাবেস প্রজেক্টের সাথে এই অ্যাপটিকে সংযুক্ত করতে চান? নিচে আপনার সুপাবেস ক্রেডেনশিয়াল দিন।
                    </p>

                    <div className="space-y-2 mb-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-0.5">SUPABASE API URL</label>
                        <input
                          type="text"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          placeholder="https://your-project.supabase.co"
                          className="w-full px-2.5 py-1.5 text-[11px] bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-emerald-600 font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-700 mb-0.5">SUPABASE ANON KEY</label>
                        <input
                          type="password"
                          value={supabaseAnonKey}
                          onChange={(e) => setSupabaseAnonKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          className="w-full px-2.5 py-1.5 text-[11px] bg-slate-50 border border-gray-200 rounded-lg focus:bg-white focus:border-emerald-600 font-mono outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {supabaseSyncMsg.text && (
                      <div className={`p-2 rounded-lg text-[10px] font-bold leading-normal font-sans ${
                        supabaseSyncMsg.type === "success" 
                          ? "bg-emerald-100/85 text-emerald-900 border border-emerald-200" 
                          : supabaseSyncMsg.type === "error" 
                          ? "bg-red-50 text-red-900 border border-red-200" 
                          : "bg-blue-50 text-blue-900 border border-blue-200"
                      }`}>
                        {supabaseSyncMsg.text}
                      </div>
                    )}
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={handleSupabasePush}
                        disabled={isSupabaseSaving}
                        className="flex-1 bg-emerald-650 hover:bg-emerald-700 text-white text-[11px] font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        {isSupabaseSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "🚀 সুপাবেসে পুশ করুন"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSupabasePull}
                        disabled={isSupabaseLoading}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-350 text-[11px] font-black py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
                      >
                        {isSupabaseLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "📥 সুপাবেস থেকে লোড"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supabase SQL code block */}
              <div className="bg-slate-900 rounded-xl p-4 text-white relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>সুপাবেস SQL রান স্ক্রিপ্ট (Supabase SQL Editor Query)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  student_name TEXT,
  student_roll TEXT,
  student_class TEXT,
  month_name TEXT,
  total_days INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  rows JSONB
);

-- Enable RLS and public access policy (for direct fetch client-side calls without auth)
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access" ON routines FOR ALL USING (true);`);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition border border-white/10 font-bold"
                  >
                    {copiedSql ? "✓ কপিকৃত!" : "📋 কোড কপি করুন"}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-300 font-medium font-sans mb-3 leading-normal">
                  সুপাবেস ব্যবহার করতে চাইলে প্রথমে আপনার Supabase Dashboard-এর <strong>SQL Editor</strong>-এ গিয়ে নিচের কোডটি পেস্ট করে <strong>Run</strong> করুন। এটি প্রয়োজনীয় 'routines' টেবিল তৈরি করে দেবে।
                </p>
                <pre className="text-[9.5px] font-mono text-slate-200 bg-slate-950 p-2.5 rounded border border-white/5 overflow-x-auto leading-relaxed select-all">
{`CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  student_name TEXT,
  student_roll TEXT,
  student_class TEXT,
  month_name TEXT,
  total_days INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  rows JSONB
);

-- Enable RLS and public access policy (for direct fetch client-side calls without auth)
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read/write access" ON routines FOR ALL USING (true);`}
                </pre>
              </div>

              {/* GitHub and Vercel Step-by-Step guides */}
              <div className="border-t border-gray-150 pt-6">
                <h3 className="text-xs font-black text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Github className="w-4 h-4 text-slate-800" />
                  <span>গিটহাব আপলোড ও ভার্সেল লাইভ হোস্টিং গাইড (Step-by-Step GitHub & Vercel Deployment)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 bg-slate-900 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center mb-2.5">
                        ১
                      </div>
                      <h4 className="text-[11.5px] font-black text-slate-950 mb-1 leading-snug">
                        এআই স্টুডিও থেকে এক্সপোর্ট
                      </h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                        আমাদের এই এআই স্টুডিও প্যানেলের উপরে ডানে থাকা <strong>Settings (⚙️)</strong> আইকনটিতে ক্লিক করুন। সেখানে <strong>"Export to GitHub"</strong> সিলেক্ট করে আপনার গিটহাব অ্যাকাউন্টে কোডটি ১-ক্লিকে পুশ করুন। অথবা <strong>"Download ZIP"</strong> করে ডাউনলোড করে নিন।
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 bg-slate-900 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center mb-2.5">
                        ২
                      </div>
                      <h4 className="text-[11.5px] font-black text-slate-950 mb-1 leading-snug">
                        গিটহাব রিপোজিটরি তৈরি
                      </h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                        যদি জিপ ফাইল হিসেবে ডাউনলোড করেন, তবে গিটহাবে (<a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">github.com</a>) গিয়ে একটি নতুন রিপোজিটরি খুলুন এবং আপনার লোকাল কম্পিউটার থেকে কোডগুলো সেখানে আপলোড করে একটি কমিট সম্পন্ন করুন।
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 bg-emerald-600 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center mb-2.5">
                        ৩
                      </div>
                      <h4 className="text-[11.5px] font-black text-emerald-950 mb-1 leading-snug">
                        ভার্সেলে ১-ক্লিকে হোস্টিং
                      </h4>
                      <p className="text-[10.5px] text-slate-600 leading-relaxed font-sans">
                        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline font-bold">Vercel.com</a>-এ প্রবেশ করে আপনার গিটহাব অ্যাকাউন্ট দিয়ে লগইন করুন। <strong>Import Project</strong> এ ক্লিক করে আপনার তৈরি করা রিপোজিটরি সিলেক্ট করুন এবং সরাসরি <strong>Deploy</strong> বাটন চাপুন।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shared benefits reminder */}
                <div className="mt-5 bg-indigo-50 border border-indigo-150 rounded-xl p-4 flex gap-3.5 items-start">
                  <span className="text-xl">✨</span>
                  <div>
                    <h4 className="text-[11.5px] font-black text-indigo-950 mb-0.5">কেন এটি সবচেয়ে সহজ সমাধান?</h4>
                    <p className="text-[10.5px] text-indigo-900 font-sans leading-relaxed">
                      যেহেতু আমাদের ডাটাবেজ ফায়ারবেস বা সুপাবেস ক্লাউডে লাইভ কানেক্টেড, তাই ভার্সেলে হোস্ট করা অ্যাপটির লিংক আপনি প্রিন্সিপাল স্যার বা অন্য শিক্ষকদের মেসেঞ্জারে বা হোয়াটসঅ্যাপে শেয়ার করে দিলে তারা বিশ্বের যেকোনো প্রান্ত থেকে তাদের নিজের ফোন বা কম্পিউটার থেকে রুটিন দেখতে, অনুমোদন দিতে ও পরিচালনা করতে পারবেন। কোনো ডেটা হারাবে না!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Decorative page footer - hidden on print */}
      <footer className="no-print mt-auto bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-medium text-slate-600">© ২০২৬ শিশু-কিশোর সৎ অভ্যাস ও শুদ্ধাচার ট্র্যাকার জেনারেটর প্রজেক্ট। সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 font-semibold text-slate-500">
            <span>ডিজাইন্ড উইথ</span>
            <span className="text-amber-500 font-bold">♥</span>
            <span>ফর প্রফেশনাল প্রিন্টার্স ফ্রেন্ডলি পিডিএফ</span>
          </p>
        </div>
      </footer>

      {showIframePrintModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-indigo-200 flex flex-col gap-4 text-center"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-snug">
                ব্রাউজারের নিরাপত্তা ব্লকিং নোটিশ
              </h3>
              <p className="text-xs font-bold text-slate-500 bg-amber-50 border border-amber-200/55 rounded py-0.5 px-1.5 mt-1 inline-block">
                আইফ্রেম (Iframe) এর কারণে সরাসরি প্রিন্ট করা যাচ্ছে না
              </p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              আপনি এখন গুগল এআই স্টুডিও মেম্বার প্রিভিউ আইফ্রেমের (Iframe) ভেতরে আছেন। ব্রাউজার সিকিউরিটি পলিসির কারণে আইফ্রেমের মধ্য থেকে সরাসরি প্রিন্ট বাটন সক্রিয় করা যায় না।
            </p>
            <div className="bg-indigo-50 border border-indigo-150/40 rounded-xl p-3 text-left">
              <p className="text-[11px] font-black text-indigo-950 mb-1">
                সহজ সমাধান (১ সেকেন্ড):
              </p>
              <p className="text-[10px] text-slate-700 leading-tight font-sans">
                নিচের বাটনে ক্লিক করে অ্যাপ্লিকেশনটি নতুন ট্যাবে খুলুন এবং সেখানে গিয়ে এই <strong>"প্রিন্ট"</strong> বাটন চাপুন। সফলভাবে সরাসরি A4 কাগজে প্রিন্ট দিতে পারবেন বা PDF সেভ করতে পারবেন।
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-extrabold py-2.5 px-4 rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🚀 নতুন ট্যাবে খুলুন ও প্রিন্ট করুন</span>
                <span className="text-xs">↗</span>
              </a>
              <button
                type="button"
                onClick={() => setShowIframePrintModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-750 text-[11px] font-extrabold py-2.5 px-4 rounded-xl transition active:scale-95 cursor-pointer border border-slate-200"
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
