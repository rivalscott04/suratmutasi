import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Edit,
  Package,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
import Shepherd, { type Tour } from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface TrackingStatus {
  id: number;
  status_name: string;
  status_code: string;
  description?: string;
  sort_order: number;
}

interface TrackingRecord {
  id: string;
  tracking_status_id?: number;
  status_name: string;
  notes?: string;
  estimated_days?: number;
  actual_completion_date?: string;
  created_at: string;
  tracked_by_name: string;
}

interface PengajuanData {
  id: string;
  pegawai_nip: string;
  jenis_jabatan: string;
  total_dokumen: number;
  final_approved_at: string;
  pegawai?: {
    nama: string;
    nip: string;
    office?: {
      nama_kantor: string;
      alamat: string;
    };
  };
  office?: {
    id: string;
    nama_kantor: string;
    kabkota: string;
    alamat: string;
  };
  tracking?: Array<{
    id: string;
    tracking_status_id?: number;
    status_name: string;
    notes?: string;
    estimated_days?: number;
    created_at: string;
    tracked_by_name: string;
  }>;
}

const AdminPusatTracking: React.FC = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [pengajuan, setPengajuan] = useState<PengajuanData[]>([]);
  const [trackingStatuses, setTrackingStatuses] = useState<TrackingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPengajuan, setSelectedPengajuan] = useState<PengajuanData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Paging state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Form state
  const [formData, setFormData] = useState({
    tracking_status_id: '',
    notes: '',
    estimated_days: ''
  });
  const trackingDocTourRef = useRef<Tour | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pengajuan yang sudah final approved
      const pengajuanResponse = await apiGet('/api/tracking/pengajuan', token);
      if (pengajuanResponse.success) {
        setPengajuan(pengajuanResponse.data);
      }
      
      // Load tracking status master
      const statusResponse = await apiGet('/api/tracking/status-master', token);
      if (statusResponse.success) {
        setTrackingStatuses(statusResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (pengajuanData: PengajuanData) => {
    setSelectedPengajuan(pengajuanData);
    
    // Ambil status tracking terbaru sebagai default
    const latestTracking = getLatestTracking(pengajuanData);
    const defaultStatusId = latestTracking ? latestTracking.tracking_status_id?.toString() : '';
    
    console.log('Latest tracking:', latestTracking);
    console.log('Default status ID:', defaultStatusId);
    
    setFormData({
      tracking_status_id: defaultStatusId || '',
      notes: '',
      estimated_days: ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPengajuan || !formData.tracking_status_id) {
      toast({
        title: 'Error',
        description: 'Status tracking harus diisi',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await apiPost(
        `/api/tracking/pengajuan/${selectedPengajuan.id}`,
        {
          tracking_status_id: parseInt(formData.tracking_status_id),
          notes: formData.notes || null,
          estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : null
        },
        token
      );

      if (response.success) {
        toast({
          title: 'Berhasil',
          description: 'Status tracking berhasil disimpan'
        });
        
        setIsDialogOpen(false);
        loadData(); // Reload data
      }
      
    } catch (error) {
      console.error('Error submitting tracking:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan status tracking',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getLatestTracking = (pengajuan: PengajuanData) => {
    if (!pengajuan.tracking || pengajuan.tracking.length === 0) return null;
    return pengajuan.tracking[0]; // Assuming tracking is sorted by created_at DESC
  };

  const filteredPengajuan = pengajuan.filter(p => {
    const matchesSearch = p.pegawai_nip.toLowerCase().includes(search.toLowerCase()) ||
      p.jenis_jabatan.toLowerCase().includes(search.toLowerCase()) ||
      p.office?.kabkota.toLowerCase().includes(search.toLowerCase()) ||
      p.office?.nama_kantor.toLowerCase().includes(search.toLowerCase()) ||
      p.pegawai?.nama.toLowerCase().includes(search.toLowerCase());
    
    const matchesJabatan = selectedJabatan === 'all' || p.jenis_jabatan === selectedJabatan;
    
    // Filter by tracking status
    const latestTracking = getLatestTracking(p);
    let matchesStatus = true;
    
    if (selectedStatus === 'all') {
      matchesStatus = true;
    } else if (selectedStatus === 'no-tracking') {
      matchesStatus = latestTracking === null;
    } else {
      matchesStatus = latestTracking?.status_name === selectedStatus;
    }
    
    return matchesSearch && matchesJabatan && matchesStatus;
  });

  // Reset ke halaman 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedJabatan, selectedStatus]);

  // Paging calculations
  const totalItems = filteredPengajuan.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPengajuan = filteredPengajuan.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) {
      end = maxPagesToShow;
      start = 1;
    } else if (currentPage >= totalPages - 2) {
      end = totalPages;
      start = totalPages - maxPagesToShow + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
  };

  const getUniqueJabatan = () => {
    const jabatanSet = new Set(pengajuan.map(p => p.jenis_jabatan));
    const uniqueJabatan = Array.from(jabatanSet).sort();
    console.log('Unique jabatan:', uniqueJabatan);
    return uniqueJabatan;
  };


  const getStatusBadgeVariant = (statusName: string) => {
    if (statusName.includes('Selesai')) return 'default';
    if (statusName.includes('Diproses')) return 'secondary';
    if (statusName.includes('Disposisi')) return 'outline';
    return 'secondary';
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Status selesai/completed - Hijau
    if (statusLower.includes('selesai') || statusLower.includes('completed')) {
      return 'bg-green-100 text-green-800';
    }
    
    // Status diterima/received - Biru
    if (statusLower.includes('diterima') || statusLower.includes('received') || statusLower.includes('pusat')) {
      return 'bg-blue-100 text-blue-800';
    }
    
    // Status dalam proses/in progress - Orange
    if (statusLower.includes('proses') || statusLower.includes('progress') || statusLower.includes('sedang')) {
      return 'bg-orange-100 text-orange-800';
    }
    
    // Status menunggu/waiting - Kuning
    if (statusLower.includes('menunggu') || statusLower.includes('waiting') || statusLower.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    
    // Status ditolak/rejected - Merah
    if (statusLower.includes('ditolak') || statusLower.includes('rejected') || statusLower.includes('gagal')) {
      return 'bg-red-100 text-red-800';
    }
    
    // Status review/verifikasi - Ungu
    if (statusLower.includes('review') || statusLower.includes('verifikasi') || statusLower.includes('cek')) {
      return 'bg-purple-100 text-purple-800';
    }
    
    // Status default - Abu-abu
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Status selesai/completed
    if (statusLower.includes('selesai') || statusLower.includes('completed') || statusLower.includes('selesai')) {
      return <CheckCircle className="h-4 w-4" />;
    }
    
    // Status diterima/received
    if (statusLower.includes('diterima') || statusLower.includes('received') || statusLower.includes('pusat')) {
      return <Package className="h-4 w-4" />;
    }
    
    // Status dalam proses/in progress
    if (statusLower.includes('proses') || statusLower.includes('progress') || statusLower.includes('sedang')) {
      return <Loader2 className="h-4 w-4" />;
    }
    
    // Status menunggu/waiting
    if (statusLower.includes('menunggu') || statusLower.includes('waiting') || statusLower.includes('pending')) {
      return <Clock className="h-4 w-4" />;
    }
    
    // Status ditolak/rejected
    if (statusLower.includes('ditolak') || statusLower.includes('rejected') || statusLower.includes('gagal')) {
      return <XCircle className="h-4 w-4" />;
    }
    
    // Status review/verifikasi
    if (statusLower.includes('review') || statusLower.includes('verifikasi') || statusLower.includes('cek')) {
      return <Search className="h-4 w-4" />;
    }
    
    // Status default
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatEstimatedDays = (days: number) => {
    if (days === 1) return '1 hari';
    if (days < 7) return `${days} hari`;
    if (days < 30) return `${Math.ceil(days / 7)} minggu`;
    return `${Math.ceil(days / 30)} bulan`;
  };

  const startTrackingDocTour = useCallback(() => {
    if (trackingDocTourRef.current) {
      trackingDocTourRef.current.cancel();
      trackingDocTourRef.current = null;
    }

    if (loading) {
      toast({
        title: 'Tunggu sebentar',
        description: 'Data tracking sedang dimuat. Coba lagi setelah data tampil.',
      });
      return;
    }

    if (paginatedPengajuan.length === 0) {
      toast({
        title: 'Belum ada data',
        description: 'Tidak ada pengajuan final approved untuk ditracking saat ini.',
        variant: 'destructive'
      });
      return;
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'bg-white shadow-xl rounded-lg border border-gray-200 text-gray-800',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    });

    const interactionStatus: Record<string, boolean> = {};
    const interactionCleanup: Array<() => void> = [];

    const registerInteractionWatcher = (key: string, selector: string) => {
      interactionStatus[key] = false;
      const element = document.querySelector(selector);
      if (!element) return;
      const handler = () => {
        interactionStatus[key] = true;
      };
      element.addEventListener('click', handler);
      interactionCleanup.push(() => element.removeEventListener('click', handler));
    };

    const cleanupInteractions = () => {
      interactionCleanup.forEach((cleanup) => cleanup());
    };

    const ensureDialogOpen = () => new Promise<void>((resolve) => {
      if (!isDialogOpen) {
        if (paginatedPengajuan[0]) {
          handleOpenDialog(paginatedPengajuan[0]);
        }
        setTimeout(resolve, 400);
      } else {
        resolve();
      }
    });

    const buildButtons = (options?: { showBack?: boolean; requireKey?: string; requireMessage?: string; isFinal?: boolean }) => {
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
          if (options?.requireKey && !interactionStatus[options.requireKey]) {
            toast({
              title: 'Aksi diperlukan',
              description: options.requireMessage || 'Ikuti instruksi pada langkah ini sebelum melanjutkan.',
              variant: 'destructive'
            });
            return;
          }
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
      id: 'tracking-doc-intro',
      title: 'Tracking Dokumen',
      text: 'Menu ini dipakai untuk mencatat progres pengolahan berkas yang sudah final approved.',
      attachTo: { element: '[data-tour-id="tracking-doc-header"]', on: 'bottom' },
      buttons: buildButtons()
    });

    tour.addStep({
      id: 'tracking-filters',
      title: 'Filter & Pencarian',
      text: 'Gunakan pencarian, filter jabatan, atau filter status tracking untuk fokus pada berkas tertentu.',
      attachTo: { element: '[data-tour-id="tracking-doc-filter"]', on: 'top' },
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'tracking-card',
      title: 'Pilih Pegawai',
      text: 'Setiap kartu menampilkan ringkasan pegawai dan status tracking terakhir. Pilih salah satu yang ingin Anda update.',
      attachTo: { element: '[data-tour-id="tracking-doc-card"]', on: 'top' },
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'tracking-input-button',
      title: 'Mulai Input Tracking',
      text: 'Klik tombol "Input Tracking" pada pegawai yang ingin diperbarui.',
      attachTo: { element: '[data-tour-id="tracking-input-button"]', on: 'left' },
      beforeShowPromise: () => {
        registerInteractionWatcher('openTrackingDialog', '[data-tour-id="tracking-input-button"]');
        return Promise.resolve();
      },
      buttons: buildButtons({
        showBack: true,
        requireKey: 'openTrackingDialog',
        requireMessage: 'Klik tombol Input/Update Tracking terlebih dahulu.'
      })
    });

    tour.addStep({
      id: 'tracking-status-select',
      title: 'Pilih Status Tracking',
      text: 'Tentukan status terbaru sesuai progres fisik yang sedang Anda kerjakan.',
      attachTo: { element: '[data-tour-id="tracking-status-select"]', on: 'top' },
      beforeShowPromise: ensureDialogOpen,
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'tracking-notes',
      title: 'Catatan & Estimasi',
      text: 'Tambahkan catatan penting dan estimasi penyelesaian (opsional) agar tim lain tahu progresnya.',
      attachTo: { element: '[data-tour-id="tracking-notes-fields"]', on: 'top' },
      beforeShowPromise: ensureDialogOpen,
      buttons: buildButtons({ showBack: true })
    });

    tour.addStep({
      id: 'tracking-save',
      title: 'Simpan Data Tracking',
      text: 'Klik Simpan untuk mencatat status terbaru. Anda bisa mengulang langkah ini kapan saja.',
      attachTo: { element: '[data-tour-id="tracking-save-button"]', on: 'top' },
      beforeShowPromise: ensureDialogOpen,
      buttons: buildButtons({ showBack: true, isFinal: true })
    });

    tour.on('complete', () => {
      cleanupInteractions();
      sessionStorage.removeItem('pending_tracking_doc_tour');
      trackingDocTourRef.current = null;
      toast({
        title: 'Tutorial selesai',
        description: 'Anda siap mencatat progres tracking secara mandiri.',
      });
    });

    tour.on('cancel', () => {
      cleanupInteractions();
      sessionStorage.removeItem('pending_tracking_doc_tour');
      trackingDocTourRef.current = null;
    });

    tour.start();
    trackingDocTourRef.current = tour;
  }, [handleOpenDialog, isDialogOpen, loading, paginatedPengajuan, toast]);

  useEffect(() => {
    if (!loading && sessionStorage.getItem('pending_tracking_doc_tour') === 'true') {
      startTrackingDocTour();
    }
  }, [loading, startTrackingDocTour]);

  useEffect(() => {
    return () => {
      if (trackingDocTourRef.current) {
        trackingDocTourRef.current.cancel();
        trackingDocTourRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Tracking Dokumen" subtitle="Input status tracking untuk berkas yang sudah final approved" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div data-tour-id="tracking-doc-header" className="flex-1">
          <PageHeader 
            title="Tracking Dokumen" 
            subtitle="Input status tracking untuk berkas yang sudah final approved" 
          />
        </div>
        <Button
          variant="outline"
          onClick={startTrackingDocTour}
          className="border-green-200 text-green-700"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Mulai Tutorial Tracking
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6" data-tour-id="tracking-doc-filter">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan NIP, jenis jabatan, atau kabupaten..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-64">
              <Select
                value={selectedJabatan}
                onValueChange={setSelectedJabatan}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jabatan</SelectItem>
                  {getUniqueJabatan().map((jabatan) => (
                    <SelectItem key={jabatan} value={jabatan}>
                      {jabatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-64">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="no-tracking">Belum Ada Tracking</SelectItem>
                  {trackingStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.status_name}>
                      {status.status_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(search || selectedJabatan !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setSelectedJabatan('all');
                  setSelectedStatus('all');
                }}
                className="px-4"
              >
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pengajuan List */}
      <div className="space-y-4">
        {filteredPengajuan.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada berkas yang perlu ditrack</p>
            </CardContent>
          </Card>
        ) : (
          paginatedPengajuan.map((pengajuanData, idx) => {
            const latestTracking = getLatestTracking(pengajuanData);
            const hasTracking = latestTracking !== null;
            const isFirstCard = idx === 0;
            
            return (
              <Card
                key={pengajuanData.id}
                className="hover:shadow-md transition-shadow"
                data-tour-id={isFirstCard ? 'tracking-doc-card' : undefined}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header dengan Nama sebagai fokus utama */}
                      <div className="mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-xl text-gray-900">{pengajuanData.pegawai?.nama || 'Nama tidak tersedia'}</h3>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700">
                            {pengajuanData.jenis_jabatan}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">NIP: {pengajuanData.pegawai_nip}</p>
                      </div>
                      
                      {/* Informasi Detail */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span>{pengajuanData.office?.kabkota || pengajuanData.office?.nama_kantor || 'Lokasi tidak tersedia'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-700">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{pengajuanData.total_dokumen} dokumen</span>
                        </div>
                        
                        {/* Estimasi atau Status */}
                        {hasTracking ? (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Estimasi: {latestTracking.estimated_days ? formatEstimatedDays(latestTracking.estimated_days) : 'Belum ada estimasi'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Belum ada estimasi</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Status Tracking */}
                      {hasTracking && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(latestTracking.status_name)}`}>
                            {getStatusIcon(latestTracking.status_name)}
                            <span>{latestTracking.status_name}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {hasTracking && latestTracking.notes && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 italic">"{latestTracking.notes}"</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleOpenDialog(pengajuanData)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-tour-id={isFirstCard ? 'tracking-input-button' : undefined}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {hasTracking ? 'Update Tracking' : 'Input Tracking'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      {filteredPengajuan.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Menampilkan {Math.min(totalItems, startIndex + 1)}–{Math.min(totalItems, endIndex)} dari {totalItems} data
          </div>
          <div className="flex items-center gap-3">
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(parseInt(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Jumlah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / halaman</SelectItem>
                <SelectItem value="25">25 / halaman</SelectItem>
                <SelectItem value="50">50 / halaman</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                Prev
              </Button>
              {getPageNumbers().map((n) => (
                <Button
                  key={n}
                  variant={n === currentPage ? 'default' : 'outline'}
                  className={n === currentPage ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </Button>
              ))}
              <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Status Tracking</DialogTitle>
          </DialogHeader>
          
          {selectedPengajuan && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedPengajuan.pegawai?.nama || selectedPengajuan.pegawai_nip}</p>
                <p className="text-sm text-gray-600">NIP: {selectedPengajuan.pegawai_nip}</p>
                <p className="text-sm text-gray-600">{selectedPengajuan.jenis_jabatan}</p>
                <p className="text-sm text-gray-600">{selectedPengajuan.office?.kabkota || selectedPengajuan.office?.nama_kantor || 'N/A'}</p>
              </div>

              <div className="space-y-4">
                <div data-tour-id="tracking-status-select">
                  <Label htmlFor="status">Update Status Tracking *</Label>
                  <Select
                    value={formData.tracking_status_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tracking_status_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status tracking baru" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackingStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div data-tour-id="tracking-notes-fields" className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      placeholder="Catatan tambahan (opsional)"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estimated_days">Estimasi Penyelesaian (hari)</Label>
                    <Input
                      id="estimated_days"
                      type="number"
                      placeholder="Contoh: 2"
                      value={formData.estimated_days}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow positive integers
                        if (value === '' || /^\d+$/.test(value)) {
                          setFormData(prev => ({ ...prev, estimated_days: value }));
                        }
                      }}
                      min="1"
                      step="1"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.tracking_status_id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-tour-id="tracking-save-button"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPusatTracking;
