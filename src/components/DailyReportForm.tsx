"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "./NotificationProvider";
import { getPatients, saveDailyReport } from "@/lib/actions/behavior";
import { Loader2, CheckCircle2, X } from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

interface DailyReportFormProps {
  onClose: () => void;
}

export default function DailyReportForm({ onClose }: DailyReportFormProps) {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: "",
    mealStatus: "GOOD",
    sleepQuality: "GOOD",
    mood: "HAPPY",
    notes: ""
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) {
      addNotification("error", "입력 오류", "기록할 이용자를 선택해주세요.");
      return;
    }
    if (!session?.user?.id) {
      addNotification("error", "인증 오류", "로그인 정보가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await saveDailyReport({
        ...formData,
        staffId: session.user.id
      });

      if (result.success) {
        addNotification("success", "일지 저장 완료", "식사 및 건강 체크 기록이 저장되었습니다.");
        onClose();
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-full duration-500">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            식사 및 건강 체크 <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-tighter">Daily Check</span>
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status Observation Log</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">이용자 선택</label>
            <select 
              disabled={isLoadingPatients || patients.length === 0}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all appearance-none"
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

          <div className="grid grid-cols-2 gap-4">
            {/* Meal Status */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">식사 상태</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all"
                value={formData.mealStatus}
                onChange={(e) => setFormData({ ...formData, mealStatus: e.target.value })}
              >
                <option value="GOOD">양호 (전치)</option>
                <option value="NORMAL">보통 (반식)</option>
                <option value="REJECT">거부/결식</option>
              </select>
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">수면 상태</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all"
                value={formData.sleepQuality}
                onChange={(e) => setFormData({ ...formData, sleepQuality: e.target.value })}
              >
                <option value="GOOD">양호 (충분)</option>
                <option value="FAIR">보통 (자주 깸)</option>
                <option value="POOR">불량 (설침)</option>
              </select>
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">오늘의 기분</label>
            <div className="flex gap-2">
              {[
                { val: "HAPPY", label: "좋음", icon: "😊" },
                { val: "CALM", label: "평온", icon: "😐" },
                { val: "ANXIOUS", label: "불안", icon: "😰" },
                { val: "ANGRY", label: "긴장", icon: "😡" }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: m.val })}
                  className={`flex-1 py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${formData.mood === m.val ? "bg-blue-50 border-blue-500 text-blue-700" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"}`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-[10px] font-black uppercase">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">특이사항</label>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:border-blue-500/30 focus:bg-white outline-none transition-all min-h-[100px] resize-none"
              placeholder="건강 상태나 식사 시 특이사항이 있다면 적어주세요."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Save Observation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
