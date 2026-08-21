/** Token classes with AA contrast for pain 0–10. Index = level. */
export const PAIN_LEVEL_CLASSES = [
    "bg-zinc-50 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-600",
    "bg-sky-50 text-sky-950 border-sky-300 dark:bg-sky-950 dark:text-sky-50 dark:border-sky-700",
    "bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-900 dark:text-sky-50 dark:border-sky-600",
    "bg-amber-50 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-50 dark:border-amber-700",
    "bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-900 dark:text-amber-50 dark:border-amber-600",
    "bg-orange-100 text-orange-950 border-orange-400 dark:bg-orange-950 dark:text-orange-50 dark:border-orange-600",
    "bg-orange-200 text-orange-950 border-orange-500 dark:bg-orange-900 dark:text-orange-50 dark:border-orange-500",
    "bg-red-600 text-white border-red-800 dark:bg-red-700 dark:text-white dark:border-red-400",
    "bg-red-700 text-white border-red-900 dark:bg-red-800 dark:text-white dark:border-red-300",
    "bg-red-800 text-white border-red-950 dark:bg-red-900 dark:text-white dark:border-red-300",
    "bg-red-900 text-white border-black dark:bg-red-950 dark:text-white dark:border-red-200",
] as const;

export function painLevelClass(level: number): string {
    const index = Math.max(0, Math.min(10, Math.round(level)));
    return PAIN_LEVEL_CLASSES[index];
}
