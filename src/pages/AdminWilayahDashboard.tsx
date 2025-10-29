/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  ArrowRight,
  RefreshCw,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';

interface UploadActivity {
  id: string;
  pengajuan: {
    id: string;
    pegawai: {
      nama: string;
      nip: string;
    };
    jenis_jabatan: string;
    status: string;
  };
  file_type: string;
  file_name: string;
  uploaded_by_name: string;
  uploaded_by_office: string;
  uploaded_at: string;
  status: string;
}

interface DashboardStats {
  totalPengajuan: number;
  pendingUpload: number;
  completedUpload: number;
  totalFiles: number;
  verifiedFiles: number;
  rejectedFiles: number;
}

interface PengajuanDataTableItem {
  id: string;
  nama: string;
  nip: string;
  kabupaten: string;
  status: string;
  jenis_jabatan: string;
  created_at: string;
  updated_at: string;
}

interface StatusAggregation {
  kabupaten: string;
  total: number;
  statuses: Array<{
    status: string;
    count: number;
  }>;
}

const AdminWilayahDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'process' | 'archive' | 'rekap'>('process');
  const [stats, setStats] = useState<DashboardStats>({
    totalPengajuan: 0,
    pendingUpload: 0,
    completedUpload: 0,
    totalFiles: 0,
    verifiedFiles: 0,
    rejectedFiles: 0
  });
  const [recentUploads, setRecentUploads] = useState<UploadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pengajuan, setPengajuan] = useState<any[]>([]);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [archive, setArchive] = useState<any[]>([]);
  const [dataTableData, setDataTableData] = useState<PengajuanDataTableItem[]>([]);
  const [aggregationData, setAggregationData] = useState<StatusAggregation[]>([]);
  const [dataTableLoading, setDataTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kabupatenFilter, setKabupatenFilter] = useState<string>('all');
  // Drill-down state
  const [drillKabupaten, setDrillKabupaten] = useState<string | null>(null);

  // Generate recent activities from real data
  const generateRecentActivities = () => {
    const activities: Array<{
      type: 'upload' | 'approval' | 'rejection' | 'system';
      message: string;
      time: string;
    }> = [];

    // Add recent uploads
    recentUploads.slice(0, 3).forEach((upload) => {
      const timeAgo = getTimeAgo(upload.uploaded_at);
      activities.push({
        type: 'upload',
        message: `File ${upload.file_type} uploaded for ${upload.pengajuan.pegawai.nama} (NIP: ${upload.pengajuan.pegawai.nip})`,
        time: timeAgo
      });
    });

    // Add recent pengajuan status changes
    pengajuan.slice(0, 2).forEach((item) => {
      const timeAgo = getTimeAgo(item.updated_at || item.created_at);
      if (item.status === 'approved') {
        activities.push({
          type: 'approval',
          message: `Pengajuan approved for ${item.pegawai?.nama || 'Unknown'} (${item.jenis_jabatan})`,
          time: timeAgo
        });
      } else if (item.status === 'rejected') {
        activities.push({
          type: 'rejection',
          message: `Pengajuan rejected for ${item.pegawai?.nama || 'Unknown'} (${item.jenis_jabatan})`,
          time: timeAgo
        });
      }
    });

    // Sort by most recent (assuming ISO date strings)
    return activities.sort((a, b) => {
      // For now, return as is since we're limiting to latest items already
      return 0;
    }).slice(0, 5); // Show max 5 activities
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const recentActivities = generateRecentActivities();
  const [drillStatus, setDrillStatus] = useState<string | null>(null);
  const [drillItems, setDrillItems] = useState<PengajuanDataTableItem[]>([]);
  const [drillTotal, setDrillTotal] = useState(0);
  const [drillPage, setDrillPage] = useState(1);
  const [drillPageSize, setDrillPageSize] = useState(25);
  const [drillLoading, setDrillLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    statuses: Array<{ value: string; label: string; count: number }>;
  }>({ statuses: [] });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet('/api/admin-wilayah/dashboard', token);
      // Terima berbagai bentuk payload: {success, data:{stats,...}} atau {success, stats, ...}
      const statsPayload = response?.data?.stats || response?.stats;
      const uploadsPayload = response?.data?.recentUploads || response?.recentUploads || [];
      const pengajuanPayload = response?.data?.pengajuan || response?.pengajuan || [];

      if (statsPayload) {
        setStats({
          totalPengajuan: Number(statsPayload.total_pengajuan || statsPayload.totalPengajuan || 0),
          pendingUpload: Number(statsPayload.pending_upload || statsPayload.pendingUpload || 0),
          completedUpload: Number(statsPayload.completed_upload || statsPayload.completedUpload || 0),
          totalFiles: Number(statsPayload.total_files || statsPayload.totalFiles || 0),
          verifiedFiles: Number(statsPayload.verified_files || statsPayload.verifiedFiles || 0),
          rejectedFiles: Number(statsPayload.rejected_files || statsPayload.rejectedFiles || 0),
        });
        setRecentUploads(Array.isArray(uploadsPayload) ? uploadsPayload : []);
        setPengajuan(Array.isArray(pengajuanPayload) ? pengajuanPayload : []);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await apiGet('/api/admin-wilayah/history', token);
      const payload = res?.data?.pengajuan || res?.pengajuan || [];
      setArchive(Array.isArray(payload) ? payload : []);
    } catch (e) {
      // ignore silently for history
      setArchive([]);
    }
  };

  const fetchDataTableData = async () => {
    try {
      setDataTableLoading(true);
      const res = await apiGet('/api/admin-wilayah/pengajuan-datatable', token);
      if (res?.success && res?.data) {
        setDataTableData(res.data.pengajuan || []);
        setAggregationData(res.data.aggregation || []);
      }
    } catch (error) {
      console.error('Error fetching data table:', error);
      setDataTableData([]);
      setAggregationData([]);
    } finally {
      setDataTableLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await apiGet('/api/pengajuan/filter-options', token);
      if (response.success) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchDrillDown = async (kabupaten: string, status: string, page = 1) => {
    try {
      setDrillLoading(true);
      setDrillPage(page);
      const params = new URLSearchParams({ kabupaten, status, page: String(page), pageSize: String(drillPageSize) });
      const res = await apiGet(`/api/pengajuan/rekap/list?${params.toString()}`, token);
      const items = res?.data?.items || res?.items || [];
      const total = Number(res?.data?.total ?? res?.total ?? 0);
      setDrillItems(items);
      setDrillTotal(total);
    } catch (e) {
      setDrillItems([]);
      setDrillTotal(0);
    } finally {
      setDrillLoading(false);
    }
  };

  const handleSubmitToSuperadmin = async (id: string) => {
    if (!token) return;
    setSubmittingId(id);
    try {
      const res = await apiPost(`/api/admin-wilayah/pengajuan/${id}/submit-to-superadmin`, {}, token);
      if (res?.success !== false) {
        await fetchDashboardData();
      }
    } finally {
      setSubmittingId(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchHistory();
    fetchDataTableData();
    fetchFilterOptions();
  }, [token]);

  // Auto-refresh progress setiap 30 detik untuk update live
  useEffect(() => {
    if (!token) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchDataTableData();
    }, 30000); // 30 detik

    return () => clearInterval(interval);
  }, [token]);

  // Refresh data ketika user kembali ke halaman (window focus)
  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      fetchDashboardData();
      fetchDataTableData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  const getProgressPercentage = () => {
    if (stats.totalFiles === 0) return 0;
    return (stats.verifiedFiles / stats.totalFiles) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draf', className: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Diajukan', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
      resubmitted: { label: 'Diajukan Ulang', className: 'bg-yellow-100 text-yellow-800' },
      admin_wilayah_approved: { label: 'Disetujui Admin Wilayah', className: 'bg-green-200 text-green-800' },
      admin_wilayah_rejected: { label: 'Ditolak Admin Wilayah', className: 'bg-red-200 text-red-800' },
      final_approved: { label: 'Selesai', className: 'bg-green-600 text-white' },
      final_rejected: { label: 'Ditolak Final', className: 'bg-red-600 text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status.toUpperCase(), 
      className: 'bg-gray-100 text-gray-800' 
    };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = {
      draft: 'Draf',
      submitted: 'Diajukan',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      resubmitted: 'Diajukan Ulang',
      admin_wilayah_approved: 'Disetujui Admin Wilayah',
      admin_wilayah_rejected: 'Ditolak Admin Wilayah',
      final_approved: 'Selesai',
      final_rejected: 'Ditolak Final',
    };

    return statusConfig[status as keyof typeof statusConfig] || status.toUpperCase();
  };

  const exportExcel = () => {
    // Sheet 1: Data Detail per Pengajuan (sudah terfilter berdasarkan scope admin wilayah)
    const detailData = dataTableData.map(item => ({
      'Nama': item.nama,
      'Status': getStatusLabel(item.status),
      'Kabupaten/Kota': item.kabupaten
    }));

    // Sheet 2: Summary per Kabupaten (sudah terfilter berdasarkan scope admin wilayah)
    const summaryData = aggregationData.map(row => {
      const countByStatus = row.statuses.reduce((acc, s) => { 
        acc[s.status] = s.count; 
        return acc; 
      }, {} as Record<string, number>);

      return {
        'Kabupaten/Kota': row.kabupaten,
        'Draf': countByStatus['draft'] || 0,
        'Diajukan': countByStatus['submitted'] || 0,
        'Disetujui': countByStatus['approved'] || 0,
        'Ditolak': countByStatus['rejected'] || 0,
        'Diajukan Ulang': countByStatus['resubmitted'] || 0,
        'Disetujui Admin Wilayah': countByStatus['admin_wilayah_approved'] || 0,
        'Ditolak Admin Wilayah': countByStatus['admin_wilayah_rejected'] || 0,
        'Selesai': countByStatus['final_approved'] || 0,
        'Ditolak Final': countByStatus['final_rejected'] || 0,
        'Total': row.total
      };
    });

    // Buat workbook dengan 2 sheet
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Data Detail
    const ws1 = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Detail Pengajuan');
    
    // Sheet 2: Summary per Kabupaten
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Rekap per Kabupaten');

    // Generate filename dengan timestamp
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `Rekap_Status_Admin_Wilayah_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  // Filter data berdasarkan search term dan filter
  const filteredData = dataTableData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis_jabatan.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesKabupaten = kabupatenFilter === 'all' || item.kabupaten === kabupatenFilter;
    
    return matchesSearch && matchesStatus && matchesKabupaten;
  });

  // Get unique kabupaten untuk filter dropdown
  const uniqueKabupaten = Array.from(new Set(dataTableData.map(item => item.kabupaten))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin Wilayah</h1>
            <p className="text-gray-600 mt-2">
              Monitoring aktivitas upload file dan progress pengajuan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchDashboardData} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportExcel} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Activity className="h-6 w-6 text-green-600" />
            <Badge className="bg-green-100 text-green-800">Admin Wilayah</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button className={`${activeTab === 'process' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-200 text-green-700 hover:bg-green-50'}`} variant={activeTab === 'process' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('process')}>📋 Pengajuan</Button>
          <Button className={`${activeTab === 'archive' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-200 text-green-700 hover:bg-green-50'}`} variant={activeTab === 'archive' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('archive')}>📁 Riwayat</Button>
          <Button className={`${activeTab === 'rekap' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-200 text-green-700 hover:bg-green-50'}`} variant={activeTab === 'rekap' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('rekap')}>📊 Laporan</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengajuan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPengajuan}</div>
              <p className="text-xs text-muted-foreground">
                Pengajuan yang sudah di-ACC admin wilayah
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Upload</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingUpload}</div>
              <p className="text-xs text-muted-foreground">
                Menunggu upload file admin wilayah
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Upload</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedUpload}</div>
              <p className="text-xs text-muted-foreground">
                File admin wilayah sudah lengkap
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
              <p className="text-xs text-muted-foreground">
                File yang sudah diupload
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File Verification Progress</span>
                <span className="text-sm text-muted-foreground">
                  {stats.verifiedFiles} of {stats.totalFiles} files verified
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pending: {stats.totalFiles - stats.verifiedFiles - stats.rejectedFiles}</span>
                <span>Verified: {stats.verifiedFiles}</span>
                <span>Rejected: {stats.rejectedFiles}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Pengajuan Approved Kab/Kota */}
        {activeTab === 'process' && (
        <Card>
          <CardHeader>
            <CardTitle>Pengajuan yang Sudah Di-ACC Admin Wilayah</CardTitle>
          </CardHeader>
          <CardContent>
            {pengajuan.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Tidak ada data</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Pegawai</th>
                      <th className="py-2 pr-4">NIP</th>
                      <th className="py-2 pr-4">Jenis Jabatan</th>
                      <th className="py-2 pr-4">Berkas Kab/Kota</th>
                      <th className="py-2 pr-4">Progress Kanwil</th>
                      <th className="py-2 pr-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengajuan.map((row) => {
                      const pegawai = row.pegawai || {};
                      // Gunakan data upload progress yang sama dengan upload page
                      const uploadProgress = row.uploadProgress || { required: 0, total: 0 };
                      const progressText = `${uploadProgress.required}/${uploadProgress.total}`;
                      const canSubmit = row.status === 'admin_wilayah_approved' && (uploadProgress.total || 0) > 0 && (uploadProgress.required || 0) >= (uploadProgress.total || 0);
                      return (
                        <tr key={row.id} className="border-b">
                          <td className="py-2 pr-4">{pegawai.nama || '-'}</td>
                          <td className="py-2 pr-4">{pegawai.nip || '-'}</td>
                          <td className="py-2 pr-4">{row.jenis_jabatan}</td>
                          <td className="py-2 pr-4">{row.kabupaten_files_count}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <span>{progressText}</span>
                              <Progress value={uploadProgress.total ? (uploadProgress.required / uploadProgress.total) * 100 : 0} className="h-2 w-32" />
                            </div>
                          </td>
                          <td className="py-2 pr-4">
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                                <Link to={`/pengajuan/${row.id}`}>Detail</Link>
                              </Button>
                              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <Link to={`/admin-wilayah/upload/${row.id}`}>Upload Kanwil</Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {activeTab === 'archive' && (
        <Card>
          <CardHeader>
            <CardTitle>Arsip (Keputusan Superadmin)</CardTitle>
          </CardHeader>
          <CardContent>
            {archive.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Belum ada arsip</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Pegawai</th>
                      <th className="py-2 pr-4">NIP</th>
                      <th className="py-2 pr-4">Jenis Jabatan</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archive.map((row) => (
                      <tr key={row.id} className="border-b">
                        <td className="py-2 pr-4">{row.pegawai?.nama || '-'}</td>
                        <td className="py-2 pr-4">{row.pegawai?.nip || '-'}</td>
                        <td className="py-2 pr-4">{row.jenis_jabatan}</td>
                        <td className="py-2 pr-4">
                          <Badge className={row.status === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                            {row.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">{formatDate(row.updated_at)}</td>
                        <td className="py-2 pr-4">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/pengajuan/${row.id}`}>Detail</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Rekap Status Tab */}
        {activeTab === 'rekap' && (
        <div className="space-y-6">
          {/* Pivot Rekap Tabel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rekap Status per Kabupaten</CardTitle>
                <Button onClick={exportExcel} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {aggregationData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Tidak ada data</div>
              ) : (
                (() => {
                  const statusKeys = Array.from(new Set(aggregationData.flatMap(k => k.statuses.map(s => s.status))));
                  return (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-3 pr-4 font-medium">Kabupaten</th>
                            {statusKeys.map((sk) => (
                              <th key={sk} className="py-3 pr-4 font-medium whitespace-nowrap text-center">{getStatusBadge(sk)}</th>
                            ))}
                            <th className="py-3 pr-4 font-medium text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aggregationData.map((row) => {
                            const countByStatus = row.statuses.reduce((acc, s) => { acc[s.status] = s.count; return acc; }, {} as Record<string, number>);
                            return (
                              <tr key={row.kabupaten} className="border-b hover:bg-gray-50">
                                <td className="py-3 pr-4 font-medium">{row.kabupaten}</td>
                            {statusKeys.map((sk) => (
                              <td key={sk} className="py-3 pr-4 text-center">
                                <button
                                  className="text-green-700 hover:underline"
                                  onClick={() => {
                                    setDrillKabupaten(row.kabupaten);
                                    setDrillStatus(sk);
                                    fetchDrillDown(row.kabupaten, sk, 1);
                                  }}
                                >
                                  {countByStatus[sk] || 0}
                                </button>
                              </td>
                            ))}
                                <td className="py-3 pr-4 font-semibold text-center">{row.total}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Pengajuan ({filteredData.length} dari {dataTableData.length})</CardTitle>
                <Button onClick={fetchDataTableData} variant="outline" size="sm" disabled={dataTableLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${dataTableLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter dan Search */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cari</label>
                    <Input
                      placeholder="Cari nama, NIP, kabupaten, atau jenis jabatan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Filter Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Filter Kabupaten</label>
                    <Select value={kabupatenFilter} onValueChange={setKabupatenFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kabupaten" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kabupaten</SelectItem>
                        {uniqueKabupaten.map((kabupaten) => (
                          <SelectItem key={kabupaten} value={kabupaten}>
                            {kabupaten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {(searchTerm || statusFilter !== 'all' || kabupatenFilter !== 'all') && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setKabupatenFilter('all');
                      }}
                    >
                      Reset Filter
                    </Button>
                  </div>
                )}
              </div>
              
              {dataTableLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Memuat data...</p>
                </div>
              ) : dataTableData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Tidak ada data pengajuan</div>
              ) : filteredData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Tidak ada data yang sesuai dengan filter</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-3 pr-4 font-medium">Nama</th>
                        <th className="py-3 pr-4 font-medium">NIP</th>
                        <th className="py-3 pr-4 font-medium">Kabupaten</th>
                        <th className="py-3 pr-4 font-medium">Jenis Jabatan</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="py-3 pr-4 font-medium">Tanggal Dibuat</th>
                        <th className="py-3 pr-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row) => (
                        <tr key={row.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pr-4 font-medium">{row.nama}</td>
                          <td className="py-3 pr-4 text-gray-600">{row.nip}</td>
                          <td className="py-3 pr-4">{row.kabupaten}</td>
                          <td className="py-3 pr-4">{row.jenis_jabatan}</td>
                          <td className="py-3 pr-4">{getStatusBadge(row.status)}</td>
                          <td className="py-3 pr-4 text-gray-600">{formatDate(row.created_at)}</td>
                          <td className="py-3 pr-4">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/pengajuan/${row.id}`}>Detail</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada file yang diupload</p>
                </div>
              ) : (
                recentUploads.map((upload) => (
                  <div key={upload.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{upload.pengajuan.pegawai.nama}</div>
                        <div className="text-sm text-gray-500">
                          {upload.pengajuan.jenis_jabatan} • {upload.file_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={upload.status === 'approved' ? 'default' : 'secondary'}>
                          {upload.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin-wilayah/upload/${upload.pengajuan.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {(() => {
                        const officeRaw = (upload.uploaded_by_office || '').toString();
                        const officeClean = officeRaw.replace(/\s*\([^)]*\)\s*$/, '');
                        const officeText = officeClean ? ` ${officeClean}` : '';
                        return `Uploaded by: ${upload.uploaded_by_name}${officeText} - ${formatDate(upload.uploaded_at)}`;
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${activity.type === 'upload' ? 'bg-blue-500' : 
                      activity.type === 'approval' ? 'bg-green-500' : 
                      activity.type === 'rejection' ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWilayahDashboard;
