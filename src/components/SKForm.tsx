import { useState, useRef } from "react";
import { FileText, Printer, Save, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PegawaiSearchInput } from "@/components/PegawaiSearchInput";
import { Pegawai } from "@/types/template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const personSchema = z.object({
  nama: z.string().min(1, "Nama harus diisi"),
  nip: z.string().min(1, "NIP harus diisi"),
  pangkat: z.string().min(1, "Pangkat harus diisi"),
  jabatan: z.string().min(1, "Jabatan harus diisi"),
  unitKerja: z.string().min(1, "Unit kerja harus diisi"),
  keterangan: z.string(),
});

const formSchema = z.object({
  nomor: z.string().min(1, "Nomor surat harus diisi"),
  tentang: z.string().min(1, "Tentang harus diisi"),
  signatureName: z.string().min(1, "Nama penandatangan harus diisi"),
  person: personSchema,
});

// Sub-section: blok tanda tangan yang diratakan ke kanan
function SignatureSection({ signatureName, signatureNip }: { signatureName: string; signatureNip: string }) {
  return (
    <div className="mt-3" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'left', width: '5.3in', fontSize: '9.5pt', fontFamily: 'Bookman Old Style, serif' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '135px 1fr', rowGap: '0.5rem', fontSize: '9.5pt', marginLeft: '25px' }}>
          <div></div>
          <div>Ditetapkan di Mataram</div>

          <div></div>
          <div>Pada tanggal {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>

          <div style={{ marginLeft: '100px' }}className="font-bold" >a.n.</div>
          <div className="font-bold">MENTERI AGAMA</div>

          <div></div>
          <div className="font-bold">KEPALA KANTOR WILAYAH KEMENTERIAN AGAMA</div>

          <div></div>
          <div className="font-bold">PROVINSI NUSA TENGGARA BARAT</div>

          <div style={{ gridColumn: '1 / span 2', height: '3.5rem' }}></div>

          <div></div>
          <div className="font-bold">{signatureName}</div>

          <div></div>
          <div className="font-bold">NIP. {signatureNip}</div>
        </div>
      </div>
    </div>
  );
}

