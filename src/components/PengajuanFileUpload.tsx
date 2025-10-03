import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, CheckCircle, X, FileText, Send, Loader2, AlertCircle, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiPut } from '@/lib/api';

interface PengajuanFile {
  id: string;
  file_type: string;
  file_name: string;
  file_size: number;
  upload_status: string;
  blobUrl?: string;
}

interface PengajuanData {
  id: string;
  pegawai: {
    nama: string;
    jabatan: string;
  };
  jenis_jabatan: string;
  jabatan_id?: number;
  total_dokumen: number;
  status: string;
  files: PengajuanFile[];
}

// Normalize any text to a safe DOM id segment
const toSafeId = (raw: string): string => {
  return String(raw)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, '_')
    .replace(/^_+|_+$/g, '');
};

// Helper function to map file types to display names
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

// Helper function to get file category for grouping
const getFileCategory = (fileType: string): string => {
  const categoryMap: Record<string, string> = {
    'surat_pengantar': 'Dokumen Pengantar',
    'surat_permohonan_dari_yang_bersangkutan': 'Dokumen Pengantar',
    'surat_keputusan_cpns': 'Dokumen Kepegawaian',
    'surat_keputusan_pns': 'Dokumen Kepegawaian',
    'surat_keputusan_kenaikan_pangkat_terakhir': 'Dokumen Kepegawaian',
    'surat_keputusan_jabatan_terakhir': 'Dokumen Kepegawaian',
    'skp_2_tahun_terakhir': 'Dokumen Kepegawaian',
    'surat_keterangan_bebas_temuan_inspektorat': 'Dokumen Keterangan',
    'surat_keterangan_anjab_abk_instansi_asal': 'Dokumen Keterangan',
    'surat_keterangan_anjab_abk_instansi_penerima': 'Dokumen Keterangan',
    'surat_pernyataan_tidak_hukuman_disiplin': 'Dokumen Pernyataan',
    'surat_persetujuan_mutasi_asal': 'Dokumen Persetujuan',
    'surat_lolos_butuh_ppk': 'Dokumen Persetujuan',
    'peta_jabatan': 'Dokumen Pendukung',
    'hasil_uji_kompetensi': 'Dokumen Pendukung',
    'hasil_evaluasi_pertimbangan_baperjakat': 'Dokumen Pendukung',
    'anjab_abk_instansi_asal': 'Dokumen Pendukung',
    'anjab_abk_instansi_penerima': 'Dokumen Pendukung',
    'surat_keterangan_tidak_tugas_belajar': 'Dokumen Keterangan',
    'sptjm_pimpinan_satker_asal': 'Dokumen Pernyataan',
    'sptjm_pimpinan_satker_penerima': 'Dokumen Pernyataan',
    'surat_rekomendasi_instansi_pembina': 'Dokumen Rekomendasi'
  };
  
  return categoryMap[fileType] || 'Dokumen Lainnya';
};

// Helper function untuk menampilkan nama jabatan
const getJabatanDisplayName = (jenisJabatan: string): string => {
  const jabatanMap: Record<string, string> = {
    'guru': 'Guru',
    'eselon_iv': 'Eselon IV',
    'fungsional': 'Fungsional',
    'pelaksana': 'Pelaksana'
  };
  
  return jabatanMap[jenisJabatan] || jenisJabatan;
};

