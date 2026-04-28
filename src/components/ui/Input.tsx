import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: boolean;
    errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, errorMessage, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label htmlFor={props.id} className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error ? "text-red-500 dark:text-red-400" : "text-zinc-700 dark:text-zinc-300"
                    )}>
                        {label} {props.required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-11 w-full rounded-xl border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 text-zinc-900 dark:text-zinc-100",
                        error
                            ? "border-red-500 focus-visible:ring-red-500 dark:border-red-500"
                            : "border-zinc-200 dark:border-zinc-800",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {errorMessage && (
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium animate-in slide-in-from-top-1 fade-in-0">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
