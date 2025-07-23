import React from 'react';
import { Template7Data } from '@/types/template';

interface Template7Props {
  data: Template7Data;
}

export const Template7: React.FC<Template7Props> = ({ data }) => {
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
        <div className="text-center font-bold text-xs mb-4 underline">
          SURAT PERSETUJUAN PELEPASAN
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5 text-xs">
          Nomor : B-{data.nosurat}/Kk.18.08/1/Kp.07.6/{data.blnnomor}/{data.tahunskrg}
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
          </div>

          <div className="font-bold mb-3">
            Memberikan rekomendasi / Persetujuan pindah tugas kepada :
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
              <div className="w-32 flex-shrink-0">Tempat Tugas</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.tempattugas}</div>
            </div>
          </div>

          <p className="mb-4">
            Dengan ini kami tidak keberatan / menyetujui melepas yang bersangkutan untuk pindah tugas dari {data.tempattugas} pada Kementerian Agama {data.kabkota2} menjadi {data.jabatnpegawai2} pada {data.tempattugas2} Kementerian Agama {data.kabataukotatujuan} Provinsi Nusa Tenggara Barat, dengan ketentuan bahwa Pegawai Negeri Sipil yang bersangkutan tetap melaksanakan tugas sehari-hari di tempat semula sebelum ada keputusan pengankatan pada Instansi yang baru.
          </p>

          <p>
            Demikian surat rekomendasi pelepasan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
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