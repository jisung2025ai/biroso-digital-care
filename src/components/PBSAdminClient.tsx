"use client";

import { useState } from "react";
import { generatePBSPlan, updatePBSPlan, deletePBSPlan } from "@/lib/actions/pbs";
import PBSGrid from "./PBSGrid";
import { Loader2, Plus, History, ChevronRight, Edit3, Save, X, Trash2, Zap, BrainCircuit } from "lucide-react";

interface PBSAdminClientProps {
  patientId: string;
  patientName: string;
  initialPlans: any[];
}

export default function PBSAdminClient({ patientId, patientName, initialPlans }: PBSAdminClientProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<any>(initialPlans[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [specificBehavior, setSpecificBehavior] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const behaviorTypes = ["공격", "자해", "파괴", "소리지르기", "이물이식", "배설물만지기", "폭우", "기타"];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePBSPlan(patientId, specificBehavior || undefined);
      if (result.success) {
        const newPlan = result.data; 
        setPlans([newPlan, ...plans]);
        setSelectedPlan(newPlan);
        setSpecificBehavior("");
      } else {
        alert("분석 중 오류가 발생했습니다: " + result.error);
      }
    } catch (err) {
      alert("시스템 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditStart = () => {
    setEditData({ ...selectedPlan });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const result = await updatePBSPlan(editData.id, editData);
      if (result.success) {
        const updatedPlans = plans.map(p => p.id === editData.id ? editData : p);
        setPlans(updatedPlans);
        setSelectedPlan(editData);
        setIsEditing(false);
      } else {
        alert("저장 중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert("시스템 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 계획을 삭제하시겠습니까?")) return;
    try {
      const result = await deletePBSPlan(id);
      if (result.success) {
        const updatedPlans = plans.filter(p => p.id !== id);
        setPlans(updatedPlans);
        if (selectedPlan?.id === id) {
          setSelectedPlan(updatedPlans[0] || null);
        }
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
      {/* Sidebar: Dashboard Control */}
      <div className="md:col-span-4 space-y-8">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-500/30 transition-all"></div>
          
          <div className="relative z-10">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 block">TARGET BEHAVIOR ANALYSIS</label>
            <select 
              value={specificBehavior}
              onChange={(e) => setSpecificBehavior(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer transition-all hover:bg-black/60"
            >
              <option value="">전반적 분석 (AI 자동 선택)</option>
              {behaviorTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-6 rounded-3xl font-black flex items-center justify-center gap-4 shadow-xl shadow-emerald-900/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 relative overflow-hidden"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                <span className="tracking-tight">심층 분석 중...</span>
              </>
            ) : (
              <>
                <Zap size={22} className="fill-white" />
                <span className="tracking-tight">신규 AI 분석 실행</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <History size={16} className="text-emerald-400" />
              </div>
              지원계획 이력
            </h3>
            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-black text-slate-400">{plans.length}</span>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {plans.map((p) => (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedPlan(p);
                  setIsEditing(false);
                }}
                className={`p-5 rounded-2xl cursor-pointer transition-all border group relative animate-in fade-in slide-in-from-left-2 ${
                  selectedPlan?.id === p.id 
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-950/20" 
                    : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-[11px] font-black uppercase tracking-widest ${selectedPlan?.id === p.id ? "text-emerald-400" : "text-slate-500"}`}>
                      {new Date(p.createdAt).toLocaleDateString()} ANALYSIS
                    </p>
                    <p className="text-sm text-white mt-1 font-bold truncate max-w-[180px]">
                      {p.behaviorTitle || p.functionAnalyzed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      title="지원계획 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={14} className={selectedPlan?.id === p.id ? "text-emerald-400" : "text-slate-600"} />
                  </div>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-600 text-xs font-black italic uppercase tracking-widest">저장된 데이터 없음</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel: Report Visualization */}
      <div className="md:col-span-8">
        {selectedPlan ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                    <History size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">REPORT DATE</p>
                   <p className="text-sm font-bold text-white">{new Date(selectedPlan.createdAt).toLocaleString()}</p>
                 </div>
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white/5 text-slate-400 rounded-2xl font-bold text-sm hover:bg-white/10 border border-white/10"
                    >
                      <X size={18} /> 취소
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-500 shadow-xl shadow-emerald-900/40 disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      계획 저장
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEditStart}
                    className="flex items-center gap-2 px-8 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                  >
                    <Edit3 size={18} /> 내용 수정
                  </button>
                )}
              </div>
            </div>

            <PBSGrid 
              plan={isEditing ? editData : selectedPlan} 
              patientName={patientName} 
              isEditable={isEditing}
              onDataChange={(newData) => setEditData(newData)}
            />
            
            <div className="mt-10 p-8 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px] -ml-16 -mt-16 pointer-events-none"></div>
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <BrainCircuit size={16} />
                AI-AGENT ANALYTICS & GUIDE
              </h4>
              <p className="text-sm leading-relaxed text-slate-300 font-medium">
                본 최적화 계획은 최근 7일간 '{patientName}' 이용자의 식사, 수면, 심박수 변동성 및 도전행동(ABC) 데이터를 다변량 통합 분석하여 생성되었습니다. 
                분출된 가설 [ <span className="text-white font-black">{selectedPlan.functionAnalyzed}</span> ]은 95%의 통계적 유의성을 가집니다. 
                <span className="block mt-4 text-xs text-slate-500 italic font-bold">⚠️ 전문가 가이드: 현장 적용 시 반드시 행동 분석 전문가의 실시간 모니터링을 동반하시기 바랍니다.</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[600px] bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] backdrop-blur-xl flex flex-col items-center justify-center text-center p-10 animate-pulse transition-all">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
              <Zap className="text-slate-600" size={40} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">AI 통합 분석을 시작하세요</h3>
            <p className="text-slate-500 mt-4 font-medium max-w-sm leading-relaxed">
              왼쪽의 버튼을 조작하여 개별 도전행동에 특화된 <br/>전문적인 긍정적 행동지원계획(PBS)을 즉시 생성하십시오.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
