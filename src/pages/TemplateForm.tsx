import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Printer, ArrowLeft, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost, apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DialogTitle, DialogDescription } from '@radix-ui/react-dialog';
import SuratPreviewContainer from '@/components/SuratPreviewContainer';

// Konstanta untuk kabupaten/kota NTB
const KABUPATEN_KOTA_NTB = [
  'Kota Mataram',
  'Kabupaten Lombok Barat',
  'Kabupaten Lombok Tengah',
  'Kabupaten Lombok Timur',
  'Kabupaten Lombok Utara',
  'Kabupaten Sumbawa Barat',
  'Kabupaten Sumbawa',
  'Kabupaten Dompu',
  'Kabupaten Bima',
  'Kota Bima'
];

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
    return `${parseInt(d, 10)} ${bulanIndo[parseInt(m, 10)]} ${y}`;
  } else if (/\d{2}-\d{2}-\d{4}/.test(tanggal)) {
    // dd-mm-yyyy
    [d, m, y] = tanggal.split('-');
    return `${parseInt(d, 10)} ${bulanIndo[parseInt(m, 10)]} ${y}`;
  } else {
    return tanggal;
  }
}

const TemplateForm: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [selectedPejabat, setSelectedPejabat] = useState<Pegawai | undefined>();
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | undefined>();
  const [office, setOffice] = useState<any>(null);
  
  // Set default tahun di semua form input tahun
  const currentYear = new Date().getFullYear().toString();

  // Input tempat pada section tanda tangan: default kosong, placeholder 'Mataram'
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
    ibukota: '', // default kosong
    tanggal: '',
    kode_kabko: ''
  });

  // Inisialisasi state tahun di semua templateXData
  const [template1Data, setTemplate1Data] = useState<Partial<Template1Data>>({
    nosrt: '',
    blnno: '',
    thnno: currentYear,
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template2Data, setTemplate2Data] = useState<Partial<Template2Data>>({
    nosurat: '',
    blnnomor: '',
    tahunskrg: currentYear,
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
    thnno: currentYear,
    tempattugas: '',
    sekolah: '',
    kabkota2: '',
    tglmulai: ''
  });

  const [template4Data, setTemplate4Data] = useState<Partial<Template4Data>>({
    nosrt: '',
    blnsrt: '',
    thnskrg: currentYear,
    unitkerja: '',
    keperluan: ''
  });

  const [template5Data, setTemplate5Data] = useState<Partial<Template5Data>>({
    nosrt: '',
    blnno: '',
    thnno: currentYear,
    ukerpejabat: '',
    tempattugas: ''
  });

  const [template6Data, setTemplate6Data] = useState<Partial<Template6Data>>({
    nosrt: '',
    blnno: '',
    thnno: currentYear,
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template7Data, setTemplate7Data] = useState<Partial<Template7Data>>({
    nosurat: '',
    blnnomor: '',
    tahunskrg: currentYear,
    tempattugas: '',
    kabkota2: '',
    jabatnpegawai2: '',
    tempattugas2: '',
    kabataukotatujuan: ''
  });

  const [template8Data, setTemplate8Data] = useState<Partial<Template8Data>>({
    nosrt: '',
    blnno: '',
    thnno: currentYear,
    tempattugas: '',
    jabatanbaru: '',
    tempattugasbaru: ''
  });

  const [template9Data, setTemplate9Data] = useState<Partial<Template9Data>>({
    nosrt: '',
    blnno: '',
    thnno: currentYear,
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
  const [savedLetter, setSavedLetter] = useState<any>(null);

  useEffect(() => {
    if (!suratId || !token) return;
    apiGet(`/api/letters/${suratId}`, token).then(res => setSavedLetter(res.letter)).catch(() => setSavedLetter(null));
  }, [suratId, token]);

  React.useEffect(() => {
    if (!token) return;
    const fetchOffice = async () => {
      try {
        let officeData = null;
        if (user?.office_id) {
          const res = await apiGet(`/api/offices/${user.office_id}`, token);
          officeData = res.office;
        } else {
          officeData = null; // Jangan fallback ke office lain
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
            kode_kabko: officeData.kode_kabko || ''
          }));
        }
      } catch (err) {
        // Optional: handle error
      }
    };
    fetchOffice();
  }, [token, user]);

  const handlePejabatSelect = (pejabat?: Pegawai) => {
    setSelectedPejabat(pejabat);
    setBaseData(prev => ({
      ...prev,
      namapejabat: pejabat?.nama || '',
      nippejabat: pejabat?.nip || '',
      pangkatgolpejabat: pejabat?.pangkat_gol || (pejabat as any)?.golongan || '',
      jabatanpejabat: pejabat?.jabatan || ''
    }));
    if (templateId === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpejabat: pejabat?.unit_kerja || '' }));
    }
    if (templateId === '5') {
      setTemplate5Data(prev => ({ ...prev, ukerpejabat: pejabat?.unit_kerja || '' }));
    }
    if (templateId === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpejabat: pejabat?.unit_kerja || '' }));
    }
    if (templateId === '9') {
      setTemplate9Data(prev => ({ ...prev, ukerpejabat: pejabat?.unit_kerja || '' }));
    }
  };

  const handlePegawaiSelect = (pegawai?: Pegawai) => {
    setSelectedPegawai(pegawai);
    setBaseData(prev => ({
      ...prev,
      namapegawai: pegawai?.nama || '',
      nippegawai: pegawai?.nip || '',
      pangkatgolpegawai: pegawai?.pangkat_gol || (pegawai as any)?.golongan || '',
      jabatanpegawai: pegawai?.jabatan || ''
    }));
    if (templateId === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpegawai: pegawai?.unit_kerja || '' }));
    }
    if (templateId === '3') {
      setTemplate3Data(prev => ({ ...prev, tempattugas: pegawai?.tempat_tugas || '' }));
    }
    if (templateId === '4') {
      setTemplate4Data(prev => ({ ...prev, unitkerja: pegawai?.unit_kerja || '' }));
    }
    if (templateId === '5') {
      setTemplate5Data(prev => ({ ...prev, tempattugas: pegawai?.tempat_tugas || '' }));
    }
    if (templateId === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpegawai: pegawai?.unit_kerja || '' }));
    }
    if (templateId === '7') {
      setTemplate7Data(prev => ({ ...prev, tempattugas: pegawai?.tempat_tugas || '' }));
    }
    if (templateId === '8') {
      setTemplate8Data(prev => ({ ...prev, tempattugas: pegawai?.tempat_tugas || '' }));
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
    console.log('Template 5 Change:', field, value);
    setTemplate5Data(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Template 5 New State:', newData);
      return newData;
    });
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
    console.log('office yang dipakai:', office);
    console.log('SUBMIT', { selectedPegawai, selectedPejabat, office, user, templateId });
    setSaving(true);
    setSubmitError(null);
    setPdfUrl(null);
    // Validasi field wajib
    if (!office?.id) {
      console.log('VALIDASI GAGAL: office', office);
      setSubmitError('Data kantor tidak ditemukan. Silakan atur kantor di Settings.');
      setSaving(false);
      return;
    }
    if (!user?.id) {
      console.log('VALIDASI GAGAL: user', user);
      setSubmitError('User tidak valid. Silakan login ulang.');
      setSaving(false);
      return;
    }
    if (templateId !== '2' && templateId !== '9' && !selectedPegawai?.nip) {
      setSubmitError('Pilih pegawai yang akan dinyatakan dalam surat.');
      setSaving(false);
      return;
    }
    if (!selectedPejabat?.nip) {
      console.log('VALIDASI GAGAL: selectedPejabat', selectedPejabat);
      setSubmitError('Pilih pejabat penandatangan surat.');
      setSaving(false);
      return;
    }
    // Format nomor surat sesuai template
    const kodeKabko = office?.kode_kabko || baseData.kode_kabko || '-';
    let letter_number = '';
    if (templateId === '1') {
      letter_number = `B-${template1Data.nosrt}/Kk.18.${kodeKabko}/1/Kp.07.6/${template1Data.blnno}/${template1Data.thnno}`;
    } else if (templateId === '2') {
      letter_number = `B-${template2Data.nosurat}/Kk.18.${kodeKabko}/1/KP.07.6/${template2Data.blnnomor}/${template2Data.tahunskrg}`;
    } else if (templateId === '3') {
      letter_number = `B-${template3Data.nosrt}/Kk.18.${kodeKabko}/1/KP.07.6/${template3Data.blnno}/${template3Data.thnno}`;
    } else if (templateId === '4') {
      letter_number = `B-${template4Data.nosrt}/Kk.18.${kodeKabko}/1/Kp.01.2/${template4Data.blnsrt}/${template4Data.thnskrg}`;
    } else if (templateId === '5') {
      letter_number = `B-${template5Data.nosrt}/Kk.18.${kodeKabko}/1/Kp.07.6/${template5Data.blnno}/${template5Data.thnno}`;
    } else if (templateId === '6') {
      letter_number = `B-${template6Data.nosrt}/Kk.18.${kodeKabko}/1/Kh.04.1/${template6Data.blnno}/${template6Data.thnno}`;
    } else if (templateId === '7') {
      letter_number = `B-${template7Data.nosurat}/Kk.18.${kodeKabko}/1/Kp.07.6/${template7Data.blnnomor}/${template7Data.tahunskrg}`;
    } else if (templateId === '8') {
      letter_number = `B-${template8Data.nosrt}/Kk.18.${kodeKabko}/1/Kp.07.6/${template8Data.blnno}/${template8Data.thnno}`;
    } else if (templateId === '9') {
      letter_number = `B-${template9Data.nosrt}/Kk.18.${kodeKabko}/1/Kp.01.2/${template9Data.blnno}/${template9Data.thnno}`;
    }
    if (!letter_number) {
      console.log('VALIDASI GAGAL: letter_number', letter_number);
      setSubmitError('Nomor surat wajib diisi.');
      setSaving(false);
      return;
    }
    console.log('SUBMIT LANJUT: letter_number', letter_number);
    // Format tanggal Indonesia untuk tanda tangan
    let tanggalIndo = '';
    if (baseData.tanggal) tanggalIndo = formatTanggalIndonesia(baseData.tanggal);
    
    // Compose payload sesuai backend
    const payload: any = {
      office_id: office.id,
      created_by: user.id,
      template_id: Number(templateId),
      letter_number,
      subject: selectedTemplate?.title,
      recipient_employee_nip: selectedPegawai?.nip || null, // Handle null for template 9
      signing_official_nip: selectedPejabat.nip,
      form_data: {
        ...baseData,
        // Only include template-specific data based on current template
        ...(templateId === '1' && template1Data),
        ...(templateId === '2' && template2Data),
        ...(templateId === '3' && template3Data),
        ...(templateId === '4' && template4Data),
        ...(templateId === '5' && template5Data),
        ...(templateId === '6' && template6Data),
        ...(templateId === '7' && template7Data),
        ...(templateId === '8' && template8Data),
        ...(templateId === '9' && template9Data),
        tanggal: tanggalIndo,
        kode_kabko: office?.kode_kabko || baseData.kode_kabko || '', // pastikan selalu ikut
        // Always merge these fields for all templates
        unitkerja: selectedPegawai?.unit_kerja || selectedPejabat?.unit_kerja || '',
        ukerpegawai: selectedPegawai?.unit_kerja || (templateId === '6' ? template6Data.ukerpegawai : ''),
        unitkerjapejabat: selectedPejabat?.unit_kerja || '',
        ukerpejabat: selectedPejabat?.unit_kerja || (templateId === '5' ? template5Data.ukerpejabat : '') || (templateId === '6' ? template6Data.ukerpejabat : ''),
        // Only include relevant fields based on template
        ...(templateId === '1' && {
          blnno: template1Data.blnno,
          thnno: template1Data.thnno,
          nosrt: template1Data.nosrt,
          ukerpejabat: template1Data.ukerpejabat,
          ukerpegawai: template1Data.ukerpegawai
        }),
        ...(templateId === '2' && {
          blnnomor: template2Data.blnnomor,
          tahunskrg: template2Data.tahunskrg,
          nosurat: template2Data.nosurat,
          unitkerja: template2Data.unitkerja,
          namajabatan: template2Data.namajabatan,
          bbnkerja: template2Data.bbnkerja,
          eksisting: template2Data.eksisting,
          kelebihan: template2Data.kelebihan,
          kekurangan: template2Data.kekurangan
        }),
        ...(templateId === '3' && {
          nosrt: template3Data.nosrt,
          blnno: template3Data.blnno,
          thnno: template3Data.thnno,
          tempattugas: template3Data.tempattugas,
          sekolah: template3Data.sekolah,
          kabkota2: template3Data.kabkota2,
          tglmulai: template3Data.tglmulai
        }),
        ...(templateId === '4' && {
          nosrt: template4Data.nosrt,
          blnsrt: template4Data.blnsrt,
          thnskrg: template4Data.thnskrg,
          unitkerja: template4Data.unitkerja,
          keperluan: template4Data.keperluan
        }),
        ...(templateId === '5' && {
          nosrt: template5Data.nosrt,
          blnno: template5Data.blnno,
          thnno: template5Data.thnno,
          ukerpejabat: template5Data.ukerpejabat,
          tempattugas: template5Data.tempattugas
        }),
        ...(templateId === '6' && {
          nosrt: template6Data.nosrt,
          blnno: template6Data.blnno,
          thnno: template6Data.thnno,
          ukerpejabat: template6Data.ukerpejabat,
          ukerpegawai: template6Data.ukerpegawai
        }),
        ...(templateId === '7' && {
          nosurat: template7Data.nosurat,
          blnnomor: template7Data.blnnomor,
          tahunskrg: template7Data.tahunskrg,
          tempattugas: template7Data.tempattugas,
          kabkota2: template7Data.kabkota2,
          jabatnpegawai2: template7Data.jabatnpegawai2,
          tempattugas2: template7Data.tempattugas2,
          kabataukotatujuan: template7Data.kabataukotatujuan
        }),
        ...(templateId === '8' && {
          nosrt: template8Data.nosrt,
          blnno: template8Data.blnno,
          thnno: template8Data.thnno,
          tempattugas: template8Data.tempattugas,
          jabatanbaru: template8Data.jabatanbaru,
          tempattugasbaru: template8Data.tempattugasbaru
        }),
        ...(templateId === '9' && {
          nosrt: template9Data.nosrt,
          blnno: template9Data.blnno,
          thnno: template9Data.thnno,
          ukerpejabat: template9Data.ukerpejabat
        })
      },
      status: 'draft',
    };
    
    try {
      console.log('PAYLOAD', payload);
      // Only log template-specific data for current template
      if (templateId === '2') {
        console.log('TEMPLATE 2 DATA:', template2Data);
        console.log('FORM_DATA SENT:', payload.form_data);
        console.log('TEMPLATE ID:', templateId);
        console.log('LETTER NUMBER:', letter_number);
        
        // Check for empty fields in form_data
        console.log('CHECKING EMPTY FIELDS:');
        Object.entries(payload.form_data).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) {
            console.log(`EMPTY FIELD: ${key} = ${value}`);
          }
        });
        
        // Check required Template 2 fields specifically
        console.log('TEMPLATE 2 REQUIRED FIELDS CHECK:');
        const template2Fields = ['blnnomor', 'tahunskrg', 'nosurat', 'unitkerja', 'namajabatan', 'bbnkerja', 'eksisting', 'kelebihan', 'kekurangan'];
        template2Fields.forEach(field => {
          const value = payload.form_data[field];
          console.log(`${field}: ${value} ${value === '' ? '(EMPTY!)' : ''}`);
        });
      }
      const res = await apiPost('/api/letters', payload, token);
      setSuratId(res.letter?.id || res.id);
      setShowSuccessModal(true);
      toast({ title: 'Surat berhasil disimpan', description: 'Surat siap digenerate PDF.' });
    } catch (err: any) {
      console.error('ERROR SUBMIT', err);
      console.error('ERROR DETAILS:', {
        message: err.message,
        status: err.status,
        response: err.response,
        data: err.data
      });
      console.error('PAYLOAD THAT FAILED:', payload);
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
                value={template1Data.nosrt || ''}
                onChange={(e) => handleTemplate1DataChange('nosrt', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="blnno">Bulan (Angka)</Label>
              <Input
                id="blnno"
                value={template1Data.blnno || ''}
                onChange={(e) => handleTemplate1DataChange('blnno', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="thnno">Tahun</Label>
              <Input
                id="thnno"
                value={template1Data.thnno || ''}
                onChange={(e) => handleTemplate1DataChange('thnno', e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        );
      case '2':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nosurat">Nomor Surat</Label>
              <Input
                id="nosurat"
                value={template2Data.nosurat || ''}
                onChange={(e) => handleTemplate2DataChange('nosurat', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="blnnomor">Bulan (Angka)</Label>
              <Input
                id="blnnomor"
                value={template2Data.blnnomor || ''}
                onChange={(e) => handleTemplate2DataChange('blnnomor', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="tahunskrg">Tahun</Label>
              <Input
                id="tahunskrg"
                value={template2Data.tahunskrg || ''}
                onChange={(e) => handleTemplate2DataChange('tahunskrg', e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <Label htmlFor="namajabatan">Nama Jabatan</Label>
              <Input
                id="namajabatan"
                value={template2Data.namajabatan || ''}
                onChange={(e) => handleTemplate2DataChange('namajabatan', e.target.value)}
                placeholder="Nama jabatan"
              />
            </div>
            <div>
              <Label htmlFor="bbnkerja">Beban Kerja</Label>
              <Input
                id="bbnkerja"
                value={template2Data.bbnkerja || ''}
                onChange={(e) => handleTemplate2DataChange('bbnkerja', e.target.value)}
                placeholder="Beban kerja"
              />
            </div>
            <div>
              <Label htmlFor="eksisting">Eksisting</Label>
              <Input
                id="eksisting"
                value={template2Data.eksisting || ''}
                onChange={(e) => handleTemplate2DataChange('eksisting', e.target.value)}
                placeholder="Jumlah eksisting"
              />
            </div>
            <div>
              <Label htmlFor="kelebihan">Kelebihan</Label>
              <Input
                id="kelebihan"
                value={template2Data.kelebihan || ''}
                onChange={(e) => handleTemplate2DataChange('kelebihan', e.target.value)}
                placeholder="Jumlah kelebihan"
              />
            </div>
            <div>
              <Label htmlFor="kekurangan">Kekurangan</Label>
              <Input
                id="kekurangan"
                value={template2Data.kekurangan || ''}
                onChange={(e) => handleTemplate2DataChange('kekurangan', e.target.value)}
                placeholder="Jumlah kekurangan"
              />
            </div>
          </div>
        );
      case '3':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nosrt3">Nomor Surat</Label>
              <Input
                id="nosrt3"
                value={template3Data.nosrt || ''}
                onChange={(e) => handleTemplate3DataChange('nosrt', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="blnno3">Bulan (Angka)</Label>
              <Input
                id="blnno3"
                value={template3Data.blnno || ''}
                onChange={(e) => handleTemplate3DataChange('blnno', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="thnno3">Tahun</Label>
              <Input
                id="thnno3"
                value={template3Data.thnno || ''}
                onChange={(e) => handleTemplate3DataChange('thnno', e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
            <div>
              <Label htmlFor="tempattugas">Tempat Tugas</Label>
              <Input
                id="tempattugas"
                value={template3Data.tempattugas || ''}
                onChange={(e) => handleTemplate3DataChange('tempattugas', e.target.value)}
                placeholder="Akan terisi otomatis dari data pegawai (atau isi manual)"
                className={template3Data.tempattugas ? "bg-gray-50" : ""}
              />
            </div>
            <div>
              <Label htmlFor="sekolah">Sekolah</Label>
              <select
                id="sekolah"
                className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                value={template3Data.sekolah || ''}
                onChange={e => handleTemplate3DataChange('sekolah', e.target.value)}
              >
                <option value="">Pilih sekolah</option>
                <option value="MAN">MAN</option>
                <option value="MTs">MTs</option>
                <option value="MIN">MIN</option>
              </select>
            </div>
            <div>
              <Label htmlFor="kabkota2">Kabupaten/Kota</Label>
              <Select onValueChange={(value) => handleTemplate3DataChange('kabkota2', value)} value={template3Data.kabkota2 || ''}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kabupaten/kota" />
                </SelectTrigger>
                <SelectContent>
                  {KABUPATEN_KOTA_NTB.map(kota => (
                    <SelectItem key={kota} value={kota}>{kota}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tglmulai">Tanggal Mulai</Label>
              <Input
                id="tglmulai"
                type="date"
                value={template3Data.tglmulai || ''}
                onChange={(e) => handleTemplate3DataChange('tglmulai', e.target.value)}
              />
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
                  value={template4Data.nosrt || ''}
                  onChange={(e) => handleTemplate4DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnsrt">Bulan Surat</Label>
                <Input
                  id="blnsrt"
                  value={template4Data.blnsrt || ''}
                  onChange={(e) => handleTemplate4DataChange('blnsrt', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnskrg">Tahun</Label>
                <Input
                  id="thnskrg"
                  value={template4Data.thnskrg || ''}
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
                  value={template4Data.unitkerja || ''}
                  onChange={(e) => handleTemplate4DataChange('unitkerja', e.target.value)}
                  placeholder="Unit kerja pegawai"
                />
              </div>
              <div>
                <Label htmlFor="keperluan">Keperluan</Label>
                <Input
                  id="keperluan"
                  value={template4Data.keperluan || ''}
                  onChange={(e) => handleTemplate4DataChange('keperluan', e.target.value)}
                  placeholder="Keperluan SKBT"
                />
              </div>
            </div>
          </div>
        );
      case '5':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nosrt5">Nomor Surat</Label>
              <Input
                id="nosrt5"
                value={template5Data.nosrt || ''}
                onChange={(e) => handleTemplate5DataChange('nosrt', e.target.value)}
                placeholder="e.g., 123"
              />
            </div>
            <div>
              <Label htmlFor="blnno5">Bulan (Angka)</Label>
              <Input
                id="blnno5"
                value={template5Data.blnno || ''}
                onChange={(e) => handleTemplate5DataChange('blnno', e.target.value)}
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <Label htmlFor="thnno5">Tahun</Label>
              <Input
                id="thnno5"
                value={template5Data.thnno || ''}
                onChange={(e) => handleTemplate5DataChange('thnno', e.target.value)}
                placeholder="e.g., 2024"
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="tempattugas5">Satuan Kerja</Label>
              <Input
                id="tempattugas5"
                value={template5Data.tempattugas || ''}
                onChange={(e) => {
                  console.log('Input change - tempattugas5:', e.target.value);
                  handleTemplate5DataChange('tempattugas', e.target.value);
                }}
                placeholder="Akan terisi otomatis dari data pegawai (atau isi manual)"
                className={template5Data.tempattugas ? "bg-gray-50" : ""}
              />
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
                  value={template6Data.nosrt || ''}
                  onChange={(e) => handleTemplate6DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno6">Bulan (Angka)</Label>
                <Input
                  id="blnno6"
                  value={template6Data.blnno || ''}
                  onChange={(e) => handleTemplate6DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno6">Tahun</Label>
                <Input
                  id="thnno6"
                  value={template6Data.thnno || ''}
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
                  value={template7Data.nosurat || ''}
                  onChange={(e) => handleTemplate7DataChange('nosurat', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnnomor7">Bulan (Angka)</Label>
                <Input
                  id="blnnomor7"
                  value={template7Data.blnnomor || ''}
                  onChange={(e) => handleTemplate7DataChange('blnnomor', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="tahunskrg7">Tahun</Label>
                <Input
                  id="tahunskrg7"
                  value={template7Data.tahunskrg || ''}
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
                  value={template7Data.tempattugas || ''}
                  onChange={(e) => handleTemplate7DataChange('tempattugas', e.target.value)}
                  placeholder="Akan terisi otomatis dari data pegawai (atau isi manual)"
                  className={template7Data.tempattugas ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="kabkota27">Kabupaten/Kota Asal</Label>
                <Select onValueChange={(value) => handleTemplate7DataChange('kabkota2', value)} value={template7Data.kabkota2 || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kabupaten/kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {KABUPATEN_KOTA_NTB.map(kota => (
                      <SelectItem key={kota} value={kota}>{kota}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="jabatnpegawai2">Jabatan Baru</Label>
                <Input
                  id="jabatnpegawai2"
                  value={template7Data.jabatnpegawai2 || ''}
                  onChange={(e) => handleTemplate7DataChange('jabatnpegawai2', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
              <div>
                <Label htmlFor="tempattugas2">Tempat Tugas Baru</Label>
                <Input
                  id="tempattugas2"
                  value={template7Data.tempattugas2 || ''}
                  onChange={(e) => handleTemplate7DataChange('tempattugas2', e.target.value)}
                  placeholder="Tempat tugas tujuan"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="kabataukotatujuan">Kabupaten/Kota Tujuan</Label>
              <Select onValueChange={(value) => handleTemplate7DataChange('kabataukotatujuan', value)} value={template7Data.kabataukotatujuan || ''}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kabupaten/kota" />
                </SelectTrigger>
                <SelectContent>
                  {KABUPATEN_KOTA_NTB.map(kota => (
                    <SelectItem key={kota} value={kota}>{kota}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  value={template8Data.nosrt || ''}
                  onChange={(e) => handleTemplate8DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno8">Bulan (Angka)</Label>
                <Input
                  id="blnno8"
                  value={template8Data.blnno || ''}
                  onChange={(e) => handleTemplate8DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno8">Tahun</Label>
                <Input
                  id="thnno8"
                  value={template8Data.thnno || ''}
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
                  value={template8Data.tempattugas || ''}
                  onChange={(e) => handleTemplate8DataChange('tempattugas', e.target.value)}
                  placeholder="Akan terisi otomatis dari data pegawai (atau isi manual)"
                  className={template8Data.tempattugas ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="jabatanbaru">Jabatan Baru</Label>
                <Input
                  id="jabatanbaru"
                  value={template8Data.jabatanbaru || ''}
                  onChange={(e) => handleTemplate8DataChange('jabatanbaru', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tempattugasbaru">Tempat Tugas Baru</Label>
              <Input
                id="tempattugasbaru"
                value={template8Data.tempattugasbaru || ''}
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
                  value={template9Data.nosrt || ''}
                  onChange={(e) => handleTemplate9DataChange('nosrt', e.target.value)}
                  placeholder="e.g., 123"
                />
              </div>
              <div>
                <Label htmlFor="blnno9">Bulan (Angka)</Label>
                <Input
                  id="blnno9"
                  value={template9Data.blnno || ''}
                  onChange={(e) => handleTemplate9DataChange('blnno', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="thnno9">Tahun</Label>
                <Input
                  id="thnno9"
                  value={template9Data.thnno || ''}
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
        const template5CombinedData = { ...baseData, ...template5Data };
        console.log('Template 5 Preview Data:', template5CombinedData);
        console.log('Template 5 tempattugas:', template5Data.tempattugas);
        console.log('Template 5 Combined tempattugas:', template5CombinedData.tempattugas);
        return (
          <Template5 
            data={template5CombinedData as Template5Data}
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
                    value={baseData.namapejabat || ''}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="NIP"
                    value={baseData.nippejabat || ''}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Pangkat/Golongan"
                    value={baseData.pangkatgolpejabat || ''}
                    placeholder="Akan terisi otomatis"
                  />
                  <AutoFilledInput
                    label="Jabatan"
                    value={baseData.jabatanpejabat || ''}
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
            {/* Data Pegawai khusus Analisis Jabatan (template2) hanya input manual unit kerja pegawai */}
            {templateId === '2' && (
              <FormSection
                title="Data Pegawai"
                description="Masukkan unit kerja yang akan dianalisis"
              >
                <div>
                  <Label htmlFor="unitkerja">Unit Kerja Pegawai</Label>
                  <Input
                    id="unitkerja"
                    value={template2Data.unitkerja || ''}
                    onChange={e => handleTemplate2DataChange('unitkerja', e.target.value)}
                    placeholder="Masukkan unit kerja pegawai"
                  />
                </div>
              </FormSection>
            )}
            {/* Data Pegawai hanya jika bukan SPTJM dan bukan Analisis Jabatan */}
            {templateId !== '9' && templateId !== '2' && (
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
                      value={baseData.namapegawai || ''}
                      placeholder="Akan terisi otomatis"
                    />
                    <AutoFilledInput
                      label="NIP"
                      value={baseData.nippegawai || ''}
                      placeholder="Akan terisi otomatis"
                    />
                    <AutoFilledInput
                      label="Pangkat/Golongan"
                      value={baseData.pangkatgolpegawai || ''}
                      placeholder="Akan terisi otomatis"
                    />
                    <AutoFilledInput
                      label="Jabatan"
                      value={baseData.jabatanpegawai || ''}
                      placeholder="Akan terisi otomatis"
                    />
                    <AutoFilledInput
                      label="Unit Kerja Pegawai"
                      value={selectedPegawai?.unit_kerja ?? ''}
                      placeholder="Akan terisi otomatis"
                    />
                    {(templateId === '3' || templateId === '7' || templateId === '8') && (
                      <AutoFilledInput
                        label="Tempat Tugas"
                        value={selectedPegawai?.tempat_tugas ?? ''}
                        placeholder="Akan terisi otomatis"
                      />
                    )}
                  </div>
                </div>
              </FormSection>
            )}

            {/* Template Specific Fields */}
            <FormSection 
              title="Detail Template" 
              description="Lengkapi informasi khusus untuk template yang dipilih"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {renderTemplateForm()}
                {/* Signature Section sekarang di dalam form */}
                <FormSection 
                  title="Tanda Tangan" 
                  description="Atur tempat dan tanggal penandatanganan"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ibukota">Tempat</Label>
                      <Input
                        id="ibukota"
                        value={baseData.ibukota || ''}
                        onChange={(e) => handleBaseDataChange('ibukota', e.target.value)}
                        placeholder="Mataram"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tanggal">Tanggal</Label>
                      <Input
                        id="tanggal"
                        type="date"
                        value={baseData.tanggal || ''}
                        onChange={(e) => handleBaseDataChange('tanggal', e.target.value)}
                      />
                    </div>
                  </div>
                </FormSection>
                <div className="pt-6">
                  <Button type="submit" className="w-full bg-teal-700 hover:bg-teal-800 text-white" disabled={saving}>
                    {saving ? 'Menyimpan...' : 'Simpan & Generate Surat'}
                  </Button>
                </div>
                {submitError && <div className="text-error mb-2">{submitError}</div>}
              </form>
            </FormSection>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="mb-4 font-semibold">Lihat hasil surat yang akan dicetak</div>
              <SuratPreviewContainer>
                {renderTemplatePreview()}
              </SuratPreviewContainer>
              <div className="flex gap-2 mt-4">
                <Button
                  className="bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2"
                  onClick={() => {
                    if (suratId) {
                      window.open(`/letters/${suratId}/preview`, '_blank');
                    } else {
                      alert('Surat belum disimpan. Simpan surat terlebih dahulu untuk membuka preview di tab baru.');
                    }
                  }}
                  type="button"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                <Button
                  className="bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2"
                  onClick={() => {
                    const w = window.open('', '', 'width=900,height=600');
                    if (w) {
                      const headLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'));
                      w.document.write('<html><head>');
                      headLinks.forEach(link => {
                        w.document.write(link.outerHTML);
                      });
                      w.document.write('</head><body style="background:#f8fafc;">');
                      const previewHTML = document.querySelector('.preview-container')?.outerHTML || '';
                      w.document.write(previewHTML);
                      w.document.write('</body></html>');
                      w.document.close();
                      w.focus();
                      setTimeout(() => w.print(), 500);
                    }
                  }}
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  Cetak
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-4xl w-full">
          <DialogTitle>Preview Surat</DialogTitle>
          <div className="mb-4">Surat berhasil disimpan. Berikut preview surat dari database:</div>
          <div className="bg-white p-4 rounded shadow max-h-[70vh] overflow-auto">
            <SuratPreviewContainer>
              {savedLetter ? (
                // Render preview by template id, pakai logic fallback nomor surat seperti di Letters.tsx
                (() => {
                  let data = savedLetter.form_data;
                  if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch { data = {}; }
                  }
                  if (!data) return <div className="text-error">Data surat tidak ditemukan</div>;
                  const id = String(savedLetter.template_id);
                  const nomorParts = (savedLetter.letter_number || '').split('/');
                  const matchNoSurat = savedLetter.letter_number?.match(/^B-([^/]+)/);
                  const fallback = {
                    nosrt: data.nosrt || (matchNoSurat ? matchNoSurat[1] : ''),
                    nosurat: data.nosurat || (matchNoSurat ? matchNoSurat[1] : ''),
                    blnno: data.blnno || nomorParts[5] || '',
                    blnnomor: data.blnnomor || nomorParts[5] || '',
                    thnno: data.thnno || nomorParts[6] || '',
                    tahunskrg: data.tahunskrg || nomorParts[6] || '',
                  };
                  const mergedData = { ...data, ...fallback };
                  if (id === '1') return <Template1 data={mergedData} />;
                  if (id === '2') return <Template2 data={mergedData} />;
                  if (id === '3') return <Template3 data={mergedData} />;
                  if (id === '4') return <Template4 data={mergedData} />;
                  if (id === '5') return <Template5 data={mergedData} />;
                  if (id === '6') return <Template6 data={mergedData} />;
                  if (id === '7') return <Template7 data={mergedData} />;
                  if (id === '8') return <Template8 data={mergedData} />;
                  if (id === '9') return <Template9 data={mergedData} />;
                  return <div className="text-error">Template tidak dikenali</div>;
                })()
              ) : (
                <div className="text-center text-muted-foreground">Memuat data surat...</div>
              )}
            </SuratPreviewContainer>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setShowSuccessModal(false)}>Tutup</Button>
            <Button onClick={() => window.open(`/letters/${suratId}/preview`, '_blank')} variant="outline">Open in New Tab</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateForm;
