"use client";

import { CheckSquare, Square, Info, ShieldAlert, Cpu, Footprints } from "lucide-react";

interface PlanData {
  id?: string;
  behaviorTitle?: string;
  functionAnalyzed: string;
  antecedentStrategy: string;
  replacementSkill: string;
  consequenceStrategy: string;
  longTermSupport: string;
  interventions?: string;
}

interface PBSPlanProps {
  plan: PlanData;
  patientName: string;
  isEditable?: boolean;
  onDataChange?: (data: any) => void;
}

export default function PBSGrid({ plan, patientName, isEditable, onDataChange }: PBSPlanProps) {
  const functions = [
    { label: "관심추구", key: "Attention" },
    { label: "회피하기", key: "Escape" },
    { label: "획득하기", key: "Tangible" },
    { label: "자극추구", key: "Sensory" },
    { label: "놀이오락", key: "Play" },
  ];

  const analyzedFunctions = plan.functionAnalyzed || "";

  const handleChange = (field: string, value: string) => {
    if (onDataChange) {
      onDataChange({ ...plan, [field]: value });
    }
  };

  const toggleFunction = (key: string) => {
    if (!isEditable || !onDataChange) return;
    
    let current = analyzedFunctions.split(/[\s,]+/).filter(Boolean);
    const lowerKey = key.toLowerCase();
    
    if (current.some(c => c.toLowerCase() === lowerKey)) {
      current = current.filter(c => c.toLowerCase() !== lowerKey);
    } else {
      current.push(key);
    }
    
    onDataChange({ ...plan, functionAnalyzed: current.join(", ") });
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 text-white font-sans w-full rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
      {/* Table Header Section */}
      <div className="p-10 border-b border-white/5 bg-white/[0.02] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-1">긍정적 행동지원계획</h1>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Positive Behavior Support Plan</p>
        
        <div className="flex items-center gap-4 py-2 px-6 bg-white/5 rounded-2xl border border-white/10">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PATIENT ID</span>
           <span className="text-lg font-black text-white">{patientName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Left Section: Analysis Info */}
        <div className="md:col-span-3 border-r border-white/10 flex flex-col bg-black/20">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu size={12} /> TARGET BEHAVIOR
            </h3>
            <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20">
              {isEditable ? (
                <input 
                  type="text"
                  value={plan.behaviorTitle || ""}
                  onChange={(e) => handleChange("behaviorTitle", e.target.value)}
                  className="w-full bg-transparent text-center text-emerald-400 text-lg font-black border-none focus:ring-0 placeholder:text-emerald-900"
                  placeholder="행동 입력"
                />
              ) : (
                <p className="text-center text-emerald-400 text-xl font-black">
                  {plan.behaviorTitle || "행동 미지정"}
                </p>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={12} /> FUNCTION ANALYSIS
            </h3>
            <div className="space-y-3">
              {functions.map((f) => {
                const isSelected = analyzedFunctions.toLowerCase().includes(f.key.toLowerCase()) || 
                                  analyzedFunctions.toLowerCase().includes(f.label.toLowerCase());
                
                return (
                  <button
                    key={f.key}
                    disabled={!isEditable}
                    onClick={() => toggleFunction(f.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left group ${
                      isSelected 
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/30 font-black" 
                        : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10"
                    } ${isEditable ? "cursor-pointer" : "cursor-default text-xs"}`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                       isSelected ? "bg-white text-emerald-600" : "bg-black/30 text-slate-700 group-hover:text-slate-400"
                    }`}>
                      {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </div>
                    <span className="tracking-tight uppercase">{f.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Section: Strategies Grid */}
        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 divide-x divide-y divide-white/5 bg-white/[0.01]">
          {/* Strategy 1: Antecedent */}
          <div className="flex flex-col p-8 group">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Antecedent Strategy
            </h4>
            <div className="flex-grow">
              {isEditable ? (
                <textarea 
                  value={plan.antecedentStrategy}
                  onChange={(e) => handleChange("antecedentStrategy", e.target.value)}
                  className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed text-slate-300 focus:ring-2 focus:ring-emerald-500/50 resize-none custom-scrollbar"
                  placeholder="선행사건 중재 전략 입력..."
                />
              ) : (
                <div className="text-[13px] leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                  {plan.antecedentStrategy}
                </div>
              )}
            </div>
          </div>

          {/* Strategy 2: Replacement Skill */}
          <div className="flex flex-col p-8 bg-emerald-500/[0.03]">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              Replacement Skill
            </h4>
            <div className="flex-grow">
              {isEditable ? (
                <textarea 
                  value={plan.replacementSkill}
                  onChange={(e) => handleChange("replacementSkill", e.target.value)}
                  className="w-full h-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-sm leading-relaxed text-emerald-100 focus:ring-2 focus:ring-emerald-500/50 resize-none custom-scrollbar"
                />
              ) : (
                <div className="text-[13px] leading-relaxed text-emerald-100 font-black whitespace-pre-wrap">
                  {plan.replacementSkill}
                </div>
              )}
            </div>
          </div>

          {/* Strategy 3: Consequence */}
          <div className="flex flex-col p-8">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
              Consequence Strategy
            </h4>
            <div className="flex-grow">
              {isEditable ? (
                <textarea 
                  value={plan.consequenceStrategy}
                  onChange={(e) => handleChange("consequenceStrategy", e.target.value)}
                  className="w-full h-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed text-slate-300 focus:ring-2 focus:ring-emerald-500/50 resize-none custom-scrollbar"
                />
              ) : (
                <div className="text-[13px] leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                  {plan.consequenceStrategy}
                </div>
              )}
            </div>
          </div>

          {/* Strategy 4: Long-term */}
          <div className="flex flex-col p-8 bg-blue-600/[0.03]">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Footprints size={12} /> Long-term Support
            </h4>
            <div className="flex-grow">
              {isEditable ? (
                <textarea 
                  value={plan.longTermSupport}
                  onChange={(e) => handleChange("longTermSupport", e.target.value)}
                  className="w-full h-full bg-blue-600/5 border border-blue-600/20 rounded-2xl p-5 text-sm leading-relaxed text-blue-100 focus:ring-2 focus:ring-emerald-500/50 italic resize-none custom-scrollbar"
                />
              ) : (
                <div className="text-[13px] leading-relaxed text-blue-200 font-medium italic whitespace-pre-wrap">
                  {plan.longTermSupport}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strategy: Crisis Management */}
      <div className="border-t border-white/10 bg-black/40 p-10">
        <div className="flex flex-col md:flex-row gap-10 items-center">
           <div className="md:w-1/4">
              <div className="flex items-center gap-3 mb-2">
                 <ShieldAlert className="text-rose-500" size={24} />
                 <h3 className="text-lg font-black text-white leading-tight uppercase tracking-widest italic">
                    Critical<br/>Management
                 </h3>
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">위기관리계획 및 연계방안</p>
           </div>
           
           <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10 flex gap-4 transition-all hover:bg-white/5">
                 <span className="text-rose-500 font-black text-lg leading-none">01</span>
                 <p className="text-sm font-bold text-slate-400 leading-relaxed">
                   위해(타해, 자해 등) 발생 시 즉시 활동을 중단하고 <span className="text-white">안전 공간으로 분리</span>하며, 특수교사가 1차 개입한다.
                 </p>
              </div>
              <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10 flex gap-4 transition-all hover:bg-white/5">
                 <span className="text-rose-500 font-black text-lg leading-none">02</span>
                 <p className="text-sm font-bold text-slate-400 leading-relaxed">
                   원내 지원인력은 일관된 방식으로 개입하며, 진정되지 않을 경우 <span className="text-white">보호자에게 즉각 연락하여 귀가 조치</span>한다.
                 </p>
              </div>
           </div>
        </div>

        {plan.interventions && (
          <div className="mt-8 p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
               &ldquo;{plan.interventions}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
