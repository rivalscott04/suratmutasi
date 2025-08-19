import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut } from '@/lib/api';

interface PengajuanFile {
  id: string;
  file_type: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  verification_notes?: string;
}

interface PengajuanData {
  id: string;
  pegawai: {
    nama: string;
    jabatan: string;
    nip: string;
  };
  jenis_jabatan: string;
  jabatan_id?: number;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted';
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
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    if (pengajuanId) {
      fetchPengajuanData();
    }
  }, [isAuthenticated, navigate, pengajuanId]);

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Clock },
      submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800', icon: FileText },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
      resubmitted: { label: 'Resubmitted', className: 'bg-yellow-100 text-yellow-800', icon: RefreshCw }
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
      'sptjm_pimpinan_satker_penerima': 'SPTJM Pimpinan Satker dari Penerima'
    };
    
    return fileTypeMap[fileType] || fileType.replace(/_/g, ' ').toUpperCase();
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

  const handlePreviewFile = (file: PengajuanFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleDownloadFile = (file: PengajuanFile) => {
    window.open(`/api/pengajuan/files/${file.id}`, '_blank');
  };

  const isAdmin = user?.role === 'admin';
  const canEdit = pengajuan?.status === 'draft';
  const canApprove = isAdmin && pengajuan?.status === 'submitted';
  const canReject = isAdmin && pengajuan?.status === 'submitted';
  const canResubmit = pengajuan?.status === 'rejected';

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nama</label>
                  <p className="text-gray-900">{pengajuan.pegawai.nama}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">NIP</label>
                  <p className="text-gray-900">{pengajuan.pegawai.nip}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Jabatan Saat Ini</label>
                  <p className="text-gray-900">{pengajuan.pegawai.jabatan}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Jenis Jabatan Target</label>
                  <Badge variant="outline">
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pengajuan.files.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada dokumen yang diupload</p>
                  {canEdit && (
                    <Button
                      onClick={() => navigate(`/pengajuan/${pengajuan.id}/upload`)}
                      className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Upload Dokumen
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {pengajuan.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{getFileDisplayName(file.file_type)}</h4>
                        <p className="text-sm text-gray-600">{file.file_name}</p>
                        <p className="text-xs text-gray-500">{getFileSize(file.file_size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewFile(file)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadFile(file)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                  {canEdit && (
                    <Button
                      onClick={() => navigate(`/pengajuan/${pengajuan.id}/upload`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Dokumen
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium">Dibuat</p>
                    <p className="text-sm text-gray-600">{formatDate(pengajuan.created_at)}</p>
                  </div>
                </div>
                
                {pengajuan.status !== 'draft' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Submitted</p>
                      <p className="text-sm text-gray-600">{formatDate(pengajuan.updated_at)}</p>
                    </div>
                  </div>
                )}

                {pengajuan.status === 'approved' && pengajuan.approved_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Approved</p>
                      <p className="text-sm text-gray-600">{formatDate(pengajuan.approved_at)}</p>
                      {pengajuan.approved_by && (
                        <p className="text-xs text-gray-500">by {pengajuan.approved_by}</p>
                      )}
                    </div>
                  </div>
                )}

                {pengajuan.status === 'rejected' && pengajuan.rejected_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Rejected</p>
                      <p className="text-sm text-gray-600">{formatDate(pengajuan.rejected_at)}</p>
                      {pengajuan.rejected_by && (
                        <p className="text-xs text-gray-500">by {pengajuan.rejected_by}</p>
                      )}
                    </div>
                  </div>
                )}

                {pengajuan.status === 'resubmitted' && pengajuan.resubmitted_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Resubmitted</p>
                      <p className="text-sm text-gray-600">{formatDate(pengajuan.resubmitted_at)}</p>
                      {pengajuan.resubmitted_by && (
                        <p className="text-xs text-gray-500">by {pengajuan.resubmitted_by}</p>
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
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan Approval:</p>
                    <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{pengajuan.catatan}</p>
                  </div>
                )}
                {pengajuan.rejection_reason && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Alasan Rejection:</p>
                    <p className="text-sm text-gray-900 bg-red-50 p-3 rounded-lg">{pengajuan.rejection_reason}</p>
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
              {canApprove && (
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              )}
              
              {canReject && (
                <Button
                  onClick={() => setShowRejectDialog(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
              
              {canResubmit && (
                <Button
                  onClick={handleResubmit}
                  disabled={submitting}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resubmit
                    </>
                  )}
                </Button>
              )}
              
                             {canEdit && (
                 <Button
                   onClick={() => navigate(`/pengajuan/${pengajuan.id}/upload`)}
                   className="w-full bg-green-600 hover:bg-green-700 text-white"
                 >
                   <Edit className="h-4 w-4 mr-2" />
                   Edit Dokumen
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
            <DialogTitle>Approve Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Catatan (Opsional)</label>
              <Textarea
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Masukkan catatan approval..."
                rows={3}
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
                    Processing...
                  </>
                ) : (
                  'Approve'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Alasan Rejection *</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan rejection..."
                rows={3}
                required
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
                    Processing...
                  </>
                ) : (
                  'Reject'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
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
                  src={`/api/pengajuan/files/${previewFile.id}`}
                  className="w-full h-96 border-0"
                  title="File Preview"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PengajuanDetail;
