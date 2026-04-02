"use client";

import { useState } from "react";

export default function GuardianTab() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const logs = [
    { date: "03.31 14:20", guardian: "김보호자", text: "오늘 점심 식사는 어떻게 했나요?", from: "guardian" },
    { date: "03.31 14:35", guardian: "복지사", text: "점심은 잘 드셨습니다. 오늘은 카레를 좋아하셨어요.", from: "staff" },
    { date: "03.31 09:00", guardian: "박보호자", text: "오늘 약을 미리 먹이고 보냈습니다.", from: "guardian" },
    { date: "03.31 09:10", guardian: "복지사", text: "네, 확인했습니다. 잘 관찰하겠습니다.", from: "staff" },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">보호자 소통</h2>
      <p className="text-xs text-slate-500 mb-2">보호자와의 알림장 형태 메시지 내역입니다.</p>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className={`flex ${log.from === 'staff' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                log.from === 'staff'
                  ? 'bg-green-500 text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-700 rounded-bl-md'
              }`}>
                <p className="text-[10px] opacity-70 mb-1">{log.guardian} · {log.date}</p>
                <p>{log.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 p-3 flex gap-2">
          <input
            type="text"
            placeholder="보호자에게 전달할 메시지..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              sent ? 'bg-green-100 text-green-600' : 'bg-green-600 text-white hover:bg-green-500'
            }`}
          >
            {sent ? '✓' : '전송'}
          </button>
        </div>
      </div>
    </div>
  );
}
