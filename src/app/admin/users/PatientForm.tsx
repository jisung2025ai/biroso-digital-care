"use client";

import { useState, useEffect } from "react";
import { createPatient, updatePatient } from "@/lib/actions/patients";
import { X, Loader2, UserPlus, Save, ShieldCheck } from "lucide-react";

interface PatientFormProps {
  isOpen: boolean;
  onClose: () => void;
  staffs: { id: string; name: string }[];
  guardians: { id: string; name: string }[];
  initialData?: any;
  userRole?: string;
  userId?: string;
}

export default function PatientForm({ 
  isOpen, 
  onClose, 
  staffs, 
  guardians, 
  initialData, 
  userRole, 
  userId 
}: PatientFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    disabilityType: "",
    healthInfo: "",
    assignedStaffId: "",
    guardianId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : "",
        disabilityType: initialData.disabilityType || "",
        healthInfo: initialData.healthInfo || "",
        assignedStaffId: initialData.assignedStaffId || (userRole === "STAFF" ? userId || "" : ""),
        guardianId: initialData.guardianId || "",
      });
    } else {
      setFormData({
        name: "",
        birthDate: "",
        disabilityType: "",
        healthInfo: "",
        assignedStaffId: userRole === "STAFF" ? userId || "" : "",
        guardianId: "",
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
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block italic">기초 정보</label>
              <input
                required
                type="text"
                placeholder="이용자 성명"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">생년월일</label>
                <input
                  type="date"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-[13px] text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">장애유형</label>
                <input
                  type="text"
                  placeholder="예: 자폐성"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  value={formData.disabilityType}
                  onChange={(e) => setFormData({ ...formData, disabilityType: e.target.value })}
                />
              </div>
            </div>

            {userRole === "ADMIN" && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                    <ShieldCheck size={12} className="text-blue-400" /> 담당 종사자
                  </label>
                  <select
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.assignedStaffId}
                    onChange={(e) => setFormData({ ...formData, assignedStaffId: e.target.value })}
                  >
                    <option value="">미지정</option>
                    {staffs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block flex items-center gap-2">
                    <ShieldCheck size={12} className="text-teal-400" /> 연결된 보호자
                  </label>
                  <select
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    value={formData.guardianId}
                    onChange={(e) => setFormData({ ...formData, guardianId: e.target.value })}
                  >
                    <option value="">연결 안함</option>
                    {guardians.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">건강 및 특이사항</label>
              <textarea
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none font-medium"
                value={formData.healthInfo}
                onChange={(e) => setFormData({ ...formData, healthInfo: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-teal-700 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initialData ? "정보 업데이트" : "이용자 신규 등록 확정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
