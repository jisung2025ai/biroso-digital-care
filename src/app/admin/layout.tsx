"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Database, User, Settings, LayoutDashboard, Zap, MonitorDot } from "lucide-react";

import { signOut, useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = (session?.user as any)?.role;
  
  const navItems = [
    { name: "종합 통계 대시보드", href: "/admin", icon: <LayoutDashboard size={20} />, allow: ["ADMIN", "STAFF"] },
    { name: "도전행동 전체 기록", href: "/admin/records", icon: <Database size={20} />, allow: ["ADMIN", "STAFF"] },
    { name: "식사/건강 전체 기록", href: "/admin/daily-reports", icon: <Database size={20} />, allow: ["ADMIN", "STAFF"] },
    { name: "PBS 지원계획 관리", href: "/admin/pbs", icon: <Zap size={20} className="text-yellow-400" />, allow: ["ADMIN", "STAFF"] },
    { name: "기관/이용자 관리", href: "/admin/users", icon: <User size={20} />, allow: ["ADMIN", "STAFF"] },
    { name: "리포트 및 AI 설정", href: "/admin/settings", icon: <Settings size={20} />, allow: ["ADMIN", "STAFF"] },
  ].filter(item => !role || item.allow.includes(role));

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span className="text-green-500">
              <BarChart3 size={24} />
            </span>
            관리자 센터
          </h2>
          <p className="text-xs text-slate-500 mt-1">최중증 통합플랫폼 v1.0</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? "bg-slate-800 text-white shadow-md border border-slate-700/50" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">당일 시스템 상태</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-sm text-white font-medium">DB 동기화 정상</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 shrink-0 bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-white">데이터 애널리틱스</h1>
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/20 transition-all text-xs font-bold"
            >
              <MonitorDot size={14} />
              현장 대시보드
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-semibold text-white">[{role === 'ADMIN' ? '최고관리자' : '종사자'}] {session?.user?.name || "사용자"}</span>
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
                >
                  Logout
                </button>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-green-500/10">
                {session?.user?.name?.slice(0, 1) || "A"}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
