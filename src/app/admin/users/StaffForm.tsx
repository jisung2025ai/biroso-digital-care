"use client";

import { useState } from "react";
import { X, Shield, Mail, User, Key } from "lucide-react";
import { useRouter } from "next/navigation";

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function StaffForm({ isOpen, onClose, initialData }: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    role: initialData?.role || "STAFF",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            {initialData ? "계정 정보 수정" : "신규 계정 등록"}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> 이름
            </label>
            <input
              required
              type="text"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="예: 홍길동"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {!initialData && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} /> 이메일 (ID)
              </label>
              <input
                required
                type="email"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="example@broso.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}

          {!initialData && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Key size={12} /> 초기 비밀번호
              </label>
              <input
                required
                type="password"
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> 역할 권한
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "STAFF", label: "종사자", color: "blue" },
                { val: "ADMIN", label: "관리자", color: "purple" },
                { val: "GUARDIAN", label: "보호자", color: "teal" },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.val })}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
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

          <div className="pt-4">
            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "처리 중..." : initialData ? "정보 업데이트" : "신규 계정 생성 확정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
