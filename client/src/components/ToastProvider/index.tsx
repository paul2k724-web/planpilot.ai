"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const toneIcons: Record<ToastTone, React.ElementType> = {
  success: CheckCircle2,
  error: CircleAlert,
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, tone: ToastTone) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const value = useMemo(
    () => ({
      success: (message: string) => pushToast(message, "success"),
      error: (message: string) => pushToast(message, "error"),
    }),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[80] flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.tone];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-md border px-3 py-3 text-sm font-semibold shadow-sm ${toneStyles[toast.tone]}`}
            >
              <Icon className="mt-0.5 h-4 w-4 flex-none" />
              <p className="leading-5">{toast.message}</p>
              <button
                type="button"
                className="ml-auto rounded p-1 opacity-70 transition hover:opacity-100"
                onClick={() => removeToast(toast.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};

export default ToastProvider;
