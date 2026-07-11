// Highly polished slide decks and PowerPoint PPT prompts for D-Licon Model School
// Written in elegant, motivational Bengali for Students, Teachers, and Parents.

export interface SlideItem {
  id: number;
  numberBn: string;
  title: string;
  subTitle: string;
  points: string[];
  message: string;
  iconName: string;
  bgColor: string;
  accentBg: string;
}

// 1. Presentation for Students (১০ স্লাইড)
export const slidesForStudents: SlideItem[] = [
  {
    id: 1,
    numberBn: "১",
    title: "আমার রঙিন দিন, আমার সুন্দর ভবিষ্যৎ",
    subTitle: "আমার দৈনিক প্রগতি শিট: জীবন গড়ার প্রথম আনন্দদায়ক ধাপ।",
    points: [
      "এটি কোনো কঠিন নিয়ম বা পরীক্ষা নয়, এটি আমার দিনটিকে সুন্দর করে সাজানোর খেলার মতো!",
      "আমার নাম, শ্রেণি ও রোল নম্বর যুক্ত এই বিশেষ শিটটি কেবল আমার নিজের প্রগতির বিশ্বস্ত আয়না।"
    ],
    message: "আমার জীবনের নায়ক আমি নিজেই! প্রতিদিনের জয়ে আমিই হবো সেরা।",
    iconName: "Sparkles",
    bgColor: "from-indigo-900 to-indigo-950 text-white",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: 2,
    numberBn: "২",
    title: "হোম-টাইম মনিটরিং: আমার সর্বোচ্চ লাভ কী?",
    subTitle: "কেন এই শিটটি আমার জন্য অত্যন্ত আকর্ষণীয় ও লাভজনক?",
    points: [
      "নিজের পড়াশোনা ও কাজের নিয়ন্ত্রণ নিজের হাতে চলে আসে, ফলে পড়ার চাপ বা ভয় আর থাকে না।",
      "প্রতিটি ভালো কাজের সাথে সাথেই 'টিক' চিহ্ন দেওয়ার আনন্দ ও নিজের অর্জন নিজের চোখে দেখা যায়।",
      "সুন্দর আচরণের জন্য রয়েছে বিশেষ সম্মাননা, প্রশংসাপত্র ও পুরস্কার জেতার চমৎকার সুযোগ।"
    ],
    message: "ছোট্ট একটি টিক চিহ্ন আমার আত্মবিশ্বাসকে বাড়িয়ে দেবে বহুগুণ!",
    iconName: "Award",
    bgColor: "from-blue-900 to-blue-950 text-white",
    accentBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: 3,
    numberBn: "৩",
    title: "দৈনিক লক্ষ্য (Daily Goal) লেখার জাদু",
    subTitle: "ছোট্ট এক লাইনের লক্ষ্য কীভাবে বদলে দেবে আমার দিন?",
    points: [
      "প্রতিদিন সকালে ঘুম থেকে উঠে ডায়েরিতে নিজের একটি ছোট্ট লক্ষ্য (যেমন: 'আজ অংকটি নিজে সমাধান করব') লিখে ফেলা।",
      "লক্ষ্য স্থির থাকলে মন ও মস্তিষ্ক সেই কাজটি শেষ করতে দারুণভাবে সচেষ্ট হয়।",
      "লক্ষ্যপূরণের পর যে অনাবিল আনন্দ ও তৃপ্তি পাওয়া যায়, তা আমার মনকে রাখবে সতেজ ও প্রফুল্ল।"
    ],
    message: "লক্ষ্যহীন জীবন হালহীন নৌকার মতো; আমি হবো আমার জীবনের দক্ষ মাঝি!",
    iconName: "Target",
    bgColor: "from-amber-900 to-yellow-950 text-white",
    accentBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: 4,
    numberBn: "৪",
    title: "খেলার সময় খেলা, পড়ার সময় পড়া",
    subTitle: "সময়ের সঠিক ব্যবহারে অনন্য ভারসাম্য বজায় রাখা।",
    points: [
      "স্কুল থেকে ফিরে দুপুরের খাবার ও পর্যাপ্ত বিশ্রামের পর বিকেলের আলোয় খেলাধুলা করা স্বাস্থ্যকর।",
      "খেলাধুলা শরীর ও মনকে চাঙ্গা করে, ফলে সন্ধ্যায় পড়ার টেবিলে মনোযোগ বসে দ্বিগুণ গতিতে।",
      "রুটিন মেনে চলার ফলে আমার পড়ার সময় ও খেলার সময় কোনোটিই নষ্ট হবে না।"
    ],
    message: "সুস্থ দেহে সুন্দর মন—খেলাধুলা ও পড়াশোনার অপূর্ব সমন্বয়।",
    iconName: "Activity",
    bgColor: "from-emerald-900 to-emerald-950 text-white",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: 5,
    numberBn: "৫",
    title: "সন্ধ্যার সোনালী সময় ও ভোরের বরকত",
    subTitle: "পড়াশোনায় জাদুকরী প্রভাব ফেলার দুটি বিশেষ সময়।",
    points: [
      "সন্ধ্যার সোনালী সময়: বাদ মাগরিব থেকে রাত ৯টা পর্যন্ত কোনো অজুহাত ছাড়াই পড়ার টেবিলে পূর্ণ সক্রিয় থাকা।",
      "ভোরের বরকত: খুব ভোরে ঘুম থেকে উঠে প্রার্থনা শেষ করে অন্তত ২ ঘণ্টা পাঠ্যবই পড়া অত্যন্ত ফলদায়ক।",
      "এই দুটি সময়ে পড়ার গভীর মনোযোগ সারা দিনের পড়াশোনার চেয়েও বেশি কার্যকর ও দীর্ঘস্থায়ী হয়।"
    ],
    message: "সকালের আলো আর সন্ধ্যার একাগ্রতা—আমার সফলতার আসল চাবিকাঠি।",
    iconName: "Clock",
    bgColor: "from-rose-900 to-rose-950 text-white",
    accentBg: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: 6,
    numberBn: "৬",
    title: "সালাম ও শিষ্টাচারের সুপারপাওয়ার",
    subTitle: "ভালো মানুষ হওয়ার প্রথম পাঠই হলো উত্তম আদব।",
    points: [
      "বাড়িতে ও বাইরে বড়দের দেখা হওয়ামাত্রই হাসিমুখে আগে সালাম (বা আদাব) দেওয়া।",
      "ছোটদের প্রতি স্নেহশীল হওয়া এবং সবার সাথে নরম স্বরে ও মার্জিত ভাষায় কথা বলা।",
      "উত্তম আচরণই একজন সাধারণ শিক্ষার্থীকে সবার প্রিয় ও অনন্য ব্যক্তিত্বে পরিণত করে।"
    ],
    message: "জ্ঞান মানুষকে আলো দেয়, আর শিষ্টাচার মানুষকে সুন্দর করে তোলে।",
    iconName: "Heart",
    bgColor: "from-purple-900 to-purple-950 text-white",
    accentBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: 7,
    numberBn: "৭",
    title: "মোবাইল আসক্তি এড়ানো ও ডিজিটাল ডিটক্স",
    subTitle: "প্রযুক্তির দাস নয়, আমরা হবো প্রযুক্তির বুদ্ধিমান মালিক!",
    points: [
      "পড়াশোনার সময় মোবাইল ফোন সম্পূর্ণ দূরে বা সাইলেন্ট করে রাখা, এতে মনোযোগের বিচ্যুতি ঘটে না।",
      "মোবাইল স্ক্রিনে অতিরিক্ত গেম বা অপ্রয়োজনীয় ভিডিও দেখা আমাদের সৃজনশীলতা ও স্মরণশক্তি কমিয়ে দেয়।",
      "সোশ্যাল মিডিয়া বা প্রযুক্তির মার্জিত ও নিয়ন্ত্রিত ব্যবহার আমাদের এক নতুন উচ্চতায় নিয়ে যাবে।"
    ],
    message: "যন্ত্রের নিয়ন্ত্রণে আমরা চলব না, আমাদের নিয়ন্ত্রণে চলবো আমরা ও আমাদের ডিভাইস!",
    iconName: "Tablet",
    bgColor: "from-teal-900 to-teal-950 text-white",
    accentBg: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: 8,
    numberBn: "৮",
    title: "নিজের ভুলের স্বীকারোক্তি ও আত্মউন্নয়ন",
    subTitle: "সততা ও নৈতিকতার মাধ্যমে নিজেকে আরও সুন্দর করা।",
    points: [
      "ভুল হওয়া মানুষের স্বাভাবিক স্বভাব; কিন্তু ভুল লুকিয়ে মিথ্যা বলা চরিত্রের বড় ত্রুটি।",
      "কোনো ভুল বা অবহেলা হয়ে থাকলে তা বাবা-মার কাছে সরল মনে স্বীকার করা ও সংশোধন করা।",
      "নিজের পড়ার টেবিল, বিছানা ও জামাকাপড় পরিপাটি রাখা চরিত্রকে সুশৃঙ্খল ও মার্জিত করে।"
    ],
    message: "সততা অত্যন্ত মূল্যবান গুণ, যা শুরু হয় নিজের সাথে সৎ থাকার মধ্য দিয়ে।",
    iconName: "CheckSquare",
    bgColor: "from-pink-900 to-pink-950 text-white",
    accentBg: "bg-pink-50 text-pink-700 border-pink-200"
  },
  {
    id: 9,
    numberBn: "৯",
    title: "চরিত্রের গৌরব ও প্রশংসাপত্র অর্জন",
    subTitle: "আমার পরিশ্রমের চমৎকার স্বীকৃতি ও মূল্যায়ন।",
    points: [
      "মাস শেষে ডায়েরির ডেটা রেফারেন্স অনুযায়ী সবচেয়ে বেশি 'টিক' পাওয়া শিক্ষার্থীদের দেয়া হবে বিশেষ পুরস্কার।",
      "উত্তম শিষ্টাচার ও অনুকরণীয় আচরণের জন্য স্কুল থেকে মিলবে আকর্ষণীয় রঙিন প্রশংসাপত্র (Certificate)।",
      "এই প্রশংসাপত্র কেবল একটি কাগজ নয়, এটি আমার জীবনের প্রথম ও শ্রেষ্ঠ নৈতিকতার স্বীকৃতি!"
    ],
    message: "আমার সৎ চরিত্রের আলো ছড়িয়ে পড়বে আমার পুরো পরিবার ও বিদ্যালয়ে!",
    iconName: "FileText",
    bgColor: "from-cyan-950 to-slate-950 text-white",
    accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  {
    id: 10,
    numberBn: "১০",
    title: "আমার সংকল্প: আমিই গড়বো আমার সোনালী দিন",
    subTitle: "আজ থেকেই শুরু হোক আমার সুন্দর স্বভাবের নতুন এক অধ্যায়।",
    points: [
      "আমি প্রতিদিন নিয়ম মেনে আমার ডায়েরি শিটটি স্বহস্তে সুন্দর করে পূরণ করব।",
      "আমি কখনো ফাঁকি দেব না, কারণ আমি আমার নিজেকে সবচেয়ে বেশি ভালোবাসেন ও সফল হতে চাই।",
      "ডি-লিকন মডেল স্কুলের গর্বিত শিক্ষার্থী হিসেবে আমি নৈতিকতায় হবো সবার সেরা!"
    ],
    message: "আজকের ছোট্ট নিয়মানুবর্তিতা, আগামী দিনের উজ্জ্বল ও প্রদীপ্ত ভবিষ্যৎ!",
    iconName: "CheckCircle",
    bgColor: "from-slate-900 to-slate-950 text-white",
    accentBg: "bg-slate-50 text-slate-700 border-slate-200"
  }
];

// 2. Presentation for Teachers (১০ স্লাইড)
export const slidesForTeachers: SlideItem[] = [
  {
    id: 1,
    numberBn: "১",
    title: "হোম-টাইম মনিটরিংয়ে শিক্ষকের নেতৃত্ব",
    subTitle: "ডি-লিকন মডেল স্কুল: আমাদের আন্তরিকতায় গড়ে উঠবে আদর্শ প্রজন্ম।",
    points: [
      "শিক্ষক কেবল পাঠ্যবইয়ের জ্ঞান দেন না, তিনি শিক্ষার্থীর নৈতিকতা ও আচরণের প্রধান স্থপতি।",
      "নতুন এআই-চালিত মনিটরিং ও প্রগতি শিট ব্যবহারে শিক্ষকের কার্যকর অংশগ্রহণ নিয়ে জরুরি দিকনির্দেশনা।"
    ],
    message: "আমাদের একটি সচেতন উদ্যোগ শিক্ষার্থীর জীবনকে চিরতরে বদলে দিতে পারে।",
    iconName: "Sparkles",
    bgColor: "from-indigo-900 to-indigo-950 text-white",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: 2,
    numberBn: "২",
    title: "শিক্ষক কেবল পরীক্ষক নন, তিনি একজন মেন্টর",
    subTitle: "শিক্ষার্থীর অন্তরে স্থায়ী ইতিবাচক প্রভাব ফেলার মহান দায়িত্ব।",
    points: [
      "শাস্তি বা ভয়ের বদলে নিবিড় মেন্টরিং ও মমত্ববোধের মাধ্যমে শিক্ষার্থীর আচরণ সংশোধন করা।",
      "শিক্ষার্থীর প্রতিটি ছোট ছোট ভালো অভ্যাস বা প্রচেষ্টাকে পরম স্নেহে স্বীকৃতি ও সাধুবাদ জানানো।",
      "শ্রেণিকক্ষে সবার সামনে ইতিবাচক আচরণগুলোর প্রশংসা করা যা অন্যদেরও সমানভাবে উদ্বুদ্ধ করবে।"
    ],
    message: "ভয় দেখিয়ে নয়, ভালোবাসা ও দূরদর্শিতা দিয়ে শিক্ষার্থীর মন জয় করুন।",
    iconName: "Heart",
    bgColor: "from-rose-900 to-rose-950 text-white",
    accentBg: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: 3,
    numberBn: "৩",
    title: "রুটিন শিট মনিটরিং: আমাদের মূল দায়িত্ব",
    subTitle: "হোমটাইম ট্র্যাকিংয়ের মাধ্যমে স্কুল ও পরিবারের মেলবন্ধন।",
    points: [
      "শিক্ষার্থীর বাড়িতে কাটানো অলস ও পড়ার সোনালী সময়গুলোর সুশৃঙ্খল তদারকি নিশ্চিত করা।",
      "শিক্ষার্থীদের আচরণগত ৪টি স্তম্ভ (সালাম, সততা, শৃঙ্খলা ও ডিজিটাল সচেতনতা) দৈনিক ক্লাসে পর্যবেক্ষণ করা।",
      "শিক্ষার্থীর প্রতিদিনের আচরণগত ডেটাবেস বিদ্যালয়ের শৃঙ্খলা ও বাৎসরিক মূল্যায়নের প্রধান হাতিয়ার।"
    ],
    message: "শ্রেণিকক্ষের পড়াশোনার চমৎকার ধারাবাহিকতা বাড়িতেও অক্ষুণ্ন রাখার মোক্ষম কৌশল।",
    iconName: "BookOpen",
    bgColor: "from-blue-900 to-blue-950 text-white",
    accentBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: 4,
    numberBn: "৪",
    title: "হাজিরা ও স্বাক্ষর বোর্ড: দৈনন্দিন রুটিন ওয়ার্ক",
    subTitle: "হাজিরা ডাকার পরপরই শিট স্বাক্ষর করার জাদুকরী ও সফল নিয়ম!",
    points: [
      "শ্রেণিশিক্ষক প্রতিদিন ক্লাসে হাজিরা (Attendance Call) সম্পন্ন করার পরপরই শিক্ষার্থীর রুটিন শিটটি হাতে নেবেন।",
      "পূর্ববর্তী দিনের কলামগুলো এবং অভিভাবকের স্বাক্ষরটি দ্রুত এক পলক দেখে নিয়ে সই (Sign) করে দেবেন।",
      "এই তাত্ক্ষণিক স্বাক্ষর শিক্ষার্থীদের মনে বিষয়টির প্রতি গভীর গুরুত্ব, বাধ্যবাধকতা ও নিয়মানুবর্তিতা তৈরি করে।"
    ],
    message: "হাজিরা ডাকার পরপরই স্বাক্ষর প্রদান—নিয়মানুবর্তিতা গড়ার সেরা নিয়ামক।",
    iconName: "CheckSquare",
    bgColor: "from-amber-900 to-yellow-950 text-white",
    accentBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: 5,
    numberBn: "৫",
    title: "ক্ষুদ্র স্বীকৃতি ও মৌখিক ভালোবাসার শক্তি",
    subTitle: "শিক্ষার্থীর মনে চিরস্থায়ী অনুপ্রেরণা ও উৎসাহের সঞ্চার করা।",
    points: [
      "স্বাক্ষর দেওয়ার সময় ভালো করা শিক্ষার্থীর দিকে তাকিয়ে মৃদু হাসুন এবং মুখে বলুন 'দারুণ করেছ!', 'সাবাশ!'",
      "যাদের কোনো দিন ঘাটতি রয়েছে বা অভিভাবকের সই নেই, তাদের ডেকে স্নেহপূর্ণ গলায় কারণ জিজ্ঞেস করুন।",
      "আপনার মুখের সামান্য দুটি প্রশংসার বাণী শিক্ষার্থীর সারা দিনের হোম-টাইম অভ্যাসকে দ্বিগুণ মজবুত করবে।"
    ],
    message: "শিক্ষকের মুখের একটি মিষ্টি প্রশংসাসূচক শব্দ শিক্ষার্থীর আত্মবিশ্বাসকে হিমালয়সম করে তুলতে পারে।",
    iconName: "Award",
    bgColor: "from-emerald-900 to-emerald-950 text-white",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: 6,
    numberBn: "৬",
    title: "শ্রেণিকক্ষে শিষ্টাচার ও নৈতিকতা ট্র্যাকিং",
    subTitle: "শিক্ষার্থীদের আচরণিক পরিবর্তন খুব কাছ থেকে পর্যবেক্ষণ ও পরিচর্যা।",
    points: [
      "শিক্ষার্থীরা বন্ধুদের সাথে কীরূপ ব্যবহার করছে এবং শিক্ষকদের সাথে সম্মান প্রদর্শন করছে কি না তা লক্ষ করুন।",
      "শ্রেণিকক্ষে সালাম দেওয়া, মার্জিত স্বরে কথা বলা এবং সততা বজায় রাখার গুরুত্ব নিয়মিত মনে করিয়ে দেওয়া।",
      "কোনো শিক্ষার্থীর মধ্যে আচরণের অবনতি ঘটলে রাগান্বিত না হয়ে একা ডেকে আন্তরিক কাউন্সেলিং করা।"
    ],
    message: "জ্ঞান অর্জনের পূর্বে শিক্ষার্থীর চরিত্রের শুদ্ধতা নিশ্চিত করা শিক্ষকের পরম ধর্ম।",
    iconName: "Activity",
    bgColor: "from-purple-900 to-purple-950 text-white",
    accentBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: 7,
    numberBn: "৭",
    title: "অভিভাবকের সাথে সেতুবন্ধন ও সংযোগ",
    subTitle: "শিক্ষক ও অভিভাবক মিলে তৈরি হবে একটি সফল টিম।",
    points: [
      "রুটিন শিটে অভিভাবকের দৈনিক সই করার মাধ্যমে বাড়িতে শিক্ষার্থীর পড়ার পরিবেশ সচল রয়েছে কি না তা জানা যায়।",
      "কোনো অভিভাবক নিয়মিত সই না করলে বা অসচেতন থাকলে ফোনে অথবা ডায়েরির নোটে মার্জিতভাবে যোগাযোগ করুন।",
      "যৌথ কাউন্সেলিং ও সচেতনতা বৃদ্ধির মাধ্যমে যেকোনো জেদী বা অমনোযোগী শিক্ষার্থীকে সঠিক ট্র্যাকে আনা সম্ভব।"
    ],
    message: "বিদ্যালয় ও পরিবারের সম্মিলিত ভালোবাসাই শিক্ষার্থীর চরিত্র গঠনের আসল রক্ষাকবচ।",
    iconName: "ArrowLeftRight",
    bgColor: "from-teal-900 to-teal-950 text-white",
    accentBg: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: 8,
    numberBn: "৮",
    title: "প্রগতি চার্ট ও সমন্বিত ডেটা বিশ্লেষণ",
    subTitle: "ডি৩-ভিত্তিক চার্ট ও পরিসংখ্যানের মাধ্যমে শিক্ষার্থীদের প্রগতি বোঝা।",
    points: [
      "শিক্ষার্থীর হোম-টাইম ডেটাবেস ও প্রগতি চার্টটি নিয়মিত পর্যবেক্ষণ করুন দুর্বলতা চিহ্নিত করতে।",
      "কোন সপ্তাহে বা বিষয়ে শিক্ষার্থীর প্রগতি কম হচ্ছে তা চার্টের মাধ্যমে সহজেই খুঁজে বের করা সম্ভব।",
      "এই বিজ্ঞানসম্মত বিশ্লেষণ শিক্ষককে তার পাঠদান ও ব্যক্তিভিত্তিক পরিচর্যা পরিকল্পনা তৈরিতে নিখুঁত সাহায্য করে।"
    ],
    message: "ডেটা ও মমতার সমন্বয়ে আধুনিক ও মানসম্মত শিক্ষাদান পদ্ধতি বাস্তবায়ন।",
    iconName: "Target",
    bgColor: "from-cyan-950 to-slate-950 text-white",
    accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  {
    id: 9,
    numberBn: "৯",
    title: "সাপ্তাহিক ও মাসিক পর্যালোচনা সেশন",
    subTitle: "নিয়মিত স্বীকৃতি, মোটিভেশন ও পুরস্কার প্রদানের মাধ্যমে শৃঙ্খলা ধরে রাখা।",
    points: [
      "সপ্তাহের শেষে বা মাসের শুরুতে ক্লাসে সর্বোচ্চ ভালো করা শিক্ষার্থীদের নাম ঘোষণা করে সবার সামনে করতালির ব্যবস্থা করা।",
      "স্কুল কর্তৃপক্ষের সহায়তায় চরিত্র প্রশংসাপত্র ও পুরস্কার বিতরণ অনুষ্ঠান পরিচালনা করা।",
      "এই আকর্ষণীয় মোটিভেশন শিক্ষার্থীদের মধ্যে ভালো কাজ করার এক প্রতিযোগিতামূলক আনন্দময় পরিবেশ গড়ে তোলে।"
    ],
    message: "স্বীকৃতি ও সম্মাননা শিক্ষার্থীর সুপ্ত প্রতিভাকে জাগ্রত ও বিকশিত করে।",
    iconName: "FileText",
    bgColor: "from-pink-900 to-pink-950 text-white",
    accentBg: "bg-pink-50 text-pink-700 border-pink-200"
  },
  {
    id: 10,
    numberBn: "১০",
    title: "আমাদের অঙ্গীকার: আমরাই গড়বো সোনার মানুষ",
    subTitle: "ডি-লিকন মডেল স্কুলের গর্বিত ও নিবেদিতপ্রাণ শিক্ষক সমাজ।",
    points: [
      "আমরা প্রতিদিন নিয়ম মেনে পরম মমতায় শিক্ষার্থীদের প্রগতি শিট পর্যবেক্ষণ ও স্বাক্ষর প্রদান করব।",
      "আমরা শিক্ষার্থীদের কেবল ভালো জিপিএ নয়, বরং একজন আদর্শ ও সৎ দেশপ্রেমিক মানুষ হিসেবে গড়ে তুলব।",
      "আমাদের নিরলস প্রচেষ্টা ও আন্তরিকতায় ডি-লিকন মডেল স্কুল নৈতিক শিক্ষায় দেশের সেরা মডেল হবে।"
    ],
    message: "আমাদের একটি সচেতন সিগনেচার বা স্বাক্ষর, শিক্ষার্থীর জীবন জয়ের অনন্য পাসপোর্ট!",
    iconName: "CheckCircle",
    bgColor: "from-slate-900 to-slate-950 text-white",
    accentBg: "bg-slate-50 text-slate-700 border-slate-200"
  }
];

// 3. Presentation for Parents (১০ স্লাইড - explaining the back of the sheet)
export const slidesForParents: SlideItem[] = [
  {
    id: 1,
    numberBn: "১",
    title: "সন্তানের ঘরোয়া শিক্ষার প্রধান কারিগর",
    subTitle: "অভিভাবক মতবিনিময় সভা: প্রগতি শিটের অপর পৃষ্ঠার নির্দেশিকা ব্যাখ্যা।",
    points: [
      "বিদ্যালয় সন্তানকে জ্ঞান দেয়, কিন্তু পরিবার তার জীবনের ভিত্তি ও চরিত্রের আসল সৌন্দর্য গড়ে তোলে।",
      "আপনার সন্তানের সুন্দর ও মার্জিত ভবিষ্যতের নিশ্চয়তায় প্রগতি শিটের পিছনের পৃষ্ঠার পূর্ণাঙ্গ পর্যালোচনা।"
    ],
    message: "শিক্ষার প্রথম বিদ্যাপীঠ আমাদের ঘর; আর প্রথম শিক্ষক হলেন প্রিয় পিতামাতা।",
    iconName: "Sparkles",
    bgColor: "from-indigo-900 to-indigo-950 text-white",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200"
  },
  {
    id: 2,
    numberBn: "২",
    title: "শিটের অপর পৃষ্ঠার নির্দেশিকা কী?",
    subTitle: "এটি সন্তানের সফল মানুষ হওয়ার নিখুঁত পারিবারিক সংবিধান।",
    points: [
      "শিটের অপর পৃষ্ঠার চমৎকার নির্দেশাবলি মূলত বাড়িতে শিশুর পড়ার আদর্শ পরিবেশ তৈরির রূপরেখা।",
      "সন্তান স্কুল থেকে ফেরার পর থেকে রাতে ঘুমানো পর্যন্ত সময়ের গঠনমূলক ব্যবহার নিশ্চিত করার গাইডলাইন।",
      "এটি কোনো অভিভাবকের ওপর বাড়তি বোঝা নয়, বরং সন্তানের সুন্দর আচরণের এক সহজ ও পরীক্ষিত ফর্মুলা।"
    ],
    message: "আসুন সন্তানের সুন্দর স্বভাবের স্বীকৃতি দিয়ে তাদের স্বপ্ন বাস্তবায়নে শামিল হই।",
    iconName: "FileText",
    bgColor: "from-blue-900 to-blue-950 text-white",
    accentBg: "bg-blue-50 text-blue-700 border-blue-200"
  },
  {
    id: 3,
    numberBn: "৩",
    title: "বাড়ির পড়ার আদর্শ পরিবেশ ও টেবিল",
    subTitle: "একগ্রতা ও গভীর মনোযোগ সৃষ্টির উপযুক্ত ঘরোয়া পরিবেশ।",
    points: [
      "সন্তানের জন্য একটি নির্দিষ্ট পড়ার টেবিল, আরামদায়ক বসার জায়গা ও পর্যাপ্ত আলোর ব্যবস্থা করা।",
      "টেবিলের আশেপাশে কোনো অপ্রয়োজনীয় আওয়াজ, টিভি বা মোবাইল ফোনের ব্যবহার সম্পূর্ণ বন্ধ রাখা।",
      "পড়ার ঘরটি সবসময় পরিষ্কার-পরিচ্ছন্ন ও সুশৃঙ্খল রাখা যা মনের মধ্যে স্বস্তি ও প্রফুল্লতা এনে দেয়।"
    ],
    message: "একটি সুশৃঙ্খল পড়ার টেবিল সন্তানের পড়ার মনোযোগ বাড়িয়ে দেয় বহুগুণ।",
    iconName: "BookOpen",
    bgColor: "from-amber-900 to-yellow-950 text-white",
    accentBg: "bg-amber-50 text-amber-700 border-amber-200"
  },
  {
    id: 4,
    numberBn: "৪",
    title: "সন্ধ্যার সোনালী সময়: বাদ মাগরিব জাদুকরী সময়",
    subTitle: "সন্তানের মেধা বিকাশে সন্ধ্যা থেকে রাত ৯টা নিশ্চিত পর্যবেক্ষণ।",
    points: [
      "বাদ মাগরিব থেকে রাত ৯টা পর্যন্ত সময়টি সন্তানের পড়ার জন্য অত্যন্ত গুরুত্বপূর্ণ ও সংবেদনশীল।",
      "এই সময়ে কোনো আত্মীয়ের বাড়ি যাওয়া, টিভির নাটক বা অতিরিক্ত বিনোদন থেকে সম্পূর্ণ বিরত থাকুন।",
      "সন্তান পড়ার টেবিলে একাগ্রতার সাথে হোমওয়ার্ক বা পূর্বের পড়া রিভিশন করছে কি না তা নিশ্চিত করুন।"
    ],
    message: "সন্ধ্যার সোনালী সময় অবহেলায় কাটালে সন্তানের পড়াশোনার ধারাবাহিকতা ভেঙে যায়।",
    iconName: "Clock",
    bgColor: "from-emerald-900 to-emerald-950 text-white",
    accentBg: "bg-emerald-50 text-emerald-700 border-emerald-200"
  },
  {
    id: 5,
    numberBn: "৫",
    title: "ভোরের বরকত ও সুস্বাস্থ্যের অনন্য অভ্যাস",
    subTitle: "খুব ভোরে ঘুম থেকে ওঠার অলৌকিক উপকারিতা।",
    points: [
      "সন্তানকে খুব ভোরে ঘুম থেকে উঠার অভ্যাস করান, যা তার শারীরিক ও মানসিক বিকাশকে দ্রুত ত্বরান্বিত করবে।",
      "ভোরে উঠে প্রার্থনা শেষ করার পর অন্তত ২ ঘণ্টা নিরবচ্ছিন্নভাবে পড়ার টেবিলে পড়াশোনা করতে দিন।",
      "ভোরের শান্ত ও কোলাহলমুক্ত পরিবেশ কঠিন বিষয়গুলো সহজে আয়ত্ত করতে অলৌকিক কাজ করে।"
    ],
    message: "ভোরে ওঠার অভ্যাস সন্তানকে করবে দীর্ঘজীবী, প্রখর মেধারী ও সুশৃঙ্খল।",
    iconName: "Activity",
    bgColor: "from-rose-900 to-rose-950 text-white",
    accentBg: "bg-rose-50 text-rose-700 border-rose-200"
  },
  {
    id: 6,
    numberBn: "৬",
    title: "চরিত্র ও নৈতিকতার ৪টি প্রধান স্তম্ভ",
    subTitle: "নির্দেশিকায় বর্ণিত সৎ স্বভাবের জাদুকরী ফর্মুলা।",
    points: [
      "১. শিষ্টাচার (সালাম): বাড়িতে প্রবেশের সাথে সাথেই হাসিমুখে বড়দের আগে আগে সালাম দেওয়ার অভ্যাস।",
      "২. সততা (সত্যবাদিতা): নিজের ভুল অকপটে স্বীকার করা এবং কখনো কোনো মিথ্যা বা লুকোচুরি না করা।",
      "৩. শৃঙ্খলা (গোছানো স্বভাব): নিজের কাপড়, বিছানা ও পড়ার টেবিল স্বহস্তে গুছিয়ে রাখার অভ্যাস।",
      "৪. ডিজিটাল সচেতনতা: পড়াশোনা বা প্রয়োজনীয় কাজের বাইরে সোশ্যাল মিডিয়া বা অযথা মোবাইল ফোন না চালানো।"
    ],
    message: "৪টি নৈতিক স্তম্ভের ওপর ভর করেই গড়ে উঠবে সন্তানের জীবনের শ্রেষ্ঠ চরিত্র।",
    iconName: "Award",
    bgColor: "from-purple-900 to-purple-950 text-white",
    accentBg: "bg-purple-50 text-purple-700 border-purple-200"
  },
  {
    id: 7,
    numberBn: "৭",
    title: "মোবাইল আসক্তি: আজকের সবচেয়ে বড় বিপদ",
    subTitle: "মোবাইল ফোনের নিয়ন্ত্রিত ও সচেতন ব্যবহার নিশ্চিত করা।",
    points: [
      "সন্তানের সামনে নিজেরা অতিরিক্ত মোবাইল ফোন চালানো বা সোশ্যাল মিডিয়া স্ক্রল করা থেকে বিরত থাকুন।",
      "পড়াশোনার সময় বা গভীর রাতে কোনো অবস্থাতেই সন্তানের হাতে মোবাইল ফোন বা ইন্টারনেট ডিভাইস দেবেন না।",
      "প্রযুক্তির অপব্যবহার সন্তানের একাগ্রতা, স্মৃতিশক্তি ও সৃজনশীলতা পুরোপুরি ধ্বংস করে দিতে পারে।"
    ],
    message: "সন্তানকে মোবাইল স্ক্রিনের কৃত্রিম জগৎ থেকে বের করে বাস্তব পৃথিবীর স্পর্শ দিন।",
    iconName: "Tablet",
    bgColor: "from-teal-900 to-teal-950 text-white",
    accentBg: "bg-teal-50 text-teal-700 border-teal-200"
  },
  {
    id: 8,
    numberBn: "৮",
    title: "অভিভাবকের দৈনিক স্বাক্ষর ও সযত্ন মূল্যায়ন",
    points: [
      "সন্তান প্রতিদিনের রুটিন ও কাজগুলো সঠিকভাবে সম্পন্ন করল কি না তা রাতে স্নেহের সাথে পর্যবেক্ষণ করুন।",
      "ডায়েরি শিটে সন্তানের টিক দেওয়া কলামগুলো এক পলক দেখে নিয়ে সযত্নে নিজের স্বাক্ষরটি প্রদান করুন।",
      "আপনার প্রতিদিনের স্বাক্ষর সন্তানের মধ্যে কাজগুলো সম্পন্ন করার গভীর আগ্রহ ও দায়িত্ববোধ তৈরি করে।"
    ],
    subTitle: "প্রতিদিনের ছোট্ট মূল্যায়ন, সন্তানের আত্মবিশ্বাস ও সফলতার বড় চালিকাশক্তি।",
    message: "আপনার একটি দৈনিক সিগনেচার সন্তানের নিয়মানুবর্তিতার সবচেয়ে বড় উৎসাহ!",
    iconName: "CheckSquare",
    bgColor: "from-pink-900 to-pink-950 text-white",
    accentBg: "bg-pink-50 text-pink-700 border-pink-200"
  },
  {
    id: 9,
    numberBn: "৯",
    title: "প্রশংসা ও সুন্দর আচরণের জাদুকরী স্বীকৃতি",
    subTitle: "ভালোবাসা ও প্রশংসার সুফল শাসন করার চেয়েও লক্ষ গুণ বেশি!",
    points: [
      "সন্তান কোনো কলাম বা লক্ষ্যপূরণে ভালো করলে তাকে জড়িয়ে ধরে কপালে চুমু খেয়ে বলুন 'আমি তোমাকে নিয়ে গর্বিত!'",
      "শাসন বা রাগের মাধ্যমে আচরণ পরিবর্তন কষ্টকর, কিন্তু ভালোবাসার প্রশ্রয় ও প্রশংসা দিয়ে তা অত্যন্ত সহজ।",
      "মাস শেষে ডায়েরির রেকর্ড অনুযায়ী সর্বোচ্চ অর্জনকারী শিক্ষার্থীদের স্কুল থেকে দেয়া হবে বিশেষ সার্টিফিকেট।"
    ],
    message: "প্রশংসিত সন্তান আত্মবিশ্বাসী হয় এবং বারবার ভালো কাজ করতে অনুপ্রাণিত বোধ করে।",
    iconName: "Heart",
    bgColor: "from-cyan-950 to-slate-950 text-white",
    accentBg: "bg-cyan-50 text-cyan-700 border-cyan-200"
  },
  {
    id: 10,
    numberBn: "১০",
    title: "অভিভাবক-শিক্ষক মেলবন্ধন: আসুন একযোগে কাজ করি",
    subTitle: "আমরা এবং বিদ্যালয় একই লক্ষ্যের সহযাত্রী।",
    points: [
      "বিদ্যালয় ও শিক্ষকদের ওপর পূর্ণ আস্থা রাখুন, যেকোনো বিষয়ে শিক্ষকদের সাথে মন খুলে খোলামেলা আলোচনা করুন।",
      "পারিবারিক শৃঙ্খলা ও বিদ্যালয়ের সুশৃঙ্খল তদারকির যৌথ প্রচেষ্টাই সন্তানের সোনালী ভবিষ্যৎ নিশ্চিত করবে।",
      "আসুন আমাদের সন্তানের সুন্দর স্বভাব ও আচরণ গঠনে ডি-লিকন মডেল স্কুলের এই অসাধারণ উদ্যোগ সফল করি।"
    ],
    message: "আজকের সযত্ন প্যারেন্টিং, আগামী দিনে দেশের সেরা সুনাগরিক গড়ে তোলার শ্রেষ্ঠ প্রতিশ্রুতি!",
    iconName: "CheckCircle",
    bgColor: "from-slate-900 to-slate-950 text-white",
    accentBg: "bg-slate-50 text-slate-700 border-slate-200"
  }
];

// 4. PowerPoint Generation AI Prompts (কপিযোগ্য অত্যন্ত প্রফেশনাল এআই প্রম্পটসমূহ)
export const studentPrompt = `**AI PowerPoint / Gamma Presentation Prompt (For Students Class 3-8)**

[ROLE] You are a highly creative PowerPoint Presentation and slide outline generator. Write the output in rich markdown format, including Slide Number, Slide Title, Visual/Graphic Recommendation, Slide Bullet Points, and Speaker Notes in motivating, easy-to-understand, child-friendly Bengali.

[CONTEXT] D-Licon Model School has distributed personalized A4 Home-Time monitoring sheets (containing student Name, Class, Roll) to students of Class 3 to Class 8. The goal is to motivate students to track their evening study, morning study, daily goals, prayers, and character pillars (manners, digital detox, cleanliness, truthfulness).

[INSTRUCTION] Create a high-impact, highly engaging 10-slide PowerPoint outline titled "আমার রঙিন দিন, আমার সুন্দর ভবিষ্যৎ" (My Colorful Day, My Bright Future) that makes students realize how they will benefit the most (maximum gain, rewards, self-confidence, zero exam fear) from completing this sheet honestly every day.

[TONE] Joyful, highly encouraging, playful, motivational, and hero-themed Bengali. Use metaphors like "Captain of my ship", "My colorful game".

[SLIDE OUTLINE MANDATE]
Slide 1: স্বাগতম ও শিরোনাম (Welcome & Hero Entrance)
Slide 2: হোম-টাইম ডায়েরি বা ট্র্যাকিং কী? (It's not a exam, it's a playful game)
Slide 3: দৈনিক লক্ষ্য (Daily Goal) লেখার ম্যাজিক (Small targets, big brain victory)
Slide 4: খেলার সময় খেলা, পড়ার সময় পড়া (Awesome balance of playground & study table)
Slide 5: সন্ধ্যার সোনালী সময় ও ভোরের বরকত (Secret golden study hours that make me super-smart)
Slide 6: সালাম ও আদবের সুপারপাওয়ার (How good manners make me the most popular student)
Slide 7: ডিজিটাল ডিটক্স (Ruling over the mobile phone, not being its slave)
Slide 8: সততা ও সরলতা (Admitting mistakes, self-care, keeping rooms tidy)
Slide 9: গৌরবময় পুরস্কার ও চরিত্র সার্টিফিকেট (The prestigious good character certificate & awards)
Slide 10: আমার সংকল্প ও সোনার জয়যাত্রা (I am the champion! Daily resolve)

Provide the full slides layout now in structured markdown.`;

export const teacherPrompt = `**AI PowerPoint / Gamma Presentation Prompt (For Teachers of D-Licon Model School)**

[ROLE] You are a professional educational presentation architect. Write the output in highly structured markdown format, including Slide Number, Slide Title, Visual Recommendation, Slide Bullet Points, and Professional Speaker Notes in formal, elegant, and action-oriented Bengali.

[CONTEXT] D-Licon Model School has printed and distributed A4 Home-Time Routine Monitoring Sheets to students of Classes 3-8. Teachers play a critical role in verifying, signing, and offering positive reinforcement to students.

[INSTRUCTION] Create a highly professional, motivating 10-slide PowerPoint presentation outline titled "হোম-টাইম মনিটরিং ও শিষ্টাচার গড়ায় শিক্ষকের ম্যাজিক" (The Teacher's Magic in Home-Time Monitoring & Etiquette). Focus heavily on the exact operational process: "হাজিরা ডাকার পরপরই শিটটি স্বাক্ষর করে দেওয়া" (Signing the monitoring sheets right after taking attendance/roll-call every single morning), using sweet words of praise (verbal micro-rewards), and avoiding fear/punishment.

[TONE] Formal, highly inspiring, leadership-oriented, and educational Bengali.

[SLIDE OUTLINE MANDATE]
Slide 1: স্বাগতম ও শিরোনাম: শিক্ষার্থীর জীবন গড়ার কারিগর (The Architects of Generation)
Slide 2: মেন্টরশিপ বনাম পরীক্ষক: ভালোবাসার শক্তি (Mentor vs. Examiner: Power of Love & Empathy)
Slide 3: হোম-টাইম ট্র্যাকিং শিটের মূল দর্শন ও লক্ষ্য (Philosophy of Home-Time Tracking)
Slide 4: হাজিরা ও সিগনেচার: প্রতিদিনের সঠিক কার্যপ্রণালী (Step-by-step: Roll Call and Immediate Sign magic)
Slide 5: মৌখিক মাইক্রো-রিওয়ার্ডস: স্নেহের হাসির জাদুকরী প্রভাব (Power of Sweet Praise & Verbal Micro-rewards)
Slide 6: শ্রেণিকক্ষে নৈতিকতা ও আচরণ পর্যবেক্ষণ (Tracking Manners & Adab in class)
Slide 7: অভিভাবকের সাথে সেতুবন্ধন ও যৌথ টিমিং (Parent-Teacher Collaboration Team)
Slide 8: ডি৩ প্রগতি চার্ট ও বৈজ্ঞানিক ডেটা বিশ্লেষণ (Analyzing D3 Progress chart & Weaknesses)
Slide 9: সাপ্তাহিক ও মাসিক স্বীকৃতি সেশন (Weekly & Monthly celebration & reward ceremonies)
Slide 10: শিক্ষক অঙ্গীকার: আমাদের একটি স্বাক্ষর, শিক্ষার্থীর বদলে যাওয়া জীবন (Teacher's Pledge: One signature, a transformed life)

Provide the full slides layout now in structured markdown.`;

export const parentPrompt = `**AI PowerPoint / Gamma Presentation Prompt (For Parents of D-Licon Model School)**

[ROLE] You are an expert parent counselor and child psychologist. Write the output in warm, deeply respectful, and highly motivating markdown format, including Slide Number, Slide Title, Visual/Graphic Recommendation, Slide Bullet Points, and Warm Speaker Notes in friendly, approachable, and clear Bengali.

[CONTEXT] D-Licon Model School has distributed personalized A4 Home-Time monitoring sheets (Classes 3-8). The front of the sheet is the daily student routine. The back of the sheet contains "অভিভাবক নির্দেশিকা" (Parent Guidelines).

[INSTRUCTION] Create a warm, highly persuasive 10-slide PowerPoint presentation outline titled "সন্তানের সফলতার নেপথ্য কারিগর: অভিভাবক নির্দেশিকা পর্যালোচনা" (The Secret Architects of Child Success: Reviewing the Parent Guidelines). The primary objective is to explain the guidelines on the back page clearly, including how to set up the home study environment, ensuring evening study (Maghrib to 9:00 PM), waking up early, enforcing the 4 character pillars (Salaam, Honesty, Tidiness, Digital Detox), and signing the sheets nightly with positive reinforcement.

[TONE] Empathetic, respectful, inspiring, collaborative, and caring Bengali.

[SLIDE OUTLINE MANDATE]
Slide 1: স্বাগতম ও শিরোনাম: সন্তানের ঘরোয়া বিদ্যাপীঠ (Home is the First School)
Slide 2: শিটের অপর পৃষ্ঠার অভিভাবক নির্দেশিকা কেন অত্যন্ত গুরুত্বপূর্ণ? (Understanding the Back of the Sheet)
Slide 3: আদর্শ পড়াশোনার ঘর ও সুশৃঙ্খল পড়ার টেবিল (Setting up the perfect home learning space)
Slide 4: সন্ধ্যার সোনালী সময়: বাদ মাগরিব থেকে রাত ৯টা নিশ্চিত তদারকি (Golden study hour)
Slide 5: ভোরের বরকত ও প্রার্থনা: সুস্বাস্থ্য ও ক্ষুরধার স্মৃতিশক্তি (Waking up early and morning study)
Slide 6: নৈতিকতার ৪টি প্রধান স্তম্ভ: সালাম, সততা, শৃঙ্খলা ও প্রযুক্তি সচেতনতা (The 4 Moral Pillars)
Slide 7: মোবাইল আসক্তি থেকে দূরে রাখা ও প্রযুক্তির সঠিক ব্যবহার (Guarding children from screen addiction)
Slide 8: প্রতিদিনের তদারকি ও অভিভাবকের দৈনিক সই করার গুরুত্ব (Nightly evaluation and signature)
Slide 9: প্রশংসা ও ভালোবাসার শাসন: বকাঝকার বদলে ইতিবাচক চাবিকাঠি (micro-praise & kiss of pride)
Slide 10: অভিভাবক-শিক্ষক মেলবন্ধন: সন্তানের সুন্দর জীবনের শ্রেষ্ঠ প্রতিজ্ঞা (Cohesive teamwork for a bright future)

Provide the full slides layout now in structured markdown.`;
