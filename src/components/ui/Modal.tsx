import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";

let _modalOpenCount = 0;
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
    cancelButtonVariant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
    cancelButtonVariant = "ghost",
    className,
    hideFooter = false,
    hideCloseButton = false
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !hideCloseButton) onClose();
            if (e.key !== "Tab" || !dialogRef.current) return;

            const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
                .filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement | null;
            document.addEventListener("keydown", handleKeyDown);
            _modalOpenCount++;
            document.body.style.overflow = "hidden";
            requestAnimationFrame(() => {
                const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
                focusables?.[0]?.focus();
            });
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            if (isOpen) {
                _modalOpenCount = Math.max(0, _modalOpenCount - 1);
                if (_modalOpenCount === 0) {
                    document.body.style.overflow = "unset";
                }
                previousFocusRef.current?.focus();
            }
        };
    }, [isOpen, onClose, hideCloseButton]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !hideCloseButton) onClose();
            }}
        >
            <div
                ref={dialogRef}
                className={`bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] sm:h-auto fixed bottom-0 sm:relative sm:bottom-auto animate-in slide-in-from-bottom duration-200 sm:zoom-in-95 ${className || ''}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
            >
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <h3 id={titleId} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {title}
                    </h3>
                    {!hideCloseButton && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="min-h-11 min-w-11 p-2 inline-flex items-center justify-center text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {description && (
                        <p id={descriptionId} className="text-zinc-600 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                    {children}
                </div>

                {!hideFooter && (
                    <div className="flex justify-end gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant={cancelButtonVariant} onClick={() => {
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
