import NotFound from "@/pages/not-found";

import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import App from "@/App";
import { useEffect, useState } from "react";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { useAuthStore } from "@/stores/auth-store";
import { adminRoutes } from "@/const";
import { userRoutes } from "./route-user";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import SoalKecermatanExam from "@/pages/user/soal-kecermatan-detail";

interface LayoutProps {
  children: React.ReactNode;
}

// Loading spinner component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
  </div>
);

const AdminRoutesLayouts: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state?.user?.role);

  // Wait for Zustand persist to hydrate from localStorage before checking auth
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hasHydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || role !== "ADMIN") {
      localStorage.clear();
      navigate("/auth/login", { replace: true });
    }
  }, [hasHydrated, token, role, location.pathname]);

  if (!hasHydrated) return <LoadingScreen />;

  return <App>{children}</App>;
};

const UserRoutesLayouts: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state?.user?.role);

  // Wait for Zustand persist to hydrate from localStorage before checking auth
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hasHydrated) return;
    // Subscribe to hydration completion
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    // Double-check in case hydration already finished before we subscribed
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return; // Don't redirect until hydration is complete
    if (!token || (role !== "USER" && role !== "ADMIN")) {
      const redirectTo = location.pathname + location.search;
      navigate(`/auth/login?${redirectTo}`, { replace: true });
    }
  }, [hasHydrated, token, role, location.pathname]);

  // Show loading spinner while waiting for hydration
  if (!hasHydrated) return <LoadingScreen />;

  return <App>{children}</App>;
};

const UserExamLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state?.user?.role);

  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist.hasHydrated()
  );

  useEffect(() => {
    if (hasHydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || (role !== "USER" && role !== "ADMIN")) {
      const redirectTo = location.pathname + location.search;
      navigate(`/auth/login?${redirectTo}`, { replace: true });
    }
  }, [hasHydrated, token, role, location.pathname]);

  if (!hasHydrated) return <LoadingScreen />;

  return <div className="font-['Poppins'] bg-[#f5f5f5] min-h-screen">{children}</div>;
};

export default function RoutesList() {
  return (
    <Routes>
      {/* Admin routes */}
      <Route
        element={
          <AdminRoutesLayouts>
            <Outlet />
          </AdminRoutesLayouts>
        }
      >
        {adminRoutes}
      </Route>

      {/* User protected routes */}
      <Route
        element={
          <UserRoutesLayouts>
            <Outlet />
          </UserRoutesLayouts>
        }
      >
        {userRoutes}
      </Route>

      {/* User Exam Layout (No Sidebar/Navbar) */}
      <Route
        element={
          <UserExamLayout>
            <Outlet />
          </UserExamLayout>
        }
      >
        <Route path="/soal-kecermatan/:id" element={<SoalKecermatanExam />} />
      </Route>

      {/* Auth pages */}
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register/:affCode?" element={<Register />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password/:jwt" element={<ResetPassword />} />

      {/* Not found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
