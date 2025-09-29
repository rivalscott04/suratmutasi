import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Clock, Users, ArrowRight, BarChart3, Calendar, Settings as SettingsIcon, RefreshCw, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<any[]>([]);
  const [pengajuan, setPengajuan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [loadingPengajuan, setLoadingPengajuan] = useState(false);
  const [search, setSearch] = useState('');
  // Rekap (Superadmin & Admin Wilayah scope-aware via backend)
  const [rekapAggregation, setRekapAggregation] = useState<Array<{ kabupaten: string; total: number; statuses: { status: string; count: number }[] }>>([]);
  const [rekapLoading, setRekapLoading] = useState(false);
  const filteredLetters = letters.filter(l =>
    l.letter_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.subject?.toLowerCase().includes(search.toLowerCase()) ||
    l.template_name?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && token) {
      setLoadingLetters(true);
      apiGet('/api/letters', token)
        .then(res => setLetters(res.letters || []))
        .catch(err => setError(err.message || 'Gagal fetch surat'))
        .finally(() => setLoadingLetters(false));

      setLoadingPengajuan(true);
      apiGet('/api/pengajuan', token)
        .then(res => setPengajuan(res.pengajuan || []))
        .catch(() => setPengajuan([]))
        .finally(() => setLoadingPengajuan(false));

      // Fetch rekap for dashboard (show to admin/superadmin, also works for admin_wilayah with scoped data)
      const fetchRekap = async () => {
        try {
          setRekapLoading(true);
          const res = await apiGet('/api/pengajuan/rekap/aggregate', token);
          const agg = res?.data?.aggregation || res?.aggregation || [];
          setRekapAggregation(Array.isArray(agg) ? agg : []);
        } catch (e) {
          setRekapAggregation([]);
        } finally {
          setRekapLoading(false);
        }
      };
      fetchRekap();
    }
  }, [user, token]);

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen"><Skeleton className="h-8 w-1/2 mb-4" /><Skeleton className="h-10 w-1/3 mb-2" /><Skeleton className="h-10 w-1/3 mb-2" /><Skeleton className="h-10 w-1/3 mb-2" /></div>;

  // Fungsi untuk menghitung perubahan persentase
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
  };

  // Fungsi untuk mendapatkan data bulan lalu
  const getLastMonthData = (data: any[], dateField: string) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.getMonth() === lastMonth.getMonth() && 
             itemDate.getFullYear() === lastMonth.getFullYear();
    });
  };

  // Fungsi untuk mendapatkan data bulan ini
  const getCurrentMonthData = (data: any[], dateField: string) => {
    const currentMonth = new Date();
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.getMonth() === currentMonth.getMonth() && 
             itemDate.getFullYear() === currentMonth.getFullYear();
    });
  };

  // Data untuk perhitungan
  const currentMonthLetters = getCurrentMonthData(letters, 'createdAt');
  const lastMonthLetters = getLastMonthData(letters, 'createdAt');
  const currentMonthPengajuan = getCurrentMonthData(pengajuan, 'createdAt');
  const lastMonthPengajuan = getLastMonthData(pengajuan, 'createdAt');

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

  const exportExcel = async () => {
    try {
      // Ambil data pengajuan dengan relasi lengkap untuk export (sama seperti di PengajuanIndex)
      const res = await apiGet('/api/pengajuan', token);
      const pengajuanData = res.data || res.pengajuan || [];

      // Sheet 1: Data Detail per Pengajuan
      const detailData = pengajuanData.map((item: any) => ({
        'Nama': item.pegawai?.nama || '-',
        'Status': getStatusLabel(item.status),
        'Kabupaten/Kota': item.office?.kabkota || item.office?.name || '-'
      }));

      // Sheet 2: Summary per Kabupaten
      const summaryData = rekapAggregation.map(row => {
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
      const filename = `Rekap_Status_Superadmin_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  // Statistik dinamis
  const stats = [
    {
      title: 'Total Surat',
      value: letters.length,
      change: calculatePercentageChange(letters.length, lastMonthLetters.length),
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Surat Bulan Ini',
      value: currentMonthLetters.length,
      change: calculatePercentageChange(currentMonthLetters.length, lastMonthLetters.length),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Pengajuan Aktif',
      value: pengajuan.filter(p => p.status === 'active' || p.status === 'pending').length,
      change: calculatePercentageChange(
        pengajuan.filter(p => p.status === 'active' || p.status === 'pending').length,
        lastMonthPengajuan.filter(p => p.status === 'active' || p.status === 'pending').length
      ),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Surat Pending',
      value: letters.filter(l => l.status === 'draft').length,
      change: calculatePercentageChange(
        letters.filter(l => l.status === 'draft').length,
        lastMonthLetters.filter(l => l.status === 'draft').length
      ),
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  // Jenis template dinamis dari surat yang ada
  const templateTypes = Array.from(new Set(letters.map(l => l.template_name))).filter(Boolean);

  const quickActions = [
    {
      title: 'Buat Surat Baru',
      description: 'Mulai membuat surat dengan template yang tersedia',
      icon: FileText,
      href: '/generator',
      color: 'bg-blue-500',
      showForRoles: ['admin', 'operator'] // Only show for admin and operator
    },
    {
      title: 'Pengajuan',
      description: 'Buat pengajuan jabatan untuk pegawai',
      icon: Users,
      href: '/pengajuan/select',
      color: 'bg-green-500',
      showForRoles: ['admin', 'operator'] // Only show for admin and operator
    },
    {
      title: 'Lihat Laporan',
      description: 'Analisis penggunaan surat',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-purple-500',
      showForRoles: ['admin', 'operator', 'user'] // Show for all roles
    }
  ];

  // Helper badge status
  const getStatusBadge = (status: string) => {
    if (status === 'generated') return <Badge className="bg-green-100 text-green-700 border-green-200">Generated</Badge>;
    if (status === 'draft') return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Draft</Badge>;
    if (status === 'signed') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Selamat datang, {user?.full_name || user?.email || 'User'} - {user?.role || 'Operator'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500">
                  <span className="text-green-600">{stat.change}</span> dari bulan lalu
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions
          .filter(action => action.showForRoles.includes(user?.role || ''))
          .map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={action.href}>
                    Akses <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rekap Status (Pivot) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Rekap Status per Kabupaten</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" onClick={async () => {
                if (!token) return;
                try {
                  setRekapLoading(true);
                  const res = await apiGet('/api/pengajuan/rekap/aggregate', token);
                  const agg = res?.data?.aggregation || res?.aggregation || [];
                  setRekapAggregation(Array.isArray(agg) ? agg : []);
                } finally {
                  setRekapLoading(false);
                }
              }}>
                <RefreshCw className={`h-4 w-4 mr-2 ${rekapLoading ? 'animate-spin' : ''}`} /> Refresh
              </Button>
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50" onClick={exportExcel}>
                <Download className="h-4 w-4 mr-2" /> Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rekapLoading ? (
            <div className="text-center py-8 text-gray-500">Memuat rekap...</div>
          ) : rekapAggregation.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Tidak ada data</div>
          ) : (
            (() => {
              const statusKeys = Array.from(new Set(rekapAggregation.flatMap(k => k.statuses.map(s => s.status))));
              return (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-3 pr-4 font-medium">Kabupaten</th>
                        {statusKeys.map(sk => (
                          <th key={sk} className="py-3 pr-4 font-medium whitespace-nowrap text-center">{
                            (() => {
                              const map: Record<string, string> = {
                                draft: 'Draf',
                                submitted: 'Diajukan',
                                approved: 'Disetujui',
                                rejected: 'Ditolak',
                                resubmitted: 'Diajukan Ulang',
                                admin_wilayah_approved: 'Disetujui Admin Wilayah',
                                admin_wilayah_rejected: 'Ditolak Admin Wilayah',
                                final_approved: 'Selesai',
                                final_rejected: 'Ditolak Final'
                              };
                              // Gunakan split/join agar kompatibel dengan lingkungan yang tidak mendukung replaceAll
                              const fallback = (sk || '').split('_').join(' ').toUpperCase();
                              return map[sk] || fallback;
                            })()
                          }</th>
                        ))}
                        <th className="py-3 pr-4 font-medium text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekapAggregation.map(row => {
                        const countBy = row.statuses.reduce((acc: any, s) => { acc[s.status] = s.count; return acc; }, {} as Record<string, number>);
                        return (
                          <tr key={row.kabupaten} className="border-b hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium">{row.kabupaten}</td>
                            {statusKeys.map(sk => (
                              <td key={sk} className="py-3 pr-4 text-center">{countBy[sk] || 0}</td>
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

      {/* Recent Templates (ubah jadi Jenis Template) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-green-700" /> Jenis Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templateTypes.length === 0 ? (
                <div className="text-center text-gray-500">Belum ada template surat</div>
              ) : (
                templateTypes.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">{name}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* Template Terbaru diganti, atau bisa dihapus jika tidak perlu */}
      </div>

      {/* Tabel Surat Terbaru (tambah link ke detail surat) */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Daftar Surat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full md:w-64"
              placeholder="Cari nomor, perihal, atau template..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loadingLetters ? (
            <div>Loading surat...</div>
          ) : error ? (
            <div className="text-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Nomor Surat</TableHead>
                    <TableHead>Perihal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLetters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Tidak ada surat</TableCell>
                    </TableRow>
                  ) : (
                    filteredLetters.slice(0, 5).map((l, i) => (
                      <TableRow key={l.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{l.letter_number}</TableCell>
                        <TableCell>{l.subject}</TableCell>
                        <TableCell>{getStatusBadge(l.status)}</TableCell>
                        <TableCell>
                          <Link to={`/letters/${l.id}`} className="btn btn-xs btn-outline flex items-center gap-1">
                            <FileText className="w-4 h-4" /> Detail
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
