import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  UserCheck,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Edit,
  ShieldCheck,
  Send,
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
  Wrench,
  HelpCircle,
  Filter,
  User
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

export interface SupportTicket {
  id: string;
  senderRole: "student" | "teacher" | "master";
  senderId: string;
  senderName: string;
  category: "study_issue" | "login_issue" | "routine_help" | "other";
  description: string;
  status: "pending" | "in_progress" | "solved";
  createdAt: string;
  resolutionNote?: string;
  solvedBy?: string;
  solvedAt?: string;
}

interface SupportTroubleshooterProps {
  currentRole: "student" | "master" | "developer";
  onImpersonateStudent?: (studentId: string, studentName: string) => void;
}

export default function SupportTroubleshooter({
  currentRole,
  onImpersonateStudent
}: SupportTroubleshooterProps) {
  const [activeTab, setActiveTab] = useState<"tickets" | "inspector" | "create">("tickets");

  // Tickets state
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem("all_support_tickets");
      return saved ? JSON.parse(saved) : getInitialDefaultTickets();
    } catch {
      return getInitialDefaultTickets();
    }
  });

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "solved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Ticket resolution state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionMessage, setResolutionMessage] = useState("");

  // Student inspector state
  const [allStudents, setAllStudents] = useState<Record<string, any>>({});
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentData, setSelectedStudentData] = useState<any | null>(null);
  const [studentTasks, setStudentTasks] = useState<any[]>([]);

  // Task edit state for selected student
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<"study" | "handwriting" | "habit">("study");
  const [newTaskTime, setNewTaskTime] = useState("");

  // Edit profile state for student inspector
  const [editName, setEditName] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editRoll, setEditRoll] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [showProfileSavedAlert, setShowProfileSavedAlert] = useState(false);

  // New ticket form
  const [newTicketRole, setNewTicketRole] = useState<"student" | "teacher">("student");
  const [newTicketSenderId, setNewTicketSenderId] = useState("STU-101");
  const [newTicketSenderName, setNewTicketSenderName] = useState("আরিয়ান হোসেন");
  const [newTicketCategory, setNewTicketCategory] = useState<"study_issue" | "login_issue" | "routine_help" | "other">("study_issue");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [ticketSubmitSuccess, setTicketSubmitSuccess] = useState(false);

  // Load registered students and cloud sync
  useEffect(() => {
    loadAllStudents();
  }, []);

  function getInitialDefaultTickets(): SupportTicket[] {
    return [
      {
        id: "TICK-101",
        senderRole: "student",
        senderId: "STU-101",
        senderName: "আরিয়ান হোসেন",
        category: "study_issue",
        description: "আমার বাংলা 'সংকল্প' কবিতার পড়া টি সফলভাবে সম্পন্ন হওয়ার পরও পয়েন্ট আপডেট হচ্ছে না। অনুগ্রহ করে চেক করে দিন।",
        status: "pending",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: "TICK-102",
        senderRole: "student",
        senderId: "STU-102",
        senderName: "ফাতেমা খাতুন",
        category: "routine_help",
        description: "আমার শ্রেণিশিক্ষক নতুন ৩টি অংক বিষয় যোগ করতে বলেছেন। আমার ড্যাশবোর্ডে কাজগুলো যুক্ত করে দিন।",
        status: "solved",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        resolutionNote: "গণিত অনুশীলনী ৩.২ এর সমাধানমূলক নতুন ৩টি টাস্ক আপনার ড্যাশবোর্ডে যোগ করে দেওয়া হয়েছে।",
        solvedBy: "মাস্টার শিক্ষক এডমিন",
        solvedAt: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ];
  }

  // Save tickets to storage & cloud
  useEffect(() => {
    localStorage.setItem("all_support_tickets", JSON.stringify(tickets));
    syncCloudTickets(tickets);
  }, [tickets]);

  async function syncCloudTickets(ticketList: SupportTicket[]) {
    try {
      await setDoc(doc(db, "system_metadata", "support_tickets"), {
        tickets: ticketList,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Cloud tickets sync warning:", e);
    }
  }

  function loadAllStudents() {
    try {
      const localUsers = JSON.parse(localStorage.getItem("all_student_accounts") || "{}");
      
      // Add default mock student if empty
      if (Object.keys(localUsers).length === 0) {
        localUsers["STU-101"] = {
          studentId: "STU-101",
          name: "আরিয়ান হোসেন",
          class: "পঞ্চম",
          roll: "০১",
          dreamGoal: "বিজ্ঞানমনস্ক ও সুনাগরিক হওয়া",
          password: "123",
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        };
        localUsers["STU-102"] = {
          studentId: "STU-102",
          name: "ফাতেমা খাতুন",
          class: "পঞ্চম",
          roll: "০২",
          dreamGoal: "আদর্শ শিক্ষিকা হওয়া",
          password: "123",
          photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
        };
        localStorage.setItem("all_student_accounts", JSON.stringify(localUsers));
      }

      setAllStudents(localUsers);

      const firstId = Object.keys(localUsers)[0];
      if (firstId && !selectedStudentId) {
        selectStudentForInspection(firstId, localUsers[firstId]);
      }
    } catch (e) {
      console.error("Error loading students:", e);
    }
  }

  function selectStudentForInspection(id: string, data?: any) {
    setSelectedStudentId(id);
    const stuData = data || allStudents[id];
    setSelectedStudentData(stuData);

    if (stuData) {
      setEditName(stuData.name || "");
      setEditClass(stuData.class || "");
      setEditRoll(stuData.roll || "");
      setEditPass(stuData.password || "");
      setEditGoal(stuData.dreamGoal || "");

      // Load tasks
      const savedTasks = localStorage.getItem(`student_tasks_${id}`);
      if (savedTasks) {
        try {
          setStudentTasks(JSON.parse(savedTasks));
        } catch {
          setStudentTasks(getDefaultTasksList());
        }
      } else {
        setStudentTasks(getDefaultTasksList());
      }
    }
  }

  function getDefaultTasksList() {
    return [
      { id: "1", title: "বাংলা: 'সংকল্প' কবিতার ৮ লাইন পাঠ", category: "study", completed: true, assignedTime: "সকালের পড়া" },
      { id: "2", title: "গণিত: অনুশীলনী ৩.১ এর ৫টি অংক", category: "study", completed: false, assignedTime: "সকালের পড়া" },
      { id: "3", title: "হাতের লেখা: সুন্দর অক্ষরে বাংলা ২ পৃষ্ঠা", category: "handwriting", completed: false, assignedTime: "বিকালের পড়া" }
    ];
  }

  // Save changes to selected student's tasks
  function saveStudentTasksChanges(newTasks: any[]) {
    setStudentTasks(newTasks);
    if (selectedStudentId) {
      localStorage.setItem(`student_tasks_${selectedStudentId}`, JSON.stringify(newTasks));
      
      // Save cloud sync
      try {
        setDoc(doc(db, "student_accounts", selectedStudentId), { tasks: newTasks, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.warn("Cloud student save warning:", e);
      }
    }
  }

  // Toggle student task
  function handleToggleStudentTask(taskId: string) {
    const updated = studentTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    saveStudentTasksChanges(updated);
  }

  // Add task for student
  function handleAddStudentTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      completed: false,
      assignedTime: newTaskTime.trim() || "শিক্ষক কর্তৃক নির্ধারিত"
    };

    const updated = [...studentTasks, newTask];
    saveStudentTasksChanges(updated);
    setNewTaskTitle("");
    setNewTaskTime("");
  }

  // Delete task for student
  function handleDeleteStudentTask(taskId: string) {
    const updated = studentTasks.filter((t) => t.id !== taskId);
    saveStudentTasksChanges(updated);
  }

  // Save edited profile for student
  function handleSaveStudentProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId || !selectedStudentData) return;

    const updatedStu = {
      ...selectedStudentData,
      name: editName.trim(),
      class: editClass.trim(),
      roll: editRoll.trim(),
      password: editPass.trim(),
      dreamGoal: editGoal.trim()
    };

    const updatedAll = { ...allStudents, [selectedStudentId]: updatedStu };
    setAllStudents(updatedAll);
    setSelectedStudentData(updatedStu);
    localStorage.setItem("all_student_accounts", JSON.stringify(updatedAll));

    try {
      setDoc(doc(db, "student_accounts", selectedStudentId), updatedStu, { merge: true });
    } catch (e) {
      console.warn("Cloud save error:", e);
    }

    setShowProfileSavedAlert(true);
    setTimeout(() => setShowProfileSavedAlert(false), 2500);
  }

  // Handle ticket resolution
  function handleSolveTicket(ticketId: string) {
    if (!resolutionMessage.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "solved" as const,
          resolutionNote: resolutionMessage.trim(),
          solvedBy: currentRole === "developer" ? "ডেভেলপার সিকিউরিটি আর্কিটেক্ট" : "মাস্টার এডমিন (শিক্ষক)",
          solvedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTickets(updated);
    setResolvingTicketId(null);
    setResolutionMessage("");
  }

  // Handle new ticket submission
  function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newTicketDesc.trim()) return;

    const newTicket: SupportTicket = {
      id: `TICK-${Math.floor(100 + Math.random() * 900)}`,
      senderRole: newTicketRole,
      senderId: newTicketSenderId.trim() || "USER-01",
      senderName: newTicketSenderName.trim() || "ব্যবহারকারী",
      category: newTicketCategory,
      description: newTicketDesc.trim(),
      status: "pending",
      createdAt: new Date().toISOString()
    };

    setTickets([newTicket, ...tickets]);
    setNewTicketDesc("");
    setTicketSubmitSuccess(true);
    setTimeout(() => {
      setTicketSubmitSuccess(false);
      setActiveTab("tickets");
    }, 1500);
  }

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === "pending" && t.status !== "pending") return false;
    if (filterStatus === "solved" && t.status !== "solved") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.senderName.toLowerCase().includes(q) ||
        t.senderId.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const solvedCount = tickets.filter((t) => t.status === "solved").length;

  return (
    <div className="w-full max-w-5xl mx-auto my-6 p-4 sm:p-6 bg-slate-900 text-white rounded-3xl shadow-2xl border border-amber-500/30 font-sans space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-5 sm:p-6 rounded-2xl border border-amber-400/40 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-300/40 rounded-full text-amber-300 text-xs font-black mb-2">
              <LifeBuoy className="w-4 h-4 text-amber-300 animate-spin" />
              <span>স্মার্ট সাপোর্ট ও ট্রাবলশুটিং প্যানেল</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide flex items-center gap-2">
              <span>🛠️ শিক্ষার্থী ও শিক্ষকের ড্যাশবোর্ড সমস্যা সমাধান সেন্টার</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl font-medium">
              যেকোনো শিক্ষার্থীর ড্যাশবোর্ড সরাসরি পরিদর্শন করুন, টাস্ক এডিট করে দিন, সমস্যা সমাধান নোট লিখুন এবং সমস্যা নিমিষে সমাধান নিশ্চিত করুন।
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-indigo-500/30">
            <div className="text-center px-2">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase block">মোট টিকেট</span>
              <span className="text-lg font-black text-white">{tickets.length}</span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase block">অপেক্ষমান ⚠️</span>
              <span className="text-lg font-black text-amber-300">{pendingCount}</span>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center px-2">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">সমাধানকৃত ✅</span>
              <span className="text-lg font-black text-emerald-300">{solvedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "tickets"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>১. সমস্যা ও সাপোর্ট টিকিট ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("inspector")}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "inspector"
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-slate-900"
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-300" />
          <span>২. শিক্ষার্থী ড্যাশবোর্ড ইন্সপেক্টর ও ডাটা এডিটর</span>
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === "create"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>৩. নতুন সমস্যা রিপোর্ট তৈরি</span>
        </button>
      </div>

      {/* TAB 1: SUPPORT TICKETS & RESOLUTION */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-300">ফিল্টার:</span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === "all" ? "bg-indigo-600 text-white" : "bg-slate-900 text-gray-400 hover:text-white"
                }`}
              >
                সব টিকেট ({tickets.length})
              </button>
              <button
                onClick={() => setFilterStatus("pending")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === "pending" ? "bg-amber-500 text-slate-950 font-black" : "bg-slate-900 text-gray-400 hover:text-white"
                }`}
              >
                পেন্ডিং ({pendingCount})
              </button>
              <button
                onClick={() => setFilterStatus("solved")}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  filterStatus === "solved" ? "bg-emerald-600 text-white" : "bg-slate-900 text-gray-400 hover:text-white"
                }`}
              >
                সমাধানকৃত ({solvedCount})
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Ticket Cards Grid */}
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-gray-300">কোনো সমস্যা বা টিকেট পাওয়া যায়নি!</p>
              <p className="text-xs text-gray-500 mt-1">শিক্ষার্থী বা শিক্ষকের পক্ষ থেকে সমস্যা জমা হলে এখানে দেখা যাবে।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-5 rounded-2xl border transition shadow-lg space-y-3 ${
                    ticket.status === "pending"
                      ? "bg-slate-950/90 border-amber-500/50 shadow-amber-500/5"
                      : "bg-slate-950/60 border-emerald-500/40 opacity-90"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-black bg-indigo-900 text-indigo-200 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                        {ticket.id}
                      </span>
                      <span className="text-sm font-black text-white">
                        {ticket.senderName} ({ticket.senderId})
                      </span>
                      <span className="text-[10px] bg-slate-800 text-gray-300 px-2 py-0.5 rounded-md font-bold uppercase">
                        {ticket.senderRole === "student" ? "🎓 শিক্ষার্থী" : "👨‍🏫 শিক্ষক"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status === "pending" ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>সমাধান প্রয়োজন</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>সমাধান সম্পন্ন ✅</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-[11px] text-amber-300 font-bold block mb-1">
                      📌 সমস্যার বিবরণ ({getCategoryName(ticket.category)}):
                    </span>
                    <p className="text-xs sm:text-sm text-gray-200 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed font-medium">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Resolution Notes if Solved */}
                  {ticket.status === "solved" && ticket.resolutionNote && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span>💡 প্রদানকৃত সমাধান বার্তা ({ticket.solvedBy}):</span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {ticket.solvedAt ? new Date(ticket.solvedAt).toLocaleTimeString("bn-BD") : ""}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 leading-snug">
                        {ticket.resolutionNote}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-[10px] text-gray-500 font-medium">
                      সময়: {new Date(ticket.createdAt).toLocaleString("bn-BD")}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* One-Click Inspect Student */}
                      <button
                        onClick={() => {
                          selectStudentForInspection(ticket.senderId);
                          setActiveTab("inspector");
                        }}
                        className="px-3 py-1.5 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                        <span>🔍 এই ড্যাশবোর্ড এডিট করুন</span>
                      </button>

                      {ticket.status === "pending" && (
                        <button
                          onClick={() => {
                            setResolvingTicketId(ticket.id);
                            setResolutionMessage(`আপনার সমস্যাটি সফলভাবে পরীক্ষা ও সমাধান করা হয়েছে। ধন্যবাদ!`);
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>সমাধান বার্তা লিখুন</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resolution Input Drawer */}
                  {resolvingTicketId === ticket.id && (
                    <div className="mt-3 p-4 bg-slate-900 border border-amber-400 rounded-xl space-y-3 animate-fade-in">
                      <label className="block text-xs font-bold text-amber-300">
                        শিক্ষার্থীর জন্য সমাধান নিশ্চিতকরণ বার্তা লিখুন:
                      </label>
                      <textarea
                        rows={2}
                        value={resolutionMessage}
                        onChange={(e) => setResolutionMessage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setResolvingTicketId(null)}
                          className="px-3 py-1 bg-gray-800 text-xs font-bold text-gray-300 rounded-lg hover:bg-gray-700 cursor-pointer"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => handleSolveTicket(ticket.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg shadow cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>সমস্যার সমাধান সাবমিট করুন</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: LIVE STUDENT DASHBOARD INSPECTOR & DATA OVERRIDER */}
      {activeTab === "inspector" && (
        <div className="space-y-6">
          
          {/* STUDENT SELECTOR & IMPERSONATE HEADER */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">শিক্ষার্থী নির্বাচন ও সরাসরি ইন্সপেক্টর</h3>
              </div>

              {selectedStudentData && onImpersonateStudent && (
                <button
                  onClick={() => onImpersonateStudent(selectedStudentData.studentId, selectedStudentData.name)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2 cursor-pointer border border-amber-300"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>👁️ {selectedStudentData.name}-এর ড্যাশবোর্ডে সরাসরি সুইচ করুন</span>
                </button>
              )}
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
              {Object.keys(allStudents).map((stuId) => {
                const stu = allStudents[stuId];
                const isSelected = selectedStudentId === stuId;
                return (
                  <button
                    key={stuId}
                    onClick={() => selectStudentForInspection(stuId, stu)}
                    className={`p-3 rounded-xl border transition text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-900/90 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-lg"
                        : "bg-slate-900 border-slate-800 text-gray-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={stu.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                        alt={stu.name}
                        className="w-8 h-8 rounded-full border border-amber-300 object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-black">{stu.name}</h4>
                        <span className="text-[10px] text-gray-400">আইডি: {stu.studentId} • শ্রেণি: {stu.class}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSPECTION DATA DISPLAY & EDITORS */}
          {selectedStudentData && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT 5 COLS: PROFILE & ACCOUNT REPAIR */}
              <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Edit className="w-4 h-4 text-amber-400" />
                    <span>অ্যাকাউন্ট তথ্য ও পাসওয়ার্ড মেরামত</span>
                  </h3>
                  <span className="text-[10px] bg-slate-800 text-gray-400 px-2 py-0.5 rounded font-mono">
                    {selectedStudentData.studentId}
                  </span>
                </div>

                {showProfileSavedAlert && (
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
                  </div>
                )}

                <form onSubmit={handleSaveStudentProfile} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">শিক্ষার্থীর নাম:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">শ্রেণি:</label>
                      <input
                        type="text"
                        value={editClass}
                        onChange={(e) => setEditClass(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">রোল:</label>
                      <input
                        type="text"
                        value={editRoll}
                        onChange={(e) => setEditRoll(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>পাসওয়ার্ড রিসেট (Password Reset):</span>
                    </label>
                    <input
                      type="text"
                      value={editPass}
                      onChange={(e) => setEditPass(e.target.value)}
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">ভবিষ্যৎ লক্ষ্য:</label>
                    <input
                      type="text"
                      value={editGoal}
                      onChange={(e) => setEditGoal(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>শিক্ষার্থী তথ্য সংরক্ষণ করুন</span>
                  </button>
                </form>
              </div>

              {/* RIGHT 7 COLS: TASKS INSPECTOR & OVERRIDER */}
              <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-indigo-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>{selectedStudentData.name}-এর লাইভ পড়া ও কাজের তালিকা ({studentTasks.length} টি)</span>
                  </h3>

                  <button
                    onClick={() => saveStudentTasksChanges(getDefaultTasksList())}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                    title="ডিফল্ট পড়ার তালিকা পুনরুদ্ধার করুন"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>রিসেট</span>
                  </button>
                </div>

                {/* Tasks List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {studentTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                        t.completed
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : "bg-slate-900 border-slate-800 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => handleToggleStudentTask(t.id)}
                          className={`p-1 rounded-md cursor-pointer ${
                            t.completed ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-gray-400 hover:text-white"
                          }`}
                        >
                          {t.completed ? "✓" : "○"}
                        </button>
                        <div className="min-w-0">
                          <p className={`font-bold leading-snug ${t.completed ? "line-through text-emerald-300/80" : ""}`}>
                            {t.title}
                          </p>
                          <span className="text-[10px] text-gray-400">{t.assignedTime}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStudentTask(t.id)}
                        className="p-1 text-gray-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Task Form for Student */}
                <form onSubmit={handleAddStudentTask} className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-300 block">
                    ➕ এই শিক্ষার্থীর ড্যাশবোর্ডে শিক্ষক বা মেন্টর হিসেবে নতুন পড়া যোগ করুন:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="নতুন পড়া/টাস্কের বিবরণ..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      required
                    />
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-indigo-300"
                    >
                      <option value="study">📖 নির্দিষ্ট পড়া</option>
                      <option value="handwriting">✍️ হাতের লেখা</option>
                      <option value="habit">🕌 সৎ অভ্যাস</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>শিক্ষার্থী ড্যাশবোর্ডে যোগ নিশ্চিত করুন</span>
                  </button>
                </form>

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 3: CREATE NEW TICKET ON BEHALF OF USER */}
      {activeTab === "create" && (
        <form onSubmit={handleCreateTicket} className="max-w-xl mx-auto bg-slate-950 p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-base font-black text-white">নতুন সাহায্য বা সমস্যা রিপোর্ট জমা দিন</h3>
            <p className="text-xs text-emerald-200 mt-1">
              যেকোনো শিক্ষার্থী বা শিক্ষকের সমস্যা সম্পর্কিত টিকেট নথিভুক্ত করুন।
            </p>
          </div>

          {ticketSubmitSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>টিকেট সফলভাবে জমা করা হয়েছে! রিডাইরেক্ট করা হচ্ছে...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">রোল:</label>
              <select
                value={newTicketRole}
                onChange={(e) => setNewTicketRole(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="student">🎓 শিক্ষার্থী</option>
                <option value="teacher">👨‍🏫 শিক্ষক</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">সমস্যার বিষয়:</label>
              <select
                value={newTicketCategory}
                onChange={(e) => setNewTicketCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="study_issue">📖 পড়ালেখা / কাজের প্রগ্রেস সমস্যা</option>
                <option value="login_issue">🔐 লগইন ও পাসওয়ার্ড সমস্যা</option>
                <option value="routine_help">📅 রুটিন এডিটর সাহায্য</option>
                <option value="other">💬 অন্যান্য সমস্যা</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">আইডি / রোল:</label>
              <input
                type="text"
                value={newTicketSenderId}
                onChange={(e) => setNewTicketSenderId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">নাম:</label>
              <input
                type="text"
                value={newTicketSenderName}
                onChange={(e) => setNewTicketSenderName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">সমস্যার বিস্তারিত বিবরণ:</label>
            <textarea
              rows={4}
              placeholder="কি ধরনের সমস্যা দেখা দিচ্ছে বা কি সমাধান চান বিস্তারিত লিখুন..."
              value={newTicketDesc}
              onChange={(e) => setNewTicketDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-emerald-200" />
            <span>টিকেট সাবমিট করুন 🚀</span>
          </button>
        </form>
      )}

    </div>
  );
}

function getCategoryName(cat: string) {
  switch (cat) {
    case "study_issue": return "পড়ালেখা ও প্রগ্রেস সমস্যা";
    case "login_issue": return "লগইন ও পাসওয়ার্ড";
    case "routine_help": return "রুটিন এডিট সাহায্য";
    default: return "অন্যান্য সমস্যা";
  }
}
