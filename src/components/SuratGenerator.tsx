import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SuratData {
  // Header Info
  kabkota: string;
  jln: string;
  telfon: string;
  fax: string;
  email: string;
  website: string;
  
  // Nomor Surat
  nosrt: string;
  blnno: string;
  thnno: string;
  
  // Data Pejabat
  namapejabat: string;
  nippejabat: string;
  pangkatgolpejabat: string;
  jabatanpejabat: string;
  ukerpejabat: string;
  
  // Data Pegawai
  namapegawai: string;
  nippegawai: string;
  pangkatgolpegawai: string;
  jabatanpegawai: string;
  ukerpegawai: string;
  
  // Signature
  ibukota: string;
  tanggal: string;
}

const SuratGenerator: React.FC = () => {
  const [suratData, setSuratData] = useState<SuratData>({
    // Header Info
    kabkota: '',
    jln: '',
    telfon: '',
    fax: '',
    email: '',
    website: '',
    
    // Nomor Surat
    nosrt: '',
    blnno: '',
    thnno: '',
    
    // Data Pejabat
    namapejabat: '',
    nippejabat: '',
    pangkatgolpejabat: '',
    jabatanpejabat: '',
    ukerpejabat: '',
    
    // Data Pegawai
    namapegawai: '',
    nippegawai: '',
    pangkatgolpegawai: '',
    jabatanpegawai: '',
    ukerpegawai: '',
    
    // Signature
    ibukota: '',
    tanggal: ''
  });

  const handleInputChange = (field: keyof SuratData, value: string) => {
    setSuratData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSuratPreview = () => {
    return (
      <div className="letter-body">
        <section className="sheet">
          {/* Header - EXACT COPY FROM HTML */}
          <div className="header">
            <img src={import.meta.env.BASE_URL + 'logo-kemenag.png'} alt="Logo Kementerian Agama" className="logo" />
            <div className="header-content">
              <div className="header-text">
                KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
                <span className="sub-header">KANTOR KEMENTERIAN AGAMA {suratData.kabkota.toUpperCase()}</span>
              </div>
              <div className="header-info">
                {suratData.jln}<br />
                {suratData.telfon}<br />
                {suratData.fax} {suratData.email}<br />
                {suratData.website}
              </div>
            </div>
          </div>

          <div className="content-wrapper">
            {/* Title - EXACT COPY FROM HTML */}
            <div className="title">
              <strong>SURAT PERNYATAAN</strong><br />
              <strong>TIDAK SEDANG MENJALANI TUGAS BELAJAR ATAU IKATAN DINAS</strong>
            </div>

            {/* Nomor Surat - EXACT COPY FROM HTML */}
            <div className="nomor">
              Nomor : B-{suratData.nosrt}/Kk.18.08/1/Kp.07.6/{suratData.blnno}/{suratData.thnno}
            </div>

            {/* Content - EXACT COPY FROM HTML */}
            <div className="content">
              <div className="intro">
                Yang bertanda tangan di bawah ini :
              </div>

              {/* Data Pejabat - EXACT COPY FROM HTML */}
              <div className="data-table">
                <div className="data-row">
                  <div className="data-label">Nama</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.namapejabat}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">NIP</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.nippejabat}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Pangkat/Gol.Ruang</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.pangkatgolpejabat}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Jabatan</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.jabatanpejabat}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Unit/Satuan Kerja</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.ukerpejabat}</div>
                </div>
              </div>

              <div className="section-title">
                Menyatakan bahwa :
              </div>

              {/* Data Pegawai - EXACT COPY FROM HTML */}
              <div className="data-table">
                <div className="data-row">
                  <div className="data-label">Nama</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.namapegawai}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">NIP</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.nippegawai}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Pangkat/Gol.Ruang</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.pangkatgolpegawai}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Jabatan</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.jabatanpegawai}</div>
                </div>
                <div className="data-row">
                  <div className="data-label">Unit/Satuan Kerja</div>
                  <div className="data-colon">:</div>
                  <div className="data-value">{suratData.ukerpegawai}</div>
                </div>
              </div>

              <p>
                Memang benar bahwa yang bersangkutan tidak sedang menjalani tugas belajar atau ikatan dinas.
              </p>

              <p>
                Demikian pernyataan ini dibuat dengan sesungguhnya untuk dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature - EXACT COPY FROM HTML */}
            <div className="signature-section">
              <div className="signature-place">
                {suratData.ibukota}, {suratData.tanggal}
              </div>
              <div>
                Kepala,
              </div>
              <div style={{ height: '60px' }}></div>
              <div className="signature-name">
                {suratData.namapejabat}
              </div>
              <div className="signature-nip">
                NIP. {suratData.nippejabat}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Generator Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar atau Ikatan Dinas
        </h1>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2 no-print">
            <TabsTrigger value="form">Form Input</TabsTrigger>
            <TabsTrigger value="preview">Preview Surat</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="no-print">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Informasi Kantor */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Kantor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="kabkota">Kabupaten/Kota</Label>
                    <Input
                      id="kabkota"
                      value={suratData.kabkota}
                      onChange={(e) => handleInputChange('kabkota', e.target.value)}
                      placeholder="e.g., LOMBOK BARAT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jln">Alamat</Label>
                    <Input
                      id="jln"
                      value={suratData.jln}
                      onChange={(e) => handleInputChange('jln', e.target.value)}
                      placeholder="Jalan dan alamat lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telfon">Telepon</Label>
                    <Input
                      id="telfon"
                      value={suratData.telfon}
                      onChange={(e) => handleInputChange('telfon', e.target.value)}
                      placeholder="Nomor telepon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      value={suratData.fax}
                      onChange={(e) => handleInputChange('fax', e.target.value)}
                      placeholder="Nomor fax"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={suratData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email kantor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={suratData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="Website kantor"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Nomor Surat */}
              <Card>
                <CardHeader>
                  <CardTitle>Nomor Surat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nosrt">Nomor Surat</Label>
                    <Input
                      id="nosrt"
                      value={suratData.nosrt}
                      onChange={(e) => handleInputChange('nosrt', e.target.value)}
                      placeholder="e.g., 123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="blnno">Bulan (Angka)</Label>
                    <Input
                      id="blnno"
                      value={suratData.blnno}
                      onChange={(e) => handleInputChange('blnno', e.target.value)}
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thnno">Tahun</Label>
                    <Input
                      id="thnno"
                      value={suratData.thnno}
                      onChange={(e) => handleInputChange('thnno', e.target.value)}
                      placeholder="e.g., 2024"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Pejabat */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Pejabat Penandatangan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="namapejabat">Nama Pejabat</Label>
                    <Input
                      id="namapejabat"
                      value={suratData.namapejabat}
                      onChange={(e) => handleInputChange('namapejabat', e.target.value)}
                      placeholder="Nama lengkap pejabat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nippejabat">NIP Pejabat</Label>
                    <Input
                      id="nippejabat"
                      value={suratData.nippejabat}
                      onChange={(e) => handleInputChange('nippejabat', e.target.value)}
                      placeholder="NIP pejabat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pangkatgolpejabat">Pangkat/Gol.Ruang Pejabat</Label>
                    <Input
                      id="pangkatgolpejabat"
                      value={suratData.pangkatgolpejabat}
                      onChange={(e) => handleInputChange('pangkatgolpejabat', e.target.value)}
                      placeholder="Pangkat dan golongan pejabat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jabatanpejabat">Jabatan Pejabat</Label>
                    <Input
                      id="jabatanpejabat"
                      value={suratData.jabatanpejabat}
                      onChange={(e) => handleInputChange('jabatanpejabat', e.target.value)}
                      placeholder="Jabatan pejabat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ukerpejabat">Unit/Satuan Kerja Pejabat</Label>
                    <Input
                      id="ukerpejabat"
                      value={suratData.ukerpejabat}
                      onChange={(e) => handleInputChange('ukerpejabat', e.target.value)}
                      placeholder="Unit kerja pejabat"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Pegawai */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Pegawai yang Dinyatakan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="namapegawai">Nama Pegawai</Label>
                    <Input
                      id="namapegawai"
                      value={suratData.namapegawai}
                      onChange={(e) => handleInputChange('namapegawai', e.target.value)}
                      placeholder="Nama lengkap pegawai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nippegawai">NIP Pegawai</Label>
                    <Input
                      id="nippegawai"
                      value={suratData.nippegawai}
                      onChange={(e) => handleInputChange('nippegawai', e.target.value)}
                      placeholder="NIP pegawai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pangkatgolpegawai">Pangkat/Gol.Ruang Pegawai</Label>
                    <Input
                      id="pangkatgolpegawai"
                      value={suratData.pangkatgolpegawai}
                      onChange={(e) => handleInputChange('pangkatgolpegawai', e.target.value)}
                      placeholder="Pangkat dan golongan pegawai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jabatanpegawai">Jabatan Pegawai</Label>
                    <Input
                      id="jabatanpegawai"
                      value={suratData.jabatanpegawai}
                      onChange={(e) => handleInputChange('jabatanpegawai', e.target.value)}
                      placeholder="Jabatan pegawai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ukerpegawai">Unit/Satuan Kerja Pegawai</Label>
                    <Input
                      id="ukerpegawai"
                      value={suratData.ukerpegawai}
                      onChange={(e) => handleInputChange('ukerpegawai', e.target.value)}
                      placeholder="Unit kerja pegawai"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tanda Tangan */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tanda Tangan</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ibukota">Tempat</Label>
                    <Input
                      id="ibukota"
                      value={suratData.ibukota}
                      onChange={(e) => handleInputChange('ibukota', e.target.value)}
                      placeholder="e.g., Mataram"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tanggal">Tanggal</Label>
                    <Input
                      id="tanggal"
                      type="date"
                      value={suratData.tanggal}
                      onChange={(e) => handleInputChange('tanggal', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-4">
              <div className="flex gap-4 no-print">
                <Button onClick={handlePrint} className="print:hidden">
                  Cetak Surat
                </Button>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                {renderSuratPreview()}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuratGenerator;