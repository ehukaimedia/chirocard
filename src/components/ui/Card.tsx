import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm text-zinc-950 dark:text-zinc-50",
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

export { Card };
