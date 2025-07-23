
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TemplateOption } from '@/types/template';

const templateOptions: TemplateOption[] = [
  {
    id: '1',
    name: 'Surat Pernyataan Tidak Sedang Menjalani Tugas Belajar atau Ikatan Dinas',
    description: 'Template untuk surat pernyataan tidak sedang menjalani tugas belajar'
  },
  {
    id: '2',
    name: 'Surat Keterangan Analisis Jabatan dan Analisis Beban Kerja PNS',
    description: 'Template untuk surat keterangan analisis jabatan dan beban kerja'
  },
  {
    id: '3',
    name: 'Surat Keterangan Pengalaman Mengajar',
    description: 'Template untuk surat keterangan pengalaman mengajar'
  },
  {
    id: '4',
    name: 'Surat Permohonan SKBT',
    description: 'Template untuk surat permohonan Surat Keterangan Bebas Temuan'
  },
  {
    id: '5',
    name: 'Surat Pernyataan Tidak Sedang Dalam Proses Hukuman Disiplin',
    description: 'Template untuk surat pernyataan tidak sedang dalam proses hukuman disiplin'
  },
  {
    id: '6',
    name: 'Surat Pernyataan Tidak Sedang Menjalani Proses Pidana',
    description: 'Template untuk surat pernyataan tidak sedang menjalani proses pidana'
  },
  {
    id: '7',
    name: 'Surat Persetujuan Pelepasan',
    description: 'Template untuk surat persetujuan pelepasan pegawai'
  },
  {
    id: '8',
    name: 'Surat Persetujuan Penerimaan',
    description: 'Template untuk surat persetujuan penerimaan pegawai'
  },
  {
    id: '9',
    name: 'Surat Pernyataan Tanggung Jawab Mutlak',
    description: 'Template untuk surat pernyataan tanggung jawab mutlak'
  }
];

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateChange: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Pilih Template Surat</Label>
      <Select value={selectedTemplate} onValueChange={onTemplateChange}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih template surat yang akan dibuat" />
        </SelectTrigger>
        <SelectContent>
          {templateOptions.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                <span className="text-sm text-muted-foreground">
                  {template.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
