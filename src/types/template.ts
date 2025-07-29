
export interface BaseOfficeData {
  kabkota: string;
  jln: string;
  telfon: string;
  fax: string;
  email: string;
  website: string;
}

export interface BasePejabatData {
  namapejabat: string;
  nippejabat: string;
  pangkatgolpejabat: string;
  jabatanpejabat: string;
}

export interface BasePegawaiData {
  namapegawai: string;
  nippegawai: string;
  pangkatgolpegawai: string;
  jabatanpegawai: string;
}

export interface BaseSignatureData {
  ibukota: string;
  tanggal: string;
}

export interface BaseTemplateData extends BaseOfficeData, BasePejabatData, BasePegawaiData, BaseSignatureData {
  kode_kabko?: string;
}

// Template 1: Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar atau Ikatan Dinas
export interface Template1Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  ukerpejabat: string;
  ukerpegawai: string;
}

// Template 2: Surat Keterangan Analisis Jabatan dan Analisis Beban Kerja PNS
export interface Template2Data extends BaseTemplateData {
  nosurat: string;
  blnnomor: string;
  tahunskrg: string;
  unitkerja: string;
  namajabatan: string;
  bbnkerja: string;
  eksisting: string;
  kelebihan: string;
  kekurangan: string;
}

// Template 3: Surat Keterangan Pengalaman Mengajar
export interface Template3Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  tempattugas: string;
  sekolah: string;
  kabkota2: string;
  tglmulai: string;
}

// Template 4: Surat Permohonan SKBT
export interface Template4Data extends BaseTemplateData {
  nosrt: string;
  blnsrt: string;
  thnskrg: string;
  unitkerja: string;
  keperluan: string;
}

// Template 5: Surat Pernyataan Tidak Sedang Dalam Proses Hukuman Disiplin
export interface Template5Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  ukerpejabat: string;
  tempattugas: string;
}

// Template 6: Surat Pernyataan Tidak Sedang Menjalani Proses Pidana
export interface Template6Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  ukerpejabat: string;
  ukerpegawai: string;
}

// Template 7: Surat Persetujuan Pelepasan
export interface Template7Data extends BaseTemplateData {
  nosurat: string;
  blnnomor: string;
  tahunskrg: string;
  tempattugas: string;
  kabkota2: string;
  jabatanpegawai2: string;
  tempattugas2: string;
  kabataukotatujuan: string;
}

// Template 8: Surat Persetujuan Penerimaan
export interface Template8Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  tempattugas: string;
  jabatanbaru: string;
  tempattugasbaru: string;
}

// Template 9: Surat Pernyataan Tanggung Jawab Mutlak
export interface Template9Data extends BaseTemplateData {
  nosrt: string;
  blnno: string;
  thnno: string;
  ukerpejabat: string;
}

export type TemplateData = Template1Data | Template2Data | Template3Data | Template4Data | Template5Data | Template6Data | Template7Data | Template8Data | Template9Data;

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
}

export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  pangkat_gol: string;
  jabatan: string;
  unit_kerja?: string;
  tempat_tugas?: string;
}
