import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NavigationBar from '@/components/NavigationBar';
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

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error || !letter) return <div className="flex flex-col items-center justify-center min-h-screen"><div className="text-error mb-4">{error || 'Surat tidak ditemukan'}</div><Link to="/dashboard" className="btn btn-primary">Kembali ke Dashboard</Link></div>;

  const renderPreviewByTemplate = (letter: any) => {
    const id = String(letter.template_id);
    const data = letter.form_data;
    if (!data) return <div className="text-error">Data surat tidak ditemukan</div>;
    if (id === '1') return <Template1 data={data} />;
    if (id === '2') return <Template2 data={data} />;
    if (id === '3') return <Template3 data={data} />;
    if (id === '4') return <Template4 data={data} />;
    if (id === '5') return <Template5 data={data} />;
    if (id === '6') return <Template6 data={data} />;
    if (id === '7') return <Template7 data={data} />;
    if (id === '8') return <Template8 data={data} />;
    if (id === '9') return <Template9 data={data} />;
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

  return (
    <>
      <NavigationBar />
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
              <div><span className="font-semibold">Tanggal:</span> {letter.form_data?.tanggal}</div>
              <div><span className="font-semibold">Template:</span> {letter.template_name}</div>
              <div><span className="font-semibold">Status:</span> <Badge>{letter.status}</Badge></div>
              <div><span className="font-semibold">Pegawai:</span> {letter.form_data?.namapegawai} ({letter.recipient_employee_nip})</div>
              <div><span className="font-semibold">Pejabat Penandatangan:</span> {letter.form_data?.namapejabat} ({letter.signing_official_nip})</div>
              <div><span className="font-semibold">Unit Kerja Pegawai:</span> {letter.form_data?.unitkerja || letter.form_data?.ukerpegawai}</div>
              <div><span className="font-semibold">Jabatan Pegawai:</span> {letter.form_data?.jabatanpegawai}</div>
              <div><span className="font-semibold">Pangkat/Golongan Pegawai:</span> {letter.form_data?.pangkatgolpegawai}</div>
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
              <table className="table w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>No.</th>
                    <th>Nomor Surat</th>
                    <th>Template</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pegawaiLetters.length === 0 ? (
                    <tr><td colSpan={7} className="text-center">Tidak ada surat lain</td></tr>
                  ) : (
                    pegawaiLetters.map((l, i) => (
                      <tr key={l.id} className={l.id === letter.id ? 'bg-green-50 font-semibold' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedBatch.includes(l.id)}
                            onChange={e => {
                              if (e.target.checked) setSelectedBatch([...selectedBatch, l.id]);
                              else setSelectedBatch(selectedBatch.filter(id => id !== l.id));
                            }}
                          />
                        </td>
                        <td>{i + 1}</td>
                        <td>{l.letter_number}</td>
                        <td>{l.template_name}</td>
                        <td>{l.form_data?.tanggal}</td>
                        <td><Badge>{l.status}</Badge></td>
                        <td>
                          {l.id !== letter.id && (
                            <Link to={`/letters/${l.id}`} className="btn btn-xs btn-outline">Lihat</Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LetterDetail; 