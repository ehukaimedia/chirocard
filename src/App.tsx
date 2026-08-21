import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { MainLayout } from "./components/Layout/MainLayout";
import { useNotifications } from "./hooks/useNotifications";
import { PersistenceNotice } from "./hooks/PersistenceNotice";
import { useDataStore } from "./store/useDataStore";
import { loadAnalytics } from "./utils/analytics";
import { Skeleton } from "./components/ui/Skeleton";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Intake = lazy(() => import("./pages/Intake"));
const Profile = lazy(() => import("./pages/Profile"));
const Team = lazy(() => import("./pages/Team"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Journal = lazy(() => import("./pages/Journal"));
const SessionDetails = lazy(() => import("./pages/SessionDetails"));
const SessionReport = lazy(() => import("./pages/SessionReport"));
const Settings = lazy(() => import("./pages/Settings"));
const SessionActive = lazy(() => import("./pages/SessionActive"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg p-6 space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function App() {
  useNotifications();

  useEffect(() => {
    useDataStore.getState().initialize();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <>
      <PersistenceNotice />
      <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </BrowserRouter>
    </>
  );
}

export default App;
