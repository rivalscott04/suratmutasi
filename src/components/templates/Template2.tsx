
import React from 'react';
import { Template2Data } from '@/types/template';
import { formatTanggalIndonesia } from '@/lib/utils';

interface Template2Props {
  data: Template2Data;
}

export const Template2: React.FC<Template2Props> = ({ data }) => {
  return (
    <div className="template-preview bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', margin: 0, padding: 0 }}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-3 relative">
        <img 
          src="/logo-kemenag.png" 
          alt="Logo Kementerian Agama" 
          className="w-20 h-20 absolute top-1 left-2"
        />
        <div className="overflow-hidden">
          <div className="font-bold leading-tight mb-1">
            KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
            <span>KANTOR KEMENTERIAN AGAMA {data.kabkota}</span>
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
        <div className="text-center font-bold mb-4 underline">
          SURAT KETERANGAN ANALISIS JABATAN DAN ANALISIS BEBAN KERJA PNS
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5">
          Nomor : B-{data.nosurat}/Kk.18.08/1/Kp.07.6/{data.blnnomor}/{data.tahunskrg}
        </div>

        {/* Content */}
        <div className="text-justify mb-4">
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
            Memberikan keterangan bahwa :
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
              <div className="w-32 flex-shrink-0">Unit Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.unitkerja}</div>
            </div>
          </div>

          <p className="mb-4">
            Dengan ini menerangkan jumlah jabatan Pegawai Negeri Sipil pada Unit Kerja {data.unitkerja} sebagai berikut :
          </p>

          {/* Analysis Table */}
          <div className="mb-6">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium">No.</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium">Nama Jabatan</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium">Jumlah Beban Kerja</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium" colSpan={3}>Jumlah Pegawai</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium">Keterangan</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium"></th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium"></th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium"></th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">Eksisting</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">Kelebihan</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium">Kekurangan</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                    <td className="border border-gray-300 px-3 py-2">{data.namajabatan}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{data.bbnkerja}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{data.eksisting}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{data.kelebihan}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{data.kekurangan}</td>
                    <td className="border border-gray-300 px-3 py-2">Perlu diisi melalui mutasi PNS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 ml-auto w-48 text-left">
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
