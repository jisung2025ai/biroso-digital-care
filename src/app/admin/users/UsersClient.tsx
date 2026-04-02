"use client";

import { useState } from "react";
import { Users, User, UserCheck, Search, Plus, Edit2, Trash2, UserCog, ShieldCheck } from "lucide-react";
import PatientForm from "./PatientForm";
import StaffForm from "./StaffForm";
import { deletePatient } from "@/lib/actions/patients";
import { useRouter } from "next/navigation";

interface PatientItem { 
  id: string; 
  name: string; 
  disabilityType: string; 
  birthDate?: string;
  healthInfo?: string;
  assignedStaffId?: string;
  guardianId?: string;
  guardianName?: string;
  staffName?: string;
  createdAt: string; 
  behaviorCount: number; 
}

interface StaffItem { 
  id: string; 
  name: string; 
  email: string; 
  role: string; 
  createdAt: string; 
  recordCount: number; 
}

interface GuardianItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  patientName?: string;
  patientId?: string;
}

export default function UsersClient({ 
  patients, 
  staffs, 
  guardians, 
  userRole, 
  userId 
}: { 
  patients: PatientItem[]; 
  staffs: StaffItem[]; 
  guardians: GuardianItem[];
  userRole?: string; 
  userId?: string; 
}) {
  const [tab, setTab] = useState<"patients" | "staff" | "guardians">("patients");
  const [search, setSearch] = useState("");
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const router = useRouter();

  const filteredPatients = patients.filter(p => p.name.includes(search));
  const filteredStaffs = staffs.filter(s => s.name.includes(search) || s.email.includes(search));
  const filteredGuardians = guardians.filter(g => g.name.includes(search) || g.email.includes(search));

  const handleEditPatient = (patient: PatientItem) => {
    setSelectedPatient(patient);
    setIsPatientFormOpen(true);
  };

  const handleEditStaff = (staff: any) => {
    setSelectedStaff(staff);
    setIsStaffFormOpen(true);
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (confirm(`정말로 이용자 '${name}'님을 삭제하시겠습니까?`)) {
      const result = await deletePatient(id);
      if (!result.success) alert(result.error);
      else router.refresh();
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (confirm(`정말로 '${name}' 계정을 삭제하시겠습니까?`)) {
      const res = await fetch(`/api/admin/staff?id=${id}`, { method: "DELETE" });
      if (!res.ok) alert("삭제 실패");
      else router.refresh();
    }
  };

  return (
    <div className="space-y-6 fade-in text-slate-200 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">기관 / 이용자 관리</h2>
          <p className="text-slate-400 text-sm">등록된 이용자, 종사자 및 보호자 정보를 관리합니다.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="검색어 입력..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>
          {tab === "patients" ? (
            <button
              onClick={() => { setSelectedPatient(null); setIsPatientFormOpen(true); }}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-black flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all active:scale-95"
            >
              <Plus size={18} /> 신규 이용자
            </button>
          ) : (
            <button
              onClick={() => { setSelectedStaff(null); setIsStaffFormOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-black flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus size={18} /> 신규 계정
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("patients")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "patients" ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Users size={16} /> 이용자 ({patients.length})
        </button>
        <button
          onClick={() => setTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "staff" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck size={16} /> 종사자 ({staffs.length})
        </button>
        <button
          onClick={() => setTab("guardians")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "guardians" ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={16} /> 보호자 ({guardians.length})
        </button>
      </div>

      {tab === "patients" && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700 tracking-wider">
              <tr>
                <th className="px-6 py-4">이용자명</th>
                <th className="px-6 py-4">장애유형</th>
                <th className="px-6 py-4">담당 종사자</th>
                <th className="px-6 py-4">보호자</th>
                <th className="px-6 py-4">기록 수</th>
                <th className="px-6 py-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredPatients.map(p => (
                <tr key={p.id} className="bg-slate-800/20 hover:bg-slate-700/40 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-white">{p.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {p.disabilityType || "미분류"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {p.staffName ? (
                      <div className="flex items-center gap-2 text-slate-300">
                        <UserCog size={14} className="text-blue-400" />
                        <span className="font-bold">{p.staffName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">미지정</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {p.guardianName && p.guardianName !== "연결 없음" ? (
                      <div className="flex items-center gap-2 text-teal-400">
                        <User size={14} />
                        <span className="font-bold">{p.guardianName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-xs italic">미지정</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-black">{p.behaviorCount}건</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditPatient(p)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeletePatient(p.id, p.name)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === "staff" || tab === "guardians") && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700 tracking-wider">
              <tr>
                <th className="px-6 py-4">이름</th>
                <th className="px-6 py-4">이메일</th>
                <th className="px-6 py-4">역할</th>
                <th className="px-6 py-4">{tab === "guardians" ? "담당 이용자" : ""}</th>
                <th className="px-6 py-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {(tab === "staff" ? filteredStaffs : filteredGuardians).map(u => (
                <tr key={u.id} className="bg-slate-800/20 hover:bg-slate-700/40 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                  <td className="px-6 py-4 text-slate-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                      u.role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      u.role === "STAFF" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {tab === "guardians" && (u as GuardianItem).patientName ? (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Users size={14} className="text-teal-400" />
                        <span className="font-bold">{(u as GuardianItem).patientName}</span>
                      </div>
                    ) : tab === "guardians" ? (
                      <span className="text-slate-600 text-xs italic">미지정</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                  {(userRole === "ADMIN" || (userRole === "STAFF" && u.role === "GUARDIAN")) && (
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditStaff(u)} className="p-2 text-slate-400 hover:text-blue-400"><Edit2 size={16}/></button>
                      <button onClick={() => handleDeleteStaff(u.id, u.name)} className="p-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PatientForm 
        isOpen={isPatientFormOpen} 
        onClose={() => setIsPatientFormOpen(false)} 
        staffs={staffs}
        guardians={guardians}
        initialData={selectedPatient}
        userRole={userRole}
        userId={userId}
      />

      <StaffForm
        isOpen={isStaffFormOpen}
        onClose={() => setIsStaffFormOpen(false)}
        initialData={selectedStaff}
        patients={patients}
        userRole={userRole}
      />
    </div>
  );
}
