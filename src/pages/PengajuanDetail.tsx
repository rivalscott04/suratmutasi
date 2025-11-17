import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
  X,
  ChevronLeft,
  ChevronRight,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// NOTE: Adjust the import path if the package scaffolds into a different alias
import ExpandableCards, { Card as SUExpandableCard } from '@/components/smoothui/ui/ExpandableCards';
import { apiGet, apiPut, apiDelete, apiPost, replaceFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { EditJabatanDialog } from '@/components/EditJabatanDialog';
import { AuditLogCard } from '@/components/AuditLogCard';

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
  file_category?: 'kabupaten' | 'admin_wilayah';
  uploaded_by_role?: string;
  uploaded_by_name?: string;
  uploaded_by_office?: string;
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
  office?: {
    name: string;
    kabkota: string;
    address?: string;
  };
  jenis_jabatan: string;
  jabatan_id?: number;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'admin_wilayah_approved' | 'admin_wilayah_rejected' | 'admin_wilayah_submitted' | 'final_approved' | 'final_rejected';
  catatan?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  approved_by?: string;
  approved_at?: string;
  resubmitted_by?: string;
  resubmitted_at?: string;
  final_approved_by?: string;
  final_approved_at?: string;
  final_rejected_by?: string;
  final_rejected_at?: string;
  final_rejection_reason?: string;
  created_at: string;
  updated_at: string;
  files: PengajuanFile[];
}

