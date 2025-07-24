
import React from 'react';
import { Template1Data } from '@/types/template';
import { formatTanggalIndonesia } from '@/lib/utils';

interface Template1Props {
  data: Template1Data;
}

export const Template1: React.FC<Template1Props> = ({ data }) => {
  return (
    <div className="letter-body" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12pt' }}>
      <section className="sheet">
        {/* Header */}
        <div className="header" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 12 }}>
          <img src="/logo-kemenag.png" alt="Logo Kementerian Agama" style={{ width: 90, height: 90, objectFit: 'contain', flexShrink: 0 }} />
          <div className="header-content" style={{ flex: 1, textAlign: 'center' }}>
            <div className="header-text" style={{ fontWeight: 'bold', fontSize: '16pt', letterSpacing: 0, lineHeight: 1.2 }}>
              KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
              <span className="sub-header" style={{ fontWeight: 'bold', fontSize: '14pt', display: 'block', marginTop: 2 }}>
                KANTOR KEMENTERIAN AGAMA {data.kabkota.toUpperCase()}
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
