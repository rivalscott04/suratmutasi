import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Clock, Users, ArrowRight, BarChart3, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [letters, setLetters] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [search, setSearch] = useState('');
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

      setLoadingEmployees(true);
      apiGet('/api/employees', token)
        .then(res => setEmployees(res.employees || []))
        .catch(() => setEmployees([]))
        .finally(() => setLoadingEmployees(false));
    }
  }, [user, token]);

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen"><Skeleton className="h-8 w-1/2 mb-4" /><Skeleton className="h-10 w-1/3 mb-2" /><Skeleton className="h-10 w-1/3 mb-2" /><Skeleton className="h-10 w-1/3 mb-2" /></div>;

  // Statistik dinamis
  const stats = [
    {
      title: 'Total Surat',
      value: letters.length,
      change: '+12%',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Surat Bulan Ini',
      value: letters.filter(l => new Date(l.createdAt).getMonth() === new Date().getMonth()).length,
      change: '+5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Pegawai Terdaftar',
      value: employees.length,
      change: '+3%',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Surat Pending',
      value: letters.filter(l => l.status === 'draft').length,
      change: '-1',
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
      color: 'bg-blue-500'
    },
    {
      title: 'Kelola Pegawai',
      description: 'Tambah atau edit data pegawai',
      icon: Users,
      href: '/settings',
      color: 'bg-green-500'
    },
    {
      title: 'Lihat Laporan',
      description: 'Analisis penggunaan surat',
      icon: BarChart3,
      href: '/reports',
      color: 'bg-purple-500'
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
        {quickActions.map((action, index) => {
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
