import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Building2,
  Eye,
  Loader2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';

interface TrackingRecord {
  id: string;
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
  office?: {
    id: string;
    name: string;
    kabkota: string;
  };
  tracking: TrackingRecord[];
}

const AdminTrackingMonitor: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [pengajuan, setPengajuan] = useState<PengajuanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if user is superadmin (office_id === null) or regular admin
      const isSuperadmin = user?.office_id === null;
      const endpoint = isSuperadmin ? '/api/tracking/superadmin' : '/api/tracking/admin';
      
      const response = await apiGet(endpoint, token);
      if (response.success) {
        setPengajuan(response.data);
        calculateStats(response.data);
      }
      
    } catch (error) {
      console.error('Error loading tracking data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data tracking',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: PengajuanData[]) => {
    const total = data.length;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    data.forEach(p => {
      if (p.tracking && p.tracking.length > 0) {
        const latestTracking = p.tracking[0]; // Assuming sorted by created_at DESC
        
        if (latestTracking.status_name.includes('Selesai')) {
          completed++;
        } else {
          inProgress++;
          
          // Check if overdue
          if (latestTracking.estimated_days) {
            const estimatedDate = new Date(latestTracking.created_at);
            estimatedDate.setDate(estimatedDate.getDate() + latestTracking.estimated_days);
            
            if (new Date() > estimatedDate) {
              overdue++;
            }
          }
        }
      }
    });

    setStats({ total, completed, inProgress, overdue });
  };

  const handleViewDetails = (pengajuanData: PengajuanData) => {
    setSelectedPengajuan(pengajuanData);
    setIsDialogOpen(true);
  };

  const filteredPengajuan = pengajuan.filter(p => 
    p.pegawai_nip.toLowerCase().includes(search.toLowerCase()) ||
    p.jenis_jabatan.toLowerCase().includes(search.toLowerCase()) ||
    p.office?.kabkota.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeVariant = (statusName: string) => {
    if (statusName.includes('Selesai')) return 'default';
    if (statusName.includes('Diproses')) return 'secondary';
    if (statusName.includes('Disposisi')) return 'outline';
    return 'secondary';
  };

  const getStatusIcon = (statusName: string) => {
    if (statusName.includes('Selesai')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (statusName.includes('Diproses')) return <Clock className="h-4 w-4 text-blue-600" />;
    if (statusName.includes('Disposisi')) return <TrendingUp className="h-4 w-4 text-orange-600" />;
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const isOverdue = (tracking: TrackingRecord) => {
    if (!tracking.estimated_days) return false;
    
    const estimatedDate = new Date(tracking.created_at);
    estimatedDate.setDate(estimatedDate.getDate() + tracking.estimated_days);
    
    return new Date() > estimatedDate && !tracking.status_name.includes('Selesai');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Tracking Dokumen" subtitle="Monitor progress berkas di pusat" />
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
        subtitle="Monitor progress berkas di pusat" 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Berkas</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terlambat</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan NIP, jenis jabatan, atau kabupaten..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pengajuan List */}
      <div className="space-y-4">
        {filteredPengajuan.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data tracking</p>
            </CardContent>
          </Card>
        ) : (
          filteredPengajuan.map((pengajuanData) => {
            const latestTracking = pengajuanData.tracking && pengajuanData.tracking.length > 0 
              ? pengajuanData.tracking[0] 
              : null;
            
            return (
              <Card key={pengajuanData.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{pengajuanData.pegawai_nip}</h3>
                        <Badge variant="outline">{pengajuanData.jenis_jabatan}</Badge>
                        {latestTracking && (
                          <div className="flex items-center gap-2">
                            {getStatusIcon(latestTracking.status_name)}
                            <Badge 
                              variant={getStatusBadgeVariant(latestTracking.status_name)}
                              className={isOverdue(latestTracking) ? 'border-red-500 text-red-700' : ''}
                            >
                              {latestTracking.status_name}
                            </Badge>
                            {isOverdue(latestTracking) && (
                              <Badge variant="destructive" className="text-xs">
                                <Timer className="h-3 w-3 mr-1" />
                                Terlambat
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {pengajuanData.office?.kabkota || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {pengajuanData.total_dokumen} dokumen
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(pengajuanData.final_approved_at).toLocaleDateString('id-ID')}
                        </div>
                        {latestTracking && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {latestTracking.tracked_by_name}
                          </div>
                        )}
                      </div>

                      {/* Latest tracking info */}
                      {latestTracking && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">Catatan: </span>
                              <span className="text-gray-600">
                                {latestTracking.notes || 'Tidak ada catatan'}
                              </span>
                            </div>
                            {latestTracking.estimated_days && (
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-3 w-3" />
                                Estimasi: {latestTracking.estimated_days} hari
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(pengajuanData)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Tracking</DialogTitle>
          </DialogHeader>
          
          {selectedPengajuan && (
            <div className="space-y-6">
              {/* Pengajuan Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedPengajuan.pegawai_nip}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Jenis Jabatan:</span>
                    <p className="text-gray-600">{selectedPengajuan.jenis_jabatan}</p>
                  </div>
                  <div>
                    <span className="font-medium">Kabupaten:</span>
                    <p className="text-gray-600">{selectedPengajuan.office?.kabkota || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Dokumen:</span>
                    <p className="text-gray-600">{selectedPengajuan.total_dokumen}</p>
                  </div>
                  <div>
                    <span className="font-medium">Final Approved:</span>
                    <p className="text-gray-600">
                      {new Date(selectedPengajuan.final_approved_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking History */}
              {selectedPengajuan.tracking && selectedPengajuan.tracking.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-4">Riwayat Tracking</h4>
                  <div className="space-y-3">
                    {selectedPengajuan.tracking.map((track, index) => (
                      <Card key={track.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getStatusIcon(track.status_name)}
                                <Badge 
                                  variant={getStatusBadgeVariant(track.status_name)}
                                  className={isOverdue(track) ? 'border-red-500 text-red-700' : ''}
                                >
                                  {track.status_name}
                                </Badge>
                                {isOverdue(track) && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Timer className="h-3 w-3 mr-1" />
                                    Terlambat
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <User className="h-3 w-3" />
                                  {track.tracked_by_name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(track.created_at).toLocaleString('id-ID')}
                                </div>
                                {track.estimated_days && (
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Estimasi: {track.estimated_days} hari
                                  </div>
                                )}
                                {track.notes && (
                                  <div className="mt-2">
                                    <span className="font-medium">Catatan:</span>
                                    <p className="text-gray-600">{track.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada tracking untuk berkas ini</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrackingMonitor;
