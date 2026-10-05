// src/components/exam_suite/examMockData.ts
import { QuestionPaper, SyllabusItem, LectureNote, StudentSecurityProfile, GateLog, AdmitCard, StudentExamRecord, GuardianMeeting } from "./examTypes";

export const SAMPLE_QUESTION_PAPERS: QuestionPaper[] = [
  {
    id: "qp-bangla-5",
    schoolName: "ডি-লিকন মডেল একাডেমী",
    examName: "১ম সাময়িক পরীক্ষা — ২০২৬",
    academicYear: "২০২৬",
    subjectName: "বাংলা (১ম ও ২য় পত্র)",
    className: "পঞ্চম শ্রেণি",
    subjectCode: "১০১",
    duration: "২ ঘণ্টা ৩০ মিনিট",
    totalMarks: 100,
    setCode: "ক",
    instructions: "ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর ক্রমানুসারে লেখ।",
    sections: [
      {
        id: "sec-1",
        sectionName: "ক-বিভাগ: বহু-নির্বাচনী অভীক্ষা (মান: ২০)",
        totalMarks: 20,
        requiredCount: "সকল প্রশ্নের সঠিক উত্তর দাও",
        items: [
          {
            id: "m-1",
            type: "mcq",
            number: "১",
            mcqQuestion: "‘সংকল্প’ কবিতায় কবি কিসের মধ্যে থাকতে চান না?",
            mcqOptions: ["বদ্ধ ঘরে", "মুক্ত আকাশে", "গভীর অরণ্যে", "নদীর কূলে"],
            correctOption: 0
          },
          {
            id: "m-2",
            type: "mcq",
            number: "২",
            mcqQuestion: "‘বীরশ্রেষ্ঠ’ খেতাবপ্রাপ্ত শহীদদের মোট সংখ্যা কতজন?",
            mcqOptions: ["৫ জন", "৭ জন", "১১ জন", "১৫ জন"],
            correctOption: 1
          },
          {
            id: "m-3",
            type: "mcq",
            number: "৩",
            mcqQuestion: "‘সূর্য’ শব্দের সঠিক সমার্থক শব্দ কোনটি?",
            mcqOptions: ["শশী", "রবি", "পবন", "নীর"],
            correctOption: 1
          },
          {
            id: "m-4",
            type: "mcq",
            number: "৪",
            mcqQuestion: "যুক্তবর্ণ ‘ষ্ণ’ ভেঙে লিখলে কোন কোন বর্ণ পাওয়া যায়?",
            mcqOptions: ["ষ্ + ন", "ষ্ + ণ", "স্ + ণ", "ষ্ + ঞ"],
            correctOption: 1
          }
        ]
      },
      {
        id: "sec-2",
        sectionName: "খ-বিভাগ: সৃজনশীল রচনামূলক প্রশ্ন (মান: ৫০)",
        totalMarks: 50,
        requiredCount: "যেকোনো ৫টি প্রশ্নের উত্তর দাও",
        items: [
          {
            id: "cq-1",
            type: "cq",
            number: "১",
            stem: "রাহাত পঞ্চম শ্রেণির শিক্ষার্থী। সে প্রতিদিন ভোরে ঘুম থেকে ওঠে এবং পড়ার টেবিলে বসে। স্কুল থেকে ফিরে বড়দের শ্রদ্ধা করে এবং সন্ধ্যার পর পড়ার কাজটি সঠিক সময়ে সম্পন্ন করে। তার সহপাঠী অনিক সময়মতো না পড়ে পরীক্ষার আগে দুশ্চিন্তায় পড়ে যায়।",
            cqParts: {
              ka: { text: "‘সংকল্প’ কবিতার রচয়িতা কে?", marks: 1 },
              kha: { text: "কবি বিশ্বজগৎ দেখতে চেয়েছেন কেন? বুঝিয়ে লেখ।", marks: 2 },
              ga: { text: "রাহাতের আচরণের সাথে পাঠ্যবইয়ের নিয়মানুবর্তিতার সাদৃশ্য ব্যাখ্যা কর।", marks: 3 },
              gha: { text: "“সঠিক রুটিন পালনই একজন শিক্ষার্থীর উজ্জ্বল ভবিষ্যতের সোপান”—অনিলের দৃষ্টান্তের আলোকে বিশ্লেষণ কর।", marks: 4 }
            }
          },
          {
            id: "cq-2",
            type: "cq",
            number: "২",
            stem: "১৯৭১ সালের ১৪ই ডিসেম্বর পাকিস্তানি হানাদার বাহিনী আমাদের দেশের শ্রেষ্ঠ বুদ্ধিজীবীদের নির্মমভাবে হত্যা করে। তাঁরা নিজেদের মেধা ও মনন দিয়ে দেশের স্বাধীনতা ও মুক্তির পথ তৈরি করেছিলেন। তাঁদের এই আত্মত্যাগ চিরস্মরণীয়।",
            cqParts: {
              ka: { text: "শহীদ বুদ্ধিজীবী দিবস কবে পালিত হয়?", marks: 1 },
              kha: { text: "বুদ্ধিজীবীদের কেন হত্যা করা হয়েছিল?", marks: 2 },
              ga: { text: "উদ্দীপকে বর্ণিত ঘটনাটির সাথে তোমার পাঠ্যবইয়ের ‘স্মরণীয় যাঁরা চিরদিন’ রচনার সম্পর্ক তুলে ধর।", marks: 3 },
              gha: { text: "“তাঁদের ঋণ কোনোদিন শোধ হবার নয়”—উক্তিটির যথার্থতা নিরূপণ কর।", marks: 4 }
            }
          }
        ]
      },
      {
        id: "sec-3",
        sectionName: "গ-বিভাগ: ব্যাকরণ ও নির্মিতি (মান: ৩০)",
        totalMarks: 30,
        items: [
          {
            id: "b-1",
            type: "short",
            number: "৩",
            shortQuestion: "এক কথায় প্রকাশ কর (যেকোনো ৫টি): ক) যা সহজে লাভ করা যায় না খ) যিনি দেশ সেবা করেন গ) নদী মাতৃক যার ঘ) আকাশে চরে যে ঙ) মৃতের মতো অবস্থা যার।",
            marks: 5
          },
          {
            id: "b-2",
            type: "essay",
            number: "৪",
            essayTopic: "যেকোনো একটি বিষয়ে প্রবন্ধ রচনা লেখ: ক) অধ্যবসায় খ) চরিত্র গঠন ও শিষ্টাচার গ) আমাদের প্রিয় বিদ্যালয় ‘ডি-লিকন মডেল একাডেমী’",
            marks: 10
          }
        ]
      }
    ]
  },
  {
    id: "qp-math-5",
    schoolName: "ডি-লিকন মডেল একাডেমী",
    examName: "১ম সাময়িক পরীক্ষা — ২০২৬",
    academicYear: "২০২৬",
    subjectName: "প্রাথমিক গণিত",
    className: "পঞ্চম শ্রেণি",
    subjectCode: "১০৯",
    duration: "২ ঘণ্টা ৩০ মিনিট",
    totalMarks: 100,
    setCode: "খ",
    instructions: "সকল প্রশ্নের উত্তর খাতায় সুন্দর ও পরিষ্কার অক্ষরে দিতে হবে। হিসাবের রাফ অবশ্যই দেখাতে হবে।",
    sections: [
      {
        id: "sec-m1",
        sectionName: "ক-বিভাগ: সংক্ষিপ্ত উত্তর প্রশ্ন (মান: ২৪)",
        totalMarks: 24,
        items: [
          { id: "sm-1", type: "short", number: "১", shortQuestion: "ভাজ্য = (ভাজক × ভাগফল) + ?", marks: 2 },
          { id: "sm-2", type: "short", number: "২", shortQuestion: "৭টি ডিমের দাম ৪২ টাকা হলে, ১ ডজন ডিমের দাম কত?", marks: 2 },
          { id: "sm-3", type: "short", number: "৩", shortQuestion: "গরিষ্ঠ সাধারণ গুণনীয়ক (গ.সা.গু)-এর পূর্ণ রূপ লেখ।", marks: 2 },
          { id: "sm-4", type: "short", number: "৪", shortQuestion: "১ বর্গ কিলোমিটার = কত বর্গ মিটার?", marks: 2 }
        ]
      },
      {
        id: "sec-m2",
        sectionName: "খ-বিভাগ: কাঠামোবদ্ধ সৃজনশীল প্রশ্ন (মান: ৭৬)",
        totalMarks: 76,
        items: [
          {
            id: "mcq-1",
            type: "cq",
            number: "৫",
            stem: "একটি কারখানায় প্রতিদিন ৭৫০টি সাইকেল তৈরি হয়। ১ বছরে ৩৬৫ দিন ধরে কারখানাটি চালু থাকে। প্রতিটি সাইকেল তৈরিতে কাঁচামাল বাবদ খরচ হয় ৩,২০০ টাকা।",
            cqParts: {
              ka: { text: "কারখানাটিতে সপ্তাহে মোট কতটি সাইকেল তৈরি হয়?", marks: 2 },
              kha: { text: "১ বছরে কারখানাটিতে মোট কতটি সাইকেল উৎপাদিত হবে?", marks: 3 },
              ga: { text: "বছরে সাইকেলগুলো তৈরিতে মোট কাঁচামাল বাবদ কত টাকা খরচ হবে?", marks: 3 },
              gha: { text: "প্রতিটি সাইকেল ৪,৫০০ টাকায় বিক্রি করলে বাৎসরিক মোট লাভ কত টাকা হবে?", marks: 4 }
            }
          }
        ]
      }
    ]
  }
];

