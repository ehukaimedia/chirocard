import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Intake from "./pages/Intake";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import SessionDetails from "./pages/SessionDetails";
import SessionReport from "./pages/SessionReport";
import Settings from "./pages/Settings";
import { MainLayout } from "./components/Layout/MainLayout";
import SessionActive from "./pages/SessionActive";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";


import { useNotifications } from "./hooks/useNotifications";
import { usePersistence } from "./hooks/usePersistence";
import { useDataStore } from "./store/useDataStore";
import { loadAnalytics } from "./utils/analytics";
import { useEffect } from "react";

function App() {
  useNotifications();
  usePersistence();

  // Initialize Data Layer (SQLite/Dexie)
  useEffect(() => {
    useDataStore.getState().initialize();
  }, []);

  // Load analytics only for returning users who already opted in.
  // First-time / declined users get nothing until they accept the banner.
  useEffect(() => {
    loadAnalytics();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/session/:id" element={<SessionDetails />} />
          <Route path="/session/:id/report" element={<SessionReport />} />
        </Route>

        <Route path="/intake" element={<Intake />} />
        <Route path="/session-active" element={<SessionActive />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
