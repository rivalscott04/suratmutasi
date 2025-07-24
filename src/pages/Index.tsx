
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
    setIsLoading(true);

    try {
      await login(email, password);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Email atau password tidak valid.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/src/assets/logo-kemenag.png"
              alt="Logo Kementerian Agama"
              className="w-16 h-16 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Sistem Surat Mutasi
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            Kanwil Kemenag Provinsi NTB
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 relative">
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
                  onKeyDown={handleKeyDown}
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
              className="w-full h-11 text-base font-medium bg-green-600 hover:bg-green-700 text-white relative z-20"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Login Gagal
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowErrorModal(false)}
              variant="outline"
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
