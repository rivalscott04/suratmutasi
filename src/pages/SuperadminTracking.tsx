import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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
  pegawai?: {
    id?: string;
    nip?: string;
    nama?: string;
  };
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
  const [selectedJabatan, setSelectedJabatan] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    tracked: 0,
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
    let tracked = 0;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    data.forEach(p => {
      if (p.tracking && p.tracking.length > 0) {
        tracked++;
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

    setStats({ tracked, completed, inProgress, overdue });
  };

  const handleViewDetails = (pengajuanData: PengajuanData) => {
    setSelectedPengajuan(pengajuanData);
    setIsDialogOpen(true);
  };

  const filteredPengajuan = pengajuan.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch =
      p.pegawai_nip.toLowerCase().includes(s) ||
      p.jenis_jabatan.toLowerCase().includes(s) ||
      (p.office?.kabkota || '').toLowerCase().includes(s) ||
      (p.pegawai?.nama || '').toLowerCase().includes(s);
    const matchesJabatan = selectedJabatan === 'all' || p.jenis_jabatan === selectedJabatan;
    return matchesSearch && matchesJabatan;
  });

  useEffect(() => {
    // reset ke halaman pertama saat filter berubah
    setCurrentPage(1);
  }, [search, selectedJabatan]);

  const uniqueJabatan = Array.from(new Set(pengajuan.map(p => p.jenis_jabatan))).sort();

  const totalPages = Math.max(1, Math.ceil(filteredPengajuan.length / pageSize));
  const firstIndex = (currentPage - 1) * pageSize;
  const lastIndex = firstIndex + pageSize;
  const paginatedPengajuan = filteredPengajuan.slice(firstIndex, lastIndex);

  const getStatusBadgeVariant = (statusName: string) => {
    // kept for compatibility, not used for color anymore
    return 'secondary';
  };

  const getStatusIcon = (statusName: string) => {
    if (statusName.includes('Selesai')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (statusName.includes('Diproses')) return <Clock className="h-4 w-4 text-blue-600" />;
    if (statusName.includes('Disposisi')) return <TrendingUp className="h-4 w-4 text-orange-600" />;
    return <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadgeClasses = (statusName: string, overdue = false) => {
    if (statusName.includes('Selesai')) return 'bg-green-100 text-green-700 border-green-200';
    if (statusName.includes('Diproses')) return `bg-blue-100 text-blue-700 border-blue-200 ${overdue ? 'border-red-400 text-red-700' : ''}`;
    if (statusName.includes('Disposisi')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (statusName.includes('Menunggu')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
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

      {/* Stats Cards (tracking-focused) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memiliki riwayat tracking</p>
                <p className="text-2xl font-bold">{stats.tracked}</p>
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

      {/* Search & Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari NIP/Nama/Jabatan/Kabupaten..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedJabatan} onValueChange={setSelectedJabatan}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  {uniqueJabatan.map(j => (
                    <SelectItem key={j} value={j}>{j}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datatable */}
      <Card>
        <CardContent className="p-0">
          {filteredPengajuan.length === 0 ? (
            <div className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada data tracking</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIP</TableHead>
                    <TableHead>Nama Pegawai</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Kab/Kota</TableHead>
                    <TableHead>Status Terakhir</TableHead>
                    <TableHead>Estimasi</TableHead>
                    <TableHead>Tgl Final</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPengajuan.map((p) => {
                    const latest = p.tracking && p.tracking.length > 0 ? p.tracking[0] : null;
                    const finalDate = p.final_approved_at ? new Date(p.final_approved_at).toLocaleDateString('id-ID') : 'Belum ditentukan';
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.pegawai_nip}</TableCell>
                        <TableCell>{p.pegawai?.nama || '—'}</TableCell>
                        <TableCell><Badge variant="outline">{p.jenis_jabatan}</Badge></TableCell>
                        <TableCell>{p.office?.kabkota || 'N/A'}</TableCell>
                        <TableCell>
                          {latest ? (
                            <div className="flex items-center gap-2">
                              {getStatusIcon(latest.status_name)}
                              <Badge title={latest.status_name} className={`cursor-default hover:brightness-95 ${getStatusBadgeClasses(latest.status_name, isOverdue(latest))}`}>
                                {latest.status_name}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-500">Belum ada</span>
                          )}
                        </TableCell>
                        <TableCell>{latest?.estimated_days ? `${latest.estimated_days} hari` : '-'}</TableCell>
                        <TableCell>{finalDate}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" className="flex items-center gap-2" onClick={() => handleViewDetails(p)}>
                            <Eye className="h-4 w-4" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredPengajuan.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Menampilkan {firstIndex + 1}-{Math.min(lastIndex, filteredPengajuan.length)} dari {filteredPengajuan.length}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mr-2">
              <span>Tampilkan</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[84px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per halaman</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Sebelumnya
            </Button>
            <span className="text-sm">Hal {currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Berikutnya
            </Button>
          </div>
        </div>
      )}

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
                <div className="mb-2">
                  <h3 className="font-semibold text-xl leading-tight">{selectedPengajuan.pegawai?.nama || '-'}</h3>
                  <div className="text-xs text-gray-500 mt-1 font-mono">NIP: {selectedPengajuan.pegawai_nip}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Jenis Jabatan:</span>
                    <p className="text-gray-600">{selectedPengajuan.jenis_jabatan}</p>
                  </div>
                  <div>
                    <span className="font-medium">Kabupaten/Kota:</span>
                    <p className="text-gray-600">{selectedPengajuan.office?.kabkota || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Dokumen:</span>
                    <p className="text-gray-600">{selectedPengajuan.total_dokumen}</p>
                  </div>
                  <div>
                    <span className="font-medium">Final Approved:</span>
                    <p className="text-gray-600">
                      {selectedPengajuan.final_approved_at ? new Date(selectedPengajuan.final_approved_at).toLocaleDateString('id-ID') : 'Belum ditentukan'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking History */}
              {selectedPengajuan.tracking && selectedPengajuan.tracking.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-4">Riwayat Tracking</h4>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                    <div className="space-y-6">
                      {selectedPengajuan.tracking.map((track) => (
                        <div key={track.id} className="relative">
                          <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-green-600 ring-2 ring-white" />
                          <div className="rounded-md border p-3">
                          <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(track.status_name)}
                              <Badge title={track.status_name} className={`cursor-default hover:brightness-95 ${getStatusBadgeClasses(track.status_name, isOverdue(track))}`}>
                                {track.status_name}
                              </Badge>
                              {isOverdue(track) && (
                                <Badge variant="destructive" className="text-xs">
                                  <Timer className="h-3 w-3 mr-1" /> Terlambat
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                              <div className="flex items-center gap-1"><User className="h-3 w-3" />{track.tracked_by_name}</div>
                              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(track.created_at).toLocaleString('id-ID')}</div>
                              {track.estimated_days && (
                                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />Estimasi: {track.estimated_days} hari</div>
                              )}
                            </div>
                            {track.notes && (
                              <div className="mt-2 text-sm text-gray-700">{track.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
