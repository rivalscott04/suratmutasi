import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Users, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiGet, apiPost } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PegawaiData {
  nip: string;
  nama: string;
  jabatan: string;
  unit_kerja: string;
  induk_unit: string;
  total_surat: number;
}

const PegawaiSelectionList: React.FC = () => {
  const [pegawaiData, setPegawaiData] = useState<Record<string, PegawaiData[]>>({});
  const [selectedPegawai, setSelectedPegawai] = useState<PegawaiData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    fetchPegawaiData();
  }, []);

  const fetchPegawaiData = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/pengajuan/pegawai-grouped', token);
      console.log('API Response:', data);
      if (data.success) {
        setPegawaiData(data.data);
        console.log('Pegawai data:', data.data);
      } else {
        setError(data.message || 'Gagal mengambil data pegawai');
      }
    } catch (error) {
      console.error('Error fetching pegawai data:', error);
      setError('Terjadi kesalahan saat mengambil data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const handlePegawaiSelect = (pegawai: PegawaiData) => {
    setSelectedPegawai(pegawai);
  };

  const handleProsesPengajuan = async () => {
    if (!selectedPegawai) return;

    try {
      setProcessing(true);
      const data = await apiPost('/api/pengajuan', { pegawai_nip: selectedPegawai.nip }, token);
      if (data.success) {
        navigate(`/pengajuan/${data.data.id}/upload`);
      } else {
        setError(data.message || 'Gagal membuat pengajuan');
      }
    } catch (error) {
      console.error('Error creating pengajuan:', error);
      setError('Terjadi kesalahan saat membuat pengajuan');
    } finally {
      setProcessing(false);
    }
  };

  const filteredData = Object.entries(pegawaiData).reduce((acc, [kabupaten, pegawaiList]) => {
    const filtered = pegawaiList.filter(pegawai =>
      pegawai.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pegawai.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pegawai.unit_kerja.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[kabupaten] = filtered;
    }
    return acc;
  }, {} as Record<string, PegawaiData[]>);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Memuat data pegawai...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pilih Pegawai untuk Pengajuan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari pegawai berdasarkan nama, jabatan, atau unit kerja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {Object.keys(filteredData).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? (
                'Tidak ada pegawai yang sesuai dengan pencarian'
              ) : (
                <div>
                  <p className="mb-2">Tidak ada pegawai dengan surat yang di-generate</p>
                  <p className="text-sm text-gray-400">
                    Pastikan sudah ada surat yang dibuat untuk pegawai di menu Template Generator
                  </p>
                </div>
              )}
            </div>
          ) : (
            Object.entries(filteredData).map(([kabupaten, pegawaiList]) => (
              <div key={kabupaten} className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{kabupaten}</h3>
                <div className="grid gap-3">
                  {pegawaiList.map((pegawai) => (
                    <div
                      key={pegawai.nip}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPegawai?.nip === pegawai.nip
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePegawaiSelect(pegawai)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedPegawai?.nip === pegawai.nip}
                            onChange={() => handlePegawaiSelect(pegawai)}
                          />
                          <div>
                            <div className="font-medium text-gray-900">{pegawai.nama}</div>
                            <div className="text-sm text-gray-600">{pegawai.jabatan}</div>
                            <div className="text-sm text-gray-500">{pegawai.unit_kerja}</div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {pegawai.total_surat} surat
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {selectedPegawai && (
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={handleProsesPengajuan}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  `Proses Pengajuan untuk ${selectedPegawai.nama}`
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PegawaiSelectionList; 