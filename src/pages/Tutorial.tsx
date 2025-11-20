import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpenCheck, PlayCircle, ListChecks, Settings as SettingsIcon } from 'lucide-react';

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartPengajuanTour = () => {
    sessionStorage.setItem('pending_pengajuan_list_tour', 'true');
    sessionStorage.removeItem('pending_pengajuan_detail_tour');
    navigate('/pengajuan');
  };

  const handleGoToTracking = () => {
    navigate('/tracking');
  };

  const handleGoToTrackingSettings = () => {
    navigate('/tracking-status-settings');
  };

  const handleStartTrackingTour = () => {
    sessionStorage.setItem('pending_tracking_settings_tour', 'true');
    sessionStorage.removeItem('pending_tracking_doc_tour');
    navigate('/tracking-status-settings');
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-green-600 font-semibold">Menu Khusus User</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Tutorial & Tracking</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Panduan singkat untuk membantu Anda mengecek dokumen pengajuan serta mencatat progres tracking yang dikerjakan di luar sistem.
        </p>
      </div>

      <Card className="border-green-100 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BookOpenCheck className="h-5 w-5" />
              Panduan Cek Dokumen Pengajuan
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Ikuti tur interaktif untuk memahami cara memfilter pengajuan, membuka daftar kabupaten/kota, dan membaca dokumen Kanwil maupun Kab/Kota.
            </CardDescription>
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">Direkomendasikan</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-3 text-sm text-gray-700">
            <li>• Gunakan filter jenis jabatan agar daftar dokumen lebih fokus.</li>
            <li>• Buka accordion Kanwil untuk melihat daftar kabupaten/kota.</li>
            <li>• Pakai tombol aksi “...” untuk masuk ke detail pengajuan.</li>
            <li>• Di detail, pilih tab Kabupaten/Kota atau Admin Wilayah sesuai dokumen yang ingin diperiksa.</li>
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleStartPengajuanTour}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Mulai Tour Pengajuan
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/pengajuan')}
            >
              Lihat Daftar Pengajuan
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-green-700" />
            Input Tracing & Status Tracking
          </CardTitle>
          <CardDescription>
            Catat progres manual Anda (misalnya dokumen fisik, verifikasi di luar sistem) agar tim pusat punya riwayat yang rapi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-green-600" />
              <p>
                Gunakan menu Tracking untuk mengisi status terbaru dari setiap pengajuan yang Anda proses di luar sistem.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-green-600" />
              <p>
                Atur ulang atau tambah status tracking melalui halaman Setting Status Tracking ketika diperlukan.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleStartTrackingTour}
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Mulai Tour Tracking
            </Button>
            <Button variant="outline" onClick={handleGoToTracking}>
              <ListChecks className="h-4 w-4 mr-2" />
              Buka Tracking
            </Button>
            <Button variant="outline" onClick={handleGoToTrackingSettings}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Setting Status Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialPage;

