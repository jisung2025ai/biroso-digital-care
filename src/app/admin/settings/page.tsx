import { getAIAgentConfig } from "@/lib/actions/settings";
import SettingsClient from "./SettingsClient";
import { Settings, ShieldCheck } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  console.log("[AI Settings] Loading settings page...");
  
  let initialSettings = null;
  try {
    initialSettings = await getAIAgentConfig();
  } catch (err) {
    console.error("[AI Settings] Critical error fetching config:", err);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-green-500" size={32} />
            리포트 및 AI 설정
          </h2>
          <p className="text-slate-500 mt-2 font-medium">기관별 AI 모델 연동 및 API 보안 설정을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black text-green-400 uppercase tracking-widest">
          <ShieldCheck size={14} />
          Secure Mode Active
        </div>
      </header>

      {initialSettings ? (
        <SettingsClient initialSettings={initialSettings} />
      ) : (
        <div className="glass-card p-10 rounded-[2rem] border border-rose-500/30 bg-rose-500/5 text-rose-200">
          <p className="font-bold">데이터베이스 설정 정보를 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm opacity-60">관리자에게 문의하거나 잠시 후 다시 시도해 주세요.</p>
        </div>
      )}
    </div>
  );
}
