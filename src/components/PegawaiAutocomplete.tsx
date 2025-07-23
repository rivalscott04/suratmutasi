
import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePegawaiSearch } from '@/hooks/usePegawaiSearch';
import { Pegawai } from '@/types/template';

interface PegawaiAutocompleteProps {
  label: string;
  onSelect: (pegawai: Pegawai) => void;
  selectedPegawai?: Pegawai;
  placeholder?: string;
}

export const PegawaiAutocomplete: React.FC<PegawaiAutocompleteProps> = ({
  label,
  onSelect,
  selectedPegawai,
  placeholder = "Cari nama atau NIP..."
}) => {
  const [open, setOpen] = useState(false);
  const { searchTerm, setSearchTerm, results, isLoading } = usePegawaiSearch();

  const handleSelect = (pegawai: Pegawai) => {
    onSelect(pegawai);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPegawai ? selectedPegawai.nama : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Mencari..." : "Tidak ada data pegawai."}
              </CommandEmpty>
              <CommandGroup>
                {results.map((pegawai) => (
                  <CommandItem
                    key={pegawai.id}
                    value={pegawai.nama}
                    onSelect={() => handleSelect(pegawai)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedPegawai?.id === pegawai.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{pegawai.nama}</span>
                      <span className="text-sm text-muted-foreground">
                        {pegawai.nip} - {pegawai.jabatan}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