// Component untuk konten surat keputusan mutasi
function SKMutasiContent({ formData }: any) {
  return (
    <div className="bg-white px-12 pt-1 pb-6 max-w-none w-full" style={{fontFamily: 'Bookman Old Style, serif', fontSize: '9.5pt', lineHeight: '1.2', width: '8.5in', minHeight: '14in'}}>
      {/* Header dengan logo */}
      <div className="text-center mb-1" style={{lineHeight: '1.0'}}>
        <div className="flex justify-center items-center mb-1">
          <img
            src="/img/kemenag.png"
            alt="Logo Kemenag"
            style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block' }}
          />
        </div>
        <div className="font-bold uppercase" style={{fontSize: '11pt', lineHeight: '1.0'}}>
          <div>KEPUTUSAN MENTERI AGAMA REPUBLIK INDONESIA</div>
          <div>NOMOR : {formData.nomor || ''}</div>
        </div>
        <div className="mt-1 font-bold" style={{fontSize: '10.5pt', lineHeight: '1.0'}}>
          <div>MUTASI PEGAWAI NEGERI SIPIL</div>
          <div>DENGAN RAHMAT TUHAN YANG MAHA ESA</div>
        </div>
        <div className="mt-1 text-center" style={{lineHeight: '1.0'}}>
          <div className="font-bold" style={{fontSize: '11pt'}}>MENTERI AGAMA</div>
        </div>
      </div>

      {/* Menimbang */}
      <div className="mb-2 text-left">
        <table className="w-full">
          <tbody>
            <tr className="align-top">
              <td className="font pr-2" style={{width: '120px'}}>Menimbang</td>
              <td className="pr-2">:</td>
              <td className="font pr-2" style={{width: '20px'}}>a.</td>
              <td className="text-justify">bahwa dalam rangka meningkatkan efektivitas organisasi serta meningkatkan efektivitas pelaksanaan tugas dan fungsi kelembagaan, maka dipandang perlu dilakukan mutasi Pegawai Negeri Sipil;</td>
            </tr>
            <tr className="align-top">
              <td></td>
              <td></td>
              <td className="font pr-2">b.</td>
              <td className="text-justify">bahwa Pegawai Negeri Sipil tersebut dalam keputusan ini dipandang mampu dan memiliki syarat untuk melaksanakan tugas pada jabatan yang akan diduduki;</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mengingat */}
      <div className="mb-2 text-left">
        <table className="w-full">
          <tbody>
            <tr className="align-top">
              <td className="font pr-2" style={{width: '120px'}}>Mengingat</td>
              <td className="pr-2">:</td>
              <td className="font pr-2" style={{width: '20px'}}>1.</td>
              <td className="text-justify">Undang - Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara;</td>
            </tr>
            <tr className="align-top">
              <td></td>
              <td></td>
              <td className="font pr-2">2.</td>
              <td className="text-justify">Peraturan Pemerintah Nomor 17 Tahun 2020 tentang Perubahan Atas Peraturan Pemerintah Nomor 11 Tahun 2017 tentang Manajemen Pegawai Negeri Sipil;</td>
            </tr>
            <tr className="align-top">
              <td></td>
              <td></td>
              <td className="font pr-2">3.</td>
              <td className="text-justify">Peraturan Menteri Agama Republik Indonesia Nomor 1 Tahun 2022 tentang Pemberian Kuasa Kepada Pejabat Pimpinan Tinggi Madya di Lingkungan Kementerian Agama untuk melaksanakan sebagian kewenangan di bidang kepegawaian;</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Memperhatikan */}
      <div className="mb-2 text-left">
        <table className="w-full">
          <tbody>
            <tr className="align-top">
              <td className="font pr-2" style={{width: '120px'}}>Memperhatikan</td>
              <td className="pr-2">:</td>
              <td className="font pr-2" style={{width: '20px'}}>1.</td>
              <td className="text-justify">Surat Pernyataan Kepala Kantor Wilayah Kementerian Agama Provinsi NTB dan dokumen pendukung terkait.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* MEMUTUSKAN */}
      <div className="mb-2 text-left">
        <div className="text-center font-bold mt-1 mb-1" style={{fontSize: '11pt'}}>MEMUTUSKAN :</div>
        
        <table className="w-full">
          <tbody>
            <tr className="align-top">
              <td className="font pr-2" style={{width: '120px'}}>Menetapkan</td>
              <td className="pr-2">:</td>
              <td></td>
            </tr>
            <tr className="align-top">
              <td className="font pr-2">KESATU</td>
              <td className="pr-2">:</td>
              <td className="text-justify">
                Pegawai Negeri Sipil tersebut di bawah ini :
                <div className="mt-2">
                  <table className="w-full">
                    <tbody>
                      <tr className="align-top">
                        <td className="pr-2" style={{width: '20px'}}>1.</td>
                        <td className="pr-2" style={{width: '200px'}}>Nama</td>
                        <td className="pr-2">:</td>
                        <td>{formData.person.nama || 'nama'}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-2">2.</td>
                        <td className="pr-2">NIP</td>
                        <td className="pr-2">:</td>
                        <td>{formData.person.nip || 'nip'}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-2">3.</td>
                        <td className="pr-2">Pangkat / Golongan Ruang</td>
                        <td className="pr-2">:</td>
                        <td>{formData.person.pangkat || 'golongan'}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-2">4.</td>
                        <td className="pr-2">Jabatan</td>
                        <td className="pr-2">:</td>
                        <td>{formData.person.jabatan || 'jabatan'}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-2">5.</td>
                        <td className="pr-2">Unit Kerja</td>
                        <td className="pr-2">:</td>
                        <td>Kantor Wilayah Kementerian Agama Provinsi Nusa Tenggara Barat</td>
                      </tr>
                    </tbody>
                  </table>
                  {formData.person?.keterangan && (
                    <div className="mt-2 text-justify">{formData.person.keterangan}</div>
                  )}
                </div>
              </td>
            </tr>
            <tr className="align-top">
              <td className="font pr-2">KEDUA</td>
              <td className="pr-2">:</td>
              <td className="text-justify">
                Kepada yang bersangkutan diberikan tunjangan jabatan sesuai dengan ketentuan peraturan perundang-undangan.
              </td>
            </tr>
            <tr className="align-top">
              <td className="font pr-2">KETIGA</td>
              <td className="pr-2">:</td>
              <td className="text-justify">
                Apabila di kemudian hari ternyata terdapat kekeliruan dalam keputusan ini, akan diadakan perbaikan dan perhitungan kembali sebagaimana mestinya.
              </td>
            </tr>
            <tr className="align-top">
              <td className="font pr-2">KEEMPAT</td>
              <td className="pr-2">:</td>
              <td className="text-justify">
                ASLI Keputusan ini disampaikan kepada Pegawai Negeri Sipil yang bersangkutan untuk diketahui dan dipergunakan sebagaimana mestinya.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <SignatureSection signatureName={formData.signatureName} signatureNip={formData.signatureNip || ''} />

      {/* Tembusan */}
      <div className="mt-6 text-left">
        <div className="font-bold mb-1">Tembusan :</div>
        <div className="ml-4">
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>1. Sekretaris Jenderal u.p. Kepala Biro SDM Kementerian Agama;</div>
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>2. Inspektur Jenderal Kementerian Agama RI Jakarta;</div>
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>3. Kepala Kantor Regional X BKN Denpasar;</div>
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>4. Kepala Kantor Kementerian Agama Kabupaten/Kota Negara Mataram;</div>
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>5. Kepala Kantor PT. Taspen Cabang Mataram;</div>
          <div className="mb-1" style={{textIndent: '-1.5rem', paddingLeft: '1.5rem'}}>6. Pegawai Penerima Emeritus.</div>
        </div>
      </div>
    </div>
  );
}

