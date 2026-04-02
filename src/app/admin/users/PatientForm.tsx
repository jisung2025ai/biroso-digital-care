"use client";

import { useState, useEffect } from "react";
import { createPatient, updatePatient } from "@/lib/actions/patients";
import { X, Loader2, UserPlus, Save } from "lucide-react";

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: { id: string; name: string }[];
  initialData?: any;
  userRole?: string;
  userId?: string;
}

export default function PatientForm({ isOpen, onClose, staffs, initialData, userRole, userId }: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    disabilityType: "",
    healthInfo: "",
    assignedStaffId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
        disabilityType: initialData.disabilityType || "",
        healthInfo: initialData.healthInfo || "",
        assignedStaffId: initialData.assignedStaffId || (userRole === "STAFF" ? userId || "" : ""),
      });
    } else {
      setFormData({
        name: "",
        birthDate: "",
        disabilityType: "",
        healthInfo: "",
        assignedStaffId: userRole === "STAFF" ? userId || "" : "",
      });
    }
  }, [initialData, isOpen, userRole, userId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (initialData) {
        result = await updatePatient(initialData.id, formData);
      } else {
        result = await createPatient(formData);
      }

      if (result.success) {
        onClose();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("시스템 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <UserPlus className="text-green-500" size={20} />
            </div>
            <h3 className="text-lg font-black text-white">
              {initialData ? "이용자 정보 수정" : "신규 이용자 등록"}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">이용자 성명</label>
              <input
                required
                type="text"
                placeholder="성명을 입력하세요"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">생년월일</label>
                <input
                  type="date"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-[13px] text-white outline-none focus:ring-2 focus:ring-green-500 transition-all font-mono"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">장애유형</label>
                <input
                  type="text"
                  placeholder="예: 자폐성장해"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={formData.disabilityType}
                  onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                />
              </div>
            </div>

            {userRole !== "STAFF" && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">담당 종사자 매칭</label>
                <select
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={formData.assignedStaffId}
                  onChange={(e) => setFormData({ ...formData, assignedStaffId: e.target.value })}
                >
                  <option value="">담당자 지정 안함</option>
                  {staffs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">특이사항 및 건강정보</label>
              <textarea
                rows={3}
                placeholder="주요 특이사항을 입력하세요"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none leading-relaxed"
                value={formData.healthInfo}
                onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-green-600 text-white py-3 rounded-xl font-black text-sm hover:bg-green-500 shadow-xl shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {initialData ? "수정사항 저장" : "이용자 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
