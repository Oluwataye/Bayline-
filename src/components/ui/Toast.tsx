"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        // Keep max 3 visible
        return next.slice(-3);
      });
      const timer = setTimeout(() => removeToast(id), 3000);
      timers.current.set(id, timer);
    },
    [removeToast]
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      currentTimers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const borderColor: Record<ToastType, string> = {
  success: "border-l-[#16A34A]",
  error: "border-l-[#B91C1C]",
  info: "border-l-blue-500",
};

const Icon: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
};

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-[320px] pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={[
            "pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-lg",
            "border border-[#EEF0F2] border-l-4 px-4 py-3",
            "animate-[slideIn_0.2s_ease-out]",
            borderColor[t.type],
          ].join(" ")}
        >
          {Icon[t.type]}
          <span className="flex-1 text-xs text-[#111111] leading-relaxed">{t.message}</span>
          <button
            onClick={() => onRemove(t.id)}
            className="shrink-0 text-[#6B7280] hover:text-[#111111] transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