export default function SKMutasi() {
  const [formData, setFormData] = useState<any>({
    nomor: "",
    tentang: "MUTASI PEGAWAI NEGERI SIPIL",
    person: {
      nama: "HADI ROHANA MUSTAFAWI",
      nip: "198103052012032004",
      pangkat: "Penata Muda Tk.I / III c",
      jabatan: "Pengadministrasi Perkantoran (Jabatan Pelaksana) pada KUA Kecamatan Keruak Kabupaten Lombok Timur",
      unitKerja: "KUA Kecamatan Keruak",
      keterangan: ""
    },
    memperhatikan: {
      suratBaikNo: "",
      suratBaikTanggal: "",
      suratHukdisNo: "",
      suratHukdisTanggal: "",
      suratDiperhatikanNo: "",
      suratDiperhatikanTanggal: "",
      skbtTanggal: ""
    },
    memutuskan: {
      pertama: "",
      kedua: "",
      ketiga: ""
    },
    useTTE: false,
    anchorSymbol: "caret",
    signatureName: "H. ZAMRONI AZIZ, S.HI, MH.",
    signatureNip: "",
  });

  const [showToast, setShowToast] = useState(false);

  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePejabatSelect = (pegawai?: Pegawai) => {
    setFormData((prev: any) => ({
      ...prev,
      signatureName: pegawai?.nama || '',
      signatureNip: pegawai?.nip || '',
    }));
  };

  const handlePegawaiSelect = (pegawai?: Pegawai) => {
    setFormData((prev: any) => ({
      ...prev,
      person: {
        ...prev.person,
        nama: pegawai?.nama || '',
        nip: pegawai?.nip || '',
        pangkat: (pegawai as any)?.pangkat_gol || (pegawai as any)?.golongan || prev.person.pangkat,
        jabatan: (pegawai as any)?.jabatan || prev.person.jabatan,
        unitKerja: (pegawai as any)?.unit_kerja || prev.person.unitKerja,
      }
    }));
  };

  const formatLetterNumberWithData = (userNumber: string) => userNumber;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = `
      <div style="font-family: 'Arial, sans-serif'; font-size: 12pt;">
        ${printContents}
      </div>
    `;

    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const validateForm = () => {
    try {
      formSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors;
        const errorMessage = errors.map(e => e.message).join(", ");
        toast({
          title: "Form tidak lengkap",
          description: errorMessage,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    setShowToast(true);
    
    toast({
      title: "Berhasil",
      description: "Surat Keputusan Mutasi berhasil dibuat dan disimpan",
    });
  };

  const closeToast = () => {
    setShowToast(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SK Mutasi Generator</h1>
          <Link to="/archive">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <BookMarked className="w-4 h-4 mr-2" />
              Lihat Arsip
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pejabat Penandatangan</h3>
                <PegawaiSearchInput
                  label="Cari Pejabat Penandatangan"
                  placeholder="Masukkan nama atau NIP pejabat..."
                  onSelect={handlePejabatSelect}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pegawai yang Ditetapkan</h3>
                <PegawaiSearchInput
                  label="Cari Pegawai yang Ditetapkan"
                  placeholder="Masukkan nama atau NIP pegawai..."
                  onSelect={handlePegawaiSelect}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Surat</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomor">Nomor Surat</Label>
                    <Input 
                      id="nomor"
                      value={formData.nomor} 
                      onChange={(e) => setFormData((p: any) => ({ ...p, nomor: e.target.value }))} 
                      placeholder="Nomor surat" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tentang">Tentang</Label>
                    <Input 
                      id="tentang"
                      value={formData.tentang} 
                      onChange={(e) => setFormData((p: any) => ({ ...p, tentang: e.target.value }))} 
                      placeholder="Tentang" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Memperhatikan</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="suratBaikNo">No. Surat Pernyataan (Baik)</Label>
                      <Input 
                        id="suratBaikNo"
                        value={formData.memperhatikan.suratBaikNo} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratBaikNo: e.target.value } }))} 
                        placeholder="Nomor surat" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suratBaikTanggal">Tgl. Surat Pernyataan (Baik)</Label>
                      <Input 
                        id="suratBaikTanggal"
                        value={formData.memperhatikan.suratBaikTanggal} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratBaikTanggal: e.target.value } }))} 
                        placeholder="contoh: 12 Januari 2025" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suratHukdisNo">No. Surat Pernyataan (Hukdis)</Label>
                      <Input 
                        id="suratHukdisNo"
                        value={formData.memperhatikan.suratHukdisNo} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratHukdisNo: e.target.value } }))} 
                        placeholder="Nomor surat" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suratHukdisTanggal">Tgl. Surat Pernyataan (Hukdis)</Label>
                      <Input 
                        id="suratHukdisTanggal"
                        value={formData.memperhatikan.suratHukdisTanggal} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratHukdisTanggal: e.target.value } }))} 
                        placeholder="contoh: 12 Januari 2025" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suratDiperhatikanNo">No. Surat Diperhatikan</Label>
                      <Input 
                        id="suratDiperhatikanNo"
                        value={formData.memperhatikan.suratDiperhatikanNo} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratDiperhatikanNo: e.target.value } }))} 
                        placeholder="Nomor surat" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="suratDiperhatikanTanggal">Tgl. Surat Diperhatikan</Label>
                      <Input 
                        id="suratDiperhatikanTanggal"
                        value={formData.memperhatikan.suratDiperhatikanTanggal} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, suratDiperhatikanTanggal: e.target.value } }))} 
                        placeholder="contoh: 12 Januari 2025" 
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="skbtTanggal">Tgl. SKBT</Label>
                      <Input 
                        id="skbtTanggal"
                        value={formData.memperhatikan.skbtTanggal} 
                        onChange={(e) => setFormData((p: any) => ({ ...p, memperhatikan: { ...p.memperhatikan, skbtTanggal: e.target.value } }))} 
                        placeholder="contoh: 12 Januari 2025" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Preview SK Mutasi</h2>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button 
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak
                </Button>
              </div>
            </div>

            <div ref={printRef}>
              <SKMutasiContent formData={formData} />
            </div>
          </div>
        </div>
      </div>

      {/* Toast sederhana via useToast sudah cukup; komponen CenteredToast tidak tersedia di codebase */}
    </div>
  );
}