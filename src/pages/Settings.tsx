import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Save, Upload, Download, Clipboard, Check, Plus, Edit, Crown, FileText, Trash2, FolderOpen, AlertTriangle } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const CopyableText: React.FC<{ text: string; label?: string; className?: string }> = ({ text, label = 'Teks', className }) => {
  const [copied, setCopied] = useState(false);
  const [copiedOpen, setCopiedOpen] = useState(false);
  const handleCopy = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setCopiedOpen(true);
    setTimeout(() => {
      setCopied(false);
      setCopiedOpen(false);
    }, 1400);
  };
  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopy(e); }}
        className={`inline-flex items-center gap-1 cursor-pointer group text-left ${className || ''}`}
        title={`Salin ${label}`}
      >
        <span>{text}</span>
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Clipboard className="w-4 h-4 text-gray-400 group-hover:text-green-600" />}
        <span aria-live="polite" className="sr-only">{copied ? `${label} disalin` : ''}</span>
      </button>

      <Dialog open={copiedOpen} onOpenChange={setCopiedOpen}>
        <DialogContent className="max-w-sm min-w-[320px] px-4 py-3 pr-12 rounded-xl border shadow-lg">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-500">
              <Check className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">Berhasil menyalin {label}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EmployeesTable: React.FC<{ token: string | null }> = ({ token }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const { user } = useAuth();
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet('/api/employees', token)
      .then(res => setEmployees(res.pegawai || []))
      .catch(err => setError(err.message || 'Gagal mengambil data pegawai'))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredEmployees = employees.filter(emp =>
    emp.nama?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.nip?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    emp.unit_kerja?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Windowing logic for page numbers
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) {
      end = maxPagesToShow;
      start = 1;
    } else if (currentPage >= totalPages - 2) {
      end = totalPages;
      start = totalPages - maxPagesToShow + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };
  const pageNumbers = getPageNumbers();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1); // Reset ke halaman 1 jika search berubah
  }, [debouncedSearch]);

  if (loading) return <div className="py-8 text-center"><Skeleton className="h-8 w-1/2 mx-auto mb-4" /><Skeleton className="h-10 w-full mb-2" /><Skeleton className="h-10 w-full mb-2" /><Skeleton className="h-10 w-full mb-2" /></div>;
  if (error) return <div className="py-8 text-center text-error">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari pegawai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <Plus className="h-4 w-4" />
            Tambah Pegawai
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Nama</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">NIP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Unit Kerja</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Jabatan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Pangkat/Gol</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900"><CopyableText text={employee.nama} label="Nama" /></td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <CopyableText text={employee.nip} label="NIP" className="font-mono" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.unit_kerja}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.jabatan}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.golongan}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditData(employee);
                        setEditModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * pageSize) + 1} sampai {Math.min(currentPage * pageSize, filteredEmployees.length)} dari {filteredEmployees.length} pegawai
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-green-600 text-green-600 hover:bg-green-100 hover:text-green-800 disabled:border-gray-300 disabled:text-gray-400"
            >
              Sebelumnya
            </Button>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={currentPage === page ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-green-600 text-green-600 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editData ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
            <DialogDescription>
              {editData ? 'Edit informasi pegawai' : 'Masukkan informasi pegawai baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              const formData = new FormData(e.currentTarget);
              const data = {
                nama: formData.get('nama') as string,
                unit_kerja: formData.get('unit_kerja') as string,
                jabatan: formData.get('jabatan') as string,
                golongan: formData.get('golongan') as string,
              };

              const isEdit = !!editData;
              // Saat edit, nip input disabled sehingga tidak ikut di FormData
              const nipForPath = isEdit
                ? (editData?.nip as string | undefined)
                : (formData.get('nip') as string | null) || undefined;

              if (isEdit) {
                // Pastikan ada NIP untuk path
                if (!nipForPath) {
                  throw new Error('NIP tidak ditemukan untuk update');
                }
                // Jangan kirim nip pada update (backend tidak mengubah nip)
                await apiPut(`/api/employees/${nipForPath}`, data, token);
                toast({
                  title: 'Berhasil',
                  description: 'Data pegawai berhasil diperbarui',
                });
              } else {
                // Saat create, pastikan NIP ada
                const nipCreate = (formData.get('nip') as string | null) || undefined;
                await apiPost('/api/employees', { ...data, nip: nipCreate }, token);
                toast({
                  title: 'Berhasil',
                  description: 'Pegawai baru berhasil ditambahkan',
                });
              }

              // Refresh data
              const res = await apiGet('/api/employees', token);
              setEmployees(res.pegawai || []);
              setEditModalOpen(false);
              setEditData(null);
            } catch (err: any) {
              toast({
                title: 'Gagal',
                description: err.message || 'Terjadi kesalahan',
                variant: 'destructive',
              });
            } finally {
              setSaving(false);
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  defaultValue={editData?.nama || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  name="nip"
                  defaultValue={editData?.nip || ''}
                  required
                  pattern="[0-9]{18}"
                  title="NIP harus 18 digit angka"
                  disabled={!!editData}
                  readOnly={!!editData}
                />
              </div>
              <div>
                <Label htmlFor="unit_kerja">Unit Kerja</Label>
                <Input
                  id="unit_kerja"
                  name="unit_kerja"
                  defaultValue={editData?.unit_kerja || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  name="jabatan"
                  defaultValue={editData?.jabatan || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="golongan">Pangkat/Golongan</Label>
                <Input
                  id="golongan"
                  name="golongan"
                  defaultValue={editData?.golongan || ''}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                              <Button 
                type="button" 
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              >
                Batal
              </Button>
              </DialogClose>
              <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white">
                {saving ? 'Menyimpan...' : (editData ? 'Update' : 'Simpan')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Settings = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [officeSettings, setOfficeSettings] = useState({
    namakantor: '',
    kabkota: '',
    alamat: '',
    telepon: '',
    fax: '',
    email: '',
    website: ''
  });
  const [kanwilSettings, setKanwilSettings] = useState({
    tingkat1: 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
    tingkat2: 'KANTOR WILAYAH KEMENTERIAN AGAMA',
    tingkat3: 'PROVINSI NUSA TENGGARA BARAT',
    alamat: '',
    telepon: '',
    fax: '',
    email: '',
    website: ''
  });
  const [loadingOffice, setLoadingOffice] = useState(true);
  const [errorOffice, setErrorOffice] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRefs = {
    namakantor: React.useRef<HTMLInputElement>(null),
    kabkota: React.useRef<HTMLInputElement>(null),
    alamat: React.useRef<HTMLTextAreaElement>(null),
    telepon: React.useRef<HTMLInputElement>(null),
    email: React.useRef<HTMLInputElement>(null),
    website: React.useRef<HTMLInputElement>(null),
    fax: React.useRef<HTMLInputElement>(null),
  };
  const kanwilInputRefs = {
    tingkat1: React.useRef<HTMLInputElement>(null),
    tingkat2: React.useRef<HTMLInputElement>(null),
    tingkat3: React.useRef<HTMLInputElement>(null),
    alamat: React.useRef<HTMLTextAreaElement>(null),
    telepon: React.useRef<HTMLInputElement>(null),
    email: React.useRef<HTMLInputElement>(null),
    website: React.useRef<HTMLInputElement>(null),
    fax: React.useRef<HTMLInputElement>(null),
  };
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [officeModalSuccess, setOfficeModalSuccess] = useState<boolean | null>(null);
  const [officeModalMessage, setOfficeModalMessage] = useState('');
  const [showKanwilModal, setShowKanwilModal] = useState(false);
  const [kanwilModalSuccess, setKanwilModalSuccess] = useState<boolean | null>(null);
  const [kanwilModalMessage, setKanwilModalMessage] = useState('');

  // Job Type Configuration state
  const [jobConfigs, setJobConfigs] = useState<any[]>([]);
  const [jobConfigLoading, setJobConfigLoading] = useState(true);
  const [showJobConfigDialog, setShowJobConfigDialog] = useState(false);
  const [editingJobConfig, setEditingJobConfig] = useState<any | null>(null);
  const [jobConfigSaving, setJobConfigSaving] = useState(false);

  // Job config form state
  const [jobConfigForm, setJobConfigForm] = useState({
    jenis_jabatan: '',
    total_dokumen: 0,
    required_files: [] as string[],
    is_active: true
  });

  // Available file types
  const availableFileTypes = [
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

  // Load admin wilayah configs from database - hanya jika benar-benar diperlukan
  useEffect(() => {
    // Hanya jalankan jika user dan token sudah tersedia
    if (!user || !token) return;
    
    if (user.role === 'admin') {
      // Superadmin can CRUD
      fetchAdminWilayahConfigs();
      fetchAvailableJobTypes();
    } else if (user.role === 'admin_wilayah') {
      // Admin wilayah can only view
      fetchAdminWilayahConfigs();
    }
  }, [user?.role, token, user?.id]); // Tambah user.id untuk memastikan user sudah fully loaded

  // Separate useEffect for job configs to avoid conflicts
  useEffect(() => {
    // Hanya jalankan jika user dan token sudah tersedia
    if (!user || !token) return;
    
    if (user.role === 'admin') {
      fetchJobConfigs();
    }
  }, [token, user?.role, user?.id]);

  // Load office settings - hanya jika user dan token tersedia
  useEffect(() => {
    if (!user || !token) return;
    
    setLoadingOffice(true);
    apiGet('/api/offices', token)
      .then(res => {
        let office = null;
        if (user?.office_id) {
          office = res.offices?.find((o: any) => o.id === user.office_id);
        }
        if (!office && user?.kabkota) {
          office = res.offices?.find((o: any) => o.kabkota === user.kabkota);
        }
        // Hapus fallback ke kantor lain, biarkan kosong jika tidak ada yang cocok
        if (office) {
          setOfficeId(office.id);
          setOfficeSettings({
            namakantor: office.namakantor || office.name || '',
            kabkota: office.kabkota || '',
            alamat: office.alamat || office.address || '',
            telepon: office.telepon || office.phone || '',
            fax: office.fax || '',
            email: office.email || '',
            website: office.website || ''
          });
        } else {
          setOfficeId(null);
          setOfficeSettings({
            namakantor: '',
            kabkota: '',
            alamat: '',
            telepon: '',
            fax: '',
            email: '',
            website: ''
          });
        }
      })
      .catch((err) => {
        console.error('Error loading office settings:', err);
        setErrorOffice('Gagal mengambil data kantor');
      })
      .finally(() => setLoadingOffice(false));
  }, [token, user?.id, user?.office_id, user?.kabkota]);

  // Load Kanwil settings from localStorage
  useEffect(() => {
    const savedKanwilSettings = localStorage.getItem('kanwilSettings');
    if (savedKanwilSettings) {
      try {
        const parsed = JSON.parse(savedKanwilSettings);
        setKanwilSettings(prev => ({
          ...prev,
          tingkat1: parsed.tingkat1 || 'KEMENTERIAN AGAMA REPUBLIK INDONESIA',
          tingkat2: parsed.tingkat2 || 'KANTOR WILAYAH KEMENTERIAN AGAMA',
          tingkat3: parsed.tingkat3 || 'PROVINSI NUSA TENGGARA BARAT',
          alamat: parsed.alamat || '',
          telepon: parsed.telepon || '',
          fax: parsed.fax || '',
          email: parsed.email || '',
          website: parsed.website || ''
        }));
      } catch (err) {
        console.error('Error parsing kanwil settings:', err);
      }
    }
  }, []);

  const fetchJobConfigs = async () => {
    try {
      setJobConfigLoading(true);
      const response = await apiGet('/api/job-type-configurations', token);
      if (response.success) {
        setJobConfigs(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching job configs:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data konfigurasi jabatan",
        variant: "destructive",
      });
    } finally {
      setJobConfigLoading(false);
    }
  };

  const handleSaveOfficeSettings = async () => {
    setFieldError(null);
    // Validasi field wajib
    if (!officeSettings.alamat.trim()) {
      setFieldError('alamat');
      inputRefs.alamat.current?.focus();
      toast({
        title: 'Alamat wajib diisi.',
        description: 'Silakan isi alamat kantor.',
        variant: 'destructive',
      });
      return;
    }
    // Email opsional, tapi jika diisi harus valid
    if (officeSettings.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(officeSettings.email)) {
      setFieldError('email');
      inputRefs.email.current?.focus();
      toast({
        title: 'Format email tidak valid.',
        description: 'Silakan isi email dengan format yang benar.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const response = await apiPut(`/api/offices/${officeId}`, {
        alamat: officeSettings.alamat,
        telepon: officeSettings.telepon,
        fax: officeSettings.fax,
        email: officeSettings.email,
        website: officeSettings.website
      }, token);
      setOfficeModalSuccess(true);
      setOfficeModalMessage('Pengaturan kantor berhasil disimpan!');
      setShowOfficeModal(true);
    } catch (err: any) {
      setOfficeModalSuccess(false);
      setOfficeModalMessage('Gagal menyimpan pengaturan kantor. Silakan coba lagi.');
      setShowOfficeModal(true);
    }
  };

  const handleSaveKanwilSettings = async () => {
    setFieldError(null);
    // Validasi field wajib untuk Kanwil
    if (!kanwilSettings.alamat.trim()) {
      setFieldError('alamat');
      kanwilInputRefs.alamat.current?.focus();
      toast({
        title: 'Alamat Kanwil wajib diisi.',
        description: 'Silakan isi alamat Kantor Wilayah.',
        variant: 'destructive',
      });
      return;
    }
    // Email opsional, tapi jika diisi harus valid
    if (kanwilSettings.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(kanwilSettings.email)) {
      setFieldError('email');
      kanwilInputRefs.email.current?.focus();
      toast({
        title: 'Format email tidak valid.',
        description: 'Silakan isi email Kanwil dengan format yang benar.',
        variant: 'destructive',
      });
      return;
    }
    try {
      // Simpan pengaturan Kanwil ke localStorage (karena ini pengaturan khusus)
      const kanwilData = {
        tingkat1: kanwilSettings.tingkat1,
        tingkat2: kanwilSettings.tingkat2,
        tingkat3: kanwilSettings.tingkat3,
        alamat: kanwilSettings.alamat,
        telepon: kanwilSettings.telepon,
        fax: kanwilSettings.fax,
        email: kanwilSettings.email,
        website: kanwilSettings.website
      };
      localStorage.setItem('kanwilSettings', JSON.stringify(kanwilData));
      setKanwilModalSuccess(true);
      setKanwilModalMessage('Pengaturan Kanwil berhasil disimpan! Data akan digunakan untuk template Kanwil.');
      setShowKanwilModal(true);
    } catch (err: any) {
      setKanwilModalSuccess(false);
      setKanwilModalMessage('Gagal menyimpan pengaturan Kanwil. Silakan coba lagi.');
      setShowKanwilModal(true);
    }
  };

  const handleExportData = () => {
    // Implementasi export data
    toast({
      title: 'Fitur Export',
      description: 'Fitur export data akan segera tersedia.',
    });
  };

  const handleImportData = () => {
    // Implementasi import data
    toast({
      title: 'Fitur Import',
      description: 'Fitur import data akan segera tersedia.',
    });
  };

  // Admin Wilayah Configuration state
  const [adminWilayahConfigs, setAdminWilayahConfigs] = useState<any[]>([]);
  const [adminWilayahConfigLoading, setAdminWilayahConfigLoading] = useState(true);
  const [showAdminWilayahConfigDialog, setShowAdminWilayahConfigDialog] = useState(false);
  const [editingAdminWilayahConfig, setEditingAdminWilayahConfig] = useState<any | null>(null);
  const [adminWilayahConfigSaving, setAdminWilayahConfigSaving] = useState(false);
  
  // State untuk modal konfirmasi delete
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Admin Wilayah config form state
  const [adminWilayahConfigForm, setAdminWilayahConfigForm] = useState({
    jenis_jabatan_id: '',
    name: '',
    description: '',
    selectedFiles: {} as Record<string, boolean>,
    selectedVariant: '6.1',
    is_active: true
  });

  // Available file types for admin wilayah (hardcoded like JobTypeConfiguration)
  const adminWilayahAvailableFileTypes = [
    { id: 'surat_rekomendasi_kanwil', name: 'Surat Rekomendasi Kanwil', category: 'Dokumen Kanwil', is_required: true, description: 'Surat rekomendasi dari Kanwil Provinsi' },
    { id: 'surat_persetujuan_kepala_wilayah', name: 'Surat Persetujuan Kepala Wilayah', category: 'Dokumen Kanwil', is_required: true, description: 'Surat persetujuan dari Kepala Wilayah Kementerian Agama Provinsi' },
    { id: 'surat_pengantar_permohonan_rekomendasi', name: 'Surat Pengantar Permohonan Rekomendasi', category: 'Dokumen Pengantar', is_required: true, description: 'Surat pengantar permohonan rekomendasi pindah tugas' },
    { id: 'surat_pernyataan_tidak_tugas_belajar', name: 'Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar', category: 'Dokumen Pernyataan', is_required: true, description: 'Surat pernyataan tidak sedang menjalani tugas belajar' },
    { id: 'surat_pernyataan_tidak_ikatan_dinas', name: 'Surat Pernyataan Tidak Sedang Menjalani Ikatan Dinas', category: 'Dokumen Pernyataan', is_required: true, description: 'Surat pernyataan tidak sedang menjalani ikatan dinas' },
    { id: 'surat_keterangan_kanwil', name: 'Surat Keterangan dari Kanwil', category: 'Dokumen Keterangan', is_required: true, description: 'Surat keterangan resmi dari Kanwil Provinsi' },
    { id: 'surat_rekomendasi_kanwil_khusus', name: 'Surat Rekomendasi Khusus dari Kanwil', category: 'Dokumen Keterangan', is_required: true, description: 'Surat rekomendasi khusus dari Kanwil Provinsi' }
  ];

  // Available job types for admin wilayah config
  const [availableJobTypes, setAvailableJobTypes] = useState<any[]>([]);

  const variantOptions = [
    { value: '6.1', label: '6.1 - Permohonan Persetujuan/Rekomendasi Pengangkatan ke Dalam Jabatan Pengawas (Untuk Eselon)' },
    { value: '6.2', label: '6.2 - Permohonan Pindah Tugas ke Dirjen Bimas Islam (Untuk Penghulu)' },
    { value: '6.3', label: '6.3 - Permohonan Pindah Tugas ke Dirjen PENDIS (Untuk Guru, Pengawas, Kepala Madrasah)' },
    { value: '6.4', label: '6.4 - Permohonan Pindah Tugas ke Kepala Biro SDM Sekjen Kemenag RI (Untuk Analis SDM dan Asesor)' },
    { value: '6.5', label: '6.5 - Permohonan Pindah Tugas ke Kepala Biro Umum Sekjen Kemenag RI (Arsiparis, BARJAS)' },
    { value: '6.6', label: '6.6 - Permohonan Pindah Tugas ke Kepala Biro Keuangan dan BMN Sekjen Kemenag RI (Untuk Analis Pengelolaan Keuangan APBN dan Pranata Keuangan APBN)' },
    { value: '6.7', label: '6.7 - Permohonan Pindah Tugas ke Kepala Biro Perencanaan dan Penganggaran Sekjen Kemenag RI (Untuk Perencana)' },
    { value: '6.8', label: '6.8 - Permohonan Pindah Tugas ke Kepala Biro Humas (Untuk Pranata Humas)' },
    { value: '6.9', label: '6.9 - Permohonan Pindah Tugas ke Kepala BMP-PSDM Kemenag RI (Untuk Analis Kebijakan)' }
  ];

  // Job Configuration functions
  const handleAddJobConfig = () => {
    setJobConfigForm({
      jenis_jabatan: '',
      total_dokumen: 0,
      required_files: [],
      is_active: true
    });
    setEditingJobConfig(null);
    setShowJobConfigDialog(true);
  };

  const handleEditJobConfig = (config: any) => {
    setJobConfigForm({
      jenis_jabatan: config.jenis_jabatan,
      total_dokumen: config.required_files?.length || 0,
      required_files: config.required_files || [],
      is_active: config.is_active
    });
    setEditingJobConfig(config);
    setShowJobConfigDialog(true);
  };

  const handleSaveJobConfig = async () => {
    if (!jobConfigForm.jenis_jabatan.trim()) {
      toast({
        title: "Error",
        description: "Jenis jabatan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (jobConfigForm.required_files.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu dokumen yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    try {
      setJobConfigSaving(true);
      const payload = {
        jenis_jabatan: jobConfigForm.jenis_jabatan,
        min_dokumen: jobConfigForm.required_files.length,
        max_dokumen: jobConfigForm.required_files.length,
        required_files: jobConfigForm.required_files,
        is_active: jobConfigForm.is_active
      };

      if (editingJobConfig) {
        await apiPut(`/api/job-type-configurations/${editingJobConfig.id}`, payload, token);
        toast({
          title: "Sukses",
          description: "Konfigurasi jabatan berhasil diperbarui",
        });
      } else {
        await apiPost('/api/job-type-configurations', payload, token);
        toast({
          title: "Sukses",
          description: "Konfigurasi jabatan berhasil ditambahkan",
        });
      }

      setShowJobConfigDialog(false);
      fetchJobConfigs();
    } catch (error: any) {
      console.error('Error saving job config:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi jabatan",
        variant: "destructive",
      });
    } finally {
      setJobConfigSaving(false);
    }
  };

  const handleDeleteJobConfig = async (configId: number) => {
    try {
      await apiDelete(`/api/job-type-configurations/${configId}`, token);
      toast({
        title: "Sukses",
        description: "Konfigurasi jabatan berhasil dihapus",
      });
      fetchJobConfigs();
    } catch (error: any) {
      console.error('Error deleting job config:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus konfigurasi jabatan",
        variant: "destructive",
      });
    }
  };

  const handleFileTypeToggle = (fileTypeId: string) => {
    setJobConfigForm(prev => {
      const newRequiredFiles = prev.required_files.includes(fileTypeId)
        ? prev.required_files.filter(id => id !== fileTypeId)
        : [...prev.required_files, fileTypeId];
      
      return {
        ...prev,
        required_files: newRequiredFiles,
        total_dokumen: newRequiredFiles.length
      };
    });
  };

  const handleSelectAll = () => {
    const allFileTypeIds = availableFileTypes.map(fileType => fileType.id);
    setJobConfigForm(prev => ({
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
    setJobConfigForm(prev => ({
      ...prev,
      required_files: [],
      total_dokumen: 0
    }));
    toast({
      title: "Berhasil",
      description: "Semua dokumen telah dihapus dari pilihan",
    });
  };

  // Admin Wilayah Configuration functions
  const handleAddAdminWilayahConfig = () => {
    // Only superadmin can add configs
    if (user?.role !== 'admin') {
      toast({
        title: "Error",
        description: "Hanya superadmin yang dapat menambah konfigurasi",
        variant: "destructive",
      });
      return;
    }

    setAdminWilayahConfigForm({
      jenis_jabatan_id: '',
      name: '',
      description: '',
      selectedFiles: {},
      selectedVariant: '6.1',
      is_active: true
    });
    setEditingAdminWilayahConfig(null);
    setShowAdminWilayahConfigDialog(true);
  };

  const handleEditAdminWilayahConfig = (config: any) => {
    // Only superadmin can edit configs
    if (user?.role !== 'admin') {
      toast({
        title: "Error",
        description: "Hanya superadmin yang dapat mengedit konfigurasi",
        variant: "destructive",
      });
      return;
    }

    const selectedFilesMap: Record<string, boolean> = {};
    // Gunakan identifier file_type (bukan id DB) untuk mencentang checkbox yang tepat
    if (Array.isArray(config.files)) {
      config.files.forEach((file: any) => {
        const key = file.file_type || file.id; // fallback untuk kompatibilitas lama
        if (key) selectedFilesMap[String(key)] = true;
      });
    }
    
    setAdminWilayahConfigForm({
      jenis_jabatan_id: config.jenis_jabatan_id,
      name: config.name,
      description: config.description,
      selectedFiles: selectedFilesMap,
      selectedVariant: '6.1', // Default value
      is_active: config.is_active
    });
    setEditingAdminWilayahConfig(config);
    setShowAdminWilayahConfigDialog(true);
  };

  const handleDeleteAdminWilayahConfig = async (config: any) => {
    // Only superadmin can delete configs
    if (user?.role !== 'admin') {
      toast({
        title: "Error",
        description: "Hanya superadmin yang dapat menghapus konfigurasi",
        variant: "destructive",
      });
      return;
    }

    // Set config yang akan dihapus dan buka modal konfirmasi
    setConfigToDelete(config);
    setShowDeleteConfirmDialog(true);
  };

  const confirmDeleteAdminWilayahConfig = async () => {
    if (!configToDelete) return;

    try {
      setIsDeleting(true);
      console.log('🗑️ Deleting config:', configToDelete);
      console.log('📁 Files to delete:', configToDelete.files);
      
      // Delete all file configs for this job type using Promise.all
      const deletePromises = configToDelete.files.map(async (file: any) => {
        console.log(`🗑️ Deleting file config ID: ${file.id}, Type: ${file.file_type}`);
        return apiDelete(`/api/admin-wilayah-file-config/${file.id}`, token);
      });
      
      await Promise.all(deletePromises);

      toast({
        title: "Berhasil",
        description: "Konfigurasi admin wilayah berhasil dihapus",
      });
      
      // Tutup modal dan refresh data
      setShowDeleteConfirmDialog(false);
      setConfigToDelete(null);
      fetchAdminWilayahConfigs(); // Refresh data from database
    } catch (error: any) {
      console.error('❌ Error deleting admin wilayah config:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus konfigurasi admin wilayah",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteAdminWilayahConfig = () => {
    if (isDeleting) return; // Mencegah cancel saat sedang menghapus
    setShowDeleteConfirmDialog(false);
    setConfigToDelete(null);
  };

  // Handle escape key untuk modal konfirmasi
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirmDialog && !isDeleting) {
        cancelDeleteAdminWilayahConfig();
      }
    };

    if (showDeleteConfirmDialog) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDeleteConfirmDialog, isDeleting]);


  const handleAdminWilayahFileToggle = (fileId: string) => {
    setAdminWilayahConfigForm(prev => ({
      ...prev,
      selectedFiles: {
        ...prev.selectedFiles,
        [fileId]: !prev.selectedFiles[fileId]
      }
    }));
  };

  const handleAdminWilayahVariantChange = (value: string) => {
    setAdminWilayahConfigForm(prev => ({
      ...prev,
      selectedVariant: value
    }));
  };

  const handleSaveAdminWilayahConfig = async () => {
    // Auto-fill name/description to reduce inputs
    const selectedJob = availableJobTypes.find(j => j.id.toString() === adminWilayahConfigForm.jenis_jabatan_id);
    const autoName = selectedJob ? `Konfigurasi ${selectedJob.jenis_jabatan}` : 'Konfigurasi Admin Wilayah';
    const autoDesc = selectedJob ? `Konfigurasi file wajib untuk jabatan ${selectedJob.jenis_jabatan}` : 'Konfigurasi file wajib Admin Wilayah';

    if (!adminWilayahConfigForm.jenis_jabatan_id) {
      toast({
        title: "Error",
        description: "Jenis jabatan wajib dipilih",
        variant: "destructive",
      });
      return;
    }

    // Patch local state defaults (without forcing extra inputs)
    if (!adminWilayahConfigForm.name?.trim()) {
      setAdminWilayahConfigForm(prev => ({ ...prev, name: autoName }));
    }
    if (!adminWilayahConfigForm.description?.trim()) {
      setAdminWilayahConfigForm(prev => ({ ...prev, description: autoDesc }));
    }

    const selectedFileList = adminWilayahAvailableFileTypes.filter(file => adminWilayahConfigForm.selectedFiles[file.id]);
    
    if (selectedFileList.length === 0) {
      toast({
        title: "Error",
        description: "Pilih minimal satu file yang required",
        variant: "destructive",
      });
      return;
    }

    try {
      setAdminWilayahConfigSaving(true);

      if (editingAdminWilayahConfig) {
        // Update existing configs - delete old ones and create new ones
        // First, delete all existing configs for this job type
        const existingConfigs = adminWilayahConfigs.find(c => c.jenis_jabatan_id === parseInt(adminWilayahConfigForm.jenis_jabatan_id));
        if (existingConfigs) {
          console.log('🔄 Updating configs, deleting old ones:', existingConfigs.files);
          
          const deletePromises = existingConfigs.files.map(async (file: any) => {
            console.log(`🗑️ Deleting old file config ID: ${file.id}, Type: ${file.file_type}`);
            return apiDelete(`/api/admin-wilayah-file-config/${file.id}`, token);
          });
          
          await Promise.all(deletePromises);
        }

        // Create new configs
        for (const file of selectedFileList) {
          await apiPost('/api/admin-wilayah-file-config', {
            jenis_jabatan_id: parseInt(adminWilayahConfigForm.jenis_jabatan_id),
            file_type: file.id,
            display_name: file.name,
            is_required: file.is_required,
            description: file.description,
            is_active: adminWilayahConfigForm.is_active
          }, token);
        }

        toast({
          title: "Berhasil",
          description: "Konfigurasi admin wilayah berhasil diperbarui",
        });
      } else {
        // Create new configs
        for (const file of selectedFileList) {
          await apiPost('/api/admin-wilayah-file-config', {
            jenis_jabatan_id: parseInt(adminWilayahConfigForm.jenis_jabatan_id),
            file_type: file.id,
            display_name: file.name,
            is_required: file.is_required,
            description: file.description,
            is_active: adminWilayahConfigForm.is_active
          }, token);
        }

        toast({
          title: "Berhasil",
          description: "Konfigurasi admin wilayah berhasil dibuat",
        });
      }
      
      setShowAdminWilayahConfigDialog(false);
      setEditingAdminWilayahConfig(null);
      fetchAdminWilayahConfigs(); // Refresh data from database
    } catch (error: any) {
      console.error('Error saving admin wilayah config:', error);
      toast({
        title: "Error",
        description: error?.message || "Gagal menyimpan konfigurasi admin wilayah",
        variant: "destructive",
      });
    } finally {
      setAdminWilayahConfigSaving(false);
    }
  };

  const fetchAdminWilayahConfigs = async () => {
    try {
      setAdminWilayahConfigLoading(true);
      const response = await apiGet('/api/admin-wilayah-file-config', token);
      
      console.log('📡 API Response:', response);
      
      if (response?.success && Array.isArray(response.data)) {
        console.log('📊 Raw data from API:', response.data);
        
        // Transform API response to match frontend format
        const transformedConfigs = response.data.map((config: any) => ({
          id: config.id,
          jenis_jabatan_id: config.jenis_jabatan_id,
          name: config.jenis_jabatan?.jenis_jabatan || `Jabatan ${config.jenis_jabatan_id}`,
          description: `Konfigurasi file wajib untuk jabatan ${config.jenis_jabatan?.jenis_jabatan || config.jenis_jabatan_id}`,
          files: [{
            id: config.id, // ✅ Gunakan config.id untuk delete
            file_type: config.file_type, // ✅ Tambahkan field file_type
            name: config.display_name,
            description: config.description,
            is_required: config.is_required,
            is_active: config.is_active
          }],
          is_active: config.is_active,
          created_at: config.created_at,
          updated_at: config.updated_at
        }));

        console.log('🔄 Transformed configs:', transformedConfigs);

        // Group by jenis_jabatan_id
        const groupedConfigs = transformedConfigs.reduce((acc: any[], config: any) => {
          const existingConfig = acc.find(c => c.jenis_jabatan_id === config.jenis_jabatan_id);
          if (existingConfig) {
            existingConfig.files.push(...config.files);
          } else {
            acc.push(config);
          }
          return acc;
        }, []);

        console.log('📦 Grouped configs:', groupedConfigs);
        setAdminWilayahConfigs(groupedConfigs);
      } else {
        // If API fails, set empty array instead of crashing
        console.warn('❌ Admin wilayah config API response invalid:', response);
        setAdminWilayahConfigs([]);
      }
          } catch (error: any) {
        console.error('❌ Error fetching admin wilayah configs:', error);
        // Don't show error toast, just set empty array to prevent crash
        setAdminWilayahConfigs([]);
      } finally {
        setAdminWilayahConfigLoading(false);
      }
  };

  const fetchAvailableJobTypes = async () => {
    try {
      const response = await apiGet('/api/admin-wilayah-file-config/available-job-types', token);
      if (response?.success && Array.isArray(response.data)) {
        setAvailableJobTypes(response.data);
      } else {
        // If API fails, set empty array instead of crashing
        console.warn('Available job types API response invalid:', response);
        setAvailableJobTypes([]);
      }
    } catch (error: any) {
      console.error('Error fetching available job types:', error);
      // Don't show error toast, just set empty array to prevent crash
      setAvailableJobTypes([]);
    }
  };

  if (!user) {
    return <div className="py-8 text-center">Silakan login terlebih dahulu.</div>;
  }

  // Tambah loading state untuk mencegah render yang tidak perlu
  if (!token) {
    return <div className="py-8 text-center">Memuat pengaturan...</div>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan</h1>
        <p className="text-gray-600">
          Kelola pengaturan kantor, pegawai, dan sistem aplikasi
        </p>
      </div>

      <Tabs defaultValue="office" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="office" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Kantor</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="job-config" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Konfigurasi Jabatan</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="admin-wilayah-config" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4 text-gray-600" />
              <span>Konfigurasi Berkas Admin Wilayah</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="employees" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Pegawai</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Sistem</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="office">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Kantor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingOffice ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-10 w-full mb-2" />
                  <Skeleton className="h-24 w-full mb-2" />
                  <Skeleton className="h-10 w-1/2 mb-2" />
                  <Skeleton className="h-10 w-1/2 mb-2" />
                  <Skeleton className="h-10 w-1/2 mb-2" />
                </div>
              ) : errorOffice ? (
                <div className="text-error">{errorOffice}</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="namakantor">Nama Kantor</Label>
                      <Input
                        id="namakantor"
                        ref={inputRefs.namakantor}
                        value={officeSettings.namakantor}
                        readOnly
                        disabled
                        className={fieldError === 'namakantor' ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kabkota">Kabupaten/Kota</Label>
                      <Input
                        id="kabkota"
                        ref={inputRefs.kabkota}
                        value={officeSettings.kabkota}
                        readOnly
                        disabled
                        className={fieldError === 'kabkota' ? 'border-red-500' : ''}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      ref={inputRefs.alamat}
                      value={officeSettings.alamat}
                      onChange={(e) => setOfficeSettings({
                        ...officeSettings,
                        alamat: e.target.value
                      })}
                      rows={3}
                      className={fieldError === 'alamat' ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input
                        id="telepon"
                        ref={inputRefs.telepon}
                        value={officeSettings.telepon}
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          telepon: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fax">Fax</Label>
                      <Input
                        id="fax"
                        value={officeSettings.fax}
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          fax: e.target.value
                        })}
                        ref={inputRefs.fax}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        ref={inputRefs.email}
                        type="email"
                        value={officeSettings.email}
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          email: e.target.value
                        })}
                        placeholder="Contoh: kantor@kemenag.go.id"
                        className={fieldError === 'email' ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        ref={inputRefs.website}
                        value={officeSettings.website}
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          website: e.target.value
                        })}
                        placeholder="Contoh: kemenag.go.id"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveOfficeSettings} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan Kantor
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="job-config">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Konfigurasi Jabatan</CardTitle>
                  <Button onClick={handleAddJobConfig} className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Konfigurasi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {jobConfigLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                  </div>
                ) : jobConfigs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada konfigurasi jabatan</h3>
                    <p className="text-gray-500 mb-4">Mulai dengan menambahkan konfigurasi jabatan pertama Anda.</p>
                    <Button onClick={handleAddJobConfig} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Konfigurasi Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobConfigs.map((config) => (
                      <div key={config.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{config.jenis_jabatan}</h3>
                            <p className="text-sm text-gray-500">
                              {config.required_files?.length || 0} dokumen diperlukan
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={config.is_active 
                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100" 
                                : "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
                              }
                            >
                              {config.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJobConfig(config)}
                              className="border-green-600 text-green-600 hover:bg-green-100 hover:text-green-800"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJobConfig(config.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {config.required_files && config.required_files.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {config.required_files.map((fileId: string) => {
                              const fileType = availableFileTypes.find(ft => ft.id === fileId);
                              return fileType ? (
                                <Badge key={fileId} variant="outline" className="text-xs">
                                  {fileType.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="admin-wilayah-config">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Konfigurasi Berkas Admin Wilayah</CardTitle>
                  {user?.role === 'admin' && (
                    <Button onClick={handleAddAdminWilayahConfig} className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Konfigurasi
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {adminWilayahConfigLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-32 w-full mb-2" />
                    <Skeleton className="h-32 w-full mb-2" />
                  </div>
                ) : adminWilayahConfigs.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada konfigurasi</h3>
                    <p className="text-gray-600 mb-4">
                      {user?.role === 'admin' 
                        ? 'Buat konfigurasi pertama untuk admin wilayah'
                        : 'Belum ada konfigurasi yang dibuat oleh superadmin'
                      }
                    </p>
                    {user?.role === 'admin' && (
                      <Button onClick={handleAddAdminWilayahConfig} className="bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Konfigurasi
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminWilayahConfigs.map((config) => (
                      <Card key={config.id} className="border-green-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-green-800">{config.name}</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {config.files.length} berkas diperlukan
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={config.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                {config.is_active ? "Aktif" : "Nonaktif"}
                              </Badge>
                              {user?.role === 'admin' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAdminWilayahConfig(config)}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAdminWilayahConfig(config)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {config.files.map((file: any) => (
                              <Badge key={file.id} variant="outline" className="text-xs">
                                {file.name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Pegawai</CardTitle>
            </CardHeader>
            <CardContent>
              <EmployeesTable token={token} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData} 
                  variant="outline" 
                  className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-100 hover:text-green-800"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button 
                  onClick={handleImportData} 
                  variant="outline" 
                  className="flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-100 hover:text-green-800"
                >
                  <Upload className="h-4 w-4" />
                  Import Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Office Settings Modal */}
      <AlertDialog open={showOfficeModal} onOpenChange={setShowOfficeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{officeModalSuccess ? 'Berhasil' : 'Gagal'}</AlertDialogTitle>
            <AlertDialogDescription>{officeModalMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowOfficeModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kanwil Settings Modal */}
      <AlertDialog open={showKanwilModal} onOpenChange={setShowKanwilModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{kanwilModalSuccess ? 'Berhasil' : 'Gagal'}</AlertDialogTitle>
            <AlertDialogDescription>{kanwilModalMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowKanwilModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Configuration Dialog */}
      <Dialog open={showJobConfigDialog} onOpenChange={setShowJobConfigDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingJobConfig ? 'Edit Konfigurasi Jabatan' : 'Tambah Konfigurasi Jabatan Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingJobConfig ? 'Edit konfigurasi jabatan yang sudah ada' : 'Buat konfigurasi jabatan baru dengan dokumen yang diperlukan'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="jenis_jabatan">Jenis Jabatan</Label>
                <Input
                  id="jenis_jabatan"
                  value={jobConfigForm.jenis_jabatan}
                  onChange={(e) => setJobConfigForm({
                    ...jobConfigForm,
                    jenis_jabatan: e.target.value
                  })}
                  placeholder="Contoh: Kepala Seksi, Kepala Subbagian, dll"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={jobConfigForm.is_active}
                  onCheckedChange={(checked) => setJobConfigForm({
                    ...jobConfigForm,
                    is_active: checked
                  })}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>
            </div>

            {/* File Types Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>Dokumen yang Diperlukan</Label>
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
              <div className="mt-2 space-y-4">
                {Object.entries(
                  availableFileTypes.reduce((acc, fileType) => {
                    if (!acc[fileType.category]) {
                      acc[fileType.category] = [];
                    }
                    acc[fileType.category].push(fileType);
                    return acc;
                  }, {} as Record<string, typeof availableFileTypes>)
                ).map(([category, fileTypes]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fileTypes.map((fileType) => (
                        <div key={fileType.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={fileType.id}
                            checked={jobConfigForm.required_files.includes(fileType.id)}
                            onCheckedChange={() => handleFileTypeToggle(fileType.id)}
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
              <div className="mt-3 text-sm text-gray-500">
                Total dokumen yang dipilih: {jobConfigForm.required_files.length} / {availableFileTypes.length}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJobConfigDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveJobConfig}
              disabled={jobConfigSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {jobConfigSaving ? 'Menyimpan...' : (editingJobConfig ? 'Update' : 'Simpan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Wilayah Configuration Dialog */}
      <Dialog open={showAdminWilayahConfigDialog} onOpenChange={setShowAdminWilayahConfigDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAdminWilayahConfig ? 'Edit Konfigurasi Berkas Admin Wilayah' : 'Tambah Konfigurasi Berkas Admin Wilayah Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingAdminWilayahConfig 
                ? 'Edit konfigurasi berkas wajib untuk admin wilayah'
                : 'Buat konfigurasi berkas wajib baru untuk admin wilayah'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Active Status - dipindah ke atas */}
            <div className="flex items-center space-x-2">
              <Switch
                id="admin-wilayah-is-active"
                checked={adminWilayahConfigForm.is_active}
                onCheckedChange={(checked) => setAdminWilayahConfigForm({
                  ...adminWilayahConfigForm,
                  is_active: checked
                })}
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-200"
              />
              <Label htmlFor="admin-wilayah-is-active">Aktif</Label>
            </div>

            {/* Nama Konfigurasi */}
            <div className="space-y-2">
              <Label htmlFor="admin-wilayah-config-name">Nama Konfigurasi *</Label>
              <Input
                id="admin-wilayah-config-name"
                value={adminWilayahConfigForm.name}
                onChange={(e) => setAdminWilayahConfigForm({
                  ...adminWilayahConfigForm,
                  name: e.target.value
                })}
                placeholder="Contoh: Penghulu, Kepala Kantor, Kepala Seksi"
              />
            </div>

            {/* File Selection dengan 2 kolom */}
            <div>
              <Label>Pilih Berkas Wajib Admin Wilayah</Label>
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminWilayahAvailableFileTypes.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3 border rounded-lg transition-all duration-200 ${
                        adminWilayahConfigForm.selectedFiles[file.id]
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={adminWilayahConfigForm.selectedFiles[file.id] || false}
                          onCheckedChange={() => handleAdminWilayahFileToggle(file.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{file.name}</h4>
                            {file.is_required && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Wajib</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{file.description}</p>
                          
                          {/* Varian selector untuk file 6 */}
                          {file.id === 'surat_rekomendasi_kanwil' && adminWilayahConfigForm.selectedFiles[file.id] && (
                            <div className="mt-3">
                              <Label className="text-xs font-medium text-gray-700 mb-2 block">
                                Pilih Varian File 6:
                              </Label>
                              <Select 
                                value={adminWilayahConfigForm.selectedVariant} 
                                onValueChange={handleAdminWilayahVariantChange}
                              >
                                <SelectTrigger className="w-full focus:ring-green-500 focus:border-green-500">
                                  <SelectValue placeholder="Pilih varian 6.x..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {variantOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Ringkasan Konfigurasi</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Total berkas yang dipilih: {Object.values(adminWilayahConfigForm.selectedFiles).filter(Boolean).length}</p>
                <p>Berkas wajib: {adminWilayahAvailableFileTypes.filter(f => f.is_required && adminWilayahConfigForm.selectedFiles[f.id]).length}</p>
                {adminWilayahConfigForm.selectedFiles['surat_rekomendasi_kanwil'] && (
                  <p>Varian berkas 6: {adminWilayahConfigForm.selectedVariant}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="jenis-jabatan">Jenis Jabatan</Label>
                <Select 
                  value={adminWilayahConfigForm.jenis_jabatan_id} 
                  onValueChange={(value) => setAdminWilayahConfigForm(prev => ({ ...prev, jenis_jabatan_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobTypes.map((jobType) => (
                      <SelectItem key={jobType.id} value={jobType.id.toString()}>
                        {jobType.jenis_jabatan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nama Konfigurasi dan Deskripsi disembunyikan untuk menyederhanakan input */}
              {/*
              <div>
                <Label htmlFor="config-name">Nama Konfigurasi</Label>
                <Input
                  id="config-name"
                  value={adminWilayahConfigForm.name}
                  onChange={(e) => setAdminWilayahConfigForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Konfigurasi Guru"
                />
              </div>

              <div>
                <Label htmlFor="config-description">Deskripsi</Label>
                <Textarea
                  id="config-description"
                  value={adminWilayahConfigForm.description}
                  onChange={(e) => setAdminWilayahConfigForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi konfigurasi file wajib"
                  rows={3}
                />
              </div>
              */}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAdminWilayahConfigDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveAdminWilayahConfig}
              disabled={adminWilayahConfigSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {adminWilayahConfigSaving ? 'Menyimpan...' : (editingAdminWilayahConfig ? 'Update' : 'Simpan')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Delete */}
      <Dialog 
        open={showDeleteConfirmDialog} 
        onOpenChange={(open) => {
          // Mencegah modal tertutup saat sedang menghapus
          if (!open && isDeleting) return;
          setShowDeleteConfirmDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus konfigurasi berkas admin wilayah ini?
            </DialogDescription>
          </DialogHeader>
          
          {configToDelete && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">{configToDelete.name}</h4>
                <p className="text-sm text-red-700 mb-2">{configToDelete.description}</p>
                <div className="flex flex-wrap gap-2">
                  {configToDelete.files.map((file: any) => (
                    <Badge key={file.id} variant="outline" className="text-xs border-red-200 text-red-700">
                      {file.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-red-600 mt-2">
                  Total {configToDelete.files.length} berkas akan dihapus
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Peringatan!</p>
                    <p>Tindakan ini tidak dapat dibatalkan. Semua konfigurasi berkas untuk jenis jabatan ini akan dihapus secara permanen.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteAdminWilayahConfig}
              disabled={isDeleting}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
            >
              Batal
            </Button>
            <Button
              onClick={confirmDeleteAdminWilayahConfig}
              disabled={isDeleting}
              variant="destructive"
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Permanen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
