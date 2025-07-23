import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
import SuratPreviewContainer from '@/components/SuratPreviewContainer';

const Letters: React.FC = () => {
  const { token } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'letter_number'|'template_name'|'tanggal'|'status'>('letter_number');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const filteredLetters = letters.filter(l =>
    l.letter_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.template_name?.toLowerCase().includes(search.toLowerCase())
  );
  const sortedLetters = [...filteredLetters].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'tanggal') {
      aVal = a.form_data?.tanggal || '';
      bVal = b.form_data?.tanggal || '';
    }
    if (sortDir === 'asc') return String(aVal).localeCompare(String(bVal));
    return String(bVal).localeCompare(String(aVal));
  });

  const { toast } = useToast();
  const [selectedPegawaiNip, setSelectedPegawaiNip] = useState<string | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [pegawaiLetters, setPegawaiLetters] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLetterForPreview, setSelectedLetterForPreview] = useState<any | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet('/api/letters', token)
      .then(res => setLetters(res.letters || []))
      .catch(() => setError('Gagal mengambil data surat'))
      .finally(() => setLoading(false));
  }, [token]);

  // Ringkasan
  const total = letters.length;
  const byStatus = (status: string) => letters.filter(l => l.status === status).length;
  const templateCount: Record<string, number> = {};
  letters.forEach(l => {
    if (l.template_name) templateCount[l.template_name] = (templateCount[l.template_name] || 0) + 1;
  });
  const mostTemplate = Object.entries(templateCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Helper badge status
  const getStatusBadge = (status: string) => {
    if (status === 'generated') return <Badge className="bg-green-100 text-green-700 border-green-200">Generated</Badge>;
    if (status === 'draft') return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Draft</Badge>;
    if (status === 'signed') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
  };

  // Fetch surat pegawai saat NIP dipilih
  const handleShowPegawaiLetters = async (nip: string, letterId: string) => {
    setSelectedPegawaiNip(nip);
    setSelectedLetterId(letterId);
    setModalOpen(false);
    setSelectedLetterForPreview(null);
    setPdfUrl(null);
    setPdfLoading(false);
    if (!token) return;
    try {
      const res = await apiGet(`/api/letters?recipient_employee_nip=${nip}`, token);
      setPegawaiLetters(res.letters || []);
    } catch {
      setPegawaiLetters([]);
    }
  };

  // Render preview surat sesuai template
  const renderPreviewByTemplate = (letter: any) => {
    let data = letter.form_data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = {}; }
    }
    if (!data) return <div className="text-error">Data surat tidak ditemukan</div>;
    const id = String(letter.template_id);
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

  // Generate PDF handler
  const handleGeneratePdf = async (letterId: string) => {
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const res = await apiPost(`/api/letters/${letterId}/generate-pdf`, {}, token);
      setPdfUrl(res.file?.file_path || res.file_path);
      toast({ title: 'PDF berhasil digenerate', description: 'Klik link untuk mengunduh.' });
    } catch (err: any) {
      toast({ title: 'Gagal generate PDF', description: err.message || 'Terjadi kesalahan', variant: 'destructive' });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Surat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Surat Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{byStatus('generated')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Template Terbanyak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="w-5 h-5 text-green-700" /> {mostTemplate}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Surat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <input
                type="text"
                className="input input-bordered w-full md:w-64"
                placeholder="Cari nomor atau template..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div>Loading surat...</div>
            ) : error ? (
              <div className="text-error">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Nomor Surat</TableHead>
                      <TableHead>Nama Pegawai</TableHead>
                      <TableHead>Penandatangan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLetters.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center">Tidak ada surat</TableCell></TableRow>
                    ) : (
                      sortedLetters.map((l, i) => {
                        let namaPegawai = l.recipient?.nama;
                        let namaPejabat = l.signing_official?.nama;
                        if (!namaPegawai || !namaPejabat) {
                          let fd = l.form_data;
                          if (typeof fd === 'string') {
                            try { fd = JSON.parse(fd); } catch { fd = {}; }
                          }
                          namaPegawai = namaPegawai || fd.namapegawai;
                          namaPejabat = namaPejabat || fd.namapejabat;
                        }
                        return (
                          <TableRow key={l.id}>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{l.letter_number}</TableCell>
                            <TableCell>{namaPegawai || '-'}</TableCell>
                            <TableCell>{namaPejabat || '-'}</TableCell>
                            <TableCell>{getStatusBadge(l.status)}</TableCell>
                            <TableCell>
                              {/* Tombol Detail dengan Dropdown */}
                              <div className="relative inline-block text-left">
                                <Button size="sm" variant="outline" onClick={async (e) => {
                                  e.preventDefault();
                                  // Ambil NIP pegawai dari relasi atau form_data
                                  let nip = l.recipient?.nip;
                                  if (!nip) {
                                    let fd = l.form_data;
                                    if (typeof fd === 'string') {
                                      try { fd = JSON.parse(fd); } catch { fd = {}; }
                                    }
                                    nip = fd.nippegawai;
                                  }
                                  if (nip) await handleShowPegawaiLetters(nip, l.id);
                                }}>
                                  <FileText className="w-4 h-4" /> Detail
                                </Button>
                                {/* Dropdown surat pegawai */}
                                {selectedPegawaiNip && selectedLetterId === l.id && pegawaiLetters.length > 0 && (
                                  <div className="absolute z-20 mt-2 w-72 bg-white border border-gray-200 rounded shadow-lg">
                                    <div className="max-h-60 overflow-y-auto">
                                      {pegawaiLetters.map((srt: any) => (
                                        <button
                                          key={srt.id}
                                          className="w-full text-left px-4 py-2 hover:bg-green-50 border-b last:border-b-0"
                                          onClick={() => {
                                            setSelectedLetterForPreview(srt);
                                            setModalOpen(true);
                                            setPdfUrl(null);
                                          }}
                                        >
                                          <div className="font-semibold">{srt.letter_number}</div>
                                          <div className="text-xs text-gray-500">{typeof srt.form_data === 'string' ? (() => { try { return JSON.parse(srt.form_data).tanggal } catch { return '-' } })() : srt.form_data?.tanggal}</div>
                                          <div className="text-xs text-gray-500">{srt.template_name}</div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Modal Preview Surat */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl w-full">
          {selectedLetterForPreview && (
            <div className="space-y-4">
              <div className="font-bold text-lg mb-2">Preview Surat</div>
              <div className="overflow-auto max-h-[60vh] min-h-[200px]">
                <SuratPreviewContainer>
                  {renderPreviewByTemplate(selectedLetterForPreview)}
                </SuratPreviewContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                  onClick={() => handleGeneratePdf(selectedLetterForPreview.id)}
                  disabled={pdfLoading}
                >
                  <FileText className="w-4 h-4" />
                  {pdfLoading ? 'Membuat PDF...' : 'Generate PDF'}
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                  onClick={() => {
                    const previewDiv = document.getElementById('modal-preview-scroll');
                    const printContents = previewDiv?.outerHTML;
                    const printWindow = window.open('', '', 'width=900,height=600');
                    if (printWindow && printContents) {
                      printWindow.document.write('<html><head><title>Print Surat</title>');
                      printWindow.document.write('<link rel="stylesheet" href="/src/App.css" />');
                      printWindow.document.write('</head><body>' + printContents + '</body></html>');
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 500);
                    }
                  }}
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  Cetak
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                  onClick={() => {
                    if (selectedLetterForPreview?.id) {
                      window.open(`/letters/${selectedLetterForPreview.id}/preview`, '_blank');
                    }
                  }}
                  type="button"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 text-sm font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4" /> Download PDF
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Letters; 