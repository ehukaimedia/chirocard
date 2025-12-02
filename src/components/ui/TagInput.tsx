import React, { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    label: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
    suggestions?: string[];
}

export const TagInput: React.FC<TagInputProps> = ({
    label,
    value = [],
    onChange,
    placeholder = "Type and press Enter...",
    className = "",
    suggestions = []
}) => {
    const [inputValue, setInputValue] = useState("");
    const listId = `datalist-${label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            // Optional: remove last tag on backspace if input is empty
            // removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue("");
        } else if (trimmed && value.includes(trimmed)) {
            setInputValue(""); // Clear duplicate input
        }
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {label}
            </label>
            <div className="flex flex-wrap gap-2 p-2 min-h-[42px] rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
                {value.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/30"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 hover:text-emerald-900 dark:hover:text-emerald-100 focus:outline-none"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag} // Add tag on blur as well
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white min-w-[120px] placeholder:text-zinc-400"
                    list={suggestions.length > 0 ? listId : undefined}
                />
                {suggestions.length > 0 && (
                    <datalist id={listId}>
                        {suggestions.map((suggestion, index) => (
                            <option key={index} value={suggestion} />
                        ))}
                    </datalist>
                )}
            </div>
        </div>
    );
};
