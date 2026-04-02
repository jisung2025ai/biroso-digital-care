"use client";

import { useState } from "react";
import { generatePBSPlan, updatePBSPlan, deletePBSPlan } from "@/lib/actions/pbs";
import PBSGrid from "./PBSGrid";
import { Loader2, Plus, History, ChevronRight, Edit3, Save, X, Trash2, Zap } from "lucide-react";

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
    <div className="grid grid-cols-12 gap-8">
      {/* Sidebar: History */}
      <div className="col-span-4 space-y-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">분석 대상 지정 (선택)</label>
            <select 
              value={specificBehavior}
              onChange={(e) => setSpecificBehavior(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전반적 분석 (AI 자동 선택)</option>
              {behaviorTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                분석 중...
              </>
            ) : (
              <>
                <Zap size={20} className="text-yellow-400" />
                신규 AI 분석 실행
              </>
            )}
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
            <History size={16} />
            지원계획 이력 ({plans.length})
          </h3>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {plans.map((p) => (
              <div 
                key={p.id}
                onClick={() => {
                  setSelectedPlan(p);
                  setIsEditing(false);
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all border group relative ${
                  selectedPlan?.id === p.id 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "bg-slate-50 border-transparent hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-black ${selectedPlan?.id === p.id ? "text-blue-700" : "text-slate-600"}`}>
                      {new Date(p.createdAt).toLocaleDateString()} 분석
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold italic truncate max-w-[120px]">
                      {p.behaviorTitle || p.functionAnalyzed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="지원계획 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={14} className={selectedPlan?.id === p.id ? "text-blue-400" : "text-slate-300"} />
                  </div>
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-xs font-bold">생성된 계획이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main: Plan View */}
      <div className="col-span-8">
        {selectedPlan ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="mb-4 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200"
                  >
                    <X size={16} /> 취소
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    저장하기
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEditStart}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-50 shadow-sm"
                >
                  <Edit3 size={16} /> 내용 수정
                </button>
              )}
            </div>

            <PBSGrid 
              plan={isEditing ? editData : selectedPlan} 
              patientName={patientName} 
              isEditable={isEditing}
              onDataChange={(newData) => setEditData(newData)}
            />
            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-3">AI 분석 근거 및 전문가 가이드</h4>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                본 계획은 최근 7일간의 '{patientName}' 이용자의 식사 상태, 수면 품질 및 도전행동(ABC) 기록을 융합 분석하여 도출되었습니다. 
                특히 주간 도전행동 발생 전후의 패턴을 통해 도출된 [ {selectedPlan.functionAnalyzed} ] 가설을 기반으로 중재 전략을 수립하였으니, 
                현장 적용 전 반드시 특수교사와의 최종 면담을 거치시기 바랍니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[600px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-10">
            <div className="bg-slate-100 p-6 rounded-full mb-6">
              <Plus className="text-slate-300" size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-800">분석을 시작하세요</h3>
            <p className="text-slate-400 mt-2 font-medium max-w-xs">
              왼쪽 버튼을 눌러 AI Agent에게 도전행동 및 일상 기록에 대한 통합 분석을 요청하십시오.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
