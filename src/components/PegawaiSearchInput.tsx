
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Check, X } from 'lucide-react';
import { usePegawaiSearch } from '@/hooks/usePegawaiSearch';
import { Pegawai } from '@/types/template';

interface PegawaiSearchInputProps {
  label: string;
  placeholder: string;
  onSelect: (pegawai: Pegawai | undefined) => void;
  selectedPegawai?: Pegawai;
}

export const PegawaiSearchInput: React.FC<PegawaiSearchInputProps> = ({
  label,
  placeholder,
  onSelect,
  selectedPegawai
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { searchTerm, setSearchTerm, results, isLoading } = usePegawaiSearch();

  // Jika user mengetik, hapus pilihan pegawai
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    if (selectedPegawai) onSelect(undefined);
    setIsOpen(value.length > 0);
  };

  const handleSelect = (pegawai: Pegawai) => {
    onSelect(pegawai);
    setSearchTerm('');
    setIsOpen(false);
    // Hilangkan fokus dari input setelah memilih
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const handleReset = () => {
    onSelect(undefined);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10"
            onFocus={() => setIsOpen(searchTerm.length > 0)}
            disabled={false}
          />
          {selectedPegawai && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 transition-colors"
              tabIndex={-1}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isOpen && !selectedPegawai && results.length > 0 && (
          <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="divide-y">
                  {results.map((pegawai) => (
                    <div
                      key={pegawai.id || pegawai.nip}
                      className="p-3 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSelect(pegawai)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{pegawai.nama}</div>
                          <div className="text-xs text-muted-foreground">{pegawai.nip}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{pegawai.pangkat_gol || (pegawai as any).golongan}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{pegawai.jabatan}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.length > 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Tidak ada hasil ditemukan
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
      {selectedPegawai && (
        <div className="flex items-center space-x-2 mt-2 bg-muted rounded p-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">{selectedPegawai.nama}</span>
          <span className="text-xs text-muted-foreground">{selectedPegawai.nip}</span>
          <Badge variant="outline" className="text-xs">{selectedPegawai.pangkat_gol || (selectedPegawai as any).golongan}</Badge>
          <span className="text-xs text-muted-foreground">{selectedPegawai.jabatan}</span>
          <button type="button" onClick={handleReset} className="ml-auto text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
