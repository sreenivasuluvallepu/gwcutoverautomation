import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";

export default function ToastRegion() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => removeToast(toast.id), 3500));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-lg border border-ink-200 bg-white/95 px-3 py-2 text-sm shadow-card dark:border-ink-700 dark:bg-ink-900"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
