import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiDelete, apiPut, apiPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Shepherd, { type Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface PengajuanData {
  id: string;
  created_by?: string;
  pegawai: {
    nama: string;
    jabatan: string;
  };
  jenis_jabatan: string;
  total_dokumen: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'resubmitted' | 'admin_wilayah_approved' | 'admin_wilayah_rejected' | 'admin_wilayah_submitted' | 'kanwil_submitted' | 'kanwil_approved' | 'final_approved' | 'final_rejected';
  catatan?: string;
  rejection_reason?: string;
  resubmitted_at?: string;
  resubmitted_by?: string;
  created_at: string;
  files: Array<{
    id: string;
    file_type: string;
    file_name: string;
    file_category?: string;
  }>;
}

const PengajuanIndex: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [pengajuanList, setPengajuanList] = useState<PengajuanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize state from URL params or sessionStorage
  const getInitialFilter = (key: string, defaultValue: string): string => {
    // First try URL params
    const urlValue = searchParams.get(key);
    if (urlValue !== null) return urlValue;
    
    // Fallback to sessionStorage (for backward navigation from detail)
    const stored = sessionStorage.getItem(`pengajuan_filter_${key}`);
    if (stored) return stored;
    
    return defaultValue;
  };
  
  const [searchTerm, setSearchTerm] = useState(() => getInitialFilter('search', ''));
  const [statusFilter, setStatusFilter] = useState<string>(() => getInitialFilter('status', 'all'));
  const [createdByFilter, setCreatedByFilter] = useState<string>(() => getInitialFilter('created_by', 'all'));
  const [jenisJabatanFilter, setJenisJabatanFilter] = useState<string>(() => getInitialFilter('jenis_jabatan', 'all'));
  const [currentPage, setCurrentPage] = useState(() => {
    const page = getInitialFilter('page', '1');
    return parseInt(page, 10) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pengajuanToDelete, setPengajuanToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanData | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    users: Array<{ id: string; email: string; full_name: string }>;
    statuses: Array<{ value: string; label: string; count: number }>;
    jenisJabatan: Array<{ value: string; label: string; count: number }>;
    kabupatenGroups?: Array<{ groupName: string; kabupaten: string[]; count: number }>;
    kabupaten?: Array<{ name: string; count: number }>;
  }>({ users: [], statuses: [], jenisJabatan: [] });
  const [kabupatenGroupFilter, setKabupatenGroupFilter] = useState<string>(() => getInitialFilter('kabupaten_group', 'all'));
  const [groupedByKabkota, setGroupedByKabkota] = useState<Record<string, PengajuanData[]>>({});
  const pengajuanTourRef = useRef<Tour | null>(null);
  const [showGenerateDownloadDialog, setShowGenerateDownloadDialog] = useState(false);
  const [generateDownloadFilterType, setGenerateDownloadFilterType] = useState<'jabatan' | 'kabupaten'>('jabatan');
  const [generateDownloadFilterValue, setGenerateDownloadFilterValue] = useState<string>('');
  const [generatingDownload, setGeneratingDownload] = useState(false);
  const [generateDownloadProgress, setGenerateDownloadProgress] = useState<string>('');
  const [generateFilterOptions, setGenerateFilterOptions] = useState<{
    jenisJabatan: Array<{ value: string; label: string; count: number }>;
    kabupatenGroups?: Array<{ groupName: string; kabupaten: string[]; count: number }>;
  }>({ jenisJabatan: [] });
  const [generateOptionsLoading, setGenerateOptionsLoading] = useState(false);

  const itemsPerPage = 50;
  const isAdmin = user?.role === 'admin';
  const isReadOnlyUser = user?.role === 'user';
  const isBimas = user?.role === 'bimas';
  const isKanwil = user?.role === 'kanwil';
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const isReadOnlyRole = isReadOnlyUser || isBimas;
  const isGroupingRole = isAdmin || isReadOnlyUser || isBimas;

  // Fallback grouping on client for admin when server doesn't provide grouping
  const clientGroupedByKabkota: Record<string, PengajuanData[]> = React.useMemo(() => {
    if (!isGroupingRole) return {};
    
    // Always use server grouping if available
    if (Object.keys(groupedByKabkota).length > 0) {
      console.log('🔍 Using server grouping:', groupedByKabkota);
      return groupedByKabkota;
    }
    
    // Fallback to client grouping
    if (!pengajuanList || pengajuanList.length === 0) return {};
    
    console.log('🔍 Using client grouping, pengajuanList length:', pengajuanList.length);
    const clientGrouped = pengajuanList.reduce((acc: Record<string, PengajuanData[]>, item: any) => {
      const kab = (item.office && (item.office.kabkota || item.office.name)) || (item.pegawai && (item.pegawai as any).induk_unit) || (item.pegawai as any)?.unit_kerja || 'Lainnya';
      if (!acc[kab]) acc[kab] = [];
      acc[kab].push(item);
      return acc;
    }, {});
    
    console.log('🔍 Client grouped result:', clientGrouped);
    return clientGrouped;
  }, [isGroupingRole, groupedByKabkota, pengajuanList]);

  const startPengajuanTour = useCallback(() => {
    if (!isReadOnlyUser) {
      toast({
        title: 'Tutorial khusus pengguna tracking',
        description: 'Menu ini hanya tersedia untuk role user yang fokus tracking.',
      });
      return;
    }

    if (loading) {
      toast({
        title: 'Tunggu sebentar',
        description: 'Kami masih menyiapkan data pengajuan untuk tur.',
      });
      return;
    }

    const totalRows = Object.values(clientGroupedByKabkota).reduce((acc, list) => acc + list.length, 0);
    if (totalRows === 0) {
      toast({
        title: 'Data belum tersedia',
        description: 'Tidak ada pengajuan untuk ditampilkan. Coba sesuaikan filter atau kembali lagi nanti.',
        variant: 'destructive'
      });
      return;
    }

    if (pengajuanTourRef.current) {
      pengajuanTourRef.current.cancel();
      pengajuanTourRef.current = null;
    }
    sessionStorage.removeItem('pending_pengajuan_list_tour');

    // Pastikan accordion pertama terbuka supaya step terlihat
    setTimeout(() => {
      const firstAccordionTrigger = document.querySelector('[data-tour-id="pengajuan-accordion"] button');
      if (firstAccordionTrigger && firstAccordionTrigger.getAttribute('aria-expanded') !== 'true') {
        (firstAccordionTrigger as HTMLButtonElement).click();
      }
    }, 0);

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'bg-white shadow-xl rounded-lg border border-gray-200 text-gray-800',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    });

    const buildButtons = (options?: { showBack?: boolean; isFinal?: boolean }) => {
      const buttons = [
        {
          text: 'Lewati',
          classes: 'shepherd-button-secondary text-gray-500',
          action: async () => {
            tour.cancel();
          }
        }
      ];

      if (options?.showBack) {
        buttons.push({
          text: 'Kembali',
          classes: 'shepherd-button-secondary',
          action: async () => {
            tour.back();
          }
        });
      }

      buttons.push({
        text: options?.isFinal ? 'Selesai' : 'Lanjut',
        classes: 'shepherd-button-primary bg-green-600 text-white hover:bg-green-700',
        action: async () => {
          if (options?.isFinal) {
            tour.complete();
          } else {
            tour.next();
          }
        }
      });

      return buttons;
    };

    tour.addStep({
      id: 'intro',
      title: 'Daftar Pengajuan',
      text: 'Halaman ini menampilkan seluruh pengajuan dengan grouping kabupaten/kota agar Anda mudah memilih dokumen mana yang akan dicek.',
      attachTo: {
        element: '[data-tour-id="pengajuan-header"]',
        on: 'bottom'
      },
      buttons: buildButtons()
    });

    tour.addStep({
      id: 'filters',
      title: 'Filter & Pencarian',
      text: 'Gunakan pencarian dan filter status untuk mempersempit daftar. Sistem otomatis menyimpan filter Anda.',
      attachTo: {
        element: '[data-tour-id="pengajuan-filter"]',
        on: 'top'
      },
      buttons: buildButtons({ showBack: true })
    });

    if (document.querySelector('[data-tour-id="pengajuan-jabatan-filter"]')) {
      tour.addStep({
        id: 'jabatan',
        title: 'Filter Jenis Jabatan',
        text: 'Khusus role user, filter ini membantu fokus pada jabatan tertentu (misal Guru, Fungsional).',
        attachTo: {
          element: '[data-tour-id="pengajuan-jabatan-filter"]',
          on: 'bottom'
        },
        buttons: buildButtons({ showBack: true })
      });
    }

    tour.addStep({
      id: 'accordion',
      title: 'Kelompok Kabupaten/Kota',
      text: 'Setiap Kanwil memuat daftar kabupaten/kota. Klik untuk membuka tabel pengajuan di dalamnya.',
      attachTo: {
        element: '[data-tour-id="pengajuan-accordion"]',
        on: 'top'
      },
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'row-action',
      title: 'Masuk ke Detail Pengajuan',
      text: 'Gunakan tombol aksi “...” lalu pilih Lihat Detail untuk membuka dokumen dan catatan lengkap.',
      attachTo: {
        element: '[data-tour-id="pengajuan-row-action"]',
        on: 'left'
      },
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'finish',
      title: 'Siap ke Halaman Detail',
      text: 'Setelah menemukan pengajuan yang ingin dicek, buka detailnya. Kami akan menampilkan tur lanjutan otomatis ketika detail terbuka.',
      buttons: buildButtons({ showBack: true, isFinal: true })
    });

    tour.on('complete', () => {
      sessionStorage.setItem('pending_pengajuan_detail_tour', 'true');
      sessionStorage.removeItem('pending_pengajuan_list_tour');
      toast({
        title: 'Langkah berikutnya',
        description: 'Buka salah satu pengajuan lalu klik Lihat Detail untuk melihat tur lanjutan.',
      });
    });

    tour.on('cancel', () => {
      sessionStorage.removeItem('pending_pengajuan_list_tour');
      sessionStorage.removeItem('pending_pengajuan_detail_tour');
    });

    tour.start();
    pengajuanTourRef.current = tour;
  }, [isReadOnlyUser, loading, clientGroupedByKabkota, toast]);

  useEffect(() => {
    if (!loading && isReadOnlyUser) {
      const pendingTour = sessionStorage.getItem('pending_pengajuan_list_tour');
      if (pendingTour === 'true') {
        startPengajuanTour();
      }
    }
  }, [loading, isReadOnlyUser, startPengajuanTour]);

  useEffect(() => {
    return () => {
      if (pengajuanTourRef.current) {
        pengajuanTourRef.current.cancel();
        pengajuanTourRef.current = null;
      }
    };
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (createdByFilter !== 'all') params.set('created_by', createdByFilter);
    if (jenisJabatanFilter !== 'all') params.set('jenis_jabatan', jenisJabatanFilter);
    if (kabupatenGroupFilter !== 'all') params.set('kabupaten_group', kabupatenGroupFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    // Update URL without triggering navigation
    setSearchParams(params, { replace: true });
    
    // Also save to sessionStorage for backward navigation
    sessionStorage.setItem('pengajuan_filter_search', searchTerm);
    sessionStorage.setItem('pengajuan_filter_status', statusFilter);
    sessionStorage.setItem('pengajuan_filter_created_by', createdByFilter);
    sessionStorage.setItem('pengajuan_filter_jenis_jabatan', jenisJabatanFilter);
    sessionStorage.setItem('pengajuan_filter_kabupaten_group', kabupatenGroupFilter);
    sessionStorage.setItem('pengajuan_filter_page', currentPage.toString());
  }, [isAuthenticated, searchTerm, statusFilter, createdByFilter, jenisJabatanFilter, kabupatenGroupFilter, currentPage, setSearchParams]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    // Lock status filter to final_approved for read-only user (admin pusat)
    if (isReadOnlyUser && statusFilter !== 'final_approved') {
      setStatusFilter('final_approved');
    }
    fetchPengajuanData();
  }, [isAuthenticated, navigate, currentPage, statusFilter, createdByFilter, jenisJabatanFilter, kabupatenGroupFilter, isReadOnlyUser, searchTerm]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFilterOptions();
    }
  }, [isAuthenticated, jenisJabatanFilter, statusFilter, createdByFilter, searchTerm]);

  const fetchGenerateFilterOptions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setGenerateOptionsLoading(true);
      const response = await apiGet('/api/pengajuan/filter-options?status=final_approved', token);
      if (response.success) {
        setGenerateFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error fetching generate filter options:', error);
    } finally {
      setGenerateOptionsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (showGenerateDownloadDialog && (isAdmin || isReadOnlyUser)) {
      fetchGenerateFilterOptions();
    }
  }, [showGenerateDownloadDialog, isAdmin, isReadOnlyUser, fetchGenerateFilterOptions]);


    const fetchPengajuanData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(jenisJabatanFilter !== 'all' && { jenis_jabatan: jenisJabatanFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(isAdmin && createdByFilter !== 'all' && { created_by: createdByFilter }),
        ...((isAdmin || isReadOnlyUser) && kabupatenGroupFilter !== 'all' && { kabupaten_group: kabupatenGroupFilter }),
        // Kanwil hanya melihat pengajuan yang mereka buat
        ...(isKanwil && user?.id && { created_by: user.id })
      });


      const response = await apiGet(`/api/pengajuan?${params}`, token);
      
      
      if (response.success) {
        setPengajuanList(response.data);
        if (isAdmin) {
          const grouped = response.grouped_by_kabkota;
          console.log('🔍 Frontend received grouped data:', grouped);
          console.log('🔍 Frontend received data length:', response.data?.length);
          if (grouped) {
            setGroupedByKabkota(grouped as Record<string, PengajuanData[]>);
          } else {
            setGroupedByKabkota({});
          }
        }
        
        const totalPagesValue = response.pagination?.totalPages || 1;
        const totalItemsValue = response.pagination?.total || 0;
        
        
        setTotalPages(totalPagesValue);
        setTotalItems(totalItemsValue);
        
      } else {
        setError(response.message || 'Gagal mengambil data pengajuan');
      }
     } catch (error) {
       console.error('Error fetching pengajuan data:', error);
       setError('Terjadi kesalahan saat mengambil data pengajuan');
     } finally {
       setLoading(false);
     }
   };

       const fetchFilterOptions = async () => {
      try {
        console.log('🔍 Fetching filter options...');
        // Kirim filter aktif saat ini ke backend untuk menghitung count yang akurat
        const params = new URLSearchParams();
        if (jenisJabatanFilter !== 'all') params.set('jenis_jabatan', jenisJabatanFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (isAdmin && createdByFilter !== 'all') params.set('created_by', createdByFilter);
        if (searchTerm) params.set('search', searchTerm);
        
        const queryString = params.toString();
        const url = queryString ? `/api/pengajuan/filter-options?${queryString}` : '/api/pengajuan/filter-options';
        const response = await apiGet(url, token);
        console.log('🔍 Filter options response:', response);
        if (response.success) {
          setFilterOptions(response.data);
          console.log('🔍 Filter options set:', response.data);
          console.log('🔍 Kabupaten groups:', response.data?.kabupatenGroups);
          console.log('🔍 Kabupaten groups length:', response.data?.kabupatenGroups?.length);
        } else {
          console.error('🔍 Filter options failed:', response.message);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    if (isReadOnlyUser) return; // locked to final_approved
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleCreatedByFilter = (value: string) => {
    setCreatedByFilter(value);
    setCurrentPage(1);
  };

  const handleJenisJabatanFilter = (value: string) => {
    setJenisJabatanFilter(value);
    setCurrentPage(1);
  };

  const handleKabupatenGroupFilter = (value: string) => {
    setKabupatenGroupFilter(value);
    setCurrentPage(1);
  };

  // Helper function to navigate to detail while preserving filter state
  const navigateToDetail = (pengajuanId: string) => {
    // Filter state is already saved in sessionStorage by the useEffect above
    // Just navigate to detail
    navigate(`/pengajuan/${pengajuanId}`);
  };



    const handleDelete = async () => {
    if (!pengajuanToDelete) return;

    try {
      setDeleting(true);
      const response = await apiDelete(`/api/pengajuan/${pengajuanToDelete}`, token);
      
      if (response.success) {
        fetchPengajuanData();
        setDeleteDialogOpen(false);
        setPengajuanToDelete(null);
      } else {
        setError(response.message || 'Gagal menghapus pengajuan');
      }
    } catch (error) {
      console.error('Error deleting pengajuan:', error);
      setError('Terjadi kesalahan saat menghapus pengajuan');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPengajuan || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const response = await apiPut(
        `/api/pengajuan/${selectedPengajuan.id}/update-status`,
        {
          status: newStatus,
          reason: statusChangeReason
        },
        token
      );

      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Status pengajuan berhasil diubah',
        });
        setShowUpdateStatusDialog(false);
        setSelectedPengajuan(null);
        setNewStatus('');
        setStatusChangeReason('');
        fetchPengajuanData();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Gagal mengubah status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string, pengajuan?: PengajuanData) => {
    // Helper function to determine if this is submitted after admin wilayah approval
    const isSubmittedAfterAdminWilayah = (status: string, pengajuan?: PengajuanData) => {
      if (status !== 'submitted' || !pengajuan) return false;
      // Only show "Diajukan Admin Wilayah" if there are actual admin wilayah files
      return pengajuan.files?.some(f => f.file_category === 'admin_wilayah') || false;
    };

    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800 hover:bg-gray-200', icon: Clock },
      submitted: { 
        label: isSubmittedAfterAdminWilayah(status, pengajuan) ? 'Diajukan Admin Wilayah' : 'Diajukan', 
        className: isSubmittedAfterAdminWilayah(status, pengajuan) ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' : 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
        icon: FileText 
      },
      approved: { label: 'Disetujui', className: 'bg-green-100 text-green-800 hover:bg-green-200', icon: CheckCircle },
      rejected: { label: 'Ditolak Admin Wilayah', className: 'bg-red-100 text-red-800 hover:bg-red-200', icon: XCircle },
      resubmitted: { label: 'Diajukan Ulang', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', icon: Clock },
      admin_wilayah_approved: { label: 'Disetujui Admin Wilayah', className: 'bg-green-200 text-green-800 hover:bg-green-300', icon: CheckCircle },
      admin_wilayah_rejected: { label: 'Ditolak Superadmin', className: 'bg-red-200 text-red-800 hover:bg-red-300', icon: XCircle },
      admin_wilayah_submitted: { label: 'Diajukan Admin Wilayah', className: 'bg-blue-200 text-blue-800 hover:bg-blue-300', icon: FileText },
      kanwil_submitted: { label: 'Diajukan Kanwil', className: 'bg-purple-200 text-purple-800 hover:bg-purple-300', icon: FileText },
      kanwil_approved: { label: 'Disetujui Kanwil', className: 'bg-purple-300 text-purple-900 hover:bg-purple-400', icon: CheckCircle },
      final_approved: { label: 'Final Approved', className: 'bg-green-600 text-white', icon: CheckCircle },
      final_rejected: { label: 'Final Rejected', className: 'bg-red-600 text-white', icon: XCircle }
    } as const;

    const config = (statusConfig as any)[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = config.icon as any;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getJabatanDisplayName = (jenisJabatan: string): string => {
    const jabatanMap: Record<string, string> = {
      'guru': 'Guru',
      'eselon_iv': 'Eselon IV',
      'fungsional': 'Fungsional',
      'pelaksana': 'Pelaksana'
    };
    
    return jabatanMap[jenisJabatan] || jenisJabatan;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rekap dan export (khusus read-only user)
  const buildRekapPerKabkota = () => {
    const source = Object.keys(clientGroupedByKabkota).length > 0
      ? clientGroupedByKabkota
      : pengajuanList.reduce((acc: Record<string, PengajuanData[]>, item: any) => {
          const kab = (item.office && (item.office.kabkota || item.office.name)) || (item.pegawai && (item.pegawai as any).induk_unit) || (item.pegawai as any)?.unit_kerja || 'Lainnya';
          if (!acc[kab]) acc[kab] = [];
          acc[kab].push(item);
          return acc;
        }, {});
    return Object.entries(source).map(([kab, items]) => ({ kabkota: kab, total: items.length }));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const rows = buildRekapPerKabkota();
    const today = new Date();
    const ymd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const filename = `Rekap-final_approved-per-kabkota-${ymd}.xls`;
    const tableHtml = `
      <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Kab/Kota</th><th>Jumlah Pengajuan Final Approved</th></tr>
          </thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.kabkota}</td><td>${r.total}</td></tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>`;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, filename);
  };

  const exportPDF = () => {
    const rows = buildRekapPerKabkota().sort((a, b) => b.total - a.total);
    const total = rows.reduce((acc, r) => acc + r.total, 0);
    const max = Math.max(1, ...rows.map(r => r.total));
    const kabCount = rows.length;
    const now = new Date();
    const dateStr = now.toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const filename = `Rekap-disetujui-kanwil-per-kabkota-${ymd}.pdf`;

    const createdBy = (user?.full_name || user?.email || 'Admin Pusat');
    const top5 = rows.slice(0, 5);

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <meta charset=\"UTF-8\" />
          <title>${filename}</title>
          <style>
            @page { size: A4; margin: 18mm 14mm; }
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
            .title { font-size: 18px; font-weight: 700; }
            .meta { font-size: 12px; color: #4b5563; }
            .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 12px 0 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .card h3 { font-size: 12px; color: #6b7280; margin: 0 0 4px; font-weight: 600; }
            .card .value { font-size: 20px; font-weight: 700; color: #111827; }
            table { border-collapse: collapse; width: 100%; margin-top: 4px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
            th { background: #f9fafb; text-align: left; }
            tfoot td { font-weight: 700; background: #f3f4f6; }
            .row { display: flex; align-items: center; gap: 10px; }
            .bar { height: 8px; background: #d1fae5; border-radius: 4px; overflow: hidden; }
            .bar > span { display: block; height: 100%; background: #10b981; }
            .note { margin-top: 12px; font-size: 11px; color: #6b7280; }
            .section-title { margin-top: 16px; font-size: 14px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Rekap Pengajuan Telah Disetujui Kanwil per Kab/Kota</div>
              <div class="meta">Dihasilkan: ${dateStr} • Dibuat oleh: ${createdBy}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <h3>Total Telah Disetujui Kanwil</h3>
              <div class="value">${total}</div>
            </div>
            <div class="card">
              <h3>Jumlah Kab/Kota</h3>
              <div class="value">${kabCount}</div>
            </div>
            <div class="card">
              <h3>Top Kab/Kota</h3>
              <div style="font-size:12px; color:#111827; line-height:1.4;">
                ${top5.map((r, i) => `${i + 1}. ${r.kabkota} (${r.total})`).join('<br/>') || '-'}
              </div>
            </div>
          </div>

          <div class="section-title">Tabel Rekap</div>
          <table>
            <thead>
              <tr>
                <th style="width:36px;">No</th>
                <th>Kab/Kota</th>
                <th style="width:110px;">Jumlah</th>
                <th style="width:80px;">Persen</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r, idx) => {
                const pct = total > 0 ? Math.round((r.total / total) * 1000) / 10 : 0;
                const rel = Math.round((r.total / max) * 100);
                const barWidth = 140;
                const filled = Math.max(1, Math.round((rel / 100) * barWidth));
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${r.kabkota}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${r.total}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${pct.toFixed(1)}%</td>
                    <td>
                      <svg width="${barWidth}" height="10" viewBox="0 0 ${barWidth} 10" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="${barWidth}" height="10" fill="#E5F6F1" stroke="#D1D5DB" />
                        <rect x="0" y="0" width="${filled}" height="10" fill="#10B981" />
                      </svg>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total</td>
                <td style="text-align:right; font-variant-numeric: tabular-nums;">${total}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="note">Catatan: Laporan ini menampilkan pengajuan yang <strong>telah disetujui Kanwil</strong>.</div>

          <script>
            window.onload = function() { window.print(); };
          <\/script>
        </body>
      </html>
    `);
    win.document.close();
  };
  
  const handleGenerateDownload = async () => {
    if (!generateDownloadFilterValue) {
      toast({
        title: 'Error',
        description: 'Pilih filter terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGeneratingDownload(true);
      setGenerateDownloadProgress('Sedang memproses data pengajuan dan membuat file ZIP...');

      // Generate file ZIP
      const baseUrl = (import.meta as any).env?.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : '');
      const generateUrl = baseUrl ? `${baseUrl}/api/pengajuan/generate-download` : '/api/pengajuan/generate-download';
      
      const fetchResponse = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filter_type: generateDownloadFilterType,
          filter_value: generateDownloadFilterValue
        })
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({ message: 'Gagal generate download' }));
        throw new Error(errorData.message || 'Gagal generate download');
      }

      // Response should be JSON with file_id and download_url
      const responseData = await fetchResponse.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Gagal generate download');
      }

      setGenerateDownloadProgress('File ZIP berhasil di-generate, sedang mengunduh...');

      // Download file using the download_url
      const fileDownloadUrl = baseUrl 
        ? `${baseUrl}${responseData.data.download_url}` 
        : responseData.data.download_url;
      
      const downloadResponse = await fetch(fileDownloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!downloadResponse.ok) {
        const errorData = await downloadResponse.json().catch(() => ({ message: 'Gagal download file' }));
        throw new Error(errorData.message || 'Gagal download file');
      }

      const blob = await downloadResponse.blob();
      downloadBlob(blob, responseData.data.filename);

      toast({
        title: 'Berhasil',
        description: 'File ZIP berhasil di-generate dan di-download',
      });

      setShowGenerateDownloadDialog(false);
      setGenerateDownloadFilterValue('');
      setGenerateDownloadProgress('');
    } catch (error) {
      console.error('Error generating download:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal generate download',
        variant: 'destructive',
      });
    } finally {
      setGeneratingDownload(false);
      setGenerateDownloadProgress('');
    }
  };

  // Debug info
  console.log('🔍 Debug PengajuanIndex:', {
    userRole: user?.role,
    isAdmin,
    userEmail: user?.email
  });

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle data-tour-id="pengajuan-header" className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daftar Pengajuan Mutasi PNS
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isAdmin ? 'Semua pengajuan mutasi PNS' : (isReadOnlyUser ? 'Semua pengajuan berstatus final_approved (read-only)' : (isKanwil ? 'Pengajuan mutasi PNS Anda (Kanwil)' : 'Pengajuan mutasi PNS Anda'))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isReadOnlyUser && (
                <Button
                  variant="outline"
                  onClick={startPengajuanTour}
                  className="border-green-200 text-green-700"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Mulai Tutorial
                </Button>
              )}
              {isReadOnlyUser && (
                <>
                  <Button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white">Export Excel</Button>
                  <Button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white">Export PDF</Button>
                </>
              )}
              {(isAdmin || isReadOnlyUser) && (
                <Button
                  onClick={() => setShowGenerateDownloadDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Download
                </Button>
              )}
              {/* Only show Add button for admin and operator, not for user role */}
              {!isReadOnlyRole && (
                <Button
                  onClick={() => navigate('/pengajuan/select')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengajuan
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Search and Filter */}
           <div className="flex flex-col gap-4 mb-6" data-tour-id="pengajuan-filter">
             {/* Search Bar */}
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 placeholder="Cari berdasarkan nama pegawai, jabatan, atau jenis jabatan..."
                 value={searchTerm}
                 onChange={(e) => handleSearch(e.target.value)}
                 className="pl-10"
               />
             </div>
             
             {/* Filter Row */}
             <div className="flex flex-col sm:flex-row gap-4">
               <div className="flex items-center gap-2">
                 <Filter className="h-4 w-4 text-gray-400" />
                 <Select value={statusFilter} onValueChange={handleStatusFilter}>
                   <SelectTrigger className="w-48">
                     <SelectValue placeholder="Filter Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">Semua Status</SelectItem>
                     {filterOptions.statuses
                       .filter(status => status.count > 0) // Only show statuses with data
                       .map((status) => (
                         <SelectItem key={status.value} value={status.value}>
                           {status.label} ({status.count})
                         </SelectItem>
                       ))}
                   </SelectContent>
                 </Select>
               </div>
               
              {/* Filter Jenis Jabatan untuk admin, pengguna tracking, dan admin wilayah */}
               {(isReadOnlyUser || isAdmin || isAdminWilayah) && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={jenisJabatanFilter} onValueChange={handleJenisJabatanFilter}>
                      <SelectTrigger className="w-48" data-tour-id="pengajuan-jabatan-filter">
                        <SelectValue placeholder="Filter Jenis Jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jenis Jabatan</SelectItem>
                        {filterOptions.jenisJabatan
                          .filter(jabatan => jabatan.count > 0)
                          .map((jabatan) => (
                            <SelectItem key={jabatan.value} value={jabatan.value}>
                              {jabatan.label} ({jabatan.count})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {/* Filter Pulau/Wilayah untuk admin dan user */}
              {(isAdmin || isReadOnlyUser) && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={kabupatenGroupFilter} onValueChange={handleKabupatenGroupFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter Pulau/Wilayah" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Pulau/Wilayah</SelectItem>
                      {filterOptions.kabupatenGroups && filterOptions.kabupatenGroups.length > 0 ? (
                        filterOptions.kabupatenGroups
                          .filter(group => group.count > 0 || group.groupName === 'Sumbawa')
                          .map((group) => (
                            <SelectItem key={group.groupName} value={group.groupName}>
                              {group.groupName} ({group.count})
                            </SelectItem>
                          ))
                      ) : (
                        <SelectItem value="all" disabled>Memuat data...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

                               {/* Admin Only Filters */}
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <Select value={createdByFilter} onValueChange={handleCreatedByFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter Pembuat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Pembuat</SelectItem>
                        {filterOptions.users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name || user.email || 'Unknown User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
             </div>
           </div>

          {/* Grouped view for admin and read-only user */}
          {isGroupingRole && Object.keys(clientGroupedByKabkota).length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">Tergabung berdasarkan kabupaten/kota</div>
              <Accordion type="multiple" className="w-full" data-tour-id="pengajuan-accordion">
                {Object.entries(clientGroupedByKabkota).map(([kab, items]) => (
                  <AccordionItem key={kab} value={kab} className="border rounded-lg">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="font-medium">{kab}</div>
                        <Badge variant="secondary" className="ml-2">{items.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <div className="border-t">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pegawai</TableHead>
                              <TableHead>Jenis Jabatan</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Jumlah Dokumen</TableHead>
                              {isAdmin && <TableHead>Pembuat</TableHead>}
                              <TableHead>Tanggal Dibuat</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((pengajuan) => (
                              <TableRow key={pengajuan.id} className="hover:bg-gray-50">
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{pengajuan.pegawai.nama}</div>
                                    <div className="text-sm text-gray-500">{pengajuan.pegawai.jabatan}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{getJabatanDisplayName(pengajuan.jenis_jabatan)}</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(pengajuan.status, pengajuan)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">{pengajuan.files.length}</span>
                                  </div>
                                </TableCell>
                                {isAdmin && (
                                  <TableCell>
                                    <div className="text-sm text-gray-600">
                                      {(() => {
                                        const u = filterOptions.users.find(u => u.id === pengajuan.created_by);
                                        if (u) return u.full_name || u.email || 'Unknown User';
                                        return pengajuan.created_by?.includes('@') ? pengajuan.created_by : 'Unknown User';
                                      })()}
                                    </div>
                                  </TableCell>
                                )}
                                <TableCell>
                                  <div className="text-sm text-gray-600">{formatDate(pengajuan.created_at)}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" data-tour-id="pengajuan-row-action">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Lihat Detail
                                      </DropdownMenuItem>
                                      {/* Ubah Status - hanya untuk admin */}
                                      {isAdmin && (
                                        <DropdownMenuItem 
                                          onClick={() => {
                                            setSelectedPengajuan(pengajuan);
                                            setNewStatus(pengajuan.status);
                                            setStatusChangeReason('');
                                            setShowUpdateStatusDialog(true);
                                          }}
                                        >
                                          <Settings className="h-4 w-4 mr-2" />
                                          Ubah Status
                                        </DropdownMenuItem>
                                      )}
                                      {isAdmin && pengajuan.status === 'admin_wilayah_submitted' && (
                                        <>
                                          <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Setujui
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Tolak
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                      {isAdmin && (
                                        <DropdownMenuItem 
                                          onClick={() => {
                                            setPengajuanToDelete(pengajuan.id);
                                            setDeleteDialogOpen(true);
                                          }}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Hapus
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {/* Pagination for admin grouped view */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === page 
                              ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                              : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                          }`}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
          /* Table */
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2 text-green-600" />
                <span>Memuat data pengajuan...</span>
              </div>
            ) : pengajuanList.length === 0 && totalItems === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada pengajuan yang sesuai dengan filter'
                    : 'Belum ada pengajuan'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && user?.role !== 'user' && (
                  <Button
                    onClick={() => navigate('/pengajuan/select')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Pengajuan Pertama
                  </Button>
                )}
              </div>
            ) : pengajuanList.length === 0 && totalItems > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pegawai</TableHead>
                      <TableHead>Jenis Jabatan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Jumlah Dokumen</TableHead>
                      <TableHead>Tanggal Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Tidak ada data di halaman ini
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>


                {/* Pagination Info - Always show for debugging */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                  </div>
                  {true && ( // Always show for debugging - change back to (totalPages > 1 || totalItems > itemsPerPage) later
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Pegawai</TableHead>
                       <TableHead>Jenis Jabatan</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Dokumen</TableHead>
                       {isAdmin && <TableHead>Pembuat</TableHead>}
                       <TableHead>Tanggal Dibuat</TableHead>
                       <TableHead className="text-right">Aksi</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {pengajuanList.map((pengajuan) => (
                      <TableRow key={pengajuan.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{pengajuan.pegawai.nama}</div>
                            <div className="text-sm text-gray-500">{pengajuan.pegawai.jabatan}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getJabatanDisplayName(pengajuan.jenis_jabatan)}
                          </Badge>
                        </TableCell>
                                                 <TableCell>
                           {getStatusBadge(pengajuan.status, pengajuan)}
                         </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{pengajuan.files.length}</span>
                          </div>
                        </TableCell>
                                                   {isAdmin && (
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {(() => {
                                  const user = filterOptions.users.find(u => u.id === pengajuan.created_by);
                                  if (user) {
                                    // Prioritaskan full_name, jika tidak ada gunakan email
                                    return user.full_name || user.email || 'Unknown User';
                                  }
                                  // Jika user tidak ditemukan, tampilkan email dari created_by (jika itu email)
                                  return pengajuan.created_by?.includes('@') ? pengajuan.created_by : 'Unknown User';
                                })()}
                              </div>
                            </TableCell>
                          )}
                         <TableCell>
                           <div className="text-sm text-gray-600">
                             {formatDate(pengajuan.created_at)}
                           </div>
                         </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Detail
                              </DropdownMenuItem>
                              {/* Only show edit actions for admin and operator, not for user role */}
                              {!isReadOnlyRole && (
                                <>
                                  {pengajuan.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}/upload`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Upload Dokumen
                                    </DropdownMenuItem>
                                  )}
                                  {pengajuan.status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => navigate(`/pengajuan/${pengajuan.id}/edit`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Perbaiki Dokumen
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {/* Ubah Status - hanya untuk admin */}
                              {isAdmin && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedPengajuan(pengajuan);
                                    setNewStatus(pengajuan.status);
                                    setStatusChangeReason('');
                                    setShowUpdateStatusDialog(true);
                                  }}
                                >
                                  <Settings className="h-4 w-4 mr-2" />
                                  Ubah Status
                                </DropdownMenuItem>
                              )}
                               {isAdmin && pengajuan.status === 'admin_wilayah_submitted' && (
                                 <>
                                   <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                     <CheckCircle className="h-4 w-4 mr-2" />
                                     Setujui
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => navigateToDetail(pengajuan.id)}>
                                     <XCircle className="h-4 w-4 mr-2" />
                                     Tolak
                                   </DropdownMenuItem>
                                 </>
                               )}
                                                                                          {/* Only show delete for admin and operator, not for user role */}
                              {(isAdmin || (pengajuan.status === 'draft' && user?.role !== 'user')) && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    console.log('🔍 Debug: Klik hapus untuk pengajuan:', {
                                      id: pengajuan.id,
                                      status: pengajuan.status,
                                      isAdmin,
                                      userRole: user?.role
                                    });
                                    setPengajuanToDelete(pengajuan.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              )}
                             
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>


                {/* Pagination Info - Always show for debugging */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                  <div className="text-sm text-gray-700">
                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, totalItems)} dari {totalItems} pengajuan
                  </div>
                  {true && ( // Always show for debugging - change back to (totalPages > 1 || totalItems > itemsPerPage) later
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 p-0 ${
                              currentPage === page 
                                ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                : "bg-white hover:bg-green-50 text-gray-700 border-gray-300 hover:border-green-300"
                            }`}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateStatusDialog} onOpenChange={setShowUpdateStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Status Pengajuan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status Saat Ini</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded-md">
                {selectedPengajuan && getStatusBadge(selectedPengajuan.status, selectedPengajuan)}
              </div>
            </div>
            <div>
              <Label htmlFor="newStatus">Status Baru</Label>
              <select
                id="newStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Ditolak Admin Wilayah</option>
                <option value="resubmitted">Resubmitted</option>
                <option value="admin_wilayah_approved">Admin Wilayah Approved</option>
                <option value="admin_wilayah_rejected">Ditolak Superadmin</option>
                <option value="admin_wilayah_submitted">Admin Wilayah Submitted</option>
                <option value="final_approved">Final Approved</option>
                <option value="final_rejected">Final Rejected</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reason">Alasan Perubahan (Opsional)</Label>
              <Textarea
                id="reason"
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                placeholder="Masukkan alasan perubahan status..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpdateStatusDialog(false);
                setSelectedPengajuan(null);
                setNewStatus('');
                setStatusChangeReason('');
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updatingStatus || !newStatus || (selectedPengajuan && newStatus === selectedPengajuan.status)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {updatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Ubah Status'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengajuan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Generate Download Dialog */}
      <Dialog open={showGenerateDownloadDialog} onOpenChange={setShowGenerateDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Download ZIP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filterType">Filter By</Label>
              <Select
                value={generateDownloadFilterType}
                onValueChange={(value: 'jabatan' | 'kabupaten') => {
                  setGenerateDownloadFilterType(value);
                  setGenerateDownloadFilterValue('');
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jabatan">By Jabatan</SelectItem>
                  <SelectItem value="kabupaten">By Kabupaten</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterValue">
                {generateDownloadFilterType === 'jabatan' ? 'Pilih Jabatan' : 'Pilih Kabupaten'}
              </Label>
              {generateDownloadFilterType === 'jabatan' ? (
                <Select
                  value={generateDownloadFilterValue}
                  onValueChange={setGenerateDownloadFilterValue}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateOptionsLoading && (
                      <SelectItem value="__loading_jabatan" disabled>Memuat data...</SelectItem>
                    )}
                    {!generateOptionsLoading && generateFilterOptions.jenisJabatan.length === 0 && (
                      <SelectItem value="__empty_jabatan" disabled>Data tidak tersedia</SelectItem>
                    )}
                    {!generateOptionsLoading && generateFilterOptions.jenisJabatan.length > 0 && (
                      generateFilterOptions.jenisJabatan
                        .filter(jabatan => jabatan.count > 0)
                        .map((jabatan) => (
                          <SelectItem key={jabatan.value} value={jabatan.value}>
                            {jabatan.label} ({jabatan.count})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={generateDownloadFilterValue}
                  onValueChange={setGenerateDownloadFilterValue}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih kabupaten" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateOptionsLoading && (
                      <SelectItem value="__loading_kabupaten" disabled>Memuat data...</SelectItem>
                    )}
                    {!generateOptionsLoading && (!generateFilterOptions.kabupatenGroups || generateFilterOptions.kabupatenGroups.length === 0) && (
                      <SelectItem value="__empty_kabupaten" disabled>Data tidak tersedia</SelectItem>
                    )}
                    {!generateOptionsLoading && generateFilterOptions.kabupatenGroups && generateFilterOptions.kabupatenGroups.length > 0 && (
                      (() => {
                        const allKabupaten = generateFilterOptions.kabupatenGroups
                          .filter(group => group.count > 0 && group.kabupaten && group.kabupaten.length > 0)
                          .flatMap(group => group.kabupaten)
                          .filter((kab, index, self) => self.indexOf(kab) === index)
                          .sort();
                        return allKabupaten.length > 0 ? (
                          allKabupaten.map((kab) => (
                            <SelectItem key={kab} value={kab}>
                              {kab}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>Tidak ada data kabupaten</SelectItem>
                        );
                      })()
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            {generateDownloadProgress && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-800">{generateDownloadProgress}</p>
                </div>
              </div>
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong>{' '}
                {isReadOnlyUser ? (
                  <>
                    Proses generate download mungkin memakan waktu beberapa menit jika data banyak. File ZIP{' '}
                    <strong>khusus berisi pengajuan dengan status final_approved</strong> sesuai filter yang dipilih untuk
                    role user (read-only).
                  </>
                ) : (
                  <>
                    Proses generate download mungkin memakan waktu beberapa menit jika data banyak. File ZIP akan berisi
                    semua berkas dari pengajuan dengan status <strong>final_approved</strong> sesuai filter yang dipilih.
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowGenerateDownloadDialog(false);
                setGenerateDownloadFilterValue('');
                setGenerateDownloadProgress('');
              }}
              disabled={generatingDownload}
            >
              Batal
            </Button>
            <Button
              onClick={handleGenerateDownload}
              disabled={generatingDownload || !generateDownloadFilterValue}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {generatingDownload ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate ZIP
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PengajuanIndex;
