import { getPatient } from "@/lib/actions/behavior";
import { getPBSPlans } from "@/lib/actions/pbs";
import PBSAdminClient from "@/components/PBSAdminClient";
import { notFound } from "next/navigation";
import { User, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PBSPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) return notFound();

  const plans = await getPBSPlans(id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 relative overflow-hidden -m-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -ml-40 -mb-40 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        {/* Header Section: High Visibility */}
        <header className="flex flex-col md:flex-row items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-[0.2em]">
              <ShieldCheck size={14} />
              AI Behavior Support Module
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              긍정적 행동지원계획 <span className="text-emerald-500">분석</span>
            </h1>
            <div className="flex items-center gap-4 py-2">
               <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">분석 대상 이용자</p>
                    <p className="text-2xl font-black text-white tracking-tight">
                      {patient.name} <span className="text-sm text-emerald-400/80 font-bold ml-1">({patient.disabilityType || "자폐성장애"})</span>
                    </p>
                  </div>
               </div>
               <div className="hidden lg:flex flex-col">
                  <div className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white rounded-full w-fit mb-1">LIVE AGENT</div>
                  <p className="text-xs text-slate-500 font-medium">최신 7일 데이터 기반 실시간 분석 중</p>
               </div>
            </div>
          </div>
        </header>

        <PBSAdminClient 
          patientId={id} 
          patientName={patient.name}
          initialPlans={plans} 
        />
      </div>
    </div>
  );
}
