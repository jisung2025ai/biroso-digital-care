"use client";

import { useState } from "react";
import { Search, Filter, Download, Zap } from "lucide-react";
import Link from "next/link";

interface RecordItem {
  id: string;
  patientId: string;
  date: string;
  name: string;
  type: string;
  detail: string;
  intensity: string;
  duration: string;
  antecedent: string;
  consequence: string;
  reporter: string;
}

export default function RecordsClient({ initialRecords }: { initialRecords: RecordItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // 간이 검색 필터 (이용자명 또는 유형)
  const filteredRecords = initialRecords.filter(rec => 
    rec.name.includes(searchTerm) || rec.type.includes(searchTerm)
  );

  return (
    <div className="space-y-6 fade-in text-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            도전행동 전체 기록 <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full ml-2">Live DB</span>
          </h2>
          <p className="text-slate-400 text-sm">현장에서 DB로 전송된 실시간 ABC 기록 리스트입니다. (최신 30건 노출)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="이용자 이름 또는 유형 검색" 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>
          <button className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white text-sm p-2 rounded-lg transition-colors flex items-center gap-2">
            <Filter size={16} /> <span className="hidden sm:inline">필터</span>
          </button>
          <button className="bg-green-600 hover:bg-green-500 text-white text-sm p-2 rounded-lg transition-colors shadow-lg shadow-green-600/20 flex items-center gap-2">
            <Download size={16} /> <span className="hidden sm:inline">내보내기</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4">기록 일시</th>
                <th scope="col" className="px-6 py-4">이용자명</th>
                <th scope="col" className="px-6 py-4">행동 유형 / 상세 기록</th>
                <th scope="col" className="px-6 py-4">상황 설명 (A)</th>
                <th scope="col" className="px-6 py-4">조치 사항 (C)</th>
                <th scope="col" className="px-6 py-4">강도/시간</th>
                <th scope="col" className="px-6 py-4">보고자</th>
                <th scope="col" className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="border-b border-slate-700/50 bg-slate-800/20 hover:bg-slate-700/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-300 whitespace-nowrap text-xs">{rec.date}</td>
                  <td className="px-6 py-4 font-bold">{rec.name}</td>
                   <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                        ${rec.type === 'SELF_HARM' || rec.type === '자해' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
                        ${rec.type === 'ATTACK' || rec.type === '타해' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : ''}
                        ${rec.type === 'DESTROY' || rec.type === '물건파괴' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : ''}
                        ${rec.type === 'ESCAPE' || rec.type === '도주' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
                        ${!['자해','타해','물건파괴','도주','SELF_HARM','ATTACK','DESTROY','ESCAPE'].includes(rec.type) ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : ''}
                      `}>
                        {rec.type}
                      </span>
                      {rec.detail && (
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed max-w-[200px]">
                          {rec.detail}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[180px] truncate text-slate-400 text-xs italic" title={rec.antecedent}>
                      {rec.antecedent}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] truncate text-blue-400 text-xs font-medium" title={rec.consequence}>
                      {rec.consequence}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="font-black text-slate-300">{rec.intensity}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="text-slate-400">{rec.duration}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-xs font-bold">{rec.reporter}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/pbs/${rec.patientId}`}
                      className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black flex items-center justify-center gap-2 hover:bg-black transition-all inline-flex"
                    >
                      <Zap size={10} className="fill-yellow-400 text-yellow-400" />
                      PBS 분석
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">조회된 검색 결과가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/40">
          <span className="text-xs text-slate-500">Showing {filteredRecords.length} entries (Sorted by Newest)</span>
        </div>
      </div>
    </div>
  );
}
