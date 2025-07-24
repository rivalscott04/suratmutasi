import React from 'react';
import { Template5Data } from '@/types/template';
import { formatTanggalIndonesia } from '@/lib/utils';

interface Template5Props {
  data: Template5Data;
}

export const Template5: React.FC<Template5Props> = ({ data }) => {
  return (
    <div className="template-preview bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', margin: 0, padding: 0 }}>
      {/* Header */}
      <div className="header" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
        <img 
          src="/logo-kemenag.png" 
          alt="Logo Kementerian Agama" 
          style={{ width: 90, height: 90, objectFit: 'contain', flexShrink: 0 }}
        />
        <div className="header-content" style={{ flex: 1, textAlign: 'center' }}>
          <div className="header-text" style={{ fontWeight: 'bold', fontSize: '16pt', letterSpacing: 0, lineHeight: 1.2 }}>
            KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
            <span className="sub-header" style={{ fontWeight: 'bold', fontSize: '14pt', display: 'block', marginTop: 2 }}>
              KANTOR KEMENTERIAN AGAMA {data.kabkota}
            </span>
          </div>
          <div className="header-info" style={{ fontSize: '11pt', marginTop: 4 }}>
            {data.jln}<br />
            Telp. {data.telfon} Fax. {data.fax}<br />
            Email: {data.email}<br />
            Website: {data.website}
          </div>
        </div>
      </div>

      <div className="mx-4">
        {/* Title */}
        <div className="text-center font-bold text-xs mb-4 underline">
          SURAT PERNYATAAN TIDAK SEDANG DALAM PROSES ATAU MENJALANI HUKUMAN DISIPLIN
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5 text-xs">
          Nomor : B-{data.nosrt}/Kk.18.08/1/Kp.07.6/{data.blnno}/{data.thnno}
        </div>

        {/* Content */}
        <div className="text-justify mb-4 text-xs">
          <div className="mb-4">
            Yang bertanda tangan di bawah ini :
          </div>

          {/* Data Pejabat */}
          <div className="mb-4">
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Nama</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.namapejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">NIP</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.nippejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Pangkat/Gol.Ruang</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.pangkatgolpejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Jabatan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.jabatanpejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Unit Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.ukerpejabat}</div>
            </div>
          </div>

          <div className="font-bold mb-3">
            Menyatakan bahwa :
          </div>

          {/* Data Pegawai */}
          <div className="mb-4">
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Nama</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.namapegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">NIP</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.nippegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Pangkat/Gol.Ruang</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.pangkatgolpegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Jabatan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.jabatanpegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Satuan Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.tempattugas}</div>
            </div>
          </div>

          <p className="mb-4">
            Memang benar bahwa yang bersangkutan tidak sedang dalam proses atau menjalani hukuman disiplin.
          </p>

          <p>
            Demikian pernyataan ini dibuat dengan sesungguhnya untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 ml-auto w-48 text-left text-xs">
          <div className="mb-1">
            {data.ibukota}, {formatTanggalIndonesia(data.tanggal)}
          </div>
          <div>
            Kepala,
          </div>
          <div className="h-16"></div>
          <div className="font-bold underline">
            {data.namapejabat}
          </div>
          <div className="mt-1">
            NIP. {data.nippejabat}
          </div>
        </div>
      </div>
    </div>
  );
};