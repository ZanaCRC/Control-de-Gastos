"use client";

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

interface ToastData {
  id: number;
  message: string;
  type: "error" | "success";
}

interface ToastContextValue {
  toast: (message: string, type?: "error" | "success") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, type: "error" | "success" = "error") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} data={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  data,
  onDismiss,
}: {
  data: ToastData;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(data.id), 4000);
    return () => clearTimeout(timer);
  }, [data.id, onDismiss]);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-[slideUp_0.2s_ease-out] ${
        data.type === "error"
          ? "bg-red-600 text-white"
          : "bg-emerald-600 text-white"
      }`}
    >
      <FontAwesomeIcon
        icon={data.type === "error" ? faCircleXmark : faCircleCheck}
        className="w-4 h-4 shrink-0"
      />
      {data.message}
      <button
        onClick={() => onDismiss(data.id)}
        aria-label="Cerrar notificación"
        className="ml-1 rounded-lg p-2 opacity-70 cursor-pointer hover:opacity-100 active:opacity-50 transition"
      >
        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
