
import React from 'react'
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import TemplateSelection from "./pages/TemplateSelection";
import TemplateForm from "./pages/TemplateForm";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import LetterDetail from "./pages/LetterDetail";
import Letters from "./pages/Letters";
import LetterPrintPreview from "./pages/LetterPrintPreview";
import Users from "./pages/Users";
import { Lock } from 'lucide-react';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // AppLayout handles loading state
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/generator" element={
        <ProtectedRoute>
          <TemplateSelection />
        </ProtectedRoute>
      } />
      <Route path="/generator/create/:templateId" element={
        <ProtectedRoute>
          <TemplateForm />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <AdminRoute>
          <Users />
        </AdminRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/letters/:id" element={
        <ProtectedRoute>
          <LetterDetail />
        </ProtectedRoute>
      } />
      <Route path="/letters" element={
        <ProtectedRoute>
          <Letters />
        </ProtectedRoute>
      } />
      <Route path="/letters/:id/preview" element={<LetterPrintPreview />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = React.useState(false);
  const navigate = useNavigate();
  // Global handler untuk modal sesi berakhir
  React.useEffect(() => {
    window.showSessionExpiredModal = () => setShowSessionExpiredModal(true);
    // Optional: global token update handler
    window.dispatchTokenUpdate = (token) => {
      // Update token di AuthContext jika perlu (bisa trigger refreshUser dsb)
      localStorage.setItem('token', token);
      // Bisa trigger event atau custom logic jika AuthContext support
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global Modal Sesi Berakhir */}
        {showSessionExpiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
              <Lock className="w-16 h-16 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Sesi Berakhir</h2>
              <p className="text-gray-600 mb-6 text-center">Sesi Anda telah habis. Silakan login kembali untuk melanjutkan.</p>
              <button
                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={() => {
                  localStorage.removeItem('token');
                  setShowSessionExpiredModal(false);
                  navigate('/', { replace: true });
                }}
              >
                Login Ulang
              </button>
            </div>
          </div>
        )}
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
