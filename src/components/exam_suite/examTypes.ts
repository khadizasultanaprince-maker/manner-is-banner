// src/components/exam_suite/examTypes.ts
// Comprehensive Data Models for D-Likon Model Academy Exam & Security Suite

export interface QuestionPaperItem {
  id: string;
  type: "cq" | "mcq" | "short" | "fill" | "match" | "essay";
  number: string;
  stem?: string; // উদ্দীপক / Passage / Scenario
  cqParts?: {
    ka: { text: string; marks: number };
    kha: { text: string; marks: number };
    ga: { text: string; marks: number };
    gha: { text: string; marks: number };
  };
  mcqQuestion?: string;
  mcqOptions?: [string, string, string, string]; // ক, খ, গ, ঘ
  correctOption?: number;
  shortQuestion?: string;
  marks?: number;
  fillPrompt?: string;
  matchPairs?: Array<{ left: string; right: string }>;
  essayTopic?: string;
}

export interface QuestionPaper {
  id: string;
  schoolName: string;
  examName: string; // যেমন: ১ম সাময়িক পরীক্ষা - ২০২৬
  academicYear: string;
  subjectName: string;
  className: string;
  subjectCode: string;
  duration: string; // যেমন: ২ ঘণ্টা ৩০ মিনিট
  totalMarks: number; // যেমন: ১০০
  setCode: "ক" | "খ" | "গ" | "ঘ";
  instructions: string; // যেমন: "প্রতিটি বিভাগের প্রশ্নের উত্তর নির্দেশ অনুযায়ী দাও..."
  sections: Array<{
    id: string;
    sectionName: string; // ক-বিভাগ: বহু-নির্বাচনী অভীক্ষা / খ-বিভাগ: সৃজনশীল
    totalMarks: number;
    requiredCount?: string; // যেকোনো ৫টি প্রশ্নের উত্তর দাও
    items: QuestionPaperItem[];
  }>;
}

export interface SyllabusItem {
  id: string;
  subject: string;
  className: string;
  term: "১ম সাময়িক" | "অর্ধ-বার্ষিক" | "চূড়ান্ত পরীক্ষা";
  chapters: Array<{
    chapterNo: string;
    chapterTitle: string;
    topics: string[];
    weightage: number; // Marks
    estimatedClasses: number;
  }>;
  examPattern: string; // যেমন: সৃজনশীল ৭০ নম্বর, বহুনির্বাচনী ৩০ নম্বর
}

export interface LectureNote {
  id: string;
  title: string;
  className: string;
  subject: string;
  chapter: string;
  authorTeacher: string;
  keyConcepts: string[];
  lectureSummary: string;
  importantFormulasOrDefinitions: string[];
  modelQuestionsAndAnswers: Array<{ q: string; a: string; marks: number }>;
  homework: string;
  createdAt: string;
}

export interface StudentSecurityProfile {
  studentId: string;
  name: string;
  className: string;
  roll: string;
  bloodGroup: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  address: string;
  photoUrl?: string;
  cardExpiry: string;
}

export interface GateLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  roll: string;
  type: "in" | "out";
  timestamp: string; // e.g., 2026-10-05 07:45 AM
  timeOnly: string;
  dateOnly: string;
  guardianPhone: string;
  notificationMessage: string;
  status: "delivered" | "sent";
}

export interface AdmitCard {
  id: string;
  examName: string;
  studentId: string;
  studentName: string;
  className: string;
  roll: string;
  registrationNo: string;
  seatNo: string;
  centerName: string;
  rules: string[];
  schedule: Array<{
    date: string;
    day: string;
    subject: string;
    time: string;
    room: string;
  }>;
}

export interface SubjectMarks {
  subjectName: string;
  subjectCode: string;
  cqMarks: number; // লিখিত
  mcqMarks: number; // বহুনির্বাচনী
  practicalMarks?: number; // ব্যবহারিক
  continuousMarks?: number; // ধারাবাহিক / উপস্থিতি
  totalMarks: number;
  highestMarks: number;
  grade: "A+" | "A" | "A-" | "B" | "C" | "D" | "F";
  gpa: number; // 5.0, 4.0, etc.
}

export interface StudentExamRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  roll: string;
  examName: string;
  academicYear: string;
  subjects: SubjectMarks[];
  grandTotal: number;
  averageGpa: number;
  finalGrade: string;
  classRank: number;
  totalStudentsInClass: number;
  teacherRemarks: string;
  principalRemarks: string;
  publishedToParent: boolean;
  publishedAt?: string;
}

export interface GuardianMeeting {
  id: string;
  title: string;
  meetingDate: string; // 2026-10-15
  meetingTime: string; // সকাল ১০:০০ টা
  venue: string; // অডিটোরিয়াম / ৩য় তলা সম্মেলন কক্ষ
  agenda: string[];
  letterBody: string;
  status: "scheduled" | "in_progress" | "concluded";
  attendees: Array<{
    studentId: string;
    studentName: string;
    className: string;
    roll: string;
    guardianName: string;
    guardianPhone: string;
    status: "present" | "absent" | "late";
    checkedInAt?: string;
    alertCount: number;
    lastAlertSentAt?: string;
  }>;
  resolutions: Array<{
    id: string;
    decisionNumber: number;
    proposal: string;
    decision: string;
    responsiblePerson: string;
    implementationDeadline: string;
  }>;
}

// Grade calculation helper
export function calculateGradeAndGPA(marks: number, totalMaxMarks = 100): { grade: SubjectMarks["grade"]; gpa: number } {
  const percentage = (marks / totalMaxMarks) * 100;
  if (percentage >= 80) return { grade: "A+", gpa: 5.0 };
  if (percentage >= 70) return { grade: "A", gpa: 4.0 };
  if (percentage >= 60) return { grade: "A-", gpa: 3.5 };
  if (percentage >= 50) return { grade: "B", gpa: 3.0 };
  if (percentage >= 40) return { grade: "C", gpa: 2.0 };
  if (percentage >= 33) return { grade: "D", gpa: 1.0 };
  return { grade: "F", gpa: 0.0 };
}
