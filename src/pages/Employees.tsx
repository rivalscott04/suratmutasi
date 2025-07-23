import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const Employees: React.FC = () => {
  const { token, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet('/api/employees', token)
      .then(res => setEmployees(res.employees || []))
      .catch(err => setError(err.message || 'Gagal mengambil data pegawai'))
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading || loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pegawai</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-error mb-4">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>NIP</th>
                    <th>Nama</th>
                    <th>Pangkat/Golongan</th>
                    <th>Jabatan</th>
                    <th>Unit Kerja</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center">Tidak ada data pegawai</td>
                    </tr>
                  ) : (
                    employees.map((emp, i) => (
                      <tr key={emp.id}>
                        <td>{i + 1}</td>
                        <td>{emp.nip}</td>
                        <td>{emp.nama}</td>
                        <td>{emp.golongan}</td>
                        <td>{emp.jabatan}</td>
                        <td>{emp.unit_kerja}</td>
                        <td>{emp.aktif ? 'Aktif' : 'Nonaktif'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees; 