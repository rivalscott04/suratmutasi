import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const Letters: React.FC = () => {
  const { token } = useAuth();
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'letter_number'|'template_name'|'tanggal'|'status'>('letter_number');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');
  const filteredLetters = letters.filter(l =>
    l.letter_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.template_name?.toLowerCase().includes(search.toLowerCase())
  );
  const sortedLetters = [...filteredLetters].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    if (sortBy === 'tanggal') {
      aVal = a.form_data?.tanggal || '';
      bVal = b.form_data?.tanggal || '';
    }
    if (sortDir === 'asc') return String(aVal).localeCompare(String(bVal));
    return String(bVal).localeCompare(String(aVal));
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet('/api/letters', token)
      .then(res => setLetters(res.letters || []))
      .catch(() => setError('Gagal mengambil data surat'))
      .finally(() => setLoading(false));
  }, [token]);

  // Ringkasan
  const total = letters.length;
  const byStatus = (status: string) => letters.filter(l => l.status === status).length;
  const templateCount: Record<string, number> = {};
  letters.forEach(l => {
    if (l.template_name) templateCount[l.template_name] = (templateCount[l.template_name] || 0) + 1;
  });
  const mostTemplate = Object.entries(templateCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  // Helper badge status
  const getStatusBadge = (status: string) => {
    if (status === 'generated') return <Badge className="bg-green-100 text-green-700 border-green-200">Generated</Badge>;
    if (status === 'draft') return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Draft</Badge>;
    if (status === 'signed') return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Signed</Badge>;
    return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Surat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Surat Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{byStatus('generated')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Template Terbanyak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="w-5 h-5 text-green-700" /> {mostTemplate}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Surat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <input
                type="text"
                className="input input-bordered w-full md:w-64"
                placeholder="Cari nomor atau template..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div>Loading surat...</div>
            ) : error ? (
              <div className="text-error">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => {setSortBy('letter_number');setSortDir(sortDir==='asc'?'desc':'asc')}}>
                        Nomor Surat {sortBy==='letter_number' ? (sortDir==='asc'? '▲':'▼') : ''}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => {setSortBy('template_name');setSortDir(sortDir==='asc'?'desc':'asc')}}>
                        Template {sortBy==='template_name' ? (sortDir==='asc'? '▲':'▼') : ''}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => {setSortBy('tanggal');setSortDir(sortDir==='asc'?'desc':'asc')}}>
                        Tanggal {sortBy==='tanggal' ? (sortDir==='asc'? '▲':'▼') : ''}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => {setSortBy('status');setSortDir(sortDir==='asc'?'desc':'asc')}}>
                        Status {sortBy==='status' ? (sortDir==='asc'? '▲':'▼') : ''}
                      </TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLetters.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center">Tidak ada surat</TableCell></TableRow>
                    ) : (
                      sortedLetters.map((l, i) => (
                        <TableRow key={l.id}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{l.letter_number}</TableCell>
                          <TableCell>{l.template_name}</TableCell>
                          <TableCell>{l.form_data?.tanggal}</TableCell>
                          <TableCell>{getStatusBadge(l.status)}</TableCell>
                          <TableCell>
                            <Link to={`/letters/${l.id}`} className="btn btn-xs btn-outline flex items-center gap-1">
                              <FileText className="w-4 h-4" /> Detail
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Letters; 