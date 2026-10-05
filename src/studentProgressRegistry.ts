export interface CompetencyItem {
  id: string;
  skillArea: string;
  currentStatus: string;
  targetGoal: string;
  supportType: string;
  progress: "green" | "yellow" | "red";
  reviewDate: string;
}

export interface StudentProgressData {
  studentName: string;
  studentClass: string;
  studentRoll: string;
  learningStyle: string;
  behavioralPattern: string;
  confidenceLevel: string;
  keyBarrier: string;
  hiddenTalent: string;
  customStrategy: string;
  competencies: CompetencyItem[];
  dreamGoal?: string;
}

// Initial progress records for Nursery (নার্সারি) students
export const NURSERY_STUDENTS_PROGRESS: Record<string, StudentProgressData> = {
  // রোল ২৪: মারিয়া
  "২৪": {
    studentName: "মারিয়া",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "২৪",
    learningStyle: "দৃশ্যমান (Visual) - দেখে দেখে ও রঙ চিনে",
    behavioralPattern: "মনোযোগী, শান্ত ও সুশৃঙ্খল",
    confidenceLevel: "উচ্চ (High)",
    keyBarrier: "নতুন পরিবেশে কথা বলতে শুরুতে দ্বিধাবোধ",
    hiddenTalent: "ছড়া আবৃত্তি ও মিষ্টি সুরে কথা বলা",
    customStrategy: "রঙিন ফ্ল্যাশ কার্ড, পিকচার চার্ট ও নিয়মিত স্নেহপূর্ণ প্রশংসা",
    dreamGoal: "ভবিষ্যতে ডাক্তার হওয়া ও সেবা করা",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা বর্ণমালা ও ছড়া",
        currentStatus: "স্বরবর্ণ (অ-ঔ) চমৎকার চিনে বলতে পারে",
        targetGoal: "ব্যঞ্জনবর্ণ (ক-ঙ) চেনা ও নিখুঁত উচ্চারণ",
        supportType: "ছবির বই ও অডিও ড্রিল",
        progress: "green",
        reviewDate: "১৫/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "গণিত ও সংখ্যা গণনা",
        currentStatus: "১ থেকে ১৫ পর্যন্ত নির্ভুল গুনতে পারে",
        targetGoal: "১ থেকে ২০ পর্যন্ত বস্তু গুনে সংখ্যা মেলানো",
        supportType: "কাউন্টিং ব্লক ও খেলনা",
        progress: "green",
        reviewDate: "২০/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি Alphabet",
        currentStatus: "A থেকে M পর্যন্ত চিনে বলে",
        targetGoal: "A থেকে Z পর্যন্ত Capital Letters চেনা",
        supportType: "অ্যালফাবেট গান ও ফ্ল্যাশ কার্ড",
        progress: "yellow",
        reviewDate: "২৫/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "হাতের লেখা ও ট্রেসিং",
        currentStatus: "পেন্সিল গ্রিপ ভালো, রেখা সোজা হয়",
        targetGoal: "ডট মিলিয়ে গোল বৃত্ত ও বর্ণ ট্রেসিং",
        supportType: "ট্রেসিং শিট ও ক্রেয়ন কালারিং",
        progress: "green",
        reviewDate: "৩০/১০/২০২৬"
      }
    ]
  },
  // রোল ২৬: তাবাছুম
  "২৬": {
    studentName: "তাবাছুম",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "২৬",
    learningStyle: "শ্রবণভিত্তিক (Auditory) - শুনে শুনে ও ছড়ার ছন্দে",
    behavioralPattern: "প্রাণবন্ত, চটপটে ও আনন্দপ্রিয়",
    confidenceLevel: "উচ্চ (High)",
    keyBarrier: "একটানা বসে থাকার মনোযোগের স্থায়িত্ব কম",
    hiddenTalent: "অভিনয় ও অঙ্গভঙ্গির মাধ্যমে গল্প বলা",
    customStrategy: "গানের সুরে ছড়া শেখানো ও নিয়মিত সংক্ষিপ্ত শারীরিক বিরতি দেওয়া",
    dreamGoal: "শিক্ষক হওয়া ও শিশুদের হাসিমুখে পড়ানো",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা বর্ণমালা ও ছড়া",
        currentStatus: "৩টি ছড়া সম্পূর্ণ অঙ্গভঙ্গিসহ বলতে পারে",
        targetGoal: "স্বরবর্ণ দেখে নাম বলা",
        supportType: "ছড়ার অডিও ও ভিডিও গান",
        progress: "green",
        reviewDate: "১৬/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "গণিত ও সংখ্যা গণনা",
        currentStatus: "১ থেকে ১০ পর্যন্ত মুখে বলতে পারে",
        targetGoal: "সংখ্যা দেখে শনাক্ত করা (১-১০)",
        supportType: "সংখ্যা কার্ড খেলা",
        progress: "yellow",
        reviewDate: "২১/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি Phonics",
        currentStatus: "A for Apple, B for Ball বলতে পারে",
        targetGoal: "A-J পর্যন্ত লেটার কার্ড শনাক্ত করা",
        supportType: "পিকচার বুক ড্রিলিং",
        progress: "green",
        reviewDate: "২৫/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "আচরণ ও শৃঙ্খলা",
        currentStatus: "সহপাঠীদের সাথে বন্ধুভাবাপন্ন",
        targetGoal: "পড়ার সময়ে টেবিলে শান্ত হয়ে বসা",
        supportType: "পজিটিভ রিইনফোর্সমেন্ট ও স্টার স্টিকার",
        progress: "yellow",
        reviewDate: "২৭/১০/২০২৬"
      }
    ]
  },
  // রোল ২৭: আয়েশা
  "২৭": {
    studentName: "আয়েশা",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "২৭",
    learningStyle: "অনুশীলনভিত্তিক (Kinesthetic) - হাতে-কলমে ও লিখে",
    behavioralPattern: "চুপচাপ, শান্ত ও লাজুক স্বভাব",
    confidenceLevel: "মাঝারি (Mid)",
    keyBarrier: "ক্লাসে সবার সামনে উচ্চস্বরে উত্তর দিতে লজ্জা",
    hiddenTalent: "খাতায় অত্যন্ত পরিপাটি ও সুন্দর রঙের কাজ",
    customStrategy: "ওয়ান-টু-ওয়ান স্নেহপূর্ণ আচরণ ও ছোট গ্রুপে কথা বলার সুযোগ",
    dreamGoal: "বড় হয়ে একজন আদর্শ সুনাগরিক হওয়া",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা বর্ণমালা",
        currentStatus: "অ থেকে ঌ পর্যন্ত লিখে দেখাতে পারে",
        targetGoal: "সবাইকে স্পষ্ট গলায় পড়ে শোনানো",
        supportType: "স্নেহশীল মোটিভেশন",
        progress: "yellow",
        reviewDate: "১৮/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "হাতের লেখা ও ট্রেসিং",
        currentStatus: "লাইন সমান থাকে, লেখা স্পষ্ট",
        targetGoal: "১ থেকে ১০ সংখ্যা সুন্দর করে লেখা",
        supportType: "ওয়ার্কশিট প্র্যাকটিস",
        progress: "green",
        reviewDate: "২২/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি Alphabet",
        currentStatus: "A, B, C, D সুন্দর চিনে",
        targetGoal: "A থেকে M পর্যন্ত চেনা ও উচ্চারণ",
        supportType: "ফ্ল্যাশ কার্ড",
        progress: "yellow",
        reviewDate: "২৬/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "সামাজিক মেলামেশা",
        currentStatus: "পাশের বান্ধবীর সাথে ভালো মেলামেশা",
        targetGoal: "শিক্ষকের প্রশ্নের মুখে স্বতঃস্ফূর্ত উত্তর প্রদান",
        supportType: "পিয়ার লার্নিং",
        progress: "yellow",
        reviewDate: "২৯/১০/২০২৬"
      }
    ]
  },
  // রোল ৩০: হাছিবা
  "৩০": {
    studentName: "হাছিবা",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "৩০",
    learningStyle: "দৃশ্যমান (Visual) - রঙিন ছবি দেখে দেখে",
    behavioralPattern: "কৌতূহলী, প্রশ্নপ্রবণ ও সক্রিয়",
    confidenceLevel: "মাঝারি (Mid)",
    keyBarrier: "দ্রুত এক বিষয় থেকে অন্য বিষয়ে মনোযোগ সরে যাওয়া",
    hiddenTalent: "ছবি আঁকা ও বিভিন্ন রঙ মেলানো",
    customStrategy: "মাল্টিমিডিয়া চিত্র ও আকর্ষণীয় গল্পের মাধ্যমে পাঠদান",
    dreamGoal: "একজন শিল্পী ও বৈজ্ঞানিক হওয়া",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা ছড়া ও কথা বলা",
        currentStatus: "গল্প শুনে ভালো বুঝতে পারে",
        targetGoal: "নিজের ভাষায় গল্প বা ছড়া বর্ণনা করা",
        supportType: "পিকচার স্টোরি টেলিং",
        progress: "green",
        reviewDate: "১৯/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "গণিত (সংখ্যা ও আকার)",
        currentStatus: "গোল, চারকোনা আকার চিনতে পারে",
        targetGoal: "১-১৫ পর্যন্ত সংখ্যা চেনা ও লেখা",
        supportType: "আকার ও সংখ্যার খেলনা",
        progress: "yellow",
        reviewDate: "২৩/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি Vocabulary",
        currentStatus: "ফল ও পশুপাখির ইংরেজি নাম বলতে পারে",
        targetGoal: "A-Z বর্ণের ধ্বনি (sounds) চেনা",
        supportType: "অ্যানিমেল সাউন্ড ও লেটার ম্যাচিং",
        progress: "green",
        reviewDate: "২৭/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "মনোযোগ বৃদ্ধি",
        currentStatus: "১০ মিনিট মনোযোগ ধরে রাখতে পারে",
        targetGoal: "১৫-২০ মিনিট একনিষ্ঠভাবে পাঠ সম্পন্ন করা",
        supportType: "টাইমার ও রিওয়ার্ড গেম",
        progress: "yellow",
        reviewDate: "৩১/১০/২০২৬"
      }
    ]
  },
  // রোল ৩১: সাকিব
  "৩১": {
    studentName: "সাকিব",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "৩১",
    learningStyle: "অনুশীলনভিত্তিক (Kinesthetic) - খেলাধুলা ও দৌড়াদৌড়ির মাধ্যমে",
    behavioralPattern: "অত্যন্ত চটপটে, উদ্যমী ও সাহসী",
    confidenceLevel: "উচ্চ (High)",
    keyBarrier: "পড়ার টেবিলে স্থির হয়ে না বসা",
    hiddenTalent: "পাজল মেলানো ও ব্লক দিয়ে ঘর বানানো",
    customStrategy: "অ্যাকশন লার্নিং (লাফিয়ে বর্ণ ছোঁয়া, ব্লক গুনে গণনা) পদ্ধতি",
    dreamGoal: "ক্রিকেটার হওয়া ও দেশের নাম উজ্জ্বল করা",
    competencies: [
      {
        id: "1",
        skillArea: "গণিত ও সংখ্যা গণনা",
        currentStatus: "বস্তু দ্রুত গুনতে পারে (১-১০)",
        targetGoal: "১ থেকে ২০ পর্যন্ত ক্রমানুসারে সাজানো",
        supportType: "নাম্বার ব্লক ও পাজল",
        progress: "green",
        reviewDate: "১৭/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "বাংলা বর্ণমালা চেনা",
        currentStatus: "অ, আ, ই, ঈ চিনে চিহ্নিত করতে পারে",
        targetGoal: "সম্পূর্ণ স্বরবর্ণ দ্রুত চেনা",
        supportType: "ফ্ল্যাশ কার্ড দৌড় খেলা",
        progress: "yellow",
        reviewDate: "২৪/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "পেন্সিল কন্ট্রোল",
        currentStatus: "পেন্সিল ধরতে পারে কিন্তু চাপ বেশি দেয়",
        targetGoal: "নরমভাবে ধরে ট্রেসিং লাইন অনুসরণ",
        supportType: "মোটা ক্রেয়ন ও ক্লে মডেলিং",
        progress: "yellow",
        reviewDate: "২৮/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "নিয়মানুবর্তিতা",
        currentStatus: "খেলা শেষে জিনিসপত্র রাখতে পারে",
        targetGoal: "ক্লাসে নিয়ম মেনে সময়মতো বসা",
        supportType: "রুটিন অভ্যাস অনুশীলন",
        progress: "green",
        reviewDate: "৩০/১০/২০২৬"
      }
    ]
  },
  // রোল ৩২: রাদিয়া
  "৩২": {
    studentName: "রাদিয়া",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "৩২",
    learningStyle: "দৃশ্যমান ও শ্রবণভিত্তিক (Visual-Auditory)",
    behavioralPattern: "সহজ-সরল, বিনয়ী ও বাধ্য",
    confidenceLevel: "মাঝারি (Mid)",
    keyBarrier: "নতুন শব্দ শিখতে কিছুটা বেশি পুনরাবৃত্তি প্রয়োজন",
    hiddenTalent: "মধুর সুরে কবিতা আবৃত্তি",
    customStrategy: "প্রতিদিনের পাঠ বারবার পুনরাবৃত্তি (Revision) ও স্নেহপূর্ণ সঙ্গ",
    dreamGoal: "একজন আদর্শ শিক্ষিকা হয়ে জ্ঞান ছড়িয়ে দেওয়া",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা বর্ণ ও শব্দ",
        currentStatus: "অ-তে অজগর, আ-তে আম স্পষ্ট বলতে পারে",
        targetGoal: "সবগুলো স্বরবর্ণ নিজে নিজে পড়া",
        supportType: "ছবিসহ বর্ণ পরিচয় বই",
        progress: "green",
        reviewDate: "১৯/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "ইংরেজি Alphabet",
        currentStatus: "A, B, C, D চিনে বলতে পারে",
        targetGoal: "E থেকে M পর্যন্ত বর্ণ আত্মস্থ করা",
        supportType: "অ্যালফাবেট রাইমস",
        progress: "yellow",
        reviewDate: "২৩/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "গণিত ধারণা",
        currentStatus: "বড়-ছোট, বেশি-কমের তুলনা বুঝে",
        targetGoal: "১ থেকে ১৫ পর্যন্ত সংখ্যা লেখা",
        supportType: "চিত্রভিত্তিক অঙ্ক শিট",
        progress: "green",
        reviewDate: "২৭/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "হাতের কাজ ও পরিচ্ছন্নতা",
        currentStatus: "বই-খাতা খুব গুছিয়ে রাখে",
        targetGoal: "নির্দিষ্ট সীমানার ভেতর নিখুঁত রঙ করা",
        supportType: "কালারিং বুক প্র্যাকটিস",
        progress: "green",
        reviewDate: "৩১/১০/২০২৬"
      }
    ]
  },
  // রোল ৩৩: জান্নাতি
  "৩৩": {
    studentName: "জান্নাতি",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "৩৩",
    learningStyle: "শ্রবণভিত্তিক (Auditory) - শিক্ষক বললে মনোযোগ দিয়ে শুনে",
    behavioralPattern: "ধৈর্যশীল, শান্ত ও মনোযোগী",
    confidenceLevel: "মাঝারি (Mid)",
    keyBarrier: "হাতের লেখার গতি কিছুটা ধীর",
    hiddenTalent: "স্মরণশক্তি অসাধারণ ও ছড়া দ্রুত মুখস্থ হয়",
    customStrategy: "লেখার গতি বাড়ানোর জন্য প্রতিদিন এক পৃষ্ঠা ডট-ট্রেসিং অনুশীলন",
    dreamGoal: "পড়াশোনা করে বড় ডাক্তার হওয়া",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা ছড়া ও বর্ণমালা",
        currentStatus: "স্বরবর্ণ সম্পূর্ণ মুখে বলতে ও চিনতে পারে",
        targetGoal: "খাতায় স্বরবর্ণ সুন্দর আকৃতিতে লেখা",
        supportType: "ট্রেসিং কপি ও হ্যান্ডরাইটিং গাইড",
        progress: "green",
        reviewDate: "১৮/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "গণিত ও সংখ্যা ধারণা",
        currentStatus: "১ থেকে ১৫ পর্যন্ত মুখে বলতে পারে",
        targetGoal: "১ থেকে ১০ সংখ্যা খাতায় সঠিক ক্রমে লেখা",
        supportType: "বিন্দু মিলিয়ে সংখ্যা লিখন শিট",
        progress: "yellow",
        reviewDate: "২২/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি লেটারস",
        currentStatus: "A-Z রাইম পুরোপুরি মুখস্থ বলতে পারে",
        targetGoal: "লেটার কার্ড দেখে শনাক্ত করা",
        supportType: "লেটার ম্যাচিং গেম",
        progress: "green",
        reviewDate: "২৬/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "নীতিশিক্ষা ও শিষ্টাচার",
        currentStatus: "ক্লাসে সালাম দেওয়া ও ধন্যবাদ জানানোর অভ্যাস আছে",
        targetGoal: "সহপাঠীদের সাথে পড়া শেয়ার করা",
        supportType: "নৈতিক মূল্যবোধ গল্প",
        progress: "green",
        reviewDate: "৩০/১০/২০২৬"
      }
    ]
  },
  // রোল ৩৪: লামিন
  "৩৪": {
    studentName: "লামিন",
    studentClass: "নার্সারি শ্রেণি",
    studentRoll: "৩৪",
    learningStyle: "অনুশীলনভিত্তিক (Kinesthetic) - নিজে নিজে হাত দিয়ে করে দেখা",
    behavioralPattern: "উদ্যমী, অনুসন্ধিৎসু ও বন্ধুবৎসল",
    confidenceLevel: "উচ্চ (High)",
    keyBarrier: "তাড়াহুড়া করে লিখতে গিয়ে অক্ষরের আকৃতি বড়-ছোট হওয়া",
    hiddenTalent: "নতুন বিষয় খুব দ্রুত বুঝতে পারা ও প্রশ্ন করা",
    customStrategy: "দাগটানা ৩-লাইনের খাতায় ধীরেসুস্থে বর্ণ অনুশীলনের বিশেষ গাইড",
    dreamGoal: "একজন সফল ইঞ্জিনিয়ার ও বড় মনের মানুষ হওয়া",
    competencies: [
      {
        id: "1",
        skillArea: "বাংলা বর্ণমালা লিখন",
        currentStatus: "অধিকাংশ স্বরবর্ণ লিখতে পারে",
        targetGoal: "মাত্রা ও গোল অংশ সমান আকারে লেখা",
        supportType: "রুলটানা চারলাইন খাতা",
        progress: "yellow",
        reviewDate: "২০/১০/২০২৬"
      },
      {
        id: "2",
        skillArea: "গণিত ও গণনা",
        currentStatus: "১ থেকে ২০ পর্যন্ত সংখ্যা দ্রুত ও নির্ভুল গুনে",
        targetGoal: "সংখ্যা ক্রমানুসারে সাজানো ও লেখা",
        supportType: "কাউন্টিং গেমস ও কয়েন কাউন্টিং",
        progress: "green",
        reviewDate: "২৩/১০/২০২৬"
      },
      {
        id: "3",
        skillArea: "ইংরেজি Alphabet",
        currentStatus: "A থেকে P পর্যন্ত সুন্দর চিনতে পারে",
        targetGoal: "A থেকে Z পর্যন্ত সম্পূর্ণ চেনা ও উচ্চারণ",
        supportType: "ফ্ল্যাশ কার্ড ড্রিল",
        progress: "yellow",
        reviewDate: "২৭/১০/২০২৬"
      },
      {
        id: "4",
        skillArea: "সৃজনশীলতা ও ড্রয়িং",
        currentStatus: "পতাকা, ঘর ও ফুল সুন্দর আঁকে",
        targetGoal: "নির্দিষ্ট দাগের ভেতরে মসৃণ রঙ করা",
        supportType: "চিত্রাঙ্কন ওয়ার্কশপ",
        progress: "green",
        reviewDate: "৩১/১০/২০২৬"
      }
    ]
  }
};

// Also map English roll numbers for flexible lookup
for (const [bnRoll, data] of Object.entries(NURSERY_STUDENTS_PROGRESS)) {
  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  const enRoll = bnRoll.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);
  NURSERY_STUDENTS_PROGRESS[enRoll] = data;
}

export function getInitialStudentProgress(cls: string, roll: string, name: string): StudentProgressData | null {
  const normCls = (cls || "").trim().replace(/\s*শ্রেণি\s*$/i, "").replace(/\s*শ্রেণী\s*$/i, "").trim();
  if (normCls !== "নার্সারি" && normCls !== "নার্সারী") return null;

  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  const cleanRoll = (roll || "").toString().trim().replace(/^0+/, "");
  const enRoll = cleanRoll.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);

  for (const key of Object.keys(NURSERY_STUDENTS_PROGRESS)) {
    const keyEn = key.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);
    if (key === cleanRoll || keyEn === enRoll) {
      return NURSERY_STUDENTS_PROGRESS[key];
    }
  }

  // Fallback match by name
  for (const data of Object.values(NURSERY_STUDENTS_PROGRESS)) {
    if (data.studentName === name?.trim()) {
      return data;
    }
  }

  return null;
}
