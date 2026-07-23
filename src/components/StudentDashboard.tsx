import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  CheckCircle2,
  Circle,
  BookOpen,
  PenTool,
  Trophy,
  Sparkles,
  Award,
  Target,
  Flame,
  Camera,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  Star,
  Plus,
  Trash2,
  Bell,
  Heart
} from "lucide-react";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

interface StudyTask {
  id: string;
  title: string;
  category: "study" | "handwriting" | "habit";
  completed: boolean;
  notes?: string;
  assignedTime?: string;
}

interface StudentUser {
  studentId: string; // unique ID e.g. STU-101
  name: string;
  class: string;
  roll: string;
  photoUrl: string;
  dreamGoal: string;
  createdAt: string;
}

const DEFAULT_TASKS: StudyTask[] = [
  { id: "1", title: "বাংলা: 'সংকল্প' কবিতার প্রথম ৮ লাইন মুখস্থ করা", category: "study", completed: false, assignedTime: "সকালের পড়া ০৫:৩০" },
  { id: "2", title: "গণিত: অনুশীলনী ৩.১ এর ১ থেকে ৫ নম্বর অংক সমাধান", category: "study", completed: false, assignedTime: "সকালের পড়া ০৬:৩০" },
  { id: "3", title: "ইংরেজি: ১০টি নতুন Vocabulary শব্দ ও অর্থ আয়ত্ত করা", category: "study", completed: false, assignedTime: "সকালের পড়া ০৭:৩০" },
  { id: "4", title: "হাতের লেখা: বাংলা ২ পৃষ্ঠা স্পষ্ট ও সুন্দর অক্ষরে লেখা", category: "handwriting", completed: false, assignedTime: "স্কুল ছুটির পর" },
  { id: "5", title: "হাতের লেখা: English Cursive Writing 1 Page", category: "handwriting", completed: false, assignedTime: "স্কুল ছুটির পর" },
  { id: "6", title: "সন্ধ্যার পড়া: বিজ্ঞান ও সমাজ অধ্যায় ১ রিডিং ও প্রশ্নোত্তর", category: "study", completed: false, assignedTime: "সন্ধ্যার পড়া ০৭:০০" },
  { id: "7", title: "৫ ওয়াক্ত নামাজ আদায় ও পিতামাতাকে কাজে সাহায্য করা", category: "habit", completed: false, assignedTime: "সারাদিন" }
];

