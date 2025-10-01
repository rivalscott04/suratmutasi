import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Send, RefreshCw, Eye, Download, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import FileUploadProgress from '@/components/FileUploadProgress';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Normalize any text to a safe DOM id segment
const toSafeId = (raw: string): string => {
  return String(raw)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, '_')
    .replace(/^_+|_+$/g, '');
};

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
  file_name: string;
  file_path: string;
  file_size: number;
  verification_status: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

interface AdminWilayahFileUploadProps {
  pengajuanId: string;
  jenisJabatanId: string;
  onFilesUploaded: (files: PengajuanFile[]) => void;
  onProgressChange?: (uploaded: number, total: number) => void;
}

const AdminWilayahFileUpload: React.FC<AdminWilayahFileUploadProps> = ({
  pengajuanId,
  jenisJabatanId,
  onFilesUploaded,
  onProgressChange
}) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [requiredFiles, setRequiredFiles] = useState<AdminWilayahFileConfig[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PengajuanFile[]>([]);
  const [availableJobTypes, setAvailableJobTypes] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch admin wilayah file configuration
  const fetchFileConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // jenisJabatanId bisa berupa nama jabatan atau ID
      let jobTypeId: number;
      
      if (isNaN(Number(jenisJabatanId))) {
        // Jika berupa nama jabatan, cari ID-nya
        try {
          const jobTypeRes = await apiGet('/api/job-type-configurations', token);
          if (jobTypeRes?.success && Array.isArray(jobTypeRes.data)) {
            const jobType = jobTypeRes.data.find((jt: any) => jt.jenis_jabatan === jenisJabatanId);
            if (jobType) {
              jobTypeId = jobType.id;
            } else {
              setError('Jenis jabatan tidak ditemukan');
              return;
            }
          } else {
            setError('Gagal mengambil data jenis jabatan');
            return;
          }
        } catch (error) {
          setError('Gagal mencari jenis jabatan');
          return;
        }
      } else {
        jobTypeId = parseInt(String(jenisJabatanId));
      }
      
      const response = await apiGet(`/api/admin-wilayah-file-config/job-type/${jobTypeId}`, token);
      
      console.log('🔍 API Response:', response);
      console.log('🔍 Job Type ID:', jobTypeId);
      console.log('🔍 Jenis Jabatan ID:', jenisJabatanId);
      
      if (response.success) {
        console.log('✅ Setting required files:', response.data);
        setRequiredFiles(response.data);
        // Notify parent about total required files (uploaded may be known later)
        if (onProgressChange) {
          const uploadedCount = uploadedFiles.filter(f => response.data.some((c: any) => c.file_type === f.file_type)).length;
          onProgressChange(uploadedCount, response.data.length || 0);
        }
      } else {
        setError('Failed to fetch file configurations');
      }
    } catch (error) {
      console.error('Error fetching file configs:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of job types that have admin wilayah configs (for guidance)
  const fetchAvailableJobTypes = async () => {
    try {
      const res = await apiGet('/api/admin-wilayah-file-config', token);
      if (res?.success && Array.isArray(res.data)) {
        const names = Array.from(new Set(res.data.map((c: any) => {
          const jobType = c.jenis_jabatan_id || c.jenis_jabatan?.jenis_jabatan;
          return typeof jobType === 'string' ? jobType : String(jobType);
        }).filter(Boolean))) as string[];
        setAvailableJobTypes(names);
      } else {
        setAvailableJobTypes([]);
      }
    } catch {
      setAvailableJobTypes([]);
    }
  };

  // Fetch existing uploaded files (admin wilayah category) untuk pengajuan ini
  const fetchUploadedFiles = async () => {
    try {
      const res = await apiGet(`/api/admin-wilayah/pengajuan/${pengajuanId}`, token);
      if (res?.success) {
        const awFiles = (res.uploadedAdminWilayahFiles || res.data?.uploadedAdminWilayahFiles || []) as any[];
        const mapped: PengajuanFile[] = awFiles.map((f: any) => ({
          id: f.id,
          pengajuan_id: pengajuanId,
          file_type: f.file_type,
          file_name: f.file_name,
          file_path: f.file_path,
          file_size: f.file_size,
          verification_status: f.verification_status || 'pending',
          created_at: f.created_at,
          updated_at: f.updated_at
        }));
        setUploadedFiles(mapped);
      } else {
      setUploadedFiles([]);
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setUploadedFiles([]);
    }
  };

  useEffect(() => {
    if (jenisJabatanId) {
      fetchFileConfigs();
      fetchUploadedFiles();
    }
  }, [jenisJabatanId, token]);

  // Keep parent informed when lists change (must be before any early return)
  useEffect(() => {
    if (onProgressChange) {
      const totalRequired = requiredFiles.length;
      const uploadedCount = uploadedFiles.filter(f => requiredFiles.some(r => r.file_type === f.file_type)).length;
      onProgressChange(uploadedCount, totalRequired);
    }
  }, [requiredFiles, uploadedFiles]);

  const handleFileUpload = async (fileType: string, file: File) => {
    console.log('🚀 START UPLOAD - fileType:', fileType, 'fileName:', file.name);
    setUploading(prev => ({ ...prev, [fileType]: true }));
    setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
    
    try {
      // Debug logging
      console.log('🔍 Uploading file:', {
        fileType,
        fileName: file.name,
        pengajuanId,
        jenisJabatanId,
        requiredFiles: requiredFiles.map(f => ({ file_type: f.file_type, display_name: f.display_name }))
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pengajuan_id', pengajuanId);
      formData.append('file_type', fileType);
      formData.append('file_category', 'admin_wilayah');
      formData.append('uploaded_by_role', 'admin_wilayah');
      formData.append('uploaded_by_name', user?.full_name || 'Admin Wilayah');
      formData.append('uploaded_by_office', 'Kanwil Provinsi');
      
      // Debug FormData
      console.log('📦 FormData created:', {
        file: file.name,
        pengajuan_id: pengajuanId,
        file_type: fileType,
        file_category: 'admin_wilayah'
      });
      
      // Check if FormData is properly created
      for (let [key, value] of formData.entries()) {
        console.log('📋 FormData entry:', key, value);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[fileType] || 0;
          if (current < 90) {
            return { ...prev, [fileType]: current + Math.random() * 20 };
          }
          return prev;
        });
      }, 200);

      // Upload file to backend
      const response = await apiPost(`/api/admin-wilayah/pengajuan/${pengajuanId}/upload`, formData, token);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [fileType]: 100 }));
      
      if (response.success) {
        const newFile: PengajuanFile = {
          id: response.data.id,
          pengajuan_id: pengajuanId,
          file_type: fileType,
          file_name: file.name,
          file_path: response.data.file_path,
          file_size: file.size,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const nextFiles = [...uploadedFiles, newFile];
        setUploadedFiles(nextFiles);
        onFilesUploaded(nextFiles);
        if (onProgressChange) {
          const totalRequired = requiredFiles.length;
          const uploadedCount = nextFiles.filter(f => requiredFiles.some(r => r.file_type === f.file_type)).length;
          onProgressChange(uploadedCount, totalRequired);
        }
        
        toast({
          title: "Success",
          description: `Upload berhasil: ${file.name}`,
          variant: "default",
          duration: 3000
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal upload file",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Gagal upload file",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setUploading(prev => ({ ...prev, [fileType]: false }));
      setUploadProgress(prev => ({ ...prev, [fileType]: 0 }));
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      // Submit logic here
      toast({
        title: "Success",
        description: "Files submitted for review",
        variant: "default",
      });
      setShowSubmitDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit files",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRelativeTime = (isoString: string) => {
    const now = Date.now();
    const then = new Date(isoString).getTime();
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 5) return 'baru saja';
    if (diff < 60) return `${diff} detik lalu`;
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  };

  const getFileStatus = (fileType: string) => {
    const file = uploadedFiles.find(f => f.file_type === fileType);
    return file ? 'uploaded' : 'pending';
  };

  const getUploadedFile = (fileType: string) => {
    return uploadedFiles.find(f => f.file_type === fileType);
  };

  // Function to get job type specific descriptions
  const getJobTypeSpecificDescription = (jobType: string, fileType: string) => {
    const jobTypeDescriptions: { [key: string]: { [key: string]: string } } = {
      'Guru': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Kepala Madrasah': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Wakil Kepala Madrasah': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Kepala TU': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Kepala Seksi': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Kepala Sub Bagian': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Kepala Urusan': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Staff': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      },
      'Pelaksana': {
        'surat_rekomendasi_kanwil': 'Surat Rekomendasi dari Instansi Pembina - Permohonan Pindah Tugas ke Dirjen Pendis',
        'surat_persetujuan_kepala_wilayah': 'Surat Persetujuan Kepala Wilayah - Kemenag Provinsi',
        'surat_pengantar_permohonan_rekomendasi': 'Surat Pengantar - Permohonan Rekomendasi Pindah Tugas',
        'surat_pernyataan_tidak_tugas_belajar': 'Surat Pernyataan - Tidak Sedang Tugas Belajar atau Ikatan Dinas',
        'surat_pernyataan_tidak_hukuman_disiplin': 'Surat Pernyataan - Tidak Sedang Dijatuhi Hukuman Disiplin',
        'surat_pernyataan_tidak_proses_pidana': 'Surat Pernyataan - Tidak Sedang Proses Pidana atau Penjara',
        'surat_pernyataan_tanggung_jawab_mutlak': 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)',
        'surat_keterangan_bebas_temuan_inspektorat': 'Surat Keterangan Bebas Temuan (SKBT)',
        'hasil_evaluasi_pertimbangan_baperjakat': 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)',
        'surat_rekomendasi_kanwil_khusus': 'Surat Rekomendasi Khusus - Dari Kanwil Provinsi'
      }
    };

    return jobTypeDescriptions[jobType]?.[fileType] || null;
  };

  // Function to get descriptive label for file types based on job type
  const getDescriptiveLabel = (fileConfig: AdminWilayahFileConfig) => {
    const { file_type, display_name } = fileConfig;
    
    // Special handling for Surat Rekomendasi dari Instansi Pembina variants
    if (file_type === 'surat_rekomendasi_kanwil') {
      // Get job type specific description
      const jobTypeSpecificDescription = getJobTypeSpecificDescription(jenisJabatanId, file_type);
      return jobTypeSpecificDescription || 'Surat Rekomendasi dari Instansi Pembina - Varian 6.1-6.9';
    }
    
    // Get job type specific description for other file types
    const jobTypeSpecificDescription = getJobTypeSpecificDescription(jenisJabatanId, file_type);
    if (jobTypeSpecificDescription) {
      return jobTypeSpecificDescription;
    }
    
    // Default fallback
    return display_name;
  };

  // Preview file in new tab using auth token
  const handlePreview = async (file: PengajuanFile) => {
    try {
      const res = await fetch(`/api/pengajuan/files/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Revoke later to avoid memory leak
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal membuka preview file', variant: 'destructive' });
    }
  };

  const handleDownload = async (file: PengajuanFile) => {
    try {
      const res = await fetch(`/api/pengajuan/files/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil file');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name || 'file.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) {
      toast({ title: 'Error', description: 'Gagal mengunduh file', variant: 'destructive' });
    }
  };

  const triggerReplace = (fileType: string) => {
    const input = document.getElementById(`replace-${toSafeId(fileType)}`) as HTMLInputElement | null;
    if (input) input.click();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Files</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchFileConfigs} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Upload File Admin Wilayah</h2>
        <Button onClick={() => { fetchFileConfigs(); fetchUploadedFiles(); }} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Semua Dokumen Wajib Admin Wilayah */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Dokumen Wajib Admin Wilayah</h3>
          <div className="text-sm text-gray-600">
            {(() => {
              const uploadedCount = requiredFiles.filter(fileConfig => 
                uploadedFiles.some(uploadedFile => uploadedFile.file_type === fileConfig.file_type)
              ).length;
              return `${uploadedCount}/${requiredFiles.length} berkas sudah diupload`;
            })()}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requiredFiles.map((fileConfig) => {
            console.log('🔧 Rendering fileConfig:', fileConfig);
            const status = getFileStatus(fileConfig.file_type);
            const uploadedFile = getUploadedFile(fileConfig.file_type);
            
            return (
              <Card key={fileConfig.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                                              <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{getDescriptiveLabel(fileConfig)}</h4>
                          {fileConfig.is_required && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-1.5">Wajib</Badge>
                          )}
                        </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Upload file PDF (maks. {fileConfig.file_type === 'skp_2_tahun_terakhir' ? '1.6MB' : '500KB'})
                      </p>
                      
                      {/* Individual File Upload Progress */}
                      {uploading[fileConfig.file_type] && (
                        <FileUploadProgress
                          isUploading={uploading[fileConfig.file_type]}
                          progress={uploadProgress[fileConfig.file_type] || 0}
                          fileName={fileConfig.display_name}
                          className="mt-2"
                        />
                      )}
                      
                      {status === 'uploaded' && uploadedFile && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium truncate max-w-xs">{uploadedFile.file_name}</span>
                            <span className="text-sm text-gray-500">({formatFileSize(uploadedFile.file_size)})</span>
                            <span className="text-sm text-gray-500">• {formatRelativeTime(uploadedFile.created_at)}</span>
                          </div>
                          {/* Single action group (no duplicates) */}
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => handlePreview(uploadedFile)} className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownload(uploadedFile)} className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => triggerReplace(fileConfig.file_type)} className="flex items-center gap-1">
                              <Edit className="h-3 w-3" />
                              Ganti File
                            </Button>
                            <input
                              id={`replace-${toSafeId(fileConfig.file_type)}`}
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(fileConfig.file_type, file);
                                  // Reset file input setelah file dipilih
                                  e.target.value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {status === 'uploaded' ? (
                        <Badge className="bg-green-600 text-white flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Pending
                          </Badge>
                          <div className="flex gap-1">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                console.log('📁 File input changed:', e.target.files);
                                const file = e.target.files?.[0];
                                if (file) {
                                  console.log('📄 File selected:', file.name, 'fileConfig.file_type:', fileConfig.file_type);
                                  handleFileUpload(fileConfig.file_type, file);
                                  // Reset file input setelah file dipilih
                                  e.target.value = '';
                                } else {
                                  console.log('❌ No file selected');
                                }
                              }}
                              className="hidden"
                              id={`file-${toSafeId(fileConfig.file_type)}`}
                            />
                            <label htmlFor={`file-${toSafeId(fileConfig.file_type)}`}
                              onClick={() => {
                                const input = document.getElementById(`file-${toSafeId(fileConfig.file_type)}`) as HTMLInputElement | null;
                                if (input && !input.disabled) input.click();
                              }}
                            >
                              <Button
                                disabled={uploading[fileConfig.file_type]}
                                size="sm"
                                className="h-8 px-3 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
                              >
                                {uploading[fileConfig.file_type] ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                  <Upload className="h-3 w-3 mr-1" />
                                )}
                                Pilih File
                              </Button>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>



      {/* Submit Button */}
      {(() => {
        const allRequiredUploaded = requiredFiles.every(fileConfig => 
          uploadedFiles.some(uploadedFile => uploadedFile.file_type === fileConfig.file_type)
        );
        
        return (
          <div className="flex justify-end">
            {allRequiredUploaded ? (
              <Button 
                onClick={() => setShowSubmitDialog(true)} 
                className="bg-green-600 hover:bg-green-700"
                disabled={submitting}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                Submit button akan muncul setelah semua berkas wajib diupload
              </div>
            )}
          </div>
        );
      })()}

      {/* Submit Confirmation Dialog - Menggunakan AlertDialog sesuai tema */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Files for Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit all uploaded files for review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminWilayahFileUpload;
