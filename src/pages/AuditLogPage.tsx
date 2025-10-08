import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuditLogCard } from '@/components/AuditLogCard';

const AuditLogPage: React.FC = () => {
  const { id: pengajuanId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              Anda tidak memiliki akses untuk melihat audit log.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogCard
            pengajuanId={pengajuanId || ''}
            token={token}
            isAdmin={isAdmin}
            showOnlyLatest={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;
