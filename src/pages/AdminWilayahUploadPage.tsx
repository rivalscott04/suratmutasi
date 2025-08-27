import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, User, Calendar, MapPin } from 'lucide-react';
import AdminWilayahFileUpload from '@/components/AdminWilayahFileUpload';

interface Pengajuan {
  id: string;
  pegawai: {
    nama: string;
    nip: string;
    jabatan: string;
    kantor: string;
  };
  jenis_jabatan: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminWilayahUploadPage: React.FC = () => {
  const { pengajuanId } = useParams<{ pengajuanId: string }>();
  const navigate = useNavigate();
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data untuk development
  useEffect(() => {
    const mockPengajuan: Pengajuan = {
      id: pengajuanId || 'p001',
      pegawai: {
        nama: 'Ahmad Supriadi',
        nip: '198501152010011001',
        jabatan: 'Guru Madrasah Aliyah',
        kantor: 'Kantor Kementerian Agama Kabupaten Bandung'
      },
      jenis_jabatan: 'Guru',
      status: 'approved',
      created_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    };

    setPengajuan(mockPengajuan);
    setLoading(false);
  }, [pengajuanId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Disetujui</Badge>;
      case 'admin_wilayah_upload':
        return <Badge className="bg-blue-600 text-white">Upload Admin Wilayah</Badge>;
      case 'admin_wilayah_review':
        return <Badge className="bg-yellow-600 text-white">Review Admin Wilayah</Badge>;
      case 'final_ready_for_sk':
        return <Badge className="bg-purple-600 text-white">Siap SK</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Pengajuan Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Pengajuan yang Anda cari tidak ditemukan atau tidak memiliki akses.</p>
            <Button
              onClick={() => navigate('/admin-wilayah/dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin-wilayah/dashboard')}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload File Admin Wilayah</h1>
              <p className="text-gray-600 mt-1">
                Upload file tambahan untuk pengajuan mutasi pegawai
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Admin Wilayah</Badge>
            {getStatusBadge(pengajuan.status)}
          </div>
        </div>

        {/* Pengajuan Info */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Pengajuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{pengajuan.pegawai.nama}</h3>
                    <p className="text-sm text-gray-600">NIP: {pengajuan.pegawai.nip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{pengajuan.pegawai.jabatan}</p>
                    <p className="text-sm text-gray-600">{pengajuan.pegawai.kantor}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Jenis Jabatan</p>
                    <p className="text-sm text-gray-600">{pengajuan.jenis_jabatan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Tanggal Pengajuan</p>
                    <p className="text-sm text-gray-600">{formatDate(pengajuan.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Upload File Admin Wilayah</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminWilayahFileUpload
              pengajuanId={pengajuan.id}
              jenisJabatanId={1} // Mock ID, should come from pengajuan
              onFilesUploaded={(files) => {
                console.log('Files uploaded:', files);
                // Handle files uploaded
              }}
            />
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Panduan Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Section A:</strong> Berkas Kab/Kota - File yang sudah diupload oleh kabupaten/kota (read-only)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Section B:</strong> File Wajib Kanwil - File wajib yang harus diupload (1-5, 7)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Section C:</strong> File Khusus - Pilih varian 6.x sesuai jenis jabatan
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Catatan:</strong> Semua file wajib harus diupload dan diverifikasi sebelum dapat mengirim untuk review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800">Daftar File Wajib</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">File Wajib (1-5, 7):</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>1. Surat Pernyataan Persetujuan dari Kepala Wilayah</li>
                    <li>2. Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar</li>
                    <li>3. Surat Pernyataan Tidak Sedang Dijatuhi Hukuman Disiplin</li>
                    <li>4. Surat Pernyataan Tidak Sedang Menjalani Proses Pidana</li>
                    <li>5. Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</li>
                    <li>7. Surat Pengantar Permohonan Penerbitan SK</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">File Khusus (6.x):</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>6.1 - Untuk Eselon (Jabatan Pengawas)</li>
                    <li>6.2 - Untuk Penyuluh Agama Islam</li>
                    <li>6.3 - Untuk Guru, Pengawas, Kepala Madrasah</li>
                    <li>6.4 - Untuk Analis SDM dan Asesor</li>
                    <li>6.5 - Untuk Arsiparis, BARJAS</li>
                    <li>6.6 - Untuk Analis Pengelolaan Keuangan APBN</li>
                    <li>6.7 - Untuk Perencana</li>
                    <li>6.8 - Untuk Pranata Humas</li>
                    <li>6.9 - Untuk Analis Kebijakan</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWilayahUploadPage;
