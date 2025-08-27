
import React, { useState, useEffect, Suspense, lazy } from 'react'
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { Lock } from 'lucide-react';

// Lazy load all pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const TemplateSelection = lazy(() => import("./pages/TemplateSelection"));
const TemplateForm = lazy(() => import("./pages/TemplateForm"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Index = lazy(() => import("./pages/Index"));
const LetterDetail = lazy(() => import("./pages/LetterDetail"));
const Letters = lazy(() => import("./pages/Letters"));
const LetterPrintPreview = lazy(() => import("./pages/LetterPrintPreview"));
const Users = lazy(() => import("./pages/Users"));
const PengajuanSelect = lazy(() => import("./pages/PengajuanSelect"));
const PengajuanFileUpload = lazy(() => import("./components/PengajuanFileUpload"));
const PengajuanIndex = lazy(() => import("./pages/PengajuanIndex"));
const PengajuanDetail = lazy(() => import("./pages/PengajuanDetail"));
const PengajuanEdit = lazy(() => import("./pages/PengajuanEdit"));
const JobTypeConfiguration = lazy(() => import("./pages/JobTypeConfiguration"));
const AdminWilayahDashboard = lazy(() => import("./pages/AdminWilayahDashboard"));
const AdminWilayahUploadPage = lazy(() => import("./pages/AdminWilayahUploadPage"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
  </div>
);

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

const AdminWilayahRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'admin_wilayah') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<PageLoading />}>
          <Index />
        </Suspense>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <Dashboard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/generator" element={
        <AdminOperatorRoute>
          <Suspense fallback={<PageLoading />}>
            <TemplateSelection />
          </Suspense>
        </AdminOperatorRoute>
      } />
      <Route path="/generator/create/:templateId" element={
        <AdminOperatorRoute>
          <Suspense fallback={<PageLoading />}>
            <TemplateForm />
          </Suspense>
        </AdminOperatorRoute>
      } />
      <Route path="/users" element={
        <AdminRoute>
          <Suspense fallback={<PageLoading />}>
            <Users />
          </Suspense>
        </AdminRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <Settings />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/letters/:id" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <LetterDetail />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/letters" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <Letters />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/letters/:id/preview" element={
        <Suspense fallback={<PageLoading />}>
          <LetterPrintPreview />
        </Suspense>
      } />
      <Route path="/pengajuan" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <PengajuanIndex />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/pengajuan/select" element={
        <AdminOperatorRoute>
          <Suspense fallback={<PageLoading />}>
            <PengajuanSelect />
          </Suspense>
        </AdminOperatorRoute>
      } />
      <Route path="/pengajuan/:pengajuanId" element={
        <ProtectedRoute>
          <Suspense fallback={<PageLoading />}>
            <PengajuanDetail />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/upload" element={
        <AdminOperatorRoute>
          <Suspense fallback={<PageLoading />}>
            <PengajuanFileUpload />
          </Suspense>
        </AdminOperatorRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/edit" element={
        <AdminOperatorRoute>
          <Suspense fallback={<PageLoading />}>
            <PengajuanEdit />
          </Suspense>
        </AdminOperatorRoute>
      } />
      <Route path="/job-type-configuration" element={
        <AdminRoute>
          <Suspense fallback={<PageLoading />}>
            <JobTypeConfiguration />
          </Suspense>
        </AdminRoute>
      } />
      
      {/* Admin Wilayah Routes */}
      <Route path="/admin-wilayah/dashboard" element={
        <AdminWilayahRoute>
          <Suspense fallback={<PageLoading />}>
            <AdminWilayahDashboard />
          </Suspense>
        </AdminWilayahRoute>
      } />
      <Route path="/admin-wilayah/upload/:pengajuanId" element={
        <AdminWilayahRoute>
          <Suspense fallback={<PageLoading />}>
            <AdminWilayahUploadPage />
          </Suspense>
        </AdminWilayahRoute>
      } />
      
      
      <Route path="*" element={
        <Suspense fallback={<PageLoading />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
};

const AppInner = () => {
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Setup global error handling and session expired modal
  useEffect(() => {
    // Setup window functions
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

    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && typeof event.error === 'object') {
        const error = event.error as any;
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
          event.preventDefault();
          // Check if user is on login page
          const currentPath = window.location.pathname;
          const isOnLoginPage = currentPath === '/' || currentPath === '/login';
          
          if (!isOnLoginPage && window.showSessionExpiredModal) {
            window.showSessionExpiredModal();
          }
        }
      }
    };

    // Handle unhandled promise rejections (fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason as any;
        if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
          event.preventDefault();
          // Check if user is on login page
          const currentPath = window.location.pathname;
          const isOnLoginPage = currentPath === '/' || currentPath === '/login';
          
          if (!isOnLoginPage && window.showSessionExpiredModal) {
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
            // Check if user is on login page
            const currentPath = window.location.pathname;
            const isOnLoginPage = currentPath === '/' || currentPath === '/login';
            
            if (!isOnLoginPage && window.showSessionExpiredModal) {
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
      delete window.showSessionExpiredModal;
      delete window.dispatchTokenUpdate;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {showSessionExpiredModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
              <Lock className="w-16 h-16 text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Sesi Berakhir</h2>
              <p className="text-gray-600 mb-6 text-center">Sesi Anda telah habis. Silakan login kembali untuk melanjutkan.</p>
              <button
                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={() => {
                  logout(); // Panggil logout dari AuthContext
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
