import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Intake from "./pages/Intake";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import GuestSession from "./pages/GuestSession";
import { useAppStore } from "./store/useAppStore";

function ProtectedGuestRoute({ children }: { children: React.ReactElement }) {
  const { mode } = useAppStore();
  if (mode !== "guest") {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/team" element={<Team />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route
          path="/guest-session"
          element={
            <ProtectedGuestRoute>
              <GuestSession />
            </ProtectedGuestRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
