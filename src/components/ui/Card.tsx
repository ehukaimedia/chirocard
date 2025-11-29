import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm text-zinc-950 dark:text-zinc-50",
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

export { Card };
