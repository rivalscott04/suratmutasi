import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface JobTypeConfig {
  id: number;
  jenis_jabatan: string;
  min_dokumen: number;
  max_dokumen: number;
  required_files: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FileType {
  id: string;
  name: string;
  category: string;
}

const JobTypeConfiguration: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [configs, setConfigs] = useState<JobTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<JobTypeConfig | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    jenis_jabatan: '',
    total_dokumen: 0,
    required_files: [] as string[],
    is_active: true
  });

  // Available file types
  const availableFileTypes: FileType[] = [
    { id: 'surat_pengantar', name: 'Surat Pengantar', category: 'Dokumen Pengantar' },
    { id: 'surat_permohonan_dari_yang_bersangkutan', name: 'Surat Permohonan Dari Yang Bersangkutan', category: 'Dokumen Pengantar' },
    { id: 'surat_keputusan_cpns', name: 'Surat Keputusan CPNS', category: 'Dokumen Kepegawaian' },
    { id: 'surat_keputusan_pns', name: 'Surat Keputusan PNS', category: 'Dokumen Kepegawaian' },
    { id: 'surat_keputusan_kenaikan_pangkat_terakhir', name: 'Surat Keputusan Kenaikan Pangkat Terakhir', category: 'Dokumen Kepegawaian' },
    { id: 'surat_keputusan_jabatan_terakhir', name: 'Surat Keputusan Jabatan Terakhir', category: 'Dokumen Kepegawaian' },
    { id: 'skp_2_tahun_terakhir', name: 'SKP 2 Tahun Terakhir', category: 'Dokumen Kepegawaian' },
    { id: 'surat_keterangan_bebas_temuan_inspektorat', name: 'Surat Keterangan Bebas Temuan Yang Diterbitkan Inspektorat Jenderal Kementerian Agama', category: 'Dokumen Keterangan' },
    { id: 'surat_keterangan_anjab_abk_instansi_asal', name: 'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi asal', category: 'Dokumen Keterangan' },
    { id: 'surat_keterangan_anjab_abk_instansi_penerima', name: 'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi penerima', category: 'Dokumen Keterangan' },
    { id: 'surat_pernyataan_tidak_hukuman_disiplin', name: 'Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat Dalam 1 (satu) Tahun Terakhir Dari PPK', category: 'Dokumen Pernyataan' },
    { id: 'surat_persetujuan_mutasi_asal', name: 'Surat Persetujuan Mutasi dari ASAL dengan menyebutkan jabatan yang akan diduduki', category: 'Dokumen Persetujuan' },
    { id: 'surat_lolos_butuh_ppk', name: 'Surat Lolos Butuh dari Pejabat Pembina Kepegawaian instansi yang dituju', category: 'Dokumen Persetujuan' },
    { id: 'peta_jabatan', name: 'Peta Jabatan', category: 'Dokumen Pendukung' },
    { id: 'hasil_uji_kompetensi', name: 'Hasil Uji Kompetensi', category: 'Dokumen Pendukung' },
    { id: 'hasil_evaluasi_pertimbangan_baperjakat', name: 'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)', category: 'Dokumen Pendukung' },
    { id: 'anjab_abk_instansi_asal', name: 'Anjab/Abk Instansi Asal', category: 'Dokumen Pendukung' },
    { id: 'anjab_abk_instansi_penerima', name: 'Anjab/Abk Instansi Penerima', category: 'Dokumen Pendukung' },
    { id: 'surat_keterangan_tidak_tugas_belajar', name: 'Surat Keterangan Tidak Sedang Tugas Belajar', category: 'Dokumen Keterangan' },
    { id: 'sptjm_pimpinan_satker_asal', name: 'SPTJM Pimpinan Satker dari Asal', category: 'Dokumen Pernyataan' },
    { id: 'sptjm_pimpinan_satker_penerima', name: 'SPTJM Pimpinan Satker dari Penerima', category: 'Dokumen Pernyataan' },
    { id: 'surat_rekomendasi_instansi_pembina', name: 'Surat Rekomendasi Instansi Pembina', category: 'Dokumen Rekomendasi' }
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/job-type-configurations', token);
      if (response.success) {
        setConfigs(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data konfigurasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({
      jenis_jabatan: '',
      total_dokumen: 0, // Start with 0, will auto-update when files are selected
      required_files: [],
      is_active: true
    });
    setEditingConfig(null);
    setShowAddDialog(true);
  };

  const handleEdit = (config: JobTypeConfig) => {
    // Map database file names to frontend file type IDs
    const mapFileNamesToIds = (fileNames: string[]): string[] => {
      const nameToIdMap: Record<string, string> = {
        // New format file names
        'Surat Pengantar': 'surat_pengantar',
        'Surat Permohonan Dari Yang Bersangkutan': 'surat_permohonan_dari_yang_bersangkutan',
        'Surat Keputusan CPNS': 'surat_keputusan_cpns',
        'Surat Keputusan PNS': 'surat_keputusan_pns',
        'Surat Keputusan Kenaikan Pangkat Terakhir': 'surat_keputusan_kenaikan_pangkat_terakhir',
        'Surat Keputusan Jabatan Terakhir': 'surat_keputusan_jabatan_terakhir',
        'SKP 2 Tahun Terakhir': 'skp_2_tahun_terakhir',
        'Surat Keterangan Bebas Temuan Yang Diterbitkan Inspektorat Jenderal Kementerian Agama': 'surat_keterangan_bebas_temuan_inspektorat',
        'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi asal': 'surat_keterangan_anjab_abk_instansi_asal',
        'Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi penerima': 'surat_keterangan_anjab_abk_instansi_penerima',
        'Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat Dalam 1 (satu) Tahun Terakhir Dari PPK': 'surat_pernyataan_tidak_hukuman_disiplin',
        'Surat Persetujuan Mutasi dari ASAL dengan menyebutkan jabatan yang akan diduduki': 'surat_persetujuan_mutasi_asal',
        'Surat Lolos Butuh dari Pejabat Pembina Kepegawaian instansi yang dituju': 'surat_lolos_butuh_ppk',
        'Peta Jabatan': 'peta_jabatan',
        'Hasil Assessment': 'hasil_uji_kompetensi',
        'Hasil Uji Kompetensi': 'hasil_uji_kompetensi',
        'Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)': 'hasil_evaluasi_pertimbangan_baperjakat',
        'Anjab/Abk Instansi Asal': 'anjab_abk_instansi_asal',
        'Anjab/Abk Instansi Penerima': 'anjab_abk_instansi_penerima',
        'Surat Keterangan Tidak Sedang Tugas Belajar': 'surat_keterangan_tidak_tugas_belajar',
        'SPTJM Pimpinan Satker dari Asal': 'sptjm_pimpinan_satker_asal',
        'SPTJM Pimpinan Satker dari Penerima': 'sptjm_pimpinan_satker_penerima',
        'Surat Rekomendasi Instansi Pembina': 'surat_rekomendasi_instansi_pembina',
        // Legacy database values (from migration files)
        'SK Pangkat Terakhir': 'surat_keputusan_kenaikan_pangkat_terakhir',
        'SK Jabatan Terakhir': 'surat_keputusan_jabatan_terakhir',
        'Ijazah Terakhir': 'surat_keputusan_pns',
        'Sertifikat Diklat': 'surat_keputusan_cpns',
        'Surat Pernyataan': 'surat_pernyataan_tidak_hukuman_disiplin',
        'Foto': 'surat_pengantar'
      };
      
      console.log('Original required_files from database:', config.required_files);
      const mappedFiles = fileNames
        .map(name => {
          const mappedId = nameToIdMap[name];
          console.log(`Mapping "${name}" to "${mappedId}"`);
          return mappedId;
        })
        .filter(id => id !== undefined); // Remove any unmapped values
      
      console.log('Mapped required_files:', mappedFiles);
      return mappedFiles;
    };

    const mappedRequiredFiles = mapFileNamesToIds(config.required_files);
    
    setFormData({
      jenis_jabatan: config.jenis_jabatan,
      total_dokumen: config.max_dokumen,
      required_files: mappedRequiredFiles,
      is_active: config.is_active
    });
    setEditingConfig(config);
    setShowAddDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Map frontend file type IDs back to database file names
      const mapIdsToFileNames = (fileTypeIds: string[]): string[] => {
        const idToNameMap: Record<string, string> = {
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
        
        console.log('Frontend file type IDs:', fileTypeIds);
        const mappedNames = fileTypeIds
          .map(id => {
            const mappedName = idToNameMap[id];
            console.log(`Mapping "${id}" to "${mappedName}"`);
            return mappedName;
          })
          .filter(name => name !== undefined); // Remove any unmapped values
        
        console.log('Mapped file names for database:', mappedNames);
        return mappedNames;
      };

      const mappedRequiredFiles = mapIdsToFileNames(formData.required_files);
      
      const payload = {
        ...formData,
        required_files: mappedRequiredFiles,
        is_active: formData.is_active
      };

      if (editingConfig) {
        await apiPut(`/api/job-type-configurations/${editingConfig.id}`, payload, token);
        toast({
          title: "Berhasil",
          description: "Konfigurasi berhasil diperbarui",
        });
      } else {
        await apiPost('/api/job-type-configurations', payload, token);
        toast({
          title: "Berhasil",
          description: "Konfigurasi berhasil ditambahkan",
        });
      }

      setShowAddDialog(false);
      fetchConfigs();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan konfigurasi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (configId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus konfigurasi ini?')) {
      try {
        await apiDelete(`/api/job-type-configurations/${configId}`, token);
        toast({
          title: "Berhasil",
          description: "Konfigurasi berhasil dihapus",
        });
        fetchConfigs();
      } catch (error: any) {
        console.error('Error deleting config:', error);
        toast({
          title: "Error",
          description: error?.message || "Gagal menghapus konfigurasi",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileTypeToggle = (fileTypeId: string) => {
    setFormData(prev => {
      // Jika file sudah dipilih, hapus (selalu bisa)
      if (prev.required_files.includes(fileTypeId)) {
        const newRequiredFiles = prev.required_files.filter(id => id !== fileTypeId);
        return {
          ...prev,
          required_files: newRequiredFiles,
          total_dokumen: newRequiredFiles.length
        };
      }
      
      // Jika file belum dipilih, cek apakah sudah mencapai maksimum (22)
      if (prev.required_files.length >= 22) {
        toast({
          title: "Batas Maksimum",
          description: "Maksimum 22 dokumen yang dapat dipilih untuk mutasi PNS",
          variant: "destructive",
        });
        return prev;
      }
      
      // Tambah file baru
      const newRequiredFiles = [...prev.required_files, fileTypeId];
      return {
        ...prev,
        required_files: newRequiredFiles,
        total_dokumen: newRequiredFiles.length
      };
    });
  };

  const handleSelectAll = () => {
    const allFileTypeIds = availableFileTypes.map(fileType => fileType.id);
    setFormData(prev => ({
      ...prev,
      required_files: allFileTypeIds,
      total_dokumen: allFileTypeIds.length
    }));
    toast({
      title: "Berhasil",
      description: "Semua dokumen telah dipilih",
    });
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      required_files: [],
      total_dokumen: 0
    }));
    toast({
      title: "Berhasil",
      description: "Semua dokumen telah dihapus dari pilihan",
    });
  };

  const groupedFileTypes = availableFileTypes.reduce((acc, fileType) => {
    if (!acc[fileType.category]) {
      acc[fileType.category] = [];
    }
    acc[fileType.category].push(fileType);
    return acc;
  }, {} as Record<string, FileType[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Konfigurasi Jenis Jabatan</h1>
        <Button onClick={handleAddNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4" />
          Tambah Konfigurasi
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <Card key={config.id}>
                         <CardHeader>
               <div className="flex justify-between items-start">
                 <CardTitle className="text-lg">{config.jenis_jabatan}</CardTitle>
                                                      <Badge 
                     variant="secondary" 
                     className={config.is_active 
                       ? "bg-green-100 text-green-800 border-green-200" 
                       : "bg-red-100 text-red-800 border-red-200"
                     }
                   >
                     {config.is_active ? "Aktif" : "Nonaktif"}
                   </Badge>
               </div>
             </CardHeader>
            <CardContent>
              <div className="space-y-3">
                                 <div>
                   <Label className="text-sm font-medium">Total Dokumen</Label>
                   <p className="text-lg font-semibold">{config.max_dokumen}</p>
                 </div>
                 
                 <div>
                   <Label className="text-sm font-medium">Min Dokumen</Label>
                   <p className="text-sm text-gray-600">{config.min_dokumen}</p>
                 </div>

                <div>
                  <Label className="text-sm font-medium">File Types</Label>
                  <p className="text-sm text-gray-600">{config.required_files.length} file types</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(config)}
                    className="flex items-center gap-1 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(config.id)}
                    className="flex items-center gap-1 border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edit Konfigurasi' : 'Tambah Konfigurasi Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
                         {/* Basic Info */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="jenis_jabatan">Jenis Jabatan</Label>
                 <Input
                   id="jenis_jabatan"
                   value={formData.jenis_jabatan}
                   onChange={(e) => setFormData(prev => ({ ...prev, jenis_jabatan: e.target.value }))}
                   placeholder="Contoh: Guru, Penghulu, dll"
                 />
               </div>
               
               <div>
                 <Label htmlFor="total_dokumen">Total Dokumen</Label>
                 <Input
                   id="total_dokumen"
                   type="number"
                   value={formData.total_dokumen}
                   onChange={(e) => setFormData(prev => ({ ...prev, total_dokumen: parseInt(e.target.value) || 0 }))}
                   min="1"
                   max="20"
                   disabled
                   className="bg-gray-50"
                 />
                 <p className="text-xs text-gray-500 mt-1">Otomatis mengikuti jumlah file types yang dipilih</p>
               </div>
             </div>

                           {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  className="data-[state=checked]:bg-green-600"
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  {formData.is_active ? "Aktif" : "Nonaktif"}
                </Label>
              </div>

            

            {/* File Types Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Label className="text-base font-medium">Pilih File Types yang Diperlukan</Label>
                  <p className="text-sm text-gray-600">
                    Centang file types yang diperlukan untuk jenis jabatan ini
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Pilih Semua ({availableFileTypes.length})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="border-gray-600 text-gray-600 hover:bg-gray-50"
                  >
                    Hapus Semua
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(groupedFileTypes).map(([category, fileTypes]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 text-gray-800">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fileTypes.map((fileType) => (
                                                 <div key={fileType.id} className="flex items-center space-x-2">
                           <Checkbox
                             id={fileType.id}
                             checked={formData.required_files.includes(fileType.id)}
                             onCheckedChange={() => handleFileTypeToggle(fileType.id)}
                             className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                           />
                           <Label htmlFor={fileType.id} className="text-sm cursor-pointer">
                             {fileType.name}
                           </Label>
                         </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Ringkasan</h4>
              <p className="text-sm text-gray-600">
                Total file types yang dipilih: <strong>{formData.required_files.length}</strong> / 22
              </p>
              <p className="text-sm text-gray-600">
                Total dokumen: <strong>{formData.total_dokumen}</strong>
              </p>
              {formData.required_files.length >= 22 && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠️ Maksimum 22 dokumen untuk mutasi PNS
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={saving}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.jenis_jabatan || formData.required_files.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobTypeConfiguration;
