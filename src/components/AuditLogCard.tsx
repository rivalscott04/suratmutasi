import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Clock, User, FileEdit, AlertCircle, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface AuditLogEntry {
  id: string;
  pengajuan_id: string;
  action: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  reason?: string;
  changed_by: string;
  changed_by_name: string;
  changed_at: string;
  changer?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface AuditLogCardProps {
  pengajuanId: string;
  token: string | null;
  isAdmin: boolean;
  showOnlyLatest?: boolean; // New prop untuk cuma tampil 1 terbaru
  onViewAll?: () => void; // Callback untuk buka halaman detail
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export const AuditLogCard: React.FC<AuditLogCardProps> = ({
  pengajuanId,
  token,
  isAdmin,
  showOnlyLatest = false,
  onViewAll,
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin && pengajuanId) {
      fetchAuditLogs();
    }
  }, [isAdmin, pengajuanId, currentPage]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Jika showOnlyLatest, cuma ambil 1 data terbaru
      const limit = showOnlyLatest ? 1 : 10;
      const response = await apiGet(`/api/pengajuan/${pengajuanId}/audit-log?page=${currentPage}&limit=${limit}`, token);
      
      if (response.success) {
        setAuditLogs(response.data.audit_logs);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Gagal memuat audit log');
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
      setError('Terjadi kesalahan saat memuat audit log');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'jabatan_changed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileEdit className="h-3 w-3 mr-1" />
            Ubah Jabatan
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {action}
          </Badge>
        );
    }
  };

  const parseValue = (value: string | undefined) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            Belum ada perubahan yang dicatat
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {showOnlyLatest ? 'Perubahan Terbaru' : 'Audit Log'}
            {!showOnlyLatest && (
              <Badge variant="outline" className="ml-2">
                {pagination?.total_count || auditLogs.length} perubahan
              </Badge>
            )}
          </div>
          {showOnlyLatest && pagination && pagination.total_count > 1 && onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              Lihat Semua
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs.map((log, index) => {
            const oldValue = parseValue(log.old_value);
            const newValue = parseValue(log.new_value);

            return (
              <div key={log.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-gray-500">
                        {formatDate(log.changed_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{log.changed_by_name}</span>
                    <span className="text-gray-500">
                      ({log.changer?.email || log.changed_by})
                    </span>
                  </div>

                  {oldValue && newValue && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-500 font-medium">Dari:</span>
                        <div className="mt-1 text-sm bg-white border border-gray-200 rounded p-2">
                          {typeof oldValue === 'object' && oldValue.jenis_jabatan ? 
                            oldValue.jenis_jabatan : 
                            (typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue)
                          }
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500 font-medium">Ke:</span>
                        <div className="mt-1 text-sm bg-white border border-gray-200 rounded p-2">
                          {typeof newValue === 'object' && newValue.jenis_jabatan ? 
                            newValue.jenis_jabatan : 
                            (typeof newValue === 'object' ? JSON.stringify(newValue) : newValue)
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  {log.reason && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Alasan:
                      </p>
                      <p className="text-sm text-gray-700">{log.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls - hanya tampil jika bukan showOnlyLatest */}
        {!showOnlyLatest && pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Halaman {pagination.current_page} dari {pagination.total_pages}
              {' '}({pagination.total_count} total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.has_prev || loading}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.has_next || loading}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
