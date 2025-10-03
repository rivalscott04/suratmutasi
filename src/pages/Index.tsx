
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    // Reset states before submission
    setIsLoading(true);
    setShowErrorModal(false);
    setShowSuccessModal(false);

    try {
      await login(email, password);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Email atau password yang Anda masukkan tidak sesuai. Silakan periksa kembali kredensial Anda.');
      // Use setTimeout to ensure state update happens after current execution
      setTimeout(() => {
        setShowErrorModal(true);
      }, 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src={import.meta.env.BASE_URL + 'logo-kemenag.png'}
              alt="Logo Kementerian Agama"
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Si Imut — Sistem Informasi Mutasi
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Kanwil Kemenag Provinsi NTB
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 relative" onKeyDown={(e) => {
            // Prevent any default browser behavior that might interfere
            if (e.key === 'Enter' && isLoading) {
              e.preventDefault();
            }
          }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@kemenag.go.id"
                required
                className="h-11 relative z-20"
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="h-11 pr-10 relative z-20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors z-30"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-medium bg-green-600 hover:bg-green-700 text-white relative z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-green-600" />
                  Sedang masuk...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Login Berhasil
            </DialogTitle>
            <DialogDescription>
              Selamat datang kembali! Anda akan dialihkan ke dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/dashboard');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Lanjutkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={(open) => {
        // Only allow closing via buttons, not by clicking outside
        if (!open) {
          setShowErrorModal(false);
        }
      }}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6 text-red-500" />
              Login Gagal
            </DialogTitle>
            <DialogDescription className="text-left space-y-3">
              <p className="text-red-600 font-medium">
                {errorMessage}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-sm text-red-700 font-medium">Saran untuk mengatasi masalah:</p>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li>Pastikan email yang dimasukkan sudah benar</li>
                  <li>Periksa kembali password Anda</li>
                  <li>Pastikan Caps Lock tidak aktif</li>
                  <li>Hubungi admin jika masalah berlanjut</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              onClick={() => {
                setShowErrorModal(false);
                setPassword(''); // Clear password field
              }}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Coba Lagi
            </Button>
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
