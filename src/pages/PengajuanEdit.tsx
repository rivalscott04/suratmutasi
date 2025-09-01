import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Save,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPut } from '@/lib/api';

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
  pegawai: {
    nama: string;
    jabatan: string;
    nip: string;
  };
  jenis_jabatan: string;
  jabatan_id?: number;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted';
  files: PengajuanFile[];
}

interface FileUpload {
  file_type: string;
  file: File;
  display_name: string;
  is_required: boolean;
}

const PengajuanEdit: React.FC = () => {
  const { pengajuanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();
  
  const [pengajuan, setPengajuan] = useState<PengajuanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [previewFile, setPreviewFile] = useState<PengajuanFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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
        initializeFileUploads(response.data.pengajuan);
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

  const initializeFileUploads = (pengajuanData: PengajuanData) => {
    // Hanya inisialisasi file upload untuk dokumen yang tidak sesuai
    const rejectedFiles = pengajuanData.files.filter(file => file.verification_status === 'rejected');
    const uploads: FileUpload[] = rejectedFiles.map(file => ({
      file_type: file.file_type,
      file: null as any,
      display_name: getFileDisplayName(file.file_type),
      is_required: true
    }));
    setFileUploads(uploads);
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
      'hasil_uji_kompetensi': 'Hasil Uji Kompetensi',
    'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
      'anjab_abk_instansi_asal': 'Anjab/Abk Instansi Asal',
      'anjab_abk_instansi_penerima': 'Anjab/Abk Instansi Penerima',
      'surat_keterangan_tidak_tugas_belajar': 'Surat Keterangan Tidak Sedang Tugas Belajar',
      'sptjm_pimpinan_satker_asal': 'SPTJM Pimpinan Satker dari Asal',
      'sptjm_pimpinan_satker_penerima': 'SPTJM Pimpinan Satker dari Penerima',
      'surat_rekomendasi_instansi_pembina': 'Surat Rekomendasi Instansi Pembina'
    };
    
    return fileTypeMap[fileType] || fileType.replace(/_/g, ' ').toUpperCase();
  };

  const handleFileChange = (fileType: string, file: File) => {
    setFileUploads(prev => 
      prev.map(upload => 
        upload.file_type === fileType 
          ? { ...upload, file } 
          : upload
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Upload files yang baru
      const formData = new FormData();
      fileUploads.forEach(upload => {
        if (upload.file) {
          formData.append('files', upload.file);
          formData.append('file_types', upload.file_type);
        }
      });

      const response = await apiPut(`/api/pengajuan/${pengajuanId}/update-files`, formData, token);
      
      if (response.success) {
        // Redirect ke detail pengajuan
        navigate(`/pengajuan/${pengajuanId}`);
      } else {
        setError(response.message || 'Gagal memperbarui dokumen');
      }
    } catch (error) {
      console.error('Error updating files:', error);
      setError('Terjadi kesalahan saat memperbarui dokumen');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handlePreviewFile = async (file: PengajuanFile) => {
    try {
      const response = await fetch(`/api/pengajuan/files/${file.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
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

  const getFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Memuat data pengajuan...</span>
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

  const rejectedFiles = pengajuan.files.filter(file => file.verification_status === 'rejected');
  const approvedFiles = pengajuan.files.filter(file => file.verification_status === 'approved');

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/pengajuan/${pengajuanId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Detail Pengajuan
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Perbaiki Dokumen Pengajuan</h1>
            <p className="text-gray-600">ID: {pengajuan.id}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dokumen yang Sudah Sesuai (Readonly) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Dokumen yang Sudah Sesuai
              <Badge variant="outline" className="ml-2">
                {approvedFiles.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedFiles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada dokumen yang sudah sesuai</p>
            ) : (
              <div className="space-y-3">
                {approvedFiles.map((file) => (
                  <div key={file.id} className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{getFileDisplayName(file.file_type)}</h4>
                        <p className="text-sm text-green-600">{file.file_name}</p>
                        <p className="text-xs text-green-500">{getFileSize(file.file_size)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewFile(file)}
                          className="text-green-600 border-green-300 hover:bg-green-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadFile(file)}
                          className="text-green-600 border-green-300 hover:bg-green-100"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dokumen yang Perlu Diperbaiki */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Dokumen yang Perlu Diperbaiki
              <Badge variant="outline" className="ml-2">
                {rejectedFiles.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rejectedFiles.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada dokumen yang perlu diperbaiki</p>
            ) : (
              <div className="space-y-4">
                {fileUploads.map((upload) => {
                  const originalFile = rejectedFiles.find(f => f.file_type === upload.file_type);
                  return (
                    <div key={upload.file_type} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-red-800">
                            {upload.display_name}
                          </Label>
                          {originalFile && (
                            <div className="mt-2 p-3 bg-white rounded border">
                              <p className="text-sm text-gray-600">Dokumen saat ini: {originalFile.file_name}</p>
                              <p className="text-xs text-gray-500">{getFileSize(originalFile.file_size)}</p>
                              {originalFile.verification_notes && (
                                <p className="text-xs text-red-600 mt-1">
                                  Catatan: {originalFile.verification_notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor={`file-${upload.file_type}`} className="text-sm font-medium text-red-800">
                            Upload Dokumen Baru
                          </Label>
                          <div className="mt-1 flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`file-${upload.file_type}`)?.click()}
                              className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Pilih File
                            </Button>
                            <span className="text-sm text-gray-600">
                              {upload.file ? upload.file.name : 'Belum ada file dipilih'}
                            </span>
                          </div>
                          <Input
                            id={`file-${upload.file_type}`}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileChange(upload.file_type, file);
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      {rejectedFiles.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setShowSubmitDialog(true)}
            disabled={submitting || fileUploads.every(upload => !upload.file)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan Perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menyimpan perubahan dokumen? Dokumen yang sudah sesuai tidak akan berubah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Modal */}
      <AlertDialog open={showPreview} onOpenChange={(open) => {
        setShowPreview(open);
        if (!open && previewFile?.blobUrl) {
          URL.revokeObjectURL(previewFile.blobUrl);
        }
      }}>
        <AlertDialogContent className="max-w-4xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Preview File: {previewFile?.file_name}</AlertDialogTitle>
          </AlertDialogHeader>
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
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PengajuanEdit;
