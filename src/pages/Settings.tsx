
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
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Save, Upload, Download, Clipboard, Check, Plus, Edit, Crown, FileText, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const CopyableText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
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
    }, 1200);
  };
  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopy(e); }}
        className={`inline-flex items-center gap-1 cursor-pointer group text-left ${className || ''}`}
        title="Salin"
      >
        <span>{text}</span>
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4 text-gray-400 group-hover:text-green-500" />}
        <span aria-live="polite" className="sr-only">{copied ? 'Disalin' : ''}</span>
      </button>

      <Dialog open={copiedOpen} onOpenChange={setCopiedOpen}>
        <DialogContent className="max-w-xs p-4 text-center">
          <DialogHeader>
            <DialogTitle className="text-green-600">Tersalin</DialogTitle>
            <DialogDescription className="text-sm">Teks berhasil disalin.</DialogDescription>
          </DialogHeader>
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
                  <td className="px-4 py-3 text-sm text-gray-900"><CopyableText text={employee.nama} /></td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <CopyableText text={employee.nip} className="font-mono" />
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
              className="border-green-600 text-green-600 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-400"
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
                nip: formData.get('nip') as string,
                unit_kerja: formData.get('unit_kerja') as string,
                jabatan: formData.get('jabatan') as string,
                golongan: formData.get('golongan') as string,
              };

              if (editData) {
                await apiPut(`/api/employees/${editData.id}`, data, token);
                toast({
                  title: 'Berhasil',
                  description: 'Data pegawai berhasil diperbarui',
                });
              } else {
                await apiPost('/api/employees', data, token);
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
                <Button type="button" variant="outline">Batal</Button>
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
    { id: 'surat_keterangan_tidak_tugas_belajar', name: 'Surat Keterangan Tidak Sedang Tugas Belajar', category: 'Dokumen Keterangan' },
    { id: 'sptjm_pimpinan_satker_asal', name: 'SPTJM Pimpinan Satker dari Asal', category: 'Dokumen Pernyataan' },
    { id: 'sptjm_pimpinan_satker_penerima', name: 'SPTJM Pimpinan Satker dari Penerima', category: 'Dokumen Pernyataan' },
    { id: 'surat_rekomendasi_instansi_pembina', name: 'Surat Rekomendasi Instansi Pembina', category: 'Dokumen Rekomendasi' }
  ];

  useEffect(() => {
    if (token) {
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
        .catch(() => setErrorOffice('Gagal mengambil data kantor'))
        .finally(() => setLoadingOffice(false));
    }
  }, [token, user]);

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

  // Fetch job type configurations
  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchJobConfigs();
    }
  }, [token, user?.role]);

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

  if (!user) {
    return <div className="py-8 text-center">Silakan login terlebih dahulu.</div>;
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
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
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
                              className="border-green-600 text-green-600 hover:bg-green-50"
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
                <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <Button onClick={handleImportData} variant="outline" className="flex items-center gap-2">
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
            <AlertDialogAction onClick={() => setShowOfficeModal(false)}>Tutup</AlertDialogAction>
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
            <AlertDialogAction onClick={() => setShowKanwilModal(false)}>Tutup</AlertDialogAction>
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
              <Label>Dokumen yang Diperlukan</Label>
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
                Total dokumen yang dipilih: {jobConfigForm.required_files.length}
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
    </div>
  );
};

export default Settings;
