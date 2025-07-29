import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiDelete, apiPut } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Printer, ExternalLink, Eye, ChevronRight, Building2, Inbox, Search, Filter, Lock, Trash2, RefreshCw, Users, ClipboardList, Info, Edit3, X } from 'lucide-react';
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
import { PegawaiSearchInput } from '@/components/PegawaiSearchInput';

const Letters: React.FC = () => {
  const { token, user } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'letter_number'|'template_name'|'tanggal'|'status'>('letter_number');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<'all'|'with-employee'|'without-employee'>('all');
  
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

  // State untuk pagination per kantor
  const [officePaging, setOfficePaging] = useState<Record<string, { currentPage: number; pageSize: number }>>({});
  // State untuk mapping officeId -> nama kantor/kabkota
  const [officeMap, setOfficeMap] = useState<Record<string, { namakantor?: string; kabkota?: string }>>({});

  // Tambahkan state untuk modal edit pejabat & pegawai
  const [editLetter, setEditLetter] = useState<any>(null);
  const [editPejabat, setEditPejabat] = useState<any>(null);
  const [editPegawai, setEditPegawai] = useState<any>(null);
  const [editSaving, setEditSaving] = useState(false);

  const navigate = useNavigate();
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Bulk selection state
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Filter letters berdasarkan search
  const filteredLetters = letters.filter(l =>
    l.letter_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.template_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.office?.namakantor?.toLowerCase().includes(search.toLowerCase()) ||
    l.office?.kabkota?.toLowerCase().includes(search.toLowerCase())
  );

  // Filter letters berdasarkan tab
  const getFilteredLettersByTab = () => {
    switch (activeTab) {
      case 'with-employee':
        return filteredLetters.filter(l => ![2, 9].includes(l.template_id));
      case 'without-employee':
        return filteredLetters.filter(l => [2, 9].includes(l.template_id));
      default:
        return filteredLetters;
    }
  };

  const tabFilteredLetters = getFilteredLettersByTab();

  // Sort letters
  const sortedLetters = [...tabFilteredLetters].sort((a, b) => {
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
    if (!search) return true;
    return officeName.toLowerCase().includes(search.toLowerCase()) ||
      suratList.some(surat => surat.letter_number.toLowerCase().includes(search.toLowerCase()));
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
  const byStatus = (status: string) => letters.filter(l => l.status === status).length;
  const total = letters.length;
  const mostTemplate = letters.length > 0 ? 
    letters.reduce((acc, l) => {
      acc[l.template_name] = (acc[l.template_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) : {};
  const mostTemplateName = Object.keys(mostTemplate).length > 0 ? 
    Object.entries(mostTemplate).sort(([,a], [,b]) => (b as number) - (a as number))[0][0] : 'Tidak ada data';
  
  // Find most recent letter
  const getMostRecentLetter = () => {
    if (letters.length === 0) return null;
    return letters.reduce((latest, current) => {
      const latestDate = new Date(latest.created_at || 0);
      const currentDate = new Date(current.created_at || 0);
      return currentDate > latestDate ? current : latest;
    });
  };
  
  const mostRecentLetter = getMostRecentLetter();
  const getMostRecentOffice = () => {
    if (!mostRecentLetter) return 'Tidak ada data';
    
    // Get office name from kode_kabko
    const getOfficeNameFromKode = (kode: string) => {
      const officeMap: Record<string, string> = {
        '01': 'KOTA MATARAM',
        '02': 'KABUPATEN LOMBOK BARAT',
        '03': 'KABUPATEN LOMBOK TENGAH',
        '04': 'KABUPATEN LOMBOK TIMUR',
        '05': 'KABUPATEN SUMBAWA',
        '06': 'KABUPATEN DOMPU',
        '07': 'KOTA MATARAM',
        '08': 'KABUPATEN BIMA',
        '09': 'KOTA BIMA',
        '10': 'KABUPATEN SUMBAWA BARAT',
        '11': 'KABUPATEN LOMBOK UTARA',
        '12': 'KABUPATEN LOMBOK TENGAH',
        '13': 'KABUPATEN LOMBOK TIMUR',
        '14': 'KABUPATEN SUMBAWA',
        '15': 'KABUPATEN DOMPU',
        '16': 'KABUPATEN BIMA',
        '17': 'KOTA BIMA',
        '18': 'KABUPATEN SUMBAWA BARAT',
        '19': 'KABUPATEN LOMBOK UTARA',
        '20': 'KABUPATEN LOMBOK TENGAH'
      };
      return officeMap[kode] || 'Kantor Tidak Diketahui';
    };
    
    const officeName = mostRecentLetter.office?.namakantor || 
                      mostRecentLetter.office?.kabkota || 
                      getOfficeNameFromKode(mostRecentLetter.form_data?.kode_kabko || mostRecentLetter.office?.kode_kabko || '') ||
                      'Kantor Tidak Diketahui';
    
    const timeAgo = mostRecentLetter.created_at ? 
      new Date(mostRecentLetter.created_at).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) : 'Tidak diketahui';
    return `${officeName} (${timeAgo})`;
  };

  // Helper badge status
  const getStatusBadge = (status: string) => {
    if (status === 'generated') return <Badge className="bg-green-100 text-green-700 border-green-200">Generated</Badge>;
    if (status === 'signed') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>;
    return null; // Hilangkan badge Draft
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
    
    // Ensure unitkerja is preserved for Template 2
    if (letter.template_id === 2 && data.unitkerja) {
      mergedData.unitkerja = data.unitkerja;
    }
    
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

  const handleDeleteLetter = async (letter: any) => {
    // Check if user can delete this letter
    const canDelete = user?.role === 'admin' || letter.created_by === user?.id;
    
    if (!canDelete) {
      toast({ 
        title: 'Tidak dapat menghapus surat', 
        description: 'Anda hanya dapat menghapus surat yang Anda buat sendiri.',
        variant: 'destructive'
      });
      return;
    }
    
    setLetterToDelete(letter);
    setShowDeleteModal(true);
  };

  // Fungsi untuk handle edit
  const handleEditPejabatPegawai = (letter: any) => {
    setEditLetter(letter);
    setEditPejabat(null);
    setEditPegawai(null);
  };

  // Fungsi untuk simpan perubahan
  const handleSaveEditPejabatPegawai = async () => {
    if (!editLetter || !editPejabat) return;
    // Untuk template 2 dan 9, tidak perlu pegawai
    if (editLetter.template_id !== 2 && editLetter.template_id !== 9 && !editPegawai) return;
    setEditSaving(true);
    try {
      // Ambil data surat yang ada
      const currentFormData = editLetter.form_data;
      const templateId = editLetter.template_id;
      
      // Update data sesuai kebutuhan template
      const updatedFormData = {
        ...currentFormData,
        // Update data pejabat (selalu ada untuk semua template)
        namapejabat: editPejabat.nama || '',
        nippejabat: editPejabat.nip || '',
        pangkatgolpejabat: editPejabat.pangkat_gol || '',
        jabatanpejabat: editPejabat.jabatan || '',
      };

      // Update data pegawai sesuai template (kecuali template 2 & 9)
      if (templateId !== 2 && templateId !== 9 && editPegawai) {
        updatedFormData.namapegawai = editPegawai.nama || '';
        updatedFormData.nippegawai = editPegawai.nip || '';
        updatedFormData.pangkatgolpegawai = editPegawai.pangkat_gol || '';
        updatedFormData.jabatanpegawai = editPegawai.jabatan || '';
      }
      
      // Untuk template 2 dan 9, hapus field pegawai jika ada
      if (templateId === 2 || templateId === 9) {
        delete updatedFormData.namapegawai;
        delete updatedFormData.nippegawai;
        delete updatedFormData.pangkatgolpegawai;
        delete updatedFormData.jabatanpegawai;
        delete updatedFormData.ukerpegawai;
      }

             // Update field spesifik sesuai template
       switch (templateId) {
         case 1: // Template 1: Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar
           updatedFormData.ukerpejabat = editPejabat.unit_kerja || '';
           if (editPegawai) updatedFormData.ukerpegawai = editPegawai.unit_kerja || '';
           break;
         
         case 2: // Template 2: Surat Keterangan Analisis Jabatan (tanpa pegawai)
           // Template 2 tidak memerlukan update field pegawai
           break;
         
         case 3: // Template 3: Surat Keterangan Pengalaman Mengajar
           if (editPegawai) updatedFormData.tempattugas = editPegawai.tempat_tugas || '';
           break;
         
         case 4: // Template 4: Surat Permohonan SKBT
           if (editPegawai) updatedFormData.unitkerja = editPegawai.unit_kerja || '';
           break;
         
         case 5: // Template 5: Surat Pernyataan Tidak Sedang Dalam Proses Hukuman Disiplin
           updatedFormData.ukerpejabat = editPejabat.unit_kerja || '';
           if (editPegawai) updatedFormData.tempattugas = editPegawai.tempat_tugas || '';
           break;
         
         case 6: // Template 6: Surat Pernyataan Tidak Sedang Menjalani Proses Pidana
           updatedFormData.ukerpejabat = editPejabat.unit_kerja || '';
           if (editPegawai) updatedFormData.ukerpegawai = editPegawai.unit_kerja || '';
           break;
         
         case 7: // Template 7: Surat Persetujuan Pelepasan
           if (editPegawai) updatedFormData.tempattugas = editPegawai.tempat_tugas || '';
           break;
         
         case 8: // Template 8: Surat Keterangan Jabatan Baru
           if (editPegawai) updatedFormData.tempattugas = editPegawai.tempat_tugas || '';
           break;
         
         case 9: // Template 9: Surat Pernyataan (tanpa pegawai)
           updatedFormData.ukerpejabat = editPejabat.unit_kerja || '';
           break;
       }

      // Kirim update ke backend
      await apiPut(`/api/letters/${editLetter.id}`, {
        form_data: updatedFormData
      }, token);

      // Refresh data
      await refreshData();
      
      // Reset state
      setEditLetter(null);
      setEditPejabat(null);
      setEditPegawai(null);
      
      // Show success message
      toast({
        title: "Berhasil",
        description: "Data pejabat dan pegawai berhasil diperbarui",
      });
    } catch (error) {
      console.error('Error updating letter:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data surat",
        variant: "destructive",
      });
    } finally {
      setEditSaving(false);
    }
  };

  // Bulk selection functions
  const handleSelectLetter = (letterId: string, checked: boolean) => {
    if (checked) {
      setSelectedLetters(prev => [...prev, letterId]);
    } else {
      setSelectedLetters(prev => prev.filter(id => id !== letterId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Get all letters from all visible offices that user can delete
      const allVisibleLetters = filteredGrouped.flatMap(([officeName, officeLetters]) => officeLetters);
      const deletableLetters = allVisibleLetters.filter(letter => 
        user?.role === 'admin' || letter.created_by === user?.id
      );
      setSelectedLetters(deletableLetters.map(letter => letter.id));
    } else {
      setSelectedLetters([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedLetters.length === 0) {
      toast({ 
        title: 'Tidak ada surat dipilih', 
        description: 'Pilih surat yang akan dihapus terlebih dahulu.',
        variant: 'destructive'
      });
      return;
    }
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      // Delete letters one by one
      for (const letterId of selectedLetters) {
        await apiDelete(`/api/letters/${letterId}`, token);
      }
      
      toast({ 
        title: 'Surat berhasil dihapus', 
        description: `${selectedLetters.length} surat telah dihapus dari sistem.`,
        duration: 3000
      });
      
      // Reset selection
      setSelectedLetters([]);
      setSelectAll(false);
      setShowBulkDeleteModal(false);
      
      // Refresh data
      await refreshData();
      
      // Reset pagination state
      setOfficePaging({});
      
      // Reset search jika ada
      if (search) {
        setSearch('');
      }
    } catch (err: any) {
      toast({ 
        title: 'Gagal menghapus surat', 
        description: err.message || 'Terjadi kesalahan', 
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/letters', token);
      setLetters(res.letters || []);
    } catch (err: any) {
      setError('Gagal mengambil data surat');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!letterToDelete) return;
    
    setDeleting(true);
    try {
      await apiDelete(`/api/letters/${letterToDelete.id}`, token);
      
      toast({ 
        title: 'Surat berhasil dihapus', 
        description: 'Surat telah dihapus dari sistem.',
        duration: 3000
      });
      
      // Refresh data
      await refreshData();
      
      // Reset pagination state
      setOfficePaging({});
      
      // Reset search jika ada
      if (search) {
        setSearch('');
      }
      
      setShowDeleteModal(false);
      setLetterToDelete(null);
    } catch (err: any) {
      toast({ 
        title: 'Gagal menghapus surat', 
        description: err.message || 'Terjadi kesalahan', 
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setDeleting(false);
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
        <Button variant="outline" onClick={refreshData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh Data'}
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
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Coba Lagi'}
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            {tabFilteredLetters.length > 0 && (() => {
              const deletableLettersCount = tabFilteredLetters.filter(letter => 
                user?.role === 'admin' || letter.created_by === user?.id
              ).length;
              return deletableLettersCount > 0 ? (
                <Button
                  variant={selectAll ? "destructive" : "outline"}
                  onClick={() => handleSelectAll(!selectAll)}
                  className={selectAll ? "bg-red-600 hover:bg-red-700" : "border-blue-200 text-blue-700 hover:bg-blue-50"}
                >
                  {selectAll ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Batal Pilih Semua
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Pilih Semua ({deletableLettersCount})
                    </>
                  )}
                </Button>
              ) : null;
            })()}
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link to="/generator">
                <FileText className="w-4 h-4 mr-2" />
                Buat Surat Baru
              </Link>
            </Button>
          </div>
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

      {/* Bulk Selection UI */}
      {selectedLetters.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{selectedLetters.length}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    {selectedLetters.length} surat dipilih
                  </h3>
                  <p className="text-sm text-blue-700">
                    Siap untuk dihapus
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLetters([]);
                  setSelectAll(false);
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Batal Pilih
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus {selectedLetters.length} Surat
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Bulk Delete */}
      {selectedLetters.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 shadow-lg rounded-full w-16 h-16"
            >
              <Trash2 className="w-6 h-6" />
            </Button>
            <div className="bg-white rounded-full px-3 py-1 shadow-lg text-sm font-medium text-gray-700">
              {selectedLetters.length} surat
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-1">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Semua Surat
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {filteredLetters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('with-employee')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'with-employee'
                  ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Surat dengan Pegawai
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {filteredLetters.filter(l => ![2, 9].includes(l.template_id)).length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('without-employee')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'without-employee'
                  ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Analisis & Pernyataan
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {filteredLetters.filter(l => [2, 9].includes(l.template_id)).length}
              </span>
            </button>
          </nav>
        </div>
        
        {/* Tab Description */}
        <div className="mt-3 text-sm text-gray-600">
          {activeTab === 'all' && (
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-500" />
              Menampilkan semua surat yang telah dibuat dalam sistem
            </div>
          )}
          {activeTab === 'with-employee' && (
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2 text-green-500" />
              Surat yang memerlukan data pegawai tertentu (Template 1, 3-8)
            </div>
          )}
          {activeTab === 'without-employee' && (
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2 text-orange-500" />
              Surat analisis jabatan dan pernyataan (Template 2 & 9)
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Surat Terbaru</p>
                <p className="text-lg font-bold text-gray-900">{mostRecentLetter ? `${mostRecentLetter.letter_number} - ${getMostRecentOffice()}` : 'Tidak ada data'}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-teal-600" />
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
              {activeTab === 'all' && `Surat Berdasarkan Kantor (${Object.keys(groupedByOffice).length} Kantor)`}
              {activeTab === 'with-employee' && `Surat dengan Pegawai (${Object.keys(groupedByOffice).length} Kantor)`}
              {activeTab === 'without-employee' && `Surat Analisis & Pernyataan (${Object.keys(groupedByOffice).length} Kantor)`}
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
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="w-12">
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const allVisibleLetters = filteredGrouped.flatMap(([officeName, officeLetters]) => officeLetters);
                                      const deletableLettersCount = allVisibleLetters.filter(letter => 
                                        user?.role === 'admin' || letter.created_by === user?.id
                                      ).length;
                                      return (
                                        <>
                                          <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            disabled={deletableLettersCount === 0}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                                          />
                                          {selectedLetters.length > 0 && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                              {selectedLetters.length}
                                            </span>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </TableHead>
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
                                
                                // Check if user can delete this letter
                                const canDelete = user?.role === 'admin' || letter.created_by === user?.id;
                                const isSelected = selectedLetters.includes(letter.id);
                                
                                return (
                                  <TableRow 
                                    key={letter.id}
                                    className={isSelected ? 'bg-blue-50 border-blue-200' : ''}
                                  >
                                    <TableCell>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => handleSelectLetter(letter.id, e.target.checked)}
                                        disabled={!canDelete}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                                      />
                                    </TableCell>
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
                                        {(user?.role === 'admin' || letter.created_by === user?.id) && letter.template_id !== 2 && letter.template_id !== 9 && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditPejabatPegawai(letter)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Pejabat & Pegawai
                                          </Button>
                                        )}
                                        {(user?.role === 'admin' || letter.created_by === user?.id) && (letter.template_id === 2 || letter.template_id === 9) && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditPejabatPegawai(letter)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          >
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit Pejabat
                                          </Button>
                                        )}
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDeleteLetter(letter)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Hapus Surat</h2>
            <p className="text-gray-600 mb-6 text-center">
              Apakah Anda yakin ingin menghapus surat <strong>{letterToDelete?.letter_number}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setLetterToDelete(null);
                }}
                disabled={deleting}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Hapus Surat</h2>
            <p className="text-gray-600 mb-6 text-center">
              Apakah Anda yakin ingin menghapus {selectedLetters.length} surat yang dipilih? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkDeleteModal(false);
                  setSelectedLetters([]);
                  setSelectAll(false);
                }}
                disabled={bulkDeleting}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {bulkDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}

             {/* Edit Pejabat & Pegawai Modal */}
       {editLetter && (
         <Dialog open={!!editLetter} onOpenChange={v => { if (!v) setEditLetter(null); }}>
           <DialogContent className="max-w-2xl">
             <DialogTitle>
               {editLetter.template_id === 2 || editLetter.template_id === 9 
                 ? 'Edit Pejabat' 
                 : 'Edit Pejabat & Pegawai'
               }
             </DialogTitle>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Search Section */}
               <div className="space-y-4">
                 <div>
                   <PegawaiSearchInput
                     label="Cari Pejabat"
                     placeholder="Masukkan nama atau NIP pejabat..."
                     onSelect={setEditPejabat}
                     selectedPegawai={editPejabat}
                   />
                 </div>
                 
                 {(editLetter.template_id !== 2 && editLetter.template_id !== 9) && (
                   <div>
                     <PegawaiSearchInput
                       label="Cari Pegawai"
                       placeholder="Masukkan nama atau NIP pegawai..."
                       onSelect={setEditPegawai}
                       selectedPegawai={editPegawai}
                     />
                   </div>
                 )}
               </div>
               
               {/* Preview Section */}
               <div className="space-y-4">
                 {/* Preview Pejabat */}
                 {editPejabat && (
                   <div className="border rounded-lg p-4 bg-blue-50">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-blue-900 flex items-center">
                         <Users className="w-4 h-4 mr-2" />
                         Preview Pejabat
                       </h4>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setEditPejabat(null)}
                         className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                       >
                         <X className="w-3 h-3" />
                       </Button>
                     </div>
                     <div className="space-y-1 text-sm">
                       <div><span className="font-medium">Nama:</span> {editPejabat.nama}</div>
                       <div><span className="font-medium">NIP:</span> {editPejabat.nip}</div>
                       <div><span className="font-medium">Pangkat/Gol:</span> {editPejabat.pangkat_gol}</div>
                       <div><span className="font-medium">Jabatan:</span> {editPejabat.jabatan}</div>
                       <div><span className="font-medium">Unit Kerja:</span> {editPejabat.unit_kerja}</div>
                     </div>
                   </div>
                 )}
                 
                 {/* Preview Pegawai */}
                 {editPegawai && (editLetter.template_id !== 2 && editLetter.template_id !== 9) && (
                   <div className="border rounded-lg p-4 bg-green-50">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold text-green-900 flex items-center">
                         <Users className="w-4 h-4 mr-2" />
                         Preview Pegawai
                       </h4>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => setEditPegawai(null)}
                         className="text-green-600 hover:text-green-700 hover:bg-green-100"
                       >
                         <X className="w-3 h-3" />
                       </Button>
                     </div>
                     <div className="space-y-1 text-sm">
                       <div><span className="font-medium">Nama:</span> {editPegawai.nama}</div>
                       <div><span className="font-medium">NIP:</span> {editPegawai.nip}</div>
                       <div><span className="font-medium">Pangkat/Gol:</span> {editPegawai.pangkat_gol}</div>
                       <div><span className="font-medium">Jabatan:</span> {editPegawai.jabatan}</div>
                       <div><span className="font-medium">Unit Kerja:</span> {editPegawai.unit_kerja}</div>
                       {editPegawai.tempat_tugas && (
                         <div><span className="font-medium">Tempat Tugas:</span> {editPegawai.tempat_tugas}</div>
                       )}
                     </div>
                   </div>
                 )}
                 
                 {/* Empty State */}
                 {!editPejabat && (editLetter.template_id === 2 || editLetter.template_id === 9) && (
                   <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500">
                     <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                     <p>Pilih pejabat untuk melihat preview</p>
                   </div>
                 )}
                 
                 {!editPejabat && !editPegawai && (editLetter.template_id !== 2 && editLetter.template_id !== 9) && (
                   <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-500">
                     <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                     <p>Pilih pejabat dan pegawai untuk melihat preview</p>
                   </div>
                 )}
               </div>
             </div>
             
             <div className="flex gap-2 justify-end mt-4">
               <Button variant="outline" onClick={() => setEditLetter(null)} disabled={editSaving}>
                 Batal
               </Button>
               <Button 
                 onClick={handleSaveEditPejabatPegawai} 
                 disabled={editSaving || !editPejabat || ((editLetter.template_id !== 2 && editLetter.template_id !== 9) && !editPegawai)} 
                 className="bg-blue-600 hover:bg-blue-700 text-white"
               >
                 {editSaving ? 'Menyimpan...' : 'Simpan'}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       )}
    </div>
  );
};

export default Letters; 