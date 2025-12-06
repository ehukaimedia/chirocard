import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmDisabled?: boolean;
    variant?: "default" | "danger";
    className?: string;
    hideFooter?: boolean;
    hideCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    confirmDisabled = false,
    variant = "default",
    className,
    hideFooter = false,
    hideCloseButton = false
}: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !hideCloseButton) onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose, hideCloseButton]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${className || ''}`}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h3>
                    {!hideCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-1 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {description && (
                        <p className="text-zinc-600 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                    {children}
                </div>

                {/* Footer */}
                {!hideFooter && (
                    <div className="flex justify-end gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="ghost" onClick={() => {
                            if (onCancel) onCancel();
                            else onClose();
                        }}>
                            {cancelLabel}
                        </Button>
                        {onConfirm && (
                            <Button
                                variant={variant === "danger" ? "danger" : "primary"}
                                disabled={confirmDisabled}
                                onClick={() => {
                                    onConfirm();
                                    // Only close if not disabled (though button is disabled so click won't fire, good to be safe)
                                    onClose();
                                }}
                            >
                                {confirmLabel}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
