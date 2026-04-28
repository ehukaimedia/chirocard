import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, Loader2, Hospital } from "lucide-react";
import { searchPlaces, type PlaceResult } from "../../services/places";

interface PlaceSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (place: PlaceResult) => void;
    userLocation?: { lat: number; lon: number };
}

export function PlaceSearchModal({ isOpen, onClose, onSelect, userLocation }: PlaceSearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PlaceResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 3) {
                setIsLoading(true);
                const places = await searchPlaces(query, userLocation);
                setResults(places);
                setIsLoading(false);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, userLocation]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white/10 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] neon-border"
                    >
                        <div className="p-6 border-b border-white/10 dark:border-zinc-800/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Hospital className="w-6 h-6 text-emerald-400" />
                                    Find Clinic
                                </h3>
                                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search for a clinic or practitioner..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-white/5 dark:bg-zinc-950/30 border border-white/10 dark:border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-zinc-500 transition-all"
                                />
                                {isLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {results.length > 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-3"
                                    >
                                        {results.map((place, idx) => (
                                            <motion.button
                                                key={place.place_id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => onSelect(place)}
                                                className="w-full group text-left p-4 rounded-2xl bg-white/5 dark:bg-zinc-800/20 border border-white/5 dark:border-zinc-800/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all relative overflow-hidden active:scale-[0.98]"
                                            >
                                                <div className="relative z-10">
                                                    <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate mb-1">
                                                        {place.name || place.display_name.split(',')[0]}
                                                    </h4>
                                                    <div className="flex items-start gap-2 text-zinc-400">
                                                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                                        <p className="text-sm line-clamp-2">{place.display_name}</p>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : query.length >= 3 && !isLoading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 text-center text-zinc-500"
                                    >
                                        No results found for "{query}"
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 text-center"
                                    >
                                        <div className="w-16 h-16 bg-white/5 dark:bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                            <Search className="w-8 h-8 text-zinc-600" />
                                        </div>
                                        <p className="text-zinc-500">Start typing to find clinical locations</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
