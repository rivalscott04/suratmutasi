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
      <div style={{ position: 'relative', minHeight: 100, marginBottom: 12 }}>
        <img
          src="/logo-kemenag.png"
          alt="Logo Kementerian Agama"
          style={{ position: 'absolute', left: 0, top: 0, width: 90, height: 90, objectFit: 'contain' }}
        />
        <div style={{ width: '100%', textAlign: 'center', paddingLeft: 90, boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-block', minWidth: 400, maxWidth: 700, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14pt', lineHeight: 1.2 }}>
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '11.5pt', marginTop: 2 }}>
              KANTOR KEMENTERIAN AGAMA {data.kabkota}
            </div>
            <div style={{ fontWeight: 'normal', fontSize: '9pt', marginTop: 4 }}>
              {data.jln}<br />
              Telp. {data.telfon} Fax. {data.fax}<br />
              Email: {data.email}<br />
              Website: {data.website}
            </div>
            <div style={{ borderBottom: '3px solid #000', width: '100%', margin: '8px auto 0 auto', display: 'block' }}></div>
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