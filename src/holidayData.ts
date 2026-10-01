export interface SchoolHoliday {
  id: string;
  title: string;
  category: "national" | "religious" | "vacation" | "institutional" | "other";
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD (inclusive)
  daysCount?: number;
  description?: string;
  isGovtHoliday?: boolean;
}

export const HOLIDAY_CATEGORY_MAP: Record<SchoolHoliday["category"], { label: string; color: string; bgBadge: string; textBadge: string; borderBadge: string }> = {
  national: {
    label: "জাতীয় দিবস",
    color: "emerald",
    bgBadge: "bg-emerald-100/90",
    textBadge: "text-emerald-900",
    borderBadge: "border-emerald-300"
  },
  religious: {
    label: "ধর্মীয় ছুটি",
    color: "amber",
    bgBadge: "bg-amber-100/90",
    textBadge: "text-amber-900",
    borderBadge: "border-amber-300"
  },
  vacation: {
    label: "বার্ষিক/ঋতুভিত্তিক অবকাশ",
    color: "sky",
    bgBadge: "bg-sky-100/90",
    textBadge: "text-sky-900",
    borderBadge: "border-sky-300"
  },
  institutional: {
    label: "প্রাতিষ্ঠানিক ছুটি",
    color: "purple",
    bgBadge: "bg-purple-100/90",
    textBadge: "text-purple-900",
    borderBadge: "border-purple-300"
  },
  other: {
    label: "অন্যান্য ছুটি",
    color: "rose",
    bgBadge: "bg-rose-100/90",
    textBadge: "text-rose-900",
    borderBadge: "border-rose-300"
  }
};

