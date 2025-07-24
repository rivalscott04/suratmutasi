import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, ExternalLink, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  const [selectedLetterForPreview, setSelectedLetterForPreview] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [expandedPegawai, setExpandedPegawai] = useState<string | null>(null);
  const [expandedSurat, setExpandedSurat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(sortedLetters.length / pageSize);
  const pagedLetters = sortedLetters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Group surat by pegawai, SPTJM (template 9) ke 'Tanpa Pegawai' saja
  const grouped: Record<string, any[]> = letters.reduce((acc, surat) => {
    const isSPTJM = surat.template_id === 9;
    const nama = isSPTJM ? 'Tanpa Pegawai' : (surat.namapegawai || 'Tanpa Pegawai');
    if (!acc[nama]) acc[nama] = [];
    acc[nama].push(surat);
    return acc;
  }, {});

  // Filter by search
  const filteredGrouped: [string, any[]][] = Object.entries(grouped).filter(([nama, suratList]) => {
    if (!searchTerm) return true;
    return nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suratList.some(surat => surat.letter_number.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
    // Fallback nomor surat universal (pakai regex agar tidak kosong setelah B-)
    const nomorParts = (letter.letter_number || '').split('/');
    const matchNoSurat = letter.letter_number?.match(/^B-([^/]+)/);
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

  // Tambahkan mapping singkatan jenis surat di dalam komponen
  const TEMPLATE_SHORT: { [key: number]: string } = {
    1: 'TBS',
    2: 'ANJAB',
    3: 'PM',
    4: 'SKBT',
    5: 'HD',
    6: 'PIDANA',
    7: 'PELEPASAN',
    8: 'PENERIMAAN',
    9: 'SPTJM',
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
        <h1 className="text-2xl font-bold mb-4">Riwayat Surat</h1>
        <div className="flex items-center justify-between mb-2">
          <div>
            <label htmlFor="pageSize" className="mr-2 font-medium">Tampilkan</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="ml-2">data per halaman</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Menampilkan {sortedLetters.length === 0 ? 0 : ((currentPage - 1) * pageSize + 1)}–{Math.min(currentPage * pageSize, sortedLetters.length)} dari {sortedLetters.length} surat
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">No.</th>
                <th className="px-4 py-2">Jenis Surat</th>
                <th className="px-4 py-2">Nomor Surat</th>
                <th className="px-4 py-2">Pegawai</th>
                <th className="px-4 py-2">Penandatangan</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedLetters
                .filter(surat => {
                  if (!searchTerm) return true;
                  return (
                    (surat.namapegawai || surat.recipient?.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (surat.letter_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (surat.namapejabat || surat.signing_official?.nama || '').toLowerCase().includes(searchTerm.toLowerCase())
                  );
                })
                .map((surat, idx) => (
                  <React.Fragment key={surat.id}>
                    <tr className="border-b">
                      <td className="px-4 py-2">{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td className="px-4 py-2">{TEMPLATE_SHORT[surat.template_id] || '-'}</td>
                      <td className="px-4 py-2">{surat.letter_number}</td>
                      <td className="px-4 py-2">{surat.namapegawai || surat.recipient?.nama || '-'}</td>
                      <td className="px-4 py-2">{surat.namapejabat || surat.signing_official?.nama || '-'}</td>
                      <td className="px-4 py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{surat.status}</span></td>
                      <td className="px-4 py-2">
                        <button className="text-blue-600 hover:underline" onClick={() => setExpandedSurat(expandedSurat === surat.id ? null : surat.id)}>
                          <FileText className="inline w-4 h-4 mr-1" /> {expandedSurat === surat.id ? 'Tutup' : 'Detail'}
                        </button>
                      </td>
                    </tr>
                    <tr key={surat.id + '-detail'}>
                      {/* Kolom kosong untuk No., Jenis Surat, Nomor Surat, Pegawai, Penandatangan, Status */}
                      <td colSpan={6}></td>
                      {/* Kolom Aksi */}
                      <td className="p-0">
                        <div className={`transition-all duration-300 bg-gray-50 ${expandedSurat === surat.id ? 'max-h-[200px] p-4' : 'max-h-0 p-0 overflow-hidden'}`}>
                          {expandedSurat === surat.id && (
                            <button className="text-green-600 hover:underline flex items-center" onClick={() => { setSelectedLetterForPreview(surat); setModalOpen(true); }}>
                              <Eye className="inline w-4 h-4 mr-1" /> Preview
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
        {/* Paging navigation */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}
        {/* Modal Preview Surat tetap ada */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl w-full">
            <DialogTitle>Preview Surat</DialogTitle>
            {selectedLetterForPreview && (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold mt-2">Preview Surat</div>
                  <div className="flex gap-2 mr-8 mt-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => window.open(`/letters/${selectedLetterForPreview.id}/preview`, '_blank')}
                    >
                      Open in New Tab
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => window.print()}
                    >
                      Cetak
                    </button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded shadow max-h-[70vh] overflow-auto">
                  <SuratPreviewContainer>
                    {renderPreviewByTemplate(selectedLetterForPreview)}
                  </SuratPreviewContainer>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Letters; 