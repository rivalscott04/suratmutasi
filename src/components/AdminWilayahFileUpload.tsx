import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AdminWilayahFileConfig {
  id: number;
  jenis_jabatan_id: number;
  file_type: string;
  display_name: string;
  is_required: boolean;
  description?: string;
  is_active: boolean;
}

interface PengajuanFile {
  id: string;
  pengajuan_id: string;
  file_type: string;
  file_category: 'kabupaten' | 'admin_wilayah';
  file_name: string;
  file_path: string;
  file_size: number;
  upload_status: string;
  verification_notes?: string;
  uploaded_by?: string;
  uploaded_by_role: 'kabupaten' | 'admin_wilayah';
  uploaded_by_name?: string;
  uploaded_by_office?: string;
  created_at: string;
  updated_at: string;
}

interface AdminWilayahFileUploadProps {
  pengajuanId: string;
  jenisJabatanId: number;
  onFilesUploaded?: (files: PengajuanFile[]) => void;
}

const AdminWilayahFileUpload: React.FC<AdminWilayahFileUploadProps> = ({
  pengajuanId,
  jenisJabatanId,
  onFilesUploaded
}) => {
  const [requiredFiles, setRequiredFiles] = useState<AdminWilayahFileConfig[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PengajuanFile[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkedFiles, setCheckedFiles] = useState<{ [key: string]: boolean }>({});

  // Mock data untuk development
  useEffect(() => {
    // Simulasi fetch konfigurasi file
    const mockConfigs: AdminWilayahFileConfig[] = [
      {
        id: 1,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pernyataan_persetujuan',
        display_name: 'Surat Pernyataan Persetujuan dari Kepala Wilayah Kementerian Agama Provinsi',
        is_required: true,
        description: 'Surat pernyataan persetujuan dari kepala wilayah',
        is_active: true
      },
      {
        id: 2,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pernyataan_tidak_tugas_belajar',
        display_name: 'Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar atau Ikatan Dinas',
        is_required: true,
        description: 'Surat pernyataan tidak sedang menjalani tugas belajar',
        is_active: true
      },
      {
        id: 3,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pernyataan_tidak_hukuman_disiplin',
        display_name: 'Surat Pernyataan Tidak Sedang Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat',
        is_required: true,
        description: 'Surat pernyataan tidak sedang dijatuhi hukuman disiplin',
        is_active: true
      },
      {
        id: 4,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pernyataan_tidak_proses_pidana',
        display_name: 'Surat Pernyataan Tidak Sedang Menjalani Proses Pidana atau Pernah Dipidana Penjara',
        is_required: true,
        description: 'Surat pernyataan tidak sedang menjalani proses pidana',
        is_active: true
      },
      {
        id: 5,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pernyataan_tanggung_jawab_mutlak',
        display_name: 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        is_required: true,
        description: 'Surat pernyataan tanggung jawab mutlak',
        is_active: true
      },
      {
        id: 6,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pengantar_permohonan_rekomendasi',
        display_name: 'Surat Pengantar Permohonan Rekomendasi Pindah Tugas',
        is_required: true,
        description: 'Surat pengantar permohonan rekomendasi (pilih varian)',
        is_active: true
      },
      {
        id: 7,
        jenis_jabatan_id: jenisJabatanId,
        file_type: 'surat_pengantar_permohonan_sk',
        display_name: 'Surat Pengantar Permohonan Penerbitan SK Pindah Tugas kepada Kepala Biro SDM Sekjen Kemenag RI',
        is_required: true,
        description: 'Surat pengantar permohonan penerbitan SK (untuk JFT Madya)',
        is_active: true
      }
    ];
    setRequiredFiles(mockConfigs);
  }, [jenisJabatanId]);

  const variantOptions = [
    { value: '6.1', label: '6.1 - Permohonan Persetujuan/Rekomendasi Pengangkatan ke Dalam Jabatan Pengawas (Untuk Eselon)' },
    { value: '6.2', label: '6.2 - Permohonan Pindah Tugas ke Dirjen Bimas Islam (Untuk Penyuluh Agama Islam)' },
    { value: '6.3', label: '6.3 - Permohonan Pindah Tugas ke Dirjen PENDIS (Untuk Guru, Pengawas, Kepala Madrasah)' },
    { value: '6.4', label: '6.4 - Permohonan Pindah Tugas ke Kepala Biro SDM Sekjen Kemenag RI (Untuk Analis SDM dan Asesor)' },
    { value: '6.5', label: '6.5 - Permohonan Pindah Tugas ke Kepala Biro Umum Sekjen Kemenag RI (Arsiparis, BARJAS)' },
    { value: '6.6', label: '6.6 - Permohonan Pindah Tugas ke Kepala Biro Keuangan dan BMN Sekjen Kemenag RI (Untuk Analis Pengelolaan Keuangan APBN dan Pranata Keuangan APBN)' },
    { value: '6.7', label: '6.7 - Permohonan Pindah Tugas ke Kepala Biro Perencanaan dan Penganggaran Sekjen Kemenag RI (Untuk Perencana)' },
    { value: '6.8', label: '6.8 - Permohonan Pindah Tugas ke Kepala Biro Humas (Untuk Pranata Humas)' },
    { value: '6.9', label: '6.9 - Permohonan Pindah Tugas ke Kepala BMP-PSDM Kemenag RI (Untuk Analis Kebijakan)' }
  ];

  const getFileStatus = (fileType: string) => {
    const file = uploadedFiles.find(f => f.file_type === fileType);
    if (!file) return 'not_uploaded';
    return file.upload_status;
  };

  const isAllRequiredFilesUploaded = () => {
    const requiredFileTypes = requiredFiles
      .filter(file => file.is_required)
      .map(file => file.file_type);

    return requiredFileTypes.every(fileType => {
      const file = uploadedFiles.find(f => f.file_type === fileType);
      return file && file.upload_status === 'verified';
    });
  };

  const getProgressPercentage = () => {
    const requiredFileTypes = requiredFiles.filter(file => file.is_required);
    const uploadedCount = requiredFileTypes.filter(fileType => {
      const file = uploadedFiles.find(f => f.file_type === fileType.file_type);
      return file && file.upload_status === 'verified';
    }).length;
    
    return (uploadedCount / requiredFileTypes.length) * 100;
  };

  const handleFileUpload = async (fileType: string, file: File) => {
    setUploading(prev => ({ ...prev, [fileType]: true }));
    
    try {
      // Simulasi upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFile: PengajuanFile = {
        id: Date.now().toString(),
        pengajuan_id: pengajuanId,
        file_type: fileType,
        file_category: 'admin_wilayah',
        file_name: file.name,
        file_path: `/uploads/${file.name}`,
        file_size: file.size,
        upload_status: 'pending',
        uploaded_by: 'current-user-id',
        uploaded_by_role: 'admin_wilayah',
        uploaded_by_name: 'Admin Wilayah',
        uploaded_by_office: 'Kanwil Provinsi',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUploadedFiles(prev => [...prev, newFile]);
      onFilesUploaded?.([...uploadedFiles, newFile]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(prev => ({ ...prev, [fileType]: false }));
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      // Simulasi submit
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSubmitDialog(false);
      // Handle success
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckboxChange = (fileType: string, checked: boolean) => {
    setCheckedFiles(prev => ({
      ...prev,
      [fileType]: checked
    }));
  };

  const getStatusBadge = (fileType: string) => {
    const status = getFileStatus(fileType);
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600 text-white">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Not Uploaded</Badge>;
    }
  };

  const getStatusIcon = (fileType: string) => {
    const status = getFileStatus(fileType);
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Progress Upload File Admin Wilayah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                Kelengkapan File: {Math.round(getProgressPercentage())}%
              </span>
              <Badge className={isAllRequiredFilesUploaded() ? "bg-green-600" : "bg-yellow-600"}>
                {isAllRequiredFilesUploaded() ? "Lengkap" : "Belum Lengkap"}
              </Badge>
            </div>
            <Progress 
              value={getProgressPercentage()} 
              className="h-2 [&>div]:bg-green-600" 
            />
            <p className="text-sm text-green-600">
              {uploadedFiles.filter(f => f.upload_status === 'verified').length} dari {requiredFiles.filter(f => f.is_required).length} file wajib telah diupload
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section A: Berkas Kab/Kota (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Section A: Berkas Kab/Kota
          </CardTitle>
          <p className="text-sm text-gray-600">File yang sudah diupload oleh kabupaten/kota (read-only)</p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 italic">
              Berkas kabupaten/kota akan ditampilkan di sini setelah status pengajuan "Disetujui"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section B: Wajib Kanwil (1-5, 7) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Section B: File Wajib Kanwil
          </CardTitle>
          <p className="text-sm text-gray-600">Checklist file wajib yang harus diupload oleh admin wilayah</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredFiles
              .filter(file => file.file_type !== 'surat_pengantar_permohonan_rekomendasi')
              .map((fileConfig) => (
                <div
                  key={fileConfig.id}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    getFileStatus(fileConfig.file_type) === 'verified'
                      ? 'border-green-200 bg-green-50'
                      : getFileStatus(fileConfig.file_type) === 'rejected'
                      ? 'border-red-200 bg-red-50'
                      : getFileStatus(fileConfig.file_type) === 'pending'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={checkedFiles[fileConfig.file_type] || false}
                      onCheckedChange={(checked) => handleCheckboxChange(fileConfig.file_type, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(fileConfig.file_type)}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{fileConfig.display_name}</h3>
                          {fileConfig.description && (
                            <p className="text-sm text-gray-600 mt-1">{fileConfig.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {fileConfig.is_required && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">Wajib</Badge>
                          )}
                          {getStatusBadge(fileConfig.file_type)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Section C: Khusus (6.x) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Section C: File Khusus (Varian 6.x)
          </CardTitle>
          <p className="text-sm text-gray-600">Pilih varian sesuai jenis jabatan dan checklist file yang diperlukan</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Variant Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pilih Varian:</label>
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Pilih varian 6.x...</option>
                {variantOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Checklist for Selected Variant */}
            {selectedVariant && (
              <div
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  getFileStatus(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`) === 'verified'
                    ? 'border-green-200 bg-green-50'
                    : getFileStatus(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`) === 'rejected'
                    ? 'border-red-200 bg-red-50'
                    : getFileStatus(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`) === 'pending'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={checkedFiles[`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          Surat Pengantar Permohonan Rekomendasi - Varian {selectedVariant}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          File untuk varian {selectedVariant}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200">Wajib</Badge>
                        {getStatusBadge(`surat_pengantar_permohonan_rekomendasi_${selectedVariant}`)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowSubmitDialog(true)}
          disabled={!isAllRequiredFilesUploaded() || submitting}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {submitting ? 'Mengirim...' : 'Kirim untuk Review'}
        </Button>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-800">Konfirmasi Kirim untuk Review</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengirim pengajuan ini untuk review? Pastikan semua file wajib telah diupload dan diverifikasi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Mengirim...' : 'Kirim untuk Review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWilayahFileUpload;