export const DEFAULT_BANGLADESH_SCHOOL_HOLIDAYS_2026: SchoolHoliday[] = [
  {
    id: "h-2026-02-21",
    title: "শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস",
    category: "national",
    startDate: "2026-02-21",
    endDate: "2026-02-21",
    daysCount: 1,
    description: "একুশে ফেব্রুয়ারি জাতীয় শোক ও শহীদ স্মরণ",
    isGovtHoliday: true
  },
  {
    id: "h-2026-03-17",
    title: "জাতির পিতার জন্মদিবস ও জাতীয় শিশু দিবস",
    category: "national",
    startDate: "2026-03-17",
    endDate: "2026-03-17",
    daysCount: 1,
    description: "জাতীয় শিশু দিবস ও বিশেষ সাংস্কৃতিক আলোচনা",
    isGovtHoliday: true
  },
  {
    id: "h-2026-03-20",
    title: "পবিত্র শবে কদর ও মাহে রমজান জুমাতুল বিদা",
    category: "religious",
    startDate: "2026-03-20",
    endDate: "2026-03-20",
    daysCount: 1,
    description: "পবিত্র শবে কদর ও রমজানের বিশেষ ইবাদত",
    isGovtHoliday: true
  },
  {
    id: "h-2026-03-26",
    title: "মহান স্বাধীনতা ও জাতীয় দিবস",
    category: "national",
    startDate: "2026-03-26",
    endDate: "2026-03-26",
    daysCount: 1,
    description: "স্বাধীনতা দিবস উদ্‌যাপন ও জাতীয় পতাকা উত্তোলন",
    isGovtHoliday: true
  },
  {
    id: "h-2026-03-29",
    title: "পবিত্র ঈদ-উল-ফিতর অবকাশ",
    category: "religious",
    startDate: "2026-03-29",
    endDate: "2026-04-03",
    daysCount: 6,
    description: "পবিত্র ঈদ-উল-ফিতর ও রমজান সমাপনী অবকাশ",
    isGovtHoliday: true
  },
  {
    id: "h-2026-04-14",
    title: "বাংলা নববর্ষ (পহেলা বৈশাখ)",
    category: "national",
    startDate: "2026-04-14",
    endDate: "2026-04-14",
    daysCount: 1,
    description: "নতুন বাংলা সনের আগমনী উৎসব ও বর্ণাঢ্য আয়োজন",
    isGovtHoliday: true
  },
  {
    id: "h-2026-05-01",
    title: "মহান মে দিবস (আন্তর্জাতিক শ্রমিক দিবস)",
    category: "national",
    startDate: "2026-05-01",
    endDate: "2026-05-01",
    daysCount: 1,
    description: "আন্তর্জাতিক শ্রমিক সংহতি দিবস",
    isGovtHoliday: true
  },
  {
    id: "h-2026-05-12",
    title: "শুভ বুদ্ধ পূর্ণিমা (বৈশাখী পূর্ণিমা)",
    category: "religious",
    startDate: "2026-05-12",
    endDate: "2026-05-12",
    daysCount: 1,
    description: "বৌদ্ধ সম্প্রদায়ের প্রধান ধর্মীয় উৎসব",
    isGovtHoliday: true
  },
  {
    id: "h-2026-05-27",
    title: "পবিত্র ঈদ-উল-আযহা ও গ্রীষ্মকালীন অবকাশ",
    category: "vacation",
    startDate: "2026-05-27",
    endDate: "2026-06-08",
    daysCount: 13,
    description: "পবিত্র ঈদ-উল-আযহা ও অর্ধ-বার্ষিক পরীক্ষার প্রস্তুতি অবকাশ",
    isGovtHoliday: true
  },
  {
    id: "h-2026-06-26",
    title: "পবিত্র আশুরা (১০ই মহররম)",
    category: "religious",
    startDate: "2026-06-26",
    endDate: "2026-06-26",
    daysCount: 1,
    description: "পবিত্র কারবালার স্মৃতিবাহী ঐতিহাসিক আশুরা দিবস",
    isGovtHoliday: true
  },
  {
    id: "h-2026-08-25",
    title: "পবিত্র ঈদে মিলাদুন্নবী (সা.)",
    category: "religious",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    daysCount: 1,
    description: "বিশ্বনবী হযরত মুহাম্মদ (সা.)-এর পবিত্র জন্ম ও ওফাত দিবস",
    isGovtHoliday: true
  },
  {
    id: "h-2026-09-04",
    title: "শুভ জন্মাষ্টমী",
    category: "religious",
    startDate: "2026-09-04",
    endDate: "2026-09-04",
    daysCount: 1,
    description: "হিন্দু সম্প্রদায়ের অন্যতম প্রধান ধর্মীয় উৎসব",
    isGovtHoliday: true
  },
  {
    id: "h-2026-10-18",
    title: "শারদীয় দুর্গাপূজা ও ফাতেহা-ই-ইয়াজদাহম",
    category: "religious",
    startDate: "2026-10-18",
    endDate: "2026-10-23",
    daysCount: 6,
    description: "শারদীয় দুর্গোৎসব ও বিজয়া দশমী",
    isGovtHoliday: true
  },
  {
    id: "h-2026-12-16",
    title: "মহান বিজয় দিবস",
    category: "national",
    startDate: "2026-12-16",
    endDate: "2026-12-16",
    daysCount: 1,
    description: "জাতীয় স্মৃতিসৌধে শ্রদ্ধা নিবেদন ও বীর মুক্তিযোদ্ধাদের সম্মাননা",
    isGovtHoliday: true
  },
  {
    id: "h-2026-12-20",
    title: "শীতকালীন অবকাশ ও বার্ষিক শিক্ষাবর্ষ সমাপনী",
    category: "vacation",
    startDate: "2026-12-20",
    endDate: "2026-12-31",
    daysCount: 12,
    description: "বার্ষিক পরীক্ষার ফলাফল প্রকাশ পরবর্তী শীতকালীন ছুটি",
    isGovtHoliday: true
  },
  {
    id: "h-2026-12-25",
    title: "যীশু খ্রীষ্টের জন্মোৎসব (বড়দিন)",
    category: "religious",
    startDate: "2026-12-25",
    endDate: "2026-12-25",
    daysCount: 1,
    description: "খ্রিষ্টধর্মাবলম্বীদের প্রধান উৎসব বড়দিন",
    isGovtHoliday: true
  }
];

