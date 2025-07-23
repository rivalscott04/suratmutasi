
import React from 'react'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
