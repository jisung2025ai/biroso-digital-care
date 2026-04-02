"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Zap, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface PatientStats {
  id: string;
  name: string;
  disabilityType: string;
  planCount: number;
  lastUpdated: string | null;
}

export default function PBSListClient({ initialStats }: { initialStats: PatientStats[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStats = initialStats.filter(s => 
    s.name.includes(searchTerm) || (s.disabilityType && s.disabilityType.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-yellow-400 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="이용자 성함 또는 장애유형으로 검색하십시오..."
          className="block w-full pl-12 pr-4 py-5 bg-[#1e293b] border border-slate-700 rounded-3xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] shadow-xl shadow-blue-900/20">
          <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">전체 이용자</p>
          <p className="text-3xl font-black text-white">{initialStats.length}명</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-[2rem] shadow-xl shadow-green-900/20">
          <p className="text-green-100 text-xs font-black uppercase tracking-widest mb-1">계획 수립 완료</p>
          <p className="text-3xl font-black text-white">{initialStats.filter(s => s.planCount > 0).length}명</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-[2rem] shadow-xl shadow-yellow-900/20">
          <p className="text-yellow-100 text-xs font-black uppercase tracking-widest mb-1">미수립 이용자</p>
          <p className="text-3xl font-black text-white">{initialStats.filter(s => s.planCount === 0).length}명</p>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStats.map((patient) => (
          <Link 
            key={patient.id}
            href={`/admin/pbs/${patient.id}`}
            className="group relative bg-[#1e293b] border border-slate-700/50 rounded-[2.5rem] p-8 transition-all hover:bg-[#2d3a4f] hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-400/5 shadow-lg flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-slate-800 p-4 rounded-2xl group-hover:bg-yellow-400 transition-colors">
                <Zap size={24} className="text-yellow-400 group-hover:text-slate-900 transition-colors" />
              </div>
              {patient.planCount > 0 ? (
                <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1 uppercase tracking-tighter">
                  <CheckCircle2 size={10} /> 수립됨
                </div>
              ) : (
                <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/20 flex items-center gap-1 uppercase tracking-tighter">
                  <AlertCircle size={10} /> 미수립
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-white mb-1 group-hover:text-yellow-400 transition-colors">{patient.name}</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">{patient.disabilityType || "장애유형 미지정"}</p>

            <div className="mt-auto pt-6 border-t border-slate-700/50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> 최근 업데이트
                </span>
                <span className="text-xs font-bold text-slate-300 mt-1">
                  {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleDateString() : "기록 없음"}
                </span>
              </div>
              <div className="bg-slate-800 p-2 rounded-xl group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        ))}
        {filteredStats.length === 0 && (
          <div className="col-span-full py-20 text-center bg-[#1e293b] rounded-[3rem] border-2 border-dashed border-slate-700">
            <p className="text-slate-500 font-black text-lg">검색 결과가 없습니다.</p>
            <p className="text-slate-600 text-sm font-medium mt-2">다른 이용자 성함으로 검색해 보십시오.</p>
          </div>
        )}
      </div>
    </div>
  );
}
