import React from 'react';
import { Template4Data } from '@/types/template';

interface Template4Props {
  data: Template4Data;
}

export const Template4: React.FC<Template4Props> = ({ data }) => {
  return (
    <div className="template-preview p-8 bg-white text-black">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-3 relative">
        <img 
          src="/src/assets/logo-kemenag.png" 
          alt="Logo Kementerian Agama" 
          className="w-16 h-16 float-left mr-4 mt-1"
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
        {/* Surat Info */}
        <div className="mb-5">
          <div className="flex justify-between items-start mb-1">
            <div className="flex">
              <div className="w-20 flex-shrink-0 text-xs">Nomor</div>
              <div className="w-5 flex-shrink-0 text-xs">:</div>
              <div className="flex-grow text-xs">B-{data.nosrt}/Kk.18.08/1/Kp.01.2/{data.blnsrt}/{data.thnskrg}</div>
            </div>
            <div className="ml-5 text-xs">{data.tanggal}</div>
          </div>
          <div className="flex mb-1">
            <div className="w-20 flex-shrink-0 text-xs">Sifat</div>
            <div className="w-5 flex-shrink-0 text-xs">:</div>
            <div className="flex-grow text-xs">Biasa</div>
          </div>
          <div className="flex mb-1">
            <div className="w-20 flex-shrink-0 text-xs">Lampiran</div>
            <div className="w-5 flex-shrink-0 text-xs">:</div>
            <div className="flex-grow text-xs">1(satu) berkas</div>
          </div>
          <div className="flex mb-1">
            <div className="w-20 flex-shrink-0 text-xs">Hal</div>
            <div className="w-5 flex-shrink-0 text-xs">:</div>
            <div className="flex-grow text-xs">Permohonan penerbitan surat Keterangan Bebas Temuan</div>
          </div>
        </div>

        {/* Addressee */}
        <div className="text-left mb-5 text-xs">
          Yth. Kepala Kantor Wilayah Kementerian Agama<br />
          Provinsi Nusa Tenggara Barat<br />
          Mataram
        </div>

        {/* Content */}
        <div className="text-justify mb-4 text-xs">
          <div className="mb-4">
            Dengan hormat,
          </div>

          <p className="mb-4">
            Memperhatikan Peraturan Badan Kepegawaian Negara Nomor 5 Tahun 2019 tentang Tata Cara Pelaksanaan Mutasi pada BAB II Pasal 3 angka(1) huruf j, dengan ini kami sampaikan permohonan penerbitan Surat Keterangan Bebas Temuan Pegawai Negeri Sipil sebagai berikut :
          </p>

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
              <div className="w-32 flex-shrink-0">Unit Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.unitkerja}</div>
            </div>
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Keperluan</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.keperluan}</div>
            </div>
          </div>

          <p>
            Demikian permohonan ini, atas perhatian dan Kerja sama yang baik kami ucapkan terima kasih.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 ml-auto w-48 text-left text-xs">
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