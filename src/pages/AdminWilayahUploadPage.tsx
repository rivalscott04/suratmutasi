import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, User, Calendar, MapPin, CheckCircle, XCircle, Send, ChevronDown } from 'lucide-react';
import AdminWilayahFileUpload from '@/components/AdminWilayahFileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';

interface PengajuanDetail {
  id: string;
  jenis_jabatan: number;
  status: string;
  created_at: string;
  updated_at: string;
  pegawai?: { nama: string; nip: string };
  office?: { id: string; name: string; kabkota: string };
}

const AdminWilayahUploadPage: React.FC = () => {
  const { pengajuanId } = useParams<{ pengajuanId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableJobTypes, setAvailableJobTypes] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ required: number; total: number; isComplete: boolean }>({ required: 0, total: 0, isComplete: false });

  const fetchDetail = async () => {
    if (!token || !pengajuanId) return;
    setLoading(true);
    try {
      const res = await apiGet(`/api/admin-wilayah/pengajuan/${pengajuanId}`, token);
      if (res && res.success !== false) {
        // backend returns { success, pengajuan, adminWilayahFileConfig, uploadProgress, ... }
        setPengajuan(res.pengajuan || res.data?.pengajuan || res);
        const progress = res.uploadProgress || res.data?.uploadProgress;
        if (progress) {
          const uploadedCount = Number(progress.required ?? 0); // backend uses 'required' as uploaded count
          const totalRequired = Number(progress.total ?? 0);
          const complete = typeof progress.isComplete === 'boolean' ? progress.isComplete : uploadedCount >= totalRequired;
          setUploadProgress({
            required: uploadedCount,
            total: totalRequired,
            isComplete: complete
          });
        } else {
          setUploadProgress({ required: 0, total: 0, isComplete: false });
        }
      } else {
        setPengajuan(null);
        setUploadProgress({ required: 0, total: 0, isComplete: false });
      }
    } catch (e) {
      console.error('Failed to fetch pengajuan detail', e);
      setPengajuan(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available job types from admin wilayah config
  const fetchAvailableJobTypes = async () => {
    try {
      const res = await apiGet('/api/admin-wilayah-file-config', token);
      if (res?.success && Array.isArray(res.data)) {
        // Extract unique job type names with their IDs
        const jobTypeMap = new Map();
        res.data.forEach((c: any) => {
          const jobTypeId = c.jenis_jabatan_id;
          const jobTypeName = c.jenis_jabatan?.jenis_jabatan || `Jabatan ${jobTypeId}`;
          if (jobTypeId && !jobTypeMap.has(jobTypeId)) {
            jobTypeMap.set(jobTypeId, jobTypeName);
          }
        });
        
        const names = Array.from(jobTypeMap.values());
        setAvailableJobTypes(names);
        
        // Set default selection if available
        if (names.length > 0 && !selectedJobType) {
          setSelectedJobType(names[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch job types:', error);
    }
  };

  useEffect(() => {
    fetchDetail();
    fetchAvailableJobTypes();
  }, [pengajuanId, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, pengajuan?: any) => {
    // Helper function to determine if this is submitted after admin wilayah approval
    const isSubmittedAfterAdminWilayah = (status: string, pengajuan?: any) => {
      if (status !== 'submitted' || !pengajuan) return false;
      // Check if there's evidence this was previously admin_wilayah_approved
      return pengajuan.files?.some((f: any) => f.file_category === 'admin_wilayah') || 
             pengajuan.resubmitted_at || 
             pengajuan.resubmitted_by;
    };

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Disetujui Kab/Kota</Badge>;
      case 'admin_wilayah_approved':
        return <Badge className="bg-green-700 text-white">Disetujui Admin Wilayah</Badge>;
      case 'admin_wilayah_rejected':
        return <Badge className="bg-red-600 text-white">Ditolak Admin Wilayah</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-600 text-white">
          {isSubmittedAfterAdminWilayah(status, pengajuan) ? 'Diajukan Admin Wilayah' : 'Dikirim ke Superadmin'}
        </Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">{status}</Badge>;
    }
  };

  const approve = async () => {
    if (!token || !pengajuanId) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/approve`, {}, token);
      await fetchDetail();
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (!token || !pengajuanId) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/reject`, { rejection_reason: 'Ditolak oleh Admin Wilayah' }, token);
      await fetchDetail();
    } finally {
      setSubmitting(false);
    }
  };

  const submitToSuperadmin = async () => {
    if (!token || !pengajuanId) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/submit-to-superadmin`, {}, token);
      await fetchDetail();
    } finally {
      setSubmitting(false);
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
            {getStatusBadge(pengajuan.status, pengajuan)}
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
                    <h3 className="font-semibold text-gray-900">{pengajuan.pegawai?.nama || '-'}</h3>
                    <p className="text-sm text-gray-600">NIP: {pengajuan.pegawai?.nip || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{pengajuan.office?.kabkota || '-'}</p>
                    <p className="text-sm text-gray-600">{pengajuan.office?.name || '-'}</p>
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
            {/* Job Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Jenis Berkas Admin Wilayah
              </label>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Pilih jenis berkas..." />
                </SelectTrigger>
                <SelectContent>
                  {availableJobTypes.map((jobType) => (
                    <SelectItem key={jobType} value={jobType}>
                      {jobType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Pilih jenis berkas yang sudah dikonfigurasi oleh superadmin
              </p>
            </div>

            {/* File Upload Component */}
            {selectedJobType && (
              <AdminWilayahFileUpload
                pengajuanId={pengajuan.id}
                jenisJabatanId={selectedJobType}
                onFilesUploaded={() => fetchDetail()}
                onProgressChange={(uploaded, total) => setUploadProgress({ required: uploaded, total, isComplete: uploaded >= total && total > 0 })}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {(pengajuan.status === 'approved' || pengajuan.status === 'submitted') && (
            <>
              <span className="text-sm text-gray-600 mr-2">{uploadProgress.required}/{uploadProgress.total} berkas wajib</span>
              <Button onClick={submitToSuperadmin} disabled={submitting || pengajuan.status === 'submitted' || (uploadProgress.required < uploadProgress.total)} className="bg-green-600 hover:bg-green-700 text-white">
              <Send className="h-4 w-4 mr-2" />
              {pengajuan.status === 'submitted' ? 'Sudah Dikirim' : 'Submit ke Superadmin'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWilayahUploadPage;
