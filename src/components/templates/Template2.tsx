
import React from 'react';
import { Template2Data } from '@/types/template';
import logoKemenag from '@/assets/logo-kemenag.png';

interface Template2Props {
  data: Template2Data;
}

export const Template2: React.FC<Template2Props> = ({ data }) => {
  return (
    <div className="letter-body">
      <section className="sheet">
        {/* Header */}
        <div className="header">
          <img src={logoKemenag} alt="Logo Kementerian Agama" className="logo" />
          <div className="header-content">
            <div className="header-text">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA<br />
              <span className="sub-header">KANTOR KEMENTERIAN AGAMA {data.kabkota.toUpperCase()}</span>
            </div>
            <div className="header-info">
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
            <strong>SURAT KETERANGAN ANALISIS JABATAN DAN ANALISIS BEBAN KERJA</strong><br />
            <strong>PEGAWAI NEGERI SIPIL</strong>
          </div>

          {/* Nomor Surat */}
          <div className="nomor">
            Nomor: B-{data.nosurat}/Kk.18.08/1/KP.07.6/{data.blnnomor}/{data.tahunskrg}
          </div>

          {/* Content */}
          <div className="content">
            <div className="intro">
              Yang bertanda tangan dibawah ini :
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
                <div className="data-label">Pangkat/Gol/Ruang</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.pangkatgolpejabat}</div>
              </div>
              <div className="data-row">
                <div className="data-label">Jabatan</div>
                <div className="data-colon">:</div>
                <div className="data-value">{data.jabatanpejabat}</div>
              </div>
            </div>

            <p>
              Dengan ini menerangkan jumlah jabatan Pegawai Negeri Sipil pada Unit Kerja {data.unitkerja} sebagai berikut :
            </p>

            {/* Analysis Table */}
            <div className="table-container">
              <table className="analysis-table">
                <thead>
                  <tr>
                    <th rowSpan={2} className="no-col">No.</th>
                    <th rowSpan={2} className="jabatan-col">Nama Jabatan</th>
                    <th rowSpan={2} className="beban-col">Jumlah Beban Kerja</th>
                    <th colSpan={3}>Jumlah Pegawai</th>
                    <th rowSpan={2} className="keterangan-col">Keterangan</th>
                  </tr>
                  <tr>
                    <th className="eksisting-col">Eksisting</th>
                    <th className="kelebihan-col">Kelebihan</th>
                    <th className="kekurangan-col">Kekurangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>{data.namajabatan}</td>
                    <td>{data.bbnkerja}</td>
                    <td>{data.eksisting}</td>
                    <td>{data.kelebihan}</td>
                    <td>{data.kekurangan}</td>
                    <td>Perlu diisi melalui mutasi PNS</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Demikian surat keterangan ini di buat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          {/* Signature */}
          <div className="signature-section">
            <div className="signature-place">
              {data.ibukota}, {data.tanggal}
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
