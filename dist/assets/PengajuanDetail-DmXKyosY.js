import{j as e,W as b,au as Na,Z as _a,Y as wa,a0 as Z,ap as R,aD as Re,ar as Le,ae as Sa,_ as ne,aE as Ie,aF as Da,aq as Me,aA as re}from"./ui-vendor-DiY4nm-6.js";import{g as Aa,d as Pa,r as d}from"./react-vendor-C8WR5ETM.js";import{C as N,c as _,a as C,b as F}from"./card-CAu6g27L.js";import{u as Ta,a as le,B as l,b as S,D as L,e as I,f as M,g as W,k as Q,j as ee,m as Ca}from"./index-BakxVqGD.js";import{A as de,a as ce,b as oe,c as me,d as ue,e as pe,g as We,f as he}from"./alert-dialog-BEZq2G1v.js";import{T as ae}from"./textarea-C0ltLbUd.js";import{L as Ue}from"./label-DNoQbHOo.js";import{S as Oe}from"./switch-Dhuqkrqs.js";const Ua=()=>{var Ce,Fe;const{pengajuanId:x}=Aa(),D=Pa(),{user:r,token:p,isAuthenticated:xe,originalUser:Fa,isImpersonating:$a}=Ta(),[s,ge]=d.useState(null),[U,je]=d.useState([]),[O,se]=d.useState([]),[Je,fe]=d.useState(!0),[be,c]=d.useState(null),[g,ze]=d.useState(null),[qe,ve]=d.useState(!1),[Ge,J]=d.useState(!1),[He,z]=d.useState(!1),[Ve,A]=d.useState(!1),[Ye,q]=d.useState(!1),[Xe,y]=d.useState(!1),[Ze,G]=d.useState(!1),[Qe,H]=d.useState(!1),[ea,P]=d.useState(""),[V,te]=d.useState(""),[$,ie]=d.useState(""),[aa,sa]=d.useState(""),[ye,ta]=d.useState(""),[o,h]=d.useState(!1),[Y,ke]=d.useState(null),[Ne,ia]=d.useState(!1);(Ce=s==null?void 0:s.files)!=null&&Ce.some(a=>a.file_category==="admin_wilayah"),d.useEffect(()=>{if(!xe){D("/");return}x&&T()},[xe,D,x]),d.useEffect(()=>{const a=()=>{const t=window.pageYOffset||document.documentElement.scrollTop;ia(t>50)};return a(),window.addEventListener("scroll",a,{passive:!0}),()=>window.removeEventListener("scroll",a)},[]);const T=async()=>{var a,t,n;try{fe(!0);const i=await le(`/api/pengajuan/${x}`,p);if(i.success)if(ge(i.data.pengajuan),Array.isArray(i.data.requiredFiles)?je(i.data.requiredFiles):je([]),(r==null?void 0:r.role)==="admin_wilayah")try{const u=await le(`/api/admin-wilayah/pengajuan/${x}`,p),f=((a=u==null?void 0:u.adminWilayahFileConfig)==null?void 0:a.required)||((n=(t=u==null?void 0:u.data)==null?void 0:t.adminWilayahFileConfig)==null?void 0:n.required)||[];se(f.map(k=>k.file_type))}catch{se([])}else se([]);else c(i.message||"Gagal mengambil data pengajuan")}catch(i){console.error("Error fetching pengajuan data:",i),c("Terjadi kesalahan saat mengambil data pengajuan")}finally{fe(!1)}},na=async()=>{try{h(!0);const a=w?await Q(`/api/admin-wilayah/pengajuan/${x}/approve`,{notes:V},p):await ee(`/api/pengajuan/${x}/approve`,{catatan:V},p);a.success?(P("Pengajuan berhasil disetujui!"),y(!0),J(!1),te(""),await T()):c(a.message||"Gagal approve pengajuan")}catch(a){console.error("Error approving pengajuan:",a),c("Terjadi kesalahan saat approve pengajuan")}finally{h(!1)}},ra=async()=>{try{h(!0);const a=w?await Q(`/api/admin-wilayah/pengajuan/${x}/reject`,{rejection_reason:$},p):await ee(`/api/pengajuan/${x}/reject`,{rejection_reason:$},p);a.success?(P("Pengajuan berhasil ditolak!"),y(!0),z(!1),ie(""),await T()):c(a.message||"Gagal reject pengajuan")}catch(a){console.error("Error rejecting pengajuan:",a),c("Terjadi kesalahan saat reject pengajuan")}finally{h(!1)}},la=async()=>{try{h(!0);const a=await Q(`/api/pengajuan/${x}/final-approve`,{notes:V},p);a.success?(P("Pengajuan berhasil disetujui final!"),y(!0),G(!1),te(""),await T()):c(a.message||"Gagal approve final pengajuan")}catch(a){console.error("Error final approving pengajuan:",a),c("Terjadi kesalahan saat approve final pengajuan")}finally{h(!1)}},da=async()=>{try{h(!0);const a=await Q(`/api/pengajuan/${x}/final-reject`,{rejection_reason:$},p);a.success?(P("Pengajuan berhasil ditolak final!"),y(!0),H(!1),ie(""),await T()):c(a.message||"Gagal reject final pengajuan")}catch(a){console.error("Error final rejecting pengajuan:",a),c("Terjadi kesalahan saat reject final pengajuan")}finally{h(!1)}},ca=async()=>{try{h(!0);const a=await ee(`/api/pengajuan/${x}/resubmit`,{},p);a.success?(P("Pengajuan berhasil diajukan ulang!"),y(!0),await T()):c(a.message||"Gagal resubmit pengajuan")}catch(a){console.error("Error resubmitting pengajuan:",a),c("Terjadi kesalahan saat resubmit pengajuan")}finally{h(!1)}},oa=async()=>{try{h(!0);const a=await Ca(`/api/pengajuan/${x}`,p);a.success?(P("Pengajuan berhasil dihapus!"),y(!0),A(!1),setTimeout(()=>{D("/pengajuan")},2e3)):(c(a.message||"Gagal menghapus pengajuan"),A(!1))}catch(a){console.error("Error deleting pengajuan:",a),c("Terjadi kesalahan saat menghapus pengajuan"),A(!1)}finally{h(!1)}},ma=a=>{const n={draft:{label:"DRAFT",className:"bg-gray-100 text-gray-800"},submitted:{label:"SUBMITTED",className:"bg-blue-100 text-blue-800"},approved:{label:"APPROVED",className:"bg-green-100 text-green-800"},rejected:{label:"REJECTED",className:"bg-red-100 text-red-800"},resubmitted:{label:"RESUBMITTED",className:"bg-yellow-100 text-yellow-800"},admin_wilayah_approved:{label:"ADMIN_WILAYAH_APPROVED",className:"bg-green-200 text-green-800"},admin_wilayah_rejected:{label:"ADMIN_WILAYAH_REJECTED",className:"bg-red-200 text-red-800"},final_approved:{label:"FINAL_APPROVED",className:"bg-green-600 text-white"},final_rejected:{label:"FINAL_REJECTED",className:"bg-red-600 text-white"}}[a]||{label:a.toUpperCase(),className:"bg-gray-100 text-gray-800"};return e.jsx(S,{className:n.className,children:n.label})},ua=a=>({guru:"Guru",eselon_iv:"Eselon IV",fungsional:"Fungsional",pelaksana:"Pelaksana"})[a]||a,B=a=>({surat_pengantar:"Surat Pengantar",surat_permohonan_dari_yang_bersangkutan:"Surat Permohonan Dari Yang Bersangkutan",surat_keputusan_cpns:"Surat Keputusan CPNS",surat_keputusan_pns:"Surat Keputusan PNS",surat_keputusan_kenaikan_pangkat_terakhir:"Surat Keputusan Kenaikan Pangkat Terakhir",surat_keputusan_jabatan_terakhir:"Surat Keputusan Jabatan Terakhir",skp_2_tahun_terakhir:"SKP 2 Tahun Terakhir",surat_keterangan_bebas_temuan_inspektorat:"Surat Keterangan Bebas Temuan Yang Diterbitkan Inspektorat Jenderal Kementerian Agama",surat_keterangan_anjab_abk_instansi_asal:"Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi asal",surat_keterangan_anjab_abk_instansi_penerima:"Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi penerima",surat_pernyataan_tidak_hukuman_disiplin:"Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat Dalam 1 (satu) Tahun Terakhir Dari PPK",surat_persetujuan_mutasi_asal:"Surat Persetujuan Mutasi dari ASAL dengan menyebutkan jabatan yang akan diduduki",surat_lolos_butuh_ppk:"Surat Lolos Butuh dari Pejabat Pembina Kepegawaian instansi yang dituju",peta_jabatan:"Peta Jabatan",hasil_uji_kompetensi:"Hasil Uji Kompetensi",hasil_evaluasi_pertimbangan_baperjakat:"Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)",anjab_abk_instansi_asal:"Anjab/Abk Instansi Asal",anjab_abk_instansi_penerima:"Anjab/Abk Instansi Penerima",surat_keterangan_tidak_tugas_belajar:"Surat Keterangan Tidak Sedang Tugas Belajar",sptjm_pimpinan_satker_asal:"SPTJM Pimpinan Satker dari Asal",sptjm_pimpinan_satker_penerima:"SPTJM Pimpinan Satker dari Penerima",surat_rekomendasi_instansi_pembina:"Surat Rekomendasi Instansi Pembina",surat_pengantar_permohonan_rekomendasi:"Surat Pengantar Permohonan Rekomendasi",surat_rekomendasi_kanwil_khusus:"Surat Rekomendasi Kanwil Khusus",surat_persetujuan_kepala_wilayah:"Surat Persetujuan Kepala Wilayah",surat_pernyataan_tidak_ikatan_dinas:"Surat Pernyataan Tidak Ikatan Dinas",surat_pernyataan_tidak_tugas_belajar:"Surat Pernyataan Tidak Tugas Belajar",surat_keterangan_kanwil:"Surat Keterangan Kanwil",surat_rekomendasi_kanwil:"Surat Rekomendasi Kanwil"})[a]||a.replace(/_/g," ").toUpperCase(),_e=async(a,t,n)=>{try{console.log("🔍 Debug handleVerifyFile:",{fileId:a,verificationStatus:t,notes:n,token:p}),ke(a);const i={verification_status:t,verification_notes:n};console.log("📤 Request data:",i);const u=await ee(`/api/pengajuan/files/${a}/verify`,i,p);console.log("📥 Response:",u),u.success?ge(f=>f&&{...f,files:f.files.map(k=>k.id===a?{...k,verification_status:t,verified_by:(r==null?void 0:r.email)||(r==null?void 0:r.id),verified_at:new Date().toISOString()}:k)}):c(u.message||"Gagal verifikasi file")}catch(i){console.error("❌ Error verifying file:",i),c("Terjadi kesalahan saat verifikasi file")}finally{ke(null)}},pa=async()=>{try{h(!0);const a=await le(`/api/pengajuan/${x}/print-report`,p);a.success?xa(a.data):c(a.message||"Gagal generate laporan")}catch(a){console.error("Error generating print report:",a),c("Terjadi kesalahan saat generate laporan")}finally{h(!1),q(!1)}},ha=()=>{try{ga(),q(!1)}catch(a){console.error("Error generating final print report:",a),c("Terjadi kesalahan saat generate laporan final")}},xa=a=>{var i;const t=window.open("","_blank");if(!t)return;const n=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Pengajuan - ${a.pegawai.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .info table { width: 100%; border-collapse: collapse; }
          .info td { padding: 5px; }
          .info td:first-child { font-weight: bold; width: 150px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; font-size: 10pt; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .checkbox { width: 20px; height: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>LAPORAN PENGAJUAN JABATAN</h2>
        </div>
        
        <div class="info">
          <table>
            <tr><td>Nama</td><td>: ${a.pegawai.nama}</td></tr>
            <tr><td>NIP</td><td>: ${a.pegawai.nip}</td></tr>
            <tr><td>Jabatan</td><td>: ${a.pegawai.jabatan}</td></tr>
                         <tr><td>Kabupaten/Kota</td><td>: ${((i=a.office)==null?void 0:i.kabkota)||"Tidak tersedia"}</td></tr>
            <tr><td>Status</td><td>: ${a.pengajuan.status}</td></tr>
            <tr><td>Tanggal Approval</td><td>: ${new Date(a.pengajuan.approved_at).toLocaleDateString("id-ID")}</td></tr>
          </table>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Berkas</th>
              <th>Ada Berkas</th>
            </tr>
          </thead>
          <tbody>
            ${a.files.map((u,f)=>`
              <tr>
                <td>${f+1}</td>
                <td>${B(u.file_type)}</td>
                <td>
                  <input type="checkbox" class="checkbox" ${u.verification_status==="approved"?"checked":""} disabled>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <!-- Verification Footer -->
        <div style="margin-top: 40px; padding: 15px; border-top: 2px solid #ddd; text-align: center; font-size: 10pt; color: #666;">
          <div style="margin-bottom: 8px; font-weight: bold;">
            ✓ Dokumen ini telah diverifikasi dan disetujui oleh Admin Kanwil
          </div>
          <div style="font-size: 9pt;">
            Tanggal Approval: ${a.approved_at?new Date(a.approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}
          </div>
          <div style="font-size: 8pt; margin-top: 5px;">
            Si Imut Kanwil Kemenag NTB
          </div>
        </div>
      </body>
      </html>
    `;t.document.write(n),t.document.close(),t.print()},ga=()=>{var k,$e,Be,Ke,Ee;const a=window.open("","_blank");if(!a)return;const t=s.files.filter(m=>m.file_category==="kabupaten"),i=s.files.filter(m=>m.file_category==="admin_wilayah").filter(m=>["surat_pengantar_permohonan_rekomendasi","surat_rekomendasi_kanwil_khusus","surat_persetujuan_kepala_wilayah","surat_pernyataan_tidak_ikatan_dinas","surat_pernyataan_tidak_tugas_belajar","surat_keterangan_kanwil","surat_rekomendasi_kanwil"].includes(m.file_type)),u=[...t,...i],f=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Final Pengajuan - ${(k=s.pegawai)==null?void 0:k.nama}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .info table { width: 100%; border-collapse: collapse; }
          .info td { padding: 5px; }
          .info td:first-child { font-weight: bold; width: 150px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14pt; font-weight: bold; margin-bottom: 15px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; font-size: 10pt; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .checkbox { width: 20px; height: 20px; }
          .status-approved { color: #000000; font-weight: bold; }
          .status-rejected { color: #000000; font-weight: bold; }
          .status-pending { color: #000000; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #000000; margin-bottom: 10px;">LAPORAN FINAL PENGAJUAN JABATAN</h1>
          <h3 style="color: #374151; margin: 0;">Si Imut Kanwil Kemenag NTB</h3>
        </div>
        
                          <div class="info">
           <table>
             <tr><td>Nama Pegawai</td><td>: ${($e=s.pegawai)==null?void 0:$e.nama}</td></tr>
             <tr><td>NIP</td><td>: ${(Be=s.pegawai)==null?void 0:Be.nip}</td></tr>
             <tr><td>Jabatan</td><td>: ${(Ke=s.pegawai)==null?void 0:Ke.jabatan}</td></tr>
             <tr><td>Jenis Jabatan</td><td>: ${s.jenis_jabatan}</td></tr>
                           <tr><td>Kabupaten/Kota Asal</td><td>: ${((Ee=s.office)==null?void 0:Ee.kabkota)||"Tidak tersedia"}</td></tr>
             <tr><td>Status Pengajuan</td><td>: <span class="status-approved">FINAL APPROVED</span></td></tr>
             <tr><td>Tanggal Final Approval</td><td>: ${s.final_approved_at?new Date(s.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}</td></tr>
             <tr><td>Disetujui Oleh</td><td>: ${s.final_approved_at?new Date(s.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}</td></tr>
           </table>
         </div>

        <!-- Berkas Kabupaten/Kota -->
        <div class="section">
          <div class="section-title">📋 Berkas Kabupaten/Kota (${t.length} dokumen)</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Berkas</th>
                <th>Status Verifikasi</th>
                <th>Verifikator</th>
              </tr>
            </thead>
            <tbody>
              ${t.map((m,X)=>`
                <tr>
                  <td>${X+1}</td>
                  <td>${B(m.file_type)}</td>
                  <td>
                    <span class="status-${m.verification_status}">
                      ${m.verification_status==="approved"?"✓ Sesuai":m.verification_status==="rejected"?"✗ Tidak Sesuai":"○ Belum Diverifikasi"}
                    </span>
                  </td>
                  <td>${m.verified_by||"-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Berkas Admin Wilayah -->
        <div class="section">
          <div class="section-title">🏛️ Berkas Admin Wilayah (${i.length} dokumen)</div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Berkas</th>
                <th>Status Verifikasi</th>
                <th>Verifikator</th>
              </tr>
            </thead>
            <tbody>
              ${i.map((m,X)=>`
                <tr>
                  <td>${X+1}</td>
                  <td>${B(m.file_type)}</td>
                  <td>
                    <span class="status-${m.verification_status}">
                      ${m.verification_status==="approved"?"✓ Sesuai":m.verification_status==="rejected"?"✗ Tidak Sesuai":"○ Belum Diverifikasi"}
                    </span>
                  </td>
                  <td>${m.verified_by||"-"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Ringkasan -->
        <div class="section">
          <div class="section-title">📊 Ringkasan Dokumen</div>
          <table>
            <tr>
              <td><strong>Total Berkas Kabupaten/Kota:</strong></td>
              <td>${t.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Berkas Admin Wilayah:</strong></td>
              <td>${i.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Semua Berkas:</strong></td>
              <td><strong>${u.length} dokumen</strong></td>
            </tr>
          </table>
        </div>
        
                 <!-- Final Verification Footer -->
         <div style="margin-top: 40px; padding: 20px; border: 3px solid #000000; border-radius: 10px; text-align: center; font-size: 11pt; background-color: #ffffff;">
           <div style="margin-bottom: 10px; font-weight: bold; color: #000000; font-size: 14pt;">
             PENGAJUAN JABATAN TELAH DISETUJUI FINAL
           </div>
           <div style="margin-bottom: 8px; font-weight: bold; color: #000000;">
             ✓ Semua dokumen telah diverifikasi dan disetujui oleh Admin Wilayah dan Superadmin
           </div>
           <div style="font-size: 10pt; color: #000000; margin-bottom: 5px;">
             Tanggal Final Approval: ${s.final_approved_at?new Date(s.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}
           </div>
           <div style="font-size: 9pt; color: #000000; margin-top: 10px;">
             Si Imut Kanwil Kemenag NTB
           </div>
         </div>
      </body>
      </html>
    `;a.document.write(f),a.document.close(),a.print()},v=a=>new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),we=a=>{const n=["Bytes","KB","MB","GB"],i=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,i)).toFixed(2))+" "+n[i]},Se=async a=>{try{const t=await fetch(`/api/pengajuan/files/${a.id}`,{headers:{Authorization:`Bearer ${p}`}});if(!t.ok)throw new Error("Gagal mengambil file");const n=await t.blob(),i=URL.createObjectURL(n);ze({...a,blobUrl:i}),ve(!0)}catch(t){console.error("Error previewing file:",t),c("Gagal preview file. Silakan coba lagi.")}},De=a=>{window.open(`/api/pengajuan/files/${a.id}`,"_blank")},j=(r==null?void 0:r.role)==="admin",w=(r==null?void 0:r.role)==="admin_wilayah",Ae=(()=>{if(!s)return!1;const a=new Set([...U,...O]);for(const t of a){const n=s.files.find(i=>i.file_type===t);if(n&&n.verification_status==="pending")return!0}return!1})(),K=((s==null?void 0:s.status)==="draft"||(s==null?void 0:s.status)==="rejected")&&(j||(s==null?void 0:s.created_by)===(r==null?void 0:r.id))&&!Ae,Pe=(s==null?void 0:s.status)==="draft"&&(j||(s==null?void 0:s.created_by)===(r==null?void 0:r.id))&&!Ae,ja=j&&(s==null?void 0:s.status)==="submitted"||w&&((s==null?void 0:s.status)==="approved"||(s==null?void 0:s.status)==="submitted"),fa=j&&(s==null?void 0:s.status)==="submitted"||w&&((s==null?void 0:s.status)==="approved"||(s==null?void 0:s.status)==="submitted"),ba=((s==null?void 0:s.status)==="rejected"||(s==null?void 0:s.status)==="draft")&&(r==null?void 0:r.role)!=="user",E=(()=>{if(!s)return!1;const a=new Set([...U,...O]);if(a.size===0)return!1;for(const t of a){const n=s.files.find(i=>i.file_type===t);if(!n||n.verification_status!=="approved")return!1}return!0})(),Te=(()=>{if(!s)return!1;const a=new Set([...U,...O]);for(const t of a){const n=s.files.find(i=>i.file_type===t);if(!n||n.verification_status==="rejected")return!0}return!1})(),va=!Te,ya=(()=>{if(!s)return!1;const a=s.files.filter(t=>t.file_category==="admin_wilayah");if(a.length===0)return!1;for(const t of a)if(t.verification_status!=="approved")return!1;return!0})(),ka=(()=>{if(!s)return!1;const a=s.files.filter(t=>t.file_category==="admin_wilayah");if(a.length===0)return!1;for(const t of a)if(t.verification_status==="rejected")return!0;return!1})();return Je?e.jsx("div",{className:"container mx-auto p-6",children:e.jsx(N,{children:e.jsxs(_,{className:"flex items-center justify-center py-12",children:[e.jsx(b,{className:"h-8 w-8 animate-spin mr-2"}),e.jsx("span",{children:"Memuat detail pengajuan..."})]})})}):s?e.jsxs("div",{className:"container mx-auto p-6",children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .sidebar-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        `}}),e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(l,{variant:"outline",onClick:()=>D("/pengajuan"),className:"flex items-center gap-2",children:[e.jsx(_a,{className:"h-4 w-4"}),"Kembali ke Data Pengajuan"]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Detail Pengajuan"}),e.jsxs("p",{className:"text-gray-600",children:["ID: ",s.id]})]})]}),e.jsx("div",{className:"flex items-center gap-2",children:ma(s.status)})]}),be&&e.jsx("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",children:e.jsx("p",{className:"text-red-600",children:be})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"lg:col-span-2 space-y-6",children:[e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(wa,{className:"h-5 w-5"}),"Informasi Pegawai"]})}),e.jsx(_,{className:"space-y-4",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Nama"}),e.jsx("p",{className:"text-gray-900 text-base",children:s.pegawai.nama})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"NIP"}),e.jsx("p",{className:"text-gray-900 text-base",children:s.pegawai.nip})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Jabatan Saat Ini"}),e.jsx("p",{className:"text-gray-900 text-base",children:s.pegawai.jabatan})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Jenis Jabatan Target"}),e.jsx(S,{variant:"outline",className:"text-sm",children:ua(s.jenis_jabatan)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Kabupaten/Kota Asal"}),e.jsx("p",{className:"text-gray-900 text-base",children:((Fe=s.office)==null?void 0:Fe.kabkota)||"Tidak tersedia"})]})]})})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Z,{className:"h-5 w-5"}),"Berkas Kabupaten/Kota",e.jsxs(S,{variant:"outline",className:"ml-2",children:[s.files.filter(a=>!a.file_category||a.file_category==="kabupaten").length," / ",U.length]}),j&&s.status==="submitted"&&e.jsx(S,{variant:E?"default":"destructive",className:`ml-2 ${E?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:E?"Semua Dokumen Sesuai":"Ada Dokumen Tidak Sesuai"})]})}),e.jsx(_,{children:s.files.filter(a=>!a.file_category||a.file_category==="kabupaten").length===0?e.jsxs("div",{className:"text-center py-8",children:[e.jsx(Z,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500",children:"Belum ada dokumen kabupaten yang diupload"}),K&&s.status!=="draft"&&e.jsxs(l,{onClick:()=>D(`/pengajuan/${s.id}/edit`),className:"mt-4 bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]}),K&&s.status==="draft"&&e.jsxs(l,{onClick:()=>window.open(`http://localhost:8080/pengajuan/${s.id}/upload`,"_blank"),className:"mt-4 bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]})]}):e.jsx("div",{className:"space-y-4",children:s.files.filter(a=>!a.file_category||a.file_category==="kabupaten").map(a=>e.jsx("div",{className:"p-6 border rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("h4",{className:"font-medium text-base",children:B(a.file_type)}),e.jsx("p",{className:"text-sm text-gray-600",children:a.file_name}),e.jsx("p",{className:"text-xs text-gray-500",children:we(a.file_size)}),e.jsxs("div",{className:"mt-3 space-y-2",children:[e.jsxs(S,{variant:a.verification_status==="approved"?"default":"destructive",className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"bg-green-100 text-green-800":a.verification_status==="rejected"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:[a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi",a.verified_by&&` - ${a.verified_by}`]}),a.verification_notes&&e.jsx("p",{className:"text-xs text-gray-600",children:a.verification_notes})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"text-xs text-gray-500 mb-2",children:["Debug: user.role=",r==null?void 0:r.role,", isAdmin=",j?"true":"false",", isAdminWilayah=",w?"true":"false",", status=",s.status]}),(j||w)&&(s.status==="submitted"||s.status==="rejected")?e.jsx("div",{className:"flex items-center gap-3 mr-3",children:Y===a.id?e.jsx(b,{className:"h-4 w-4 animate-spin text-gray-500"}):e.jsxs("div",{className:"flex items-center gap-3 transition-all duration-500 ease-in-out",children:[e.jsx("div",{className:"relative transform transition-all duration-500 ease-in-out hover:scale-105 active:scale-95",children:e.jsx(Oe,{id:`verify-${a.id}`,checked:a.verification_status==="approved",onCheckedChange:t=>{const n=t?"approved":"rejected";_e(a.id,n)},disabled:Y===a.id,className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600":"data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600"}`})}),e.jsx(Ue,{htmlFor:`verify-${a.id}`,className:`text-sm font-medium cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 ${a.verification_status==="approved"?"text-green-700":a.verification_status==="rejected"?"text-red-700":"text-gray-700"}`,children:a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi"})]})}):null,e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>Se(a),className:"px-3 py-2",children:[e.jsx(Re,{className:"h-4 w-4 mr-2"}),"Preview"]}),e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>De(a),className:"px-3 py-2",children:[e.jsx(Le,{className:"h-4 w-4 mr-2"}),"Download"]})]})]})},a.id))})})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Z,{className:"h-5 w-5"}),"Berkas Admin Wilayah",e.jsxs(S,{variant:"outline",className:"ml-2",children:[s.files.filter(a=>a.file_category==="admin_wilayah").length," / ",O.length]})]})}),e.jsx(_,{children:s.files.filter(a=>a.file_category==="admin_wilayah").length===0?e.jsxs("div",{className:"text-center py-8",children:[e.jsx(Z,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500",children:"Belum ada dokumen admin wilayah yang diupload"})]}):e.jsx("div",{className:"space-y-4",children:s.files.filter(a=>a.file_category==="admin_wilayah").map(a=>e.jsx("div",{className:"p-6 border rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("h4",{className:"font-medium text-base",children:B(a.file_type)}),e.jsx("p",{className:"text-sm text-gray-600",children:a.file_name}),e.jsx("p",{className:"text-xs text-gray-500",children:we(a.file_size)}),a.uploaded_by_name&&e.jsxs("div",{className:"text-xs text-gray-500",children:["Upload oleh: ",a.uploaded_by_name," (",a.uploaded_by_office||"Admin Wilayah",")"]}),e.jsxs("div",{className:"mt-3 space-y-2",children:[e.jsxs(S,{variant:a.verification_status==="approved"?"default":"destructive",className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"bg-green-100 text-green-800":a.verification_status==="rejected"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:[a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi",a.verified_by&&` - ${a.verified_by}`]}),a.verification_notes&&e.jsx("p",{className:"text-xs text-gray-600",children:a.verification_notes})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[j&&(s.status==="submitted"||s.status==="rejected"||s.status==="admin_wilayah_approved")||w&&(s.status==="submitted"||s.status==="approved"||s.status==="rejected")?e.jsx("div",{className:"flex items-center gap-3 mr-3",children:Y===a.id?e.jsx(b,{className:"h-4 w-4 animate-spin text-gray-500"}):e.jsxs("div",{className:"flex items-center gap-3 transition-all duration-500 ease-in-out",children:[e.jsx("div",{className:"relative transform transition-all duration-500 ease-in-out hover:scale-105 active:scale-95",children:e.jsx(Oe,{id:`verify-${a.id}`,checked:a.verification_status==="approved",onCheckedChange:t=>{const n=t?"approved":"rejected";_e(a.id,n)},disabled:Y===a.id,className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600":"data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600"}`})}),e.jsx(Ue,{htmlFor:`verify-${a.id}`,className:`text-sm font-medium cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 ${a.verification_status==="approved"?"text-green-700":a.verification_status==="rejected"?"text-red-700":"text-gray-700"}`,children:a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi"})]})}):null,e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>Se(a),className:"px-3 py-2",children:[e.jsx(Re,{className:"h-4 w-4 mr-2"}),"Preview"]}),e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>De(a),className:"px-3 py-2",children:[e.jsx(Le,{className:"h-4 w-4 mr-2"}),"Download"]})]})]})},a.id))})})]})]}),e.jsxs("div",{className:`space-y-6 transition-all duration-300 ${Ne?"lg:sticky lg:top-6 lg:z-40 lg:self-start sidebar-scroll":""}`,style:Ne?{position:"sticky",top:"80px",zIndex:40,maxHeight:"calc(100vh - 120px)",overflowY:"scroll",paddingRight:"12px"}:{},children:[e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Sa,{className:"h-5 w-5"}),"Timeline Status"]})}),e.jsx(_,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Dibuat"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.created_at)})]})]}),s.status!=="draft"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-blue-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Diajukan"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)})]})]}),s.status==="approved"&&s.approved_at&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.approved_at)}),s.approved_by&&e.jsxs("p",{className:"text-xs text-gray-500",children:["oleh ",s.approved_by]})]})]}),s.status==="rejected"&&s.rejected_at&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.rejected_at)}),s.rejected_by&&e.jsxs("p",{className:"text-xs text-gray-500",children:["oleh ",s.rejected_by]})]})]}),s.status==="admin_wilayah_approved"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui Admin Wilayah"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah menyetujui pengajuan"})]})]}),s.status==="admin_wilayah_rejected"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak Admin Wilayah"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah menolak pengajuan"})]})]}),s.status==="submitted"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-blue-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Diajukan ke Superadmin"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah mengajukan ke Superadmin untuk review final"})]})]}),s.status==="final_approved"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-600 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui Final"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Superadmin menyetujui final pengajuan"})]})]}),s.status==="final_rejected"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-600 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak Final"}),e.jsx("p",{className:"text-sm text-gray-600",children:v(s.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Superadmin menolak final pengajuan"})]})]})]})})]}),(s.catatan||s.rejection_reason)&&e.jsxs(N,{children:[e.jsx(C,{children:e.jsx(F,{children:"Catatan"})}),e.jsxs(_,{children:[s.catatan&&e.jsxs("div",{className:"mb-6",children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-3",children:"Catatan Persetujuan:"}),e.jsx("p",{className:"text-sm text-gray-900 bg-green-50 p-4 rounded-lg leading-relaxed",children:s.catatan})]}),s.rejection_reason&&e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-3",children:"Alasan Penolakan:"}),e.jsx("p",{className:"text-sm text-gray-900 bg-red-50 p-4 rounded-lg leading-relaxed",children:s.rejection_reason})]})]})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsx(F,{children:"Aksi"})}),e.jsxs(_,{className:"space-y-3",children:[ja&&E&&e.jsxs(l,{onClick:()=>J(!0),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ne,{className:"h-4 w-4 mr-2"}),"Setujui"]}),fa&&(Te||!E)&&e.jsxs(l,{onClick:()=>z(!0),variant:"destructive",className:"w-full",children:[e.jsx(Ie,{className:"h-4 w-4 mr-2"}),"Tolak"]}),ba&&e.jsx(l,{onClick:ca,disabled:o||!va,className:"w-full bg-yellow-600 hover:bg-yellow-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Da,{className:"h-4 w-4 mr-2"}),"Ajukan Ulang"]})}),(s==null?void 0:s.status)==="draft"&&K&&e.jsxs(l,{onClick:()=>window.open(`http://localhost:8080/pengajuan/${s.id}/upload`,"_blank"),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]}),(s==null?void 0:s.status)==="draft"&&Pe&&e.jsxs(l,{onClick:()=>A(!0),variant:"destructive",className:"w-full",children:[e.jsx(Me,{className:"h-4 w-4 mr-2"}),"Hapus Pengajuan"]}),K&&s.status!=="draft"&&e.jsxs(l,{onClick:()=>D(`/pengajuan/${s.id}/edit`),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]}),K&&s.status==="draft"&&e.jsxs(l,{onClick:()=>window.open(`http://localhost:8080/pengajuan/${s.id}/upload`,"_blank"),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(R,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]}),Pe&&e.jsxs(l,{onClick:()=>A(!0),variant:"destructive",className:"w-full",children:[e.jsx(Me,{className:"h-4 w-4 mr-2"}),"Hapus Pengajuan"]}),s.status==="approved"&&j&&e.jsxs(l,{onClick:()=>q(!0),className:"w-full bg-blue-600 hover:bg-blue-700 text-white",children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Cetak Laporan"]}),j&&s.status==="admin_wilayah_approved"&&e.jsxs(e.Fragment,{children:[ya&&e.jsxs(l,{onClick:()=>G(!0),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ne,{className:"h-4 w-4 mr-2"}),"Setujui Final"]}),ka&&e.jsxs(l,{onClick:()=>H(!0),variant:"destructive",className:"w-full",children:[e.jsx(Ie,{className:"h-4 w-4 mr-2"}),"Tolak Final"]})]}),s.status==="final_approved"&&j&&e.jsxs(l,{onClick:ha,className:"w-full bg-blue-600 hover:bg-blue-700 text-white",children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Cetak Laporan Final"]})]})]})]})]}),e.jsx(L,{open:Ge,onOpenChange:J,children:e.jsxs(I,{children:[e.jsx(M,{children:e.jsx(W,{children:"Setujui Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Catatan (Opsional)"}),e.jsx(ae,{value:V,onChange:a=>te(a.target.value),placeholder:"Masukkan catatan persetujuan...",rows:3,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>J(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:na,disabled:o,className:"flex-1 bg-green-600 hover:bg-green-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Setujui"})]})]})]})}),e.jsx(de,{open:Ve,onOpenChange:A,children:e.jsxs(ce,{children:[e.jsxs(oe,{children:[e.jsx(me,{children:"Hapus Pengajuan"}),e.jsx(ue,{children:"Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan dan semua file yang diupload akan dihapus secara permanen."})]}),e.jsxs(pe,{children:[e.jsx(We,{disabled:o,children:"Batal"}),e.jsx(he,{onClick:oa,disabled:o,className:"bg-red-600 hover:bg-red-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Menghapus..."]}):"Hapus Pengajuan"})]})]})}),e.jsx(de,{open:Ye,onOpenChange:q,children:e.jsxs(ce,{children:[e.jsxs(oe,{children:[e.jsx(me,{children:"Cetak Laporan"}),e.jsx(ue,{children:"Apakah Anda yakin ingin mencetak laporan pengajuan ini? Laporan akan dibuka di tab baru untuk dicetak."})]}),e.jsxs(pe,{children:[e.jsx(We,{disabled:o,children:"Batal"}),e.jsx(he,{onClick:pa,disabled:o,className:"bg-blue-600 hover:bg-blue-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Menyiapkan..."]}):e.jsxs(e.Fragment,{children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Cetak Laporan"]})})]})]})}),e.jsx(L,{open:He,onOpenChange:z,children:e.jsxs(I,{children:[e.jsx(M,{children:e.jsx(W,{children:"Tolak Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Alasan Penolakan *"}),e.jsx(ae,{value:$,onChange:a=>ie(a.target.value),placeholder:"Masukkan alasan penolakan...",rows:3,required:!0,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>z(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:ra,disabled:o||!$.trim(),variant:"destructive",className:"flex-1",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Tolak"})]})]})]})}),e.jsx(L,{open:Ze,onOpenChange:G,children:e.jsxs(I,{children:[e.jsx(M,{children:e.jsx(W,{children:"Setujui Final Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Catatan (Opsional)"}),e.jsx(ae,{value:aa,onChange:a=>sa(a.target.value),placeholder:"Masukkan catatan persetujuan final...",rows:3,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>G(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:la,disabled:o,className:"flex-1 bg-green-600 hover:bg-green-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Setujui Final"})]})]})]})}),e.jsx(L,{open:Qe,onOpenChange:H,children:e.jsxs(I,{children:[e.jsx(M,{children:e.jsx(W,{children:"Tolak Final Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Alasan Penolakan Final *"}),e.jsx(ae,{value:ye,onChange:a=>ta(a.target.value),placeholder:"Masukkan alasan penolakan final...",rows:3,required:!0,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>H(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:da,disabled:o||!ye.trim(),variant:"destructive",className:"flex-1",children:o?e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Tolak Final"})]})]})]})}),e.jsx(L,{open:qe,onOpenChange:a=>{ve(a),!a&&(g!=null&&g.blobUrl)&&URL.revokeObjectURL(g.blobUrl)},children:e.jsxs(I,{className:"max-w-4xl",children:[e.jsx(M,{children:e.jsxs(W,{children:["Preview File: ",g==null?void 0:g.file_name]})}),e.jsx("div",{className:"mt-4",children:g&&e.jsxs("div",{className:"border rounded-lg overflow-hidden bg-white",children:[e.jsx("div",{className:"bg-green-600 text-white px-4 py-2 flex items-center justify-between",children:e.jsx("span",{className:"font-medium",children:g.file_name})}),e.jsx("iframe",{src:g.blobUrl||`/api/pengajuan/files/${g.id}`,className:"w-full h-96 border-0",title:"File Preview"})]})})]})}),e.jsx(de,{open:Xe,onOpenChange:y,children:e.jsxs(ce,{children:[e.jsxs(oe,{children:[e.jsxs(me,{className:"flex items-center gap-2",children:[e.jsx(ne,{className:"h-5 w-5 text-green-600"}),"Berhasil!"]}),e.jsx(ue,{className:"text-green-700",children:ea})]}),e.jsx(pe,{children:e.jsx(he,{onClick:()=>y(!1),className:"bg-green-600 hover:bg-green-700 text-white",children:"OK"})})]})})]}):e.jsx("div",{className:"container mx-auto p-6",children:e.jsx(N,{children:e.jsxs(_,{className:"flex items-center justify-center py-12",children:[e.jsx(Na,{className:"h-8 w-8 text-red-500 mr-2"}),e.jsx("span",{className:"text-red-600",children:"Pengajuan tidak ditemukan"})]})})})};export{Ua as default};
//# sourceMappingURL=PengajuanDetail-DmXKyosY.js.map
