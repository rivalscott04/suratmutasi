import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'admin_wilayah_approved' | 'admin_wilayah_rejected' | 'final_approved' | 'final_rejected';
  catatan?: string;
  rejection_reason?: string;
  resubmitted_at?: string;
  resubmitted_by?: string;
  created_at: string;
  files: Array<{
    id: string;
    file_type: string;
    file_name: string;
    file_category?: string;
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
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pengajuanToDelete, setPengajuanToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    users: Array<{ id: string; email: string; full_name: string }>;
    statuses: Array<{ value: string; label: string; count: number }>;
  }>({ users: [], statuses: [] });
  const [groupedByKabkota, setGroupedByKabkota] = useState<Record<string, PengajuanData[]>>({});

  const itemsPerPage = 50;
  const isAdmin = user?.role === 'admin';
  const isReadOnlyUser = user?.role === 'user';
  const isGroupingRole = isAdmin || isReadOnlyUser;

  // Fallback grouping on client for admin when server doesn't provide grouping
  const clientGroupedByKabkota: Record<string, PengajuanData[]> = React.useMemo(() => {
    if (!isGroupingRole) return {};
    
    // Always use server grouping if available
    if (Object.keys(groupedByKabkota).length > 0) {
      console.log('🔍 Using server grouping:', groupedByKabkota);
      return groupedByKabkota;
    }
    
    // Fallback to client grouping
    if (!pengajuanList || pengajuanList.length === 0) return {};
    
    console.log('🔍 Using client grouping, pengajuanList length:', pengajuanList.length);
    const clientGrouped = pengajuanList.reduce((acc: Record<string, PengajuanData[]>, item: any) => {
      const kab = (item.office && (item.office.kabkota || item.office.name)) || (item.pegawai && (item.pegawai as any).induk_unit) || (item.pegawai as any)?.unit_kerja || 'Lainnya';
      if (!acc[kab]) acc[kab] = [];
      acc[kab].push(item);
      return acc;
    }, {});
    
    console.log('🔍 Client grouped result:', clientGrouped);
    return clientGrouped;
  }, [isGroupingRole, groupedByKabkota, pengajuanList]);

  

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    // Lock status filter to final_approved for read-only user (admin pusat)
    if (isReadOnlyUser && statusFilter !== 'final_approved') {
      setStatusFilter('final_approved');
    }
    fetchPengajuanData();
  }, [isAuthenticated, navigate, currentPage, statusFilter, createdByFilter, isReadOnlyUser, searchTerm]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFilterOptions();
    }
  }, [isAuthenticated]);


    const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(isAdmin && createdByFilter !== 'all' && { created_by: createdByFilter })
      });


      const response = await apiGet(`/api/pengajuan?${params}`, token);
      
      
      if (response.success) {
        setPengajuanList(response.data);
        if (isAdmin) {
          const grouped = response.grouped_by_kabkota;
          console.log('🔍 Frontend received grouped data:', grouped);
          console.log('🔍 Frontend received data length:', response.data?.length);
          if (grouped) {
            setGroupedByKabkota(grouped as Record<string, PengajuanData[]>);
          } else {
            setGroupedByKabkota({});
          }
        }
        
        const totalPagesValue = response.pagination?.totalPages || 1;
        const totalItemsValue = response.pagination?.total || 0;
        
        
        setTotalPages(totalPagesValue);
        setTotalItems(totalItemsValue);
        
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

       const fetchFilterOptions = async () => {
      try {
        console.log('🔍 Fetching filter options...');
        const response = await apiGet('/api/pengajuan/filter-options', token);
        console.log('🔍 Filter options response:', response);
        if (response.success) {
          setFilterOptions(response.data);
          console.log('🔍 Filter options set:', response.data);
        } else {
          console.error('🔍 Filter options failed:', response.message);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    if (isReadOnlyUser) return; // locked to final_approved
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreatedByFilter = (value: string) => {
    setCreatedByFilter(value);
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

  const getStatusBadge = (status: string, pengajuan?: PengajuanData) => {
    // Helper function to determine if this is submitted after admin wilayah approval
    const isSubmittedAfterAdminWilayah = (status: string, pengajuan?: PengajuanData) => {
      if (status !== 'submitted' || !pengajuan) return false;
      // Only show "Diajukan Admin Wilayah" if there are actual admin wilayah files
      return pengajuan.files?.some(f => f.file_category === 'admin_wilayah') || false;
    };

    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 hover:bg-gray-200', icon: Clock },
      submitted: { 
        label: isSubmittedAfterAdminWilayah(status, pengajuan) ? 'Diajukan Admin Wilayah' : 'Diajukan', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
        icon: FileText 
      },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800 hover:bg-green-200', icon: CheckCircle },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800 hover:bg-red-200', icon: XCircle },
      resubmitted: { label: 'Diajukan Ulang', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', icon: Clock },
      admin_wilayah_approved: { label: 'Disetujui Admin Wilayah', className: 'bg-green-200 text-green-800 hover:bg-green-300', icon: CheckCircle },
      admin_wilayah_rejected: { label: 'Ditolak Admin Wilayah', className: 'bg-red-200 text-red-800 hover:bg-red-300', icon: XCircle },
      final_approved: { label: 'Final Approved', className: 'bg-green-600 text-white', icon: CheckCircle },
      final_rejected: { label: 'Final Rejected', className: 'bg-red-600 text-white', icon: XCircle }
    } as const;

    const config = (statusConfig as any)[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = config.icon as any;

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

  // Rekap dan export (khusus read-only user)
  const buildRekapPerKabkota = () => {
    const source = Object.keys(clientGroupedByKabkota).length > 0
      ? clientGroupedByKabkota
      : pengajuanList.reduce((acc: Record<string, PengajuanData[]>, item: any) => {
          const kab = (item.office && (item.office.kabkota || item.office.name)) || (item.pegawai && (item.pegawai as any).induk_unit) || (item.pegawai as any)?.unit_kerja || 'Lainnya';
          if (!acc[kab]) acc[kab] = [];
          acc[kab].push(item);
          return acc;
        }, {});
    return Object.entries(source).map(([kab, items]) => ({ kabkota: kab, total: items.length }));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rows = buildRekapPerKabkota();
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const filename = `Rekap-final_approved-per-kabkota-${ymd}.xls`;
    const tableHtml = `
      <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Kab/Kota</th><th>Jumlah Pengajuan Final Approved</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.kabkota}</td><td>${r.total}</td></tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>`;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, filename);
  };

  const exportPDF = () => {
    const rows = buildRekapPerKabkota().sort((a, b) => b.total - a.total);
    const total = rows.reduce((acc, r) => acc + r.total, 0);
    const max = Math.max(1, ...rows.map(r => r.total));
    const kabCount = rows.length;
    const now = new Date();
    const dateStr = now.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `Rekap-disetujui-kanwil-per-kabkota-${ymd}.pdf`;

    const createdBy = (user?.full_name || user?.email || 'Admin Pusat');
    const top5 = rows.slice(0, 5);

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <meta charset=\"UTF-8\" />
          <title>${filename}</title>
          <style>
            @page { size: A4; margin: 18mm 14mm; }
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
            .title { font-size: 18px; font-weight: 700; }
            .meta { font-size: 12px; color: #4b5563; }
            .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 12px 0 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .card h3 { font-size: 12px; color: #6b7280; margin: 0 0 4px; font-weight: 600; }
            .card .value { font-size: 20px; font-weight: 700; color: #111827; }
            table { border-collapse: collapse; width: 100%; margin-top: 4px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
            th { background: #f9fafb; text-align: left; }
            tfoot td { font-weight: 700; background: #f3f4f6; }
            .row { display: flex; align-items: center; gap: 10px; }
            .bar { height: 8px; background: #d1fae5; border-radius: 4px; overflow: hidden; }
            .bar > span { display: block; height: 100%; background: #10b981; }
            .note { margin-top: 12px; font-size: 11px; color: #6b7280; }
            .section-title { margin-top: 16px; font-size: 14px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Rekap Pengajuan Telah Disetujui Kanwil per Kab/Kota</div>
              <div class="meta">Dihasilkan: ${dateStr} • Dibuat oleh: ${createdBy}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <h3>Total Telah Disetujui Kanwil</h3>
              <div class="value">${total}</div>
            </div>
            <div class="card">
              <h3>Jumlah Kab/Kota</h3>
              <div class="value">${kabCount}</div>
            </div>
            <div class="card">
              <h3>Top Kab/Kota</h3>
              <div style="font-size:12px; color:#111827; line-height:1.4;">
                ${top5.map((r, i) => `${i + 1}. ${r.kabkota} (${r.total})`).join('<br/>') || '-'}
              </div>
            </div>
          </div>

          <div class="section-title">Tabel Rekap</div>
          <table>
            <thead>
              <tr>
                <th style="width:36px;">No</th>
                <th>Kab/Kota</th>
                <th style="width:110px;">Jumlah</th>
                <th style="width:80px;">Persen</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => {
                const pct = total > 0 ? Math.round((r.total / total) * 1000) / 10 : 0;
                const rel = Math.round((r.total / max) * 100);
                const barWidth = 140;
                const filled = Math.max(1, Math.round((rel / 100) * barWidth));
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${r.kabkota}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${r.total}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${pct.toFixed(1)}%</td>
                    <td>
                      <svg width="${barWidth}" height="10" viewBox="0 0 ${barWidth} 10" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="${barWidth}" height="10" fill="#E5F6F1" stroke="#D1D5DB" />
                        <rect x="0" y="0" width="${filled}" height="10" fill="#10B981" />
                      </svg>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total</td>
                <td style="text-align:right; font-variant-numeric: tabular-nums;">${total}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="note">Catatan: Laporan ini menampilkan pengajuan yang <strong>telah disetujui Kanwil</strong>.</div>

          <script>
            window.onload = function() { window.print(); };
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  };
  
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
                {isAdmin ? 'Semua pengajuan mutasi PNS' : (isReadOnlyUser ? 'Semua pengajuan berstatus final_approved (read-only)' : 'Pengajuan mutasi PNS Anda')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isReadOnlyUser && (
                <>
                  <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white">Export Excel</Button>
                  <Button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white">Export PDF</Button>
                </>
              )}
              {/* Only show Add button for admin and operator, not for user role */}
              {user?.role !== 'user' && (
                <Button
                  onClick={() => navigate('/pengajuan/select')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengajuan
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

                     {/* Search and Filter */}
           <div className="flex flex-col gap-4 mb-6">
             {/* Search Bar */}
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 placeholder="Cari berdasarkan nama pegawai, jabatan, atau jenis jabatan..."
                 value={searchTerm}
                 onChange={(e) => handleSearch(e.target.value)}
                 className="pl-10"
               />
             </div>
             
             {/* Filter Row */}
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex items-center gap-2">
                 <Filter className="h-4 w-4 text-gray-400" />
                 <Select value={statusFilter} onValueChange={handleStatusFilter}>
                   <SelectTrigger className="w-48">
                     <SelectValue placeholder="Filter Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Semua Status</SelectItem>
                     {filterOptions.statuses
                       .filter(status => status.count > 0) // Only show statuses with data
                       .map((status) => (
                         <SelectItem key={status.value} value={status.value}>
                           {status.label} ({status.count})
                         </SelectItem>
                       ))}
                   </SelectContent>
                 </Select>
               </div>
               
                               {/* Admin Only Filters */}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={createdByFilter} onValueChange={handleCreatedByFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter Pembuat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Pembuat</SelectItem>
                        {filterOptions.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email || 'Unknown User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
             </div>
           </div>

          {/* Grouped view for admin and read-only user */}
          {isGroupingRole && Object.keys(clientGroupedByKabkota).length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">Tergabung berdasarkan kabupaten/kota</div>
              <Accordion type="multiple" className="w-full">
                {Object.entries(clientGroupedByKabkota).map(([kab, items]) => (
                  <AccordionItem key={kab} value={kab} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="font-medium">{kab}</div>
                        <Badge variant="secondary" className="ml-2">{items.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pegawai</TableHead>
                              <TableHead>Jenis Jabatan</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Dokumen</TableHead>
                              {isAdmin && <TableHead>Pembuat</TableHead>}
                              <TableHead>Tanggal Dibuat</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((pengajuan) => (
                              <TableRow key={pengajuan.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{pengajuan.pegawai.nama}</div>
                                    <div className="text-sm text-gray-500">{pengajuan.pegawai.jabatan}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{getJabatanDisplayName(pengajuan.jenis_jabatan)}</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(pengajuan.status, pengajuan)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{pengajuan.files.length}</span>
                                    <span className="text-gray-500">/</span>
                                    <span className="text-sm">{pengajuan.total_dokumen}</span>
                                  </div>
                                </TableCell>
                                {isAdmin && (
                                  <TableCell>
                                    <div className="text-sm text-gray-600">
                                      {(() => {
                                        const u = filterOptions.users.find(u => u.id === pengajuan.created_by);
                                        if (u) return u.full_name || u.email || 'Unknown User';
                                        return pengajuan.created_by?.includes('@') ? pengajuan.created_by : 'Unknown User';
                                      })()}
                                    </div>
                                  </TableCell>
                                )}
                                <TableCell>
                                  <div className="text-sm text-gray-600">{formatDate(pengajuan.created_at)}</div>
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
                                      {isAdmin && (
                                        <DropdownMenuItem 
                                          onClick={() => {
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {/* Pagination for admin grouped view */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50">
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
                          className={`w-8 h-8 p-0 ${
                            currentPage === page 
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                              : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                          }`}
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
            </div>
          ) : (
          /* Table */
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2 text-green-600" />
                <span>Memuat data pengajuan...</span>
              </div>
            ) : pengajuanList.length === 0 && totalItems === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada pengajuan yang sesuai dengan filter'
                    : 'Belum ada pengajuan'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && user?.role !== 'user' && (
                  <Button
                    onClick={() => navigate('/pengajuan/select')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Pengajuan Pertama
                  </Button>
                )}
              </div>
            ) : pengajuanList.length === 0 && totalItems > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pegawai</TableHead>
                      <TableHead>Jenis Jabatan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dokumen</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Tidak ada data di halaman ini
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>


                {/* Pagination Info - Always show for debugging */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                  </div>
                  {true && ( // Always show for debugging - change back to (totalPages > 1 || totalItems > itemsPerPage) later
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
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                            }`}
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
                  )}
                </div>
              </>
            ) : (
              <>
                <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Pegawai</TableHead>
                       <TableHead>Jenis Jabatan</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Dokumen</TableHead>
                       {isAdmin && <TableHead>Pembuat</TableHead>}
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
                           {getStatusBadge(pengajuan.status, pengajuan)}
                         </TableCell>
                                                 <TableCell>
                           <div className="flex items-center gap-2">
                             <span className="text-sm">{pengajuan.files.length}</span>
                             <span className="text-gray-500">/</span>
                             <span className="text-sm">{pengajuan.total_dokumen}</span>
                           </div>
                         </TableCell>
                                                   {isAdmin && (
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {(() => {
                                  const user = filterOptions.users.find(u => u.id === pengajuan.created_by);
                                  if (user) {
                                    // Prioritaskan full_name, jika tidak ada gunakan email
                                    return user.full_name || user.email || 'Unknown User';
                                  }
                                  // Jika user tidak ditemukan, tampilkan email dari created_by (jika itu email)
                                  return pengajuan.created_by?.includes('@') ? pengajuan.created_by : 'Unknown User';
                                })()}
                              </div>
                            </TableCell>
                          )}
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
                              {/* Only show edit actions for admin and operator, not for user role */}
                              {user?.role !== 'user' && (
                                <>
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
                                </>
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
                                                                                          {/* Only show delete for admin and operator, not for user role */}
                              {(isAdmin || (pengajuan.status === 'draft' && user?.role !== 'user')) && (
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


                {/* Pagination Info - Always show for debugging */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                  </div>
                  {true && ( // Always show for debugging - change back to (totalPages > 1 || totalItems > itemsPerPage) later
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
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                            }`}
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
                  )}
                </div>
              </>
            )}
          </div>
          )}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
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
