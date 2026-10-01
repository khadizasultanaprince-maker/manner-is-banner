export interface HomeVisitRecord {
  id: string;
  studentName: string;
  studentClass: string;
  studentRoll: string;
  location: string; // ঠিকানা / পাড়া / বাড়ি
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // e.g. "সন্ধ্যা ০৬:৩০"
  teacherName: string; // পরিদর্শনকারী শিক্ষকের নাম
  studentState: 
    | "at_study_desk" // পড়ার টেবিলে মনোযোগ সহকারে পাঠরত
    | "playing_home" // ঘরে খেলাধুলা / ছোটাছুটি করছিল
    | "tv_mobile" // মোবাইল / টিভিতে আসক্ত ছিল
    | "outside_roaming" // বাড়িতে ছিল না / বাইরে উদ্দেশ্যহীন ছোটাছুটি
    | "sleeping_idle" // অসময়ে ঘুম / অলস অবস্থায়
    | "helping_family" // পারিবারিক কাজে ব্যস্ত
    | "other"; // অন্যান্য
  studentStateDetails?: string;
  studyEnvironment: "excellent" | "tidy" | "moderate" | "noisy_distracted";
  parentResponsibility: "highly_attentive" | "supportive" | "moderate" | "indifferent" | "absent";
  counselingNotes: string; // শিক্ষক কর্তৃক কাউন্সেলিং ও করণীয় পরামর্শ
  studentCommitment: string; // শিক্ষার্থীর প্রত্যয় বা ওয়াদা
  parentRemarks: string; // অভিভাবকের প্রতিক্রিয়া / মতামত
  followUpDate?: string; // পরবর্তী ফলো-আপ বা পুনরায় আচমকা ভিজিটের সম্ভাব্য তারিখ
  overallScore: number; // 1 to 5
  updatedAt?: any;
  createdAt?: any;
}

export const STUDENT_STATE_OPTIONS: {
  value: HomeVisitRecord["studentState"];
  label: string;
  shortLabel: string;
  icon: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}[] = [
  {
    value: "at_study_desk",
    label: "পড়ার টেবিলে মনোযোগ সহকারে পাঠরত",
    shortLabel: "পড়ার টেবিলে ছিল",
    icon: "📖",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    borderClass: "border-emerald-500 bg-emerald-50/40",
    description: "বই-খাতা খুলে অধ্যয়নরত পাওয়া গেছে; টেবিল পরিপাটি ও পড়াশোনায় মনোযোগী ছিল।"
  },
  {
    value: "playing_home",
    label: "ঘরে খেলাধুলা / ছোটাছুটি করছিল",
    shortLabel: "ঘরে ছোটাছুটি করছিল",
    icon: "🏃",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    borderClass: "border-amber-500 bg-amber-50/40",
    description: "পড়ার সময় হওয়া সত্ত্বেও টেবিলে ছিল না; ভাইবোন বা বন্ধুদের সাথে ঘরে ছোটাছুটি করছিল।"
  },
  {
    value: "tv_mobile",
    label: "টিভি / মোবাইল ফোনে আসক্ত ছিল",
    shortLabel: "মোবাইল/টিভিতে মগ্ন",
    icon: "📱",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    borderClass: "border-rose-500 bg-rose-50/40",
    description: "স্মার্টফোনে গেম/ভিডিও বা টিভি দেখছিল; পড়ার টেবিলে মনোনিবেশ ছিল না।"
  },
  {
    value: "outside_roaming",
    label: "বাড়িতে উপস্থিত ছিল না / বাইরে খেলাধুলা বা উদ্দেশ্যহীন ঘোরাঘুরি",
    shortLabel: "বাড়িতে ছিল না (বাইরে)",
    icon: "🚫",
    badgeClass: "bg-red-100 text-red-900 border-red-300",
    borderClass: "border-red-500 bg-red-50/40",
    description: "পড়ার সময়ে বাড়িতে পাওয়া যায়নি; পাড়া বা রাস্তায় ঘোরাঘুরি করছিল।"
  },
  {
    value: "sleeping_idle",
    label: "অসময়ে ঘুম / টেবিলে অলসতা",
    shortLabel: "অসময়ে ঘুম/অলস",
    icon: "😴",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
    borderClass: "border-indigo-500 bg-indigo-50/40",
    description: "সন্ধ্যা বা পড়ার নির্ধারিত সময়ে ঘুমিয়ে ছিল বা টেবিলে অলস বসে ছিল।"
  },
  {
    value: "helping_family",
    label: "পারিবারিক বা গৃহস্থালি কাজে ব্যস্ত",
    shortLabel: "পারিবারিক কাজে ব্যস্ত",
    icon: "🤝",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    borderClass: "border-sky-500 bg-sky-50/40",
    description: "পিতামাতাকে পারিবারিক বা দোকানের কাজে সাহায্য করছিল।"
  },
  {
    value: "other",
    label: "অন্যান্য বিশেষ অবস্থা",
    shortLabel: "অন্যান্য",
    icon: "📝",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    borderClass: "border-slate-400 bg-slate-50/40",
    description: "অসুস্থতা বা মেহমানের উপস্থিতির মতো বিশেষ কোনো কারণ।"
  }
];

