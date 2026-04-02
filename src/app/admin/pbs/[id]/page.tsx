import { getPatient } from "@/lib/actions/behavior";
import { getPBSPlans } from "@/lib/actions/pbs";
import PBSAdminClient from "@/components/PBSAdminClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PBSPage({ params }: Props) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) return notFound();

  const plans = await getPBSPlans(id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          긍정적 행동지원계획 관리
          <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full font-bold">AI Agent</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">이용자: <span className="text-slate-900 font-bold">{patient.name}</span>님 ({patient.disabilityType || "정보 없음"})</p>
      </div>

      <PBSAdminClient 
        patientId={id} 
        patientName={patient.name}
        initialPlans={plans} 
      />
    </div>
  );
}
