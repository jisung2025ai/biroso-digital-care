"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Fingerprint, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        // 실제 운영에서는 역할별 리다이렉트 처리 필요하나 미들웨어에서 보조함
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-green-500/30">
      <div className="w-full max-w-md">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

        <div className="relative glass-panel bg-slate-900/50 border border-slate-700/50 p-10 shadow-2xl backdrop-blur-xl rounded-3xl overflow-hidden">
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 mb-4 animate-bounce-slow">
              <Fingerprint size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">통합돌봄 플랫폼</h1>
            <p className="text-slate-400 text-sm text-center">비로소(BROSO) 디지털 워크스테이션 인증</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">이메일 주소</label>
              <input
                type="email"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all text-sm"
                placeholder="staff@broso.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">비밀번호</label>
              <input
                type="password"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs animate-shake">
                <ShieldAlert size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>시스템 접속하기</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-800/50">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">테스트 계정 가이드</p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 mb-1">관리자 서비스</p>
                  <p className="text-[10px] text-slate-300 font-mono">admin@broso.com</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">admin123</p>
                </div>
                <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-700/30">
                  <p className="text-[9px] text-slate-500 mb-1">현장 기록 서비스</p>
                  <p className="text-[10px] text-slate-300 font-mono">staff@broso.com</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">staff123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-500 text-xs font-medium">
          © 2026 비로소(BROSO) 발달장애인지원센터 · 전용 폐쇄망 인증 시스템
        </p>
      </div>
    </div>
  );
}
