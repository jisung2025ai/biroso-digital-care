"use client";

import { useState } from "react";
import { Users, UserCheck, Search, Plus, Edit2, Trash2, UserCog } from "lucide-react";
import PatientForm from "./PatientForm";
import { deletePatient } from "@/lib/actions/patients";

interface PatientItem { 
  id: string; 
  name: string; 
  disabilityType: string; 
  birthDate?: string;
  healthInfo?: string;
  assignedStaffId?: string;
  staffName?: string;
  createdAt: string; 
  behaviorCount: number; 
}
interface StaffItem { id: string; name: string; email: string; role: string; createdAt: string; recordCount: number; }

export default function UsersClient({ patients, staffs, userRole, userId }: { patients: PatientItem[]; staffs: StaffItem[]; userRole?: string; userId?: string; }) {
  const [tab, setTab] = useState<"patients" | "staff">("patients");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);

  const filteredPatients = patients.filter(p => p.name.includes(search));
  const filteredStaffs = staffs.filter(s => s.name.includes(search) || s.email.includes(search));

  const handleEdit = (patient: PatientItem) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`정말로 이용자 '${name}'님을 삭제하시겠습니까?\n모든 관련 기록이 유실될 수 있습니다.`)) {
      const result = await deletePatient(id);
      if (!result.success) alert(result.error);
    }
  };

  return (
    <div className="space-y-6 fade-in text-slate-200 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">기관 / 이용자 관리</h2>
          <p className="text-slate-400 text-sm">등록된 이용자 및 종사자 정보를 관리합니다.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="이름 또는 이메일 검색"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-green-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>
          {tab === "patients" && (
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-black flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all active:scale-95"
            >
              <Plus size={18} /> 신규 이용자
            </button>
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("patients")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "patients" ? "bg-green-600 text-white shadow-lg shadow-green-600/20" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Users size={16} /> 이용자 ({patients.length}명)
        </button>
        <button
          onClick={() => setTab("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "staff" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck size={16} /> 종사자 ({staffs.length}명)
        </button>
      </div>

      {/* Patient Table */}
      {tab === "patients" && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700 tracking-wider">
                <tr>
                  <th className="px-6 py-4">이용자명</th>
                  <th className="px-6 py-4">장애유형</th>
                  <th className="px-6 py-4">담당 종사자</th>
                  <th className="px-6 py-4">누적 행동기록</th>
                  <th className="px-6 py-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPatients.map(p => (
                  <tr key={p.id} className="bg-slate-800/20 hover:bg-slate-700/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white mb-0.5">{p.name}</span>
                        {p.birthDate && <span className="text-[10px] text-slate-500 font-mono italic">{p.birthDate.split('T')[0]}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
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
                        <span className="text-slate-600 text-xs italic font-medium">미지정</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black ${p.behaviorCount > 30 ? 'text-red-400' : p.behaviorCount > 15 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {p.behaviorCount}건
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-2 bg-slate-700/50 text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="정보 수정"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 bg-slate-700/50 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="p-20 text-center">
              <Users size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-slate-500 font-bold">검색 결과가 없습니다.</p>
            </div>
          )}
          <div className="p-4 border-t border-slate-700 bg-slate-800/40">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total: {filteredPatients.length} Patients</span>
          </div>
        </div>
      )}

      {/* Staff Table */}
      {tab === "staff" && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700 tracking-wider">
                <tr>
                  <th className="px-6 py-4">종사자명</th>
                  <th className="px-6 py-4">이메일</th>
                  <th className="px-6 py-4">역할</th>
                  <th className="px-6 py-4">담당 기록 수</th>
                  <th className="px-6 py-4 text-right">등록일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredStaffs.map(s => (
                  <tr key={s.id} className="bg-slate-800/20 hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                    <td className="px-6 py-4 text-slate-400 font-medium">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {s.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-300">{s.recordCount}건</td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs font-mono">{s.createdAt?.split('T')[0] || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-700 bg-slate-800/40">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total: {filteredStaffs.length} Staff</span>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <PatientForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        staffs={staffs.map(s => ({ id: s.id, name: s.name }))}
        initialData={selectedPatient}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}