const PengajuanFileUpload: React.FC = () => {
  const { pengajuanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [pengajuan, setPengajuan] = useState<PengajuanData | null>(null);
  const [requiredFiles, setRequiredFiles] = useState<string[]>([]);
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewFile, setPreviewFile] = useState<PengajuanFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [replacingFile, setReplacingFile] = useState<string | null>(null);
  
  // Ref untuk file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Ambil data jabatan dari state navigation jika ada
  const jabatanData = location.state?.jabatan;
  const requiredFilesFromState = location.state?.requiredFiles;
  
  // State untuk menyimpan data job type configuration
  const [jobTypeConfig, setJobTypeConfig] = useState<any>(null);

  useEffect(() => {
    if (pengajuanId) {
      fetchPengajuanData();
    }
  }, [pengajuanId]);

  // Reset semua file input setiap kali komponen di-render
  useEffect(() => {
    const resetFileInputs = () => {
      Object.values(fileInputRefs.current).forEach(input => {
        if (input) {
          input.value = '';
        }
      });
    };
    
    // Reset setelah render
    resetFileInputs();
  });

  const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/api/pengajuan/${pengajuanId}`, token);
      if (response.success) {
        setPengajuan(response.data.pengajuan);
        
        // Prioritas 1: Gunakan requiredFiles dari state navigation (jika ada)
        if (requiredFilesFromState && requiredFilesFromState.length > 0) {
          setRequiredFiles(requiredFilesFromState);
          // Set job type config dari state navigation jika ada
          if (jabatanData) {
            setJobTypeConfig(jabatanData);
          }
        }
        // Prioritas 2: Gunakan requiredFiles dari response API
        else if (response.data.requiredFiles && response.data.requiredFiles.length > 0) {
          setRequiredFiles(response.data.requiredFiles);
        }
        // Prioritas 3: Ambil dari job type configuration berdasarkan jabatan_id
        else if (response.data.pengajuan.jabatan_id) {
          try {
            const jobTypeResponse = await apiGet(`/api/job-type-configurations/${response.data.pengajuan.jabatan_id}`, token);
            if (jobTypeResponse.success && jobTypeResponse.data.required_files) {
              // required_files sudah di-parse di backend
              setRequiredFiles(jobTypeResponse.data.required_files);
              setJobTypeConfig(jobTypeResponse.data);
            } else {
              // Jika tidak ada konfigurasi, tampilkan pesan error
              setError('Konfigurasi dokumen untuk jabatan ini belum tersedia. Silakan hubungi admin untuk mengkonfigurasi dokumen yang diperlukan.');
              setRequiredFiles([]);
            }
          } catch (jobTypeError) {
            console.error('Error fetching job type configuration:', jobTypeError);
            setError('Gagal mengambil konfigurasi dokumen. Silakan hubungi admin.');
            setRequiredFiles([]);
          }
        } else {
          // Jika tidak ada jabatan_id, tampilkan pesan error
          setError('Jabatan belum dikonfigurasi. Silakan hubungi admin untuk mengkonfigurasi dokumen yang diperlukan.');
          setRequiredFiles([]);
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


  const handleFileUpload = async (fileType: string, file: File) => {
    // Validasi ukuran file: default 500KB, khusus SKP 2 Tahun Terakhir 1.6MB
    const maxSize = fileType === 'skp_2_tahun_terakhir' ? Math.floor(1.6 * 1024 * 1024) : 500 * 1024;
    if (file.size > maxSize) {
      const humanMax = fileType === 'skp_2_tahun_terakhir' ? '1.6MB' : '500KB';
      setError(`File terlalu besar. Maksimal ${humanMax}. Ukuran file: ${(file.size / 1024).toFixed(1)}KB`);
      return;
    }

    setUploadingStates(prev => ({ ...prev, [fileType]: true }));
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileType]: Math.min(prev[fileType] + 10, 90)
        }));
      }, 200);

      const response = await fetch(`/api/pengajuan/${pengajuanId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh data setelah upload berhasil
          await fetchPengajuanData();
          setError(null);
          // Reset file input setelah upload berhasil menggunakan ref
          const fileInput = fileInputRefs.current[fileType];
          if (fileInput) {
            fileInput.value = '';
          }
        } else {
          setError(result.message || 'Gagal upload file');
        }
      } else {
        setError('Gagal upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Terjadi kesalahan saat upload file');
    } finally {
      setUploadingStates(prev => ({ ...prev, [fileType]: false }));
      setReplacingFile(null);
      // Reset file input di finally untuk memastikan selalu ter-reset menggunakan ref
      const fileInput = fileInputRefs.current[fileType];
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleSubmitPengajuan = async () => {
    try {
      setSubmitting(true);
      const response = await apiPut(`/api/pengajuan/${pengajuanId}/submit`, { catatan: '' }, token);
      if (response.success) {
        setShowSuccessModal(true);
      } else {
        setError(response.message || 'Gagal submit pengajuan');
      }
    } catch (error) {
      console.error('Error submitting pengajuan:', error);
      setError('Terjadi kesalahan saat submit pengajuan');
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
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

  const handleReplaceFile = (fileType: string) => {
    setReplacingFile(fileType);
  };

  const isAllFilesUploaded = () => {
    return requiredFiles.every(fileType => {
      return pengajuan?.files.some(f => f.file_type === fileType);
    });
  };

  const getFileStatus = (fileType: string) => {
    return pengajuan?.files.some(f => f.file_type === fileType) ? 'uploaded' : 'pending';
  };

  const getFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Group files by category
  const groupedFiles = requiredFiles.reduce((acc, fileType) => {
    const category = getFileCategory(fileType);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fileType);
    return acc;
  }, {} as Record<string, string[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2">Memuat data pengajuan...</span>
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
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="ml-2 text-red-600">Pengajuan tidak ditemukan</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Berkas Pengajuan Mutasi PNS</CardTitle>
          <div className="text-sm text-gray-600">
            {pengajuan.pegawai.nama} - {pengajuan.pegawai.jabatan}
          </div>
          <div className="text-sm text-gray-500">
            Jenis Jabatan: {getJabatanDisplayName(pengajuan.jenis_jabatan)}
          </div>
          <div className="text-sm text-gray-500">
            Total Dokumen: {jobTypeConfig ? jobTypeConfig.max_dokumen : requiredFiles.length} surat
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* File Upload Sections by Category */}
          {requiredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Tidak ada dokumen yang diperlukan</p>
              <p className="text-sm text-gray-400">Silakan hubungi admin untuk mengkonfigurasi dokumen yang diperlukan</p>
            </div>
          ) : (
            Object.entries(groupedFiles).map(([category, fileTypes]) => (
            <div key={category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fileTypes.map((fileType) => {
                  const status = getFileStatus(fileType);
                  const isUploading = uploadingStates[fileType];
                  const progress = uploadProgress[fileType];
                  const uploadedFile = pengajuan.files.find(f => f.file_type === fileType);
                  const isReplacing = replacingFile === fileType;

                  return (
                    <div key={fileType} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-tight">{getFileDisplayName(fileType)}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            Upload file PDF (maks. {fileType === 'skp_2_tahun_terakhir' ? '1.6MB' : '500KB'})
                          </p>
                        </div>
                        <Badge 
                          variant={status === 'uploaded' ? 'secondary' : 'secondary'}
                          className={status === 'uploaded' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                        >
                          {status === 'uploaded' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          {status === 'uploaded' ? 'Uploaded' : 'Pending'}
                        </Badge>
                      </div>

                      {status === 'uploaded' && uploadedFile && !isReplacing ? (
                        <div className="space-y-3">
                          <div className="text-sm text-green-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className="truncate">{uploadedFile.file_name}</span>
                              <span className="text-gray-500 text-xs">({getFileSize(uploadedFile.file_size)})</span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewFile(uploadedFile)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFile(uploadedFile)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReplaceFile(fileType)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Ganti File
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={(el) => fileInputRefs.current[fileType] = el}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(fileType, file);
                                // Reset file input setelah file dipilih
                                e.target.value = '';
                              }
                            }}
                            disabled={isUploading}
                            className="hidden"
                            id={`file-${toSafeId(fileType)}`}
                          />
                          <label
                            htmlFor={`file-${toSafeId(fileType)}`}
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? 'Uploading...' : isReplacing ? 'Pilih File Baru' : 'Pilih File'}
                          </label>
                          {isReplacing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setReplacingFile(null)}
                              className="ml-2 text-gray-500"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Batal
                            </Button>
                          )}
                        </div>
                      )}

                      {isUploading && (
                        <div className="mt-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
          )}

          {requiredFiles.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <Button
                onClick={() => setShowSubmitDialog(true)}
                disabled={!isAllFilesUploaded() || submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Pengajuan
              </Button>
              {!isAllFilesUploaded() && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Semua berkas harus diupload sebelum dapat submit
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin submit pengajuan ini? Setelah disubmit, pengajuan tidak dapat diedit lagi dan akan diproses oleh admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitPengajuan}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                  Submitting...
                </>
              ) : (
                'Submit Pengajuan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pengajuan Berhasil!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Pengajuan untuk {pengajuan.pegawai.nama} berhasil disubmit
            </p>
            <p className="text-gray-600 mb-6">
              Pengajuan akan diproses oleh admin. Anda akan mendapat notifikasi ketika status berubah.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Kembali ke Dashboard
              </Button>
              <Button
                onClick={() => navigate('/pengajuan/select')}
                variant="outline"
                className="flex-1"
              >
                Buat Pengajuan Baru
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
            <DialogTitle className="flex items-center justify-between">
              <span>Preview File: {previewFile?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewFile && (
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="bg-green-600 text-white px-4 py-2 flex items-center justify-between">
                  <span className="font-medium">{previewFile.file_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="text-white hover:bg-green-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
    </div>
  );
};

export default PengajuanFileUpload; 