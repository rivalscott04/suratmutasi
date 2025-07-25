
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Save, Upload, Download, Clipboard, Check } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../lib/api';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

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

  if (loading) return <div className="py-8 text-center">Loading data pegawai...</div>;
  if (error) return <div className="py-8 text-center text-error">{error}</div>;

  return (
    <div className="mb-6">
      <div className="mb-4 flex justify-end">
        <Input
          placeholder="Cari nama/NIP/unit kerja..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nama</th>
              <th>NIP</th>
              <th className="text-center">Pangkat/Golongan</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">Tidak ada data pegawai</td>
              </tr>
            ) : (
              paginatedEmployees.map((emp, i) => (
                <tr key={emp.id}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td className="font-medium leading-tight"><CopyableText text={emp.nama} /></td>
                  <td className="text-base text-gray-700 font-semibold"><CopyableText text={emp.nip} /></td>
                  <td className="text-center">{emp.golongan || emp.pangkat_gol}</td>
                  <td>{emp.jabatan}</td>
                  <td>{emp.unit_kerja}</td>
                  <td>
                    <Button size="sm" variant="outline" onClick={() => { setEditData(emp); setEditModalOpen(true); }}>Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 mt-4 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&laquo;</Button>
          <Button size="sm" variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</Button>
          {pageNumbers[0] > 1 && <span className="px-1">...</span>}
          {pageNumbers.map(page => (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-1">...</span>}
          <Button size="sm" variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</Button>
          <Button size="sm" variant="outline" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&raquo;</Button>
        </div>
      )}
      {/* Modal Edit Pegawai */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Pegawai</DialogTitle>
            <DialogDescription>Edit data pegawai lalu klik simpan untuk memperbarui.</DialogDescription>
          </DialogHeader>
          {editData && (
            <form className="space-y-3" onSubmit={async e => {
              e.preventDefault();
              setSaving(true);
              try {
                await apiPut(`/api/employees/${editData.nip}`, editData, token);
                toast({ title: 'Update data pegawai berhasil', variant: 'default' });
                setEditModalOpen(false);
                // Refresh data
                setLoading(true);
                apiGet('/api/employees', token)
                  .then(res => setEmployees(res.pegawai || []))
                  .catch(err => setError(err.message || 'Gagal mengambil data pegawai'))
                  .finally(() => setLoading(false));
              } catch (err: any) {
                toast({ title: 'Update data pegawai gagal', description: err.message, variant: 'destructive' });
              } finally {
                setSaving(false);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>NIP</Label>
                  <Input value={editData.nip || ''} disabled readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Nama</Label>
                  <Input value={editData.nama || ''} onChange={e => setEditData({ ...editData, nama: e.target.value })} disabled={user?.role !== 'admin'} className={user?.role !== 'admin' ? 'bg-gray-100' : ''} />
                </div>
                <div>
                  <Label>Pangkat/Golongan</Label>
                  <Input value={editData.golongan || ''} onChange={e => setEditData({ ...editData, golongan: e.target.value })} />
                </div>
                <div>
                  <Label>Jabatan</Label>
                  <Input value={editData.jabatan || ''} onChange={e => setEditData({ ...editData, jabatan: e.target.value })} />
                </div>
                <div>
                  <Label>Unit Kerja</Label>
                  <Input value={editData.unit_kerja || ''} onChange={e => setEditData({ ...editData, unit_kerja: e.target.value })} />
                </div>
                <div>
                  <Label>Induk Unit</Label>
                  <Input value={editData.induk_unit || ''} onChange={e => setEditData({ ...editData, induk_unit: e.target.value })} />
                </div>
                <div>
                  <Label>TMT Pensiun</Label>
                  <Input type="date" value={editData.tmt_pensiun ? String(editData.tmt_pensiun).slice(0,10) : ''} onChange={e => setEditData({ ...editData, tmt_pensiun: e.target.value })} />
                </div>
                <div>
                  <Label>Kantor ID</Label>
                  <Input value={editData.kantor_id || ''} onChange={e => setEditData({ ...editData, kantor_id: e.target.value })} />
                </div>
                <div>
                  <Label>Jenis Pegawai</Label>
                  <Input value={editData.jenis_pegawai || ''} onChange={e => setEditData({ ...editData, jenis_pegawai: e.target.value })} />
                </div>
                <div>
                  <Label>Aktif</Label>
                  <select className="w-full border rounded h-10 px-2" value={editData.aktif ? 'true' : 'false'} onChange={e => setEditData({ ...editData, aktif: e.target.value === 'true' })}>
                    <option value="true">Aktif</option>
                    <option value="false">Tidak Aktif</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
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
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [officeModalSuccess, setOfficeModalSuccess] = useState<boolean | null>(null);
  const [officeModalMessage, setOfficeModalMessage] = useState('');

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
              namakantor: office.name || '',
              kabkota: office.kabkota || '',
              alamat: office.address || '',
              telepon: office.phone || '',
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

  const handleSaveOfficeSettings = async () => {
    setFieldError(null);
    // Validasi field wajib
    if (!officeSettings.namakantor.trim()) {
      setFieldError('namakantor');
      inputRefs.namakantor.current?.focus();
      toast({
        title: 'Nama kantor wajib diisi.',
        description: 'Silakan isi nama kantor terlebih dahulu.',
        variant: 'destructive',
      });
      return;
    }
    if (!officeSettings.kabkota.trim()) {
      setFieldError('kabkota');
      inputRefs.kabkota.current?.focus();
      toast({
        title: 'Kabupaten/Kota wajib diisi.',
        description: 'Silakan isi kabupaten/kota kantor.',
        variant: 'destructive',
      });
      return;
    }
    if (!officeSettings.alamat.trim()) {
      setFieldError('alamat');
      inputRefs.alamat.current?.focus();
      toast({
        title: 'Alamat kantor wajib diisi.',
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
        description: 'Silakan isi email kantor dengan format yang benar.',
        variant: 'destructive',
      });
      return;
    }
    try {
      // Kirim hanya field yang boleh diupdate
      const payload = {
        address: officeSettings.alamat,
        phone: officeSettings.telepon,
        fax: officeSettings.fax,
        email: officeSettings.email,
        website: officeSettings.website
      };
      await apiPut(`/api/offices/${officeId}`, payload, token);
      setOfficeModalSuccess(true);
      setOfficeModalMessage('Pengaturan kantor berhasil disimpan! Data kantor telah diperbarui.');
      setShowOfficeModal(true);
    } catch (err: any) {
      setOfficeModalSuccess(false);
      setOfficeModalMessage('Gagal menyimpan pengaturan kantor. Silakan coba lagi.');
      setShowOfficeModal(true);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Data",
      description: "Data pegawai sedang diexport...",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Fitur import akan segera tersedia.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pengaturan
          </h1>
          <p className="text-gray-600">
            Kelola pengaturan kantor dan data pegawai
          </p>
        </div>
      </div>

      <Tabs defaultValue="office" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="office" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Kantor</span>
          </TabsTrigger>
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
                <div>Loading data kantor...</div>
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
                        className={fieldError === 'email' ? 'border-red-500' : ''}
                      />
                    </div>
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
                    />
                  </div>

                  <Button onClick={handleSaveOfficeSettings} className="w-full bg-teal-900 hover:bg-teal-800 text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Pengaturan
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Data Pegawai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EmployeesTable token={token} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pengaturan Sistem
                </h3>
                <p className="text-gray-600">
                  Pengaturan sistem dan preferensi akan tersedia segera
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
    </div>
  );
};

export default Settings;
