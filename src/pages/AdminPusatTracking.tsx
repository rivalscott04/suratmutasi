import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Edit,
  Package,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

interface TrackingStatus {
  id: number;
  status_name: string;
  status_code: string;
  description?: string;
  sort_order: number;
}

interface TrackingRecord {
  id: string;
  tracking_status_id?: number;
  status_name: string;
  notes?: string;
  estimated_days?: number;
  actual_completion_date?: string;
  created_at: string;
  tracked_by_name: string;
}

interface PengajuanData {
  id: string;
  pegawai_nip: string;
  jenis_jabatan: string;
  total_dokumen: number;
  final_approved_at: string;
  pegawai?: {
    nama: string;
    nip: string;
    office?: {
      nama_kantor: string;
      alamat: string;
    };
  };
  office?: {
    id: string;
    nama_kantor: string;
    kabkota: string;
    alamat: string;
  };
  tracking?: Array<{
    id: string;
    tracking_status_id?: number;
    status_name: string;
    notes?: string;
    estimated_days?: number;
    created_at: string;
    tracked_by_name: string;
  }>;
}

const AdminPusatTracking: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [pengajuan, setPengajuan] = useState<PengajuanData[]>([]);
  const [trackingStatuses, setTrackingStatuses] = useState<TrackingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    tracking_status_id: '',
    notes: '',
    estimated_days: ''
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pengajuan yang sudah final approved
      const pengajuanResponse = await apiGet('/api/tracking/pengajuan', token);
      if (pengajuanResponse.success) {
        setPengajuan(pengajuanResponse.data);
      }
      
      // Load tracking status master
      const statusResponse = await apiGet('/api/tracking/status-master', token);
      if (statusResponse.success) {
        setTrackingStatuses(statusResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pengajuanData: PengajuanData) => {
    setSelectedPengajuan(pengajuanData);
    
    // Ambil status tracking terbaru sebagai default
    const latestTracking = getLatestTracking(pengajuanData);
    const defaultStatusId = latestTracking ? latestTracking.tracking_status_id?.toString() : '';
    
    console.log('Latest tracking:', latestTracking);
    console.log('Default status ID:', defaultStatusId);
    
    setFormData({
      tracking_status_id: defaultStatusId || '',
      notes: '',
      estimated_days: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPengajuan || !formData.tracking_status_id) {
      toast({
        title: 'Error',
        description: 'Status tracking harus diisi',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await apiPost(
        `/api/tracking/pengajuan/${selectedPengajuan.id}`,
        {
          tracking_status_id: parseInt(formData.tracking_status_id),
          notes: formData.notes || null,
          estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : null
        },
        token
      );

      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Status tracking berhasil disimpan'
        });
        
        setIsDialogOpen(false);
        loadData(); // Reload data
      }
      
    } catch (error) {
      console.error('Error submitting tracking:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan status tracking',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getLatestTracking = (pengajuan: PengajuanData) => {
    if (!pengajuan.tracking || pengajuan.tracking.length === 0) return null;
    return pengajuan.tracking[0]; // Assuming tracking is sorted by created_at DESC
  };

  const filteredPengajuan = pengajuan.filter(p => {
    const matchesSearch = p.pegawai_nip.toLowerCase().includes(search.toLowerCase()) ||
      p.jenis_jabatan.toLowerCase().includes(search.toLowerCase()) ||
      p.office?.kabkota.toLowerCase().includes(search.toLowerCase()) ||
      p.office?.nama_kantor.toLowerCase().includes(search.toLowerCase()) ||
      p.pegawai?.nama.toLowerCase().includes(search.toLowerCase());
    
    const matchesJabatan = selectedJabatan === 'all' || p.jenis_jabatan === selectedJabatan;
    
    // Filter by tracking status
    const latestTracking = getLatestTracking(p);
    let matchesStatus = true;
    
    if (selectedStatus === 'all') {
      matchesStatus = true;
    } else if (selectedStatus === 'no-tracking') {
      matchesStatus = latestTracking === null;
    } else {
      matchesStatus = latestTracking?.status_name === selectedStatus;
    }
    
    return matchesSearch && matchesJabatan && matchesStatus;
  });

  const getUniqueJabatan = () => {
    const jabatanSet = new Set(pengajuan.map(p => p.jenis_jabatan));
    const uniqueJabatan = Array.from(jabatanSet).sort();
    console.log('Unique jabatan:', uniqueJabatan);
    return uniqueJabatan;
  };


  const getStatusBadgeVariant = (statusName: string) => {
    if (statusName.includes('Selesai')) return 'default';
    if (statusName.includes('Diproses')) return 'secondary';
    if (statusName.includes('Disposisi')) return 'outline';
    return 'secondary';
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Status selesai/completed - Hijau
    if (statusLower.includes('selesai') || statusLower.includes('completed')) {
      return 'bg-green-100 text-green-800';
    }
    
    // Status diterima/received - Biru
    if (statusLower.includes('diterima') || statusLower.includes('received') || statusLower.includes('pusat')) {
      return 'bg-blue-100 text-blue-800';
    }
    
    // Status dalam proses/in progress - Orange
    if (statusLower.includes('proses') || statusLower.includes('progress') || statusLower.includes('sedang')) {
      return 'bg-orange-100 text-orange-800';
    }
    
    // Status menunggu/waiting - Kuning
    if (statusLower.includes('menunggu') || statusLower.includes('waiting') || statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    // Status ditolak/rejected - Merah
    if (statusLower.includes('ditolak') || statusLower.includes('rejected') || statusLower.includes('gagal')) {
      return 'bg-red-100 text-red-800';
    }
    
    // Status review/verifikasi - Ungu
    if (statusLower.includes('review') || statusLower.includes('verifikasi') || statusLower.includes('cek')) {
      return 'bg-purple-100 text-purple-800';
    }
    
    // Status default - Abu-abu
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Status selesai/completed
    if (statusLower.includes('selesai') || statusLower.includes('completed') || statusLower.includes('selesai')) {
      return <CheckCircle className="h-4 w-4" />;
    }
    
    // Status diterima/received
    if (statusLower.includes('diterima') || statusLower.includes('received') || statusLower.includes('pusat')) {
      return <Package className="h-4 w-4" />;
    }
    
    // Status dalam proses/in progress
    if (statusLower.includes('proses') || statusLower.includes('progress') || statusLower.includes('sedang')) {
      return <Loader2 className="h-4 w-4" />;
    }
    
    // Status menunggu/waiting
    if (statusLower.includes('menunggu') || statusLower.includes('waiting') || statusLower.includes('pending')) {
      return <Clock className="h-4 w-4" />;
    }
    
    // Status ditolak/rejected
    if (statusLower.includes('ditolak') || statusLower.includes('rejected') || statusLower.includes('gagal')) {
      return <XCircle className="h-4 w-4" />;
    }
    
    // Status review/verifikasi
    if (statusLower.includes('review') || statusLower.includes('verifikasi') || statusLower.includes('cek')) {
      return <Search className="h-4 w-4" />;
    }
    
    // Status default
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatEstimatedDays = (days: number) => {
    if (days === 1) return '1 hari';
    if (days < 7) return `${days} hari`;
    if (days < 30) return `${Math.ceil(days / 7)} minggu`;
    return `${Math.ceil(days / 30)} bulan`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Tracking Dokumen" subtitle="Input status tracking untuk berkas yang sudah final approved" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader 
        title="Tracking Dokumen" 
        subtitle="Input status tracking untuk berkas yang sudah final approved" 
      />

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan NIP, jenis jabatan, atau kabupaten..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-64">
              <Select
                value={selectedJabatan}
                onValueChange={setSelectedJabatan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  {getUniqueJabatan().map((jabatan) => (
                    <SelectItem key={jabatan} value={jabatan}>
                      {jabatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="no-tracking">Belum Ada Tracking</SelectItem>
                  {trackingStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.status_name}>
                      {status.status_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(search || selectedJabatan !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedJabatan('all');
                  setSelectedStatus('all');
                }}
                className="px-4"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pengajuan List */}
      <div className="space-y-4">
        {filteredPengajuan.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada berkas yang perlu ditrack</p>
            </CardContent>
          </Card>
        ) : (
          filteredPengajuan.map((pengajuanData) => {
            const latestTracking = getLatestTracking(pengajuanData);
            const hasTracking = latestTracking !== null;
            
            return (
              <Card key={pengajuanData.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header dengan NIP dan Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-bold text-xl text-gray-900">{pengajuanData.pegawai_nip}</h3>
                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
                          {pengajuanData.jenis_jabatan}
                        </Badge>
                      </div>
                      
                      {/* Informasi Detail */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{pengajuanData.pegawai?.nama || 'Nama tidak tersedia'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span>{pengajuanData.office?.kabkota || pengajuanData.office?.nama_kantor || 'Lokasi tidak tersedia'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{pengajuanData.total_dokumen} dokumen</span>
                        </div>
                        
                        {/* Estimasi atau Status */}
                        {hasTracking ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Estimasi: {latestTracking.estimated_days ? formatEstimatedDays(latestTracking.estimated_days) : 'Belum ada estimasi'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Belum ada estimasi</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Tracking */}
                      {hasTracking && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(latestTracking.status_name)}`}>
                            {getStatusIcon(latestTracking.status_name)}
                            <span>{latestTracking.status_name}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {hasTracking && latestTracking.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">"{latestTracking.notes}"</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenDialog(pengajuanData)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {hasTracking ? 'Update Tracking' : 'Input Tracking'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Tracking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Status Tracking</DialogTitle>
          </DialogHeader>
          
          {selectedPengajuan && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedPengajuan.pegawai?.nama || selectedPengajuan.pegawai_nip}</p>
                <p className="text-sm text-gray-600">NIP: {selectedPengajuan.pegawai_nip}</p>
                <p className="text-sm text-gray-600">{selectedPengajuan.jenis_jabatan}</p>
                <p className="text-sm text-gray-600">{selectedPengajuan.office?.kabkota || selectedPengajuan.office?.nama_kantor || 'N/A'}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Update Status Tracking *</Label>
                  <Select
                    value={formData.tracking_status_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tracking_status_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status tracking baru" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackingStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    placeholder="Catatan tambahan (opsional)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="estimated_days">Estimasi Penyelesaian (hari)</Label>
                  <Input
                    id="estimated_days"
                    type="number"
                    placeholder="Contoh: 2"
                    value={formData.estimated_days}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive integers
                      if (value === '' || /^\d+$/.test(value)) {
                        setFormData(prev => ({ ...prev, estimated_days: value }));
                      }
                    }}
                    min="1"
                    step="1"
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.tracking_status_id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatTracking;
