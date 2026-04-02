"use client";

import { useState } from "react";
import { Search, Download, Filter, Calendar } from "lucide-react";

interface DailyRecord {
  id: string;
  date: string;
  patientName: string;
  meal: string;
  sleep: string;
  mood: string;
  notes: string;
  reporter: string;
}

interface DailyReportsClientProps {
  initialRecords: DailyRecord[];
}

export default function DailyReportsClient({ initialRecords }: DailyReportsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = initialRecords.filter(rec => 
    rec.patientName.includes(searchTerm) || rec.reporter.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-white mb-1">
            식사 및 건강 전체 기록 <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md ml-2 uppercase tracking-tighter">Daily Health Log</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Aggregate monitoring of patient daily wellbeing</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text"
              placeholder="이용자 또는 기록자 검색..."
              className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-slate-700">
            <Download size={14} /> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">기록 일시</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">이용자명</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">식사 상태</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">수면 상태</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">기분</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">특이사항</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">기록자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-500 font-bold">
                    데이터가 존재하지 않습니다.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-600" />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{rec.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-white">{rec.patientName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        rec.meal === '양호' ? 'bg-green-500/10 text-green-500' : 
                        rec.meal === '결식' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {rec.meal}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        rec.sleep === '양호' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {rec.sleep}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-300">{rec.mood}</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <span className="text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{rec.notes}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                          {rec.reporter}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