export const SAMPLE_SYLLABUS: SyllabusItem[] = [
  {
    id: "syl-1",
    subject: "বাংলা",
    className: "পঞ্চম শ্রেণি",
    term: "১ম সাময়িক",
    chapters: [
      {
        chapterNo: "১",
        chapterTitle: "এই দেশ এই মানুষ",
        topics: ["বাংলাদেশের প্রাকৃতিক বৈচিত্র্য", "নানা ধর্ম ও উৎসব", "শব্দার্থ ও বাক্য রচনা"],
        weightage: 15,
        estimatedClasses: 6
      },
      {
        chapterNo: "২",
        chapterTitle: "সংকল্প (কবিতা)",
        topics: ["কবিতা আবৃত্তি ও মূলভাব", "অজানা তথ্য অন্বেষণ", "সৃজনশীল অনুধাবন"],
        weightage: 15,
        estimatedClasses: 5
      },
      {
        chapterNo: "৩",
        chapterTitle: "সুন্দরবনের প্রাণী",
        topics: ["রয়েল বেঙ্গল টাইগার ও বিলুপ্তপ্রায় প্রাণী", "পরিবেশ ভারসাম্য রক্ষা"],
        weightage: 20,
        estimatedClasses: 7
      }
    ],
    examPattern: "সৃজনশীল ৭০ নম্বর (৫টি প্রশ্নের উত্তর) + বহুনির্বাচনী ২০ নম্বর + হাতের লেখা ও মৌখিক ১০ নম্বর = ১০০ নম্বর।"
  }
];

