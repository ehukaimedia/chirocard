import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Intake from "./pages/Intake";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import History from "./pages/History";
import GuestSession from "./pages/GuestSession";
import SessionDetails from "./pages/SessionDetails";
import SessionReport from "./pages/SessionReport";
import Settings from "./pages/Settings";
import PractitionerKiosk from "./pages/PractitionerKiosk";
import { useAppStore } from "./store/useAppStore";
import { MainLayout } from "./components/Layout/MainLayout";

function ProtectedGuestRoute({ children }: { children: React.ReactElement }) {
  const { mode } = useAppStore();
  if (mode !== "guest") {
    return <Navigate to="/" replace />;
  }
  return children;
}

import { useReminders } from "./hooks/useReminders";
import { usePersistence } from "./hooks/usePersistence";

function App() {
  useReminders();
  usePersistence();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/history" element={<History />} />
          <Route path="/session/:id" element={<SessionDetails />} />
          <Route path="/session/:id/report" element={<SessionReport />} />
        </Route>

        <Route path="/intake" element={<Intake />} />
        <Route path="/practitioner" element={<PractitionerKiosk />} />
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
