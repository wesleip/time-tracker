import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-bg-secondary rounded-2xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
