"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Home, Activity, BookOpen, LogOut, Heart } from "lucide-react";

export default function GuardianLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && role !== "GUARDIAN") router.push("/admin");
  }, [status, role, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 to-teal-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { name: "홈", href: "/guardian", icon: <Home size={18} /> },
    { name: "행동 기록", href: "/guardian/records", icon: <Activity size={18} /> },
    { name: "생활 일지", href: "/guardian/daily", icon: <BookOpen size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-teal-800/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Heart size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">BROSO 보호자 포털</p>
              <p className="text-[10px] text-teal-400">{session?.user?.name || "보호자"}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            로그아웃
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-slate-900/60 border-b border-teal-800/20 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                pathname === item.href
                  ? "border-teal-400 text-teal-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
