import { useRef, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "./ui/Button";

export interface SignaturePadRef {
    clear: () => void;
    getTrimmedCanvas: () => HTMLCanvasElement;
    isEmpty: () => boolean;
}

const SignaturePad = forwardRef<SignaturePadRef>((_, ref) => {
    const sigPad = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
        clear: () => sigPad.current?.clear(),
        // Fallback to getCanvas() because getTrimmedCanvas() is throwing a TypeError in this version
        getTrimmedCanvas: () => sigPad.current?.getCanvas()!,
        isEmpty: () => sigPad.current?.isEmpty() ?? true,
    }));

    return (
        <div className="space-y-2">
            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-800">
                <SignatureCanvas
                    ref={sigPad}
                    penColor="#10b981" // Emerald 500
                    canvasProps={{
                        className: "w-full h-40 touch-none",
                    }}
                    backgroundColor="transparent"
                />
            </div>
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sigPad.current?.clear()}
                    className="text-xs text-zinc-500"
                >
                    Clear Signature
                </Button>
            </div>
        </div>
    );
});

SignaturePad.displayName = "SignaturePad";
export { SignaturePad };
