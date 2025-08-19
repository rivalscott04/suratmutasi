import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Send, Loader2, AlertCircle, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import JabatanSelectionModal from '@/components/JabatanSelectionModal';

interface PegawaiData {
  nip: string;
  nama: string;
  jabatan: string;
  unit_kerja: string;
  induk_unit: string;
  total_surat: number;
}

interface JobTypeConfig {
  id: number;
  jenis_jabatan: string;
  min_dokumen: number;
  max_dokumen: number;
  required_files: string[];
  is_active: boolean;
}

const PengajuanSelect: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [pegawaiData, setPegawaiData] = useState<Record<string, PegawaiData[]>>({});
  const [selectedPegawai, setSelectedPegawai] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Jabatan selection state
  const [showJabatanModal, setShowJabatanModal] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState<JobTypeConfig | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    // Tidak perlu fetch data pegawai di awal, tunggu sampai jabatan dipilih
  }, [isAuthenticated, navigate]);



  const handleJabatanSelected = (jabatan: JobTypeConfig) => {
    setSelectedJabatan(jabatan);
    // Setelah jabatan dipilih, fetch pegawai yang sesuai dengan jabatan tersebut
    fetchPegawaiByJabatan(jabatan.id);
  };

  const fetchPegawaiByJabatan = async (jabatanId: number) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      // Gunakan endpoint yang sudah ada
      const response = await apiGet('/api/pengajuan/pegawai-grouped', token);
      if (response.success) {
        // Filter pegawai berdasarkan jabatan yang dipilih
        const filteredData: Record<string, PegawaiData[]> = {};
        
        Object.entries(response.data).forEach(([key, pegawaiList]) => {
          const filteredPegawai = (pegawaiList as PegawaiData[]).filter(pegawai => {
            // Filter berdasarkan jabatan yang dipilih
            // Untuk sementara, kita akan menampilkan semua pegawai yang memiliki surat
            // karena belum ada mapping yang jelas antara job type dan jabatan pegawai
            return true; // Tampilkan semua pegawai yang memiliki surat
          });
          
          if (filteredPegawai.length > 0) {
            filteredData[key] = filteredPegawai;
          }
        });
        
        setPegawaiData(filteredData);
        
        // Jika tidak ada data, tampilkan pesan yang sesuai
        if (Object.keys(filteredData).length === 0) {
          setError('Tidak ada pegawai yang tersedia untuk jabatan ini');
        }
      } else {
        setError(response.message || 'Gagal mengambil data pegawai');
      }
    } catch (error) {
      console.error('Error fetching pegawai by jabatan:', error);
      setError('Terjadi kesalahan saat mengambil data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePengajuan = async () => {
    if (!selectedPegawai || !selectedJabatan) return;

    try {
      setSubmitting(true);
      const response = await apiPost('/api/pengajuan', { 
        pegawai_nip: selectedPegawai,
        jabatan_id: selectedJabatan.id 
      }, token);
      if (response.success) {
        // Redirect ke halaman upload file
        navigate(`/pengajuan/${response.data.id}/upload`);
      } else {
        setError(response.message || 'Gagal membuat pengajuan');
      }
    } catch (error) {
      console.error('Error creating pengajuan:', error);
      setError('Terjadi kesalahan saat membuat pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  // Fungsi untuk mendapatkan semua pegawai yang ditampilkan
  const getDisplayedPegawai = () => {
    const allPegawai: PegawaiData[] = [];
    Object.values(pegawaiData).forEach(group => {
      allPegawai.push(...group);
    });

    if (!searchTerm) return allPegawai;

    return allPegawai.filter(pegawai =>
      pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pegawai.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pegawai.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pegawai.nip.includes(searchTerm)
    );
  };

  // Fungsi untuk handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const displayedPegawai = getDisplayedPegawai();
      if (displayedPegawai.length > 0) {
        setSelectedPegawai(displayedPegawai[0].nip); // Hanya pilih yang pertama
      }
    } else {
      setSelectedPegawai(null);
    }
  };

  const filteredData = getDisplayedPegawai();

  // Pagination logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedPegawai(null); // Reset selection when page changes
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
    setSelectedPegawai(null); // Reset selection when searching
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pilih Pegawai untuk Pengajuan
          </CardTitle>
          <div className="text-sm text-gray-600">
            {selectedJabatan 
              ? `Pilih pegawai untuk pengajuan jabatan: ${selectedJabatan.jenis_jabatan}`
              : 'Pilih jabatan terlebih dahulu, kemudian pilih pegawai yang akan diajukan'
            }
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

                     {/* Jabatan Selection */}
           {!selectedJabatan && (
             <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
               <Briefcase className="h-12 w-12 text-green-500 mx-auto mb-4" />
               <h3 className="text-lg font-semibold text-green-800 mb-2">
                 Pilih Jabatan Terlebih Dahulu
               </h3>
               <p className="text-green-600 mb-4">
                 Untuk memulai pengajuan, Anda perlu memilih jenis jabatan yang akan diajukan.
               </p>
               <Button
                 onClick={() => setShowJabatanModal(true)}
                 className="bg-green-600 hover:bg-green-700 text-white"
               >
                 <Briefcase className="h-4 w-4 mr-2" />
                 Pilih Jabatan
               </Button>
             </div>
           )}

          {/* Selected Jabatan Info */}
          {selectedJabatan && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">
                    Jabatan: {selectedJabatan.jenis_jabatan}
                  </h3>
                  <p className="text-sm text-green-600">
                    {selectedJabatan.required_files.length} jenis dokumen diperlukan
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-600 text-white">
                    {selectedJabatan.max_dokumen} dokumen
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJabatanModal(true)}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Ubah Jabatan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pegawai berdasarkan nama, jabatan, unit kerja, atau NIP..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredData.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Menampilkan {filteredData.length} pegawai (halaman {currentPage} dari {totalPages})
              </p>
            )}
          </div>

          {/* DataTable */}
          <div className="border rounded-lg overflow-hidden">
            {!selectedJabatan ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Pilih jabatan terlebih dahulu untuk melihat daftar pegawai</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Memuat data pegawai...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-2">{error}</p>
                  <p className="text-sm text-gray-500">
                    Pastikan sudah ada surat yang dibuat untuk pegawai di menu Template Generator
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPegawai !== null}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Unit Kerja</TableHead>
                      <TableHead>Induk Unit</TableHead>
                      <TableHead className="text-center">Total Surat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {searchTerm ? (
                            'Tidak ada pegawai yang sesuai dengan pencarian'
                          ) : (
                            <div>
                              <p className="mb-2">Tidak ada pegawai yang tersedia</p>
                              <p className="text-sm text-gray-400">
                                Pastikan sudah ada surat yang dibuat untuk pegawai di menu Template Generator
                              </p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((pegawai) => (
                        <TableRow key={pegawai.nip} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedPegawai === pegawai.nip}
                              onCheckedChange={(checked) => {
                                setSelectedPegawai(checked ? pegawai.nip : null);
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{pegawai.nip}</TableCell>
                          <TableCell className="font-medium">{pegawai.nama}</TableCell>
                          <TableCell>{pegawai.jabatan}</TableCell>
                          <TableCell>{pegawai.unit_kerja}</TableCell>
                          <TableCell>{pegawai.induk_unit}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">
                              {pegawai.total_surat} surat
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                    <div className="text-sm text-gray-700">
                      Menampilkan {startIndex + 1} sampai {Math.min(endIndex, totalItems)} dari {totalItems} pegawai
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
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
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleCreatePengajuan}
              disabled={!selectedPegawai || !selectedJabatan || submitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat Pengajuan...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Proses Pengajuan
                </>
              )}
            </Button>
          </div>

          {!selectedPegawai && selectedJabatan && filteredData.length > 0 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Pilih satu pegawai untuk melanjutkan proses pengajuan
            </p>
          )}
        </CardContent>
      </Card>

      {/* Jabatan Selection Modal */}
      <JabatanSelectionModal
        open={showJabatanModal}
        onOpenChange={setShowJabatanModal}
        onJabatanSelected={handleJabatanSelected}
      />
    </div>
  );
};

export default PengajuanSelect; 