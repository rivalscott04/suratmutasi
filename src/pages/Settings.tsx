
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Save, Upload, Download, Clipboard, Check, Plus, Edit, Crown } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const CopyableText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <span className={`inline-flex items-center gap-1 cursor-pointer group ${className || ''}`} onClick={handleCopy} title="Salin">
      <span>{text}</span>
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />}
    </span>
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
            className="flex items-center gap-2"
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
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <CopyableText text={employee.nip} className="font-mono" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.unit_kerja}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.jabatan}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{employee.pangkat_gol}</td>
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
            >
              Sebelumnya
            </Button>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
                pangkat_gol: formData.get('pangkat_gol') as string,
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
                <Label htmlFor="pangkat_gol">Pangkat/Golongan</Label>
                <Input
                  id="pangkat_gol"
                  name="pangkat_gol"
                  defaultValue={editData?.pangkat_gol || ''}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Batal</Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
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
            <TabsTrigger value="kanwil" className="flex items-center space-x-2">
              <Crown className="h-4 w-4" />
              <span>Kanwil</span>
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

                  <Button onClick={handleSaveOfficeSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan Kantor
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="kanwil">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Kantor Wilayah (Kanwil)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <Crown className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Pengaturan Khusus Kanwil</h4>
                      <p className="text-sm text-blue-700">
                        Pengaturan ini khusus untuk template surat Kanwil. Data ini akan digunakan untuk header 3 tingkat surat Kanwil dan tidak mempengaruhi pengaturan kantor kabupaten/kota.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="kanwil-tingkat1">Tingkat 1 (Kementerian)</Label>
                    <Input
                      id="kanwil-tingkat1"
                      ref={kanwilInputRefs.tingkat1}
                      value={kanwilSettings.tingkat1}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        tingkat1: e.target.value
                      })}
                      placeholder="KEMENTERIAN AGAMA REPUBLIK INDONESIA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kanwil-tingkat2">Tingkat 2 (Kantor Wilayah)</Label>
                    <Input
                      id="kanwil-tingkat2"
                      ref={kanwilInputRefs.tingkat2}
                      value={kanwilSettings.tingkat2}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        tingkat2: e.target.value
                      })}
                      placeholder="KANTOR WILAYAH KEMENTERIAN AGAMA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kanwil-tingkat3">Tingkat 3 (Provinsi)</Label>
                    <Input
                      id="kanwil-tingkat3"
                      ref={kanwilInputRefs.tingkat3}
                      value={kanwilSettings.tingkat3}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        tingkat3: e.target.value
                      })}
                      placeholder="PROVINSI NUSA TENGGARA BARAT"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="kanwil-alamat">Alamat Kanwil</Label>
                  <Textarea
                    id="kanwil-alamat"
                    ref={kanwilInputRefs.alamat}
                    value={kanwilSettings.alamat}
                    onChange={(e) => setKanwilSettings({
                      ...kanwilSettings,
                      alamat: e.target.value
                    })}
                    rows={3}
                    placeholder="Contoh: Jl. Pendidikan No. 1, Mataram, NTB"
                    className={fieldError === 'alamat' ? 'border-red-500' : ''}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kanwil-telepon">Telepon</Label>
                    <Input
                      id="kanwil-telepon"
                      ref={kanwilInputRefs.telepon}
                      value={kanwilSettings.telepon}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        telepon: e.target.value
                      })}
                      placeholder="Contoh: (0370) 123456"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kanwil-fax">Fax</Label>
                    <Input
                      id="kanwil-fax"
                      value={kanwilSettings.fax}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        fax: e.target.value
                      })}
                      ref={kanwilInputRefs.fax}
                      placeholder="Contoh: (0370) 123457"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kanwil-email">Email</Label>
                    <Input
                      id="kanwil-email"
                      ref={kanwilInputRefs.email}
                      type="email"
                      value={kanwilSettings.email}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        email: e.target.value
                      })}
                      placeholder="Contoh: kanwil.ntb@kemenag.go.id"
                      className={fieldError === 'email' ? 'border-red-500' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kanwil-website">Website</Label>
                    <Input
                      id="kanwil-website"
                      ref={kanwilInputRefs.website}
                      value={kanwilSettings.website}
                      onChange={(e) => setKanwilSettings({
                        ...kanwilSettings,
                        website: e.target.value
                      })}
                      placeholder="Contoh: kanwil.ntb.kemenag.go.id"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveKanwilSettings} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Pengaturan Kanwil
                </Button>
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
    </div>
  );
};

export default Settings;
