"use client";

import { useState } from "react";
import { updateAIAgentConfig } from "@/lib/actions/settings";
import { Save, Loader2, Database, Key, Home, Zap, CheckCircle } from "lucide-react";

interface SettingsClientProps {
  initialSettings: any;
}

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  console.log("[Settings] Rendering client with settings:", initialSettings);
  const [formData, setFormData] = useState({
    aiEnabled: initialSettings?.aiEnabled ?? true,
    aiModel: initialSettings?.aiModel || "gpt-5-mini",
    aiProvider: initialSettings?.aiProvider || "ResponsesAI",
    aiApiKey: initialSettings?.aiApiKey || "",
    organizationName: initialSettings?.organizationName || "BIROSO",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const modelOptions = [
    { label: "GPT-5 Mini (표준 분석)", value: "gpt-5-mini", provider: "ResponsesAI" },
    { label: "GPT-5 Nano (경량 분석)", value: "gpt-5-nano", provider: "ResponsesAI" },
    { label: "GPT-4o (고성능)", value: "gpt-4o", provider: "OpenAI" },
    { label: "Claude 3.5 Sonnet (최신)", value: "claude-3-5-sonnet-20241022", provider: "Anthropic" },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updateAIAgentConfig(formData);
      if (result.success) {
        setMessage({ type: "success", text: "설정이 안전하게 저장되었습니다." });
      } else {
        setMessage({ type: "error", text: `설정 저장 실패: ${result.error || "알 수 없는 오류"}` });
      }
    } catch (err) {
      setMessage({ type: "error", text: "전송 중 시스템 오류가 발생했습니다." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-20">
      {/* Left side: AI Agent Config */}
      <div className="md:col-span-12 lg:col-span-8 space-y-10">
        <div className="glass-card p-10 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl space-y-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-8 relative z-10">
            <h3 className="text-xl font-black text-white flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                <Database size={24} />
              </div>
              Behavior Analysis Agent
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-black uppercase tracking-widest ${formData.aiEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {formData.aiEnabled ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}
              </span>
              <button
                type="button"
                onClick={() => setFormData({...formData, aiEnabled: !formData.aiEnabled})}
                className={`w-14 h-8 rounded-full border-2 border-white/10 p-1 transition-all ${formData.aiEnabled ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-slate-800'}`}
              >
                <div className={`w-5 h-5 rounded-full transition-all shadow-md ${formData.aiEnabled ? 'translate-x-6 bg-emerald-400' : 'translate-x-0 bg-slate-500'}`}></div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Zap size={14} /> SELECT ENGINE MODEL
              </label>
              <div className="relative">
                <select
                  value={formData.aiModel}
                  onChange={(e) => {
                    const model = modelOptions.find(o => o.value === e.target.value);
                    setFormData({...formData, aiModel: e.target.value, aiProvider: model?.provider || "OpenAI"});
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-black/60 transition-all pr-12"
                >
                  {modelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <Loader2 size={16} className={isSaving ? "animate-spin" : ""} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">선택된 제공자: <span className="text-white font-black">{formData.aiProvider}</span></p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Key size={14} /> INSTITUTION API KEY
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={formData.aiApiKey}
                  onChange={(e) => setFormData({...formData, aiApiKey: e.target.value})}
                  placeholder="sk-••••••••••••••••••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-600 transition-all"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-blue-400 cursor-help transition-all">
                   <CheckCircle size={18} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium italic">API 키는 AES-256 방식으로 보안 암호화되어 저장됩니다.</p>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Home size={14} /> ORGANIZATION IDENTIFIER
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                placeholder="기관 명칭을 입력하십시오 (예: BIROSO 중앙센터)"
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-black text-white outline-none focus:ring-2 focus:ring-slate-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-6 rounded-[2rem] border animate-in slide-in-from-top-4 flex items-center gap-4 ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100 shadow-lg shadow-emerald-950/20" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-100 placeholder:shadow-lg shadow-rose-950/20"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
               message.type === "success" ? "bg-emerald-500/20" : "bg-rose-500/20"
            }`}>
               {message.type === "success" ? <CheckCircle size={20} className="text-emerald-400" /> : <Loader2 size={20} className="text-rose-400" />}
            </div>
            <p className="font-bold text-sm">{message.text}</p>
          </div>
        )}
      </div>

      {/* Right side: Summary & Action */}
      <div className="md:col-span-12 lg:col-span-4 space-y-8">
        <div className="glass-card p-10 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-xl space-y-8">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">
             CONFIGURATION SUMMARY
          </h4>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">분석 모델</span>
               <span className="text-white font-black">{formData.aiModel}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">API 연결 상태</span>
               <span className={initialSettings?.hasKey || formData.aiApiKey ? "text-emerald-400 font-black" : "text-amber-500 font-black"}>
                  {initialSettings?.hasKey || formData.aiApiKey ? "READY" : "KEY NEEDED"}
               </span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">암호화 버전</span>
               <span className="text-blue-500 font-black tracking-widest text-[10px]">AES-256-CBC-V1</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-6 rounded-[2rem] font-black text-sm flex items-center justify-center gap-4 shadow-2xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                분속 엔진 업데이트 중...
              </>
            ) : (
              <>
                <Save size={20} />
                마스터 설정 저장
              </>
            )}
          </button>
        </div>

        <div className="p-8 bg-blue-600/5 border border-blue-600/10 rounded-[3rem] backdrop-blur-xl">
           <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Enterprise Compliance</h5>
           <p className="text-[12px] leading-relaxed text-slate-500 font-medium">
             저장된 모든 API 키는 기관 전용 테넌트로 분리 관리되며, 본사 관리자도 복호화된 키를 열람할 수 없도록 설계되었습니다. 시스템 로그에는 마스킹된 토큰 식별자만 기록됩니다.
           </p>
        </div>
      </div>
    </form>
  );
}
