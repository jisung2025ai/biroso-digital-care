"use client";

import { useState, useEffect } from "react";
import ABCRecordForm from "@/components/ABCRecordForm";
import RemoteControlPanel from "@/components/RemoteControlPanel";
import PatientInfoTab from "@/components/PatientInfoTab";
import GuardianTab from "@/components/GuardianTab";
import StaffSettingsTab from "@/components/StaffSettingsTab";
import { Settings2, Bell, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useNotifications } from "@/components/NotificationProvider";
import DailyReportForm from "@/components/DailyReportForm";
import { getDashboardStats } from "@/lib/actions/behavior";

type TabType = "diary" | "patients" | "guardian" | "settings";

interface DashboardStats {
  totalPatients: number;
  totalRecordsToday: number;
  patientStats: {
    id: string;
    name: string;
    disabilityType: string;
    recordCount: number;
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const [showRemote, setShowRemote] = useState(false);
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("diary");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // AI 예측 알림 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification(
        "ai", 
        "⚠️ AI 도전행동 예측 알림", 
        "이용자A(자폐성장애)의 최근 심박수 및 활동량 패턴 분석 결과, 향후 30분 내 도전행동 발생 확률이 85%로 예측되었습니다. 선제적 중재(안정 사운드 재생 등)를 권장합니다."
      );
    }, 4000);
    return () => clearTimeout(timer);
  }, [addNotification]);

  // 실시간 통계 데이터 로드
  useEffect(() => {
    async function loadStats() {
      if (session?.user?.id) {
        try {
          const data = await getDashboardStats(session.user.id);
          setStats(data as any);
        } catch (err) {
          console.error("Failed to load dashboard stats:", err);
        } finally {
          setLoadingStats(false);
        }
      }
    }
    loadStats();
  }, [session?.user?.id]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f8fafc] text-slate-800 p-6 pb-24 font-sans relative shadow-2xl border-x border-slate-200">
      
      {/* Header Area */}
      <header className="flex justify-between items-start py-4 mb-4">
        <div className="flex flex-col">
          <h1 className="text-[28px] font-black tracking-tight text-slate-900 leading-tight">현장 기록 보드</h1>
          <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-tighter">
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(session?.user as any)?.role && ['ADMIN', 'STAFF'].includes((session?.user as any)?.role) && (
            <Link 
              href="/admin" 
              className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 hover:bg-black transition-all active:scale-95"
              title="관리자 센터로 이동"
            >
              <LayoutDashboard size={20} />
            </Link>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-black shadow-lg shadow-green-500/20 rotate-3">
            {session?.user?.name?.slice(0, 1) || "G"}
          </div>
        </div>
      </header>

      {/* ===== TAB CONTENT ===== */}

      {activeTab === "diary" && (
        <>
          <div className="bg-slate-900 rounded-3xl p-5 mb-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10 min-h-[160px]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">오늘의 주요 현황</h3>
                <div className="bg-green-500 text-[10px] font-black px-2 py-0.5 rounded-lg animate-pulse">LIVE</div>
             </div>

             {loadingStats ? (
                <div className="flex items-center justify-center h-20">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
             ) : (
                <div className="space-y-3">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/5">
                         <p className="text-[10px] text-slate-400">전체 담당</p>
                         <p className="text-xl font-black">{stats?.totalPatients || 0}<span className="text-xs font-normal ml-0.5 opacity-60">명</span></p>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10">
                         <p className="text-[10px] text-slate-400">오늘의 총 기록</p>
                         <p className="text-xl font-black text-rose-400">{stats?.totalRecordsToday || 0}<span className="text-xs font-normal ml-0.5 opacity-60 text-white">건</span></p>
                      </div>
                   </div>
                   
                   {/* 담당 이용자별 현황 리스트 */}
                   <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                      <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-tighter">Patient Activity Today</p>
                      <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                         {stats?.patientStats && stats.patientStats.length > 0 ? (
                           stats.patientStats.map(p => (
                             <div key={p.id} className="flex justify-between items-center text-xs">
                               <span className="text-slate-300">{p.name} ({p.disabilityType})</span>
                               <span className={`font-black ${p.recordCount > 0 ? 'text-rose-400' : 'text-slate-600'}`}>
                                 {p.recordCount}건
                               </span>
                             </div>
                           ))
                         ) : (
                           <p className="text-[10px] text-slate-600 italic">배정된 이용자가 없습니다.</p>
                         )}
                      </div>
                   </div>
                </div>
             )}
          </div>

          <section className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setShowDailyForm(true)}
                className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">🍽️</div>
                  <div>
                    <p className="font-bold text-slate-900">식사 및 건강 체크</p>
                    <p className="text-[11px] text-slate-400 font-medium">기본 관찰 사항 기록</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-500 group-hover:text-white transition-all">→</div>
              </button>
              <button className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">⚠️</div>
                  <div>
                    <p className="font-bold text-slate-900">도전행동 (ABC) 기록</p>
                    <p className="text-[11px] text-slate-400 font-medium">행동 분석 및 중재 기록</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white transition-all">→</div>
              </button>
            </div>
          </section>

          <ABCRecordForm />
        </>
      )}

      {activeTab === "patients" && <PatientInfoTab />}
      {activeTab === "guardian" && <GuardianTab />}
      {activeTab === "settings" && <StaffSettingsTab />}

      {/* Floating Action Button for Remote Control */}
      <button
        onClick={() => setShowRemote(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all z-40 border border-slate-700 ring-8 ring-white"
      >
        <Settings2 size={28} />
        {/* Unread Alert Indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-4 border-white rounded-full animate-bounce"></div>
      </button>

      {showRemote && <RemoteControlPanel onClose={() => setShowRemote(false)} />}
      {showDailyForm && <DailyReportForm onClose={() => setShowDailyForm(false)} />}

      {/* Bottom Nav Bar — Tab Switching */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[340px] bg-slate-900/95 backdrop-blur-xl rounded-[2rem] border border-slate-800 flex justify-around p-2 shadow-2xl z-30">
        <button onClick={() => setActiveTab("diary")} className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all ${activeTab === 'diary' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          <span className="text-xl mb-1">{activeTab === 'diary' ? '📘' : '📖'}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Journal</span>
        </button>
        <button onClick={() => setActiveTab("patients")} className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all ${activeTab === 'patients' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          <span className="text-xl mb-1">{activeTab === 'patients' ? '👥' : '👤'}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Patients</span>
        </button>
        <button onClick={() => setActiveTab("guardian")} className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all ${activeTab === 'guardian' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          <span className="text-xl mb-1">{activeTab === 'guardian' ? '📬' : '📧'}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Family</span>
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          <span className="text-xl mb-1">{activeTab === 'settings' ? '⚙️' : '🛠️'}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Setup</span>
        </button>
      </nav>
    </div>
  );
}
