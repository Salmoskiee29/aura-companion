import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgeGateProvider } from "@/components/AgeGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardHome from "./pages/dashboard/Home";
import DashboardModels from "./pages/dashboard/Models";
import CreateCharacter from "./pages/dashboard/CreateCharacter";
import MyCharacter from "./pages/dashboard/MyCharacter";
import DashboardChats from "./pages/dashboard/Chats";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/admin/Dashboard";
import ChatterPanel from "./pages/chatter/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AgeGateProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />

                {/* Protected user dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="models" element={<DashboardModels />} />
                  <Route path="create-character" element={<CreateCharacter />} />
                  <Route path="my-character" element={<MyCharacter />} />
                  <Route path="chats" element={<DashboardChats />} />
                  <Route path="billing" element={<Billing />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* Protected standalone pages */}
                <Route path="/chat/:modelId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

                {/* Role-protected dashboards */}
                <Route path="/chatter-panel" element={<RoleProtectedRoute requiredRole="chatter"><ChatterPanel /></RoleProtectedRoute>} />
                <Route path="/admin-panel" element={<RoleProtectedRoute requiredRole="admin"><AdminPanel /></RoleProtectedRoute>} />

                {/* Redirect old routes */}
                <Route path="/models" element={<Navigate to="/dashboard/models" replace />} />
                <Route path="/billing" element={<Navigate to="/dashboard/billing" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                <Route path="/chatter" element={<Navigate to="/chatter-panel" replace />} />
                <Route path="/admin" element={<Navigate to="/admin-panel" replace />} />
                <Route path="/chatter-login" element={<Navigate to="/auth" replace />} />
                <Route path="/admin-login" element={<Navigate to="/auth" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </AgeGateProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
