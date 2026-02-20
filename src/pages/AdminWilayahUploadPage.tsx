import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, User, Calendar, MapPin, CheckCircle, XCircle, Send, ChevronDown, Loader2 } from 'lucide-react';
import { useFormSubmissionProtection } from '@/hooks/useDoubleClickProtection';
import { SubmitButton } from '@/components/ui/protected-button';
import { PageHeader } from '@/components/PageHeader';
import AdminWilayahFileUpload from '@/components/AdminWilayahFileUpload';
import UploadProgressTracker from '@/components/UploadProgressTracker';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PengajuanFile {
  id: string;
  file_type: string;
  file_category?: string;
  file_name: string;
  file_size: number;
  verification_status?: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

interface PengajuanDetail {
  id: string;
  jenis_jabatan: number;
  status: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  pegawai?: { nama: string; nip: string };
  office?: { id: string; name: string; kabkota: string };
  final_rejected_by?: string;
  final_rejected_at?: string;
  final_rejection_reason?: string;
  rejection_reason?: string;
  rejected_at?: string;
  files?: PengajuanFile[];
}

const AdminWilayahUploadPage: React.FC = () => {
  const { pengajuanId } = useParams<{ pengajuanId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [pengajuan, setPengajuan] = useState<PengajuanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { submitForm, isSubmitting } = useFormSubmissionProtection();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [availableJobTypes, setAvailableJobTypes] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ required: number; total: number; isComplete: boolean }>({ required: 0, total: 0, isComplete: false });
  const isFinalRejected = pengajuan?.status === 'admin_wilayah_rejected' && Boolean(pengajuan?.final_rejected_at);

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
      // Only show "Diajukan Admin Wilayah" if there are actual admin wilayah files
      return pengajuan.files?.some((f: any) => f.file_category === 'admin_wilayah') || false;
    };

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 text-white">Disetujui Kab/Kota</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Ditolak Admin Wilayah</Badge>;
      case 'admin_wilayah_approved':
        return <Badge className="bg-green-700 text-white">Disetujui Admin Wilayah</Badge>;
      case 'admin_wilayah_rejected':
        return <Badge className="bg-red-600 text-white">Ditolak Superadmin</Badge>;
      case 'admin_wilayah_submitted':
        return <Badge className="bg-blue-600 text-white">Diajukan Admin Wilayah</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-600 text-white">Dikirim ke Superadmin</Badge>;
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
    
    submitForm(
      async () => {
        try {
          const response = await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/submit-to-superadmin`, {}, token);
          
          if (response?.success !== false) {
            setDialogMessage("Pengajuan berhasil diajukan ke Superadmin");
            setShowSuccessDialog(true);
            // Update status immediately from response
            if (response.pengajuan) {
              setPengajuan(response.pengajuan);
            }
          }
          
          await fetchDetail();
        } catch (error: any) {
          console.error('Error submitting to superadmin:', error);
          setDialogMessage(error?.message || "Terjadi kesalahan saat mengajukan ke Superadmin");
          setShowErrorDialog(true);
        }
      },
      () => {
        // onSuccess - already handled above
      },
      (error) => {
        // onError - already handled in try-catch above
        console.error('Error submitting to superadmin:', error);
      }
    );
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

  // Cek apakah masih ada file yang rejected (untuk status admin_wilayah_rejected)
  const hasRejectedFiles = (() => {
    if (pengajuan?.status !== 'admin_wilayah_rejected') return false;
    if (!pengajuan?.files || !Array.isArray(pengajuan.files)) return false;
    const adminWilayahFiles = pengajuan.files.filter((f: any) => f.file_category === 'admin_wilayah');
    return adminWilayahFiles.some((f: any) => f.verification_status === 'rejected');
  })();

  // Draft buatan sendiri: admin wilayah bisa langsung ajukan ke superadmin setelah upload berkas
  const isOwnDraft = pengajuan.status === 'draft' && pengajuan.created_by === user?.id;
  const showSubmitButton = pengajuan.status === 'admin_wilayah_approved' || pengajuan.status === 'admin_wilayah_submitted' || pengajuan.status === 'admin_wilayah_rejected' || isFinalRejected || isOwnDraft;

  // Button disabled jika:
  // 1. Status sudah submitted
  // 2. Status rejected tapi masih ada file yang rejected (belum semua diperbaiki)
  // 3. Upload progress belum complete (untuk status normal / draft sendiri)
  const submitButtonDisabled = pengajuan.status === 'admin_wilayah_submitted' ||
                                (pengajuan.status === 'admin_wilayah_rejected' && hasRejectedFiles) ||
                                (isOwnDraft ? !uploadProgress.isComplete : (pengajuan.status !== 'admin_wilayah_rejected' && !uploadProgress.isComplete));
  
  const submitButtonLabel = pengajuan.status === 'admin_wilayah_submitted'
    ? 'Sudah Diajukan'
    : (isFinalRejected || pengajuan.status === 'admin_wilayah_rejected')
      ? 'Ajukan Lagi ke Superadmin'
      : 'Ajukan ke Superadmin';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Breadcrumb */}
        <PageHeader
          title="Upload File Admin Wilayah"
          subtitle="Upload file tambahan untuk pengajuan mutasi pegawai"
          actions={
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Admin Wilayah</Badge>
              {getStatusBadge(pengajuan.status, pengajuan)}
              <Button
                variant="outline"
                onClick={() => navigate('/admin-wilayah/dashboard')}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
          }
        />

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

            {/* Upload Progress Tracker */}
            {selectedJobType && uploadProgress.total > 0 && (
              <UploadProgressTracker
                uploaded={uploadProgress.required}
                total={uploadProgress.total}
                isComplete={uploadProgress.isComplete}
                className="mb-6"
              />
            )}

            {(isFinalRejected || pengajuan.status === 'admin_wilayah_rejected') && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold mb-1">Dokumen Admin Wilayah Ditolak</p>
                <p>{pengajuan.final_rejection_reason || pengajuan.rejection_reason || 'Perbaiki dokumen admin wilayah yang ditolak sebelum mengirim ulang ke Superadmin.'}</p>
                {(pengajuan.final_rejected_at || pengajuan.rejected_at) && (
                  <p className="text-xs text-red-600 mt-2">
                    Ditolak pada: {formatDate(pengajuan.final_rejected_at || pengajuan.rejected_at!)}
                  </p>
                )}
              </div>
            )}

            {/* File Upload Component */}
            {selectedJobType && (
              <AdminWilayahFileUpload
                pengajuanId={pengajuan.id}
                jenisJabatanId={selectedJobType}
                onFilesUploaded={() => fetchDetail()}
                onProgressChange={(uploaded, total) => setUploadProgress({ required: uploaded, total, isComplete: uploaded >= total && total > 0 })}
                pengajuanStatus={pengajuan.status}
                pengajuanData={pengajuan}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {showSubmitButton && (
            <>
              <span className="text-sm text-gray-600 mr-2">{uploadProgress.required}/{uploadProgress.total} berkas wajib</span>
              <SubmitButton 
                onClick={submitButtonDisabled ? () => {} : submitToSuperadmin} 
                className={`bg-green-600 hover:bg-green-700 text-white ${submitButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                isProcessing={isSubmitting}
                processingText="Mengirim..."
                onError={() => {}}
                onSuccess={() => {}}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitButtonLabel}
              </SubmitButton>
            </>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-green-600 text-lg">
            <CheckCircle className="h-5 w-5" />
            Berhasil!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            {dialogMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => setShowSuccessDialog(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-lg">
            <XCircle className="h-5 w-5" />
            Gagal Mengajukan
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-700">
            {dialogMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => setShowErrorDialog(false)}
            className="bg-red-600 hover:bg-red-700"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWilayahUploadPage;
