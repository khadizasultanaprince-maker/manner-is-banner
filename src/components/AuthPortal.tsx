import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Code2,
  Lock,
  LogIn,
  UserPlus,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  ArrowRight,
  Database,
  BookOpen
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthPortalProps {
  onLoginSuccess: (
    role: "student" | "master" | "developer",
    userInfo?: { name?: string; id?: string }
  ) => void;
}

export default function AuthPortal({ onLoginSuccess }: AuthPortalProps) {
  const [selectedRole, setSelectedRole] = useState<"student" | "master" | "developer">("student");
  const [showPassword, setShowPassword] = useState(false);

  // Student Form
  const [studentAuthMode, setStudentAuthMode] = useState<"login" | "signup">("login");
  const [studentId, setStudentId] = useState("");
  const [studentPass, setStudentPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupClass, setSignupClass] = useState("পঞ্চম");
  const [signupRoll, setSignupRoll] = useState("০১");
  const [signupGoal, setSignupGoal] = useState("আদর্শ ও সফল মানুষ হওয়া");

  // Master Form
  const [masterPass, setMasterPass] = useState("");

  // Developer Form
  const [devPass, setDevPass] = useState("");

  // Alert State
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Default Passwords (stored in localStorage if changed)
  const masterSecret = localStorage.getItem("master_password") || "master123";
  const devSecret = localStorage.getItem("developer_password") || "dev123";

  // Handle Student Auth
  async function handleStudentAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!studentId.trim() || !studentPass.trim()) {
      setErrorMessage("অনুগ্রহ করে আইডি ও পাসওয়ার্ড প্রবেশ করান।");
      return;
    }

    const cleanId = studentId.trim().toUpperCase();
    setIsLoading(true);

    try {
      if (studentAuthMode === "signup") {
        if (!signupName.trim()) {
          setErrorMessage("শিক্ষার্থীর পূর্ণ নাম লিখুন।");
          setIsLoading(false);
          return;
        }

        const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
        if (localUsers[cleanId]) {
          setErrorMessage("এই আইডি দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি করা আছে। লগইন করুন।");
          setIsLoading(false);
          return;
        }

        const newStudent = {
          studentId: cleanId,
          name: signupName.trim(),
          class: signupClass.trim(),
          roll: signupRoll.trim(),
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          dreamGoal: signupGoal.trim() || "সফল মানুষ হওয়া",
          password: studentPass,
          createdAt: new Date().toISOString()
        };

        // Save locally
        localUsers[cleanId] = newStudent;
        localStorage.setItem("all_student_accounts", JSON.stringify(localUsers));
        localStorage.setItem("current_student_user", JSON.stringify(newStudent));

        // Save to Firestore optionally
        try {
          await setDoc(doc(db, "student_accounts", cleanId), newStudent, { merge: true });
        } catch (e) {
          console.warn("Cloud save optional:", e);
        }

        setSuccessMessage("সাইনআপ সফল! শিক্ষার্থী পোর্টালে প্রবেশ করা হচ্ছে...");
        setTimeout(() => {
          onLoginSuccess("student", { name: newStudent.name, id: cleanId });
        }, 800);
      } else {
        // Login Mode
        const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
        let matched = localUsers[cleanId];

        if (!matched) {
          try {
            const snap = await getDoc(doc(doc(db, "student_accounts", cleanId) as any));
            if (snap.exists()) {
              matched = snap.data();
            }
          } catch (e) {
            console.warn("Cloud check optional:", e);
          }
        }

        if (matched && matched.password === studentPass) {
          localStorage.setItem("current_student_user", JSON.stringify(matched));
          setSuccessMessage("লগইন সফল! স্বাগতম " + matched.name);
          setTimeout(() => {
            onLoginSuccess("student", { name: matched.name, id: cleanId });
          }, 800);
        } else {
          setErrorMessage("আইডি বা পাসওয়ার্ড ভুল হয়েছে! পরীক্ষা করুন।");
        }
      }
    } catch (err) {
      setErrorMessage("লগইন সিস্টেমে ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Master Auth
  function handleMasterAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (masterPass === masterSecret || masterPass === "1234") {
      setSuccessMessage("মাস্টার / শিক্ষক এডমিন লগইন সফল!");
      setTimeout(() => {
        onLoginSuccess("master", { name: "মাস্টার এডমিন (শিক্ষক)" });
      }, 600);
    } else {
      setErrorMessage("ভুল মাস্টার পাসওয়ার্ড! ডিফল্ট পাসওয়ার্ড: master123 অথবা 1234");
    }
  }

  // Handle Developer Auth
  function handleDevAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (devPass === devSecret || devPass === "admin123") {
      setSuccessMessage("ডেভেলপার সিকিউরিটি এক্সেস অনুমোদিত!");
      setTimeout(() => {
        onLoginSuccess("developer", { name: "ডেভেলপার আর্কিটেক্ট" });
      }, 600);
    } else {
      setErrorMessage("ভুল ডেভেলপার সিকিউরিটি কি! ডিফল্ট কি: dev123");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* TOP HEADER BRANDING BANNER */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 text-center border-b border-indigo-500/30 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400/20 border border-amber-300/40 rounded-full text-amber-300 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>সিকিউরিটি পোর্টাল • ত্রি-স্তর লগইন সিস্টেম</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            শিশু-কিশোর শিষ্টাচার ও নৈতিকতা ট্র্যাকার
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-xl mx-auto font-medium">
            অনুগ্রহ করে আপনার নির্ধারিত রোল (শিক্ষার্থী, মাস্টার/শিক্ষক, বা ডেভেলপার) নির্বাচন করে সিস্টেমে প্রবেশ করুন।
          </p>
        </div>

        {/* ROLE SELECTION CARDS (3 ROLES) */}
        <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-indigo-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* 1. STUDENT ROLE CARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole("student");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`p-4 rounded-2xl border transition text-left relative cursor-pointer overflow-hidden ${
                selectedRole === "student"
                  ? "bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-indigo-400 ring-2 ring-indigo-400/50 shadow-xl"
                  : "bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                  <UserCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  রোল ১
                </span>
              </div>
              <h3 className="text-sm font-black text-white">১. শিক্ষার্থী লগইন</h3>
              <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                পড়ালেখার তালিকা, হাতের লেখা চেকলিস্ট ও প্রগ্রেস রিপোর্ট
              </p>
            </button>

            {/* 2. MASTER ROLE CARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole("master");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`p-4 rounded-2xl border transition text-left relative cursor-pointer overflow-hidden ${
                selectedRole === "master"
                  ? "bg-gradient-to-br from-emerald-900/90 to-teal-900/90 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl"
                  : "bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
                  <Award className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  রোল ২
                </span>
              </div>
              <h3 className="text-sm font-black text-white">২. মাস্টার / শিক্ষক লগইন</h3>
              <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                রুটিন গ্রিড, এওয়ার্ড সনদ জেনারেটর ও অভিভাবক মিটিং
              </p>
            </button>

            {/* 3. DEVELOPER ROLE CARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole("developer");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`p-4 rounded-2xl border transition text-left relative cursor-pointer overflow-hidden ${
                selectedRole === "developer"
                  ? "bg-gradient-to-br from-amber-950/90 to-purple-950/90 border-amber-400 ring-2 ring-amber-400/50 shadow-xl"
                  : "bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
                  <Code2 className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  রোল ৩
                </span>
              </div>
              <h3 className="text-sm font-black text-white">৩. ডেভেলপার লগইন</h3>
              <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                ফুল সিস্টেম কন্ট্রোল, ক্লাউড ইন্টিগ্রেশন ও হোস্টিং প্যানেল
              </p>
            </button>

          </div>
        </div>

        {/* FORM BODY CONTAINER */}
        <div className="p-6 sm:p-8">

          {/* ALERTS */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM 1: STUDENT FORM */}
          {selectedRole === "student" && (
            <form onSubmit={handleStudentAuth} className="space-y-4 max-w-lg mx-auto">
              <div className="flex justify-between items-center bg-slate-800/80 p-1 rounded-xl border border-indigo-500/30 mb-4">
                <button
                  type="button"
                  onClick={() => { setStudentAuthMode("login"); setErrorMessage(""); }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                    studentAuthMode === "login"
                      ? "bg-indigo-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  স্টুডেন্ট লগইন (Login)
                </button>
                <button
                  type="button"
                  onClick={() => { setStudentAuthMode("signup"); setErrorMessage(""); }}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                    studentAuthMode === "signup"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  নতুন সাইনআপ (Sign Up)
                </button>
              </div>

              {studentAuthMode === "signup" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">শিক্ষার্থীর পূর্ণ নাম:</label>
                    <input
                      type="text"
                      placeholder="যেমন: আরিয়ান হোসেন"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">শ্রেণি ও রোল:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="শ্রেণি"
                        value={signupClass}
                        onChange={(e) => setSignupClass(e.target.value)}
                        className="w-1/2 bg-slate-950 border border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="রোল"
                        value={signupRoll}
                        onChange={(e) => setSignupRoll(e.target.value)}
                        className="w-1/2 bg-slate-950 border border-indigo-500/40 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  স্টুডেন্ট আইডি / রোল নম্বর (ID):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: STU-101 অথবা 05"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2.5 text-xs font-bold text-white uppercase placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  পাসওয়ার্ড (Password):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={studentPass}
                    onChange={(e) => setStudentPass(e.target.value)}
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {studentAuthMode === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">তোমার স্বপ্ন / লক্ষ্য:</label>
                  <input
                    type="text"
                    placeholder="যেমন: বৈজ্ঞানিক হওয়া / সৎ ও আদর্শ মানুষ হওয়া"
                    value={signupGoal}
                    onChange={(e) => setSignupGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>
                  {isLoading
                    ? "প্রসেসিং হচ্ছে..."
                    : studentAuthMode === "signup"
                    ? "সাইনআপ করে পোর্টালে প্রবেশ করুন 🚀"
                    : "শিক্ষার্থী পোর্টালে লগইন করুন 🚀"}
                </span>
              </button>
            </form>
          )}

          {/* FORM 2: MASTER FORM */}
          {selectedRole === "master" && (
            <form onSubmit={handleMasterAuth} className="space-y-4 max-w-lg mx-auto bg-slate-950/80 p-6 rounded-2xl border border-emerald-500/30">
              <div className="text-center mb-2">
                <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-300 border border-emerald-400/40 mb-2">
                  <Award className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-base font-black text-white">মাস্টার / শিক্ষক এডমিন এক্সেস</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  শিক্ষক ও পরিচালনা পর্ষদের জন্য রুটিন, সার্টিফিকেট ও সমাবেশ ডিজাইন প্যানেল।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-200 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>মাস্টার সিকিউরিটি পাসওয়ার্ড (Master Password):</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="মাস্টার পাসওয়ার্ড লিখুন"
                    value={masterPass}
                    onChange={(e) => setMasterPass(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-200 flex items-center justify-between">
                <span>🔑 ডিফল্ট মাস্টার পাসওয়ার্ড: <strong className="text-amber-300 font-mono">master123</strong> (বা <strong className="text-amber-300 font-mono">1234</strong>)</span>
                <button
                  type="button"
                  onClick={() => setMasterPass("master123")}
                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px] cursor-pointer"
                >
                  স্বয়ংক্রিয় পূরণ
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>মাস্টার ড্যাশবোর্ডে প্রবেশ করুন ✨</span>
              </button>
            </form>
          )}

          {/* FORM 3: DEVELOPER FORM */}
          {selectedRole === "developer" && (
            <form onSubmit={handleDevAuth} className="space-y-4 max-w-lg mx-auto bg-slate-950/80 p-6 rounded-2xl border border-amber-500/30">
              <div className="text-center mb-2">
                <div className="inline-flex p-3 bg-amber-500/20 rounded-full text-amber-300 border border-amber-400/40 mb-2">
                  <Code2 className="w-6 h-6 text-amber-300" />
                </div>
                <h3 className="text-base font-black text-white">ডেভেলপার আর্কিটেক্ট সিকিউরিটি এক্সেস</h3>
                <p className="text-xs text-amber-200 mt-1">
                  ফুল সিস্টেম পারমিশন, ফায়ারবেস/সুপাবেস ডাটাবেজ ইন্টিগ্রেশন ও রুটিন ইঞ্জিন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ডেভেলপার সিকিউরিটি পাসওয়ার্ড (Developer Password):</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="ডেভেলপার পাসওয়ার্ড লিখুন"
                    value={devPass}
                    onChange={(e) => setDevPass(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400 outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-amber-950/60 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 flex items-center justify-between">
                <span>⚡ ডিফল্ট ডেভেলপার সিকিউরিটি কি: <strong className="text-amber-300 font-mono">dev123</strong> (বা <strong className="text-amber-300 font-mono">admin123</strong>)</span>
                <button
                  type="button"
                  onClick={() => setDevPass("dev123")}
                  className="px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded text-[10px] cursor-pointer"
                >
                  স্বয়ংক্রিয় পূরণ
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-600 via-purple-600 to-indigo-700 hover:from-amber-500 hover:to-indigo-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Code2 className="w-4 h-4 text-amber-200" />
                <span>ডেভেলপার প্যানেল সক্রিয় করুন 🚀</span>
              </button>
            </form>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-slate-950 p-4 text-center text-xs text-gray-500 border-t border-slate-800">
          <span>শিশুর নৈতিক বিকাশ ও শুদ্ধাচার প্রজেক্ট ২০২৬ • সুরক্ষিত লগইন সার্ভিস</span>
        </div>

      </div>
    </div>
  );
}
