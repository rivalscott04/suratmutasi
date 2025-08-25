
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
import PengajuanSelect from "./pages/PengajuanSelect";
import PengajuanFileUpload from "./components/PengajuanFileUpload";
import PengajuanIndex from "./pages/PengajuanIndex";
import PengajuanDetail from "./pages/PengajuanDetail";
import PengajuanEdit from "./pages/PengajuanEdit";
import JobTypeConfiguration from "./pages/JobTypeConfiguration";
import ErrorBoundary from "./components/ErrorBoundary";
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
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const AdminOperatorRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
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
        <AdminOperatorRoute>
          <TemplateSelection />
        </AdminOperatorRoute>
      } />
      <Route path="/generator/create/:templateId" element={
        <AdminOperatorRoute>
          <TemplateForm />
        </AdminOperatorRoute>
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
      <Route path="/pengajuan" element={
        <ProtectedRoute>
          <PengajuanIndex />
        </ProtectedRoute>
      } />
      <Route path="/pengajuan/select" element={
        <AdminOperatorRoute>
          <PengajuanSelect />
        </AdminOperatorRoute>
      } />
      <Route path="/pengajuan/:pengajuanId" element={
        <ProtectedRoute>
          <PengajuanDetail />
        </ProtectedRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/upload" element={
        <AdminOperatorRoute>
          <PengajuanFileUpload />
        </AdminOperatorRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/edit" element={
        <AdminOperatorRoute>
          <PengajuanEdit />
        </AdminOperatorRoute>
      } />
      <Route path="/job-type-configuration" element={
        <AdminRoute>
          <JobTypeConfiguration />
        </AdminRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppInner = () => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = React.useState(false);
  const navigate = useNavigate();
  
  React.useEffect(() => {
    window.showSessionExpiredModal = () => {
      // Cek apakah sedang di halaman login
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath === '/' || currentPath === '/login';
      
      // Jika sedang di halaman login, jangan tampilkan modal
      if (isOnLoginPage) {
        return;
      }
      
      // Jika di halaman lain, tampilkan modal
      setShowSessionExpiredModal(true);
    };
    window.dispatchTokenUpdate = (token) => {
      localStorage.setItem('token', token);
    };

    // Global error handler untuk catch 403 errors dari nginx atau server lain
    const handleGlobalError = (event: ErrorEvent) => {
      // Check if error is related to HTTP 403
      if (event.error && event.error.message && 
          (event.error.message.includes('403') || event.error.message.includes('Forbidden'))) {
        event.preventDefault();
        if (window.showSessionExpiredModal) {
          window.showSessionExpiredModal();
        }
      }
    };

    // Handle unhandled promise rejections (fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason as any;
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
          event.preventDefault();
          if (window.showSessionExpiredModal) {
            window.showSessionExpiredModal();
          }
        }
      }
    };

    // Intercept fetch requests to catch 403 errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // If we get a 403 response, show session expired modal
        if (response.status === 403) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          // Don't intercept auth-related requests
          if (!url.includes('/api/auth/')) {
            if (window.showSessionExpiredModal) {
              window.showSessionExpiredModal();
            }
            // Return a custom response to prevent the default 403 page
            return new Response(JSON.stringify({ 
              success: false, 
              message: 'Sesi berakhir, silakan login kembali' 
            }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        return response;
      } catch (error) {
        // Re-throw the error if it's not a 403
        throw error;
      }
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSessionExpiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-scale-in">
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/FE' : '/'}>
      <AppInner />
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
