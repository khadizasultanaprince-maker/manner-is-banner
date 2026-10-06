// src/components/exam_suite/NoticeBoardIndexSheet.tsx
// Printable Class-wise Master Index Number Notice Board Sheet for D-Likon Model Academy
import React, { useState } from "react";
import {
  Printer,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  ShieldCheck,
  Building,
  Sparkles,
  Phone,
  FileText
} from "lucide-react";
import { StudentSecurityProfile } from "./examTypes";
import { SAMPLE_SECURITY_PROFILES } from "./examMockData";
import { studentsByClass } from "../../studentsData";

interface NoticeBoardIndexSheetProps {
  onSelectStudent?: (studentId: string) => void;
}

export const NoticeBoardIndexSheet: React.FC<NoticeBoardIndexSheetProps> = ({
  onSelectStudent
}) => {
  const [selectedClass, setSelectedClass] = useState<string>("সকল শ্রেণি");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Load registered security profiles
  const profiles: StudentSecurityProfile[] = (() => {
    try {
      const saved = localStorage.getItem("dlikon_student_security_profiles");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SAMPLE_SECURITY_PROFILES;
  })();

  // Generate complete combined student roster across all 10 classes
  const combinedRoster = React.useMemo(() => {
    const list: Array<{
      sl: number;
      studentId: string;
      indexNumber: string;
      classRollCode: string;
      name: string;
      className: string;
      roll: string;
      fatherName: string;
      phone: string;
      bloodGroup: string;
    }> = [];

    let counter = 1;

    // Helper to get class number digit
    const getClassDigit = (cls: string) => {
      if (cls.includes("নার্সারি")) return "0";
      if (cls.includes("প্রথম")) return "1";
      if (cls.includes("দ্বিতীয়")) return "2";
      if (cls.includes("তৃতীয়")) return "3";
      if (cls.includes("চতুর্থ")) return "4";
      if (cls.includes("পঞ্চম")) return "5";
      if (cls.includes("ষষ্ঠ")) return "6";
      if (cls.includes("সপ্তম")) return "7";
      if (cls.includes("অষ্টম")) return "8";
      if (cls.includes("নবম")) return "9";
      if (cls.includes("দশম")) return "10";
      return "5";
    };

    // First include all custom security profiles
    profiles.forEach(p => {
      const cleanRoll = p.roll.replace(/[^\d]/g, "") || "1";
      const clsDigit = getClassDigit(p.className);
      list.push({
        sl: counter++,
        studentId: p.studentId,
        indexNumber: p.indexNumber || `DLM-2026-${clsDigit.padStart(2, "0")}${cleanRoll.padStart(3, "0")}`,
        classRollCode: `${clsDigit}_${cleanRoll}`,
        name: p.name,
        className: p.className,
        roll: p.roll,
        fatherName: p.fatherName || p.guardianName || "মোঃ রফিকুল হাসান",
        phone: p.guardianPhone || p.emergencyContact || "01711-234567",
        bloodGroup: p.bloodGroup || "B+"
      });
    });

    // Also enrich with class rosters from studentsData for classes 1-10 (e.g. Class 7)
    Object.entries(studentsByClass).forEach(([clsName, classStudents]) => {
      classStudents.forEach(st => {
        // avoid duplicate if already in list
        const exists = list.some(item => item.className === clsName && item.roll === st.roll);
        if (!exists) {
          const cleanRoll = st.roll.replace(/[^\d]/g, "") || "1";
          const clsDigit = getClassDigit(clsName);
          list.push({
            sl: counter++,
            studentId: `DLM-${clsDigit}${cleanRoll.padStart(2, "0")}`,
            indexNumber: `DLM-2026-${clsDigit.padStart(2, "0")}${cleanRoll.padStart(3, "0")}`,
            classRollCode: `${clsDigit}_${cleanRoll}`,
            name: st.name,
            className: clsName,
            roll: st.roll,
            fatherName: st.fatherName || "অভিভাবক",
            phone: st.contactPhone || "01711-XXXXXX",
            bloodGroup: "B+"
          });
        }
      });
    });

    return list;
  }, [profiles]);

  // Filter list
  const filteredRoster = combinedRoster.filter(st => {
    const matchesClass = selectedClass === "সকল শ্রেণি" || st.className.includes(selectedClass);
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.indexNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.classRollCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.phone.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* NO-PRINT CONTROLLER HEADER */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                সকল শিক্ষার্থীর ইউনিক ইনডেক্স নম্বর নোটিশ বোর্ড তালিকা
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Printable Notice Board A4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              নোটিশ বোর্ডে টানানোর জন্য প্রস্তুতকৃত তালিকা — শিক্ষার্থীরা এখান থেকে তাদের ইনডেক্স ও শ্রেণি-রোল কোড (যেমন: 7_4) দেখে সাইনআপ করবে
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="সকল শ্রেণি">সকল শ্রেণি (Master List)</option>
            <option value="নার্সারি">নার্সারি</option>
            <option value="প্রথম">প্রথম শ্রেণি</option>
            <option value="দ্বিতীয়">দ্বিতীয় শ্রেণি</option>
            <option value="তৃতীয়">তৃতীয় শ্রেণি</option>
            <option value="চতুর্থ">চতুর্থ শ্রেণি</option>
            <option value="পঞ্চম">পঞ্চম শ্রেণি</option>
            <option value="ষষ্ঠ">ষষ্ঠ শ্রেণি</option>
            <option value="সপ্তম">সপ্তম শ্রেণি (Class 7)</option>
            <option value="অষ্টম">অষ্টম শ্রেণি</option>
            <option value="নবম">নবম শ্রেণি</option>
            <option value="দশম">দশম শ্রেণি</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম / রোল / 7_4 / ইনডেক্স..."
              className="bg-slate-800 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-2 text-xs outline-none w-44"
            />
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>🖨️ A4 নোটিশ বোর্ড শিট প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* OFFICIAL PRINTABLE A4 NOTICE BOARD SHEET */}
      <div
        id="notice-board-sheet"
        className="bg-white text-black p-8 sm:p-10 rounded-2xl shadow-2xl max-w-5xl mx-auto border-2 border-slate-300 print:border-none print:shadow-none print:m-0 print:p-4 print:max-w-none print:w-full font-sans"
      >
        {/* INSTITUTIONAL HEADER */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center font-serif font-black text-lg bg-slate-100">
              ডি
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 block">
                গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত বিদ্যাপীঠ
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                ডি-লিকন মডেল একাডেমী
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            শুদ্ধাচার, আমলনামা, আধুনিক পাঠ্যক্রম ও ডিজিটাল নিরাপত্তা ক্যাম্পাস
          </p>
          <div className="mt-2 inline-block bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black tracking-wide">
            📢 নোটিশ বোর্ডে প্রকাশের জন্য শিক্ষার্থীদের ডিজিটাল ইউনিক ইনডেক্স ও আইডি কোড তালিকা — শিক্ষাবর্ষ ২০২৬
          </div>
          <p className="text-[11px] text-slate-500 mt-1 italic">
            (শিক্ষার্থী ও অভিভাবকবৃন্দ সাইন-আপ ও আইডি কার্ডের জন্য নিচে প্রদত্ত ইউনিক ইনডেক্স অথবা শ্রেণি-রোল কোড ব্যবহার করবেন)
          </p>
        </div>

        {/* METADATA BAR */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg border border-slate-300 mb-4">
          <span>প্রদর্শিত শ্রেণি: <strong className="text-slate-900">{selectedClass}</strong></span>
          <span>মোট তালিকাভুক্ত শিক্ষার্থী: <strong className="text-slate-900">{filteredRoster.length} জন</strong></span>
          <span>প্রকাশের তারিখ: <strong>{new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
        </div>

        {/* MASTER INDEX TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-800">
            <thead>
              <tr className="bg-slate-200 text-slate-900 font-black border-b-2 border-slate-800">
                <th className="p-2 border border-slate-400 text-center w-10">ক্রমিক</th>
                <th className="p-2 border border-slate-400">শ্রেণি</th>
                <th className="p-2 border border-slate-400 text-center w-14">রোল</th>
                <th className="p-2 border border-slate-400 bg-amber-100 text-amber-950 font-mono text-center">
                  শ্রেণি_রোল কোড
                </th>
                <th className="p-2 border border-slate-400 bg-indigo-50 text-indigo-950 font-mono font-black text-center">
                  ইউনিক ইনডেক্স নম্বর (Index No)
                </th>
                <th className="p-2 border border-slate-400">শিক্ষার্থীর নাম</th>
                <th className="p-2 border border-slate-400">পিতা / অভিভাবকের নাম</th>
                <th className="p-2 border border-slate-400 font-mono text-center">অভিভাবকের মোবাইল</th>
                <th className="p-2 border border-slate-400 text-center w-12">গ্রুপ</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map((item, idx) => (
                <tr
                  key={item.studentId + idx}
                  className={`border-b border-slate-300 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <td className="p-2 border border-slate-300 text-center font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="p-2 border border-slate-300 font-bold text-slate-800">
                    {item.className}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-bold font-mono">
                    {item.roll}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-mono font-black bg-amber-50/60 text-amber-900">
                    {item.classRollCode}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-mono font-black bg-indigo-50/60 text-indigo-700">
                    {item.indexNumber}
                  </td>
                  <td className="p-2 border border-slate-300 font-black text-slate-900">
                    {item.name}
                  </td>
                  <td className="p-2 border border-slate-300 text-slate-700">
                    {item.fatherName}
                  </td>
                  <td className="p-2 border border-slate-300 font-mono text-center text-slate-800">
                    {item.phone}
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-bold text-red-600">
                    {item.bloodGroup}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* OFFICIAL SIGNATURES */}
        <div className="mt-12 pt-6 border-t-2 border-slate-800 flex items-end justify-between text-xs">
          <div className="text-center">
            <div className="w-36 border-b border-slate-700 pb-1 mb-1 font-mono text-[11px] text-slate-500">
              ডি-লিকন নোটিশ বোর্ড
            </div>
            <span className="font-bold text-slate-800">প্রস্তুতকারক (অফিস সহকারী)</span>
          </div>

          <div className="text-center">
            <div className="w-40 border-b border-slate-700 pb-1 mb-1 font-serif italic text-amber-900 font-black">
              মুহাম্মদ জহিরুল হক
            </div>
            <span className="font-bold text-slate-800">পরীক্ষা নিয়ন্ত্রক / কো-অর্ডিনেটর</span>
          </div>

          <div className="text-center">
            <div className="w-44 border-b border-slate-700 pb-1 mb-1 font-serif italic text-indigo-900 font-black">
              সৈয়দ মারুফ
            </div>
            <span className="font-bold text-slate-900">প্রধান শিক্ষক (স্বাক্ষর ও সিল)</span>
          </div>
        </div>

        {/* NOTICE BOARD FOOTER */}
        <div className="mt-6 text-center text-[10px] text-slate-500 border-t border-slate-200 pt-2">
          ডি-লিকন মডেল একাডেমী • বিশেষ বিজ্ঞপ্তি: কোনো শিক্ষার্থীর ইনডেক্স বা মোবাইল নম্বরে সংশোধন প্রয়োজন হলে আগামী ৩ কার্যদিবসের মধ্যে বিদ্যালয় অফিসে যোগাযোগ করুন।
        </div>
      </div>
    </div>
  );
};
