import { ReactNode } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  title: string;
  body: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  widthClassName?: string;
}

export function Modal({
  open,
  title,
  body,
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  widthClassName = "max-w-xl"
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={`w-full ${widthClassName} rounded-lg border border-border bg-card p-5`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-base text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close popup"
          >
            x
          </button>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">{body}</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onConfirm && <Button onClick={onConfirm}>{confirmLabel}</Button>}
        </div>
      </div>
    </div>
  );
}
