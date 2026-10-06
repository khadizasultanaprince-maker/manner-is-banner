// src/components/exam_suite/GateScannerConfigPanel.tsx
// Gate Scanner Configuration & Student ID - Parent Phone Linker Panel
import React, { useState } from "react";
import {
  Link2,
  Phone,
  Search,
  Save,
  CheckCircle2,
  Users,
  Printer,
  ShieldCheck,
  RefreshCw,
  Plus,
  Edit2,
  FileText
} from "lucide-react";
import { StudentSecurityProfile } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { NoticeBoardIndexSheet } from "./NoticeBoardIndexSheet";

export const GateScannerConfigPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<StudentSecurityProfile[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_student_security_profiles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_SECURITY_PROFILES;
  });

  const [selectedClass, setSelectedClass] = useState<string>("সকল শ্রেণি");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState<string>("");
  const [editEmergency, setEditEmergency] = useState<string>("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>("");
  const [showNoticeBoardView, setShowNoticeBoardView] = useState<boolean>(false);

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesClass = selectedClass === "সকল শ্রেণি" || p.className.includes(selectedClass);
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.indexNumber && p.indexNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.guardianPhone.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  // Start inline editing
  const handleStartEdit = (p: StudentSecurityProfile) => {
    setEditingId(p.studentId);
    setEditPhone(p.guardianPhone);
    setEditEmergency(p.emergencyContact || "");
  };

  // Save updated phone link
  const handleSavePhoneLink = async (studentId: string) => {
    const updated = profiles.map((p) => {
      if (p.studentId === studentId) {
        return {
          ...p,
          guardianPhone: editPhone.trim(),
          emergencyContact: editEmergency.trim()
        };
      }
      return p;
    });

    setProfiles(updated);
    localStorage.setItem("dlikon_student_security_profiles", JSON.stringify(updated));

    // Save to Firestore
    try {
      const targetProfile = updated.find((p) => p.studentId === studentId);
      if (targetProfile) {
        await setDoc(doc(db, "student_security_profiles", studentId), {
          ...targetProfile,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn("Firestore sync fallback to localStorage:", err);
    }

    setEditingId(null);
    setSaveSuccessMsg(`✅ শিক্ষার্থীর আইডি '${studentId}'-এর সাথে অভিভাবকের ফোন নম্বর (${editPhone}) সফলভাবে লিংক করা হয়েছে!`);
    setTimeout(() => setSaveSuccessMsg(""), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controller */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                গেট স্ক্যানার কনফিগারেশন ও অভিভাবক ফোন নম্বর লিংক প্যানেল
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                Student ID ↔ Phone Mapping
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              শিক্ষার্থী আইডি ও ইউনিক ইনডেক্সের সাথে অভিভাবকের মোবাইল নম্বর সংযুক্ত করুন যাতে গেট স্ক্যান করামাত্রই সঠিক নম্বরে এসএমএস পৌঁছায়
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowNoticeBoardView(!showNoticeBoardView)}
            className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>{showNoticeBoardView ? "লিংক তালিকায় ফিরে যান" : "📋 নোটিশ বোর্ড ইনডেক্স তালিকা দেখুন"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-950 border-2 border-emerald-400 p-4 rounded-2xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* RENDER NOTICE BOARD VIEW OR MAPPING TABLE */}
      {showNoticeBoardView ? (
        <NoticeBoardIndexSheet />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 font-sans text-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>শিক্ষার্থী আইডি ও অভিভাবক ফোন নম্বর ম্যাপিং তালিকা</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                যেকোনো শিক্ষার্থীর ফোন নম্বরে ক্লিক করে নতুন অভিভাবক মোবাইল নম্বর লিংক করতে পারবেন
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer"
              >
                <option value="সকল শ্রেণি">সকল শ্রেণি</option>
                <option value="নার্সারি">নার্সারি</option>
                <option value="প্রথম">প্রথম শ্রেণি</option>
                <option value="দ্বিতীয়">দ্বিতীয় শ্রেণি</option>
                <option value="তৃতীয়">তৃতীয় শ্রেণি</option>
                <option value="চতুর্থ">চতুর্থ শ্রেণি</option>
                <option value="পঞ্চম">পঞ্চম শ্রেণি</option>
                <option value="সপ্তম">সপ্তম শ্রেণি (Class 7)</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম / আইডি / ফোন..."
                  className="bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 outline-none w-48 font-medium"
                />
              </div>
            </div>
          </div>

          {/* TABLE OF LINKED PROFILES */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">শিক্ষার্থী আইডি</th>
                  <th className="p-2.5">ইউনিক ইনডেক্স নম্বর</th>
                  <th className="p-2.5">শিক্ষার্থীর নাম</th>
                  <th className="p-2.5">শ্রেণি ও রোল</th>
                  <th className="p-2.5">অভিভাবকের নাম</th>
                  <th className="p-2.5 text-emerald-700">লিংককৃত অভিভাবকের ফোন নম্বর</th>
                  <th className="p-2.5">জরুরি যোগাযোগ</th>
                  <th className="p-2.5 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p) => {
                  const isEditing = editingId === p.studentId;

                  return (
                    <tr key={p.studentId} className="hover:bg-slate-50/80 transition">
                      <td className="p-2.5 font-mono font-black text-indigo-700">
                        {p.studentId}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-amber-700 bg-amber-50/50">
                        {p.indexNumber || p.studentId}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="p-2.5 text-slate-600">
                        {p.className}, রোল: {p.roll}
                      </td>
                      <td className="p-2.5 text-slate-700">
                        {p.fatherName || p.guardianName}
                      </td>
                      <td className="p-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="bg-white border-2 border-emerald-500 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900 outline-none w-36 shadow-sm"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-700">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{p.guardianPhone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editEmergency}
                            onChange={(e) => setEditEmergency(e.target.value)}
                            placeholder="018XXXXXXXX"
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono text-slate-900 outline-none w-32"
                          />
                        ) : (
                          <span className="font-mono text-slate-500">{p.emergencyContact || "—"}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleSavePhoneLink(p.studentId)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] shadow transition cursor-pointer flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>সেভ</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] transition cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(p)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[11px] transition flex items-center gap-1 cursor-pointer mx-auto"
                            title="ফোন নম্বর লিংক পরিবর্তন করুন"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>লিংক পরিবর্তন</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
