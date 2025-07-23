import React from 'react';
import { Template6Data } from '@/types/template';

interface Template6Props {
  data: Template6Data;
}

export const Template6: React.FC<Template6Props> = ({ data }) => {
  return (
    <div className="template-preview p-8 bg-white text-black">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-3 relative">
        <img 
          src="/src/assets/logo-kemenag.png" 
          alt="Logo Kementerian Agama" 
          className="w-20 h-20 absolute top-1 left-2"
        />
        <div className="overflow-hidden">
          <div className="font-bold text-sm leading-tight mb-1">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
            <span className="text-xs">KANTOR KEMENTERIAN AGAMA {data.kabkota}</span>
          </div>
          <div className="header-info">
            {data.jln}<br />
            Telp. {data.telfon} Fax. {data.fax}<br />
            Email: {data.email}<br />
            Website: {data.website}
          </div>
        </div>
      </div>

      <div className="mx-4">
        {/* Title */}
        <div className="text-center font-bold text-xs mb-4">
          <strong>SURAT PERNYATAAN</strong><br />
          <strong>TIDAK SEDANG MENJALANI PROSES PIDANA</strong><br />
          <strong>ATAU PERNAH DIPIDANA PENJARA</strong>
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5 text-xs">
          Nomor: B-{data.nosrt}/Kk.18.08/1/Kh.04.1/{data.blnno}/{data.thnno}
        </div>

        {/* Content */}
        <div className="text-justify mb-4 text-xs">
          <div className="mb-4">
            Yang bertanda tangan dibawah ini :
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
              <div className="w-32 flex-shrink-0">Pangkat / golongan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.pangkatgolpejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Jabatan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.jabatanpejabat}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Satuan Kerja</div>
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
              <div className="w-32 flex-shrink-0">Pangkat / golongan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.pangkatgolpegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Jabatan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.jabatanpegawai}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Unit/Satuan Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.ukerpegawai}</div>
            </div>
          </div>

          <p className="mb-4">
            Memang benar yang bersangkutan tidak sedang menjalani proses pidana atau pernah dipidana penjara berdasarkan putusan pengadilan yang telah berkekuatan tetap karena melakukan tindak pidana umum maupun kejahatan jabatan atau tindak pidana kejahatan yang ada hubungannya dengan jabatan.
          </p>

          <p>
            Demikian surat Pernyataan ini dibuat dengan sesungguhnya untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 ml-auto w-48 text-left text-xs">
          <div className="mb-1">
            {data.ibukota}, {data.tanggal}
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