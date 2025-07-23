import React from 'react';
import { Template9Data } from '@/types/template';

interface Template9Props {
  data: Template9Data;
}

export const Template9: React.FC<Template9Props> = ({ data }) => {
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
          <div className="text-xs leading-tight mt-2">
            {data.jln}<br />
            {data.telfon}<br />
            {data.fax} {data.email}<br />
            {data.website}
          </div>
        </div>
      </div>

      <div className="mx-4">
        {/* Title */}
        <div className="text-center font-bold text-xs mb-4">
          <strong>SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK</strong>
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5 text-xs">
          Nomor : B-{data.nosrt}/Kk.18.08/1/Kp.01.2/{data.blnno}/{data.thnno}
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
              <div className="w-32 flex-shrink-0">Unit/Satuan Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.ukerpejabat}</div>
            </div>
          </div>

          <p className="mb-4">
            Dengan menyatakan dan menjamin kebenaran serta bertanggung jawab atas dokumen dan data yang disampaikan telah sesuai dengan ketentuan peraturan perundang-undangan yang berlaku dan data yang disampaikan adalah data terkini dan valid berdasarkan data Sistem Informasi Manajemen Kepegawaian (SIMPEG) Kementerian Agama
          </p>

          <p>
            Demikian pernyataan ini dibuat dengan sesungguhnya untuk dipergunakan sebagaimana mestinya.
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