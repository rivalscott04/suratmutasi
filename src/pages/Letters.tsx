import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, ExternalLink, Eye, ChevronRight, Building2, Inbox, Search, Filter, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Letters: React.FC = () => {
  const { token } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'letter_number'|'template_name'|'tanggal'|'status'>('letter_number');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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

  // State untuk pagination per kantor
  const [officePaging, setOfficePaging] = useState<Record<string, { currentPage: number; pageSize: number }>>({});
  // State untuk mapping officeId -> nama kantor/kabkota
  const [officeMap, setOfficeMap] = useState<Record<string, { namakantor?: string; kabkota?: string }>>({});

  const navigate = useNavigate();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  // Filter letters berdasarkan search
  const filteredLetters = letters.filter(l =>
    l.letter_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.template_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.office?.namakantor?.toLowerCase().includes(search.toLowerCase()) ||
    l.office?.kabkota?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort letters
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

  // Group surat by office (dengan fallback mapping office_id)
  const groupedByOffice: Record<string, any[]> = sortedLetters.reduce((acc, surat) => {
    let officeName = surat.office?.namakantor || surat.office?.kabkota;
    if (!officeName && surat.office_id && officeMap[surat.office_id]) {
      officeName = officeMap[surat.office_id].namakantor || officeMap[surat.office_id].kabkota;
    }
    if (!officeName) officeName = 'Kantor Tidak Diketahui';
    if (!acc[officeName]) acc[officeName] = [];
    acc[officeName].push(surat);
    return acc;
  }, {});

  // Filter grouped by search
  const filteredGrouped: [string, any[]][] = Object.entries(groupedByOffice).filter(([officeName, suratList]) => {
    if (!searchTerm) return true;
    return officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suratList.some(surat => surat.letter_number.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet('/api/letters', token)
      .then(res => setLetters(res.letters || []))
      .catch((err) => {
        if (err.message && (err.message.includes('Invalid or expired token') || err.message.includes('401'))) {
          setShowSessionExpiredModal(true);
        } else {
          setError('Gagal mengambil data surat');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch offices saat mount
  useEffect(() => {
    if (!token) return;
    apiGet('/api/offices', token)
      .then(res => {
        const map: Record<string, { namakantor?: string; kabkota?: string }> = {};
        (res.offices || []).forEach((office: any) => {
          map[office.id] = { namakantor: office.namakantor, kabkota: office.kabkota };
        });
        setOfficeMap(map);
      })
      .catch(() => {});
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
    if (status === 'signed') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Draft</Badge>;
  };

  const handleShowPegawaiLetters = async (nip: string, letterId: string) => {
    if (selectedPegawaiNip === nip && selectedLetterId === letterId) {
      setSelectedPegawaiNip(null);
      setSelectedLetterId(null);
      setPegawaiLetters([]);
      return;
    }
    setSelectedPegawaiNip(nip);
    setSelectedLetterId(letterId);
    try {
      const res = await apiGet(`/api/letters?recipient_employee_nip=${nip}`, token);
      setPegawaiLetters(res.letters || []);
    } catch (err) {
      toast({ title: 'Gagal mengambil data surat pegawai', description: 'Terjadi kesalahan saat mengambil data', variant: 'destructive' });
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

  const handleGeneratePdf = async (letterId: string) => {
    setPdfLoading(true);
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

  // Helper untuk update paging per kantor
  const setOfficePage = (officeName: string, page: number) => {
    setOfficePaging(prev => ({
      ...prev,
      [officeName]: {
        ...(prev[officeName] || { currentPage: 1, pageSize: 10 }),
        currentPage: page,
      },
    }));
  };
  const setOfficePageSize = (officeName: string, size: number) => {
    setOfficePaging(prev => ({
      ...prev,
      [officeName]: {
        ...(prev[officeName] || { currentPage: 1, pageSize: 10 }),
        pageSize: size,
        currentPage: 1,
      },
    }));
  };

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
          <Inbox className="w-12 h-12 text-green-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">0</span>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Surat</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Riwayat surat masih kosong. Mulai buat surat pertama Anda untuk melihat data di sini.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/generator">
            <FileText className="w-4 h-4 mr-2" />
            Buat Surat Baru
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <Search className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Surat</h1>
            <p className="text-gray-600 mt-1">Kelola dan pantau semua surat yang telah dibuat</p>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/generator">
              <FileText className="w-4 h-4 mr-2" />
              Buat Surat Baru
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari surat, nomor surat, atau kantor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter_number">Nomor Surat</SelectItem>
                <SelectItem value="template_name">Template</SelectItem>
                <SelectItem value="tanggal">Tanggal</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Surat</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated</p>
                <p className="text-2xl font-bold text-green-600">{byStatus('generated')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Printer className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{byStatus('draft')}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Template Terpopuler</p>
                <p className="text-lg font-bold text-gray-900">{mostTemplate}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {letters.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Surat Berdasarkan Kantor ({Object.keys(groupedByOffice).length} Kantor)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredGrouped.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Hasil</h3>
                <p className="text-gray-600">Coba ubah kata kunci pencarian Anda</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredGrouped.map(([officeName, officeLetters], officeIndex) => {
                  // Paging state per kantor
                  const paging = officePaging[officeName] || { currentPage: 1, pageSize: 10 };
                  const totalPages = Math.ceil(officeLetters.length / paging.pageSize);
                  const pagedLetters = officeLetters.slice((paging.currentPage - 1) * paging.pageSize, paging.currentPage * paging.pageSize);
                  return (
                    <AccordionItem key={officeIndex} value={`office-${officeIndex}`} className="border rounded-lg">
                      <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900">{officeName}</h3>
                              <p className="text-sm text-gray-600">{officeLetters.length} surat</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{officeLetters.length}</Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <label htmlFor={`pageSize-${officeIndex}`} className="text-sm">Tampilkan</label>
                            <select
                              id={`pageSize-${officeIndex}`}
                              value={paging.pageSize}
                              onChange={e => setOfficePageSize(officeName, Number(e.target.value))}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size}</option>
                              ))}
                            </select>
                            <span className="text-sm">data per halaman</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Menampilkan {officeLetters.length === 0 ? 0 : ((paging.currentPage - 1) * paging.pageSize + 1)}–{Math.min(paging.currentPage * paging.pageSize, officeLetters.length)} dari {officeLetters.length} surat
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Nomor Surat</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Pegawai</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {pagedLetters.map((letter, idx) => {
                                let parsedFormData = letter.form_data;
                                if (typeof parsedFormData === 'string') {
                                  try {
                                    parsedFormData = JSON.parse(parsedFormData);
                                  } catch {
                                    parsedFormData = {};
                                  }
                                }
                                return (
                                  <TableRow key={letter.id}>
                                    <TableCell>{(paging.currentPage - 1) * paging.pageSize + idx + 1}</TableCell>
                                    <TableCell className="font-mono text-sm">{letter.letter_number}</TableCell>
                                    <TableCell>{letter.template_name}</TableCell>
                                    <TableCell>
                                      {letter.template_id === 9 ? (
                                        <span className="text-gray-500">Tanpa Pegawai</span>
                                      ) : (
                                        <div>
                                          <div className="font-medium">{parsedFormData.namapegawai}</div>
                                          <div className="text-sm text-gray-500">{letter.recipient_employee_nip}</div>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>{parsedFormData.tanggal || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(letter.status)}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedLetterForPreview(letter);
                                            setModalOpen(true);
                                          }}
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                        {/* Pagination per kantor */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => setOfficePage(officeName, Math.max(1, paging.currentPage - 1))} disabled={paging.currentPage === 1}>Prev</Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <Button
                                key={page}
                                size="sm"
                                variant={page === paging.currentPage ? 'default' : 'outline'}
                                onClick={() => setOfficePage(officeName, page)}
                              >
                                {page}
                              </Button>
                            ))}
                            <Button size="sm" variant="outline" onClick={() => setOfficePage(officeName, Math.min(totalPages, paging.currentPage + 1))} disabled={paging.currentPage === totalPages}>Next</Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <DialogTitle>Preview Surat</DialogTitle>
            {selectedLetterForPreview && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open(`/letters/${selectedLetterForPreview.id}/preview`, '_blank')}
              >
                Open in New Tab
              </Button>
            )}
          </div>
          {selectedLetterForPreview && (
            <div className="mt-4">
              {renderPreviewByTemplate(selectedLetterForPreview)}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Expired Modal */}
      {showSessionExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <Lock className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Sesi Berakhir</h2>
            <p className="text-gray-600 mb-6 text-center">Sesi Anda telah habis. Silakan login kembali untuk melanjutkan.</p>
            <button
              className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={() => {
                localStorage.removeItem('token');
                setShowSessionExpiredModal(false);
                navigate('/login', { replace: true });
              }}
            >
              Login Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Letters; 