import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Template1 } from '@/components/templates/Template1';
import { Template2 } from '@/components/templates/Template2';
import { Template3 } from '@/components/templates/Template3';
import { Template4 } from '@/components/templates/Template4';
import { Template5 } from '@/components/templates/Template5';
import { Template6 } from '@/components/templates/Template6';
import { Template7 } from '@/components/templates/Template7';
import { Template8 } from '@/components/templates/Template8';
import { Template9 } from '@/components/templates/Template9';
import { apiGet } from '@/lib/api';

const LetterPrintPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && token && id) {
      const fetchLetter = async () => {
        setLoading(true);
        try {
          const res = await apiGet(`/api/letters/${id}`, token);
          setLetter(res.letter || res);
        } catch (err: any) {
          console.error('Error fetching letter:', err);
          setError('Gagal mengambil data surat');
        } finally {
          setLoading(false);
        }
      };
      fetchLetter();
    }
  }, [id, token, isAuthenticated, authLoading]);

  const renderPreviewByTemplate = (letter: any) => {
    let data = letter.form_data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = {}; }
    }
    // Gabungkan data dengan office, kode_kabko, letter_number, dan field root letter
    data = {
      ...data,
      office: letter.office,
      kode_kabko: letter.office?.kode_kabko || data.kode_kabko,
      letter_number: letter.letter_number,
      ...letter,
    };
    // Fallback: jika data.nosrt kosong, ambil dari letter_number
    if (!data.nosrt && letter.letter_number) {
      const match = letter.letter_number.match(/^B-([^/]+)/);
      if (match) data.nosrt = match[1];
    }
    if (!data) return <div>Data surat tidak ditemukan</div>;
    const id = String(letter.template_id);
    if (id === '1') return <Template1 data={data} />;
    if (id === '2') return <Template2 data={data} />;
    if (id === '3') return <Template3 data={data} />;
    if (id === '4') return <Template4 data={data} />;
    if (id === '5') return <Template5 data={data} />;
    if (id === '6') return <Template6 data={data} />;
    if (id === '7') return <Template7 data={data} />;
    if (id === '8') return <Template8 data={data} />;
    if (id === '9') return <Template9 data={data} />;
    return <div>Template tidak dikenali</div>;
  };

  if (authLoading || loading) return <div>Loading...</div>;
  if (error) return <div className="text-error">{error}</div>;
  if (!letter) return <div>Surat tidak ditemukan</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f8fafc', minHeight: '100vh', padding: 24 }}>
      <style>{`
        @media print {
          .print-paper {
            background: #fff !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body { background: #fff !important; }
        }
      `}</style>
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded shadow"
        >
          Print
        </button>
      </div>
      <div className="flex justify-center">
        <div className="print-paper w-full max-w-[700px] bg-white rounded shadow p-4 md:p-8">
          {renderPreviewByTemplate(letter)}
        </div>
      </div>
    </div>
  );
};

export default LetterPrintPreview; 