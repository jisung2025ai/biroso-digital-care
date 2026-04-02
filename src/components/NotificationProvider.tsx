"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, XCircle, Bell, Loader2 } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning" | "sos" | "ai";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, type, title, message, timestamp: new Date() };
    
    setNotifications((prev) => [newNotification, ...prev].slice(0, 5));

    // SOS나 AI 알림은 수동으로 닫을 때까지 유지, 나머지는 5초 후 삭제
    if (type !== "sos" && type !== "ai") {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-[380px] pointer-events-none">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

const NotificationItem: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-green-400" />,
    error: <XCircle className="text-red-400" />,
    info: <Info className="text-blue-400" />,
    warning: <AlertCircle className="text-amber-400" />,
    sos: <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse"><AlertCircle className="text-red-500" /></div>,
    ai: <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Bell className="text-purple-400" /></div>,
  };

  const bgStyles = {
    success: "bg-slate-900/90 border-green-500/30",
    error: "bg-slate-900/90 border-red-500/30",
    info: "bg-slate-900/90 border-blue-500/30",
    warning: "bg-slate-900/90 border-amber-500/30",
    sos: "bg-red-950/90 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    ai: "bg-slate-900/90 border-purple-500/30",
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-slide-in-right ${bgStyles[notification.type]}`}>
      <div className="shrink-0 mt-0.5">
        {icons[notification.type]}
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${notification.type === 'sos' ? 'text-white' : 'text-slate-100'}`}>
          {notification.title}
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-500 mt-2 font-mono">
          {notification.timestamp.toLocaleTimeString()}
        </p>
      </div>
      <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-white transition-colors">
        <XCircle size={18} />
      </button>
    </div>
  );
};
