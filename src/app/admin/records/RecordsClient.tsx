"use client";

import { useState, useTransition } from "react";
import { Search, Filter, Download, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function RecordsClient({ 
  initialRecords, 
  currentDate 
}: { 
  initialRecords: RecordItem[];
  currentDate: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 날짜 변경 핸들러
  const handleDateChange = (newDate: string) => {
    startTransition(() => {
      router.push(`/admin/records?date=${newDate}`, { scroll: false });
    });
  };

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
          <p className="text-slate-400 text-sm">
            {currentDate} 기준 현장에서 전송된 실시간 ABC 기록 리스트입니다.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* 날짜 선택 필터 */}
          <div className="relative group">
            <div className="absolute left-3 top-2.5 text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar size={18} />
            </div>
            <input 
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
            />
          </div>

          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <input 
              type="text" 
              placeholder="이용자 이름 또는 유형 검색" 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>

          {/* 내보내기 버튼 */}
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 active:scale-95 font-bold">
            <Download size={16} /> 
            <span className="hidden sm:inline">CSV 내보내기</span>
          </button>
        </div>
      </div>

      <div className={`bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl transition-opacity duration-300 ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700 tracking-widest">
              <tr>
                <th scope="col" className="px-6 py-4">기록 일시</th>
                <th scope="col" className="px-6 py-4">이용자명</th>
                <th scope="col" className="px-6 py-4">행동 유형 / 상세 기록</th>
                <th scope="col" className="px-6 py-4">상황 설명 (A)</th>
                <th scope="col" className="px-6 py-4">조치 사항 (C)</th>
                <th scope="col" className="px-6 py-4 text-center">강도 / 시간</th>
                <th scope="col" className="px-6 py-4 text-right">보고자</th>
                <th scope="col" className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="bg-slate-800/20 hover:bg-slate-700/40 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-400 whitespace-nowrap text-[11px] font-mono">{rec.date}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm">{rec.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-black
                          ${rec.type === '자해' || rec.type === 'SELF_HARM' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : ''}
                          ${rec.type === '타해' || rec.type === 'ATTACK' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : ''}
                          ${rec.type === '물건파괴' || rec.type === 'DESTROY' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : ''}
                          ${rec.type === '도주' || rec.type === 'ESCAPE' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
                          ${!['자해','타해','물건파괴','도주','SELF_HARM','ATTACK','DESTROY','ESCAPE'].includes(rec.type) ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : ''}
                        `}>
                          {rec.type}
                        </span>
                        {rec.detail && (
                          <p className="text-[11px] text-slate-300 line-clamp-2 max-w-[200px]">
                            {rec.detail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[150px] truncate text-slate-400 text-xs italic" title={rec.antecedent}>
                        {rec.antecedent}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[150px] truncate text-blue-400 text-xs font-bold" title={rec.consequence}>
                        {rec.consequence}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-xs whitespace-nowrap">
                      <span className="font-black text-slate-300">{rec.intensity}</span>
                      <span className="mx-1 text-slate-700">/</span>
                      <span className="text-slate-500">{rec.duration}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-white text-xs font-bold">{rec.reporter}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/pbs/${rec.patientId}`}
                        className="bg-slate-900 border border-slate-700 hover:border-blue-500/50 text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-black transition-all inline-flex group/btn"
                      >
                        <Zap size={10} className="fill-blue-500 text-blue-500 group-hover/btn:fill-yellow-400 group-hover/btn:text-yellow-400 transition-colors" />
                        PBS 분석
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <Calendar size={32} strokeWidth={1} />
                      <p className="text-sm italic">선택하신 날짜({currentDate})에 기록된 데이터가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-900/50">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {isPending ? "데이터 갱신 중..." : `TOTAL RECORDS: ${filteredRecords.length}`}
          </span>
        </div>
      </div>
    </div>
  );
}
