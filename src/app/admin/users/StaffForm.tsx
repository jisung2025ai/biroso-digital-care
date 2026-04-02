"use client";

import { useState, useMemo } from "react";
import { X, Shield, Mail, User, Key, Search, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  patients: any[];
  userRole?: string;
}

export default function StaffForm({ isOpen, onClose, initialData, patients, userRole }: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "GUARDIAN",
    patientId: initialData?.patientId || "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 5);
    return patients.filter(p => 
      p.name.includes(searchQuery) || (p.disabilityType && p.disabilityType.includes(searchQuery))
    );
  }, [patients, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = initialData ? "PUT" : "POST";
      const body = initialData ? { ...formData, id: initialData.id } : formData;
      
      const res = await fetch("/api/admin/staff", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "작업에 실패했습니다.");
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            {initialData ? "계정 정보 수정" : "신규 계정 등록"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* 역할 선택 - 종사자는 보호자만 생성 가능 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> 역할 권한
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "GUARDIAN", label: "보호자", color: "teal", disabled: false },
                { val: "STAFF", label: "종사자", color: "blue", disabled: userRole === "STAFF" },
                { val: "ADMIN", label: "관리자", color: "purple", disabled: userRole === "STAFF" },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  disabled={r.disabled}
                  onClick={() => setFormData({ ...formData, role: r.val })}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    r.disabled ? "opacity-30 cursor-not-allowed" : ""
                  } ${
                    formData.role === r.val
                      ? `bg-${r.color}-500/20 border-${r.color}-500/50 text-${r.color}-400`
                      : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> 이름
              </label>
              <input
                required
                type="text"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="예: 홍길동"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {!initialData && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> 이메일 (ID)
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="example@broso.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Key size={12} /> 초기 비밀번호
                  </label>
                  <input
                    required
                    type="password"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="최소 6자 이상"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          {/* 보호자 선택 시 환자 연결 UI */}
          {formData.role === "GUARDIAN" && (
            <div className="space-y-2 pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={12} /> 연결할 이용자 검색
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="이용자 이름 검색..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-slate-500" size={16} />
              </div>
              
              <div className="bg-slate-800/30 rounded-xl border border-slate-800 max-h-40 overflow-y-auto divide-y divide-slate-800">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, patientId: p.id })}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 transition-colors ${
                        formData.patientId === p.id ? "bg-teal-500/10" : ""
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-500">{p.disabilityType || "유형 미지정"}</p>
                      </div>
                      {formData.patientId === p.id && (
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <UserCheck size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-xs text-slate-500 italic">검색 결과가 없습니다.</p>
                )}
              </div>
              {formData.patientId && (
                <div className="flex items-center gap-2 p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                  <span className="text-[10px] text-teal-400 font-black">SELECTED:</span>
                  <span className="text-xs text-white font-bold">
                    {patients.find(p => p.id === formData.patientId)?.name} 님과 연결됩니다.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="pt-4">
            <button
              disabled={loading}
              className={`w-full font-black py-4 rounded-xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 ${
                formData.role === "GUARDIAN" 
                  ? "bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 shadow-teal-900/20"
                  : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 shadow-blue-900/20"
              } text-white text-sm`}
            >
              {loading ? "처리 중..." : initialData ? "정보 업데이트" : `${formData.role === "GUARDIAN" ? "보호자" : "계정"} 생성 및 확정`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
