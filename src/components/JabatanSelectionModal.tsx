import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';

interface JobTypeConfig {
  id: number;
  jenis_jabatan: string;
  min_dokumen: number;
  max_dokumen: number;
  required_files: string[];
  is_active: boolean;
}

interface JabatanSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJabatanSelected: (jabatan: JobTypeConfig) => void;
}

const JabatanSelectionModal: React.FC<JabatanSelectionModalProps> = ({
  open,
  onOpenChange,
  onJabatanSelected
}) => {
  const { token } = useAuth();
  const [jobTypes, setJobTypes] = useState<JobTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJabatan, setSelectedJabatan] = useState<JobTypeConfig | null>(null);

  useEffect(() => {
    if (open) {
      fetchJobTypes();
    }
  }, [open]);

  const fetchJobTypes = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/job-type-configurations?active_only=true', token);
      if (response.success) {
        setJobTypes(response.data);
      }
    } catch (error) {
      console.error('Error fetching job types:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobTypes = jobTypes.filter(job =>
    job.jenis_jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJabatanSelect = (jabatan: JobTypeConfig) => {
    setSelectedJabatan(jabatan);
  };

  const handleConfirm = () => {
    if (selectedJabatan) {
      onJabatanSelected(selectedJabatan);
      onOpenChange(false);
      setSelectedJabatan(null);
      setSearchTerm('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedJabatan(null);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-5 w-5 text-green-600" />
            Pilih Jabatan untuk Pengajuan
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Pilih jenis jabatan yang akan diajukan. Setiap jabatan memiliki persyaratan dokumen yang berbeda.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Job Types Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2 text-green-600" />
              <span>Memuat data jabatan...</span>
            </div>
          ) : filteredJobTypes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada jabatan yang sesuai dengan pencarian' : 'Tidak ada jabatan yang tersedia'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobTypes.map((job) => (
                <Card
                  key={job.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedJabatan?.id === job.id
                      ? 'ring-2 ring-green-500 bg-green-50 border-green-200'
                      : 'hover:border-green-300'
                  }`}
                  onClick={() => handleJabatanSelect(job)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {job.jenis_jabatan}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Aktif
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Dokumen:</span>
                        <span className="font-semibold text-green-600">{job.max_dokumen}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Min Dokumen:</span>
                        <span className="text-sm text-gray-500">{job.min_dokumen}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Jenis File:</span>
                        <span className="text-sm text-gray-500">{job.required_files.length} jenis</span>
                      </div>
                    </div>
                    
                    {selectedJabatan?.id === job.id && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Dipilih
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selection Summary */}
          {selectedJabatan && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Jabatan yang Dipilih:</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-700">{selectedJabatan.jenis_jabatan}</p>
                  <p className="text-sm text-green-600">
                    {selectedJabatan.required_files.length} jenis dokumen diperlukan
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">
                  {selectedJabatan.max_dokumen} dokumen
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedJabatan}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Pilih Jabatan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JabatanSelectionModal;
