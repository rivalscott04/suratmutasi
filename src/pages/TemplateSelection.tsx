
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TemplateCard } from '@/components/TemplateCard';
import { FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';


const TEMPLATES = [
  {
    id: '1',
    title: 'Surat Pernyataan Tidak Sedang Tugas Belajar',
    description: 'Surat pernyataan bahwa pegawai tidak sedang menjalani tugas belajar atau ikatan dinas',
    category: 'Pernyataan'
  },
  {
    id: '2',
    title: 'Surat Keterangan Analisis Jabatan',
    description: 'Surat keterangan mengenai analisis jabatan dan analisis beban kerja pegawai',
    category: 'Keterangan'
  },
  {
    id: '3',
    title: 'Surat Keterangan Pengalaman Mengajar',
    description: 'Surat keterangan mengenai pengalaman mengajar seorang guru',
    category: 'Keterangan'
  },
  {
    id: '4',
    title: 'Surat Permohonan Bebas Temuan',
    description: 'Surat permohonan penerbitan surat keterangan bebas temuan',
    category: 'Permohonan'
  },
  {
    id: '5',
    title: 'Surat Pernyataan Tidak Sedang Hukuman Disiplin',
    description: 'Surat pernyataan tidak sedang dalam proses atau menjalani hukuman disiplin',
    category: 'Pernyataan'
  },
  {
    id: '6',
    title: 'Surat Pernyataan Tidak Sedang Proses Pidana',
    description: 'Surat pernyataan tidak sedang menjalani proses pidana atau pernah dipidana',
    category: 'Pernyataan'
  },
  {
    id: '7',
    title: 'Surat Persetujuan Pelepasan',
    description: 'Surat persetujuan untuk melepas pegawai pindah tugas',
    category: 'Persetujuan'
  },
  {
    id: '8',
    title: 'Surat Persetujuan Penerimaan',
    description: 'Surat persetujuan untuk menerima pegawai pindah tugas',
    category: 'Persetujuan'
  },
  {
    id: '9',
    title: 'Surat Pernyataan Tanggung Jawab Mutlak',
    description: 'Surat pernyataan tanggung jawab mutlak atas dokumen dan data',
    category: 'Pernyataan'
  },

];

const TemplateSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateLetter = (templateId: string) => {
    navigate(`/generator/create/${templateId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Generator Surat Kementerian Agama</h1>
          <p className="text-muted-foreground mt-2">
            Pilih jenis surat yang ingin dibuat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div key={template.id} className="space-y-4">
              <TemplateCard
                id={template.id}
                title={template.title}
                description={template.description}
                category={template.category}
                isSelected={false}
                onSelect={() => {}}
              />
              {user?.role !== 'user' && (
                <Button 
                  onClick={() => handleCreateLetter(template.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Buat Surat
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