export const STUDY_ENV_OPTIONS: {
  value: HomeVisitRecord["studyEnvironment"];
  label: string;
  badgeClass: string;
}[] = [
  { value: "excellent", label: "চমৎকার ও পর্যাপ্ত আলো-বাতাসপূর্ণ", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "tidy", label: "পরিপাটি ও শান্ত পড়ার পরিবেশ", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "moderate", label: "মাঝারি / কিছুটা মনোযোগ বিক্ষিপ্ত", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "noisy_distracted", label: "কোলাহলপূর্ণ / টিভি বা বিশৃঙ্খলাযুক্ত", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" }
];

export const PARENT_RESPONSIBILITY_OPTIONS: {
  value: HomeVisitRecord["parentResponsibility"];
  label: string;
  badgeClass: string;
}[] = [
  { value: "highly_attentive", label: "অত্যন্ত সচেতন ও নিয়মিত তদারককারী", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "supportive", label: "সহানুভূতিশীল ও পরামর্শ বাস্তবায়নে সচেষ্ট", badgeClass: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "moderate", label: "মোটামুটি / কাজের চাপে সময় কম দেন", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "indifferent", label: "উদাসীন / পড়াশোনার রুটিনের খেয়াল রাখেন না", badgeClass: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "absent", label: "পরিদর্শনকালে অভিভাবক অনুপস্থিত ছিলেন", badgeClass: "bg-slate-50 text-slate-700 border-slate-200" }
];

export const INITIAL_SAMPLE_VISITS: HomeVisitRecord[] = [
  {
    id: "visit_sample_1",
    studentName: "আব্দুল্লাহ আল মাহমুদ",
    studentClass: "৮ম শ্রেণি",
    studentRoll: "০১",
    location: "পূর্ব রামপুরা, বাড়ি # ১২/এ, রোড # ৪",
    visitDate: "2026-09-15",
    visitTime: "সন্ধ্যা ০৭:১৫",
    teacherName: "মাওলানা আব্দুর রহমান (শ্রেণি শিক্ষক)",
    studentState: "at_study_desk",
    studentStateDetails: "বিজ্ঞানের 'গতি' অধ্যায় পাঠ করছিল এবং গণিত খাতায় নোট নিচ্ছিল।",
    studyEnvironment: "excellent",
    parentResponsibility: "highly_attentive",
    counselingNotes: "পড়ার গতি ও টেবিল প্রস্তুতি খুবই চমৎকার। নিয়মিত সালাতের পর বিরতি নিয়ে পড়ার পরামর্শ দেওয়া হয়েছে যাতে চোখের ক্লান্তি না আসে।",
    studentCommitment: "প্রতিদিন মাগরিবের পর টেবিলে বসে রাত ১০:৩০ পর্যন্ত একটানা রুটিন মেনে চলবে।",
    parentRemarks: "হঠাৎ শিক্ষকের উপস্থিতিতে মা খুবই আনন্দিত হয়েছেন এবং স্কুলের এই পদক্ষেপকে আন্তরিক সাধুবাদ জানিয়েছেন।",
    followUpDate: "2026-10-10",
    overallScore: 5
  },
  {
    id: "visit_sample_2",
    studentName: "ফাতিমা তুয যোহরা",
    studentClass: "৭ম শ্রেণি",
    studentRoll: "০৫",
    location: "মধ্য বাড্ডা, কমিশনার গলি, বাড়ি # ৪৫",
    visitDate: "2026-09-16",
    visitTime: "সন্ধ্যা ০৬:৪৫",
    teacherName: "মুহাম্মাদ আসাদুজ্জামান (সহকারী শিক্ষক)",
    studentState: "tv_mobile",
    studentStateDetails: "হাতে স্মার্টফোন নিয়ে ছোট ভাইয়ের সাথে ইউটিউব কার্টুন দেখছিল; বই খোলা ছিল না।",
    studyEnvironment: "noisy_distracted",
    parentResponsibility: "moderate",
    counselingNotes: "স্মার্টফোনের ক্ষতিকর প্রভাব বুঝিয়ে বলা হয়েছে। মাগরিব থেকে রাত ১০টা পর্যন্ত পরিবারে ফোন ব্যবহারে 'নো-স্ক্রিন টাইম' পলিসি চালুর নির্দেশ দেওয়া হলো।",
    studentCommitment: "পড়ার সময়ে মোবাইল স্পর্শ করবে না এবং পড়ার টেবিল ড্রয়ারে ফোন বন্ধ রাখবে।",
    parentRemarks: "বাবা উপস্থিত ছিলেন; তিনি শিক্ষকের সামনে ওয়াদা করেছেন পড়ার সময় মোবাইল নিজের কাছে রাখবেন।",
    followUpDate: "2026-09-28",
    overallScore: 2
  },
  {
    id: "visit_sample_3",
    studentName: "মুহাম্মদ রাফি আহমেদ",
    studentClass: "৬ষ্ঠ শ্রেণি",
    studentRoll: "১২",
    location: "দক্ষিণ বনশ্রী, ব্লক-সি, রোড # ৭",
    visitDate: "2026-09-18",
    visitTime: "বিকাল ০৫:৪০",
    teacherName: "মুহাম্মাদ আসাদুজ্জামান (সহকারী শিক্ষক)",
    studentState: "outside_roaming",
    studentStateDetails: "আসর পর বন্ধুদের সাথে রাস্তায় ঘোরাঘুরি করছিল; মাগরিবের আজানের পরও বাড়ি ফেরেনি।",
    studyEnvironment: "moderate",
    parentResponsibility: "indifferent",
    counselingNotes: "সন্ধ্যায় ছাত্রকে বাড়ি ফিরিয়ে আনা হয় এবং পরিবারের সামনে সময়ানুবর্তিতা ও আচমকা ভিজিটের গুরুত্ব স্মরণ করিয়ে দেওয়া হয়।",
    studentCommitment: "মাগরিবের পূর্বেই বাসায় ফিরে অজু করে সালাত শেষে টেবিলে বসার দৃঢ় সংকল্প ব্যক্ত করেছে।",
    parentRemarks: "অভিভাবককে আরও বেশি তদারকশীল হতে সতর্কবার্তা দেওয়া হয়েছে।",
    followUpDate: "2026-09-25",
    overallScore: 2
  }
];
