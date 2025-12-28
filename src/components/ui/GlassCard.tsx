import React from 'react';
// import { cn } from '../../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'highlight' | 'ghost';
}

export function GlassCard({ className, children, variant = 'default', ...props }: GlassCardProps) {
    const variants = {
        default: "bg-glass-card border-glass-border shadow-glass",
        highlight: "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20",
        ghost: "bg-glass-100 border-transparent shadow-none"
    };

    return (
        <div
            className={`backdrop-blur-md rounded-2xl border p-4 transition-all duration-300 ${variants[variant]} ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    );
}
