import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  RefreshCw
} from 'lucide-react';
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

const AdminWilayahDashboard: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'process' | 'archive'>('process');
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
            <Activity className="h-6 w-6 text-green-600" />
            <Badge className="bg-green-100 text-green-800">Admin Wilayah</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button variant={activeTab === 'process' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('process')}>Dalam Proses</Button>
          <Button variant={activeTab === 'archive' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('archive')}>Arsip</Button>
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
                Pengajuan yang sudah approved
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
            <CardTitle>Pengajuan dari Kab/Kota (Approved)</CardTitle>
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
                      const progress = row.progress_admin_wilayah || { required: 0, approved: 0 };
                      const progressText = `${progress.approved}/${progress.required}`;
                      const canSubmit = row.status === 'admin_wilayah_approved' && (row.progress_admin_wilayah?.required || 0) > 0 && (row.progress_admin_wilayah?.approved || 0) >= (row.progress_admin_wilayah?.required || 0);
                      return (
                        <tr key={row.id} className="border-b">
                          <td className="py-2 pr-4">{pegawai.nama || '-'}</td>
                          <td className="py-2 pr-4">{pegawai.nip || '-'}</td>
                          <td className="py-2 pr-4">{row.jenis_jabatan}</td>
                          <td className="py-2 pr-4">{row.kabupaten_files_count}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <span>{progressText}</span>
                              <Progress value={progress.required ? (progress.approved / progress.required) * 100 : 0} className="h-2 w-32" />
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
                              <Button size="sm" disabled={!canSubmit || submittingId === row.id} onClick={() => handleSubmitToSuperadmin(row.id)} className={`text-white ${canSubmit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}>
                                {submittingId === row.id ? 'Mengajukan...' : 'Ajukan ke Superadmin'}
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
                      Uploaded by: <strong>{upload.uploaded_by_name}</strong> 
                      ({upload.uploaded_by_office}) - {formatDate(upload.uploaded_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild className="flex-1">
                <Link to="/admin-wilayah/pengajuan">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Pengajuan
                </Link>
              </Button>
              <Button variant="outline" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWilayahDashboard;
