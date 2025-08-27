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
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

  // Mock data untuk development
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalPengajuan: 24,
      pendingUpload: 8,
      completedUpload: 16,
      totalFiles: 156,
      verifiedFiles: 142,
      rejectedFiles: 14
    };

    const mockUploads: UploadActivity[] = [
      {
        id: '1',
        pengajuan: {
          id: 'p001',
          pegawai: {
            nama: 'Ahmad Supriadi',
            nip: '198501152010011001'
          },
          jenis_jabatan: 'Guru',
          status: 'admin_wilayah_upload'
        },
        file_type: 'surat_pernyataan_persetujuan',
        file_name: 'Surat_Pernyataan_Persetujuan_Ahmad_Supriadi.pdf',
        uploaded_by_name: 'Admin Wilayah',
        uploaded_by_office: 'Kanwil Provinsi Jawa Barat',
        uploaded_at: '2024-01-15T10:30:00Z',
        status: 'verified'
      },
      {
        id: '2',
        pengajuan: {
          id: 'p002',
          pegawai: {
            nama: 'Siti Nurhaliza',
            nip: '198603202010012002'
          },
          jenis_jabatan: 'Eselon',
          status: 'admin_wilayah_review'
        },
        file_type: 'surat_pernyataan_tidak_tugas_belajar',
        file_name: 'Surat_Pernyataan_Tidak_Tugas_Belajar_Siti_Nurhaliza.pdf',
        uploaded_by_name: 'Admin Wilayah',
        uploaded_by_office: 'Kanwil Provinsi Jawa Barat',
        uploaded_at: '2024-01-15T09:15:00Z',
        status: 'pending'
      },
      {
        id: '3',
        pengajuan: {
          id: 'p003',
          pegawai: {
            nama: 'Budi Santoso',
            nip: '198712052010011003'
          },
          jenis_jabatan: 'Fungsional',
          status: 'final_ready_for_sk'
        },
        file_type: 'surat_pernyataan_tanggung_jawab_mutlak',
        file_name: 'SPTJM_Budi_Santoso.pdf',
        uploaded_by_name: 'Admin Wilayah',
        uploaded_by_office: 'Kanwil Provinsi Jawa Barat',
        uploaded_at: '2024-01-14T16:45:00Z',
        status: 'verified'
      }
    ];

    setStats(mockStats);
    setRecentUploads(mockUploads);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600 text-white">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
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

  const getProgressPercentage = () => {
    if (stats.totalFiles === 0) return 0;
    return (stats.verifiedFiles / stats.totalFiles) * 100;
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
            <Activity className="h-6 w-6 text-green-600" />
            <Badge className="bg-green-100 text-green-800">Admin Wilayah</Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Pengajuan</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.totalPengajuan}</div>
              <p className="text-xs text-green-600">Pengajuan dalam sistem</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Upload</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{stats.pendingUpload}</div>
              <p className="text-xs text-yellow-600">Menunggu upload file</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Completed Upload</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{stats.completedUpload}</div>
              <p className="text-xs text-blue-600">Upload selesai</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">File Verified</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{stats.verifiedFiles}</div>
              <p className="text-xs text-purple-600">Dari {stats.totalFiles} total file</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Verification Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progress Verifikasi File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    File Terverifikasi: {Math.round(getProgressPercentage())}%
                  </span>
                  <Badge className="bg-green-600 text-white">
                    {stats.verifiedFiles}/{stats.totalFiles}
                  </Badge>
                </div>
                <Progress value={getProgressPercentage()} className="h-3 [&>div]:bg-green-600" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.verifiedFiles}</div>
                    <div className="text-xs text-gray-500">Verified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalFiles - stats.verifiedFiles - stats.rejectedFiles}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.rejectedFiles}</div>
                    <div className="text-xs text-gray-500">Rejected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Link to="/admin-wilayah/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File Baru
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                <Link to="/admin-wilayah/pengajuan">
                  <FileText className="h-4 w-4 mr-2" />
                  Lihat Pengajuan
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link to="/admin-wilayah/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Laporan
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Upload Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Aktivitas Upload Terbaru
              </CardTitle>
              <Button asChild variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                <Link to="/admin-wilayah/activity">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(upload.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{upload.pengajuan.pegawai.nama}</h3>
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          {upload.pengajuan.jenis_jabatan}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{upload.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by {upload.uploaded_by_name} ({upload.uploaded_by_office})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(upload.status)}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{formatDate(upload.uploaded_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {recentUploads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada aktivitas upload</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance Admin Wilayah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rata-rata waktu upload</span>
                  <span className="font-medium text-green-600">2.5 jam</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File per hari</span>
                  <span className="font-medium text-green-600">12 file</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success rate</span>
                  <span className="font-medium text-green-600">95%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aktivitas Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File diupload</span>
                  <span className="font-medium text-green-600">8 file</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pengajuan diproses</span>
                  <span className="font-medium text-green-600">3 pengajuan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File diverifikasi</span>
                  <span className="font-medium text-green-600">15 file</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminWilayahDashboard;
