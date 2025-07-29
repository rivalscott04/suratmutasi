import React from 'react';
import { Template9Data } from '@/types/template';
import { formatTanggalIndonesia } from '@/lib/utils';

interface Template9Props {
  data: Template9Data;
}

export const Template9: React.FC<Template9Props> = ({ data }) => {
  return (
    <div className="template-preview bg-white text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', margin: 0, padding: 0 }}>
      {/* Header */}
      <div style={{ position: 'relative', minHeight: 100, marginBottom: 20 }}>
        <img
          src="/logo-kemenag.png"
          alt="Logo Kementerian Agama"
          style={{ position: 'absolute', left: 0, top: 0, width: 100, height: 100, objectFit: 'contain' }}
        />
        <div style={{ width: '100%', textAlign: 'center', paddingLeft: 90, boxSizing: 'border-box' }}>
          <div style={{ display: 'inline-block', minWidth: 400, maxWidth: 700, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '15pt', lineHeight: 1.2 }}>
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '11pt', marginTop: 2 }}>
              KANTOR KEMENTERIAN AGAMA {data.kabkota}
            </div>
            <div style={{ fontWeight: 'normal', fontSize: '9pt', marginTop: 4 }}>
              {data.jln}<br />
              Telp. {data.telfon} Fax. {data.fax}<br />
              Email: {data.email}<br />
              Website: {data.website}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderBottom: '3px solid #000', width: '100%', marginTop: 8 }}></div>
      </div>

      <div className="mx-4">
        {/* Title */}
        <div className="text-center font-bold mb-4 underline">
          SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
        </div>
      
        {/* Nomor Surat */}
        <div className="text-center mb-5">
          Nomor : B-{data.nosrt}/Kk.18.{data.office?.kode_kabko || data.kode_kabko || "-"}/1/Kp.01.2/{data.blnno}/{data.thnno}
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
            <div className="flex mb-1">
              <div className="w-32 flex-shrink-0">Unit Kerja</div>
              <div className="w-5 flex-shrink-0">:</div>
              <div className="flex-grow">{data.ukerpejabat}</div>
            </div>
          </div>

          <div className="font-bold mb-3">
            Dengan ini menyatakan dengan sesungguhnya bahwa :
          </div>

          <p className="mb-4">
            Saya bertanggung jawab penuh atas kebenaran dan keabsahan dokumen serta data yang saya sampaikan dalam surat ini. Apabila dikemudian hari terdapat kesalahan atau ketidakbenaran dalam dokumen dan data tersebut, saya bersedia menerima sanksi sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.
          </p>

          <p>
            Demikian surat pernyataan tanggung jawab mutlak ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* Signature */}
        <div className="mt-8 ml-auto w-48 text-left">
          <div className="mb-1">
            {data.ibukota}, {formatTanggalIndonesia(data.tanggal)}
          </div>
          <div className="relative">
            {data.isPltPlh && (
              <span className="absolute -left-6">
                {data.pltPlhType === 'plt' ? 'Plt. ' : 'Plh. '}
              </span>
            )}
            <span>Kepala,</span>
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