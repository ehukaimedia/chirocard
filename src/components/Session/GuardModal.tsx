import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Lock, ChevronRight } from "lucide-react";

interface GuardModalProps {
    isOpen: boolean;
    onUnlock: () => void;
    onCancel: () => void;
}

export function GuardModal({ isOpen, onUnlock, onCancel }: GuardModalProps) {
    const [sliderValue, setSliderValue] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setSliderValue(0);
        }
    }, [isOpen]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSliderValue(value);
        if (value >= 95) {
            onUnlock();
        }
    };

    const handleDragEnd = () => {
        if (sliderValue < 95) {
            // Snap back
            setSliderValue(0);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            title="Practitioner Handoff"
            description="Please hand the device to your practitioner."
            hideFooter={true}
        >
            <div className="flex flex-col items-center space-y-8 py-6">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                    <Lock className="w-10 h-10 text-zinc-400" />
                </div>

                <div className="w-full max-w-xs relative h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 select-none">
                    {/* Track Text */}
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-zinc-400 pointer-events-none">
                        Slide to Unlock Kiosk Mode
                    </div>

                    {/* Progress Fill */}
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/20 transition-all duration-75"
                        style={{ width: `${sliderValue}%` }}
                    />

                    {/* Slider Thumb */}
                    <div
                        className="absolute top-1 bottom-1 w-12 bg-white shadow-md rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-75 z-10"
                        style={{ left: `calc(${sliderValue}% - ${sliderValue * 0.48}px)` }}
                    >
                        <ChevronRight className="w-6 h-6 text-emerald-600" />
                    </div>

                    {/* Input Range (Invisible Overlay) */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={handleSliderChange}
                        onMouseUp={handleDragEnd}
                        onTouchEnd={handleDragEnd}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                </div>

                <p className="text-xs text-center text-zinc-500 max-w-[200px]">
                    This will switch the app to Kiosk Mode (Dark Mode) for the session.
                </p>
            </div>
        </Modal>
    );
}
