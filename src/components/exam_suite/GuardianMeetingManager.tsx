// src/components/exam_suite/GuardianMeetingManager.tsx
import React, { useState } from "react";
import {
  Users,
  Printer,
  Send,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  FileCheck2,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Radio
} from "lucide-react";
import { GuardianMeeting } from "./examTypes";
import { SAMPLE_GUARDIAN_MEETINGS } from "./examMockData";
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const GuardianMeetingManager: React.FC = () => {
  const [meetings, setMeetings] = useState<GuardianMeeting[]>(() => {
    try {
      const saved = localStorage.getItem("dlikon_guardian_meetings");
      return saved ? JSON.parse(saved) : SAMPLE_GUARDIAN_MEETINGS;
    } catch {
      return SAMPLE_GUARDIAN_MEETINGS;
    }
  });

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || "meet-1");
  const [activeTab, setActiveTab] = useState<"invitation_letter" | "attendance_alerts" | "resolutions">("attendance_alerts");
  const [broadcastNoticeMsg, setBroadcastNoticeMsg] = useState<string>("");

  const currentMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0];

  const handleSaveMeetings = (updated: GuardianMeeting[]) => {
    setMeetings(updated);
    localStorage.setItem("dlikon_guardian_meetings", JSON.stringify(updated));
  };

  const handlePrint = () => {
    window.print();
  };

  // Check in an attendee (Mark Present)
  const handleToggleAttendance = (studentId: string) => {
    if (!currentMeeting) return;
    const nowTime = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

    const updatedAttendees = currentMeeting.attendees.map(att => {
      if (att.studentId === studentId) {
        const isPresent = att.status === "present";
        return {
          ...att,
          status: isPresent ? ("absent" as const) : ("present" as const),
          checkedInAt: isPresent ? undefined : nowTime
        };
      }
      return att;
    });

    const updatedMeeting = { ...currentMeeting, attendees: updatedAttendees };
    const allUpdated = meetings.map(m => m.id === currentMeeting.id ? updatedMeeting : m);
    handleSaveMeetings(allUpdated);
  };

  // Send Alert to all Absent Guardians (Continuous Alert Engine)
  const handleSendUrgentAlertToAbsent = async () => {
    if (!currentMeeting) return;
    const absentees = currentMeeting.attendees.filter(a => a.status === "absent");
    if (absentees.length === 0) {
      alert("সকল অভিভাবক ইতিমধ্যে সভায় উপস্থিত হয়েছেন! কোনো অনুপস্থিত অভিভাবক নেই।");
      return;
    }

    const nowTime = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

    const updatedAttendees = currentMeeting.attendees.map(att => {
      if (att.status === "absent") {
        const newCount = att.alertCount + 1;
        // PUSH URGENT ALERT TO STUDENT DASHBOARD
        try {
          const studentNotifKey = `student_meeting_alerts_${att.studentId}`;
          const existing = JSON.parse(localStorage.getItem(studentNotifKey) || "[]");
          existing.unshift({
            id: "meeting-alert-" + Date.now(),
            title: `🚨 জরুরি তাগিদ এলার্ট #${newCount}: অভিভাবক সভা চলমান!`,
            message: `শ্রদ্ধেয় ${att.guardianName}, আজ ${currentMeeting.meetingTime} থেকে ডি-লিকন অডিটোরিয়ামে অভিভাবক সভা চলছে। আপনার সন্তান ${att.studentName}-এর শিক্ষাজীবনের গুরুত্বপূর্ণ সিদ্ধান্তের জন্য আপনার উপস্থিতি একান্ত প্রয়োজন। অনুগ্রহ করে অনতিবিলম্বে যোগদান করুন।`,
            time: nowTime,
            meetingTitle: currentMeeting.title
          });
          localStorage.setItem(studentNotifKey, JSON.stringify(existing));
        } catch (e) {
          console.warn("Storage warning:", e);
        }

        return {
          ...att,
          alertCount: newCount,
          lastAlertSentAt: nowTime
        };
      }
      return att;
    });

    const updatedMeeting = { ...currentMeeting, attendees: updatedAttendees };
    const allUpdated = meetings.map(m => m.id === currentMeeting.id ? updatedMeeting : m);
    handleSaveMeetings(allUpdated);

    // Sync to Firestore
    try {
      await setDoc(doc(db, "guardian_meeting_live", currentMeeting.id), {
        ...updatedMeeting,
        lastAlertBroadcastAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore fallback:", err);
    }

    setBroadcastNoticeMsg(`🚨 ${absentees.length} জন অনুপস্থিত অভিভাবকের ড্যাশবোর্ডে পুশ এলার্ট ও রিমাইন্ডার সফলভাবে পাঠানো হয়েছে!`);
    setTimeout(() => setBroadcastNoticeMsg(""), 6000);
  };

  // Broadcast Meeting Letter & Agenda to all Parents
  const handleBroadcastLetter = async () => {
    if (!currentMeeting) return;
    try {
      localStorage.setItem("active_guardian_meeting_invitation", JSON.stringify(currentMeeting));

      // Push to Firestore
      try {
        await setDoc(doc(db, "active_guardian_invitations", currentMeeting.id), {
          ...currentMeeting,
          publishedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore fallback:", err);
      }

      setBroadcastNoticeMsg(`📨 সভার অনলাইন চিঠি ও এজেন্ডা সকল অভিভাবকের ড্যাশবোর্ডে ডিজিটালি পৌঁছে গেছে!`);
      setTimeout(() => setBroadcastNoticeMsg(""), 6000);
    } catch (e) {
      console.error(e);
    }
  };

  const presentCount = currentMeeting?.attendees.filter(a => a.status === "present").length || 0;
  const absentCount = currentMeeting?.attendees.filter(a => a.status === "absent").length || 0;

  return (
    <div className="space-y-6">
      {/* Top Controller Header - No Print */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-rose-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white">
                অভিভাবক সভা ও লাইভ উপস্থিতি কন্ট্রোল সিস্টেম (Guardian PTA Meeting Suite)
              </h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-rose-400 animate-ping" />
                অনুপস্থিত অভিভাবক এলার্ট ইঞ্জিন
              </span>
            </div>
            <p className="text-xs text-slate-400">
              উদ্দেশ্যসহ চিঠি তৈরি → অনুপস্থিতদের না আসা পর্যন্ত তাগিদ এলার্ট প্রেরণ → গৃহীত সিদ্ধান্তের রেজুলেশন প্রদর্শন
            </p>
          </div>
        </div>

        {/* View Switchers & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex gap-1 border border-slate-700">
            <button
              onClick={() => setActiveTab("invitation_letter")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "invitation_letter"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ✉️ ১. সভার আমন্ত্রণপত্র / চিঠি
            </button>
            <button
              onClick={() => setActiveTab("attendance_alerts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "attendance_alerts"
                  ? "bg-rose-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚨 ২. লাইভ উপস্থিতি ও এলার্ট ({absentCount} জন অনুপস্থিত)
            </button>
            <button
              onClick={() => setActiveTab("resolutions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "resolutions"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📜 ৩. সভার রেজুলেশন বুক
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>A4 প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Broadcast Alert Notification Banner */}
      {broadcastNoticeMsg && (
        <div className="no-print bg-emerald-950 border-2 border-emerald-400 p-4 rounded-xl text-white flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{broadcastNoticeMsg}</span>
        </div>
      )}

      {/* 1. INVITATION LETTER & AGENDA (A4 PRINTABLE) */}
      {activeTab === "invitation_letter" && currentMeeting && (
        <div className="space-y-4">
          <div className="no-print flex justify-end">
            <button
              onClick={handleBroadcastLetter}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>সকল অভিভাবকের ড্যাশবোর্ডে ডিজিটাল চিঠি সেন্ড করুন</span>
            </button>
          </div>

          <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-3 mb-4">
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-700 block">
                অফিশিয়াল অভিভাবক সভা বিজ্ঞপ্তি ও আমন্ত্রণপত্র
              </span>
              <h1 className="text-2xl font-black text-black">ডি-লিকন মডেল একাডেমী</h1>
              <p className="text-xs text-slate-800 font-bold">
                নৈতিক চরিত্র গঠন ও মেধা বিকাশের নির্ভরযোগ্য প্রতিষ্ঠান
              </p>
              <div className="inline-block bg-slate-900 text-white text-xs font-black px-4 py-0.5 rounded-full uppercase tracking-wider mt-2">
                জরুরি অভিভাবক সভা আহ্বান (GUARDIAN MEETING INVITATION)
              </div>
            </div>

            {/* Date & Venue Bar */}
            <div className="border border-black p-3 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 print:bg-transparent">
              <div>
                <span className="text-slate-600 block text-[10px] font-bold">সভার তারিখ:</span>
                <span className="font-black text-black font-mono">{currentMeeting.meetingDate}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px] font-bold">সময়:</span>
                <span className="font-black text-black">{currentMeeting.meetingTime}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px] font-bold">স্থান:</span>
                <span className="font-black text-black">{currentMeeting.venue}</span>
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-900">
              <p className="font-semibold indent-6 text-justify">
                {currentMeeting.letterBody}
              </p>

              {/* Agenda List */}
              <div className="border border-black p-3.5 rounded bg-slate-50/60 print:bg-transparent space-y-2">
                <h3 className="font-black text-sm text-black">
                  সভার মূল আলোচ্যসূচি (Agendas):
                </h3>
                <ul className="space-y-1.5 pl-2 font-medium">
                  {currentMeeting.agenda.map((ag, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-bold text-black">•</span>
                      <span>{ag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="font-semibold text-slate-800 italic">
                *বিশেষ অনুরোধ: শিশুদের সার্বিক শিক্ষণ ও শৃঙ্খলা নিশ্চিতকরণে আপনার মতামত ও মূল্যবান উপস্থিতি বিদ্যালয়ের লক্ষ্য বাস্তবায়নে অগ্রণী ভূমিকা রাখবে।
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs font-bold mt-8 border-t border-dashed border-slate-300">
              <div>
                <div className="border-t border-black pt-1 w-44 mx-auto">আহ্বায়ক, অভিভাবক ও শিক্ষক ফোরাম</div>
              </div>
              <div>
                <div className="border-t border-black pt-1 w-44 mx-auto">প্রধান শিক্ষক (সিল ও স্বাক্ষর)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE ATTENDANCE & CONTINUOUS ABSENT ALERT ENGINE */}
      {activeTab === "attendance_alerts" && currentMeeting && (
        <div className="space-y-5">
          {/* Action & Stats Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-600/30 border border-rose-500/50 rounded-2xl">
                <BellRing className="w-6 h-6 text-rose-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    লাইভ অভিভাবক ট্র্যাকিং ও অনুপস্থিত তাগিদ কন্ট্রোল
                  </h3>
                  <span className="text-xs bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    {absentCount} জন এখনও অনুপস্থিত
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  যে অভিভাবক এখনও সভায় আসেননি, নিচের বাটন চাপলে তাদের ফোনে বারবার উচ্চ-অগ্রাধিকার এলার্ট যেতে থাকবে
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <div className="text-emerald-400 font-bold">উপস্থিত: {presentCount} জন</div>
                <div className="text-rose-400 font-bold">অনুপস্থিত: {absentCount} জন</div>
              </div>

              <button
                onClick={handleSendUrgentAlertToAbsent}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/50 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>না আসা পর্যন্ত অনুপস্থিতদের এলার্ট পাঠান 🚨</span>
              </button>
            </div>
          </div>

          {/* Attendees List Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">
                অভিভাবকদের হাজিরা ও লাইভ চেক-ইন তালিকা
              </h4>
              <span className="text-xs text-slate-500">
                (নামে বা টগল বাটনে ক্লিক করে উপস্থিতি নিশ্চিত করুন)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-200">
                    <th className="p-2.5 w-16 text-center">রোল</th>
                    <th className="p-2.5">শিক্ষার্থীর নাম</th>
                    <th className="p-2.5">অভিভাবকের নাম</th>
                    <th className="p-2.5">মোবাইল নম্বর</th>
                    <th className="p-2.5 text-center">উপস্থিতি স্ট্যাটাস</th>
                    <th className="p-2.5 text-center">চেক-ইন সময়</th>
                    <th className="p-2.5 text-center">প্রেরিত এলার্ট সংখ্যা</th>
                    <th className="p-2.5 text-center">হাজিরা অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentMeeting.attendees.map((att) => {
                    const isPresent = att.status === "present";
                    return (
                      <tr key={att.studentId} className={isPresent ? "bg-emerald-50/30" : "bg-rose-50/20"}>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                          {att.roll}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {att.studentName}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">
                          {att.guardianName}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {att.guardianPhone}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                          }`}>
                            {isPresent ? "✓ উপস্থিত (Present)" : "✕ অনুপস্থিত (Absent)"}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                          {att.checkedInAt || "—"}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          {att.alertCount > 0 ? (
                            <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.2 rounded-full">
                              {att.alertCount} বার এলার্ট পাঠানো হয়েছে
                            </span>
                          ) : (
                            <span className="text-slate-400">০</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleToggleAttendance(att.studentId)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isPresent
                                ? "bg-slate-200 hover:bg-slate-300 text-slate-800"
                                : "bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-sm"
                            }`}
                          >
                            {isPresent ? "অনুপস্থিত করুন" : "হাজিরা দিন (Present)"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. MEETING RESOLUTIONS BOOK */}
      {activeTab === "resolutions" && currentMeeting && (
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0 print:border-none print:shadow-none print-area font-sans text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3 mb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 block">
              অফিশিয়াল সভার সিদ্ধান্ত ও রেজুলেশন খাতা
            </span>
            <h1 className="text-2xl font-black text-black">ডি-লিকন মডেল একাডেমী</h1>
            <h2 className="text-base font-bold text-slate-900">
              অভিভাবক সভার আনুষ্ঠানিক রেজুলেশন বুক (MEETING RESOLUTION BOOK)
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs font-extrabold mt-2 pt-2 border-t border-dashed border-slate-400">
              <span>সভার শিরোনাম: {currentMeeting.title}</span>
              <span>•</span>
              <span>তারিখ: {currentMeeting.meetingDate}</span>
            </div>
          </div>

          {/* Resolutions Table */}
          <div className="space-y-4">
            <h3 className="text-sm font-black border-l-4 border-indigo-700 pl-2">
              সভায় সর্বসম্মতিক্রমে গৃহীত সিদ্ধান্তসমূহ:
            </h3>

            <div className="space-y-3">
              {currentMeeting.resolutions.map((res) => (
                <div key={res.id} className="border border-black p-3.5 rounded-lg bg-slate-50/50 print:bg-transparent space-y-2 text-xs">
                  <div className="flex items-center justify-between font-black text-slate-900 border-b border-slate-200 pb-1">
                    <span className="text-sm">সিদ্ধান্ত নং {res.decisionNumber}</span>
                    <span className="text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                      বাস্তবায়ন সময়সীমা: {res.implementationDeadline}
                    </span>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block">উপস্থাপিত প্রস্তাবনা:</span>
                    <p className="font-semibold text-slate-900">{res.proposal}</p>
                  </div>

                  <div className="bg-white print:bg-transparent border border-dashed border-slate-300 p-2 rounded">
                    <span className="font-bold text-emerald-800 block">গৃহীত সর্বসম্মত সিদ্ধান্ত:</span>
                    <p className="font-black text-slate-950">{res.decision}</p>
                  </div>

                  <div className="text-[11px] text-slate-600 font-bold">
                    বাস্তবায়নকারী দায়িত্বপ্রাপ্ত: <span className="text-black">{res.responsiblePerson}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-16 text-center text-xs font-bold mt-8 border-t border-dashed border-slate-300">
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">অভিভাবক প্রতিনিধি</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">সদস্য সচিব</div>
            </div>
            <div>
              <div className="border-t border-black pt-1 w-32 mx-auto">সভাপতি / প্রধান শিক্ষক</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