const PengajuanDetail: React.FC = () => {
  const { pengajuanId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, originalUser, isImpersonating } = useAuth();
  const { toast } = useToast();
  const [pengajuan, setPengajuan] = useState<PengajuanData | null>(null);
  const [requiredKabupaten, setRequiredKabupaten] = useState<string[]>([]);
  const [requiredKanwil, setRequiredKanwil] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'KabupatenKota' | 'admin_wilayah' | 'ringkasan'>('KabupatenKota');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PengajuanFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFinalApproveDialog, setShowFinalApproveDialog] = useState(false);
  const [showFinalRejectDialog, setShowFinalRejectDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isVerificationPanelCollapsed, setIsVerificationPanelCollapsed] = useState(false);
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [finalApprovalNote, setFinalApprovalNote] = useState('');
  const [finalRejectionReason, setFinalRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingFile, setVerifyingFile] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<'left' | 'right'>('left');
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [selectedExpandableCard, setSelectedExpandableCard] = useState<number | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [updatingVerification, setUpdatingVerification] = useState(false);
  const [showEditJabatanDialog, setShowEditJabatanDialog] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Check if there are admin wilayah files
  const hasAdminWilayahFiles = pengajuan?.files?.some(file => file.file_category === 'admin_wilayah') || false;
  


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

  // Initialize verification notes when preview modal opens
  useEffect(() => {
    if (previewFile && showPreview) {
      setVerificationNotes('');
    }
  }, [previewFile, showPreview]);

  const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      // Add timestamp to force fresh data
      const timestamp = new Date().getTime();
      const response = await apiGet(`/api/pengajuan/${pengajuanId}?t=${timestamp}`, token);
      if (response.success) {
        setPengajuan(response.data.pengajuan);
        // simpan daftar required kab/kota dari job type
        if (Array.isArray(response.data.requiredFiles)) {
          setRequiredKabupaten(response.data.requiredFiles as string[]);
        } else {
          setRequiredKabupaten([]);
        }
        // ambil konfigurasi kanwil untuk daftar file wajib (untuk admin wilayah dan superadmin)
        if (user?.role === 'admin_wilayah' || user?.role === 'admin') {
          try {
            const awRes = await apiGet(`/api/admin-wilayah/pengajuan/${pengajuanId}`, token);
            const reqList = (awRes?.adminWilayahFileConfig?.required || awRes?.data?.adminWilayahFileConfig?.required || []) as Array<{ file_type: string }>;
            setRequiredKanwil(reqList.map((r) => r.file_type));
          } catch (e) {
            setRequiredKanwil([]);
          }
        } else {
          setRequiredKanwil([]);
        }
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
      
      let response;
      if (isAdminWilayah) {
        // Admin wilayah menggunakan endpoint admin-wilayah
        response = await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/approve`, { notes: approvalNote }, token);
      } else {
        // Superadmin: cek status pengajuan untuk menentukan endpoint yang tepat
        if (pengajuan?.status === 'admin_wilayah_submitted') {
          // Untuk status admin_wilayah_submitted, gunakan final approval
          response = await apiPost(`/api/pengajuan/${pengajuanId}/final-approve`, { notes: approvalNote }, token);
        } else {
          // Untuk status lainnya (submitted, rejected), gunakan approve biasa
          response = await apiPut(`/api/pengajuan/${pengajuanId}/approve`, { catatan: approvalNote }, token);
        }
      }
      
      if (response.success) {
        const successMessage = pengajuan?.status === 'admin_wilayah_submitted' 
          ? 'Pengajuan berhasil disetujui final!' 
          : 'Pengajuan berhasil disetujui!';
        const toastMessage = pengajuan?.status === 'admin_wilayah_submitted' 
          ? 'Pengajuan disetujui final.' 
          : 'Pengajuan disetujui.';
        
        setSuccessMessage(successMessage);
        setShowSuccessDialog(true);
        setShowApproveDialog(false);
        setApprovalNote('');
        toast({ title: 'Berhasil', description: toastMessage });
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal approve pengajuan');
        toast({ title: 'Gagal', description: response.message || 'Gagal approve pengajuan', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error approving pengajuan:', error);
      setError('Terjadi kesalahan saat approve pengajuan');
      toast({ title: 'Kesalahan', description: 'Terjadi kesalahan saat approve pengajuan', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      
      let response;
      if (isAdminWilayah) {
        // Admin wilayah menggunakan endpoint admin-wilayah
        response = await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/reject`, { rejection_reason: rejectionReason }, token);
      } else {
        // Superadmin: cek status pengajuan untuk menentukan endpoint yang tepat
        if (pengajuan?.status === 'admin_wilayah_submitted') {
          // Untuk status admin_wilayah_submitted, gunakan final rejection
          response = await apiPost(`/api/pengajuan/${pengajuanId}/final-reject`, { rejection_reason: rejectionReason }, token);
        } else {
          // Untuk status lainnya (submitted, rejected), gunakan reject biasa
          response = await apiPut(`/api/pengajuan/${pengajuanId}/reject`, { rejection_reason: rejectionReason }, token);
        }
      }
      
      if (response.success) {
        const successMessage = pengajuan?.status === 'admin_wilayah_submitted' 
          ? 'Pengajuan berhasil ditolak final!' 
          : 'Pengajuan berhasil ditolak!';
        const toastMessage = pengajuan?.status === 'admin_wilayah_submitted' 
          ? 'Pengajuan ditolak final.' 
          : 'Pengajuan ditolak.';
        
        setSuccessMessage(successMessage);
        setShowSuccessDialog(true);
        setShowRejectDialog(false);
        setRejectionReason('');
        toast({ title: 'Berhasil', description: toastMessage });
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal reject pengajuan');
        toast({ title: 'Gagal', description: response.message || 'Gagal reject pengajuan', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error rejecting pengajuan:', error);
      setError('Terjadi kesalahan saat reject pengajuan');
      toast({ title: 'Kesalahan', description: 'Terjadi kesalahan saat reject pengajuan', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalApprove = async () => {
    try {
      setSubmitting(true);
      const response = await apiPost(`/api/pengajuan/${pengajuanId}/final-approve`, { notes: approvalNote }, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil disetujui final!');
        setShowSuccessDialog(true);
        setShowFinalApproveDialog(false);
        setApprovalNote('');
        toast({ title: 'Berhasil', description: 'Pengajuan disetujui final.' });
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal approve final pengajuan');
        toast({ title: 'Gagal', description: response.message || 'Gagal approve final pengajuan', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error final approving pengajuan:', error);
      setError('Terjadi kesalahan saat approve final pengajuan');
      toast({ title: 'Kesalahan', description: 'Terjadi kesalahan saat approve final pengajuan', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalReject = async () => {
    try {
      setSubmitting(true);
      const response = await apiPost(`/api/pengajuan/${pengajuanId}/final-reject`, { rejection_reason: rejectionReason }, token);
      
      if (response.success) {
        setSuccessMessage('Pengajuan berhasil ditolak final!');
        setShowSuccessDialog(true);
        setShowFinalRejectDialog(false);
        setRejectionReason('');
        toast({ title: 'Berhasil', description: 'Pengajuan ditolak final.' });
        await fetchPengajuanData();
      } else {
        setError(response.message || 'Gagal reject final pengajuan');
        toast({ title: 'Gagal', description: response.message || 'Gagal reject final pengajuan', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error final rejecting pengajuan:', error);
      setError('Terjadi kesalahan saat reject final pengajuan');
      toast({ title: 'Kesalahan', description: 'Terjadi kesalahan saat reject final pengajuan', variant: 'destructive' });
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

  const getStatusBadge = (status: string, pengajuan?: PengajuanData) => {
    // Helper function to determine if this is submitted after admin wilayah approval
    const isSubmittedAfterAdminWilayah = (status: string, pengajuan?: PengajuanData) => {
      if (status !== 'submitted' || !pengajuan) return false;
      // Only show "Diajukan Admin Wilayah" if there are actual admin wilayah files
      return pengajuan.files?.some(f => f.file_category === 'admin_wilayah') || false;
    };

    const statusConfig = {
      draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-800' },
      submitted: { 
        label: isSubmittedAfterAdminWilayah(status, pengajuan) ? 'DIAJUKAN ADMIN WILAYAH' : 'SUBMITTED', 
        className: 'bg-blue-100 text-blue-800' 
      },
      approved: { label: 'APPROVED', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'REJECTED', className: 'bg-red-100 text-red-800' },
      resubmitted: { label: 'RESUBMITTED', className: 'bg-yellow-100 text-yellow-800' },
      admin_wilayah_approved: { label: 'ADMIN_WILAYAH_APPROVED', className: 'bg-green-200 text-green-800' },
      admin_wilayah_rejected: { label: 'ADMIN_WILAYAH_REJECTED', className: 'bg-red-200 text-red-800' },
      admin_wilayah_submitted: { label: 'DIAJUKAN ADMIN WILAYAH', className: 'bg-blue-200 text-blue-800' },
      final_approved: { label: 'FINAL_APPROVED', className: 'bg-green-600 text-white' },
      final_rejected: { label: 'FINAL_REJECTED', className: 'bg-red-600 text-white' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status.toUpperCase(), className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={config.className}>
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
      // Berkas Kabupaten/Kota
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
      'hasil_uji_kompetensi': 'Hasil Uji Kompetensi',
      'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
      'anjab_abk_instansi_asal': 'Anjab/Abk Instansi Asal',
      'anjab_abk_instansi_penerima': 'Anjab/Abk Instansi Penerima',
      'surat_keterangan_tidak_tugas_belajar': 'Surat Keterangan Tidak Sedang Tugas Belajar',
      'sptjm_pimpinan_satker_asal': 'SPTJM Pimpinan Satker dari Asal',
      'sptjm_pimpinan_satker_penerima': 'SPTJM Pimpinan Satker dari Penerima',
      'surat_rekomendasi_instansi_pembina': 'Surat Rekomendasi Instansi Pembina',
      
      // Berkas Admin Wilayah (sesuai narasi)
      'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar Permohonan Rekomendasi',
      'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Kanwil Khusus',
      'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah',
      'surat_pernyataan_tidak_ikatan_dinas': 'Surat Pernyataan Tidak Ikatan Dinas',
      'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan Tidak Tugas Belajar',
      'surat_rekomendasi_kanwil': 'Surat Rekomendasi Kanwil'
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
        toast({ title: 'Perubahan tersimpan', description: `Berkas ${verificationStatus === 'approved' ? 'disetujui' : 'ditolak'}.` });
      } else {
        setError(response.message || 'Gagal verifikasi file');
        toast({ title: 'Gagal', description: response.message || 'Gagal verifikasi file', variant: 'destructive' });
      }
    } catch (error) {
      console.error('❌ Error verifying file:', error);
      setError('Terjadi kesalahan saat verifikasi file');
      toast({ title: 'Kesalahan', description: 'Terjadi kesalahan saat verifikasi file', variant: 'destructive' });
    } finally {
      setVerifyingFile(null);
    }
  };

  // Fungsi untuk update verification status dari modal preview (auto-save)
  const handleUpdateVerificationFromPreview = async (status: 'approved' | 'rejected') => {
    if (!previewFile) return;
    
    try {
      setUpdatingVerification(true);
      await handleVerifyFile(previewFile.id, status, verificationNotes);
      
      // Update preview file state
      setPreviewFile(prev => prev ? {
        ...prev,
        verification_status: status,
        verified_by: user?.email || user?.id,
        verified_at: new Date().toISOString()
      } : null);
      
      // Reset catatan setelah save
      setVerificationNotes('');
      
    } catch (error) {
      console.error('Error updating verification from preview:', error);
    } finally {
      setUpdatingVerification(false);
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

  // Handler untuk cetak laporan final
  const handleFinalPrintReport = () => {
    try {
      generateFinalPrintReport();
      setShowPrintDialog(false);
    } catch (error) {
      console.error('Error generating final print report:', error);
      setError('Terjadi kesalahan saat generate laporan final');
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
                         <tr><td>Kabupaten/Kota</td><td>: ${data.office?.kabkota || 'Tidak tersedia'}</td></tr>
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
            Si Imut Kanwil Kemenag NTB
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate HTML untuk cetak laporan FINAL (setelah final approval)
  // Helper function to format verifier display with smart mapping
  const formatVerifierDisplay = (file: any): string => {
    const verifiedBy = file.verified_by;
    if (!verifiedBy) return '-';
    
    // Determine verifier based on file category
    if (file.file_category === 'admin_wilayah') {
      // For admin wilayah files, verifier should be Superadmin
      return 'Superadmin';
    } else {
      // For kabupaten files, verifier should be Admin Wilayah
      return 'Admin Wilayah Lombok Barat';
    }
  };

  // Helper function to get verifier name for display
  const getVerifierName = (verifiedBy: string): string => {
    if (!verifiedBy) return '';
    
    // If it's an email, show user-friendly format
    if (verifiedBy.includes('@')) {
      // Map common email patterns to user-friendly names
      if (verifiedBy.includes('admin.kanwil') || verifiedBy.includes('kanwil')) {
        return 'Superadmin';
      } else if (verifiedBy.includes('admin.wilayah') || verifiedBy.includes('wilayah')) {
        return 'Admin Wilayah';
      } else if (verifiedBy.includes('admin.mataram')) {
        return 'Admin Wilayah Mataram';
      } else if (verifiedBy.includes('admin.')) {
        return 'Superadmin';
      }
      return verifiedBy; // Keep original email if no pattern matches
    }
    
    // If it's a UUID, show generic message
    if (verifiedBy.length === 36 && verifiedBy.includes('-')) {
      return 'Superadmin';
    }
    
    // Fallback to original value
    return verifiedBy;
  };

  const generateFinalPrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Pisahkan file berdasarkan kategori
    const kabupatenFiles = pengajuan.files.filter(f => f.file_category === 'kabupaten');
    const adminWilayahFiles = pengajuan.files.filter(f => f.file_category === 'admin_wilayah');
    
    // Semua file admin wilayah sudah valid, tidak perlu filter hardcoded
    const validAdminWilayahFiles = adminWilayahFiles;
    
    // Gabungkan semua file yang sudah diverifikasi
    const allVerifiedFiles = [...kabupatenFiles, ...validAdminWilayahFiles];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Final Pengajuan - ${pengajuan.pegawai?.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .info table { width: 100%; border-collapse: collapse; }
          .info td { padding: 5px; }
          .info td:first-child { font-weight: bold; width: 150px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14pt; font-weight: bold; margin-bottom: 15px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; font-size: 10pt; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .checkbox { width: 20px; height: 20px; }
          .status-approved { color: #000000; font-weight: bold; }
          .status-rejected { color: #000000; font-weight: bold; }
          .status-pending { color: #000000; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #000000; margin-bottom: 10px;">LAPORAN FINAL PENGAJUAN JABATAN</h1>
          <h3 style="color: #374151; margin: 0;">Si Imut Kanwil Kemenag NTB</h3>
        </div>
        
                          <div class="info">
           <table>
             <tr><td>Nama Pegawai</td><td>: ${pengajuan.pegawai?.nama}</td></tr>
             <tr><td>NIP</td><td>: ${pengajuan.pegawai?.nip}</td></tr>
             <tr><td>Jabatan</td><td>: ${pengajuan.pegawai?.jabatan}</td></tr>
             <tr><td>Jenis Jabatan</td><td>: ${pengajuan.jenis_jabatan}</td></tr>
                           <tr><td>Kabupaten/Kota Asal</td><td>: ${pengajuan.office?.kabkota || 'Tidak tersedia'}</td></tr>
             <tr><td>Status Pengajuan</td><td>: <span class="status-approved">FINAL APPROVED</span></td></tr>
             <tr><td>Tanggal Final Approval</td><td>: ${pengajuan.final_approved_at ? new Date(pengajuan.final_approved_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</td></tr>
             <tr><td>Disetujui Oleh</td><td>: ${pengajuan.final_approved_at ? new Date(pengajuan.final_approved_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</td></tr>
           </table>
         </div>

        <!-- Berkas Kabupaten/Kota -->
        <div class="section">
          <div class="section-title">📋 Berkas Kabupaten/Kota (${kabupatenFiles.length} dokumen)</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Berkas</th>
                <th>Status Verifikasi</th>
                <th>Verifikator</th>
              </tr>
            </thead>
            <tbody>
              ${kabupatenFiles.map((file: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${getFileDisplayName(file.file_type)}</td>
                  <td>
                    <span class="status-${file.verification_status}">
                      ${file.verification_status === 'approved' ? '✓ Sesuai' : 
                        file.verification_status === 'rejected' ? '✗ Tidak Sesuai' : 
                        '○ Belum Diverifikasi'}
                    </span>
                  </td>
                  <td>${formatVerifierDisplay(file)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Berkas Admin Wilayah -->
        <div class="section">
          <div class="section-title">🏛️ Berkas Admin Wilayah (${validAdminWilayahFiles.length} dokumen)</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Berkas</th>
                <th>Status Verifikasi</th>
                <th>Verifikator</th>
              </tr>
            </thead>
            <tbody>
              ${validAdminWilayahFiles.map((file: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${getFileDisplayName(file.file_type)}</td>
                  <td>
                    <span class="status-${file.verification_status}">
                      ${file.verification_status === 'approved' ? '✓ Sesuai' : 
                        file.verification_status === 'rejected' ? '✗ Tidak Sesuai' : 
                        '○ Belum Diverifikasi'}
                    </span>
                  </td>
                  <td>${formatVerifierDisplay(file)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Ringkasan -->
        <div class="section">
          <div class="section-title">📊 Ringkasan Dokumen</div>
          <table>
            <tr>
              <td><strong>Total Berkas Kabupaten/Kota:</strong></td>
              <td>${kabupatenFiles.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Berkas Admin Wilayah:</strong></td>
              <td>${validAdminWilayahFiles.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Semua Berkas:</strong></td>
              <td><strong>${allVerifiedFiles.length} dokumen</strong></td>
            </tr>
          </table>
        </div>
        
                 <!-- Final Verification Footer -->
         <div style="margin-top: 40px; padding: 20px; border: 3px solid #000000; border-radius: 10px; text-align: center; font-size: 11pt; background-color: #ffffff;">
           <div style="margin-bottom: 10px; font-weight: bold; color: #000000; font-size: 14pt;">
             PENGAJUAN JABATAN TELAH DISETUJUI FINAL
           </div>
           <div style="margin-bottom: 8px; font-weight: bold; color: #000000;">
             ✓ Semua dokumen telah diverifikasi dan disetujui oleh Admin Wilayah dan Superadmin
           </div>
           <div style="font-size: 10pt; color: #000000; margin-bottom: 5px;">
             Tanggal Final Approval: ${pengajuan.final_approved_at ? new Date(pengajuan.final_approved_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
           </div>
           <div style="font-size: 9pt; color: #000000; margin-top: 10px;">
             Si Imut Kanwil Kemenag NTB
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
    console.log('🔍 Preview file:', file);
    console.log('🔍 File name:', file.file_name);
    console.log('🔍 File type:', file.file_type);
    const baseUrl = (import.meta as any).env?.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '');

    const fetchWithToken = async (jwt?: string) => {
      return fetch(`${baseUrl}/api/pengajuan/files/${file.id}`, {
        method: 'GET',
        headers: { ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}), 'Accept': 'application/pdf' },
        credentials: 'include'
      });
    };

    try {
      setPreviewError(null);
      let jwt = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') || undefined : undefined);
      let res = await fetchWithToken(jwt);

      if (res.status === 401 || res.status === 403) {
        // Try refresh token flow (mirror lib/api.ts)
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.token) {
              localStorage.setItem('token', refreshData.token);
              if ((window as any).dispatchTokenUpdate) {
                (window as any).dispatchTokenUpdate(refreshData.token);
              }
              jwt = refreshData.token;
              res = await fetchWithToken(jwt);
            }
          }
        } catch {}
      }

      if (!res.ok) {
        // Tampilkan state error yang ramah di modal
        const msg = res.status === 404 ? 'File tidak ditemukan di server.' : `Gagal memuat pratinjau (kode ${res.status}).`;
        console.log('🔍 Setting preview file (error):', file);
        console.log('🔍 Error file name:', file.file_name);
        setPreviewFile(file);
        setPreviewError(msg);
        setShowPreview(true);
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/pdf')) {
        setPreviewFile(file);
        setPreviewError('Format file tidak didukung untuk pratinjau.');
        setShowPreview(true);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('🔍 Setting preview file (success):', { ...file, blobUrl });
      setPreviewFile({ ...file, blobUrl });
      setShowPreview(true);
    } catch (e) {
      setPreviewFile(file);
      setPreviewError('Terjadi kesalahan saat memuat pratinjau.');
      setShowPreview(true);
    }
  };

  const handleDownloadFile = (file: PengajuanFile) => {
    window.open(`/api/pengajuan/files/${file.id}`, '_blank');
  };

  const handleGantiFile = (file: PengajuanFile) => {
    console.log('🔍 handleGantiFile called with file:', {
      fileId: file.id,
      fileIdLength: file.id.length,
      fileIdType: typeof file.id,
      fileName: file.file_name,
      fileType: file.file_type,
      fileCategory: file.file_category,
      pengajuanId,
      pengajuanIdLength: pengajuanId?.length,
      userRole: user?.role
    });
    
    // Trigger file input langsung
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const newFile = (e.target as HTMLInputElement).files?.[0];
      if (newFile) {
        console.log('🔍 About to replace file:', {
          fileId: file.id,
          newFileName: newFile.name,
          newFileSize: newFile.size
        });
        uploadFilePengganti(file.id, newFile, file.file_category);
      }
    };
    input.click();
  };

  const uploadFilePengganti = async (fileId: string, newFile: File, fileCategory?: string) => {
    try {
      console.log('🔍 Debug replace file:', {
        pengajuanId,
        fileId,
        fileIdLength: fileId.length,
        fileIdType: typeof fileId,
        fileName: newFile.name,
        fileCategory,
        userRole: user?.role,
        token: token ? 'exists' : 'missing'
      });
      
      // Validate file ID format
      if (!fileId || fileId.length < 10) {
        throw new Error(`Invalid file ID: ${fileId}`);
      }
      
      const result = await replaceFile(pengajuanId!, fileId, newFile, token!, user?.role || '', fileCategory);
      
      toast({
        title: "Berhasil",
        description: "File berhasil diganti",
      });
      
      // Force refresh data pengajuan dengan delay untuk memastikan backend sudah selesai
      setTimeout(() => {
        fetchPengajuanData();
      }, 1000);
    } catch (error) {
      console.error('Error replacing file:', error);
      toast({
        title: "Error",
        description: "Gagal mengganti file",
        variant: "destructive"
      });
    }
  };

  // Hover handlers for expandable card overlay (desktop)
  const handleCardMouseEnter = (fileId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const anchor: 'left' | 'right' = rect.left < window.innerWidth / 2 ? 'left' : 'right';
    setHoverAnchor(anchor);
    setHoveredFileId(fileId);
  };
  const handleCardMouseLeave = () => {
    setHoveredFileId(null);
  };

  const handleToggleExpand = (fileId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const anchor: 'left' | 'right' = rect.left < window.innerWidth / 2 ? 'left' : 'right';
    setHoverAnchor(anchor);
    setExpandedFileId(prev => (prev === fileId ? null : fileId));
  };

  // Auto expand based on pengajuan status
  useEffect(() => {
    if (!pengajuan) return;
    if (activeTab !== 'KabupatenKota') return;
    
    // Gunakan sorting yang sama dengan tampilan
    const files = pengajuan.files
      .filter(f => !f.file_category || f.file_category === 'kabupaten')
      .sort((a, b) => {
        // Jika status pengajuan "rejected", prioritas file ditolak dulu
        if (pengajuan.status === 'rejected' || pengajuan.status === 'admin_wilayah_rejected') {
          const statusOrder = { 'rejected': 0, 'pending': 1, 'approved': 2 };
          const aOrder = statusOrder[a.verification_status as keyof typeof statusOrder] ?? 3;
          const bOrder = statusOrder[b.verification_status as keyof typeof statusOrder] ?? 3;
          
          if (aOrder !== bOrder) return aOrder - bOrder;
        }
        // Default: sorting alphabetical
        return a.file_type.localeCompare(b.file_type) || a.file_name.localeCompare(b.file_name);
      });
    
    if (pengajuan.status === 'rejected' || pengajuan.status === 'admin_wilayah_rejected') {
      // Saat ditolak: auto-expand file yang ditolak (setelah sorting, file ditolak di index 0)
      const rejectedIdx = files.findIndex(f => f.verification_status === 'rejected');
      if (rejectedIdx >= 0) {
        setSelectedExpandableCard(rejectedIdx + 1);
      }
    } else if (pengajuan.status === 'submitted') {
      // Saat diajukan: auto-expand file pertama
      setSelectedExpandableCard(1);
    } else {
      // Status lain: reset selection
      setSelectedExpandableCard(null);
    }
  }, [pengajuan, activeTab]);

  // Preview navigation helpers
  const getCurrentPreviewFiles = (): PengajuanFile[] => {
    if (!pengajuan) return [];
    if (activeTab === 'KabupatenKota') {
      return pengajuan.files.filter(f => !f.file_category || f.file_category === 'kabupaten');
    }
    if (activeTab === 'admin_wilayah') {
      return pengajuan.files.filter(f => f.file_category === 'admin_wilayah');
    }
    return pengajuan.files;
  };

  const goToAdjacentPreview = (direction: -1 | 1) => {
    if (!previewFile) return;
    const files = getCurrentPreviewFiles();
    const idx = files.findIndex(f => f.id === previewFile.id);
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= files.length) return;
    handlePreviewFile(files[nextIdx]);
  };

  // Keyboard navigation handler
  const handleKeyboardNavigation = (event: KeyboardEvent) => {
    // Only handle keyboard navigation when modal is open
    if (!showPreview || !previewFile) return;
    
    // Check if we're not in an input field or textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const files = getCurrentPreviewFiles();
    const currentIdx = files.findIndex(f => f.id === previewFile.id);
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (currentIdx > 0) {
          goToAdjacentPreview(-1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentIdx < files.length - 1) {
          goToAdjacentPreview(1);
        }
        break;
    }
  };

  // Add keyboard event listener when modal is open
  useEffect(() => {
    if (showPreview) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => {
        document.removeEventListener('keydown', handleKeyboardNavigation);
      };
    }
  }, [showPreview, previewFile]);

  const isAdmin = user?.role === 'admin';
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const isReadOnlyUser = user?.role === 'user';
  const isBimas = user?.role === 'bimas';
  const isReadOnlyRole = isReadOnlyUser || isBimas;
  
  // File yang pending = file yang sudah diperbaiki dan siap diajukan ulang
  const hasPendingFiles = (() => {
    if (!pengajuan) return false;
    const requiredAll = new Set<string>([...requiredKabupaten, ...requiredKanwil]);
    for (const t of requiredAll) {
      const f = pengajuan.files.find((x) => x.file_type === t);
      if (f && f.verification_status === 'pending') return true;
    }
    return false;
  })();
  
  // Operator yang sudah upload perbaikan tidak boleh edit/delete lagi, hanya bisa ajukan ulang
  const canEdit = !isReadOnlyRole && (pengajuan?.status === 'draft' || pengajuan?.status === 'rejected' || pengajuan?.status === 'admin_wilayah_rejected') && 
                  (isAdmin || pengajuan?.created_by === user?.id) && 
                  !hasPendingFiles; // Tidak bisa edit jika ada file pending
  const canDelete = !isReadOnlyRole && pengajuan?.status === 'draft' && 
                   (isAdmin || pengajuan?.created_by === user?.id) && 
                   !hasPendingFiles; // Tidak bisa delete jika ada file pending
  
  // Tampilkan tombol Ajukan Ulang saat status ditolak atau draft, namun aktifkan hanya jika semua dokumen yang sebelumnya ditolak sudah diperbaiki (tidak ada yang statusnya 'rejected')
  const canShowResubmit = !isReadOnlyRole && (pengajuan?.status === 'rejected' || pengajuan?.status === 'draft' || pengajuan?.status === 'admin_wilayah_rejected'); // Read-only roles (user, bimas) tidak bisa resubmit
  

  
  // Cek kelengkapan dan verifikasi: semua berkas wajib (kab/kota + kanwil) harus ada dan "approved"
  const allFilesApproved = (() => {
    if (!pengajuan) return false;
    const requiredAll = new Set<string>([...requiredKabupaten, ...requiredKanwil]);
    if (requiredAll.size === 0) return false;
    for (const t of requiredAll) {
      // Cari file yang sesuai dengan kategori (kabupaten untuk requiredKabupaten, admin_wilayah untuk requiredKanwil)
      const isKabupatenFile = requiredKabupaten.includes(t);
      const f = pengajuan.files.find((x) => {
        if (x.file_type !== t) return false;
        if (isKabupatenFile) {
          // File kabupaten harus memiliki file_category null, 'kabupaten', atau tidak ada
          return !x.file_category || x.file_category === 'kabupaten';
        } else {
          // File kanwil harus memiliki file_category 'admin_wilayah'
          return x.file_category === 'admin_wilayah';
        }
      });
      if (!f) return false; // wajib: harus ada
      if (f.verification_status !== 'approved') return false; // harus sesuai
    }
    return true;
  })();

  // Cek kelengkapan file kabupaten saja (untuk badge di tab Kabupaten/Kota)
  // Hanya menghitung file dari jabatan baru (requiredKabupaten)
  const allKabupatenFilesApproved = (() => {
    if (!pengajuan) return false;
    if (requiredKabupaten.length === 0) return false;
    
    // Debug: log untuk troubleshooting
    const missingFiles: string[] = [];
    const notApprovedFiles: string[] = [];
    
    for (const t of requiredKabupaten) {
      // Cari file kabupaten yang sesuai (file_category null, 'kabupaten', atau tidak ada)
      // Pastikan hanya file dari jabatan baru yang dihitung
      const f = pengajuan.files.find((x) => {
        // File harus sesuai dengan file_type
        if (x.file_type !== t) return false;
        // File kabupaten harus memiliki file_category null, 'kabupaten', atau tidak ada
        // File dengan file_category 'admin_wilayah' tidak dihitung sebagai file kabupaten
        return !x.file_category || x.file_category === 'kabupaten';
      });
      
      if (!f) {
        missingFiles.push(t);
        continue;
      }
      
      if (f.verification_status !== 'approved') {
        notApprovedFiles.push(`${t} (${f.verification_status || 'null'})`);
      }
    }
    
    return missingFiles.length === 0 && notApprovedFiles.length === 0;
  })();

  // Debug: cek file kabupaten yang tidak approved
  const notApprovedKabupatenFiles = (() => {
    if (!pengajuan) return [];
    return requiredKabupaten.map(t => {
      // Cari file kabupaten yang sesuai (file_category null, 'kabupaten', atau tidak ada)
      const f = pengajuan.files.find((x) => 
        x.file_type === t && (!x.file_category || x.file_category === 'kabupaten')
      );
      return {
        file_type: t,
        file_name: f?.file_name || 'TIDAK ADA',
        verification_status: f?.verification_status || 'TIDAK ADA'
      };
    }).filter(f => f.verification_status !== 'approved');
  })();
  
  // Cek apakah ada file kabupaten yang "rejected" (hanya rejected, bukan pending atau belum ada)
  // Setelah perubahan jabatan, file yang belum ada atau pending tidak dianggap rejected
  const hasRejectedKabupatenFiles = (() => {
    if (!pengajuan) return false;
    for (const t of requiredKabupaten) {
      // Cari file kabupaten yang sesuai (file_category null, 'kabupaten', atau tidak ada)
      const f = pengajuan.files.find((x) => 
        x.file_type === t && (!x.file_category || x.file_category === 'kabupaten')
      );
      // Hanya return true jika file ada DAN statusnya rejected
      // File yang belum ada atau pending tidak dianggap rejected
      if (f && f.verification_status === 'rejected') return true;
    }
    return false;
  })();

  // SUPERADMIN: tombol aksi hanya di tab Admin Wilayah untuk verifikasi dokumen tambahan
  // ADMIN WILAYAH: tombol aksi untuk verifikasi dokumen kabupaten
  // Admin Wilayah bisa approve/reject jika:
  // - Status submitted, approved, atau resubmitted (normal flow)
  // - Status draft setelah perubahan jabatan (jika semua file sudah approved/rejected)
  const canApprove = !isReadOnlyRole && (
    (isAdmin && pengajuan?.status === 'admin_wilayah_submitted' && activeTab === 'admin_wilayah') || 
    (isAdminWilayah && (
      pengajuan?.status === 'approved' || 
      pengajuan?.status === 'submitted' || 
      pengajuan?.status === 'resubmitted' ||
      (pengajuan?.status === 'draft' && allKabupatenFilesApproved) // Setelah perubahan jabatan, bisa approve jika semua file sudah approved
    ))
  );
  const canReject = !isReadOnlyRole && (
    (isAdmin && pengajuan?.status === 'admin_wilayah_submitted' && activeTab === 'admin_wilayah') || 
    (isAdminWilayah && (
      pengajuan?.status === 'approved' || 
      pengajuan?.status === 'submitted' || 
      pengajuan?.status === 'resubmitted' ||
      (pengajuan?.status === 'draft' && hasRejectedKabupatenFiles) // Setelah perubahan jabatan, bisa reject jika ada file rejected
    ))
  );

  // File yang rejected = file yang masih bermasalah dan tidak bisa diajukan ulang
  const hasRejectedFiles = (() => {
    if (!pengajuan) return false;
    const requiredAll = new Set<string>([...requiredKabupaten, ...requiredKanwil]);
    for (const t of requiredAll) {
      const f = pengajuan.files.find((x) => x.file_type === t);
      if (!f || f.verification_status === 'rejected') return true; // Hanya rejected, bukan pending
    }
    return false;
  })();
  
  // Bisa ajukan ulang jika tidak ada file rejected (semua file sudah diperbaiki)
  // Untuk operator kabupaten, mereka bisa ajukan ulang setelah upload file yang diperbaiki (status pending juga OK)
  const resubmitEnabled = (() => {
    if (!pengajuan) return false;
    
    // Jika user adalah operator kabupaten, mereka bisa ajukan ulang setelah upload file yang diperbaiki
    if (user?.role === 'operator') {
      // Untuk operator kabupaten yang ditolak admin wilayah, mereka bisa ajukan ulang setelah upload file yang diperbaiki
      // Tidak perlu cek file yang wajib, karena operator sudah upload file yang diperbaiki
      return true;
    }
    
    // Untuk role lain, tetap menggunakan logika lama
    return !hasRejectedFiles;
  })();

  // Cek status berkas admin wilayah untuk final approval
  const allAdminWilayahFilesApproved = (() => {
    if (!pengajuan) return false;
    const adminWilayahFiles = pengajuan.files.filter(f => f.file_category === 'admin_wilayah');
    if (adminWilayahFiles.length === 0) return false;
    
    // Semua berkas admin wilayah harus ada dan status "approved"
    for (const file of adminWilayahFiles) {
      if (file.verification_status !== 'approved') return false;
    }
    return true;
  })();

  const hasRejectedAdminWilayahFiles = (() => {
    if (!pengajuan) return false;
    const adminWilayahFiles = pengajuan.files.filter(f => f.file_category === 'admin_wilayah');
    if (adminWilayahFiles.length === 0) return false;
    
    // Ada minimal satu berkas admin wilayah yang "rejected"
    for (const file of adminWilayahFiles) {
      if (file.verification_status === 'rejected') return true;
    }
    return false;
  })();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2 text-green-600" />
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
          /* Smooth horizontal marquee on hover (desktop) */
          .marquee-wrapper { position: relative; overflow: hidden; }
          .marquee-content { display: inline-block; white-space: nowrap; }
          .group-hover\\/card .marquee-content { animation: marquee-scroll 8s linear infinite; }
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
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
        <div className="flex items-center gap-4">
          {/* Global Status */}
          {getStatusBadge(pengajuan.status, pengajuan)}
        </div>
      </div>

      {/* Progress Tracker */}
      {(() => {
        // Hanya hitung file dari jabatan baru (requiredKabupaten dan requiredKanwil)
        // File dari jabatan lama tidak dihitung meskipun file_type-nya sama
        const operatorFiles = requiredKabupaten.map(fileType => {
          // Cari file kabupaten yang sesuai dengan file_type dan file_category
          return pengajuan.files.find(f => 
            f.file_type === fileType && 
            (!f.file_category || f.file_category === 'kabupaten')
          );
        }).filter(Boolean);
        
        const adminWilayahFiles = requiredKanwil.map(fileType => {
          // Cari file admin_wilayah yang sesuai dengan file_type dan file_category
          return pengajuan.files.find(f => 
            f.file_type === fileType && 
            f.file_category === 'admin_wilayah'
          );
        }).filter(Boolean);
        
        const operatorApproved = operatorFiles.filter(f => f && f.verification_status === 'approved').length;
        const adminApproved = adminWilayahFiles.filter(f => f && f.verification_status === 'approved').length;
        
        // Selalu gunakan requiredKabupaten.length dan requiredKanwil.length (jabatan saat ini)
        const operatorTotal = requiredKabupaten.length;
        const adminTotal = requiredKanwil.length;
        const totalApproved = operatorApproved + adminApproved;
        const totalRequired = operatorTotal + adminTotal;
        const pct = totalRequired > 0 ? (totalApproved / totalRequired) * 100 : 0;
        return (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">Progress Verifikasi Berkas</div>
                <div className="text-sm text-gray-600">{totalApproved}/{totalRequired} diverifikasi</div>
              </div>
              <Progress value={pct} className="h-2" />
              <div className="mt-2 text-xs text-gray-500 flex gap-4">
                <span>Operator: {operatorApproved}/{operatorTotal}</span>
                <span>Admin Wilayah: {adminApproved}/{adminTotal}</span>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabs for file groups - hanya untuk role yang perlu verifikasi */}
      {user?.role !== 'operator' && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
          <TabsList>
            {/* Admin Wilayah: hanya Kabupaten/Kota & Ringkasan */}
            {user?.role === 'admin_wilayah' && (
              <>
                <TabsTrigger value="KabupatenKota">Kabupaten/Kota</TabsTrigger>
                <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              </>
            )}
            
            {/* Superadmin & User: semua 3 tab */}
            {(user?.role === 'admin' || isReadOnlyRole) && (
              <>
                <TabsTrigger value="KabupatenKota">Kabupaten/Kota</TabsTrigger>
                <TabsTrigger value="admin_wilayah">Admin Wilayah</TabsTrigger>
                <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Pengajuan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Pegawai (Accordion) */}
          <Accordion type="single" collapsible defaultValue="pegawai">
            <AccordionItem value="pegawai" className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="text-lg font-semibold">Informasi Pegawai</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama</label>
                    <p className="text-gray-900 text-base">{pengajuan.pegawai.nama}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">NIP</label>
                    <p className="text-gray-900 text-base">{pengajuan.pegawai.nip}</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Jabatan Saat Ini</label>
                    <p className="text-gray-900 text-base">{pengajuan.pegawai.jabatan}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Jenis Jabatan Target</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">{getJabatanDisplayName(pengajuan.jenis_jabatan)}</Badge>
                      {isAdmin && (
                        <>
                          {pengajuan.status === 'admin_wilayah_approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowEditJabatanDialog(true)}
                              className="h-7 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit Jabatan
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 h-7 text-xs"
                            onClick={() => {
                              setNewStatus(pengajuan.status);
                              setStatusChangeReason('');
                              setShowUpdateStatusDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Ubah Status
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Kabupaten/Kota Asal</label>
                    <p className="text-gray-900 text-base">{pengajuan.office?.kabkota || 'Tidak tersedia'}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Audit Log - Only visible for admin */}
          {isAdmin && (
            <AuditLogCard
              pengajuanId={pengajuanId || ''}
              token={token}
              isAdmin={isAdmin}
              showOnlyLatest={true}
              onViewAll={() => navigate(`/pengajuan/${pengajuanId}/audit-log`)}
            />
          )}

          {/* Berkas Kabupaten/Kota */}
          {(user?.role === 'operator' || activeTab === 'KabupatenKota') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Berkas Kabupaten/Kota
                <Badge variant="outline" className="ml-2">
                  {pengajuan.files.filter(f => 
                    (!f.file_category || f.file_category === 'kabupaten') && 
                    requiredKabupaten.includes(f.file_type)
                  ).length} / {requiredKabupaten.length}
                </Badge>
                {(() => {
                  const rejectedCount = pengajuan.files.filter(f => 
                    (!f.file_category || f.file_category === 'kabupaten') && 
                    requiredKabupaten.includes(f.file_type) &&
                    f.verification_status === 'rejected'
                  ).length;
                  return rejectedCount > 0 ? (
                    <Badge variant="destructive" className="ml-2 bg-red-100 text-red-800 border-red-300">
                      {rejectedCount} file ditolak
                    </Badge>
                  ) : null;
                })()}
                {/* Badge selalu ditampilkan untuk menunjukkan status dokumen kabupaten */}
                {isAdmin && pengajuan.status === 'admin_wilayah_submitted' && (
                  <>
                    <Badge 
                      variant={allKabupatenFilesApproved ? 'default' : 'destructive'}
                      className={`ml-2 ${allKabupatenFilesApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {allKabupatenFilesApproved ? 'Semua Dokumen Kabupaten Sesuai' : 'Ada Dokumen Kabupaten Tidak Sesuai'}
                    </Badge>
                    {!allKabupatenFilesApproved && notApprovedKabupatenFiles.length > 0 && (
                      <div className="ml-2 text-xs text-red-600">
                        Debug: {notApprovedKabupatenFiles.map(f => `${f.file_type}(${f.verification_status})`).join(', ')}
                      </div>
                    )}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuan.files.filter(f => !f.file_category || f.file_category === 'kabupaten').length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada dokumen kabupaten yang diupload</p>
                  {canEdit && pengajuan.status !== 'draft' && (
                    <Button
                      onClick={() => navigate(`/pengajuan/${pengajuan.id}/edit`)}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Perbaiki Dokumen
                    </Button>
                  )}

                  {canEdit && pengajuan.status === 'draft' && (
                    <Button
                      onClick={() => window.open(`http://localhost:8080/pengajuan/${pengajuan.id}/upload`, '_blank')}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Upload Dokumen
                    </Button>
                  )}
                </div>
              ) : (
                (() => {
                  // Hanya tampilkan file dari jabatan baru (requiredKabupaten)
                  // File dari jabatan lama tidak ditampilkan meskipun file_category-nya kabupaten
                  const files = pengajuan.files
                    .filter(f => {
                      // File harus memiliki file_category kabupaten atau null
                      if (f.file_category && f.file_category !== 'kabupaten') return false;
                      // File harus ada di requiredKabupaten (jabatan baru)
                      return requiredKabupaten.includes(f.file_type);
                    })
                    .sort((a, b) => {
                      // Jika status pengajuan "rejected", prioritas file ditolak dulu
                      if (pengajuan.status === 'rejected' || pengajuan.status === 'admin_wilayah_rejected') {
                        const statusOrder = { 'rejected': 0, 'pending': 1, 'approved': 2 };
                        const aOrder = statusOrder[a.verification_status as keyof typeof statusOrder] ?? 3;
                        const bOrder = statusOrder[b.verification_status as keyof typeof statusOrder] ?? 3;
                        
                        if (aOrder !== bOrder) return aOrder - bOrder;
                      }
                      // Default: sorting alphabetical
                      return a.file_type.localeCompare(b.file_type) || a.file_name.localeCompare(b.file_name);
                    });

                  const cards: SUExpandableCard[] = files.map((file, idx) => ({
                    id: idx + 1,
                    title: getFileDisplayName(file.file_type),
                    className: file.verification_status === 'rejected' ? 'border-red-300 bg-red-50 shadow-red-100' : undefined,
                    content: (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[11px] text-gray-500 truncate" title={file.file_name}>{file.file_name}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handlePreviewFile(file)} className="h-7 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            {/* Button Ganti File - hanya untuk admin dan admin_wilayah */}
                            {(user?.role === 'admin' || user?.role === 'admin_wilayah') && (
                            <Button size="sm" variant="outline" onClick={() => handleGantiFile(file)} className="h-7 px-2">
                              <Upload className="h-4 w-4 mr-1" />
                              Ganti
                            </Button>
                            )}
                          </div>
                        </div>
                        <div>
                          <Badge
                            variant={file.verification_status === 'approved' ? 'default' : 'destructive'}
                            className={`text-xs ${file.verification_status === 'approved' ? 'bg-green-100 text-green-800' : file.verification_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {file.verification_status === 'approved' ? (
                              <span className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Diverifikasi</span>
                            ) : file.verification_status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Ditolak</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending</span>
                            )}
                          </Badge>
                        </div>
                        {((isAdmin && (pengajuan.status === 'admin_wilayah_submitted' || pengajuan.status === 'rejected' || pengajuan.status === 'admin_wilayah_approved')) || (isAdminWilayah && (pengajuan.status === 'submitted' || pengajuan.status === 'approved' || pengajuan.status === 'rejected'))) && (
                          <div className="mt-1 flex items-center justify-between">
                            <span className={`text-xs ${file.verification_status === 'approved' ? 'text-green-700' : file.verification_status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                              {file.verification_status === 'approved' ? 'Sesuai' : file.verification_status === 'rejected' ? 'Tidak Sesuai' : 'Belum Diverifikasi'}
                            </span>
                            <Switch
                              id={`verify-${file.id}`}
                              checked={file.verification_status === 'approved'}
                              onCheckedChange={(checked) => handleVerifyFile(file.id, checked ? 'approved' : 'rejected')}
                              disabled={verifyingFile === file.id}
                              className="transition-colors duration-300 ease-out data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                            />
                          </div>
                        )}
                      </div>
                    ),
                  }));

                  return (
                    <ExpandableCards
                      className="gap-6"
                      totalCols={12}
                      expandedSpan={6}
                      collapsedSpan={2}
                      cards={cards}
                      selectedCard={selectedExpandableCard}
                      onSelect={setSelectedExpandableCard}
                    />
                  );
                })()
              )}
            </CardContent>
          </Card>
          )}



          {/* Berkas Admin Wilayah - tidak ditampilkan untuk operator */}
          {user?.role !== 'operator' && activeTab === 'admin_wilayah' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Berkas Admin Wilayah
                <Badge variant="outline" className="ml-2">
                  {pengajuan.files.filter(f => f.file_category === 'admin_wilayah').length} / {requiredKanwil.length}
                </Badge>
                {(() => {
                  const rejectedCount = pengajuan.files.filter(f => 
                    f.file_category === 'admin_wilayah' && 
                    f.verification_status === 'rejected'
                  ).length;
                  return rejectedCount > 0 ? (
                    <Badge variant="destructive" className="ml-2 bg-red-100 text-red-800 border-red-300">
                      {rejectedCount} file ditolak
                    </Badge>
                  ) : null;
                })()}
                {/* Badge untuk SUPERADMIN: menunjukkan status dokumen admin wilayah yang perlu diverifikasi */}
                {isAdmin && pengajuan.status === 'admin_wilayah_submitted' && (
                  <Badge 
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-800"
                  >
                    Menunggu Verifikasi SUPERADMIN
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuan.files.filter(f => f.file_category === 'admin_wilayah').length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada dokumen admin wilayah yang diupload</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pengajuan.files
                    .filter(f => f.file_category === 'admin_wilayah')
                    .sort((a, b) => {
                      // Jika status pengajuan "rejected", prioritas file ditolak dulu
                      if (pengajuan.status === 'rejected' || pengajuan.status === 'admin_wilayah_rejected') {
                        const statusOrder = { 'rejected': 0, 'pending': 1, 'approved': 2 };
                        const aOrder = statusOrder[a.verification_status as keyof typeof statusOrder] ?? 3;
                        const bOrder = statusOrder[b.verification_status as keyof typeof statusOrder] ?? 3;
                        
                        if (aOrder !== bOrder) return aOrder - bOrder;
                      }
                      // Default: sorting alphabetical
                      return a.file_type.localeCompare(b.file_type) || a.file_name.localeCompare(b.file_name);
                    })
                    .map((file) => (
                  <div key={file.id} className={`p-4 border rounded-lg group/card ${
                    file.verification_status === 'rejected' 
                      ? 'border-red-300 bg-red-50 shadow-red-100' 
                      : 'bg-gray-50'
                  }`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 pr-1">
                          <div className="text-sm font-semibold leading-snug pointer-events-none" title={getFileDisplayName(file.file_type)}>
                            {getFileDisplayName(file.file_type)}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate pointer-events-none" title={file.file_name}>{file.file_name}</div>
                          <div className="text-[11px] text-gray-400">{getFileSize(file.file_size)}</div>
                          
                          {/* Info uploader */}
                          {file.uploaded_by_name && (
                            <div className="text-xs text-gray-500">
                              {(() => {
                                const officeRaw = (file.uploaded_by_office || '').toString();
                                // 1) remove trailing parenthetical segments; 2) remove any UUID-like token anywhere; 3) collapse spaces
                                const withoutParens = officeRaw.replace(/\s*\([^)]*\)\s*$/, '');
                                const withoutUuid = withoutParens.replace(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, '').trim();
                                const officeText = withoutUuid ? ` ${withoutUuid}` : '';
                                return `Diupload oleh: ${file.uploaded_by_name}${officeText}`;
                              })()}
                            </div>
                          )}
                          
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
                              {file.verification_status === 'approved' ? (
                                <span className="inline-flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Sesuai</span>
                              ) : file.verification_status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Tidak Sesuai</span>
                              ) : (
                                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Belum Diverifikasi</span>
                              )}
                              {file.verified_by && ` - ${getVerifierName(file.verified_by)}`}
                            </Badge>
                            {file.verification_notes && (
                              <p className="text-xs text-gray-600">{file.verification_notes}</p>
                            )}
                          </div>
                        {/* Expand overlay on hover to reveal full title without affecting layout */}
                        {(hoveredFileId===file.id || expandedFileId===file.id) && (
                          <div
                            className={`absolute top-0 ${hoverAnchor==='left' ? 'left-full ml-2 origin-left' : 'right-full mr-2 origin-right'} z-20 w-[28rem] p-4 rounded-lg border bg-white shadow-xl transition-all duration-200 ease-out`}
                            // Keep overlay non-interactive so underlying buttons/switch remain clickable
                            style={{ pointerEvents: 'none' }}
                          >
                            <div className="text-sm font-semibold mb-1">{getFileDisplayName(file.file_type)}</div>
                            <div className="text-[11px] text-gray-500 truncate" title={file.file_name}>{file.file_name}</div>
                          </div>
                        )}
                      </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Switch Toggle Verifikasi - Hanya Superadmin untuk berkas Admin Wilayah */}
                          {/* 
                            Untuk berkas Admin Wilayah:
                            - Hanya Superadmin yang bisa verifikasi
                            - Admin Wilayah TIDAK bisa verifikasi berkas admin wilayah (karena mereka yang upload)
                            
                            Superadmin bisa verifikasi file admin_wilayah di SEMUA pengajuan yang memiliki file admin_wilayah
                            Kecuali status final yang sudah selesai (final_approved, final_rejected)
                            Ini memungkinkan verifikasi bahkan setelah perubahan jabatan atau status apapun
                          */}
                          {isAdmin && file.file_category === 'admin_wilayah' && 
                           pengajuan && 
                           pengajuan.status !== 'final_approved' && 
                           pengajuan.status !== 'final_rejected' ? (
                            <div className="flex items-center gap-3 mr-3">
                              {verifyingFile === file.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-green-600" />
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
                          ) : null}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreviewFile(file)}
                            className="px-3 py-2"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          {!isReadOnlyRole && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadFile(file)}
                            className="px-3 py-2"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          )}
                          {/* Button Ganti File - hanya untuk admin dan admin_wilayah */}
                          {(user?.role === 'admin' || user?.role === 'admin_wilayah') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGantiFile(file)}
                            className="px-3 py-2"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Ganti File
                          </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Ringkasan - tidak ditampilkan untuk operator */}
          {user?.role !== 'operator' && activeTab === 'ringkasan' && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Status Dokumen</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const operatorFiles = pengajuan.files.filter(f => !f.file_category || f.file_category === 'kabupaten');
                  const adminFiles = pengajuan.files.filter(f => f.file_category === 'admin_wilayah');
                  const count = (arr: typeof operatorFiles, s: 'approved' | 'rejected' | 'pending') => arr.filter(f => f.verification_status === s).length;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 border rounded-lg">
                        <div className="font-medium mb-2">Operator</div>
                        <div className="text-sm text-gray-700">Total: {operatorFiles.length}</div>
                        <div className="text-sm text-green-700">Disetujui: {count(operatorFiles, 'approved')}</div>
                        <div className="text-sm text-red-700">Ditolak: {count(operatorFiles, 'rejected')}</div>
                        <div className="text-sm text-gray-700">Belum Diverifikasi: {count(operatorFiles, 'pending')}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="font-medium mb-2">Admin Wilayah</div>
                        <div className="text-sm text-gray-700">Total: {adminFiles.length}</div>
                        <div className="text-sm text-green-700">Disetujui: {count(adminFiles, 'approved')}</div>
                        <div className="text-sm text-red-700">Ditolak: {count(adminFiles, 'rejected')}</div>
                        <div className="text-sm text-gray-700">Belum Diverifikasi: {count(adminFiles, 'pending')}</div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
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

                 {/* Admin Wilayah Review */}
                 {pengajuan.status === 'admin_wilayah_approved' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Disetujui Admin Wilayah</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Admin Wilayah menyetujui pengajuan</p>
                     </div>
                   </div>
                 )}

                 {pengajuan.status === 'admin_wilayah_rejected' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Ditolak Admin Wilayah</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Admin Wilayah menolak pengajuan</p>
                     </div>
                   </div>
                 )}

                 {/* Admin Wilayah Submit ke Superadmin */}
                 {pengajuan.status === 'admin_wilayah_submitted' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Diajukan Admin Wilayah ke Superadmin</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Admin Wilayah mengajukan ke Superadmin untuk review final</p>
                     </div>
                   </div>
                 )}

                 {/* Submit ke Superadmin (dari operator) */}
                 {pengajuan.status === 'submitted' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Diajukan ke Superadmin</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Pengajuan diajukan ke Superadmin untuk review</p>
                     </div>
                   </div>
                 )}

                 {/* Final Approval */}
                 {pengajuan.status === 'final_approved' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Disetujui Final</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Superadmin menyetujui final pengajuan</p>
                     </div>
                   </div>
                 )}

                 {pengajuan.status === 'final_rejected' && (
                   <div className="flex items-start gap-4">
                     <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                     <div className="flex-1 space-y-1">
                       <p className="font-medium">Ditolak Final</p>
                       <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                       <p className="text-xs text-gray-500">Superadmin menolak final pengajuan</p>
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
                {(() => {
                  const shouldShowApprove = canApprove && (
                    (isAdmin && activeTab === 'admin_wilayah' && allFilesApproved) || 
                    (isAdminWilayah && allKabupatenFilesApproved)
                  );
                  
                  return shouldShowApprove;
                })() && (
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                )}
                
                {canReject && (
                  // SUPERADMIN di tab Admin Wilayah: reject jika ada dokumen tidak sesuai
                  // ADMIN WILAYAH: reject hanya jika ada file yang benar-benar rejected (bukan pending)
                  (isAdmin && activeTab === 'admin_wilayah' && !allFilesApproved) || (isAdminWilayah && hasRejectedKabupatenFiles)
                ) && (
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
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

                {/* Tombol untuk status draft - tambahkan di bawah Ajukan Ulang */}
                {pengajuan?.status === 'draft' && canEdit && (
                  <Button
                    onClick={() => window.open(`http://localhost:8080/pengajuan/${pengajuan.id}/upload`, '_blank')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Upload Dokumen
                  </Button>
                )}

                {pengajuan?.status === 'draft' && canDelete && (
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Pengajuan
                  </Button>
                )}
                
                                 {canEdit && pengajuan.status !== 'draft' && (
                   <Button
                     onClick={() => navigate(`/pengajuan/${pengajuan.id}/edit`)}
                     className="w-full bg-green-600 hover:bg-green-700 text-white"
                   >
                     <Edit className="h-4 w-4 mr-2" />
                     Perbaiki Dokumen
                   </Button>
                 )}

                
                {pengajuan.status === 'approved' && isAdmin && (
                  <Button
                    onClick={() => setShowPrintDialog(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak Laporan
                  </Button>
                )}

                {/* Approval Final - Superadmin */}
                {/* 
                  Logika Button Final Approval:
                  - Setujui Final: muncul jika SEMUA berkas admin wilayah sudah "Sesuai" (approved)
                  - Tolak Final: muncul jika ada SATU SAJA berkas admin wilayah "Tidak Sesuai" (rejected)
                  
                  Status pengajuan harus 'admin_wilayah_approved' untuk button ini muncul
                */}
                {isAdmin && pengajuan.status === 'admin_wilayah_approved' && (
                  <>
                    {/* Setujui Final - hanya muncul jika semua berkas admin wilayah sudah "Sesuai" */}
                    {allAdminWilayahFilesApproved && (
                      <Button
                        onClick={() => setShowFinalApproveDialog(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Setujui Final
                      </Button>
                    )}
                    
                    {/* Tolak Final - muncul jika ada minimal satu berkas admin wilayah "Tidak Sesuai" */}
                    {hasRejectedAdminWilayahFiles && (
                      <Button
                        onClick={() => setShowFinalRejectDialog(true)}
                        variant="destructive"
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Tolak Final
                      </Button>
                      )}
                  </>
                )}

                {/* Cetak Laporan Final */}
                {pengajuan.status === 'final_approved' && isAdmin && (
                  <Button
                    onClick={handleFinalPrintReport}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak Laporan Final
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

      {/* Final Approve Dialog */}
      <Dialog open={showFinalApproveDialog} onOpenChange={setShowFinalApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setujui Final Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Catatan (Opsional)</label>
              <Textarea
                value={finalApprovalNote}
                onChange={(e) => setFinalApprovalNote(e.target.value)}
                placeholder="Masukkan catatan persetujuan final..."
                rows={3}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFinalApproveDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleFinalApprove}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Setujui Final'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Reject Dialog */}
      <Dialog open={showFinalRejectDialog} onOpenChange={setShowFinalRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Final Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Alasan Penolakan Final *</label>
              <Textarea
                value={finalRejectionReason}
                onChange={(e) => setFinalRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan final..."
                rows={3}
                required
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowFinalRejectDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleFinalReject}
                disabled={submitting || !finalRejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Tolak Final'
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
         // Reset states when modal closes
         if (!open) {
           setIsVerificationPanelCollapsed(false);
           setIsModalFullscreen(false);
           setPdfZoom(100);
         }
       }}>
         <DialogContent className={`${isModalFullscreen ? 'max-w-none w-[100vw] h-[100vh]' : 'max-w-6xl w-[95vw] h-[90vh]'} p-0 overflow-hidden flex flex-col transition-all duration-300`}>
           <div className="border-b bg-white px-4 py-3 flex-shrink-0">
             <div className="flex items-center justify-between">
               <div className="min-w-0 flex-1">
                 <div className="text-lg font-bold text-gray-900 mb-1">{previewFile ? getFileDisplayName(previewFile.file_type) : 'Dokumen'}</div>
                 <div className="text-base font-semibold truncate text-gray-700" title={previewFile?.file_name}>{previewFile?.file_name}</div>
                 <div className="text-xs text-gray-500 truncate">Preview dokumen PDF • Gunakan ← → untuk navigasi</div>
               </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* PDF Zoom Controls */}
                {previewFile?.blobUrl && (
                  <div className="flex items-center gap-1 border rounded-md">
                    <button
                      type="button"
                      onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      title="Zoom out"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-2 py-1 text-xs font-medium text-gray-600 min-w-[3rem] text-center">
                      {pdfZoom}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))}
                      className="p-1.5 hover:bg-gray-100 transition-colors"
                      title="Zoom in"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfZoom(100)}
                      className="px-2 py-1 text-xs hover:bg-gray-100 transition-colors border-l"
                      title="Reset zoom"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Fullscreen Toggle */}
                <button
                  type="button"
                  onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                  title={isModalFullscreen ? "Keluar dari fullscreen" : "Masuk ke fullscreen"}
                >
                  {isModalFullscreen ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                
                {/* Button verifikasi dipindahkan ke sini */}
                {previewFile && (() => {
                  const isKabupatenFile = !previewFile.file_category || previewFile.file_category === 'kabupaten';
                  const isAdminWilayahFile = previewFile.file_category === 'admin_wilayah';
                  
                  // Admin Wilayah hanya bisa verifikasi berkas kabupaten
                  const canAdminWilayahVerify = isAdminWilayah && isKabupatenFile && pengajuan &&
                    (pengajuan.status === 'submitted' || pengajuan.status === 'approved' || pengajuan.status === 'rejected' || pengajuan.status === 'resubmitted');
                  
                  // Superadmin bisa verifikasi file admin_wilayah di SEMUA pengajuan yang memiliki file admin_wilayah
                  // Kecuali status final yang sudah selesai (final_approved, final_rejected)
                  // Ini memungkinkan verifikasi bahkan setelah perubahan jabatan atau status apapun
                  const isFinalStatus = pengajuan?.status === 'final_approved' || pengajuan?.status === 'final_rejected';
                  const canAdminVerifyAdminWilayahFile = isAdmin && isAdminWilayahFile && pengajuan && !isFinalStatus;
                  
                  // Superadmin juga bisa verifikasi file kabupaten jika diperlukan (untuk kasus khusus)
                  const canAdminVerifyKabupatenFile = isAdmin && isKabupatenFile && pengajuan &&
                    (pengajuan.status === 'admin_wilayah_submitted' || 
                     pengajuan.status === 'rejected' || 
                     pengajuan.status === 'admin_wilayah_approved');
                  
                  return (canAdminVerifyAdminWilayahFile || canAdminVerifyKabupatenFile || canAdminWilayahVerify);
                })() && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateVerificationFromPreview('approved')}
                      disabled={updatingVerification}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        previewFile.verification_status === 'approved'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-green-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ✓ Sesuai
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateVerificationFromPreview('rejected')}
                      disabled={updatingVerification}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        previewFile.verification_status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-red-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ✗ Tidak Sesuai
                    </button>
                  </>
                )}
                
                <button 
                  type="button" 
                  onClick={() => goToAdjacentPreview(-1)} 
                  className="text-sm px-2 py-1 rounded bg-green-50 text-green-700 disabled:opacity-50 hover:bg-green-100 transition-colors" 
                  disabled={!getCurrentPreviewFiles().length || getCurrentPreviewFiles().findIndex(f => f.id === previewFile?.id) <= 0}
                  title="Sebelumnya (←)"
                >
                  <ChevronLeft className="inline h-4 w-4 mr-1" />Sebelumnya
                </button>
                <button 
                  type="button" 
                  onClick={() => goToAdjacentPreview(1)} 
                  className="text-sm px-2 py-1 rounded bg-green-50 text-green-700 disabled:opacity-50 hover:bg-green-100 transition-colors" 
                  disabled={!getCurrentPreviewFiles().length || getCurrentPreviewFiles().findIndex(f => f.id === previewFile?.id) >= getCurrentPreviewFiles().length - 1}
                  title="Selanjutnya (→)"
                >
                  Selanjutnya<ChevronRight className="inline h-4 w-4 ml-1" />
                </button>
              </div>
             </div>
           </div>

           {/* Body */}
           <div className={`${isVerificationPanelCollapsed ? 'flex-1' : 'flex-1'} bg-gray-50 overflow-hidden relative`}>
             {previewError ? (
               <div className="h-full flex flex-col items-center justify-center text-center px-6">
                 <div className="text-xl font-semibold text-gray-900 mb-2">{previewError}</div>
                 <div className="text-sm text-gray-600 mb-4">Silakan coba lagi atau buka dokumen di tab baru.</div>
                 <div className="flex items-center gap-2">
                   {previewFile && (
                     <button type="button" onClick={() => handlePreviewFile(previewFile)} className="text-sm px-3 py-1.5 rounded bg-green-600 text-white">Coba lagi</button>
                   )}
                   {previewFile && (
                     <a href={`/api/pengajuan/files/${previewFile.id}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded border text-gray-700">Buka di tab baru</a>
                   )}
                 </div>
               </div>
             ) : !previewFile?.blobUrl ? (
               <div className="h-full flex flex-col items-center justify-center gap-3">
                 <div className="h-1 w-1/2 bg-gray-200 rounded overflow-hidden">
                   <div className="h-full w-1/3 bg-green-500 animate-pulse" />
                 </div>
                 <div className="text-sm text-gray-600">Memuat pratinjau...</div>
               </div>
             ) : (
               <div className="h-full overflow-auto">
                 <iframe 
                   src={`${previewFile.blobUrl}#zoom=${pdfZoom}`}
                   className="w-full border-0 bg-white" 
                   title="File Preview"
                   style={{ 
                     minHeight: isModalFullscreen ? 'calc(100vh - 200px)' : 'calc(90vh - 200px)',
                     height: 'auto',
                     transform: `scale(${pdfZoom / 100})`,
                     transformOrigin: 'top left',
                     width: `${100 / (pdfZoom / 100)}%`
                   }}
                 />
               </div>
             )}
           </div>

          {/* Verification Section - Collapsible */}
          {previewFile && (
            <div className="bg-white border-t flex-shrink-0">
              {/* Collapse Toggle Header */}
              <div 
                className="px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsVerificationPanelCollapsed(!isVerificationPanelCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status Verifikasi:</span>
                    <span className={`px-3 py-1.5 rounded text-xs font-medium ${
                      previewFile.verification_status === 'approved'
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : previewFile.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}>
                      {updatingVerification ? '⏳ Menyimpan...' :
                       previewFile.verification_status === 'approved' ? '✓ Sesuai' : 
                       previewFile.verification_status === 'rejected' ? '✗ Tidak Sesuai' : 
                       '○ Belum Diverifikasi'}
                    </span>
                    
                    {/* Progress Summary - Always Visible */}
                    {(() => {
                      // Untuk admin_wilayah: hanya cek file kabupaten dari jabatan baru
                      // Untuk admin: cek semua file (kabupaten + admin_wilayah) dari jabatan baru
                      const requiredAll = isAdminWilayah 
                        ? new Set<string>([...requiredKabupaten])
                        : new Set<string>([...requiredKabupaten, ...requiredKanwil]);
                      
                      // Total files harus berdasarkan requiredAll.size (jumlah file wajib untuk jabatan saat ini)
                      const totalFiles = requiredAll.size;
                      
                      // Hitung approved dan rejected hanya dari file yang ada di requiredAll DAN sesuai dengan file_category
                      const allFiles = Array.from(requiredAll).map(fileType => {
                        const isKabupatenFile = requiredKabupaten.includes(fileType);
                        // Cari file yang sesuai dengan kategori dan file_type (hanya dari jabatan baru)
                        return pengajuan?.files.find(f => {
                          if (f.file_type !== fileType) return false;
                          if (isKabupatenFile) {
                            // File kabupaten harus memiliki file_category null, 'kabupaten', atau tidak ada
                            return !f.file_category || f.file_category === 'kabupaten';
                          } else {
                            // File admin_wilayah harus memiliki file_category 'admin_wilayah'
                            return f.file_category === 'admin_wilayah';
                          }
                        });
                      });
                      
                      // Hitung approved dan rejected (file yang tidak ada dianggap pending)
                      const approvedCount = allFiles.filter(f => f && f.verification_status === 'approved').length;
                      const rejectedCount = allFiles.filter(f => f && f.verification_status === 'rejected').length;
                      // Pending = file yang tidak ada (undefined) + file yang statusnya pending atau null
                      const pendingCount = totalFiles - approvedCount - rejectedCount;
                      const verifiedCount = approvedCount + rejectedCount;
                      
                      return (
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            Progress: {verifiedCount}/{totalFiles} file
                          </span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300" 
                              style={{ width: `${totalFiles > 0 ? (verifiedCount / totalFiles) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">
                            {totalFiles > 0 ? Math.round((verifiedCount / totalFiles) * 100) : 0}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {isVerificationPanelCollapsed ? 'Klik untuk memperluas' : 'Klik untuk mengecilkan'}
                    </span>
                    <svg 
                      className={`h-4 w-4 text-gray-400 transition-transform ${isVerificationPanelCollapsed ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Collapsible Content */}
              {!isVerificationPanelCollapsed && (
                <div className="px-4 py-2 border-t bg-gray-50">
                  {/* Content area - currently empty but ready for future additions */}
                </div>
              )}
            </div>
          )}

           {/* Tombol Aksi Final - Setujui/Tolak Pengajuan di Modal - Selalu Muncul */}
           {previewFile && (canApprove || canReject) && (() => {
             // Untuk admin_wilayah: hanya cek file kabupaten dari jabatan baru
             // Untuk admin: cek semua file (kabupaten + admin_wilayah) dari jabatan baru
             const requiredAll = isAdminWilayah 
               ? new Set<string>([...requiredKabupaten])
               : new Set<string>([...requiredKabupaten, ...requiredKanwil]);
             
             // Total files harus berdasarkan requiredAll.size (jumlah file wajib untuk jabatan saat ini)
             const totalFiles = requiredAll.size;
             
             // Hitung approved dan rejected hanya dari file yang ada di requiredAll DAN sesuai dengan file_category
             const allFiles = Array.from(requiredAll).map(fileType => {
               const isKabupatenFile = requiredKabupaten.includes(fileType);
               // Cari file yang sesuai dengan kategori dan file_type (hanya dari jabatan baru)
               return pengajuan?.files.find(f => {
                 if (f.file_type !== fileType) return false;
                 if (isKabupatenFile) {
                   // File kabupaten harus memiliki file_category null, 'kabupaten', atau tidak ada
                   return !f.file_category || f.file_category === 'kabupaten';
                 } else {
                   // File admin_wilayah harus memiliki file_category 'admin_wilayah'
                   return f.file_category === 'admin_wilayah';
                 }
               });
             });
             
             // File yang tidak ada dianggap belum diverifikasi (pending)
             const approvedCount = allFiles.filter(f => f && f.verification_status === 'approved').length;
             const rejectedCount = allFiles.filter(f => f && f.verification_status === 'rejected').length;
             // Pending = file yang tidak ada (undefined) + file yang statusnya pending atau null
             const pendingCount = totalFiles - approvedCount - rejectedCount;
             const verifiedCount = approvedCount + rejectedCount;
             
             // Semua file sudah diverifikasi (tidak ada pending)
             const allVerified = pendingCount === 0 && totalFiles > 0;
             
             return (
               <div className="px-4 py-3 bg-white border-t shadow-md sticky bottom-0 z-10">
                 {/* Tombol Aksi - Selalu tampil ketika semua sudah diverifikasi */}
                 {allVerified && (
                   <div className="flex items-center justify-between gap-3">
                     <div className="text-xs text-gray-600">
                       {(isAdmin && activeTab === 'admin_wilayah' && allFilesApproved) || (isAdminWilayah && allKabupatenFilesApproved) ? (
                         <span className="text-green-600 font-medium">✓ Semua dokumen sesuai, siap disetujui</span>
                       ) : (
                         <span className="text-red-600 font-medium">⚠ Ada dokumen tidak sesuai</span>
                       )}
                     </div>
                     <div className="flex items-center gap-2">
                       {canApprove && (
                         // SUPERADMIN di tab Admin Wilayah: cek apakah semua dokumen admin wilayah sesuai
                         // ADMIN WILAYAH: cek apakah semua dokumen kabupaten sesuai
                         (isAdmin && activeTab === 'admin_wilayah' && allFilesApproved) || 
                         (isAdminWilayah && allKabupatenFilesApproved)
                       ) && (
                         <Button
                           onClick={() => {
                             setShowPreview(false);
                             setShowApproveDialog(true);
                           }}
                           size="sm"
                           className="bg-green-600 hover:bg-green-700 text-white"
                         >
                           <CheckCircle className="h-4 w-4 mr-1" />
                           Setujui Pengajuan
                         </Button>
                       )}
                       
                       {canReject && (
                         // SUPERADMIN di tab Admin Wilayah: reject jika ada dokumen tidak sesuai
                         // ADMIN WILAYAH: reject hanya jika ada file yang benar-benar rejected (bukan pending)
                         (isAdmin && activeTab === 'admin_wilayah' && !allFilesApproved) || 
                         (isAdminWilayah && hasRejectedKabupatenFiles)
                       ) && (
                         <Button
                           onClick={() => {
                             setShowPreview(false);
                             setShowRejectDialog(true);
                           }}
                           size="sm"
                           variant="destructive"
                         >
                           <XCircle className="h-4 w-4 mr-1" />
                           Tolak Pengajuan
                         </Button>
                       )}
                     </div>
                   </div>
                 )}
               </div>
             );
           })()}

           {/* Error actions footer (conditional rendering idea; keep simple placeholder) */}
           {!previewFile?.blobUrl && (
             <div className="px-4 py-3 bg-white border-t flex items-center justify-between">
               <div className="text-xs text-gray-500">Jika pratinjau gagal, coba buka di tab baru.</div>
               <div className="flex items-center gap-2">
                 <button type="button" onClick={() => previewFile && handlePreviewFile(previewFile)} className="text-sm px-3 py-1.5 rounded bg-green-600 text-white">Coba lagi</button>
                 {previewFile && (
                   <a href={`/api/pengajuan/files/${previewFile.id}`} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded border text-gray-700">Buka di tab baru</a>
                 )}
               </div>
             </div>
           )}
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

      {/* Update Status Dialog */}
      <Dialog open={showUpdateStatusDialog} onOpenChange={setShowUpdateStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status Saat Ini</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {pengajuan && getStatusBadge(pengajuan.status, pengajuan)}
              </div>
            </div>
            <div>
              <Label htmlFor="newStatus">Status Baru</Label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resubmitted">Resubmitted</option>
                <option value="admin_wilayah_approved">Admin Wilayah Approved</option>
                <option value="admin_wilayah_rejected">Admin Wilayah Rejected</option>
                <option value="admin_wilayah_submitted">Admin Wilayah Submitted</option>
                <option value="final_approved">Final Approved</option>
                <option value="final_rejected">Final Rejected</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reason">Alasan Perubahan (Opsional)</Label>
              <Textarea
                id="reason"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Masukkan alasan perubahan status..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateStatusDialog(false);
                setNewStatus('');
                setStatusChangeReason('');
              }}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                if (!newStatus || !pengajuan) return;
                
                setUpdatingStatus(true);
                try {
                  const response = await apiPut(
                    `/api/pengajuan/${pengajuan.id}/update-status`,
                    {
                      status: newStatus,
                      reason: statusChangeReason
                    },
                    token
                  );

                  if (response.success) {
                    toast({
                      title: 'Berhasil',
                      description: 'Status pengajuan berhasil diubah',
                    });
                    setShowUpdateStatusDialog(false);
                    setNewStatus('');
                    setStatusChangeReason('');
                    fetchPengajuanData();
                  } else {
                    toast({
                      title: 'Error',
                      description: response.message || 'Gagal mengubah status',
                      variant: 'destructive',
                    });
                  }
                } catch (error) {
                  console.error('Error updating status:', error);
                  toast({
                    title: 'Error',
                    description: 'Terjadi kesalahan saat mengubah status',
                    variant: 'destructive',
                  });
                } finally {
                  setUpdatingStatus(false);
                }
              }}
              disabled={updatingStatus || !newStatus || newStatus === pengajuan?.status}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Ubah Status'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Jabatan Dialog */}
      {pengajuan && (
        <EditJabatanDialog
          open={showEditJabatanDialog}
          onOpenChange={setShowEditJabatanDialog}
          pengajuanId={pengajuan.id}
          currentJabatan={{
            jabatan_id: pengajuan.jabatan_id,
            jenis_jabatan: pengajuan.jenis_jabatan
          }}
          onSuccess={() => {
            fetchPengajuanData();
            toast({
              title: 'Berhasil!',
              description: 'Jabatan pengajuan berhasil diubah.',
            });
          }}
          token={token}
        />
      )}
      
    </div>
  );
};

 export default PengajuanDetail;
