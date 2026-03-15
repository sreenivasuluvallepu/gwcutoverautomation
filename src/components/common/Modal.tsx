import { ReactNode } from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onClose
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl2 border border-ink-200 bg-white p-5 shadow-panel dark:border-ink-700 dark:bg-ink-900">
        <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
        <div className="mt-3 text-sm text-ink-700 dark:text-ink-200">{body}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button tone="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button tone={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