// Helper to check if a specific date falls within a holiday
export function getHolidayForDate(
  holidays: SchoolHoliday[],
  year: number,
  monthIdx: number, // 0-indexed (0=January, 11=December)
  day: number
): SchoolHoliday | undefined {
  if (!holidays || holidays.length === 0) return undefined;

  const targetDateStr = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  for (const h of holidays) {
    if (!h.startDate) continue;

    const start = h.startDate.trim();
    const end = h.endDate ? h.endDate.trim() : start;

    // Direct comparison works with standard ISO format YYYY-MM-DD
    if (targetDateStr >= start && targetDateStr <= end) {
      return h;
    }

    // Also match recurring month-day if no year specified or single year agnostic
    if (start.length === 5) {
      // MM-DD
      const targetMMDD = `${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const endMMDD = end.length === 5 ? end : start;
      if (targetMMDD >= start && targetMMDD <= endMMDD) {
        return h;
      }
    }
  }

  return undefined;
}

// Convert date string from varied user input (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) to ISO YYYY-MM-DD
export function normalizeDateInput(raw: string, defaultYear = 2026): string {
  if (!raw) return "";
  const cleaned = raw.trim().replace(/[০-৯]/g, (d) => {
    const bn = "০১২৩৪৫৬৭৮৯";
    return String(bn.indexOf(d));
  });

  // Check YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(cleaned)) {
    const parts = cleaned.split("-");
    return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
  }

  // Check DD/MM
  const dmMatch = cleaned.match(/^(\d{1,2})[\/\-\.](\d{1,2})$/);
  if (dmMatch) {
    return `${defaultYear}-${dmMatch[2].padStart(2, "0")}-${dmMatch[1].padStart(2, "0")}`;
  }

  return cleaned;
}

// Smart CSV parser for uploaded holiday lists
export function parseHolidaysFromCSV(csvText: string): SchoolHoliday[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const results: SchoolHoliday[] = [];
  const startIndex = lines[0].toLowerCase().includes("date") || 
                     lines[0].includes("তারিখ") || 
                     lines[0].toLowerCase().includes("title") || 
                     lines[0].includes("ছুটি") ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    // Split by comma or semicolon or tab
    const parts = line.split(/[,;\t]/).map(p => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length < 2) continue;

    const rawStart = parts[0];
    const title = parts[1];
    if (!rawStart || !title) continue;

    const startDate = normalizeDateInput(rawStart);
    let endDate = startDate;
    let category: SchoolHoliday["category"] = "other";
    let description = "";

    if (parts.length >= 3) {
      const part2 = parts[2];
      // Check if part 2 is an end date or a category
      const testEndDate = normalizeDateInput(part2);
      if (/^\d{4}-\d{2}-\d{2}$/.test(testEndDate)) {
        endDate = testEndDate;
        if (parts.length >= 4) {
          category = mapCategoryStr(parts[3]);
        }
        if (parts.length >= 5) {
          description = parts.slice(4).join(", ");
        }
      } else {
        category = mapCategoryStr(part2);
        if (parts.length >= 4) {
          description = parts.slice(3).join(", ");
        }
      }
    }

    results.push({
      id: `h-upload-${Date.now()}-${i}`,
      title,
      category,
      startDate,
      endDate: endDate || startDate,
      description: description || undefined,
      isGovtHoliday: category === "national" || category === "religious"
    });
  }

  return results;
}

function mapCategoryStr(catStr: string): SchoolHoliday["category"] {
  const lower = (catStr || "").toLowerCase();
  if (lower.includes("জাতীয়") || lower.includes("national")) return "national";
  if (lower.includes("ধর্মীয়") || lower.includes("religious") || lower.includes("ঈদ") || lower.includes("পূজা")) return "religious";
  if (lower.includes("অবকাশ") || lower.includes("vacation") || lower.includes("গ্রীষ্ম") || lower.includes("শীত")) return "vacation";
  if (lower.includes("প্রতিষ্ঠান") || lower.includes("institutional") || lower.includes("স্কুল")) return "institutional";
  return "other";
}

// Plain text parser (e.g. pasted text from notification or circular)
export function parseHolidaysFromPlainText(text: string): SchoolHoliday[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: SchoolHoliday[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Formats like:
    // 2026-03-26: মহান স্বাধীনতা দিবস
    // 26/03/2026 - স্বাধীনতা দিবস (জাতীয়)
    const match = line.match(/^([0-9\-\/\.০-৯]+)\s*[:\-–=]\s*(.+)$/);
    if (match) {
      const rawDate = match[1];
      const rest = match[2].trim();
      const startDate = normalizeDateInput(rawDate);
      if (startDate) {
        let title = rest;
        let category: SchoolHoliday["category"] = "other";
        if (rest.includes("(") && rest.includes(")")) {
          const parenMatch = rest.match(/(.+)\((.+)\)/);
          if (parenMatch) {
            title = parenMatch[1].trim();
            category = mapCategoryStr(parenMatch[2]);
          }
        } else {
          category = mapCategoryStr(rest);
        }

        results.push({
          id: `h-text-${Date.now()}-${i}`,
          title,
          category,
          startDate,
          endDate: startDate,
          isGovtHoliday: true
        });
      }
    }
  }

  return results;
}

// Generate CSV export string for download
export function exportHolidaysToCSV(holidays: SchoolHoliday[]): string {
  const header = "তারিখ (YYYY-MM-DD),ছুটির নাম,শেষের তারিখ,ধরণ,বিবরণ\n";
  const rows = holidays.map(h => {
    const catLabel = HOLIDAY_CATEGORY_MAP[h.category]?.label || "অন্যান্য";
    const desc = (h.description || "").replace(/"/g, '""');
    const title = (h.title || "").replace(/"/g, '""');
    return `"${h.startDate}","${title}","${h.endDate || h.startDate}","${catLabel}","${desc}"`;
  });
  return header + rows.join("\n");
}
