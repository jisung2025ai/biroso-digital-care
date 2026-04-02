"use client";

import { CheckSquare, Square } from "lucide-react";

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
    
    // 콤마나 공백으로 구분된 문자열 처리
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
    <div className="bg-white border-2 border-slate-900 text-slate-900 font-sans max-w-5xl mx-auto my-8 shadow-2xl">
      <div className="border-b-2 border-slate-900 p-6 text-center bg-slate-50 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">이용자 성명</span>
          <span className="text-xl font-black text-slate-900 border-b-2 border-slate-900">{patientName}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase">긍정적행동지원계획</h1>
        <p className="text-sm font-bold mt-1 text-slate-500 uppercase tracking-widest">Positive Behavior Support Plan</p>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-12 border-b-2 border-slate-900">
        {/* Left Column: Function Analysis */}
        <div className="col-span-3 border-r-2 border-slate-900 divide-y-2 divide-slate-900">
          <div className="p-4 bg-slate-100 flex items-center justify-center font-black h-16 text-center text-xs leading-tight">분석 대상<br/>도전행동</div>
          <div className="p-4 bg-white flex items-center justify-center font-black h-16">
            {isEditable ? (
              <input 
                type="text"
                value={plan.behaviorTitle || ""}
                onChange={(e) => handleChange("behaviorTitle", e.target.value)}
                className="w-full h-full text-center text-blue-700 text-lg font-black border-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              />
            ) : (
              <span className="text-blue-700 text-lg">{plan.behaviorTitle || "행동 미지정"}</span>
            )}
          </div>
          <div className="p-4 bg-slate-100 flex items-center justify-center font-black h-12">기능분석</div>
          <div className="p-4 space-y-3 bg-white min-h-[300px]">
            {functions.map((f) => {
              const isSelected = analyzedFunctions.toLowerCase().includes(f.key.toLowerCase()) || 
                                analyzedFunctions.toLowerCase().includes(f.label.toLowerCase());
              
              return (
                <button
                  key={f.key}
                  disabled={!isEditable}
                  onClick={() => toggleFunction(f.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 text-left ${
                    isSelected 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20" 
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
                  } ${isEditable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {isSelected ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                  <span className="text-[13px] font-black tracking-tight">
                    {f.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Central columns: Strategies */}
        <div className="col-span-9 grid grid-cols-4 divide-x-2 divide-slate-900 overflow-hidden">
          {/* Column 1: Antecedent */}
          <div className="flex flex-col h-full">
            <div className="p-4 bg-slate-100 flex items-center justify-center font-black h-16 border-b-2 border-slate-900 text-center text-xs">
              선행사건 중재
            </div>
            <div className="flex-grow bg-white">
              {isEditable ? (
                <textarea 
                  value={plan.antecedentStrategy}
                  onChange={(e) => handleChange("antecedentStrategy", e.target.value)}
                  className="w-full h-full p-4 text-sm leading-relaxed border-none focus:ring-2 focus:ring-blue-500 font-medium scrollbar-hide resize-none"
                />
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {plan.antecedentStrategy}
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Replacement Skill */}
          <div className="flex flex-col h-full text-blue-800">
            <div className="p-4 bg-blue-100/50 flex items-center justify-center font-black h-16 border-b-2 border-slate-900 text-center text-xs">
              대체기술 교수
            </div>
            <div className="flex-grow bg-blue-50/30">
              {isEditable ? (
                <textarea 
                  value={plan.replacementSkill}
                  onChange={(e) => handleChange("replacementSkill", e.target.value)}
                  className="w-full h-full p-4 text-sm leading-relaxed border-none focus:ring-2 focus:ring-blue-500 bg-transparent font-medium scrollbar-hide resize-none"
                />
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {plan.replacementSkill}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Consequence */}
          <div className="flex flex-col h-full">
            <div className="p-4 bg-slate-100 flex items-center justify-center font-black h-16 border-b-2 border-slate-900 text-center text-xs">
              후속결과 중재
            </div>
            <div className="flex-grow bg-white">
              {isEditable ? (
                <textarea 
                  value={plan.consequenceStrategy}
                  onChange={(e) => handleChange("consequenceStrategy", e.target.value)}
                  className="w-full h-full p-4 text-sm leading-relaxed border-none focus:ring-2 focus:ring-blue-500 font-medium scrollbar-hide resize-none"
                />
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {plan.consequenceStrategy}
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Long-term Support */}
          <div className="flex flex-col h-full">
            <div className="p-4 bg-slate-100 flex items-center justify-center font-black h-16 border-b-2 border-slate-900 text-center text-xs">
              장기적인 지원
            </div>
            <div className="flex-grow bg-slate-50/50">
              {isEditable ? (
                <textarea 
                  value={plan.longTermSupport}
                  onChange={(e) => handleChange("longTermSupport", e.target.value)}
                  className="w-full h-full p-4 text-sm leading-relaxed border-none focus:ring-2 focus:ring-blue-500 bg-transparent font-medium italic scrollbar-hide resize-none"
                />
              ) : (
                <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap font-medium italic">
                  {plan.longTermSupport}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Intervention Plan */}
      <div className="grid grid-cols-12 border-t-0 border-slate-900">
        <div className="col-span-3 bg-slate-200 p-6 flex items-center justify-center font-black text-lg border-r-2 border-slate-900 leading-tight text-center break-keep">
          위기관리계획<br/>및 연계방안
        </div>
        <div className="col-span-9 p-8 bg-white space-y-4">
          <div className="flex gap-4">
            <span className="font-black text-blue-600">1.</span>
            <p className="text-sm font-bold text-slate-700">위해(타해, 자해 등) 발생 시 즉시 활동을 중단하고 안전 공간으로 분리하며, 특수교사가 1차 개입한다.</p>
          </div>
          <div className="flex gap-4">
            <span className="font-black text-blue-600">2.</span>
            <p className="text-sm font-bold text-slate-700">원내 지원인력(통합교사 등)은 일관된 방식으로 개입하며, 진정되지 않을 경우 보호자에게 즉각 연락하여 가정과 연계 귀가 조치한다.</p>
          </div>
          {plan.interventions && (
            <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {plan.interventions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
