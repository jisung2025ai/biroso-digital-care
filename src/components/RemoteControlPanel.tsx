"use client";

import { useState } from "react";
import { Lightbulb, Volume2, Lock, AlertTriangle, X, Loader2 } from "lucide-react";
import { useNotifications } from "./NotificationProvider";

export default function RemoteControlPanel({ onClose }: { onClose: () => void }) {
  const { addNotification } = useNotifications();
  const [lightsOn, setLightsOn] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [doorLocked, setDoorLocked] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [loadingDevice, setLoadingDevice] = useState<string | null>(null);

  const toggleDevice = (device: string, current: boolean, setter: (v: boolean) => void, label: string) => {
    setLoadingDevice(device);
    // IoT 통신 시뮬레이션 (600ms 지연)
    setTimeout(() => {
      setter(!current);
      addNotification("success", "기기 제어 완료", `${label} 상태가 ${!current ? 'On' : 'Off'}으로 변경되었습니다.`);
      setLoadingDevice(null);
    }, 600);
  };

  const handleSos = () => {
    setSosActive(true);
    addNotification("sos", "🚨 긴급 SOS 발송", "기관장 및 지역센터로 긴급 알림이 즉시 전송되었습니다. 현장 안전 확보에 유의하십시오.");
    
    // 시뮬레이션: 3초 후 관리자로부터의 확인 수신
    setTimeout(() => {
      addNotification("info", "센터 상황실 확인됨", "상황실에서 SOS를 확인했습니다. 인근 지원 인력이 출동 준비 중입니다.");
      setSosActive(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
      <div className="bg-white w-full max-w-md mx-auto rounded-t-[2.5rem] shadow-2xl p-8 relative animate-in slide-in-from-bottom-full duration-500 border-x border-t border-slate-200">
        
        {/* Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all hover:rotate-90 active:scale-90"
        >
          <X size={20} />
        </button>

        <h3 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
          리모트 컨트롤 <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-tighter">IoT Online</span>
        </h3>
        <p className="text-sm text-slate-500 mb-8 font-medium">
          자극 축소 및 안전 확보를 위해 주변 환경을 즉시 제어합니다.
        </p>

        <div className="grid grid-cols-2 gap-5 mb-8">
          {/* Lighting */}
          <button 
            onClick={() => toggleDevice("light", lightsOn, setLightsOn, "조명")}
            disabled={loadingDevice === "light"}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden active:scale-95
              ${lightsOn ? 'bg-yellow-50 border-yellow-200 text-yellow-700 shadow-xl shadow-yellow-500/10' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            {loadingDevice === "light" ? <Loader2 className="animate-spin" size={32} /> : <Lightbulb size={32} className={lightsOn ? "fill-yellow-400" : ""} />}
            <span className="font-bold text-sm">{lightsOn ? "조명 켬" : "조명 끔"}</span>
          </button>

          {/* Sound */}
          <button 
            onClick={() => toggleDevice("sound", musicPlaying, setMusicPlaying, "안정 사운드")}
            disabled={loadingDevice === "sound"}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden active:scale-95
              ${musicPlaying ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xl shadow-blue-500/10' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            {loadingDevice === "sound" ? <Loader2 className="animate-spin" size={32} /> : <Volume2 size={32} />}
            <div className="flex flex-col items-center text-center">
              <span className="font-bold text-sm">{musicPlaying ? "클래식 재생" : "사운드 Off"}</span>
            </div>
          </button>

          {/* Door Lock */}
          <button 
            onClick={() => toggleDevice("door", doorLocked, setDoorLocked, "출입문 잠금")}
            disabled={loadingDevice === "door"}
            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 col-span-2 relative overflow-hidden active:scale-95
              ${doorLocked ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xl shadow-indigo-500/10' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            {loadingDevice === "door" ? <Loader2 className="animate-spin" size={32} /> : <Lock size={32} className={doorLocked ? "fill-indigo-400" : ""} />}
            <span className="font-bold text-sm">{doorLocked ? "출입문 잠금 활성화 (강력)" : "출입문 잠금 해제 (도주방지)"}</span>
          </button>
        </div>

        {/* Emergency SOS */}
        <div className="mt-4 border-t border-slate-100 pt-8 mb-4">
          <button 
            onClick={handleSos}
            disabled={sosActive}
            className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-[0.98]
              ${sosActive 
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-600/40 hover:brightness-110'}`}
          >
            <AlertTriangle size={24} className={!sosActive ? "animate-pulse" : ""} />
            {sosActive ? "SOS 발송 프로세스 작동 중" : "위기대응 긴급 SOS"}
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
            위험 수위(심각성 고조) 도달 시 기관장 및 지역센터 상시 모니터링 데스크에 <br/> 즉시 시각/청각적 경고가 전달됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
