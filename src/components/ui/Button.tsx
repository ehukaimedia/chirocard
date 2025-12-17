import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary/80 backdrop-blur-md text-white shadow-lg shadow-primary/20 border border-white/20 hover:bg-primary/90": variant === "primary",
                        "bg-secondary/80 backdrop-blur-md text-white shadow-lg shadow-secondary/20 border border-white/20 hover:bg-secondary/90": variant === "secondary",
                        "bg-transparent border-2 border-primary/50 text-primary backdrop-blur-sm hover:bg-primary/10": variant === "outline",
                        "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 backdrop-blur-sm": variant === "ghost",
                        "bg-red-500/80 backdrop-blur-md text-white shadow-lg shadow-red-500/20 border border-white/20 hover:bg-red-600/90": variant === "danger",
                        "h-9 px-4 text-sm": size === "sm",
                        "h-12 px-6 text-base": size === "md",
                        "h-14 px-8 text-lg": size === "lg",
                        "h-10 w-10 p-0": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
