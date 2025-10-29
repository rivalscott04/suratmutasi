import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

interface TrackingStatus {
  id: number;
  status_name: string;
  status_code: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

const TrackingStatusSettings: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [trackingStatuses, setTrackingStatuses] = useState<TrackingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<TrackingStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    status_name: '',
    status_code: '', // Akan diisi otomatis dengan ID
    description: '',
    is_active: true,
    sort_order: 0
  });

  // Load data
  useEffect(() => {
    loadTrackingStatuses();
  }, []);

  const loadTrackingStatuses = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/tracking/status-master/all', token);
      if (response.success) {
        setTrackingStatuses(response.data);
      }
    } catch (error) {
      console.error('Error loading tracking statuses:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data status tracking',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (status?: TrackingStatus) => {
    if (status) {
      setEditingStatus(status);
      setFormData({
        status_name: status.status_name,
        status_code: status.status_code,
        description: status.description || '',
        is_active: status.is_active,
        sort_order: status.sort_order
      });
    } else {
      setEditingStatus(null);
      setFormData({
        status_name: '',
        status_code: '',
        description: '',
        is_active: true,
        sort_order: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!formData.status_name) {
        toast({
          title: 'Error',
          description: 'Nama status harus diisi',
          variant: 'destructive'
        });
        return;
      }

      // Generate status_code otomatis jika tidak ada
      const submitData = {
        ...formData,
        status_code: editingStatus ? formData.status_code : `status-${Date.now()}`
      };

      let response;
      if (editingStatus) {
        // Update existing status
        response = await apiPut(`/api/tracking/status-master/${editingStatus.id}`, submitData, token);
      } else {
        // Create new status
        response = await apiPost('/api/tracking/status-master', submitData, token);
      }

      if (response.success) {
        toast({
          title: 'Berhasil',
          description: editingStatus ? 'Status tracking berhasil diperbarui' : 'Status tracking berhasil dibuat',
        });
        setIsDialogOpen(false);
        loadTrackingStatuses();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Terjadi kesalahan',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan data',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (status: TrackingStatus) => {
    try {
      const response = await apiDelete(`/api/tracking/status-master/${status.id}`, token);
      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Status tracking berhasil dihapus',
        });
        loadTrackingStatuses();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Gagal menghapus status tracking',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting status:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus data',
        variant: 'destructive'
      });
    }
  };

  const generateStatusCode = (statusName: string) => {
    // Generate ID-based code yang akan diisi otomatis saat save
    return `status-${Date.now()}`;
  };

  const handleStatusNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status_name: value,
      status_code: editingStatus ? prev.status_code : generateStatusCode(value)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Konfigurasi Status Tracking" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Konfigurasi Status Tracking" />
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Master Status Tracking</CardTitle>
                <CardDescription>
                  Kelola status tracking yang tersedia untuk admin pusat
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingStatus ? 'Edit Status Tracking' : 'Tambah Status Tracking'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingStatus 
                        ? 'Perbarui informasi status tracking' 
                        : 'Buat status tracking baru untuk admin pusat'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status_name">Nama Status</Label>
                      <Input
                        id="status_name"
                        value={formData.status_name}
                        onChange={(e) => handleStatusNameChange(e.target.value)}
                        placeholder="Contoh: Diterima di Pusat"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status_code">Kode Status</Label>
                      <Input
                        id="status_code"
                        value={formData.status_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, status_code: e.target.value }))}
                        placeholder="Akan di-generate otomatis"
                        disabled={!editingStatus}
                      />
                      {!editingStatus && (
                        <p className="text-xs text-gray-500">Kode status akan dibuat otomatis saat menyimpan</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Deskripsi status tracking"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="sort_order">Urutan Tampil</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Status Aktif</Label>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                      {submitting ? 'Menyimpan...' : (editingStatus ? 'Perbarui' : 'Simpan')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status Tracking</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Urutan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackingStatuses.map((status) => (
                    <TableRow key={status.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold text-gray-900">{status.status_name}</div>
                      </TableCell>
                      <TableCell>
                        {status.description || '-'}
                      </TableCell>
                      <TableCell>
                        {status.sort_order}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.is_active ? 'default' : 'secondary'} className={status.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}>
                          {status.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(status)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Status Tracking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus status "{status.status_name}"?
                                  <br />
                                  <strong>Perhatian:</strong> Status yang sedang digunakan dalam tracking tidak bisa dihapus.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(status)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {trackingStatuses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ArrowUpDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada status tracking</p>
                <p className="text-sm">Klik "Tambah Status" untuk membuat status pertama</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackingStatusSettings;
