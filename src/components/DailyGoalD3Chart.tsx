import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface DayRow {
  date: number;
  col1Checked: boolean;
  col2Checked: boolean;
  col3Checked: boolean;
  col4Checked: boolean;
  col5Checked?: boolean;
  col6Checked?: boolean;
  eveningSubject: string;
  dailyNote: string;
  dailyGoal?: string;
  [key: string]: any;
}

interface WeeklyProgressItem {
  label: string;
  scored: number;
  maxScore: number;
  percentage: number;
}

interface DailyGoalD3ChartProps {
  rows: DayRow[];
  daysCount: number;
  weeklyProgress: WeeklyProgressItem[];
}

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBnNum(num: number | string): string {
  if (num === undefined || num === null) return "";
  return num
    .toString()
    .split("")
    .map(char => {
      const charCode = char.charCodeAt(0);
      if (charCode >= 48 && charCode <= 57) {
        return BENGALI_DIGITS[charCode - 48];
      }
      return char;
    })
    .join("");
}

export default function DailyGoalD3Chart({ rows, daysCount, weeklyProgress }: DailyGoalD3ChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Group days into weeks and calculate Daily Goal completion rates
  const chartData = React.useMemo(() => {
    const weeksList = [
      { label: "১ম সপ্তাহ", startDay: 1, endDay: 7 },
      { label: "২য় সপ্তাহ", startDay: 8, endDay: 14 },
      { label: "৩য় সপ্তাহ", startDay: 15, endDay: 21 },
      { label: "৪র্থ সপ্তাহ", startDay: 22, endDay: 28 },
      { label: "৫ম সপ্তাহ", startDay: 29, endDay: daysCount },
    ];

    return weeksList.map((wk, idx) => {
      // Find matching weekly habit progress
      const progressMatch = weeklyProgress.find(p => p.label === wk.label);
      const habitPercentage = progressMatch ? progressMatch.percentage : 0;

      // Filter rows belonging to this week
      const weekRows = rows.filter(r => r.date >= wk.startDay && r.date <= wk.endDay);
      const totalDays = weekRows.length;
      
      // Calculate daily goal completion
      const completedGoals = weekRows.filter(r => r.dailyGoal && r.dailyGoal.trim() !== "").length;
      const goalPercentage = totalDays > 0 ? Math.round((completedGoals / totalDays) * 100) : 0;

      return {
        weekLabel: wk.label,
        daysRange: `দিন ${toBnNum(wk.startDay)}-${toBnNum(Math.min(wk.endDay, daysCount))}`,
        goalPercentage,
        habitPercentage,
        completedGoals,
        totalDays,
      };
    }).filter(d => d.totalDays > 0);
  }, [rows, daysCount, weeklyProgress]);

  useEffect(() => {
    if (!svgRef.current) return;

    // Dimensions setup
    const margin = { top: 35, right: 25, bottom: 40, left: 45 };
    const width = 600 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    // Clear existing SVG children
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create main container group
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X scale for weeks
    const x0 = d3
      .scaleBand()
      .domain(chartData.map(d => d.weekLabel))
      .rangeRound([0, width])
      .paddingInner(0.25);

    // Inner X scale for side-by-side bars (Goal vs Habit)
    const keys = ["goalPercentage", "habitPercentage"];
    const x1 = d3
      .scaleBand()
      .domain(keys)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    // Y scale for percentage
    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .nice()
      .rangeRound([height, 0]);

    // Color definitions
    const colors = {
      goalPercentage: "#6366f1",  // Indigo
      habitPercentage: "#10b981"  // Emerald
    };

    // Y-Axis Gridlines
    g.append("g")
      .attr("class", "grid-lines")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-opacity", 0.5)
      .call(
        d3.axisLeft(y)
          .tickValues([0, 25, 50, 75, 100])
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .call(g => g.select(".domain").remove()); // Remove vertical line

    // Add bars grouped by week
    const weekGroups = g
      .selectAll(".week-group")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "week-group")
      .attr("transform", (d: any) => `translate(${x0(d.weekLabel)}, 0)`);

    // Draw bars
    keys.forEach((key) => {
      weekGroups
        .append("rect")
        .attr("x", x1(key) || 0)
        .attr("y", height) // Start from bottom for transition
        .attr("width", x1.bandwidth())
        .attr("height", 0) // Start with height 0
        .attr("fill", colors[key as keyof typeof colors])
        .attr("rx", 3.5)
        .attr("ry", 3.5)
        .attr("class", `bar-${key} transition-all duration-300 hover:opacity-85 cursor-pointer`)
        .transition()
        .duration(600)
        .delay((_, i) => i * 100)
        .attr("y", (d: any) => y(d[key as keyof typeof d] as number))
        .attr("height", (d: any) => height - y(d[key as keyof typeof d] as number));

      // Permanent text labels on top of each bar (great for print & readability)
      weekGroups
        .append("text")
        .attr("x", (x1(key) || 0) + x1.bandwidth() / 2)
        .attr("y", height) // Start at bottom for transition alignment
        .attr("text-anchor", "middle")
        .attr("font-family", "system-ui, sans-serif")
        .attr("font-size", "9px")
        .attr("font-weight", "800")
        .attr("fill", "#1e1b4b") // Indigo 950
        .text((d: any) => {
          const val = d[key as keyof typeof d] as number;
          return val > 0 ? `${toBnNum(val)}%` : "";
        })
        .transition()
        .duration(600)
        .delay((_, i) => i * 100)
        .attr("y", (d: any) => {
          const val = d[key as keyof typeof d] as number;
          const calculatedY = y(val) - 5;
          return calculatedY < 12 ? 12 : calculatedY; // Boundary protection
        });
    });

    // Custom Styled X-Axis
    const xAxis = d3.axisBottom(x0);
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .call(g => g.select(".domain").attr("stroke", "#475569").attr("stroke-width", 1.2))
      .selectAll("text")
      .attr("fill", "#0f172a")
      .attr("font-weight", "700")
      .attr("font-size", "11px")
      .attr("font-family", "inherit");

    // Add Days Range sublabel under each week label
    g.selectAll(".week-sublabel")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "week-sublabel")
      .attr("x", (d: any) => (x0(d.weekLabel) || 0) + x0.bandwidth() / 2)
      .attr("y", height + 32)
      .attr("text-anchor", "middle")
      .attr("fill", "#64748b")
      .attr("font-weight", "600")
      .attr("font-size", "9px")
      .text((d: any) => d.daysRange);

    // Custom Styled Y-Axis
    const yAxis = d3.axisLeft(y)
      .tickValues([0, 25, 50, 75, 100])
      .tickFormat(v => `${toBnNum(v as number)}%`);

    g.append("g")
      .call(yAxis)
      .call(g => g.select(".domain").remove()) // Remove vertical line
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-weight", "800")
      .attr("font-size", "9px")
      .attr("font-family", "inherit");

  }, [chartData]);

  return (
    <div className="w-full bg-white p-3.5 sm:p-5 border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between" id="d3-analytics-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs sm:text-[13px] font-black text-indigo-950 flex items-center gap-1.5 leading-tight">
            <span className="text-sm">🎯</span>
            <span>৫. দৈনিক লক্ষ্য অর্জন ও সামগ্রিক প্রগতি চার্ট (D3 Goal & Habit Alignment)</span>
          </h3>
          <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">
            সাপ্তাহিক প্রগতির নিরিখে শিক্ষার্থীর নিজের নির্ধারণ করা 'দৈনিক লক্ষ্য' সম্পূর্ণতার হার বিশ্লেষণ
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 text-[9px] font-extrabold text-slate-700 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-indigo-500 rounded-xs shadow-xs" />
            <span>দৈনিক লক্ষ্যপূরণ হার</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-xs shadow-xs" />
            <span>অভ্যাস প্রগতি শতকরা হার</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full bg-slate-50/40 border border-slate-200/60 rounded-lg p-2 flex items-center justify-center relative min-h-[220px]">
        {chartData.length === 0 ? (
          <div className="text-center text-xs text-slate-400 font-bold">
            পর্যালোচনা করার জন্য চলতি মাসে পর্যাপ্ত ডেটা নেই।
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-auto overflow-visible select-none max-w-full"
            viewBox="0 0 600 280"
            preserveAspectRatio="xMidYMid meet"
          />
        )}
      </div>

      {/* Analytics Insights Card */}
      <div className="mt-3.5 bg-indigo-50/15 border border-indigo-200/80 p-2.5 sm:p-3 rounded-lg text-[10.5px] leading-relaxed">
        <span className="font-extrabold text-indigo-900 flex items-center gap-1 mb-1">
          <span>💡</span>
          <span>ডি৩ চার্ট বিশ্লেষণ ও সমন্বিত পর্যালোচনা:</span>
        </span>
        <p className="text-slate-800 font-medium font-sans">
          এই সচিত্র বিশ্লেষণী চার্টটি শিক্ষার্থীর নিজের গৃহীত <span className="font-bold text-indigo-950">দৈনিক লক্ষ্য (Daily Goal)</span> লেখার প্রবণতা এবং একই সময়কালের <span className="font-bold text-emerald-800">চরিত্র ও অভ্যাস গঠন প্রগতির (Habit Progress)</span> চমৎকার ইতিবাচক সহসম্পর্ক প্রকাশ করে।{' '}
          {chartData.some(d => d.goalPercentage >= 70 && d.habitPercentage >= 70) ? (
            <span className="text-indigo-850 font-semibold">
              যখন শিক্ষার্থী নিজের দৈনিক সৎকর্ম বা পড়াশোনার সুনির্দিষ্ট লক্ষ্য ডায়েরিতে লিপিবদ্ধ করে, তখন তার আচরণগত প্রগতি ও রুটিন পালনের সাফল্য হার লক্ষণীয়ভাবে বেড়ে যায়! নিজের জীবনের মালিকানা নেওয়ার এই শৈশব অভ্যাস ধরে রাখতে অভিভাবকের সহচর্য অত্যন্ত কার্যকর।
            </span>
          ) : (
            <span className="text-slate-700">
              দৈনিক লক্ষ্য এবং সামগ্রিক সৎ অভ্যাস একে অপরের সাথে গভীরভাবে জড়িত। শিক্ষার্থীদের প্রতিদিনের ছোট্ট ছোট্ট উদ্দেশ্য নির্ধারণ ও আত্মমূল্যায়ন করার অভ্যাস তৈরি করতে তাদের ডায়েরির শেষ কলামটি নিয়মিত পূরণে অনুপ্রাণিত করুন।
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
