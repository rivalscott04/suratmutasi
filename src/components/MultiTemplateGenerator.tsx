import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormSection } from './FormSection';
import { TemplateCard } from './TemplateCard';
import { PegawaiSearchInput } from './PegawaiSearchInput';
import { AutoFilledInput } from './AutoFilledInput';
import SuratPreviewContainer from './SuratPreviewContainer';
import { Template1 } from './templates/Template1';
import { Template2 } from './templates/Template2';
import { Template3 } from './templates/Template3';
import { Template4 } from './templates/Template4';
import { Template5 } from './templates/Template5';
import { Template6 } from './templates/Template6';
import { Template7 } from './templates/Template7';
import { Template8 } from './templates/Template8';
import { Template9 } from './templates/Template9';
import { BaseTemplateData, Template1Data, Template2Data, Template3Data, Template4Data, Template5Data, Template6Data, Template7Data, Template8Data, Template9Data, Pegawai } from '@/types/template';
import { Printer, FileText } from 'lucide-react';

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

const MultiTemplateGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedPejabat, setSelectedPejabat] = useState<Pegawai | undefined>();
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | undefined>();
  
  // Base data that applies to all templates
  const [baseData, setBaseData] = useState({
    // Office data (should be auto-populated from settings)
    kabkota: 'LOMBOK BARAT',
    jln: 'Jl. Gajah Mada No. 1 Gerung, Lombok Barat 83511',
    telfon: 'Telp. (0370) 681557',
    fax: 'Fax. (0370) 681557',
    email: 'kemenag.lombokbarat@gmail.com',
    website: 'lombokbarat.kemenag.go.id',
    
    // Pejabat data
    namapejabat: '',
    nippejabat: '',
    pangkatgolpejabat: '',
    jabatanpejabat: '',
    
    // Pegawai data
    namapegawai: '',
    nippegawai: '',
    pangkatgolpegawai: '',
    jabatanpegawai: '',
    
    // Signature data
    ibukota: 'Gerung',
    tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
  });

  // Template-specific data states
  const [template1Data, setTemplate1Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template2Data, setTemplate2Data] = useState({
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

  const [template3Data, setTemplate3Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    tempattugas: '',
    sekolah: '',
    kabkota2: '',
    tglmulai: ''
  });

  const [template4Data, setTemplate4Data] = useState({
    nosrt: '',
    blnsrt: '',
    thnskrg: '',
    unitkerja: '',
    keperluan: ''
  });

  const [template5Data, setTemplate5Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    tempattugas: ''
  });

  const [template6Data, setTemplate6Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: '',
    ukerpegawai: ''
  });

  const [template7Data, setTemplate7Data] = useState({
    nosurat: '',
    blnnomor: '',
    tahunskrg: '',
    tempattugas: '',
    tempattugaslama: '',
    tempattugasbaru: '',
    kabkota2: '',
    jabatnpegawai2: '',
    tempattugas2: '',
    kabataukotatujuan: ''
  });

  const [template8Data, setTemplate8Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    tempattugas: '',
    tempattugaslama: '',
    tempattugasbaru: '',
    jabatanbaru: '',
    kabkotaasal: '',
    kabkotujuan: ''
  });

  const [template9Data, setTemplate9Data] = useState({
    nosrt: '',
    blnno: '',
    thnno: '',
    ukerpejabat: ''
  });

  const handlePejabatSelect = (pejabat: Pegawai) => {
    setSelectedPejabat(pejabat);
    setBaseData(prev => ({
      ...prev,
      namapejabat: pejabat.nama,
      nippejabat: pejabat.nip,
      pangkatgolpejabat: pejabat.pangkat_gol,
      jabatanpejabat: pejabat.jabatan
    }));

    // Auto-populate unit kerja pejabat for templates that need it
    if (selectedTemplate === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (selectedTemplate === '5') {
      setTemplate5Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (selectedTemplate === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
    if (selectedTemplate === '9') {
      setTemplate9Data(prev => ({ ...prev, ukerpejabat: pejabat.unit_kerja }));
    }
  };

  const handlePegawaiSelect = (pegawai?: Pegawai) => {
    setSelectedPegawai(pegawai);
    if (!pegawai) {
      setBaseData(prev => ({
        ...prev,
        namapegawai: '',
        nippegawai: '',
        pangkatgolpegawai: '',
        jabatanpegawai: ''
      }));
      setTemplate1Data(prev => ({ ...prev, ukerpegawai: '' }));
      setTemplate3Data(prev => ({ ...prev, tempattugas: '' }));
      setTemplate4Data(prev => ({ ...prev, unitkerja: '' }));
      setTemplate5Data(prev => ({ ...prev, tempattugas: '' }));
      setTemplate6Data(prev => ({ ...prev, ukerpegawai: '' }));
      setTemplate7Data(prev => ({ ...prev, tempattugas: '' }));
      setTemplate8Data(prev => ({ ...prev, tempattugas: '' }));
      return;
    }
    setBaseData(prev => ({
      ...prev,
      namapegawai: pegawai.nama,
      nippegawai: pegawai.nip,
      pangkatgolpegawai: pegawai.pangkat_gol,
      jabatanpegawai: pegawai.jabatan
    }));

    // Auto-populate unit kerja pegawai or related fields for templates that need it
    if (selectedTemplate === '1') {
      setTemplate1Data(prev => ({ ...prev, ukerpegawai: pegawai.unit_kerja }));
    }
    if (selectedTemplate === '3') {
      setTemplate3Data(prev => ({ ...prev, tempattugas: pegawai.tempat_tugas }));
    }
    if (selectedTemplate === '4') {
      setTemplate4Data(prev => ({ ...prev, unitkerja: pegawai.unit_kerja }));
    }
    if (selectedTemplate === '5') {
      setTemplate5Data(prev => ({ ...prev, tempattugas: pegawai.unit_kerja }));
    }
    if (selectedTemplate === '6') {
      setTemplate6Data(prev => ({ ...prev, ukerpegawai: pegawai.unit_kerja }));
    }
    if (selectedTemplate === '7') {
      // Jangan isi tempattugas otomatis dari unit_kerja pegawai
      // Biarkan user input manual di form
    }
    if (selectedTemplate === '8') {
      // Jangan isi tempattugas otomatis dari unit_kerja pegawai
      // Biarkan user input manual di form
    }
  };

  const handleBaseDataChange = (field: keyof typeof baseData, value: string) => {
    setBaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate1DataChange = (field: keyof typeof template1Data, value: string) => {
    setTemplate1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate2DataChange = (field: keyof typeof template2Data, value: string) => {
    setTemplate2Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate3DataChange = (field: keyof typeof template3Data, value: string) => {
    setTemplate3Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate4DataChange = (field: keyof typeof template4Data, value: string) => {
    setTemplate4Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate5DataChange = (field: keyof typeof template5Data, value: string) => {
    setTemplate5Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate6DataChange = (field: keyof typeof template6Data, value: string) => {
    setTemplate6Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate7DataChange = (field: keyof typeof template7Data, value: string) => {
    setTemplate7Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate8DataChange = (field: keyof typeof template8Data, value: string) => {
    setTemplate8Data(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplate9DataChange = (field: keyof typeof template9Data, value: string) => {
    setTemplate9Data(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderTemplateForm = () => {
    switch (selectedTemplate) {
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
            <div>
              <Label htmlFor="ukerpejabat">Unit Kerja Pejabat</Label>
              <Input
                id="ukerpejabat"
                value={template1Data.ukerpejabat}
                onChange={(e) => handleTemplate1DataChange('ukerpejabat', e.target.value)}
                placeholder="Unit kerja pejabat"
              />
            </div>
            <div>
              <Label htmlFor="ukerpegawai">Unit Kerja Pegawai</Label>
              <Input
                id="ukerpegawai"
                value={template1Data.ukerpegawai}
                onChange={(e) => handleTemplate1DataChange('ukerpegawai', e.target.value)}
                placeholder="Unit kerja pegawai"
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
                <Select onValueChange={(value) => handleTemplate3DataChange('kabkota2', value)} value={template3Data.kabkota2}>
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
                <Label htmlFor="tglmulai">Tanggal Mulai Mengajar</Label>
                <Input
                  id="tglmulai"
                  type="date"
                  value={template3Data.tglmulai}
                  onChange={(e) => handleTemplate3DataChange('tglmulai', e.target.value)}
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
              {/* Hapus input Unit Kerja di sini */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ukerpejabat5">Unit Kerja Pejabat</Label>
                <Input
                  id="ukerpejabat5"
                  value={template5Data.ukerpejabat}
                  onChange={(e) => handleTemplate5DataChange('ukerpejabat', e.target.value)}
                  placeholder="Unit kerja pejabat"
                />
              </div>
              <div>
                <Label htmlFor="tempattugas5">Tempat Tugas</Label>
                <Input
                  id="tempattugas5"
                  value={template5Data.tempattugas}
                  onChange={(e) => handleTemplate5DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas pegawai"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ukerpejabat6">Unit Kerja Pejabat</Label>
                <Input
                  id="ukerpejabat6"
                  value={template6Data.ukerpejabat}
                  onChange={(e) => handleTemplate6DataChange('ukerpejabat', e.target.value)}
                  placeholder="Unit kerja pejabat"
                />
              </div>
              <div>
                <Label htmlFor="ukerpegawai6">Unit Kerja Pegawai</Label>
                <Input
                  id="ukerpegawai6"
                  value={template6Data.ukerpegawai}
                  onChange={(e) => handleTemplate6DataChange('ukerpegawai', e.target.value)}
                  placeholder="Unit kerja pegawai"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tempattugas7">Tempat Tugas</Label>
                <Input
                  id="tempattugas7"
                  value={template7Data.tempattugas}
                  onChange={(e) => handleTemplate7DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas pegawai"
                />
              </div>
              <div>
                <Label htmlFor="tempattugaslama7">Tempat Tugas Lama</Label>
                <Input
                  id="tempattugaslama7"
                  value={template7Data.tempattugaslama}
                  onChange={(e) => handleTemplate7DataChange('tempattugaslama', e.target.value)}
                  placeholder="Tempat tugas lama"
                />
              </div>
              <div>
                <Label htmlFor="tempattugasbaru7">Tempat Tugas Baru</Label>
                <Input
                  id="tempattugasbaru7"
                  value={template7Data.tempattugasbaru}
                  onChange={(e) => handleTemplate7DataChange('tempattugasbaru', e.target.value)}
                  placeholder="Tempat tugas baru"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kabkota27">Kabupaten/Kota Asal</Label>
                <Select onValueChange={(value) => handleTemplate7DataChange('kabkota2', value)} value={template7Data.kabkota2}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kabupaten/kota asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {KABUPATEN_KOTA_NTB.map(kota => (
                      <SelectItem key={kota} value={kota}>{kota}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jabatnpegawai2">Jabatan Baru</Label>
                <Input
                  id="jabatnpegawai2"
                  value={template7Data.jabatnpegawai2}
                  onChange={(e) => handleTemplate7DataChange('jabatnpegawai2', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Select onValueChange={(value) => handleTemplate7DataChange('kabataukotatujuan', value)} value={template7Data.kabataukotatujuan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kabupaten/kota tujuan" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tempattugas8">Tempat Tugas</Label>
                <Input
                  id="tempattugas8"
                  value={template8Data.tempattugas}
                  onChange={(e) => handleTemplate8DataChange('tempattugas', e.target.value)}
                  placeholder="Tempat tugas pegawai"
                />
              </div>
              <div>
                <Label htmlFor="tempattugaslama8">Tempat Tugas Lama</Label>
                <Input
                  id="tempattugaslama8"
                  value={template8Data.tempattugaslama}
                  onChange={(e) => handleTemplate8DataChange('tempattugaslama', e.target.value)}
                  placeholder="Tempat tugas lama"
                />
              </div>
              <div>
                <Label htmlFor="tempattugasbaru8">Tempat Tugas Baru</Label>
                <Input
                  id="tempattugasbaru8"
                  value={template8Data.tempattugasbaru}
                  onChange={(e) => handleTemplate8DataChange('tempattugasbaru', e.target.value)}
                  placeholder="Tempat tugas baru"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kabkotaasal8">Kabupaten/Kota Asal</Label>
                <Select onValueChange={(value) => handleTemplate8DataChange('kabkotaasal', value)} value={template8Data.kabkotaasal}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kabupaten/kota asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {KABUPATEN_KOTA_NTB.map(kota => (
                      <SelectItem key={kota} value={kota}>{kota}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jabatanbaru8">Jabatan Baru</Label>
                <Input
                  id="jabatanbaru8"
                  value={template8Data.jabatanbaru}
                  onChange={(e) => handleTemplate8DataChange('jabatanbaru', e.target.value)}
                  placeholder="Jabatan yang akan dituju"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="kabkotujuan8">Kabupaten/Kota Tujuan</Label>
              <Select onValueChange={(value) => handleTemplate8DataChange('kabkotujuan', value)} value={template8Data.kabkotujuan}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kabupaten/kota tujuan" />
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
            <div>
              <Label htmlFor="ukerpejabat9">Unit Kerja Pejabat</Label>
              <Input
                id="ukerpejabat9"
                value={template9Data.ukerpejabat}
                onChange={(e) => handleTemplate9DataChange('ukerpejabat', e.target.value)}
                placeholder="Unit kerja pejabat"
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Pilih template untuk menampilkan form input</p>
          </div>
        );
    }
  };

  const renderTemplatePreview = () => {
    switch (selectedTemplate) {
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
            <p>Pilih template untuk melihat preview</p>
          </div>
        );
    }
  };

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Generator Surat Kementerian Agama</h1>
          <p className="text-muted-foreground mt-2">
            Buat surat resmi dengan mudah menggunakan template yang tersedia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Template Selection */}
            <FormSection 
              title="Pilih Template" 
              description="Pilih jenis surat yang ingin dibuat"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    description={template.description}
                    category={template.category}
                    isSelected={selectedTemplate === template.id}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
              {selectedTemplateData && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedTemplateData.category}</Badge>
                    <span className="text-sm font-medium">Template terpilih:</span>
                    <span className="text-sm">{selectedTemplateData.title}</span>
                  </div>
                </div>
              )}
            </FormSection>

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
                </div>
              </div>
            </FormSection>

            {/* Template Specific Fields */}
            {selectedTemplate && (
              <FormSection 
                title="Detail Template" 
                description="Lengkapi informasi khusus untuk template yang dipilih"
              >
                {renderTemplateForm()}
              </FormSection>
            )}

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
                    type="date"
                    value={baseData.tanggal}
                    onChange={(e) => handleBaseDataChange('tanggal', e.target.value)}
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
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handlePrint} 
                      disabled={!selectedTemplate}
                      className="flex-1"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak Surat
                    </Button>
                  </div>
                  
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-4">
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm max-h-96 overflow-y-auto">
                        <div className="transform scale-50 origin-top-left w-[200%]">
                          {renderTemplatePreview()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </FormSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiTemplateGenerator;
