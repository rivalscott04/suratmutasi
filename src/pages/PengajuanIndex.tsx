import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiDelete } from '@/lib/api';

interface PengajuanData {
  id: string;
  created_by?: string;
  pegawai: {
    nama: string;
    jabatan: string;
  };
  jenis_jabatan: string;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted';
  catatan?: string;
  rejection_reason?: string;
  created_at: string;
  files: Array<{
    id: string;
    file_type: string;
    file_name: string;
  }>;
}

const PengajuanIndex: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [pengajuanList, setPengajuanList] = useState<PengajuanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pengajuanToDelete, setPengajuanToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchPengajuanData();
  }, [isAuthenticated, navigate, currentPage, statusFilter]);

  const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

             const response = await apiGet(`/api/pengajuan?${params}`, token);
       if (response.success) {
         setPengajuanList(response.data.data || response.data);
         setTotalPages(response.data.pagination?.totalPages || 1);
         setTotalItems(response.data.pagination?.total || 0);
       } else {
         setError(response.message || 'Gagal mengambil data pengajuan');
       }
    } catch (error) {
      console.error('Error fetching pengajuan data:', error);
      setError('Terjadi kesalahan saat mengambil data pengajuan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

    const handleDelete = async () => {
    if (!pengajuanToDelete) return;

    try {
      setDeleting(true);
      const response = await apiDelete(`/api/pengajuan/${pengajuanToDelete}`, token);
      
      if (response.success) {
        fetchPengajuanData();
        setDeleteDialogOpen(false);
        setPengajuanToDelete(null);
      } else {
        setError(response.message || 'Gagal menghapus pengajuan');
      }
    } catch (error) {
      console.error('Error deleting pengajuan:', error);
      setError('Terjadi kesalahan saat menghapus pengajuan');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Clock },
      submitted: { label: 'Diajukan', className: 'bg-blue-100 text-blue-800', icon: FileText },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800', icon: XCircle },
      resubmitted: { label: 'Diajukan Ulang', className: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getJabatanDisplayName = (jenisJabatan: string): string => {
    const jabatanMap: Record<string, string> = {
      'guru': 'Guru',
      'eselon_iv': 'Eselon IV',
      'fungsional': 'Fungsional',
      'pelaksana': 'Pelaksana'
    };
    
    return jabatanMap[jenisJabatan] || jenisJabatan;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdmin = user?.role === 'admin';
  
  // Debug info
  console.log('🔍 Debug PengajuanIndex:', {
    userRole: user?.role,
    isAdmin,
    userEmail: user?.email
  });

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daftar Pengajuan Mutasi PNS
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isAdmin ? 'Semua pengajuan mutasi PNS' : 'Pengajuan mutasi PNS Anda'}
              </p>
            </div>
            <Button
              onClick={() => navigate('/pengajuan/select')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pengajuan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama pegawai, jabatan, atau jenis jabatan..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Diajukan</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="resubmitted">Diajukan Ulang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Memuat data pengajuan...</span>
              </div>
            ) : pengajuanList.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada pengajuan yang sesuai dengan filter'
                    : 'Belum ada pengajuan'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button
                    onClick={() => navigate('/pengajuan/select')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Pengajuan Pertama
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pegawai</TableHead>
                      <TableHead>Jenis Jabatan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pengajuanList.map((pengajuan) => (
                      <TableRow key={pengajuan.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{pengajuan.pegawai.nama}</div>
                            <div className="text-sm text-gray-500">{pengajuan.pegawai.jabatan}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getJabatanDisplayName(pengajuan.jenis_jabatan)}
                          </Badge>
                        </TableCell>
                                                 <TableCell>
                           {getStatusBadge(pengajuan.status)}
                         </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pengajuan.files.length}</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-sm">{pengajuan.total_dokumen}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(pengajuan.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                                                             {pengajuan.status === 'draft' && (
                                 <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}/upload`)}>
                                   <Edit className="h-4 w-4 mr-2" />
                                   Upload Dokumen
                                 </DropdownMenuItem>
                               )}
                               {pengajuan.status === 'rejected' && (
                                 <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}/edit`)}>
                                   <Edit className="h-4 w-4 mr-2" />
                                   Perbaiki Dokumen
                                 </DropdownMenuItem>
                               )}
                               {isAdmin && pengajuan.status === 'submitted' && (
                                 <>
                                   <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}`)}>
                                     <CheckCircle className="h-4 w-4 mr-2" />
                                     Setujui
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}`)}>
                                     <XCircle className="h-4 w-4 mr-2" />
                                     Tolak
                                   </DropdownMenuItem>
                                 </>
                               )}
                                                                                          {(isAdmin || pengajuan.status === 'draft') && (
                               <DropdownMenuItem 
                                 onClick={() => {
                                   console.log('🔍 Debug: Klik hapus untuk pengajuan:', {
                                     id: pengajuan.id,
                                     status: pengajuan.status,
                                     isAdmin,
                                     userRole: user?.role
                                   });
                                   setPengajuanToDelete(pengajuan.id);
                                   setDeleteDialogOpen(true);
                                 }}
                                 className="text-red-600"
                               >
                                 <Trash2 className="h-4 w-4 mr-2" />
                                 Hapus
                               </DropdownMenuItem>
                             )}
                             
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                    <div className="text-sm text-gray-700">
                      Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PengajuanIndex;
