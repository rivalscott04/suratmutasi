
import React, { useState, useEffect, Suspense, lazy } from 'react'
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import SessionManager from "@/components/SessionManager";
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
const AuditLogPage = lazy(() => import("./pages/AuditLogPage"));
const JobTypeConfiguration = lazy(() => import("./pages/JobTypeConfiguration"));
const AdminWilayahDashboard = lazy(() => import("./pages/AdminWilayahDashboard"));
const AdminWilayahUploadPage = lazy(() => import("./pages/AdminWilayahUploadPage"));
const AdminPusatTracking = lazy(() => import("./pages/AdminPusatTracking"));
const AdminTrackingMonitor = lazy(() => import("./pages/SuperadminTracking"));
const TrackingStatusSettings = lazy(() => import("./pages/TrackingStatusSettings"));
const SKForm = lazy(() => import("./components/SKForm"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const TutorialPage = lazy(() => import("./pages/Tutorial"));

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
  
  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'admin_wilayah' && user.role !== 'kanwil')) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const AdminOrUserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || (user.role !== 'admin' && user.role !== 'user')) {
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

const AdminPusatRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user || user.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

const MaintenanceRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isMaintenanceMode } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If maintenance mode is active and user is not superadmin, show maintenance page
  if (isMaintenanceMode && (!user || user.role !== 'admin' || user.office_id !== null)) {
    return <MaintenancePage />;
  }
  
  return <>{children}</>;
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
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/generator" element={
        <MaintenanceRoute>
          <AdminOperatorRoute>
            <Suspense fallback={<PageLoading />}>
              <TemplateSelection />
            </Suspense>
          </AdminOperatorRoute>
        </MaintenanceRoute>
      } />
      <Route path="/generator/create/:templateId" element={
        <MaintenanceRoute>
          <AdminOperatorRoute>
            <Suspense fallback={<PageLoading />}>
              <TemplateForm />
            </Suspense>
          </AdminOperatorRoute>
        </MaintenanceRoute>
      } />
      <Route path="/generator/sk" element={
        <MaintenanceRoute>
          <AdminOrUserRoute>
            <Suspense fallback={<PageLoading />}>
              <SKForm />
            </Suspense>
          </AdminOrUserRoute>
        </MaintenanceRoute>
      } />
      <Route path="/users" element={
        <MaintenanceRoute>
          <AdminRoute>
            <Suspense fallback={<PageLoading />}>
              <Users />
            </Suspense>
          </AdminRoute>
        </MaintenanceRoute>
      } />
      <Route path="/settings" element={
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <Settings />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/letters/:id" element={
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <LetterDetail />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/letters" element={
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <Letters />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/letters/:id/preview" element={
        <MaintenanceRoute>
          <Suspense fallback={<PageLoading />}>
            <LetterPrintPreview />
          </Suspense>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan" element={
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <PengajuanIndex />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan/select" element={
        <MaintenanceRoute>
          <AdminOperatorRoute>
            <Suspense fallback={<PageLoading />}>
              <PengajuanSelect />
            </Suspense>
          </AdminOperatorRoute>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan/:pengajuanId" element={
        <MaintenanceRoute>
          <ProtectedRoute>
            <Suspense fallback={<PageLoading />}>
              <PengajuanDetail />
            </Suspense>
          </ProtectedRoute>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/upload" element={
        <MaintenanceRoute>
          <AdminOperatorRoute>
            <Suspense fallback={<PageLoading />}>
              <PengajuanFileUpload />
            </Suspense>
          </AdminOperatorRoute>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/edit" element={
        <MaintenanceRoute>
          <AdminOperatorRoute>
            <Suspense fallback={<PageLoading />}>
              <PengajuanEdit />
            </Suspense>
          </AdminOperatorRoute>
        </MaintenanceRoute>
      } />
      <Route path="/pengajuan/:pengajuanId/audit-log" element={
        <MaintenanceRoute>
          <AdminRoute>
            <Suspense fallback={<PageLoading />}>
              <AuditLogPage />
            </Suspense>
          </AdminRoute>
        </MaintenanceRoute>
      } />
      <Route path="/job-type-configuration" element={
        <MaintenanceRoute>
          <AdminRoute>
            <Suspense fallback={<PageLoading />}>
              <JobTypeConfiguration />
            </Suspense>
          </AdminRoute>
        </MaintenanceRoute>
      } />
      <Route path="/tracking-status-settings" element={
        <MaintenanceRoute>
          <AdminPusatRoute>
            <Suspense fallback={<PageLoading />}> 
              <TrackingStatusSettings />
            </Suspense>
          </AdminPusatRoute>
        </MaintenanceRoute>
      } />
      
      {/* Admin Wilayah Routes */}
      <Route path="/admin-wilayah/dashboard" element={
        <MaintenanceRoute>
          <AdminWilayahRoute>
            <Suspense fallback={<PageLoading />}>
              <AdminWilayahDashboard />
            </Suspense>
          </AdminWilayahRoute>
        </MaintenanceRoute>
      } />
      <Route path="/admin-wilayah/upload/:pengajuanId" element={
        <MaintenanceRoute>
          <AdminWilayahRoute>
            <Suspense fallback={<PageLoading />}>
              <AdminWilayahUploadPage />
            </Suspense>
          </AdminWilayahRoute>
        </MaintenanceRoute>
      } />
      
      {/* Tracking Routes */}
      <Route path="/tracking" element={
        <MaintenanceRoute>
          <AdminPusatRoute>
            <Suspense fallback={<PageLoading />}>
              <AdminPusatTracking />
            </Suspense>
          </AdminPusatRoute>
        </MaintenanceRoute>
      } />
      <Route path="/tutorial" element={
        <MaintenanceRoute>
          <AdminPusatRoute>
            <Suspense fallback={<PageLoading />}>
              <TutorialPage />
            </Suspense>
          </AdminPusatRoute>
        </MaintenanceRoute>
      } />
      <Route path="/tracking-monitor" element={
        <MaintenanceRoute>
          <AdminRoute>
            <Suspense fallback={<PageLoading />}>
              <AdminTrackingMonitor />
            </Suspense>
          </AdminRoute>
        </MaintenanceRoute>
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

    // Handle global errors - HANYA untuk 401 (token expired), BUKAN 403 (forbidden/permission)
    // 403 = akses ditolak (misal role tidak punya izin), bukan sesi berakhir
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.error && typeof event.error === 'object') {
        const error = event.error as any;
        // Hanya 401 yang dianggap sesi berakhir
        if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          event.preventDefault();
          const currentPath = window.location.pathname;
          const isOnLoginPage = currentPath === '/' || currentPath === '/login';
          
          if (!isOnLoginPage && window.showSessionExpiredModal) {
            window.showSessionExpiredModal();
          }
        }
      }
    };

    // Handle unhandled promise rejections (fetch errors) - HANYA 401
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason as any;
        // Hanya 401 yang dianggap sesi berakhir
        if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          event.preventDefault();
          const currentPath = window.location.pathname;
          const isOnLoginPage = currentPath === '/' || currentPath === '/login';
          
          if (!isOnLoginPage && window.showSessionExpiredModal) {
            window.showSessionExpiredModal();
          }
        }
      }
    };

    // Intercept fetch requests - HANYA untuk 401 (sesi berakhir), JANGAN intercept 403 (forbidden/permission)
    // 403 harus dibiarkan lewat agar pesan error dari backend bisa ditampilkan ke user
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Hanya 401 yang trigger session expired modal, 403 dibiarkan (permission error, bukan session)
        if (response.status === 401) {
          const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
          // Don't intercept auth-related requests (refresh, login, etc.)
          if (!url.includes('/api/auth/')) {
            const currentPath = window.location.pathname;
            const isOnLoginPage = currentPath === '/' || currentPath === '/login';
            
            if (!isOnLoginPage && window.showSessionExpiredModal) {
              window.showSessionExpiredModal();
            }
          }
        }
        
        // Selalu return response asli (tidak replace body) agar error message dari backend bisa dibaca
        return response;
      } catch (error) {
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
                  try {
                    // Hapus token storage secara paksa
                    localStorage.removeItem('token');
                  } catch {}
                  // Panggil logout dari AuthContext (best-effort)
                  try { logout(); } catch {}
                  setShowSessionExpiredModal(false);
                  // Hard redirect untuk memastikan state bersih
                  try { window.location.assign('/'); } catch {
                    navigate('/', { replace: true });
                  }
                }}
              >
                Login Ulang
              </button>
            </div>
          </div>
        )}
        <AuthProvider>
          <SessionManager>
            <AppRoutes />
          </SessionManager>
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
