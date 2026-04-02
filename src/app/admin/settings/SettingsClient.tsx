"use client";

import { useEffect, useState } from "react";
import { Brain, FileBarChart, Bell, Shield, Sliders, Clock, CheckCircle2 } from "lucide-react";
import { getSystemSettings, updateSystemSettings } from "@/lib/actions/settings";

export default function SettingsClient() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState("High");
  const [reportFrequency, setReportFrequency] = useState("weekly");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getSystemSettings();
      setAiEnabled(settings.aiEnabled);
      setAlertThreshold(settings.alertThreshold);
      setReportFrequency(settings.reportFrequency);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    await updateSystemSettings({ aiEnabled, alertThreshold, reportFrequency });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 fade-in text-slate-200 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">리포트 및 AI 설정</h2>
        <p className="text-slate-400 text-sm">자동 리포트 생성 주기, AI 예측 모델 설정, 알림 임계치 등을 관리합니다.</p>
      </div>

      <section className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI 위험 예측 모형</h3>
            <p className="text-xs text-slate-500">도전행동 발생 가능성을 미리 예측하는 AI 모듈 설정</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Sliders size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">AI 예측 기능 활성화</p>
                <p className="text-xs text-slate-500">시계열 패턴 분석 기반 도전행동 사전 예측</p>
              </div>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`w-12 h-7 rounded-full transition-all relative ${aiEnabled ? 'bg-green-600' : 'bg-slate-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all shadow-md ${aiEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">알림 발송 임계 강도</p>
                <p className="text-xs text-slate-500">이 강도 이상의 행동이 감지되면 자동 알림을 발송합니다.</p>
              </div>
            </div>
            <select
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="Low">Low (약함 이상)</option>
              <option value="Medium">Medium (보통 이상)</option>
              <option value="High">High (심각만)</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileBarChart size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">자동 리포트 설정</h3>
            <p className="text-xs text-slate-500">기관 및 보호자에게 발송되는 정기 리포트 구성</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">리포트 자동 생성 주기</p>
                <p className="text-xs text-slate-500">설정된 주기에 맞추어 PDF 리포트를 자동 생성합니다.</p>
              </div>
            </div>
            <select
              value={reportFrequency}
              onChange={(e) => setReportFrequency(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="daily">매일</option>
              <option value="weekly">매주 (기본)</option>
              <option value="monthly">매월</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-white">보호자 공유 범위</p>
                <p className="text-xs text-slate-500">보호자에게 공개하는 행동 관찰 데이터의 수준을 제한합니다.</p>
              </div>
            </div>
            <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-blue-500">
              <option>요약만 공개</option>
              <option>상세 기록 포함</option>
              <option>비공개 (내부용)</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl group ${
            saved
              ? 'bg-green-600 text-white shadow-green-500/20'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-600/20 active:scale-95'
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={18} className="animate-bounce" />
              <span>시스템에 영구 저장 완료</span>
            </>
          ) : (
            <>
              <Shield size={18} className="group-hover:rotate-12 transition-transform" />
              <span>글로벌 시스템 설정 확정 저장</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
