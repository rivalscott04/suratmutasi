import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft } from 'lucide-react';
import { Template1 } from '@/components/templates/Template1';
import { Template2 } from '@/components/templates/Template2';
import { Template3 } from '@/components/templates/Template3';
import { Template4 } from '@/components/templates/Template4';
import { Template5 } from '@/components/templates/Template5';
import { Template6 } from '@/components/templates/Template6';
import { Template7 } from '@/components/templates/Template7';
import { Template8 } from '@/components/templates/Template8';
import { Template9 } from '@/components/templates/Template9';
import { apiPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SuratPreviewContainer from '@/components/SuratPreviewContainer';
import { Skeleton } from '@/components/ui/skeleton';

const LetterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [letter, setLetter] = useState<any>(null);
  const [pegawaiLetters, setPegawaiLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    apiGet(`/api/letters/${id}`, token)
      .then(res => {
        setLetter(res.letter);
        if (res.letter?.recipient_employee_nip) {
          apiGet(`/api/letters?recipient_employee_nip=${res.letter.recipient_employee_nip}`, token)
            .then(r2 => setPegawaiLetters(r2.letters || []));
        }
      })
      .catch(() => setError('Surat tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96 w-full mt-8" /></div>;
  if (error || !letter) return <div className="flex flex-col items-center justify-center min-h-screen"><div className="text-error mb-4">{error || 'Surat tidak ditemukan'}</div><Link to="/dashboard" className="btn btn-primary">Kembali ke Dashboard</Link></div>;

  // Parse form_data jika string
  let parsedFormData = letter.form_data;
  if (typeof parsedFormData === 'string') {
    try {
      parsedFormData = JSON.parse(parsedFormData);
    } catch {
      parsedFormData = {};
    }
  }

  const renderPreviewByTemplate = (letter: any) => {
    let data = letter.form_data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        data = {};
      }
    }
    // Gabungkan data dengan office dan kode_kabko
    data = {
      ...data,
      office: letter.office,
      kode_kabko: letter.office?.kode_kabko || data.kode_kabko,
      letter_number: letter.letter_number
    };
    if (!data) return <div className="text-error">Data surat tidak ditemukan</div>;
    if (String(letter.template_id) === '1') return <SuratPreviewContainer><Template1 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '2') return <SuratPreviewContainer><Template2 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '3') return <SuratPreviewContainer><Template3 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '4') return <SuratPreviewContainer><Template4 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '5') return <SuratPreviewContainer><Template5 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '6') return <SuratPreviewContainer><Template6 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '7') return <SuratPreviewContainer><Template7 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '8') return <SuratPreviewContainer><Template8 data={data} /></SuratPreviewContainer>;
    if (String(letter.template_id) === '9') return <SuratPreviewContainer><Template9 data={data} /></SuratPreviewContainer>;
    return <div className="text-error">Template tidak dikenali</div>;
  };

  const handleBatchGeneratePDF = async () => {
    if (!token) return;
    if (selectedBatch.length === 0) return;
    toast({ title: 'Memulai generate PDF batch...', description: `${selectedBatch.length} surat diproses.` });
    let success = 0, fail = 0;
    for (const sid of selectedBatch) {
      try {
        await apiPost(`/api/letters/${sid}/generate-pdf`, {}, token);
        success++;
      } catch {
        fail++;
      }
    }
    toast({ title: 'Batch PDF selesai', description: `${success} sukses, ${fail} gagal.` });
    setSelectedBatch([]);
  };

  // Filter surat pegawai hanya yang NIP-nya sama
  const filteredPegawaiLetters = pegawaiLetters.filter(l => l.recipient_employee_nip === letter.recipient_employee_nip);

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center space-x-2 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-1" /> Kembali</Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6 text-green-700" /> Detail Surat</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info Surat */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Surat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><span className="font-semibold">Nomor Surat:</span> {letter.letter_number}</div>
              <div><span className="font-semibold">Tanggal:</span> {parsedFormData.tanggal}</div>
              <div><span className="font-semibold">Template:</span> {letter.template_name}</div>
              <div><span className="font-semibold">Status:</span> <Badge>{letter.status}</Badge></div>
              <div><span className="font-semibold">Pegawai:</span> {parsedFormData.namapegawai} ({letter.recipient_employee_nip})</div>
              <div><span className="font-semibold">Pejabat Penandatangan:</span> {parsedFormData.namapejabat} ({letter.signing_official_nip})</div>
              <div><span className="font-semibold">Unit Kerja Pegawai:</span> {parsedFormData.unitkerja || parsedFormData.ukerpegawai}</div>
              <div><span className="font-semibold">Jabatan Pegawai:</span> {parsedFormData.jabatanpegawai}</div>
              <div><span className="font-semibold">Pangkat/Golongan Pegawai:</span> {parsedFormData.pangkatgolpegawai}</div>
              {/* Tombol Generate PDF */}
              <div className="pt-4">
                <Button onClick={async () => {
                  await apiPost(`/api/letters/${letter.id}/generate-pdf`, {}, token);
                  toast({ title: 'PDF berhasil digenerate', description: 'Silakan cek file surat.' });
                }}>
                  Generate PDF
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Preview Surat */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Surat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[500px]">
                {renderPreviewByTemplate(letter)}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Tabel Surat Pegawai */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Surat Pegawai Ini</CardTitle>
            {selectedBatch.length > 0 && (
              <Button className="mt-2" onClick={handleBatchGeneratePDF}>
                Generate PDF Batch ({selectedBatch.length})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>No.</TableHead>
                    <TableHead>Nomor Surat</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPegawaiLetters.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center">Tidak ada surat lain</TableCell></TableRow>
                  ) : (
                    filteredPegawaiLetters.map((l, i) => (
                      <TableRow key={l.id} className={l.id === letter.id ? 'bg-green-50 font-semibold' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedBatch.includes(l.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedBatch([...selectedBatch, l.id]);
                              else setSelectedBatch(selectedBatch.filter(id => id !== l.id));
                            }}
                          />
                        </TableCell>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{l.letter_number}</TableCell>
                        <TableCell>{l.template_name}</TableCell>
                        <TableCell>{typeof l.form_data === 'string' ? (() => { try { return JSON.parse(l.form_data).tanggal } catch { return '-' } })() : l.form_data?.tanggal}</TableCell>
                        <TableCell><Badge>{l.status}</Badge></TableCell>
                        <TableCell>
                          {l.id !== letter.id && (
                            <Link to={`/letters/${l.id}`} className="btn btn-xs btn-outline">Lihat</Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LetterDetail; 