export const SAMPLE_LECTURE_NOTES: LectureNote[] = [
  {
    id: "note-1",
    title: "গণিত ৫ম শ্রেণি: গুণ ও ভাগের সহজ শর্টকাট কৌশল ও ঐকিক নিয়ম",
    className: "পঞ্চম শ্রেণি",
    subject: "প্রাথমিক গণিত",
    chapter: "অধ্যায় ৩ — চার প্রক্রিয়া সম্পর্কিত সমস্যাবলি",
    authorTeacher: "মোঃ জয়নাল আবেদীন (সিনিয়র গণিত শিক্ষক)",
    keyConcepts: [
      "বন্ধনীর ব্যবহার: প্রথমে প্রথম বন্ধনী (), এরপর দ্বিতীয় বন্ধনী {}, শেষে তৃতীয় বন্ধনী [] এর কাজ করতে হবে।",
      "ক্রমানুসারে কাজ: বন্ধনীর ভেতরে প্রথমে ভাগ (÷), তারপর গুণ (×), তারপর যোগ (+) এবং শেষে বিয়োগ (-) করতে হয়।",
      "ঐকিক নিয়ম: প্রথমে একটির দাম বের করতে হবে (ভাগ করে), তারপর কাঙ্ক্ষিত সংখ্যার দাম বের করতে হবে (গুণ করে)।"
    ],
    lectureSummary: "চার প্রক্রিয়া সম্পর্কিত সমস্যাগুলো সমাধান করার জন্য নিয়ম মনে রাখার সহজ সূত্র হলো BODMAS/ভাগ-গুণ-যোগ-বিয়োগ। প্রশ্ন ভালো করে পড়ে কী বের করতে বলা হয়েছে তা ডানপাশে রেখে সমীকরণ তৈরি করতে হবে।",
    importantFormulasOrDefinitions: [
      "ভাজ্য = (ভাজক × ভাগফল) + ভাগশেষ",
      "ভাগফল = (ভাজ্য - ভাগশেষ) ÷ ভাজক",
      "ভাজক = (ভাজ্য - ভাগশেষ) ÷ ভাগফল"
    ],
    modelQuestionsAndAnswers: [
      {
        q: "প্রশ্ন: ৪টি খাতার দাম ৮০ টাকা হলে, ৭টি খাতার দাম কত?",
        a: "সমাধান:\n৪টি খাতার দাম = ৮০ টাকা\n১টি খাতার দাম = ৮০ ÷ ৪ = ২০ টাকা\nসুতরাং, ৭টি খাতার দাম = ২০ × ৭ = ১৪০ টাকা।\nউত্তর: ১৪০ টাকা।",
        marks: 4
      }
    ],
    homework: "পাঠ্যবইয়ের পৃষ্ঠা ১৪ এর ৫, ৬ ও ৭ নম্বর সমস্যা সমাধান করে খাতায় তারিখসহ নিয়ে আসবে।",
    createdAt: "২০২৬-১০-০৫"
  }
];

