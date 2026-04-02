"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "./NotificationProvider";
import { getPatients, saveBehaviorRecord } from "@/lib/actions/behavior";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

export default function ABCRecordForm() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: "",
    antecedent: "",
    behaviorType: "",
    behaviorDetail: "",
    intensity: "Medium",
    durationMin: 1,
    consequence: ""
  });

  useEffect(() => {
    async function fetchPatients() {
      if (!session?.user?.id) return;
      
      try {
        const data = await getPatients(session.user.id);
        setPatients(data);
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setIsLoadingPatients(false);
      }
    }
    fetchPatients();
  }, [session?.user?.id]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // TextArea에서는 엔터를 허용하되, Form 제출은 막음
      if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (step < 3) {
          nextStep();
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 최종 단계(3단계)가 아니라면 다음 단계로 이동하고 종료 (물리적 차단)
    if (step < 3) {
      nextStep();
      return;
    }

    // 3단계 필수값 검증 (조치사항 누락 시 저장 불가)
    if (!formData.consequence || formData.consequence.trim().length < 5) {
      addNotification("error", "입력 미비", "3단계 조치 사항을 상세히(최소 5자 이상) 기록해주세요.");
      return;
    }

    if (!formData.patientId) {
      addNotification("error", "입력 오류", "기록할 이용자를 선택해주세요.");
      return;
    }
    if (!formData.behaviorType) {
      addNotification("error", "입력 오류", "행동 유형을 선택해주세요.");
      return;
    }
    if (!session?.user?.id) {
      addNotification("error", "인증 오류", "로그인 정보가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await saveBehaviorRecord({
        ...formData,
        staffId: session.user.id
      });

      if (result.success) {
        addNotification("success", "기록 저장 완료", "도전행동 기록이 3단계까지 안전하게 수집되었습니다.");
        // Reset form
        setFormData({
          patientId: "",
          antecedent: "",
          behaviorType: "",
          behaviorDetail: "",
          intensity: "Medium",
          durationMin: 1,
          consequence: ""
        });
        setStep(1);
      } else {
        addNotification("error", "저장 실패", result.error || "일시적인 오류가 발생했습니다.");
      }
    } catch (err) {
      addNotification("error", "시스템 오류", "서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 mt-10 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
      
      <div className="relative">
        <h3 className="text-xl font-black mb-1 text-slate-900 flex items-center gap-2">
          도전행동 기록 <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-tighter">ABC Wizard</span>
        </h3>
        <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest tracking-tighter">Behavioral Observation System</p>

        {/* Progress Bar */}
        <div className="flex mb-10 space-x-3">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-slate-100"}`}
            />
          ))}
        </div>

        <form 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown}
          className="min-h-[320px] flex flex-col justify-between"
        >
          <div>
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex flex-col gap-1">
                  <h4 className="font-black text-lg text-slate-800">1. 선행사건 및 대상 (Antecedent)</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Context & Subject Selection</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">이용자 선택</label>
                    <select 
                      disabled={isLoadingPatients || patients.length === 0}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-green-500/30 focus:bg-white outline-none transition-all appearance-none"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    >
                      {isLoadingPatients ? (
                        <option>데이터를 불러오는 중...</option>
                      ) : patients.length === 0 ? (
                        <option>등록된 이용자가 없습니다.</option>
                      ) : (
                        <>
                          <option value="">기록 대상을 선택하세요</option>
                          {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">상황 설명</label>
                    <textarea
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:border-green-500/30 focus:bg-white outline-none transition-all min-h-[120px] resize-none"
                      placeholder="행동이 발생하기 직전의 환경적 요인이나 자극을 적어주세요."
                      value={formData.antecedent}
                      onChange={(e) => setFormData({ ...formData, antecedent: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex flex-col gap-1">
                  <h4 className="font-black text-lg text-slate-800">2. 행동 관찰 기록 (Behavior)</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Detailed Action Dynamics</p>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">행동 유형</label>
                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-green-500/30 focus:bg-white outline-none transition-all"
                      value={formData.behaviorType}
                      onChange={(e) => setFormData({ ...formData, behaviorType: e.target.value })}
                    >
                      <option value="">유형을 선택하세요</option>
                      <option value="SELF_HARM">자해 (머리 때리기 등)</option>
                      <option value="ATTACK">타해 (때리기, 깨물기 등)</option>
                      <option value="DESTROY">물건 파괴</option>
                      <option value="ESCAPE">이탈 및 도주</option>
                      <option value="SCREAM">소리 지르기</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">상세 행동 묘사</label>
                    <textarea
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:border-green-500/30 focus:bg-white outline-none transition-all min-h-[100px] resize-none"
                      placeholder="구체적으로 어떤 행동을 했는지 자세히 기록해주세요. (예: 손등을 3회 반복하여 물어뜯음)"
                      value={formData.behaviorDetail}
                      onChange={(e) => setFormData({ ...formData, behaviorDetail: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">강도</label>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-green-500/30 focus:bg-white outline-none transition-all"
                        value={formData.intensity}
                        onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
                      >
                        <option value="Low">약함</option>
                        <option value="Medium">보통</option>
                        <option value="High">심각</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">지속(분)</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:border-green-500/30 focus:bg-white outline-none transition-all"
                        value={formData.durationMin}
                        onChange={(e) => setFormData({ ...formData, durationMin: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="flex flex-col gap-1">
                  <h4 className="font-black text-lg text-slate-800">3. 결과 및 중재 완료 (Consequence)</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Intervention & Outcome</p>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">조치 사항</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:border-green-500/30 focus:bg-white outline-none transition-all min-h-[160px] resize-none"
                    placeholder="행동 발생 직후의 대처 상황과 안정화 여부를 상세히 기록하세요."
                    value={formData.consequence}
                    onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-12 pb-2">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={prevStep} 
                className="flex-1 py-4.5 rounded-2xl bg-slate-50 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 active:scale-95 transition-all border border-slate-100"
              >
                Back
              </button>
            ) : null}

            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="flex-[2] py-4.5 rounded-2xl bg-green-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-600/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-[2] py-4.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Finalize & Save
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
