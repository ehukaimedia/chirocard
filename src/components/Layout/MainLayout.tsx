import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";


export function MainLayout() {
    return (
        <div className="min-h-screen bg-glass-gradient text-glass-text flex flex-col relative overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 pb-24 pt-safe pb-safe px-4 overflow-y-auto h-screen scrollbar-hide">
                <div className="max-w-md mx-auto w-full pt-4">
                    <Outlet />
                </div>

                {/* Pad the bottom so content isn't hidden behind the floating nav */}
                <div className="h-24" />
            </main>

            <BottomNav />
        </div>
    );
}
