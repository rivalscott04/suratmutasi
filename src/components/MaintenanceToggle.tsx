import React, { useState, useEffect } from 'react';
import { Wrench, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiPost, apiGet } from '../lib/api';

interface MaintenanceStatus {
  isMaintenanceMode: boolean;
  message: string;
  startTime?: string;
  endTime?: string;
}

interface MaintenanceHistory {
  id: string;
  isActive: boolean;
  message: string;
  startTime: string;
  endTime?: string;
  createdAt: string;
  createdByUser?: {
    full_name: string;
    email: string;
  };
}

const MaintenanceToggle: React.FC = () => {
  const { user, token } = useAuth();
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [toggleForm, setToggleForm] = useState({
    isActive: false,
    message: '',
    endTime: ''
  });

  useEffect(() => {
    if (token) {
      fetchMaintenanceStatus();
      fetchHistory();
    }
  }, [token]);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await apiGet('/api/maintenance/status', token);
      setMaintenanceStatus(response);
      setToggleForm(prev => ({
        ...prev,
        isActive: response.isMaintenanceMode,
        message: response.message || ''
      }));
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await apiGet('/api/maintenance/history', token);
      setHistory(response.history || []);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    }
  };

  const handleToggle = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      await apiPost('/api/maintenance/toggle', {
        isActive: toggleForm.isActive,
        message: toggleForm.message || 'Sistem sedang dalam mode maintenance',
        endTime: toggleForm.endTime || null
      }, token);
      
      await fetchMaintenanceStatus();
      await fetchHistory();
      
      // Show success message with custom modal
      const successMessage = `Maintenance mode ${toggleForm.isActive ? 'diaktifkan' : 'dinonaktifkan'} berhasil!`;
      
      // Create custom success modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-200';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold mb-2 text-gray-900">Berhasil!</h2>
          <p class="text-gray-600 mb-6 text-center">${successMessage}</p>
          <button
            class="w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            onclick="this.closest('.fixed').remove()"
          >
            Tutup
          </button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 3000);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      
      // Create custom error modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in-0 duration-200';
      modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold mb-2 text-gray-900">Gagal!</h2>
          <p class="text-gray-600 mb-6 text-center">Gagal mengubah status maintenance mode. Silakan coba lagi.</p>
          <button
            class="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-lg font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            onclick="this.closest('.fixed').remove()"
          >
            Tutup
          </button>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for superadmin
  if (user?.role !== 'admin' || user?.office_id !== null) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Wrench className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
          <p className="text-sm text-gray-500">Kelola status maintenance sistem</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {maintenanceStatus?.isMaintenanceMode ? (
            <>
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-600 font-medium">Maintenance Mode Aktif</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">Sistem Normal</span>
            </>
          )}
        </div>
        
        {maintenanceStatus?.message && (
          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
            {maintenanceStatus.message}
          </p>
        )}
        
        {maintenanceStatus?.startTime && (
          <p className="text-gray-500 text-xs mt-2">
            Dimulai: {new Date(maintenanceStatus.startTime).toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {/* Toggle Form */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={toggleForm.isActive}
            onChange={(e) => setToggleForm(prev => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Aktifkan Maintenance Mode
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pesan Maintenance
          </label>
          <textarea
            value={toggleForm.message}
            onChange={(e) => setToggleForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Masukkan pesan untuk pengguna..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimasi Selesai (Opsional)
          </label>
          <input
            type="datetime-local"
            value={toggleForm.endTime}
            onChange={(e) => setToggleForm(prev => ({ ...prev, endTime: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            toggleForm.isActive
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            'Memproses...'
          ) : (
            toggleForm.isActive ? 'Aktifkan Maintenance Mode' : 'Nonaktifkan Maintenance Mode'
          )}
        </button>
      </div>

      {/* History Toggle */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Clock className="w-4 h-4" />
          {showHistory ? 'Sembunyikan' : 'Tampilkan'} Riwayat Maintenance
        </button>

        {showHistory && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {history.map((record) => (
              <div key={record.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {record.isActive ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    record.isActive ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {record.isActive ? 'Diaktifkan' : 'Dinonaktifkan'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(record.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                
                {record.message && (
                  <p className="text-sm text-gray-600 mb-1">{record.message}</p>
                )}
                
                {record.createdByUser && (
                  <p className="text-xs text-gray-500">
                    Oleh: {record.createdByUser.full_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceToggle;
