"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "./NotificationProvider";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settings";
import { 
  Bell, 
  Moon, 
  ShieldCheck, 
  Hospital, 
  LogOut, 
  ChevronRight, 
  Award, 
  Settings2,
  Info
} from "lucide-react";

export default function StaffSettingsTab() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  
  // Settings States
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Settings from DB on Mount
  useEffect(() => {
    async function loadSettings() {
      if (session?.user?.id) {
        const settings = await getUserSettings(session.user.id);
        setNotifEnabled(settings.notificationsEnabled);
        setDarkMode(settings.darkMode);
        setLoading(false);
      }
    }
    loadSettings();
  }, [session]);

  const handleToggleNotif = async () => {
    const newVal = !notifEnabled;
    setNotifEnabled(newVal);
    
    if (session?.user?.id) {
      await updateUserSettings(session.user.id, { notificationsEnabled: newVal });
      addNotification(
        "success", 
        "영구 저장 완료", 
        `AI 예측 알림 설정이 DB에 기록되었습니다. (${newVal ? 'on' : 'off'})`
      );
    }
  };

  const handleToggleDark = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    
    if (session?.user?.id) {
      await updateUserSettings(session.user.id, { darkMode: newVal });
      addNotification(
        "ai", 
        "개인화 테마 저장", 
        "사용자 시력 보호 설정이 계정에 동기화되었습니다."
      );
    }
  };

  const handleInfoClick = (title: string) => {
    addNotification(
      "success", 
      `상세 정보 : ${title}`, 
      "해당 기능에 대한 상세 관리 페이지로 연결 중입니다."
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          환경 설정 <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">System Setup</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">개인화된 작업 환경을 구축합니다.</p>
      </div>

      <div className="space-y-4">
        {/* Profile Card High-End */}
        <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-white/10 relative">
              {session?.user?.name?.slice(0, 1) || "G"}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] shadow-lg">⭐</div>
            </div>
            <div>
              <p className="font-black text-lg flex items-center gap-1.5">
                {session?.user?.name || "사용자"}
                <span className="text-[9px] bg-white/20 text-white/80 px-2 py-0.5 rounded-md font-bold uppercase">Senior Staff</span>
              </p>
              <p className="text-xs text-slate-400 font-medium">통합지원센터 · No. 70291</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">XP</p>
              <p className="text-sm font-black">1.2k</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Care</p>
              <p className="text-sm font-black">98%</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Rank</p>
              <p className="text-sm font-black">Top 5</p>
            </div>
          </div>
        </div>

        {/* Action Menu List */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden divide-y divide-slate-50">
          
          {/* Notification Toggle */}
          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all ${notifEnabled ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-300'}`}>
                <Bell size={18} fill={notifEnabled ? "currentColor" : "none"} strokeWidth={notifEnabled ? 2.5 : 2} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">AI 예측 알림</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time AI Prediction</p>
              </div>
            </div>
            <button 
              onClick={handleToggleNotif}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${notifEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${notifEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all ${darkMode ? 'bg-slate-900 text-amber-300' : 'bg-orange-50 text-orange-500'}`}>
                <Moon size={18} fill={darkMode ? "currentColor" : "none"} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">환경 시력 보호</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Eye Comfort (DarkMode)</p>
              </div>
            </div>
            <button 
              onClick={handleToggleDark}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${darkMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <button 
            onClick={() => handleInfoClick("소속 기관 정보")}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
                <Hospital size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">소속 기관 (Broso Center)</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Regional Information</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-500 transition-all" />
          </button>

          <button 
            onClick={() => handleInfoClick("사용 가이드")}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Award size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800">기록 배지 정보</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gamification Details</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-amber-500 transition-all" />
          </button>

        </div>

        {/* Secondary Menu */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 p-2 overflow-hidden">
           <button 
             onClick={() => handleInfoClick("버전 정보")}
             className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
           >
             <div className="flex items-center gap-2">
               <Info size={14} />
               <span>시스템 버전 v1.2.0 (Alpha Build)</span>
             </div>
             <ChevronRight size={14} />
           </button>
        </div>

        {/* Global Action: LogOut */}
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full p-5 bg-white text-rose-500 rounded-[2rem] border-2 border-rose-50 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-200/20 hover:bg-rose-50/50 hover:border-rose-100 hover:scale-[0.98] transition-all"
        >
          <LogOut size={16} />
          Terminal Session LogOut
        </button>

      </div>
    </div>
  );
}
