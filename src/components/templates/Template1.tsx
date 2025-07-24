
import React from 'react';
import { Template1Data } from '@/types/template';
import { formatTanggalIndonesia } from '@/lib/utils';

interface Template1Props {
  data: Template1Data;
}

export const Template1: React.FC<Template1Props> = ({ data }) => {
  return (
    <div className="letter-body" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt', margin: 0, padding: 0 }}>
      <section className="sheet" style={{ margin: 0, padding: 0 }}>
        {/* Header */}
        <div style={{ position: 'relative', minHeight: 100, marginBottom: 12 }}>
          <img
            src="/logo-kemenag.png"
            alt="Logo Kementerian Agama"
            style={{ position: 'absolute', left: 0, top: 0, width: 90, height: 90, objectFit: 'contain' }}
          />
          <div style={{ width: '100%', textAlign: 'center', paddingLeft: 90, boxSizing: 'border-box' }}>
            <div style={{ display: 'inline-block', minWidth: 400, maxWidth: 700, textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15pt', lineHeight: 1.2 }}>
                KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', marginTop: 2 }}>
                KANTOR KEMENTERIAN AGAMA {data.kabkota.toUpperCase()}
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

        <div className="content-wrapper">
          {/* Title */}
          <div className="title">
            <strong>SURAT PERNYATAAN</strong><br />
            <strong>TIDAK SEDANG MENJALANI TUGAS BELAJAR ATAU IKATAN DINAS</strong>
          </div>

          {/* Nomor Surat */}
          <div className="nomor">
            Nomor : B-{data.nosrt}/Kk.18.08/1/Kp.07.6/{data.blnno}/{data.thnno}
          </div>

          {/* Content */}
          <div className="content">
            <div className="intro">
              Yang bertanda tangan di bawah ini :
            </div>

            {/* Data Pejabat */}
            <div className="data-table">
              <div className="data-row">
                <div className="data-label">Nama</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.namapejabat}</div>
              </div>
              <div className="data-row">
                <div className="data-label">NIP</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.nippejabat}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Pangkat/Gol.Ruang</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.pangkatgolpejabat}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Jabatan</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.jabatanpejabat}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Unit/Satuan Kerja</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.ukerpejabat}</div>
              </div>
            </div>

            <div className="section-title">
              Menyatakan bahwa :
            </div>

            {/* Data Pegawai */}
            <div className="data-table">
              <div className="data-row">
                <div className="data-label">Nama</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.namapegawai}</div>
              </div>
              <div className="data-row">
                <div className="data-label">NIP</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.nippegawai}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Pangkat/Gol.Ruang</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.pangkatgolpegawai}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Jabatan</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.jabatanpegawai}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Unit/Satuan Kerja</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.ukerpegawai}</div>
              </div>
            </div>

            <p>
              Memang benar bahwa yang bersangkutan tidak sedang menjalani tugas belajar atau ikatan dinas.
            </p>

            <p>
              Demikian pernyataan ini dibuat dengan sesungguhnya untuk dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Signature */}
          <div className="signature-section">
            <div className="signature-place">
              {data.ibukota}, {formatTanggalIndonesia(data.tanggal)}
            </div>
            <div>
              Kepala,
            </div>
            <div style={{ height: '60px' }}></div>
            <div className="signature-name">
              {data.namapejabat}
            </div>
            <div className="signature-nip">
              NIP. {data.nippejabat}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
