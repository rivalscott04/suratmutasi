import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  AlertCircle,
  Loader2,
  Edit,
  Send,
  RefreshCw,
  Trash2,
  Printer,
  CheckSquare,
  XSquare,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut, apiDelete } from '@/lib/api';

interface PengajuanFile {
  id: string;
  file_type: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  blobUrl?: string;
}

interface PengajuanData {
  id: string;
  user_id?: string;
  created_by?: string;
  pegawai: {
    nama: string;
    jabatan: string;
    nip: string;
  };
  jenis_jabatan: string;
  jabatan_id?: number;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  catatan?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  approved_by?: string;
  approved_at?: string;
  resubmitted_by?: string;
  resubmitted_at?: string;
  created_at: string;
  updated_at: string;
  files: PengajuanFile[];
}

const PengajuanDetail: React.FC = () => {
  const { pengajuanId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [pengajuan, setPengajuan] = useState<PengajuanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PengajuanFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingFile, setVerifyingFile] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (pengajuanId) {
      fetchPengajuanData();
    }
  }, [isAuthenticated, navigate, pengajuanId]);

  // Deteksi scroll untuk floating sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50); // Mulai floating setelah scroll 50px
    };

    // Trigger initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/pengajuan/${pengajuanId}`, token);
      if (response.success) {
        setPengajuan(response.data.pengajuan);
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

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      const response = await apiPut(`/api/pengajuan/${pengajuanId}/approve`, {
        catatan: approvalNote
      }, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil disetujui!');
        setShowSuccessDialog(true);
        setShowApproveDialog(false);
        setApprovalNote('');
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal approve pengajuan');
      }
    } catch (error) {
      console.error('Error approving pengajuan:', error);
      setError('Terjadi kesalahan saat approve pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      const response = await apiPut(`/api/pengajuan/${pengajuanId}/reject`, {
        rejection_reason: rejectionReason
      }, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil ditolak!');
        setShowSuccessDialog(true);
        setShowRejectDialog(false);
        setRejectionReason('');
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal reject pengajuan');
      }
    } catch (error) {
      console.error('Error rejecting pengajuan:', error);
      setError('Terjadi kesalahan saat reject pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    try {
      setSubmitting(true);
      const response = await apiPut(`/api/pengajuan/${pengajuanId}/resubmit`, {}, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil diajukan ulang!');
        setShowSuccessDialog(true);
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal resubmit pengajuan');
      }
    } catch (error) {
      console.error('Error resubmitting pengajuan:', error);
      setError('Terjadi kesalahan saat resubmit pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      const response = await apiDelete(`/api/pengajuan/${pengajuanId}`, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil dihapus!');
        setShowSuccessDialog(true);
        setShowDeleteDialog(false);
        // Redirect setelah 2 detik agar user bisa lihat pesan sukses
        setTimeout(() => {
          navigate('/pengajuan');
        }, 2000);
      } else {
        setError(response.message || 'Gagal menghapus pengajuan');
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting pengajuan:', error);
      setError('Terjadi kesalahan saat menghapus pengajuan');
      setShowDeleteDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Clock },
      submitted: { label: 'Diajukan', className: 'bg-blue-100 text-blue-800', icon: FileText },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-800', icon: XCircle },

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

  const getFileDisplayName = (fileType: string): string => {
    const fileTypeMap: Record<string, string> = {
      'surat_pengantar': 'Surat Pengantar',
      'surat_permohonan_dari_yang_bersangkutan': 'Surat Permohonan Dari Yang Bersangkutan',
      'surat_keputusan_cpns': 'Surat Keputusan CPNS',
      'surat_keputusan_pns': 'Surat Keputusan PNS',
      'surat_keputusan_kenaikan_pangkat_terakhir': 'Surat Keputusan Kenaikan Pangkat Terakhir',
      'surat_keputusan_jabatan_terakhir': 'Surat Keputusan Jabatan Terakhir',
      'skp_2_tahun_terakhir': 'SKP 2 Tahun Terakhir',
      'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan Yang Diterbitkan Inspektorat Jenderal Kementerian Agama',
      'surat_keterangan_anjab_abk_instansi_asal': 'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi asal',
      'surat_keterangan_anjab_abk_instansi_penerima': 'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi penerima',
      'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat Dalam 1 (satu) Tahun Terakhir Dari PPK',
      'surat_persetujuan_mutasi_asal': 'Surat Persetujuan Mutasi dari ASAL dengan menyebutkan jabatan yang akan diduduki',
      'surat_lolos_butuh_ppk': 'Surat Lolos Butuh dari Pejabat Pembina Kepegawaian instansi yang dituju',
      'peta_jabatan': 'Peta Jabatan',
      'surat_keterangan_tidak_tugas_belajar': 'Surat Keterangan Tidak Sedang Tugas Belajar',
      'sptjm_pimpinan_satker_asal': 'SPTJM Pimpinan Satker dari Asal',
      'sptjm_pimpinan_satker_penerima': 'SPTJM Pimpinan Satker dari Penerima',
      'surat_rekomendasi_instansi_pembina': 'Surat Rekomendasi Instansi Pembina'
    };
    
    return fileTypeMap[fileType] || fileType.replace(/_/g, ' ').toUpperCase();
  };

  // Fungsi untuk verifikasi file
  const handleVerifyFile = async (fileId: string, verificationStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      console.log('🔍 Debug handleVerifyFile:', { fileId, verificationStatus, notes, token });
      setVerifyingFile(fileId);
      
      const requestData = {
        verification_status: verificationStatus,
        verification_notes: notes
      };
      console.log('📤 Request data:', requestData);
      
      const response = await apiPut(`/api/pengajuan/files/${fileId}/verify`, requestData, token);
      console.log('📥 Response:', response);
      
      if (response.success) {
        // Update local state immediately for smooth UX
        setPengajuan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            files: prev.files.map(file => 
              file.id === fileId 
                ? { 
                    ...file, 
                    verification_status: verificationStatus,
                    verified_by: user?.email || user?.id,
                    verified_at: new Date().toISOString()
                  }
                : file
            )
          };
        });
      } else {
        setError(response.message || 'Gagal verifikasi file');
      }
    } catch (error) {
      console.error('❌ Error verifying file:', error);
      setError('Terjadi kesalahan saat verifikasi file');
    } finally {
      setVerifyingFile(null);
    }
  };

  // Fungsi untuk cetak laporan
  const handlePrintReport = async () => {
    try {
      setSubmitting(true);
      const response = await apiGet(`/api/pengajuan/${pengajuanId}/print-report`, token);
      
      if (response.success) {
        // Generate dan cetak laporan
        generatePrintReport(response.data);
      } else {
        setError(response.message || 'Gagal generate laporan');
      }
    } catch (error) {
      console.error('Error generating print report:', error);
      setError('Terjadi kesalahan saat generate laporan');
    } finally {
      setSubmitting(false);
      setShowPrintDialog(false);
    }
  };

  // Generate HTML untuk cetak
  const generatePrintReport = (data: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Pengajuan - ${data.pegawai.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .info table { width: 100%; border-collapse: collapse; }
          .info td { padding: 5px; }
          .info td:first-child { font-weight: bold; width: 150px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; font-size: 10pt; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .checkbox { width: 20px; height: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>LAPORAN PENGAJUAN JABATAN</h2>
        </div>
        
        <div class="info">
          <table>
            <tr><td>Nama</td><td>: ${data.pegawai.nama}</td></tr>
            <tr><td>NIP</td><td>: ${data.pegawai.nip}</td></tr>
            <tr><td>Jabatan</td><td>: ${data.pegawai.jabatan}</td></tr>
            <tr><td>Status</td><td>: ${data.pengajuan.status}</td></tr>
            <tr><td>Tanggal Approval</td><td>: ${new Date(data.pengajuan.approved_at).toLocaleDateString('id-ID')}</td></tr>
          </table>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Berkas</th>
              <th>Ada Berkas</th>
            </tr>
          </thead>
          <tbody>
            ${data.files.map((file: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${getFileDisplayName(file.file_type)}</td>
                <td>
                  <input type="checkbox" class="checkbox" ${file.verification_status === 'approved' ? 'checked' : ''} disabled>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Verification Footer -->
        <div style="margin-top: 40px; padding: 15px; border-top: 2px solid #ddd; text-align: center; font-size: 10pt; color: #666;">
          <div style="margin-bottom: 8px; font-weight: bold;">
            ✓ Dokumen ini telah diverifikasi dan disetujui oleh Admin Kanwil
          </div>
          <div style="font-size: 9pt;">
            Tanggal Approval: ${data.approved_at ? new Date(data.approved_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
          </div>
          <div style="font-size: 8pt; margin-top: 5px;">
            Sistem Informasi Generator Surat - Kementerian Agama
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
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

  const getFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handlePreviewFile = async (file: PengajuanFile) => {
    try {
      // Fetch file dengan token authorization
      const response = await fetch(`/api/pengajuan/files/${file.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil file');
      }
      
      // Convert ke blob
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Set preview file dengan blob URL
      setPreviewFile({
        ...file,
        blobUrl: blobUrl
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      setError('Gagal preview file. Silakan coba lagi.');
    }
  };

  const handleDownloadFile = (file: PengajuanFile) => {
    window.open(`/api/pengajuan/files/${file.id}`, '_blank');
  };

  const isAdmin = user?.role === 'admin';
  const canEdit = (pengajuan?.status === 'draft' || pengajuan?.status === 'rejected') && 
                  (isAdmin || pengajuan?.created_by === user?.id) && 
                  user?.role !== 'user'; // User dengan role 'user' tidak bisa edit
  const canDelete = pengajuan?.status === 'draft' && user?.role !== 'user'; // User dengan role 'user' tidak bisa hapus
  const canApprove = isAdmin && pengajuan?.status === 'submitted';
  const canReject = isAdmin && pengajuan?.status === 'submitted';
  // Tampilkan tombol Ajukan Ulang saat status ditolak, namun aktifkan hanya jika semua dokumen yang sebelumnya ditolak sudah diperbaiki (tidak ada yang statusnya 'rejected')
  const canShowResubmit = pengajuan?.status === 'rejected' && user?.role !== 'user'; // User dengan role 'user' tidak bisa resubmit
  

  
  // Check if all files are approved
  // Untuk status 'submitted' setelah rejection, anggap file yang baru diupload sudah sesuai (karena user sudah memperbaiki)
  const allFilesApproved = pengajuan?.files.every(file => 
    pengajuan.status === 'submitted' 
      ? (file.verification_status === 'approved' || file.verification_status === 'pending')
      : file.verification_status === 'approved'
  ) ?? false;
  
  const hasRejectedFiles = pengajuan?.files.some(file => file.verification_status === 'rejected') ?? false;
  const resubmitEnabled = !hasRejectedFiles; // aktif jika tidak ada file yang masih ditolak

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Memuat detail pengajuan...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pengajuan) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-600">Pengajuan tidak ditemukan</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <style dangerouslySetInnerHTML={{
        __html: `
          .sidebar-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `
      }} />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
           <Button
             variant="outline"
             onClick={() => navigate('/pengajuan')}
             className="flex items-center gap-2"
           >
             <ArrowLeft className="h-4 w-4" />
             Kembali ke Data Pengajuan
           </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail Pengajuan</h1>
            <p className="text-gray-600">ID: {pengajuan.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(pengajuan.status)}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Pengajuan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Pegawai */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pegawai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Nama</label>
                   <p className="text-gray-900 text-base">{pengajuan.pegawai.nama}</p>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">NIP</label>
                   <p className="text-gray-900 text-base">{pengajuan.pegawai.nip}</p>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Jabatan Saat Ini</label>
                   <p className="text-gray-900 text-base">{pengajuan.pegawai.jabatan}</p>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Jenis Jabatan Target</label>
                   <Badge variant="outline" className="text-sm">
                     {getJabatanDisplayName(pengajuan.jenis_jabatan)}
                   </Badge>
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Dokumen yang Diupload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                                 Dokumen yang Diupload
                 <Badge variant="outline" className="ml-2">
                   {pengajuan.files.length} / {pengajuan.total_dokumen}
                 </Badge>
                 {isAdmin && pengajuan.status === 'submitted' && (
                   <Badge 
                     variant={allFilesApproved ? 'default' : 'destructive'}
                     className={`ml-2 ${allFilesApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                   >
                     {allFilesApproved ? 'Semua Dokumen Sesuai' : 'Ada Dokumen Tidak Sesuai'}
                   </Badge>
                 )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuan.files.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada dokumen yang diupload</p>
                                     {canEdit && (
                     <Button
                       onClick={() => navigate(pengajuan.status === 'draft' ? `/pengajuan/${pengajuan.id}/upload` : `/pengajuan/${pengajuan.id}/edit`)}
                       className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                     >
                       <Edit className="h-4 w-4 mr-2" />
                       {pengajuan.status === 'draft' ? 'Upload Dokumen' : 'Perbaiki Dokumen'}
                     </Button>
                   )}
                </div>
              ) : (
                <div className="space-y-4">
                  {pengajuan.files.map((file) => (
                                         <div key={file.id} className="p-6 border rounded-lg">
                       <div className="flex items-center justify-between">
                         <div className="flex-1 space-y-2">
                           <h4 className="font-medium text-base">{getFileDisplayName(file.file_type)}</h4>
                           <p className="text-sm text-gray-600">{file.file_name}</p>
                           <p className="text-xs text-gray-500">{getFileSize(file.file_size)}</p>
                          
                                                     {/* Status Verifikasi - Selalu tampilkan status */}
                           <div className="mt-3 space-y-2">
                             <Badge 
                               variant={file.verification_status === 'approved' ? 'default' : 'destructive'}
                               className={`transition-all duration-500 ease-in-out transform ${
                                 file.verification_status === 'approved' 
                                   ? 'bg-green-100 text-green-800' 
                                   : file.verification_status === 'rejected'
                                   ? 'bg-red-100 text-red-800'
                                   : 'bg-gray-100 text-gray-800'
                               }`}
                             >
                               {file.verification_status === 'approved' 
                                 ? 'Sesuai' 
                                 : file.verification_status === 'rejected'
                                 ? 'Tidak Sesuai'
                                 : 'Belum Diverifikasi'
                               }
                               {file.verified_by && ` - ${file.verified_by}`}
                             </Badge>
                             {file.verification_notes && (
                               <p className="text-xs text-gray-600">{file.verification_notes}</p>
                             )}
                           </div>
                        </div>
                        
                                                 <div className="flex items-center gap-3">
                           {/* Switch Toggle Verifikasi - Hanya untuk Admin */}
                           {isAdmin && (pengajuan.status === 'submitted' || pengajuan.status === 'rejected') && (
                             <div className="flex items-center gap-3 mr-3">
                              {verifyingFile === file.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                              ) : (
                                                                                                   <div className="flex items-center gap-3 transition-all duration-500 ease-in-out">
                                    <div className="relative transform transition-all duration-500 ease-in-out hover:scale-105 active:scale-95">
                                      <Switch
                                        id={`verify-${file.id}`}
                                        checked={file.verification_status === 'approved'}
                                        onCheckedChange={(checked) => {
                                          const status = checked ? 'approved' : 'rejected';
                                          handleVerifyFile(file.id, status);
                                        }}
                                        disabled={verifyingFile === file.id}
                                        className={`transition-all duration-500 ease-in-out transform ${
                                          file.verification_status === 'approved' 
                                            ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                                            : 'data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600'
                                        }`}
                                      />
                                    </div>
                                                                       <Label 
                                      htmlFor={`verify-${file.id}`} 
                                      className={`text-sm font-medium cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 ${
                                        file.verification_status === 'approved' 
                                          ? 'text-green-700' 
                                          : file.verification_status === 'rejected'
                                          ? 'text-red-700'
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {file.verification_status === 'approved' 
                                        ? 'Sesuai' 
                                        : file.verification_status === 'rejected'
                                        ? 'Tidak Sesuai'
                                        : 'Belum Diverifikasi'
                                      }
                                    </Label>
                                 </div>
                              )}
                            </div>
                          )}
                          
                                                     <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handlePreviewFile(file)}
                             className="px-3 py-2"
                           >
                             <Eye className="h-4 w-4 mr-2" />
                             Preview
                           </Button>
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => handleDownloadFile(file)}
                             className="px-3 py-2"
                           >
                             <Download className="h-4 w-4 mr-2" />
                             Download
                           </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

                          {/* Sidebar */}
          <div 
            className={`space-y-6 transition-all duration-300 ${
              isScrolled ? 'lg:sticky lg:top-6 lg:z-40 lg:self-start sidebar-scroll' : ''
            }`}
                         style={isScrolled ? { 
               position: 'sticky', 
               top: '80px', 
               zIndex: 40,
               maxHeight: 'calc(100vh - 120px)',
               overflowY: 'scroll',
               paddingRight: '12px'
             } : {}}
          >
          {/* Timeline Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                                 <div className="flex items-start gap-4">
                   <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                   <div className="flex-1 space-y-1">
                     <p className="font-medium">Dibuat</p>
                     <p className="text-sm text-gray-600">{formatDate(pengajuan.created_at)}</p>
                   </div>
                 </div>
                
                                 {pengajuan.status !== 'draft' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Diajukan</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                     </div>
                   </div>
                 )}

                 {pengajuan.status === 'approved' && pengajuan.approved_at && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Disetujui</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.approved_at)}</p>
                       {pengajuan.approved_by && (
                         <p className="text-xs text-gray-500">oleh {pengajuan.approved_by}</p>
                       )}
                     </div>
                   </div>
                 )}

                 {pengajuan.status === 'rejected' && pengajuan.rejected_at && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Ditolak</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.rejected_at)}</p>
                       {pengajuan.rejected_by && (
                         <p className="text-xs text-gray-500">oleh {pengajuan.rejected_by}</p>
                       )}
                     </div>
                   </div>
                 )}

                 
              </div>
            </CardContent>
          </Card>

          {/* Catatan */}
          {(pengajuan.catatan || pengajuan.rejection_reason) && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                                 {pengajuan.catatan && (
                   <div className="mb-6">
                                           <p className="text-sm font-medium text-gray-700 mb-3">Catatan Persetujuan:</p>
                     <p className="text-sm text-gray-900 bg-green-50 p-4 rounded-lg leading-relaxed">{pengajuan.catatan}</p>
                   </div>
                 )}
                 {pengajuan.rejection_reason && (
                   <div>
                                           <p className="text-sm font-medium text-gray-700 mb-3">Alasan Penolakan:</p>
                     <p className="text-sm text-gray-900 bg-red-50 p-4 rounded-lg leading-relaxed">{pengajuan.rejection_reason}</p>
                   </div>
                 )}
              </CardContent>
            </Card>
          )}

                     {/* Aksi */}
           <Card>
             <CardHeader>
               <CardTitle>Aksi</CardTitle>
             </CardHeader>
                           <CardContent className="space-y-3">
                {canApprove && allFilesApproved && (
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                )}
                
                {canReject && (hasRejectedFiles || !allFilesApproved) && (
                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                )}
                
                {canShowResubmit && (
                  <Button
                    onClick={handleResubmit}
                    disabled={submitting || !resubmitEnabled}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Ajukan Ulang
                      </>
                    )}
                  </Button>
                )}
                
                                 {canEdit && (
                   <Button
                     onClick={() => navigate(pengajuan.status === 'draft' ? `/pengajuan/${pengajuan.id}/upload` : `/pengajuan/${pengajuan.id}/edit`)}
                     className="w-full bg-green-600 hover:bg-green-700 text-white"
                   >
                     <Edit className="h-4 w-4 mr-2" />
                     {pengajuan.status === 'draft' ? 'Upload Dokumen' : 'Perbaiki Dokumen'}
                   </Button>
                 )}
                 
                 
                
                {canDelete && (
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Pengajuan
                  </Button>
                )}
                
                {pengajuan.status === 'approved' && (
                  <Button
                    onClick={() => setShowPrintDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak Laporan
                  </Button>
                )}
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
                         <DialogTitle>Setujui Pengajuan</DialogTitle>
          </DialogHeader>
                       <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                                   <Textarea
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Masukkan catatan persetujuan..."
                    rows={3}
                    className="min-h-[80px]"
                  />
               </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowApproveDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                                 {submitting ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Memproses...
                   </>
                 ) : (
                   'Setujui'
                 )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             {/* Delete Dialog */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Hapus Pengajuan</AlertDialogTitle>
             <AlertDialogDescription>
               Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan dan semua file yang diupload akan dihapus secara permanen.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
             <AlertDialogAction
               onClick={handleDelete}
               disabled={submitting}
               className="bg-red-600 hover:bg-red-700 text-white"
             >
               {submitting ? (
                 <>
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   Menghapus...
                 </>
               ) : (
                 'Hapus Pengajuan'
               )}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       {/* Print Report Dialog */}
       <AlertDialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Cetak Laporan</AlertDialogTitle>
             <AlertDialogDescription>
               Apakah Anda yakin ingin mencetak laporan pengajuan ini? Laporan akan dibuka di tab baru untuk dicetak.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
             <AlertDialogAction
               onClick={handlePrintReport}
               disabled={submitting}
               className="bg-blue-600 hover:bg-blue-700 text-white"
             >
                                {submitting ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Menyiapkan...
                   </>
                 ) : (
                   <>
                     <Printer className="h-4 w-4 mr-2" />
                     Cetak Laporan
                   </>
                 )}
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       {/* Reject Dialog */}
       <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
                         <DialogTitle>Tolak Pengajuan</DialogTitle>
          </DialogHeader>
                     <div className="space-y-4">
             <div className="space-y-2">
                               <label className="text-sm font-medium text-gray-700">Alasan Penolakan *</label>
                                 <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={3}
                    required
                    className="min-h-[80px]"
                  />
             </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                disabled={submitting || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                                 {submitting ? (
                   <>
                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Memproses...
                   </>
                 ) : (
                   'Tolak'
                 )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             {/* Preview Modal */}
       <Dialog open={showPreview} onOpenChange={(open) => {
         setShowPreview(open);
         // Cleanup blob URL when modal closes
         if (!open && previewFile?.blobUrl) {
           URL.revokeObjectURL(previewFile.blobUrl);
         }
       }}>
         <DialogContent className="max-w-4xl">
           <DialogHeader>
             <DialogTitle>Preview File: {previewFile?.file_name}</DialogTitle>
           </DialogHeader>
           <div className="mt-4">
             {previewFile && (
               <div className="border rounded-lg overflow-hidden bg-white">
                 <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between">
                   <span className="font-medium">{previewFile.file_name}</span>
                 </div>
                 <iframe
                   src={previewFile.blobUrl || `/api/pengajuan/files/${previewFile.id}`}
                   className="w-full h-96 border-0"
                   title="File Preview"
                 />
               </div>
             )}
           </div>
         </DialogContent>
       </Dialog>

       {/* Success Dialog */}
       <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle className="flex items-center gap-2">
               <CheckCircle className="h-5 w-5 text-green-600" />
               Berhasil!
             </AlertDialogTitle>
             <AlertDialogDescription className="text-green-700">
               {successMessage}
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogAction
               onClick={() => setShowSuccessDialog(false)}
               className="bg-green-600 hover:bg-green-700 text-white"
             >
               OK
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       
     </div>
   );
 };

 export default PengajuanDetail;
