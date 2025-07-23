
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Building, Users, Settings as SettingsIcon, Save, Upload, Download } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../lib/api';

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
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Manajemen Pegawai
                </h3>
                <p className="text-gray-600 mb-6">
                  Kelola data pegawai dan pejabat untuk template surat
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleImportData} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Data
                  </Button>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>
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
