
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from './NavigationBar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { apiGet, apiPut } from '@/lib/api';
import { Button } from './ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, token, refreshUser } = useAuth();
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (user && !user.office_id) {
      setShowOfficeModal(true);
      if (token) {
        apiGet('/api/offices', token).then(res => setOffices(res.offices || []));
      }
    } else {
      setShowOfficeModal(false);
    }
  }, [user, token]);

  const handleSaveOffice = async () => {
    if (!selectedOffice || !user || !token) return;
    setSaving(true);
    try {
      await apiPut(`/api/users/${user.id}/office`, { office_id: selectedOffice }, token);
      await refreshUser();
      setNotif({ success: true, message: 'Kantor berhasil dipilih dan terhubung ke akun Anda.' });
      setShowOfficeModal(false);
    } catch (err: any) {
      setNotif({ success: false, message: 'Gagal menghubungkan kantor: ' + (err.message || 'Terjadi kesalahan.') });
    } finally {
      setSaving(false);
    }
  };

  if (!user && token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Dialog open={showOfficeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Kantor/Kabupaten/Kota</DialogTitle>
            <DialogDescription>
              Silakan pilih kantor/kabupaten/kota yang sesuai. Anda hanya bisa memilih satu kali dan tidak bisa diubah lagi.
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kantor/kabupaten/kota..." />
            </SelectTrigger>
            <SelectContent>
              {offices.map((office: any) => (
                <SelectItem key={office.id} value={office.id}>
                  {office.kabkota} - {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleSaveOffice} disabled={!selectedOffice || saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {notif && (
        <Dialog open={!!notif} onOpenChange={() => setNotif(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{notif.success ? 'Berhasil' : 'Gagal'}</DialogTitle>
              <DialogDescription>{notif.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setNotif(null)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppLayout;
