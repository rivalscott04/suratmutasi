
import { useState, useEffect } from 'react';
import { Pegawai } from '@/types/template';
import { apiGet } from '@/lib/api';

export const usePegawaiSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      const token = localStorage.getItem('token');
      apiGet(`/api/employees/search?q=${encodeURIComponent(searchTerm)}`, token)
        .then(data => setResults(data.pegawai || data.employees || []))
        .catch(() => setError('Gagal mencari pegawai'))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error
  };
};
