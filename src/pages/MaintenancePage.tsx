import React, { useState, useEffect } from 'react';
import { Wrench, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiGet } from '../lib/api';

interface MaintenanceInfo {
  isMaintenanceMode: boolean;
  message: string;
  startTime?: string;
  endTime?: string;
}

const MaintenancePage: React.FC = () => {
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchMaintenanceStatus();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (maintenanceInfo?.endTime) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const endTime = new Date(maintenanceInfo.endTime!).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Waktu maintenance telah berakhir');
        }
      };

      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [maintenanceInfo?.endTime]);

  const fetchMaintenanceStatus = async () => {
    try {
      setIsRefreshing(true);
      const data = await apiGet('/api/maintenance/status');
      setMaintenanceInfo(data);
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchMaintenanceStatus();
  };

  return (
    <div className="h-screen w-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="w-full h-full">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            
            {/* Left Side - Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Logo & Title */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                        <div>
                          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Mode Maintenance
                          </h1>
                          <p className="text-gray-600 font-medium text-lg">SI-IMUT</p>
                        </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-8">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  {maintenanceInfo?.message || 'Sistem sedang dalam mode maintenance untuk perbaikan dan peningkatan.'}
                </p>
              </div>

              {/* Time Information */}
              {maintenanceInfo?.startTime && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold text-base">Maintenance Dimulai:</span>
                  </div>
                  <p className="text-gray-800 text-base font-medium">
                    {new Date(maintenanceInfo.startTime).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Countdown Timer - Clean Design */}
              {maintenanceInfo?.endTime && timeLeft && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-800 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-lg">Estimasi Selesai:</span>
                  </div>
                  
                        {/* Timer Display - Clean Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          {timeLeft.split(' ').map((unit, index) => {
                            const match = unit.match(/(\d+)([a-zA-Z]+)/);
                            const value = match ? match[1] : '0';
                            const labels = ['Hari', 'Jam', 'Menit', 'Detik'];
                            return (
                              <div key={index} className="text-center">
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                  <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
                                  <div className="text-sm text-gray-600 font-medium">{labels[index]}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                  
                  <p className="text-gray-700 text-base text-center font-medium">
                    {new Date(maintenanceInfo.endTime).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}

              {/* Action Buttons - Clean Design */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Memeriksa...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Periksa Status
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Muat Ulang
                </button>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-base">
                  Terima kasih atas kesabaran Anda. Kami sedang bekerja untuk memberikan pengalaman yang lebih baik.
                </p>
              </div>
            </div>

            {/* Right Side - Clean Illustration */}
            <div className="bg-gray-50 p-8 md:p-12 flex items-center justify-center relative">
              {/* Main Illustration - Clean & Minimalist */}
              <div className="relative z-10 max-w-md w-full">
                {/* Smartphone with Clean Interface */}
                <div className="relative mb-8">
                  <div className="bg-gray-200 rounded-2xl p-4 shadow-lg">
                    <div className="bg-white rounded-xl p-6 text-center">
                      {/* Clean App Interface - No Redundant Banner */}
                      <div className="space-y-3 mb-4">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      {/* Clean Status Indicator */}
                      <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                        <div className="text-gray-600 text-sm font-medium">Sistem sedang diperbaiki</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Construction Barrier - Clean */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 h-6 w-12 border border-gray-800" style={{
                      background: 'repeating-linear-gradient(45deg, #fbbf24, #fbbf24 3px, #000 3px, #000 6px)'
                    }}></div>
                  </div>
                </div>

                {/* Clean Gears */}
                <div className="absolute top-4 right-4 w-10 h-10 text-gray-400 opacity-60">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full animate-spin" style={{animationDuration: '3s'}}>
                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.04 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                  </svg>
                </div>

                <div className="absolute bottom-4 left-4 w-6 h-6 text-gray-400 opacity-60">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full animate-spin" style={{animationDuration: '4s', animationDirection: 'reverse'}}>
                    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.04 4.95,18.95L7.44,17.95C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.95L19.05,18.95C19.27,19.04 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                  </svg>
                </div>

                {/* Wrench Tool - Clean */}
                <div className="absolute top-1/2 right-8 w-12 h-12 text-gray-500 opacity-70">
                  <Wrench className="w-full h-full" />
                </div>

                {/* Traffic Cone - Clean */}
                <div className="absolute bottom-8 right-8 w-6 h-10 bg-orange-500 transform rotate-12 opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
