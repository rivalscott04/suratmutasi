
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
              <th>Nama & NIP</th>
              <th>Pangkat/Golongan</th>
              <th>Jabatan</th>
              <th>Unit Kerja</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">Tidak ada data pegawai</td>
              </tr>
            ) : (
              paginatedEmployees.map((emp, i) => (
                <tr key={emp.id}>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>
                    <div className="font-medium leading-tight">
                      <CopyableText text={emp.nama} />
                    </div>
                    <div className="text-sm text-gray-700 font-semibold">
                      <CopyableText text={emp.nip} />
                    </div>
                  </td>
                  <td>{emp.golongan}</td>
                  <td>{emp.jabatan}</td>
                  <td>{emp.unit_kerja}</td>
                  <td>{emp.aktif ? 'Aktif' : 'Nonaktif'}</td>
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

  useEffect(() => {
    if (token) {
      setLoadingOffice(true);
      apiGet('/api/offices', token)
        .then(res => {
          const office = res.offices && res.offices.length > 0 ? res.offices[0] : null;
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
          }
        })
        .catch(() => setErrorOffice('Gagal mengambil data kantor'))
        .finally(() => setLoadingOffice(false));
    }
  }, [token]);

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
    setFieldError(null);
    if (!token) return;
    try {
      let res;
      if (officeId) {
        res = await apiPut(`/api/offices/${officeId}`, {
          name: officeSettings.namakantor,
          kabkota: officeSettings.kabkota,
          address: officeSettings.alamat,
          phone: officeSettings.telepon,
          fax: officeSettings.fax,
          email: officeSettings.email,
          website: officeSettings.website
        }, token);
      } else {
        res = await apiPost('/api/offices', {
          name: officeSettings.namakantor,
          kabkota: officeSettings.kabkota,
          address: officeSettings.alamat,
          phone: officeSettings.telepon,
          fax: officeSettings.fax,
          email: officeSettings.email,
          website: officeSettings.website
        }, token);
        setOfficeId(res.office?.id);
      }
      toast({
        title: 'Pengaturan kantor berhasil disimpan!',
        description: 'Data kantor akan digunakan otomatis di header surat.',
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Gagal menyimpan pengaturan kantor',
        description: err.message || 'Terjadi kesalahan saat menyimpan data kantor.',
        variant: 'destructive',
      });
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
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          namakantor: e.target.value
                        })}
                        className={fieldError === 'namakantor' ? 'border-red-500' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kabkota">Kabupaten/Kota</Label>
                      <Input
                        id="kabkota"
                        ref={inputRefs.kabkota}
                        value={officeSettings.kabkota}
                        onChange={(e) => setOfficeSettings({
                          ...officeSettings,
                          kabkota: e.target.value
                        })}
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

                  <Button onClick={handleSaveOfficeSettings} className="w-full">
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
    </div>
  );
};

export default Settings;
