import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
            <div className="flex-1">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
}
