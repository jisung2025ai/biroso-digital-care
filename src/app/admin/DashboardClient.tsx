"use client";

import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { useNotifications } from "@/components/NotificationProvider";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#3b82f6", "#8b5cf6", "#64748b"];

interface DashboardProps {
  totalCount: number;
  avgDuration: number;
  mostFrequentType: string;
  behaviorData: { name: string; value: number }[];
  weeklyData: any[];
  dailyReportCount: number;
}

export default function DashboardClient({ totalCount, avgDuration, mostFrequentType, behaviorData, weeklyData, dailyReportCount }: DashboardProps) {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // 1. 데이터 수신 성공 알림
    const syncTimer = setTimeout(() => {
      addNotification("success", "DB 동기화 완료", "Prisma ORM을 통해 최신 1,000건의 도전행동 통계가 업데이트되었습니다.");
    }, 1000);

    // 2. 관리자용 SOS 상황 시뮬레이션 (데모용)
    const sosTimer = setTimeout(() => {
      addNotification(
        "sos", 
        "🚨 [긴급] SOS 현장 상황 발생", 
        "통합지원센터 3생활실에서 '현장복지사'가 SOS 신호를 발송했습니다. 즉시 상황을 확인하고 지원 인력을 배정하십시오."
      );
    }, 8000);

    return () => {
      clearTimeout(syncTimer);
      clearTimeout(sosTimer);
    };
  }, [addNotification]);

  return (
    <div className="space-y-6 fade-in p-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-1">
            통합 분석 대시보드 <span className="bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md ml-2 uppercase">Live Sync</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Real-time behavior analytics workstation</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-400 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all">
            <option>최근 7일</option>
            <option>최근 30일 데이터</option>
          </select>
          <button className="bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-500 hover:to-blue-600 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-xl shadow-green-500/10 active:scale-95">
            REPORTS EXPORT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900/50 flex flex-col p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl group hover:border-green-500/30 transition-all">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Total Records</span>
          <span className="text-4xl font-black text-white leading-none">{totalCount.toLocaleString()}<span className="text-sm font-medium text-slate-600 ml-1">pts</span></span>
          <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-green-500">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
             PRISMA LIVE SYNC
          </div>
        </div>
        <div className="bg-slate-900/50 flex flex-col p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl group hover:border-blue-500/30 transition-all">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Avg. Duration</span>
          <span className="text-4xl font-black text-white leading-none">{avgDuration}<span className="text-sm font-medium text-slate-600 ml-1">min</span></span>
          <span className="text-[10px] font-bold text-slate-600 mt-4 uppercase">T-test Baseline: 25.0</span>
        </div>
        <div className="bg-slate-900/50 flex flex-col p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl group hover:border-red-500/30 transition-all">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Top Risk Type</span>
          <span className="text-4xl font-black text-rose-500 leading-none">{mostFrequentType}</span>
          <span className="text-[10px] font-bold text-slate-600 mt-4 uppercase">Calculated by Rank-Sum</span>
        </div>
        <div className="bg-slate-900/50 flex flex-col p-6 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl group hover:border-amber-500/30 transition-all">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Daily Health Checks</span>
          <span className="text-4xl font-black text-amber-500 leading-none">{dailyReportCount.toLocaleString()}<span className="text-sm font-medium text-slate-600 ml-1">rec</span></span>
          <span className="text-[10px] font-bold text-slate-600 mt-4 uppercase">Meal & Mood Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Behavior Types */}
        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-md shadow-2xl">
          <h3 className="text-lg font-black text-slate-100 mb-8 uppercase tracking-tighter">Behavior Category Analysis</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={behaviorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={115}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {behaviorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(51, 65, 85, 0.5)", borderRadius: "16px", color: "#f8fafc", backdropFilter: "blur(12px)" }}
                  itemStyle={{ color: "#f8fafc", fontSize: "12px", fontWeight: "bold" }}
                  formatter={(value) => [`${value} cases`, "Detected"]}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "30px", fontSize: "11px", fontWeight: "bold", opacity: 0.7 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Weekly Trend */}
        <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-md shadow-2xl">
          <h3 className="text-lg font-black text-slate-100 mb-8 uppercase tracking-tighter">Temporal Dynamics (Weekly Trend)</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#475569", fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: "#475569", fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(51, 65, 85, 0.5)", borderRadius: "16px", color: "#f8fafc", backdropFilter: "blur(12px)" }}
                  cursor={{ fill: "rgba(51, 65, 85, 0.1)" }}
                />
                <Legend wrapperStyle={{ paddingTop: "30px", fontSize: "11px", fontWeight: "bold", opacity: 0.7 }} />
                <Bar dataKey="자해" stackId="a" fill="#ef4444" radius={[0, 0, 8, 8]} />
                <Bar dataKey="타해" stackId="a" fill="#f97316" />
                <Bar dataKey="물건파괴" stackId="a" fill="#eab308" />
                <Bar dataKey="도주" stackId="a" fill="#3b82f6" />
                <Bar dataKey="기타" stackId="a" fill="#64748b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
