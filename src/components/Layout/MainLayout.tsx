import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function MainLayout() {
    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
            <div className="pb-20 md:pb-0">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
}