export default function StudentDashboard() {
  // Current logged in student session
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(() => {
    try {
      const saved = localStorage.getItem("current_student_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Mode: "login" or "signup"
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Signup form state
  const [signupId, setSignupId] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupClass, setSignupClass] = useState("পঞ্চম");
  const [signupRoll, setSignupRoll] = useState("০১");
  const [signupPass, setSignupPass] = useState("");
  const [signupGoal, setSignupGoal] = useState("ভবিষ্যতে একজন আদর্শ ও সফল মানুষ হওয়া");
  const [signupPhoto, setSignupPhoto] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80");

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student tasks
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(`student_tasks_${currentStudent?.studentId || "guest"}`);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<"study" | "handwriting" | "habit">("study");
  const [newTaskTime, setNewTaskTime] = useState("");

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editGoal, setEditGoal] = useState("");
  const [editPhoto, setEditPhoto] = useState("");

  // Auto-load tasks when student changes
  useEffect(() => {
    if (currentStudent?.studentId) {
      const storageKey = `student_tasks_${currentStudent.studentId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch {
          setTasks(DEFAULT_TASKS);
        }
      } else {
        setTasks(DEFAULT_TASKS);
      }
      setEditGoal(currentStudent.dreamGoal || "");
      setEditPhoto(currentStudent.photoUrl || "");
      // Fetch cloud task sync if available
      loadCloudStudentData(currentStudent.studentId);
    }
  }, [currentStudent?.studentId]);

  // Sync tasks to local storage & Firestore
  useEffect(() => {
    if (currentStudent?.studentId) {
      const storageKey = `student_tasks_${currentStudent.studentId}`;
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      saveCloudStudentTasks(currentStudent.studentId, tasks);
    }
  }, [tasks, currentStudent?.studentId]);

  // Calculate Progress Stats
  const totalTasks = tasks.length;
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const studyTasks = useMemo(() => tasks.filter((t) => t.category === "study"), [tasks]);
  const handwritingTasks = useMemo(() => tasks.filter((t) => t.category === "handwriting"), [tasks]);
  const habitTasks = useMemo(() => tasks.filter((t) => t.category === "habit"), [tasks]);

  const studyCompleted = useMemo(() => studyTasks.filter((t) => t.completed).length, [studyTasks]);
  const handwritingCompleted = useMemo(() => handwritingTasks.filter((t) => t.completed).length, [handwritingTasks]);

  // Check for 100% completion celebration trigger
  useEffect(() => {
    if (totalTasks > 0 && progressPercent === 100 && !hasCelebratedToday) {
      setShowCelebration(true);
      setHasCelebratedToday(true);
    }
  }, [progressPercent, totalTasks, hasCelebratedToday]);

  // Cloud Load Helper
  async function loadCloudStudentData(stuId: string) {
    try {
      const docRef = doc(db, "student_accounts", stuId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.tasks && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
      }
    } catch (e) {
      console.warn("Cloud student sync warning (working offline):", e);
    }
  }

  // Cloud Save Helper
  async function saveCloudStudentTasks(stuId: string, currentTasks: StudyTask[]) {
    try {
      const docRef = doc(db, "student_accounts", stuId);
      await setDoc(docRef, { tasks: currentTasks, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (e) {
      console.warn("Cloud student save warning:", e);
    }
  }

  // Handle Signup
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!signupId.trim() || !signupName.trim() || !signupPass.trim()) {
      setAuthError("অনুগ্রহ করে আইডি, নাম ও পাসওয়ার্ড সঠিকভাবে প্রদান করুন।");
      return;
    }

    const cleanedId = signupId.trim().toUpperCase();
    setIsSubmitting(true);

    try {
      // Check if student exists in cloud or localStorage
      const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
      if (localUsers[cleanedId]) {
        setAuthError("এই আইডি দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। লগইন চেষ্টা করুন।");
        setIsSubmitting(false);
        return;
      }

      const newStudent: StudentUser = {
        studentId: cleanedId,
        name: signupName.trim(),
        class: signupClass.trim(),
        roll: signupRoll.trim(),
        photoUrl: signupPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        dreamGoal: signupGoal.trim() || "ভবিষ্যতে সফল হওয়া",
        createdAt: new Date().toISOString()
      };

      // Save locally
      localUsers[cleanedId] = { ...newStudent, password: signupPass };
      localStorage.setItem("all_student_accounts", JSON.stringify(localUsers));
      localStorage.setItem("current_student_user", JSON.stringify(newStudent));

      // Save to Cloud Firestore
      try {
        await setDoc(doc(db, "student_accounts", cleanedId), {
          ...newStudent,
          password: signupPass,
          tasks: DEFAULT_TASKS
        });
      } catch (err) {
        console.warn("Firestore sync optional error:", err);
      }

      setCurrentStudent(newStudent);
      setAuthSuccess("সাইনআপ সফল হয়েছে! স্বাগতম তোমার ব্যক্তিগত ড্যাশবোর্ডে।");
    } catch (err: any) {
      setAuthError("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!loginId.trim() || !loginPass.trim()) {
      setAuthError("অনুগ্রহ করে স্টুডেন্ট আইডি ও পাসওয়ার্ড প্রবেশ করাও।");
      return;
    }

    const cleanedId = loginId.trim().toUpperCase();
    setIsSubmitting(true);

    try {
      // Check LocalStorage first
      const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
      let matchedUser = localUsers[cleanedId];

      if (!matchedUser) {
        // Try Cloud Firestore
        try {
          const docRef = doc(db, "student_accounts", cleanedId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            matchedUser = snap.data();
          }
        } catch (err) {
          console.warn("Cloud lookup warning:", err);
        }
      }

      if (matchedUser && matchedUser.password === loginPass) {
        const studentInfo: StudentUser = {
          studentId: matchedUser.studentId,
          name: matchedUser.name,
          class: matchedUser.class,
          roll: matchedUser.roll,
          photoUrl: matchedUser.photoUrl,
          dreamGoal: matchedUser.dreamGoal,
          createdAt: matchedUser.createdAt
        };
        localStorage.setItem("current_student_user", JSON.stringify(studentInfo));
        setCurrentStudent(studentInfo);
        setAuthSuccess("লগইন সফল হয়েছে!");
      } else {
        setAuthError("আইডি অথবা পাসওয়ার্ড সঠিক নয়! আবার পরীক্ষা করুন।");
      }
    } catch (err) {
      setAuthError("লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Logout
  function handleLogout() {
    localStorage.removeItem("current_student_user");
    setCurrentStudent(null);
    setTasks(DEFAULT_TASKS);
    setHasCelebratedToday(false);
  }

  // Toggle Task Completion
  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  // Add New Custom Study Task
  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      completed: false,
      assignedTime: newTaskTime.trim() || "আজকের পড়া"
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskTime("");
  }

  // Delete Task
  function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // Save Profile Edits
  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStudent) return;

    const updated: StudentUser = {
      ...currentStudent,
      dreamGoal: editGoal || currentStudent.dreamGoal,
      photoUrl: editPhoto || currentStudent.photoUrl
    };

    setCurrentStudent(updated);
    localStorage.setItem("current_student_user", JSON.stringify(updated));

    // Update in all_student_accounts
    const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
    if (localUsers[updated.studentId]) {
      localUsers[updated.studentId] = { ...localUsers[updated.studentId], ...updated };
      localStorage.setItem("all_student_accounts", JSON.stringify(localUsers));
    }

    // Cloud update
    try {
      setDoc(doc(db, "student_accounts", updated.studentId), updated, { merge: true });
    } catch (err) {
      console.warn("Cloud profile update warning:", err);
    }

    setIsEditingProfile(false);
  }

  // Image File Upload Handler
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (authMode === "signup") {
          setSignupPhoto(result);
        } else {
          setEditPhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Preset Avatars
  const PRESET_AVATARS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  ];

  // ==================== AUTH SCREEN (If Not Logged In) ====================
  if (!currentStudent) {
    return (
      <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-6 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl shadow-2xl border border-indigo-500/30 font-sans">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/40 rounded-full text-indigo-200 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>শিক্ষার্থী পোর্টাল • নিবেদিত ড্যাশবোর্ড</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            🎓 শিক্ষার্থীর ব্যক্তিগত অ্যাকাউন্ট ও ড্যাশবোর্ড
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            তোমার আইডি ও পাসওয়ার্ড দিয়ে সাইনআপ করে তোমার পড়ালেখার অগ্রগতি, প্রতিদিনের নির্দিষ্ট পড়া ও হাতের লেখা সম্পন্ন করে অর্জনের শীর্ষে পৌঁছে যাও!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-indigo-500/30 flex gap-2 w-full max-w-md">
            <button
              onClick={() => { setAuthMode("login"); setAuthError(""); setAuthSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                authMode === "login"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>১. স্টুডেন্ট লগইন (Login)</span>
            </button>

            <button
              onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthSuccess(""); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border border-emerald-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span>২. নতুন সাইনআপ (Sign Up)</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {authError && (
          <div className="max-w-md mx-auto mb-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2">
            <span className="text-rose-400 text-base">⚠️</span>
            <span>{authError}</span>
          </div>
        )}
        {authSuccess && (
          <div className="max-w-md mx-auto mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
            <span className="text-emerald-400 text-base">✅</span>
            <span>{authSuccess}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="max-w-md mx-auto bg-slate-800/60 p-6 rounded-2xl border border-indigo-500/20 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>স্টুডেন্ট আইডি / রোল নম্বর (Student ID):</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: STU-101 অথবা 05"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>পাসওয়ার্ড (Password):</span>
              </label>
              <input
                type="password"
                placeholder="আপনার নিজস্ব গোপন পাসওয়ার্ড"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>{isSubmitting ? "লগইন হচ্ছে..." : "ড্যাশবোর্ডে প্রবেশ করুন 🚀"}</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-gray-400">
                নতুন অ্যাকাউন্ট নেই?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="text-amber-300 underline font-bold hover:text-amber-200 cursor-pointer"
                >
                  এখনই সাইনআপ করুন
                </button>
              </span>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignup} className="max-w-xl mx-auto bg-slate-800/60 p-6 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  শিক্ষার্থীর পূর্ণ নাম:
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আরিয়ান হোসেন"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  স্টুডেন্ট আইডি (Student ID):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: STU-101"
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  শ্রেণি (Class):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পঞ্চম"
                  value={signupClass}
                  onChange={(e) => setSignupClass(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1">
                  রোল নম্বর (Roll):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ০১"
                  value={signupRoll}
                  onChange={(e) => setSignupRoll(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-200 mb-1">
                পাসওয়ার্ড (Password):
              </label>
              <input
                type="password"
                placeholder="একটি শক্তিশালী পাসওয়ার্ড লিখুন"
                value={signupPass}
                onChange={(e) => setSignupPass(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-300" />
                <span>তোমার স্বপ্ন / জীবন লক্ষ্য (Dream Goal):</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: বৈজ্ঞানিক হওয়া / সৎ ও সেরা শিক্ষার্থী হওয়া"
                value={signupGoal}
                onChange={(e) => setSignupGoal(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Profile Picture Upload & Presets */}
            <div>
              <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-emerald-300" />
                <span>প্রোফাইল ছবি পছন্দ / আপলোড করুন:</span>
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={signupPhoto}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover shadow-md"
                />
                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="block w-full text-[11px] text-gray-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">বা পছন্দ করো:</span>
                    <div className="flex gap-1.5">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setSignupPhoto(url)}
                          className={`w-6 h-6 rounded-full border transition overflow-hidden cursor-pointer ${
                            signupPhoto === url ? "border-amber-400 scale-110 ring-2 ring-amber-300" : "border-gray-500 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>{isSubmitting ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "সাইনআপ করে ড্যাশবোর্ডে প্রবেশ করো ✨"}</span>
            </button>

            <div className="text-center pt-1">
              <span className="text-[11px] text-gray-400">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-emerald-300 underline font-bold hover:text-emerald-200 cursor-pointer"
                >
                  এখানে লগইন করুন
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // ==================== LOGGED IN STUDENT DASHBOARD ====================
  return (
    <div className="w-full max-w-5xl mx-auto my-4 p-4 sm:p-6 bg-slate-900 text-white rounded-2xl shadow-2xl border border-indigo-500/30 font-sans space-y-6">
      {/* CELEBRATION / MOTIVATIONAL MODAL (Triggered when 100% completed) */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-2 border-amber-400 text-white p-6 sm:p-8 rounded-3xl max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
            {/* Sparkle background effects */}
            <div className="absolute top-2 left-2 text-amber-300 text-2xl animate-bounce">✨</div>
            <div className="absolute top-4 right-4 text-amber-300 text-3xl animate-pulse">🌟</div>
            <div className="absolute bottom-2 left-4 text-rose-300 text-2xl animate-spin">💫</div>

            <div className="inline-flex p-3 bg-amber-400/20 rounded-full text-amber-300 border border-amber-400/40 mb-3 shadow-lg">
              <Trophy className="w-12 h-12 text-amber-300 animate-bounce" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide mb-1">
              🎉 অভিনন্দন {currentStudent.name}! 🎉
            </h3>
            <p className="text-sm font-extrabold text-indigo-200 mb-4">
              তুমি আজকের সবগুলো পড়া ও হাতের লেখার কাজ ১০০% সফলভাবে সম্পন্ন করেছো!
            </p>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-400/30 text-left space-y-2 mb-6">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                <span>বিশেষ প্রেরণামূলক স্বীকৃতি সনদ:</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-semibold">
                &quot;তোমার আজকের এই অদম্য একাগ্রতা, সুন্দর হাতের লেখা এবং নিয়মিত অধ্যবসায় তোমাকে ভবিষ্যতের একজন উচ্চাকাঙ্ক্ষী, শক্তিশালী ও বিজয়ী শিক্ষার্থী হিসেবে গড়ে তুলছে। কোনো বাঁধাই তোমাকে থামাতে পারবে না!&quot;
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-indigo-300 border-t border-gray-700">
                <span>🏆 অর্জন: ১০০% প্রগ্রেস ব্যাজ</span>
                <span>🔥 ড্যাশবোর্ড স্ট্রাইক সক্রিয়</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setShowCelebration(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer"
              >
                ধন্যবাদ, আমি এগিয়ে যাবো! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP STUDENT PROFILE HEADER */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-800 to-purple-950 p-4 sm:p-5 rounded-2xl border border-indigo-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={currentStudent.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={currentStudent.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400 object-cover shadow-lg"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
              ⭐ ১০০%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {currentStudent.name}
              </h2>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                আইডি: {currentStudent.studentId}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-300 font-semibold mt-1">
              <span>শ্রেণি: <strong className="text-amber-300">{currentStudent.class}</strong></span>
              <span>•</span>
              <span>রোল: <strong className="text-amber-300">{currentStudent.roll}</strong></span>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-200 bg-amber-500/10 border border-amber-400/30 px-2.5 py-1 rounded-lg">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>লক্ষ্য: <strong>&quot;{currentStudent.dreamGoal}&quot;</strong></span>
            </div>
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3 py-2 bg-indigo-600/60 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl border border-indigo-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Camera className="w-3.5 h-3.5 text-indigo-200" />
            <span>প্রোফাইল তথ্য আপডেট</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl border border-rose-400/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-white" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* EDIT PROFILE INLINE MODAL */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-slate-800 p-4 rounded-2xl border border-indigo-400/40 space-y-3 animate-fade-in">
          <h4 className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>তোমার প্রোফাইল ছবি ও স্বপ্ন লক্ষ্য হালনাগাদ করো:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">স্বপ্ন / লক্ষ্য পরিবর্তন:</label>
              <input
                type="text"
                value={editGoal}
                onChange={(e) => setEditGoal(e.target.value)}
                className="w-full bg-slate-900 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">নতুন ছবির ফাইল আপলোড:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-[11px] text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-indigo-600 file:text-white cursor-pointer"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-3 py-1 bg-gray-700 text-xs font-bold rounded-lg text-gray-300 hover:bg-gray-600"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
            >
              সংরক্ষণ করো
            </button>
          </div>
        </form>
      )}

      {/* OVERALL PROGRESS METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Main Progress Ring / Bar */}
        <div className="sm:col-span-2 bg-gradient-to-br from-slate-800 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-black text-amber-300">আজকের পড়ার অগ্রগতি (Study Progress)</h3>
            </div>
            <span className="text-xs font-extrabold text-indigo-200">
              {completedTasks} / {totalTasks} টি পড়া সম্পন্ন
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-4 p-0.5 border border-indigo-500/30 overflow-hidden my-2">
            <div
              className="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 h-full rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-1 text-gray-300">
            <span>প্রগ্রেস: <strong className="text-amber-300 text-sm">{progressPercent}%</strong></span>
            {progressPercent === 100 ? (
              <span className="text-emerald-400 flex items-center gap-1 font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>সব পড়া সম্পন্ন! মহা বিজয়ী 🏆</span>
              </span>
            ) : (
              <span className="text-indigo-300 font-semibold">
                আর মাত্র {totalTasks - completedTasks} টি পড়া বাকি, দ্রুত টিক দাও!
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-indigo-500/30 space-y-2.5 shadow-md flex flex-col justify-between">
          <h4 className="text-xs font-black text-gray-200 flex items-center gap-1.5 border-b border-gray-700 pb-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>বিষয়ভিত্তিক বিভাজন:</span>
          </h4>

          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex justify-between items-center text-gray-300">
              <span className="flex items-center gap-1">📖 পড়ালেখার পাঠ:</span>
              <span className="text-amber-300 font-bold">{studyCompleted}/{studyTasks.length}</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="flex items-center gap-1">✍️ হাতের লেখা:</span>
              <span className="text-teal-300 font-bold">{handwritingCompleted}/{handwritingTasks.length}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCelebration(true)}
            className="w-full py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:bg-amber-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>অর্জন ব্যাজ ও সার্টিফিকেট দেখুন</span>
          </button>
        </div>
      </div>

      {/* ASSIGNED STUDY TOPICS & HANDWRITING CHECKLIST */}
      <div className="bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>আজকের নির্ধারিত পড়া ও হাতের লেখার তালিকা</span>
            </h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              পড়া শেখা ও হাতের লেখা সম্পন্ন হওয়ার সাথে সাথে বাঁপাশের ঘরে টিক (✓) দিয়ে তোমার প্রগ্রেস বাড়াও!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold bg-indigo-900/60 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 text-amber-400" />
            <span>মোট পয়েন্ট: <strong className="text-amber-300">{completedTasks * 10}</strong> / {totalTasks * 10}</span>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                task.completed
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-inner"
                  : "bg-slate-900/90 border-indigo-500/30 text-white hover:border-indigo-400 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-500 hover:text-indigo-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {task.category === "study" && (
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[9.5px] font-black px-2 py-0.2 rounded-full">
                        📖 নির্দিষ্ট পড়া
                      </span>
                    )}
                    {task.category === "handwriting" && (
                      <span className="bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[9.5px] font-black px-2 py-0.2 rounded-full">
                        ✍️ হাতের লেখা
                      </span>
                    )}
                    {task.category === "habit" && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9.5px] font-black px-2 py-0.2 rounded-full">
                        🕌 সৎ অভ্যাস
                      </span>
                    )}

                    {task.assignedTime && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        ⏰ {task.assignedTime}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs sm:text-sm font-bold leading-snug ${task.completed ? "line-through text-emerald-300/80" : "text-gray-100"}`}>
                    {task.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition ${
                    task.completed
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-indigo-900/80 text-indigo-200 border border-indigo-500/30"
                  }`}
                >
                  {task.completed ? "শিখেছি ✓" : "বাকি আছে ⏳"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-1 text-gray-500 hover:text-rose-400 transition cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ADD CUSTOM TASK FORM */}
        <form onSubmit={handleAddTask} className="pt-3 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="নতুন পড়া বা পাঠের বিষয় যোগ করুন..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as any)}
              className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-indigo-200 focus:outline-none"
            >
              <option value="study">📖 নির্দিষ্ট পড়া</option>
              <option value="handwriting">✍️ হাতের লেখা</option>
              <option value="habit">🕌 সৎ অভ্যাস</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="সময়সীমা"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-full bg-slate-900 border border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-white placeholder-gray-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </form>
      </div>

      {/* MOTIVATIONAL BOOST CARD */}
      <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-400/30 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-lg">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-300">
              দৈনিক অনুপ্রেরণা বাক্য (Daily Mindset Booster)
            </h4>
            <p className="text-xs text-gray-200 mt-0.5 leading-relaxed font-semibold">
              &quot;যে শিক্ষার্থী তার আজকের পড়া ও হাতের লেখা সময়মতো সম্পন্ন করে, সে নিজের ভাগ্য নিজেই গড়ে তোলে। তুমি বিজয়ী!&quot;
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>প্রিন্ট/ডাউনলোড করুন</span>
        </button>
      </div>
    </div>
  );
}
