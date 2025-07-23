import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PegawaiSearchInput } from '@/components/PegawaiSearchInput';
import { FormSection } from '@/components/FormSection';
import { AutoFilledInput } from '@/components/AutoFilledInput';
import { Template1 } from '@/components/templates/Template1';
import { Template2 } from '@/components/templates/Template2';
import { Template3 } from '@/components/templates/Template3';
import { Template4 } from '@/components/templates/Template4';
import { Template5 } from '@/components/templates/Template5';
import { Template6 } from '@/components/templates/Template6';
import { Template7 } from '@/components/templates/Template7';
import { Template8 } from '@/components/templates/Template8';
import { Template9 } from '@/components/templates/Template9';
import { BaseTemplateData, Template1Data, Template2Data, Template3Data, Template4Data, Template5Data, Template6Data, Template7Data, Template8Data, Template9Data, Pegawai } from '@/types/template';
import { Printer, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost, apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const TEMPLATES = [
  {
    id: '1',
    title: 'Surat Pernyataan Tidak Sedang Tugas Belajar',
    description: 'Surat pernyataan bahwa pegawai tidak sedang menjalani tugas belajar atau ikatan dinas',
    category: 'Pernyataan'
  },
  {
    id: '2',
    title: 'Surat Keterangan Analisis Jabatan',
    description: 'Surat keterangan mengenai analisis jabatan dan analisis beban kerja pegawai',
    category: 'Keterangan'
  },
  {
    id: '3',
    title: 'Surat Keterangan Pengalaman Mengajar',
    description: 'Surat keterangan mengenai pengalaman mengajar seorang guru',
    category: 'Keterangan'
  },
  {
    id: '4',
    title: 'Surat Permohonan Bebas Temuan',
    description: 'Surat permohonan penerbitan surat keterangan bebas temuan',
    category: 'Permohonan'
  },
  {
    id: '5',
    title: 'Surat Pernyataan Tidak Sedang Hukuman Disiplin',
    description: 'Surat pernyataan tidak sedang dalam proses atau menjalani hukuman disiplin',
    category: 'Pernyataan'
  },
  {
    id: '6',
    title: 'Surat Pernyataan Tidak Sedang Proses Pidana',
    description: 'Surat pernyataan tidak sedang menjalani proses pidana atau pernah dipidana',
    category: 'Pernyataan'
  },
  {
    id: '7',
    title: 'Surat Persetujuan Pelepasan',
    description: 'Surat persetujuan untuk melepas pegawai pindah tugas',
    category: 'Persetujuan'
  },
  {
    id: '8',
    title: 'Surat Persetujuan Penerimaan',
    description: 'Surat persetujuan untuk menerima pegawai pindah tugas',
    category: 'Persetujuan'
  },
  {
    id: '9',
    title: 'Surat Pernyataan Tanggung Jawab Mutlak',
    description: 'Surat pernyataan tanggung jawab mutlak atas dokumen dan data',
    category: 'Pernyataan'
  }
];

// Helper format tanggal Indonesia
function formatTanggalIndonesia(tanggal: string) {
  if (!tanggal) return '';
  const bulanIndo = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  let d, m, y;
  if (/\d{4}-\d{2}-\d{2}/.test(tanggal)) {
    // yyyy-mm-dd
    [y, m, d] = tanggal.split('-');
  } else if (/\d{2}-\d{2}-\d{4}/.test(tanggal)) {
    // dd-mm-yyyy
    [d, m, y] = tanggal.split('-');
  } else {
    return tanggal;
  }
  return `${parseInt(d)} ${bulanIndo[parseInt(m)]} ${y}`;
}

const TemplateForm: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [selectedPejabat, setSelectedPejabat] = useState<Pegawai | undefined>();
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | undefined>();
  const [office, setOffice] = useState<any>(null);
  
  // Base data that applies to all templates
  const [baseData, setBaseData] = useState<BaseTemplateData>({
    kabkota: 'LOMBOK BARAT',
    jln: 'Jl. Gajah Mada No. 1 Gerung, Lombok Barat 83511',
    telfon: 'Telp. (0370) 681557',
    fax: 'Fax. (0370) 681557',
    email: 'kemenag.lombokbarat@gmail.com',
    website: 'lombokbarat.kemenag.go.id',
    
    namapejabat: '',
    nippejabat: '',
    pangkatgolpejabat: '',
    jabatanpejabat: '',
    
    namapegawai: '',
    nippegawai: '',
    pangkatgolpegawai: '',
    jabatanpegawai: '',
    
    ibukota: 'Gerung',
    tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  });

  // Template-specific data states
  const [template1Data, setTemplate1Data] = useState<Partial<Template1Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template2Data, setTemplate2Data] = useState<Partial<Template2Data>>({
    nosurat: '',
    blnnomor: '',
    tahunskrg: '',
    unitkerja: '',
    namajabatan: '',
    bbnkerja: '',
    eksisting: '',
    kelebihan: '',
    kekurangan: ''
  });

  const [template3Data, setTemplate3Data] = useState<Partial<Template3Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    tempattugas: '',
    sekolah: '',
    kabkota2: '',
    tglmulai: ''
  });

  const [template4Data, setTemplate4Data] = useState<Partial<Template4Data>>({
    nosrt: '',
    blnsrt: '',
    thnskrg: '',
    unitkerja: '',
    keperluan: ''
  });

  const [template5Data, setTemplate5Data] = useState<Partial<Template5Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    tempattugas: ''
  });

  const [template6Data, setTemplate6Data] = useState<Partial<Template6Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template7Data, setTemplate7Data] = useState<Partial<Template7Data>>({
    nosurat: '',
    blnnomor: '',
    tahunskrg: '',
    tempattugas: '',
    kabkota2: '',
    jabatnpegawai2: '',
    tempattugas2: '',
    kabataukotatujuan: ''
  });

  const [template8Data, setTemplate8Data] = useState<Partial<Template8Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    tempattugas: '',
    jabatanbaru: '',
    tempattugasbaru: ''
  });

  const [template9Data, setTemplate9Data] = useState<Partial<Template9Data>>({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: ''
  });

  const { token, user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [suratId, setSuratId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  React.useEffect(() => {
    if (!token) return;
    const fetchOffice = async () => {
      try {
        let officeData = null;
        if (user?.office_id) {
          const res = await apiGet(`/api/offices/${user.office_id}`, token);
          officeData = res.office;
        } else {
          const res = await apiGet('/api/offices', token);
          officeData = res.offices && res.offices.length > 0 ? res.offices[0] : null;
        }
        if (officeData) {
          setOffice(officeData);
          setBaseData(prev => ({
            ...prev,
            kabkota: officeData.kabkota || '',
            jln: officeData.address || '',
            telfon: officeData.phone || '',
            fax: officeData.fax || '',
            email: officeData.email || '',
            website: officeData.website || '',
          }));
        }
      } catch (err) {
        // Optional: handle error
      }
    };
    fetchOffice();
  }, [token, user]);

  const handlePejabatSelect = (pejabat: Pegawai) => {
    setSelectedPejabat(pejabat);
    setBaseData(prev => ({
      ...prev,
      namapejabat: pejabat.nama,
      nippejabat: pejabat.nip,
      pangkatgolpejabat: pejabat.pangkat_gol || (pejabat as any).golongan || '',
      jabatanpejabat: pejabat.jabatan
    }));

    if (templateId === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (templateId === '5') {
      setTemplate5Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (templateId === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (templateId === '9') {
      setTemplate9Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
  };

  const handlePegawaiSelect = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setBaseData(prev => ({
      ...prev,
      namapegawai: pegawai.nama,
      nippegawai: pegawai.nip,
      pangkatgolpegawai: pegawai.pangkat_gol || (pegawai as any).golongan || '',
      jabatanpegawai: pegawai.jabatan
    }));

    if (templateId === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpegawai: pegawai.unit_kerja }));
    }
    if (templateId === '3') {
      setTemplate3Data(prev => ({ ...prev, tempattugas: pegawai.tempat_tugas }));
    }
    if (templateId === '4') {
      setTemplate4Data(prev => ({ ...prev, unitkerja: pegawai.unit_kerja }));
    }
    if (templateId === '5') {
      setTemplate5Data(prev => ({ ...prev, tempattugas: pegawai.tempat_tugas }));
    }
    if (templateId === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpegawai: pegawai.unit_kerja }));
    }
    if (templateId === '7') {
      setTemplate7Data(prev => ({ ...prev, tempattugas: pegawai.tempat_tugas }));
    }
    if (templateId === '8') {
      setTemplate8Data(prev => ({ ...prev, tempattugas: pegawai.tempat_tugas }));
    }
  };

  const handleBaseDataChange = (field: keyof BaseTemplateData, value: string) => {
    setBaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate1DataChange = (field: keyof Template1Data, value: string) => {
    setTemplate1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate2DataChange = (field: keyof Template2Data, value: string) => {
    setTemplate2Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate3DataChange = (field: keyof Template3Data, value: string) => {
    setTemplate3Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate4DataChange = (field: keyof Template4Data, value: string) => {
    setTemplate4Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate5DataChange = (field: keyof Template5Data, value: string) => {
    setTemplate5Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate6DataChange = (field: keyof Template6Data, value: string) => {
    setTemplate6Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate7DataChange = (field: keyof Template7Data, value: string) => {
    setTemplate7Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate8DataChange = (field: keyof Template8Data, value: string) => {
    setTemplate8Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate9DataChange = (field: keyof Template9Data, value: string) => {
    setTemplate9Data(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    setPdfUrl(null);
    // Validasi field wajib
    if (!office?.id) {
      setSubmitError('Data kantor tidak ditemukan. Silakan atur kantor di Settings.');
      setSaving(false);
      return;
    }
    if (!user?.id) {
      setSubmitError('User tidak valid. Silakan login ulang.');
      setSaving(false);
      return;
    }
    if (!selectedPegawai?.nip) {
      setSubmitError('Pilih pegawai yang akan dinyatakan dalam surat.');
      setSaving(false);
      return;
    }
    if (!selectedPejabat?.nip) {
      setSubmitError('Pilih pejabat penandatangan surat.');
      setSaving(false);
      return;
    }
    // Format nomor surat sesuai template
    let letter_number = '';
    if (templateId === '1') {
      letter_number = `B-${template1Data.nosrt}/Kk.18.08/1/Kp.07.6/${template1Data.blnno}/${template1Data.thnno}`;
    } else if (templateId === '2') {
      letter_number = `B-${template2Data.nosurat}/Kk.18.08/1/KP.07.6/${template2Data.blnnomor}/${template2Data.tahunskrg}`;
    } else if (templateId === '3') {
      letter_number = `B-${template3Data.nosrt}/Kk.18.08/1/KP.07.6/${template3Data.blnno}/${template3Data.thnno}`;
    } else if (templateId === '4') {
      letter_number = `B-${template4Data.nosrt}/Kk.18.08/1/Kp.01.2/${template4Data.blnsrt}/${template4Data.thnskrg}`;
    } else if (templateId === '5') {
      letter_number = `B-${template5Data.nosrt}/Kk.19.08/1/Kp.04.2/${template5Data.blnno}/${template5Data.thnno}`;
    } else if (templateId === '6') {
      letter_number = `B-${template6Data.nosrt}/Kk.18.08/1/Kh.04.1/${template6Data.blnno}/${template6Data.thnno}`;
    } else if (templateId === '7') {
      letter_number = `B-${template7Data.nosurat}/Kk.18.08/1/Kp.07.6/${template7Data.blnnomor}/${template7Data.tahunskrg}`;
    } else if (templateId === '8') {
      letter_number = `B-${template8Data.nosrt}/Kk.18.08/1/Kp.07.6/${template8Data.blnno}/${template8Data.thnno}`;
    } else if (templateId === '9') {
      letter_number = `B-${template9Data.nosrt}/Kk.18.08/1/Kp.01.2/${template9Data.blnno}/${template9Data.thnno}`;
    }
    if (!letter_number) {
      setSubmitError('Nomor surat wajib diisi.');
      setSaving(false);
      return;
    }
    // Format tanggal Indonesia untuk tanda tangan
    let tanggalIndo = '';
    if (templateId === '1') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '2') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '3') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '4') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '5') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '6') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '7') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '8') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    if (templateId === '9') tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    try {
      // Compose payload sesuai backend
      const payload: any = {
        office_id: office.id,
        created_by: user.id,
        template_id: Number(templateId),
        template_name: selectedTemplate?.title,
        letter_number,
        subject: selectedTemplate?.title,
        recipient_employee_nip: selectedPegawai.nip,
        signing_official_nip: selectedPejabat.nip,
        form_data: {
          ...baseData,
          ...template1Data,
          ...template2Data,
          ...template3Data,
          ...template4Data,
          ...template5Data,
          ...template6Data,
          ...template7Data,
          ...template8Data,
          ...template9Data,
          tanggal: tanggalIndo,
          // Always merge these fields for all templates
          unitkerja: selectedPegawai?.unit_kerja || selectedPejabat?.unit_kerja || '',
          ukerpegawai: selectedPegawai?.unit_kerja || '',
          unitkerjapejabat: selectedPejabat?.unit_kerja || '',
          ukerpejabat: selectedPejabat?.unit_kerja || '',
        },
        status: 'draft',
      };
      const res = await apiPost('/api/letters', payload, token);
      setSuratId(res.letter?.id || res.id);
      setShowSuccessModal(true);
      toast({ title: 'Surat berhasil disimpan', description: 'Surat siap digenerate PDF.' });
    } catch (err: any) {
      setSubmitError(err.message || 'Gagal menyimpan surat');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!suratId) return;
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const res = await apiPost(`/api/letters/${suratId}/generate-pdf`, {}, token);
      setPdfUrl(res.file?.file_path || res.file_path);
      toast({ title: 'PDF berhasil digenerate', description: 'Klik link untuk mengunduh.' });
    } catch (err: any) {
      toast({ title: 'Gagal generate PDF', description: err.message || 'Terjadi kesalahan', variant: 'destructive' });
    } finally {
      setPdfLoading(false);
    }
  };

  const renderTemplateForm = () => {
    switch (templateId) {
      case '1':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nosrt">Nomor Surat</Label>
              <Input
                id="nosrt"
                value={template1Data.nosrt}
                onChange={(e) => handleTemplate1DataChange('nosrt', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="blnno">Bulan (Angka)</Label>
              <Input
                id="blnno"
                value={template1Data.blnno}
                onChange={(e) => handleTemplate1DataChange('blnno', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="thnno">Tahun</Label>
              <Input
                id="thnno"
                value={template1Data.thnno}
                onChange={(e) => handleTemplate1DataChange('thnno', e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        );
      case '2':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosurat">Nomor Surat</Label>
                <Input
                  id="nosurat"
                  value={template2Data.nosurat}
                  onChange={(e) => handleTemplate2DataChange('nosurat', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnnomor">Bulan (Angka)</Label>
                <Input
                  id="blnnomor"
                  value={template2Data.blnnomor}
                  onChange={(e) => handleTemplate2DataChange('blnnomor', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="tahunskrg">Tahun</Label>
                <Input
                  id="tahunskrg"
                  value={template2Data.tahunskrg}
                  onChange={(e) => handleTemplate2DataChange('tahunskrg', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitkerja">Unit Kerja</Label>
                <Input
                  id="unitkerja"
                  value={template2Data.unitkerja}
                  onChange={(e) => handleTemplate2DataChange('unitkerja', e.target.value)}
                  placeholder="Unit kerja"
                />
              </div>
              <div>
                <Label htmlFor="namajabatan">Nama Jabatan</Label>
                <Input
                  id="namajabatan"
                  value={template2Data.namajabatan}
                  onChange={(e) => handleTemplate2DataChange('namajabatan', e.target.value)}
                  placeholder="Nama jabatan"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="bbnkerja">Beban Kerja</Label>
                <Input
                  id="bbnkerja"
                  value={template2Data.bbnkerja}
                  onChange={(e) => handleTemplate2DataChange('bbnkerja', e.target.value)}
                  placeholder="Beban kerja"
                />
              </div>
              <div>
                <Label htmlFor="eksisting">Eksisting</Label>
                <Input
                  id="eksisting"
                  value={template2Data.eksisting}
                  onChange={(e) => handleTemplate2DataChange('eksisting', e.target.value)}
                  placeholder="Jumlah eksisting"
                />
              </div>
              <div>
                <Label htmlFor="kelebihan">Kelebihan</Label>
                <Input
                  id="kelebihan"
                  value={template2Data.kelebihan}
                  onChange={(e) => handleTemplate2DataChange('kelebihan', e.target.value)}
                  placeholder="Jumlah kelebihan"
                />
              </div>
              <div>
                <Label htmlFor="kekurangan">Kekurangan</Label>
                <Input
                  id="kekurangan"
                  value={template2Data.kekurangan}
                  onChange={(e) => handleTemplate2DataChange('kekurangan', e.target.value)}
                  placeholder="Jumlah kekurangan"
                />
              </div>
            </div>
          </div>
        );
      case '3':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt3">Nomor Surat</Label>
                <Input
                  id="nosrt3"
                  value={template3Data.nosrt}
                  onChange={(e) => handleTemplate3DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno3">Bulan (Angka)</Label>
                <Input
                  id="blnno3"
                  value={template3Data.blnno}
                  onChange={(e) => handleTemplate3DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno3">Tahun</Label>
                <Input
                  id="thnno3"
                  value={template3Data.thnno}
                  onChange={(e) => handleTemplate3DataChange('thnno', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tempattugas">Tempat Tugas</Label>
                <Input
                  id="tempattugas"
                  value={template3Data.tempattugas}
                  onChange={(e) => handleTemplate3DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas pegawai"
                />
              </div>
              <div>
                <Label htmlFor="sekolah">Sekolah</Label>
                <Input
                  id="sekolah"
                  value={template3Data.sekolah}
                  onChange={(e) => handleTemplate3DataChange('sekolah', e.target.value)}
                  placeholder="Jenis sekolah"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kabkota2">Kabupaten/Kota</Label>
                <Input
                  id="kabkota2"
                  value={template3Data.kabkota2}
                  onChange={(e) => handleTemplate3DataChange('kabkota2', e.target.value)}
                  placeholder="Nama kabupaten/kota"
                />
              </div>
              <div>
                <Label htmlFor="tglmulai">Tanggal Mulai Mengajar</Label>
                <Input
                  id="tglmulai"
                  value={template3Data.tglmulai}
                  onChange={(e) => handleTemplate3DataChange('tglmulai', e.target.value)}
                  placeholder="dd Bulan yyyy"
                />
              </div>
            </div>
          </div>
        );
      case '4':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt4">Nomor Surat</Label>
                <Input
                  id="nosrt4"
                  value={template4Data.nosrt}
                  onChange={(e) => handleTemplate4DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnsrt">Bulan Surat</Label>
                <Input
                  id="blnsrt"
                  value={template4Data.blnsrt}
                  onChange={(e) => handleTemplate4DataChange('blnsrt', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnskrg">Tahun</Label>
                <Input
                  id="thnskrg"
                  value={template4Data.thnskrg}
                  onChange={(e) => handleTemplate4DataChange('thnskrg', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitkerja4">Unit Kerja</Label>
                <Input
                  id="unitkerja4"
                  value={template4Data.unitkerja}
                  onChange={(e) => handleTemplate4DataChange('unitkerja', e.target.value)}
                  placeholder="Unit kerja pegawai"
                />
              </div>
              <div>
                <Label htmlFor="keperluan">Keperluan</Label>
                <Input
                  id="keperluan"
                  value={template4Data.keperluan}
                  onChange={(e) => handleTemplate4DataChange('keperluan', e.target.value)}
                  placeholder="Keperluan SKBT"
                />
              </div>
            </div>
          </div>
        );
      case '5':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt5">Nomor Surat</Label>
                <Input
                  id="nosrt5"
                  value={template5Data.nosrt}
                  onChange={(e) => handleTemplate5DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno5">Bulan (Angka)</Label>
                <Input
                  id="blnno5"
                  value={template5Data.blnno}
                  onChange={(e) => handleTemplate5DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno5">Tahun</Label>
                <Input
                  id="thnno5"
                  value={template5Data.thnno}
                  onChange={(e) => handleTemplate5DataChange('thnno', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>
        );
      case '6':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt6">Nomor Surat</Label>
                <Input
                  id="nosrt6"
                  value={template6Data.nosrt}
                  onChange={(e) => handleTemplate6DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno6">Bulan (Angka)</Label>
                <Input
                  id="blnno6"
                  value={template6Data.blnno}
                  onChange={(e) => handleTemplate6DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno6">Tahun</Label>
                <Input
                  id="thnno6"
                  value={template6Data.thnno}
                  onChange={(e) => handleTemplate6DataChange('thnno', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>
        );
      case '7':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosurat7">Nomor Surat</Label>
                <Input
                  id="nosurat7"
                  value={template7Data.nosurat}
                  onChange={(e) => handleTemplate7DataChange('nosurat', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnnomor7">Bulan (Angka)</Label>
                <Input
                  id="blnnomor7"
                  value={template7Data.blnnomor}
                  onChange={(e) => handleTemplate7DataChange('blnnomor', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="tahunskrg7">Tahun</Label>
                <Input
                  id="tahunskrg7"
                  value={template7Data.tahunskrg}
                  onChange={(e) => handleTemplate7DataChange('tahunskrg', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tempattugas7">Tempat Tugas Asal</Label>
                <Input
                  id="tempattugas7"
                  value={template7Data.tempattugas}
                  onChange={(e) => handleTemplate7DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas asal"
                />
              </div>
              <div>
                <Label htmlFor="kabkota27">Kabupaten/Kota Asal</Label>
                <Input
                  id="kabkota27"
                  value={template7Data.kabkota2}
                  onChange={(e) => handleTemplate7DataChange('kabkota2', e.target.value)}
                  placeholder="Kabupaten/kota asal"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jabatnpegawai2">Jabatan Baru</Label>
                <Input
                  id="jabatnpegawai2"
                  value={template7Data.jabatnpegawai2}
                  onChange={(e) => handleTemplate7DataChange('jabatnpegawai2', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
              <div>
                <Label htmlFor="tempattugas2">Tempat Tugas Baru</Label>
                <Input
                  id="tempattugas2"
                  value={template7Data.tempattugas2}
                  onChange={(e) => handleTemplate7DataChange('tempattugas2', e.target.value)}
                  placeholder="Tempat tugas tujuan"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="kabataukotatujuan">Kabupaten/Kota Tujuan</Label>
              <Input
                id="kabataukotatujuan"
                value={template7Data.kabataukotatujuan}
                onChange={(e) => handleTemplate7DataChange('kabataukotatujuan', e.target.value)}
                placeholder="Kabupaten/kota tujuan"
              />
            </div>
          </div>
        );
      case '8':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt8">Nomor Surat</Label>
                <Input
                  id="nosrt8"
                  value={template8Data.nosrt}
                  onChange={(e) => handleTemplate8DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno8">Bulan (Angka)</Label>
                <Input
                  id="blnno8"
                  value={template8Data.blnno}
                  onChange={(e) => handleTemplate8DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno8">Tahun</Label>
                <Input
                  id="thnno8"
                  value={template8Data.thnno}
                  onChange={(e) => handleTemplate8DataChange('thnno', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tempattugas8">Tempat Tugas Asal</Label>
                <Input
                  id="tempattugas8"
                  value={template8Data.tempattugas}
                  onChange={(e) => handleTemplate8DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas asal"
                />
              </div>
              <div>
                <Label htmlFor="jabatanbaru">Jabatan Baru</Label>
                <Input
                  id="jabatanbaru"
                  value={template8Data.jabatanbaru}
                  onChange={(e) => handleTemplate8DataChange('jabatanbaru', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tempattugasbaru">Tempat Tugas Baru</Label>
              <Input
                id="tempattugasbaru"
                value={template8Data.tempattugasbaru}
                onChange={(e) => handleTemplate8DataChange('tempattugasbaru', e.target.value)}
                placeholder="Tempat tugas tujuan"
              />
            </div>
          </div>
        );
      case '9':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nosrt9">Nomor Surat</Label>
                <Input
                  id="nosrt9"
                  value={template9Data.nosrt}
                  onChange={(e) => handleTemplate9DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno9">Bulan (Angka)</Label>
                <Input
                  id="blnno9"
                  value={template9Data.blnno}
                  onChange={(e) => handleTemplate9DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno9">Tahun</Label>
                <Input
                  id="thnno9"
                  value={template9Data.thnno}
                  onChange={(e) => handleTemplate9DataChange('thnno', e.target.value)}
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Template tidak ditemukan</p>
          </div>
        );
    }
  };

  const renderTemplatePreview = () => {
    switch (templateId) {
      case '1':
        return (
          <Template1 
            data={{
              ...baseData,
              ...template1Data
            } as Template1Data}
          />
        );
      case '2':
        return (
          <Template2 
            data={{
              ...baseData,
              ...template2Data
            } as Template2Data}
          />
        );
      case '3':
        return (
          <Template3 
            data={{
              ...baseData,
              ...template3Data
            } as Template3Data}
          />
        );
      case '4':
        return (
          <Template4 
            data={{
              ...baseData,
              ...template4Data
            } as Template4Data}
          />
        );
      case '5':
        return (
          <Template5 
            data={{
              ...baseData,
              ...template5Data
            } as Template5Data}
          />
        );
      case '6':
        return (
          <Template6 
            data={{
              ...baseData,
              ...template6Data
            } as Template6Data}
          />
        );
      case '7':
        return (
          <Template7 
            data={{
              ...baseData,
              ...template7Data
            } as Template7Data}
          />
        );
      case '8':
        return (
          <Template8 
            data={{
              ...baseData,
              ...template8Data
            } as Template8Data}
          />
        );
      case '9':
        return (
          <Template9 
            data={{
              ...baseData,
              ...template9Data
            } as Template9Data}
          />
        );
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Template tidak ditemukan</p>
          </div>
        );
    }
  };

  const selectedTemplate = TEMPLATES.find(t => t.id === templateId);

  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template tidak ditemukan</h1>
          <Button onClick={() => navigate('/generator')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Pilihan Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/generator')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Pilihan Template
            </Button>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary">{selectedTemplate.category}</Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Template {templateId}</span>
          </div>
          <h1 className="text-3xl font-bold">{selectedTemplate.title}</h1>
          <p className="text-muted-foreground mt-2">{selectedTemplate.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pejabat Section */}
            <FormSection 
              title="Data Pejabat Penandatangan" 
              description="Pilih pejabat yang akan menandatangani surat"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <PegawaiSearchInput
                    label="Cari Pejabat"
                    placeholder="Masukkan nama atau NIP pejabat..."
                    onSelect={handlePejabatSelect}
                    selectedPegawai={selectedPejabat}
                  />
                </div>
                <div className="space-y-4">
                  <AutoFilledInput
                    label="Nama Pejabat"
                    value={baseData.namapejabat}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="NIP"
                    value={baseData.nippejabat}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Pangkat/Golongan"
                    value={baseData.pangkatgolpejabat}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Jabatan"
                    value={baseData.jabatanpejabat}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Unit Kerja Pejabat"
                    value={selectedPejabat?.unit_kerja ?? ''}
                    placeholder="Akan terisi otomatis"
                  />
                </div>
              </div>
            </FormSection>

            {/* Pegawai Section */}
            <FormSection 
              title="Data Pegawai" 
              description="Pilih pegawai yang akan dinyatakan dalam surat"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <PegawaiSearchInput
                    label="Cari Pegawai"
                    placeholder="Masukkan nama atau NIP pegawai..."
                    onSelect={handlePegawaiSelect}
                    selectedPegawai={selectedPegawai}
                  />
                </div>
                <div className="space-y-4">
                  <AutoFilledInput
                    label="Nama Pegawai"
                    value={baseData.namapegawai}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="NIP"
                    value={baseData.nippegawai}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Pangkat/Golongan"
                    value={baseData.pangkatgolpegawai}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Jabatan"
                    value={baseData.jabatanpegawai}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Unit Kerja Pegawai"
                    value={selectedPegawai?.unit_kerja ?? ''}
                    placeholder="Akan terisi otomatis"
                  />
                </div>
              </div>
            </FormSection>

            {/* Template Specific Fields */}
            <FormSection 
              title="Detail Template" 
              description="Lengkapi informasi khusus untuk template yang dipilih"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {renderTemplateForm()}
                {submitError && <div className="text-error mb-2">{submitError}</div>}
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan & Generate Surat'}
                </Button>
              </form>
            </FormSection>

            {/* Signature Section */}
            <FormSection 
              title="Tanda Tangan" 
              description="Atur tempat dan tanggal penandatanganan"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ibukota">Tempat</Label>
                  <Input
                    id="ibukota"
                    value={baseData.ibukota}
                    onChange={(e) => handleBaseDataChange('ibukota', e.target.value)}
                    placeholder="e.g., Gerung"
                  />
                </div>
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    value={baseData.tanggal}
                    onChange={(e) => handleBaseDataChange('tanggal', e.target.value)}
                    placeholder="dd-mm-yyyy"
                  />
                </div>
              </div>
            </FormSection>

          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <FormSection 
                title="Preview Surat" 
                description="Lihat hasil surat yang akan dicetak"
              >
                <div className="space-y-4">
                  <Button 
                    onClick={handlePrint} 
                    className="w-full"
                    size="lg"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Cetak Surat
                  </Button>
                  
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm max-h-96 overflow-y-auto">
                        <div className="transform scale-50 origin-top-left w-[200%]">
                          {renderTemplatePreview()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {suratId && (
                    <div className="space-y-2">
                      <Button onClick={handleGeneratePdf} className="w-full" disabled={pdfLoading}>
                        {pdfLoading ? 'Menggenerate PDF...' : 'Generate PDF'}
                      </Button>
                      {pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full mt-2">Download PDF</a>
                      )}
                    </div>
                  )}
                </div>
              </FormSection>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md w-full rounded-xl p-8 bg-white/90 backdrop-blur shadow-xl flex flex-col items-center text-center">
          <button onClick={() => setShowSuccessModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Surat berhasil disimpan!</h2>
          <p className="text-gray-600 mb-6">Anda dapat melanjutkan generate PDF, melihat detail surat, atau input surat baru.</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              className="btn btn-primary w-full text-base font-semibold py-3 rounded-lg"
              onClick={() => {
                setShowSuccessModal(false);
                if (suratId) navigate(`/letters/${suratId}`);
              }}
            >
              Lihat Detail Surat
            </button>
            <button
              className="btn btn-outline w-full text-base font-semibold py-3 rounded-lg"
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
            >
              Input Surat Baru
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateForm;
