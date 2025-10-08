import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';

interface JobType {
  id: number;
  jenis_jabatan: string;
  min_dokumen: number;
  max_dokumen: number;
  required_files: string;
}

interface EditJabatanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengajuanId: string;
  currentJabatan: {
    jabatan_id?: number;
    jenis_jabatan: string;
  };
  onSuccess: () => void;
  token: string | null;
}

export const EditJabatanDialog: React.FC<EditJabatanDialogProps> = ({
  open,
  onOpenChange,
  pengajuanId,
  currentJabatan,
  onSuccess,
  token,
}) => {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [selectedJabatanId, setSelectedJabatanId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchAvailableJabatan();
      setReason('');
      setError(null);
      setSelectedJabatanId(currentJabatan.jabatan_id?.toString() || '');
    }
  }, [open, currentJabatan]);

  const fetchAvailableJabatan = async () => {
    try {
      setLoading(true);
      const response = await apiGet('/api/pengajuan/available-jabatan', token);
      if (response.success) {
        setJobTypes(response.data);
      } else {
        setError(response.message || 'Gagal memuat daftar jabatan');
      }
    } catch (error) {
      console.error('Error fetching available jabatan:', error);
      setError('Terjadi kesalahan saat memuat daftar jabatan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedJabatanId) {
      setError('Pilih jabatan terlebih dahulu');
      return;
    }

    if (!reason.trim()) {
      setError('Alasan perubahan wajib diisi');
      return;
    }

    const selectedJobType = jobTypes.find(jt => jt.id.toString() === selectedJabatanId);
    if (!selectedJobType) {
      setError('Jabatan tidak valid');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await apiPut(
        `/api/pengajuan/${pengajuanId}/edit-jabatan`,
        {
          jabatan_id: selectedJobType.id,
          jenis_jabatan: selectedJobType.jenis_jabatan,
          reason: reason.trim(),
        },
        token
      );

      if (response.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(response.message || 'Gagal mengubah jabatan');
      }
    } catch (error) {
      console.error('Error editing jabatan:', error);
      setError('Terjadi kesalahan saat mengubah jabatan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Jabatan Pengajuan</DialogTitle>
          <DialogDescription>
            Ubah jabatan pengajuan mutasi. Semua perubahan akan dicatat dalam audit log.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Jabatan Saat Ini</Label>
            <div className="p-3 bg-gray-100 rounded-md text-sm">
              {currentJabatan.jenis_jabatan}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan Baru *</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <Select
                value={selectedJabatanId}
                onValueChange={setSelectedJabatanId}
              >
                <SelectTrigger id="jabatan">
                  <SelectValue placeholder="Pilih jabatan..." />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((jobType) => (
                    <SelectItem
                      key={jobType.id}
                      value={jobType.id.toString()}
                    >
                      {jobType.jenis_jabatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Perubahan *</Label>
            <Textarea
              id="reason"
              placeholder="Jelaskan alasan perubahan jabatan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Alasan akan dicatat dalam audit log dan tidak dapat dihapus.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedJabatanId || !reason.trim()}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