export const SAMPLE_SECURITY_PROFILES: StudentSecurityProfile[] = [
  {
    studentId: "DLM-501",
    name: "আহমেদ হাসান",
    className: "পঞ্চম শ্রেণি",
    roll: "০১",
    bloodGroup: "B+",
    guardianName: "মোঃ রফিকুল হাসান",
    guardianPhone: "01711-234567",
    emergencyContact: "01819-876543",
    address: "বাসা নং ১২, রোড ৩, মিরপুর, ঢাকা",
    cardExpiry: "৩১ ডিসেম্বর ২০২৬",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
  },
  {
    studentId: "DLM-502",
    name: "ফাতেমা জান্নাত",
    className: "পঞ্চম শ্রেণি",
    roll: "০২",
    bloodGroup: "O+",
    guardianName: "মোঃ নুরুল ইসলাম",
    guardianPhone: "01912-345678",
    emergencyContact: "01720-998877",
    address: "প্লট ৪৫, সেক্টর ৭, উত্তরা, ঢাকা",
    cardExpiry: "৩১ ডিসেম্বর ২০২৬",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    studentId: "DLM-505",
    name: "নুসরাত জাহান মাহিদা",
    className: "পঞ্চম শ্রেণি",
    roll: "০৫",
    bloodGroup: "A+",
    guardianName: "মোঃ কামরুল হাসান",
    guardianPhone: "01815-667788",
    emergencyContact: "01712-443322",
    address: "বাড়ি নং ৮, কাজীপাড়া, মিরপুর, ঢাকা",
    cardExpiry: "৩১ ডিসেম্বর ২০২৬",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

export const SAMPLE_GATE_LOGS: GateLog[] = [
  {
    id: "gate-1",
    studentId: "DLM-501",
    studentName: "আহমেদ হাসান",
    className: "পঞ্চম শ্রেণি",
    roll: "০১",
    type: "in",
    timestamp: "২০২৬-১০-০৫ ০৭:৪৫ AM",
    timeOnly: "০৭:৪৫ AM",
    dateOnly: "০৫ অক্টোবর ২০২৬",
    guardianPhone: "01711-234567",
    notificationMessage: "সম্মানিত অভিভাবক, আপনার সন্তান আহমেদ হাসান (৫ম শ্রেণি, রোল: ০১) আজ ০৫ অক্টোবর সকাল ০৭:৪৫ টায় নিরাপদে ডি-লিকন মডেল একাডেমী ক্যাম্পাসে প্রবেশ করেছে। - কর্তৃপক্ষ",
    status: "delivered"
  },
  {
    id: "gate-2",
    studentId: "DLM-502",
    studentName: "ফাতেমা জান্নাত",
    className: "পঞ্চম শ্রেণি",
    roll: "০২",
    type: "in",
    timestamp: "২০২৬-১০-০৫ ০৭:৫০ AM",
    timeOnly: "০৭:৫০ AM",
    dateOnly: "০৫ অক্টোবর ২০২৬",
    guardianPhone: "01912-345678",
    notificationMessage: "সম্মানিত অভিভাবক, আপনার সন্তান ফাতেমা জান্নাত (৫ম শ্রেণি, রোল: ০২) আজ ০৫ অক্টোবর সকাল ০৭:৫০ টায় নিরাপদে ডি-লিকন মডেল একাডেমী ক্যাম্পাসে প্রবেশ করেছে। - কর্তৃপক্ষ",
    status: "delivered"
  }
];

export const SAMPLE_ADMIT_CARDS: AdmitCard[] = [
  {
    id: "admit-501",
    examName: "১ম সাময়িক পরীক্ষা — ২০২৬",
    studentId: "DLM-501",
    studentName: "আহমেদ হাসান",
    className: "পঞ্চম শ্রেণি",
    roll: "০১",
    registrationNo: "DLM-2026-0501",
    seatNo: "রুম ৩০১ (বেঞ্চ ২, ডানপাশ)",
    centerName: "ডি-লিকন মডেল একাডেমী মেইন ক্যাম্পাস",
    rules: [
      "পরীক্ষা শুরুর অন্তত ১৫ মিনিট পূর্বে পরীক্ষার হলে উপস্থিত হতে হবে।",
      "প্রবেশপত্র (Admit Card) ছাড়া কোনো পরীক্ষার্থীকে হলে প্রবেশ করতে দেওয়া হবে না।",
      "পরীক্ষার হলে মোবাইল ফোন বা কোনো ডিজিটাল ডিভাইস আনা সম্পূর্ণ নিষিদ্ধ।",
      "উত্তরপত্রের কভার পৃষ্ঠায় রোল ও রেজিস্ট্রেশন নম্বর সঠিকভাবে পূরণ করতে হবে।"
    ],
    schedule: [
      { date: "১৫ অক্টোবর ২০২৬", day: "বৃহস্পতিবার", subject: "বাংলা (১ম ও ২য় পত্র)", time: "সকাল ১০:০০ - দুপুর ১২:৩০", room: "৩০১" },
      { date: "১৮ অক্টোবর ২০২৬", day: "রবিবার", subject: "ইংরেজি", time: "সকাল ১০:০০ - দুপুর ১২:৩০", room: "৩০১" },
      { date: "২০ অক্টোবর ২০২৬", day: "মঙ্গলবার", subject: "প্রাথমিক গণিত", time: "সকাল ১০:০০ - দুপুর ১২:৩০", room: "৩০১" },
      { date: "২২ অক্টোবর ২০২৬", day: "বৃহস্পতিবার", subject: "বাংলাদেশ ও বিশ্বপরিচয়", time: "সকাল ১০:০০ - দুপুর ১২:০০", room: "৩০১" },
      { date: "২৫ অক্টোবর ২০২৬", day: "রবিবার", subject: "প্রাথমিক বিজ্ঞান", time: "সকাল ১০:০০ - দুপুর ১২:০০", room: "৩০১" },
      { date: "২৭ অক্টোবর ২০২৬", day: "মঙ্গলবার", subject: "ইসলাম ও নৈতিক শিক্ষা", time: "সকাল ১০:০০ - দুপুর ১২:০০", room: "৩০১" }
    ]
  }
];

export const SAMPLE_EXAM_RECORDS: StudentExamRecord[] = [
  {
    id: "rec-501",
    studentId: "DLM-501",
    studentName: "আহমেদ হাসান",
    className: "পঞ্চম শ্রেণি",
    roll: "০১",
    examName: "১ম সাময়িক পরীক্ষা — ২০২৬",
    academicYear: "২০২৬",
    subjects: [
      { subjectName: "বাংলা", subjectCode: "১০১", cqMarks: 58, mcqMarks: 18, continuousMarks: 10, totalMarks: 86, highestMarks: 94, grade: "A+", gpa: 5.0 },
      { subjectName: "ইংরেজি", subjectCode: "১০২", cqMarks: 54, mcqMarks: 17, continuousMarks: 9, totalMarks: 80, highestMarks: 90, grade: "A+", gpa: 5.0 },
      { subjectName: "প্রাথমিক গণিত", subjectCode: "১০৩", cqMarks: 65, mcqMarks: 20, continuousMarks: 10, totalMarks: 95, highestMarks: 98, grade: "A+", gpa: 5.0 },
      { subjectName: "বাংলাদেশ ও বিশ্বপরিচয়", subjectCode: "১০৪", cqMarks: 50, mcqMarks: 16, continuousMarks: 9, totalMarks: 75, highestMarks: 88, grade: "A", gpa: 4.0 },
      { subjectName: "প্রাথমিক বিজ্ঞান", subjectCode: "১০৫", cqMarks: 55, mcqMarks: 18, continuousMarks: 10, totalMarks: 83, highestMarks: 92, grade: "A+", gpa: 5.0 },
      { subjectName: "ইসলাম ও নৈতিক শিক্ষা", subjectCode: "১০৬", cqMarks: 62, mcqMarks: 19, continuousMarks: 10, totalMarks: 91, highestMarks: 96, grade: "A+", gpa: 5.0 }
    ],
    grandTotal: 510,
    averageGpa: 4.83,
    finalGrade: "A+",
    classRank: 1,
    totalStudentsInClass: 28,
    teacherRemarks: "মেধা ও শৃঙ্খলায় অত্যন্ত প্রশংসনীয়। গণিত ও বিজ্ঞানে অসামান্য ফলাফল। এ চর্চা অব্যাহত রাখুন।",
    principalRemarks: "ডি-লিকন মডেল একাডেমীর একজন রত্ন। উত্তরোত্তর সার্বিক সাফল্য ও উজ্জ্বল ভবিষ্যৎ কামনা করি।",
    publishedToParent: true,
    publishedAt: "২০২৬-১০-০৫"
  }
];

export const SAMPLE_GUARDIAN_MEETINGS: GuardianMeeting[] = [
  {
    id: "meet-1",
    title: "১ম সাময়িক পরীক্ষার ফলাফল পর্যালোচনা ও শিষ্টাচার চর্চা মূল্যায়ন সভা",
    meetingDate: "২০২৬-১০-১৫",
    meetingTime: "সকাল ১০:০০ টা",
    venue: "ডি-লিকন মডেল একাডেমী কেন্দ্রীয় অডিটোরিয়াম (৩য় তলা)",
    agenda: [
      "১. ১ম সাময়িক পরীক্ষার ফলাফল বিশ্লেষণ ও দুর্বল শিক্ষার্থীদের বিশেষ যত্ন গ্রহণ।",
      "২. শিক্ষার্থীদের দৈনিক রুটিন পালন, ৫ ওয়াক্ত নামাজ ও নৈতিক আচরণের অভিভাবক ডায়রি পর্যালোচনা।",
      "৩. মোবাইল আসক্তি দূরীকরণ ও সন্ধ্যার পড়ার টেবিলে অভিভাবকের উপস্থিতি নিশ্চিতকরণ।",
      "৪. ডিজিটাল আইডি কার্ড স্ক্যানিং এবং গেট সিকিউরিটি নোটিফিকেশন সিস্টেমের ব্যবহারিক নির্দেশিকা।"
    ],
    letterBody: "আসসালামু আলাইকুম। পরম শ্রদ্ধার সাথে জানানো যাচ্ছে যে, আগামী ১৫ অক্টোবর ২০২৬ (বৃহস্পতিবার) সকাল ১০:০০ ঘটিকায় আমাদের বিদ্যালয়ের ৩য় তলা অডিটোরিয়ামে শিক্ষার্থীদের লেখাপড়ার সার্বিক অগ্রগতি, নৈতিক শৃঙ্খলা এবং ১ম সাময়িক পরীক্ষার ফলাফল সংক্রান্ত এক গুরুত্বপূর্ণ অভিভাবক সভা অনুষ্ঠিত হবে। আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ বিনির্মাণে উক্ত সভায় আপনার সশরীরে উপস্থিতি একান্ত আবশ্যক।",
    status: "scheduled",
    attendees: [
      {
        studentId: "DLM-501",
        studentName: "আহমেদ হাসান",
        className: "পঞ্চম শ্রেণি",
        roll: "০১",
        guardianName: "মোঃ রফিকুল হাসান",
        guardianPhone: "01711-234567",
        status: "present",
        checkedInAt: "সকাল ০৯:৫০",
        alertCount: 0
      },
      {
        studentId: "DLM-502",
        studentName: "ফাতেমা জান্নাত",
        className: "পঞ্চম শ্রেণি",
        roll: "০২",
        guardianName: "মোঃ নুরুল ইসলাম",
        guardianPhone: "01912-345678",
        status: "absent",
        alertCount: 2,
        lastAlertSentAt: "সকাল ১০:১৫"
      },
      {
        studentId: "DLM-505",
        studentName: "নুসরাত জাহান মাহিদা",
        className: "পঞ্চম শ্রেণি",
        roll: "০৫",
        guardianName: "মোঃ কামরুল হাসান",
        guardianPhone: "01815-667788",
        status: "absent",
        alertCount: 1,
        lastAlertSentAt: "সকাল ১০:১০"
      }
    ],
    resolutions: [
      {
        id: "res-1",
        decisionNumber: 1,
        proposal: "ইংরেজি ও গণিত বিষয়ে যে সকল শিক্ষার্থী দুর্বল তাদেরকে ক্লাসের পর ৪৫ মিনিট বিশেষ রিমিডিয়াল ক্লাস প্রদান করা হবে।",
        decision: "সর্বসম্মতিক্রমে গৃহীত হলো। আগামী ২০ অক্টোবর থেকে ক্লাস শুরু হবে।",
        responsiblePerson: "প্রধান শিক্ষক ও সংশ্লিষ্ট বিষয়ভিত্তিক শিক্ষকবৃন্দ",
        implementationDeadline: "২০ অক্টোবর ২০২৬"
      },
      {
        id: "res-2",
        decisionNumber: 2,
        proposal: "রাতে ঘুমানোর পূর্বে সকল শিক্ষার্থী যেন মা-বাবার মোবাইল ফোন স্পর্শ না করে এবং নিয়মিত ঘুমায় তা অভিভাবকগণ তদারকি করবেন।",
        decision: "উপস্থিত সকল অভিভাবক হাত তুলে সম্মতি প্রকাশ করেন এবং বাস্তবায়ন চুক্তি করেন।",
        responsiblePerson: "সকল সচেতন অভিভাবকমণ্ডলী",
        implementationDeadline: "অবিলম্বে কার্যকর"
      }
    ]
  }
];
