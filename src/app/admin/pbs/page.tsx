import { getAllPatientsWithPBSStats } from "@/lib/actions/pbs";
import PBSListClient from "@/components/PBSListClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function PBSAdminPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  const stats = await getAllPatientsWithPBSStats(userRole, userId);

  return (
    <div className="container mx-auto font-sans">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          PBS 지원계획 통합 관리
          <span className="text-xs bg-yellow-400 text-slate-900 px-3 py-1 rounded-full font-black uppercase tracking-tighter">AI Monitor</span>
        </h1>
        <p className="text-slate-400 mt-2 font-medium">관리 중인 모든 이용자의 긍정적 행동지원계획 수립 현황을 실시간으로 확인합니다.</p>
      </div>

      <PBSListClient initialStats={stats} />
    </div>
  );
}
