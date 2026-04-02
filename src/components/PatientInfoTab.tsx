"use client";

import { useState } from "react";

export default function PatientInfoTab() {
  const patients = [
    { name: "이용자A", type: "자폐성장애", age: 28, guardian: "김보호자", notes: "소음에 민감, 루틴 변화 시 불안 증가" },
    { name: "이용자B", type: "지적장애", age: 22, guardian: "박보호자", notes: "특정 음식 거부 반응, 오후 졸림 경향" },
    { name: "이용자C", type: "중복장애", age: 35, guardian: "최보호자", notes: "자해 빈도 높음, 전환 활동 시 주의 필요" },
  ];

  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">담당 이용자 정보</h2>
      <p className="text-xs text-slate-500 mb-2">현재 담당하고 있는 이용자의 기본 정보와 특이사항을 확인합니다.</p>

      {patients.map((p, i) => (
        <button
          key={i}
          onClick={() => setSelected(selected === i ? null : i)}
          className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {p.name.slice(-1)}
              </div>
              <div>
                <p className="font-semibold text-slate-700">{p.name}</p>
                <p className="text-xs text-slate-400">{p.type} · {p.age}세</p>
              </div>
            </div>
            <span className="text-slate-300">{selected === i ? '▲' : '▼'}</span>
          </div>
          {selected === i && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
              <p className="text-slate-600"><span className="font-medium text-slate-800">보호자:</span> {p.guardian}</p>
              <p className="text-slate-600"><span className="font-medium text-slate-800">특이사항:</span> {p.notes}</p>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
