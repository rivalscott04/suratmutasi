import{j as e,W as v,av as Na,Z as _a,Y as wa,a0 as Q,ar as ee,aE as Re,ah as Ie,ae as Sa,_ as le,aF as Le,ag as Aa,as as Me,aB as de}from"./ui-vendor-wOlhVLNZ.js";import{g as Da,d as Pa,r as d}from"./react-vendor-C8WR5ETM.js";import{C as N,c as _,a as C,b as F}from"./card-CmiXUwcw.js";import{u as Ta,a as ce,B as l,b as w,D as R,e as I,f as L,g as M,k as ae,j as te,m as Ca}from"./index-Bxw0YLNG.js";import{A as oe,a as me,b as ue,c as pe,d as he,e as xe,g as We,f as ge}from"./alert-dialog-Bb9QJHwp.js";import{T as se}from"./textarea-jABx3lOZ.js";import{L as Ue}from"./label-CF7ao0Oc.js";import{S as Je}from"./switch-1kUvmwRU.js";const Ua=()=>{var $e,Be;const{pengajuanId:x}=Da(),S=Pa(),{user:n,token:p,isAuthenticated:je,originalUser:Fa,isImpersonating:$a}=Ta(),[t,fe]=d.useState(null),[W,be]=d.useState([]),[U,ie]=d.useState([]),[Oe,ve]=d.useState(!0),[ye,c]=d.useState(null),[j,ze]=d.useState(null),[qe,ke]=d.useState(!1),[Ge,J]=d.useState(!1),[He,O]=d.useState(!1),[Ve,A]=d.useState(!1),[Ye,z]=d.useState(!1),[Xe,k]=d.useState(!1),[Ze,q]=d.useState(!1),[Qe,G]=d.useState(!1),[ea,D]=d.useState(""),[H,ne]=d.useState(""),[$,re]=d.useState(""),[aa,ta]=d.useState(""),[Ne,sa]=d.useState(""),[o,h]=d.useState(!1),[V,_e]=d.useState(null),[we,ia]=d.useState(!1);($e=t==null?void 0:t.files)!=null&&$e.some(a=>a.file_category==="admin_wilayah"),d.useEffect(()=>{if(!je){S("/");return}x&&P()},[je,S,x]),d.useEffect(()=>{const a=()=>{const s=window.pageYOffset||document.documentElement.scrollTop;ia(s>50)};return a(),window.addEventListener("scroll",a,{passive:!0}),()=>window.removeEventListener("scroll",a)},[]);const P=async()=>{var a,s,r;try{ve(!0);const i=await ce(`/api/pengajuan/${x}`,p);if(i.success)if(fe(i.data.pengajuan),Array.isArray(i.data.requiredFiles)?be(i.data.requiredFiles):be([]),(n==null?void 0:n.role)==="admin_wilayah")try{const m=await ce(`/api/admin-wilayah/pengajuan/${x}`,p),g=((a=m==null?void 0:m.adminWilayahFileConfig)==null?void 0:a.required)||((r=(s=m==null?void 0:m.data)==null?void 0:s.adminWilayahFileConfig)==null?void 0:r.required)||[];ie(g.map(f=>f.file_type))}catch{ie([])}else ie([]);else c(i.message||"Gagal mengambil data pengajuan")}catch(i){console.error("Error fetching pengajuan data:",i),c("Terjadi kesalahan saat mengambil data pengajuan")}finally{ve(!1)}},na=async()=>{try{h(!0);const a=T?await ae(`/api/admin-wilayah/pengajuan/${x}/approve`,{notes:H},p):await te(`/api/pengajuan/${x}/approve`,{catatan:H},p);a.success?(D("Pengajuan berhasil disetujui!"),k(!0),J(!1),ne(""),await P()):c(a.message||"Gagal approve pengajuan")}catch(a){console.error("Error approving pengajuan:",a),c("Terjadi kesalahan saat approve pengajuan")}finally{h(!1)}},ra=async()=>{try{h(!0);const a=T?await ae(`/api/admin-wilayah/pengajuan/${x}/reject`,{rejection_reason:$},p):await te(`/api/pengajuan/${x}/reject`,{rejection_reason:$},p);a.success?(D("Pengajuan berhasil ditolak!"),k(!0),O(!1),re(""),await P()):c(a.message||"Gagal reject pengajuan")}catch(a){console.error("Error rejecting pengajuan:",a),c("Terjadi kesalahan saat reject pengajuan")}finally{h(!1)}},la=async()=>{try{h(!0);const a=await ae(`/api/pengajuan/${x}/final-approve`,{notes:H},p);a.success?(D("Pengajuan berhasil disetujui final!"),k(!0),q(!1),ne(""),await P()):c(a.message||"Gagal approve final pengajuan")}catch(a){console.error("Error final approving pengajuan:",a),c("Terjadi kesalahan saat approve final pengajuan")}finally{h(!1)}},da=async()=>{try{h(!0);const a=await ae(`/api/pengajuan/${x}/final-reject`,{rejection_reason:$},p);a.success?(D("Pengajuan berhasil ditolak final!"),k(!0),G(!1),re(""),await P()):c(a.message||"Gagal reject final pengajuan")}catch(a){console.error("Error final rejecting pengajuan:",a),c("Terjadi kesalahan saat reject final pengajuan")}finally{h(!1)}},ca=async()=>{try{h(!0);const a=await te(`/api/pengajuan/${x}/resubmit`,{},p);a.success?(D("Pengajuan berhasil diajukan ulang!"),k(!0),await P()):c(a.message||"Gagal resubmit pengajuan")}catch(a){console.error("Error resubmitting pengajuan:",a),c("Terjadi kesalahan saat resubmit pengajuan")}finally{h(!1)}},oa=async()=>{try{h(!0);const a=await Ca(`/api/pengajuan/${x}`,p);a.success?(D("Pengajuan berhasil dihapus!"),k(!0),A(!1),setTimeout(()=>{S("/pengajuan")},2e3)):(c(a.message||"Gagal menghapus pengajuan"),A(!1))}catch(a){console.error("Error deleting pengajuan:",a),c("Terjadi kesalahan saat menghapus pengajuan"),A(!1)}finally{h(!1)}},ma=(a,s)=>{const m={draft:{label:"DRAFT",className:"bg-gray-100 text-gray-800"},submitted:{label:((g,f)=>{var E;return g!=="submitted"||!f?!1:((E=f.files)==null?void 0:E.some(X=>X.file_category==="admin_wilayah"))||!1})(a,s)?"DIAJUKAN ADMIN WILAYAH":"SUBMITTED",className:"bg-blue-100 text-blue-800"},approved:{label:"APPROVED",className:"bg-green-100 text-green-800"},rejected:{label:"REJECTED",className:"bg-red-100 text-red-800"},resubmitted:{label:"RESUBMITTED",className:"bg-yellow-100 text-yellow-800"},admin_wilayah_approved:{label:"ADMIN_WILAYAH_APPROVED",className:"bg-green-200 text-green-800"},admin_wilayah_rejected:{label:"ADMIN_WILAYAH_REJECTED",className:"bg-red-200 text-red-800"},final_approved:{label:"FINAL_APPROVED",className:"bg-green-600 text-white"},final_rejected:{label:"FINAL_REJECTED",className:"bg-red-600 text-white"}}[a]||{label:a.toUpperCase(),className:"bg-gray-100 text-gray-800"};return e.jsx(w,{className:m.className,children:m.label})},ua=a=>({guru:"Guru",eselon_iv:"Eselon IV",fungsional:"Fungsional",pelaksana:"Pelaksana"})[a]||a,B=a=>({surat_pengantar:"Surat Pengantar",surat_permohonan_dari_yang_bersangkutan:"Surat Permohonan Dari Yang Bersangkutan",surat_keputusan_cpns:"Surat Keputusan CPNS",surat_keputusan_pns:"Surat Keputusan PNS",surat_keputusan_kenaikan_pangkat_terakhir:"Surat Keputusan Kenaikan Pangkat Terakhir",surat_keputusan_jabatan_terakhir:"Surat Keputusan Jabatan Terakhir",skp_2_tahun_terakhir:"SKP 2 Tahun Terakhir",surat_keterangan_bebas_temuan_inspektorat:"Surat Keterangan Bebas Temuan Yang Diterbitkan Inspektorat Jenderal Kementerian Agama",surat_keterangan_anjab_abk_instansi_asal:"Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi asal",surat_keterangan_anjab_abk_instansi_penerima:"Surat Keterangan Anjab dan ABK terhadap jabatan PNS dari instansi penerima",surat_pernyataan_tidak_hukuman_disiplin:"Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin Tingkat Sedang atau Berat Dalam 1 (satu) Tahun Terakhir Dari PPK",surat_persetujuan_mutasi_asal:"Surat Persetujuan Mutasi dari ASAL dengan menyebutkan jabatan yang akan diduduki",surat_lolos_butuh_ppk:"Surat Lolos Butuh dari Pejabat Pembina Kepegawaian instansi yang dituju",peta_jabatan:"Peta Jabatan",hasil_uji_kompetensi:"Hasil Uji Kompetensi",hasil_evaluasi_pertimbangan_baperjakat:"Hasil Evaluasi dan Pertimbangan (BAPERJAKAT)",anjab_abk_instansi_asal:"Anjab/Abk Instansi Asal",anjab_abk_instansi_penerima:"Anjab/Abk Instansi Penerima",surat_keterangan_tidak_tugas_belajar:"Surat Keterangan Tidak Sedang Tugas Belajar",sptjm_pimpinan_satker_asal:"SPTJM Pimpinan Satker dari Asal",sptjm_pimpinan_satker_penerima:"SPTJM Pimpinan Satker dari Penerima",surat_rekomendasi_instansi_pembina:"Surat Rekomendasi Instansi Pembina",surat_pengantar_permohonan_rekomendasi:"Surat Pengantar Permohonan Rekomendasi",surat_rekomendasi_kanwil_khusus:"Surat Rekomendasi Kanwil Khusus",surat_persetujuan_kepala_wilayah:"Surat Persetujuan Kepala Wilayah",surat_pernyataan_tidak_ikatan_dinas:"Surat Pernyataan Tidak Ikatan Dinas",surat_pernyataan_tidak_tugas_belajar:"Surat Pernyataan Tidak Tugas Belajar",surat_keterangan_kanwil:"Surat Keterangan Kanwil",surat_rekomendasi_kanwil:"Surat Rekomendasi Kanwil"})[a]||a.replace(/_/g," ").toUpperCase(),Se=async(a,s,r)=>{try{console.log("🔍 Debug handleVerifyFile:",{fileId:a,verificationStatus:s,notes:r,token:p}),_e(a);const i={verification_status:s,verification_notes:r};console.log("📤 Request data:",i);const m=await te(`/api/pengajuan/files/${a}/verify`,i,p);console.log("📥 Response:",m),m.success?fe(g=>g&&{...g,files:g.files.map(f=>f.id===a?{...f,verification_status:s,verified_by:(n==null?void 0:n.email)||(n==null?void 0:n.id),verified_at:new Date().toISOString()}:f)}):c(m.message||"Gagal verifikasi file")}catch(i){console.error("❌ Error verifying file:",i),c("Terjadi kesalahan saat verifikasi file")}finally{_e(null)}},pa=async()=>{try{h(!0);const a=await ce(`/api/pengajuan/${x}/print-report`,p);a.success?xa(a.data):c(a.message||"Gagal generate laporan")}catch(a){console.error("Error generating print report:",a),c("Terjadi kesalahan saat generate laporan")}finally{h(!1),z(!1)}},ha=()=>{try{ga(),z(!1)}catch(a){console.error("Error generating final print report:",a),c("Terjadi kesalahan saat generate laporan final")}},xa=a=>{var i;const s=window.open("","_blank");if(!s)return;const r=`
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
            ${a.files.map((m,g)=>`
              <tr>
                <td>${g+1}</td>
                <td>${B(m.file_type)}</td>
                <td>
                  <input type="checkbox" class="checkbox" ${m.verification_status==="approved"?"checked":""} disabled>
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
    `;s.document.write(r),s.document.close(),s.print()},ga=()=>{var f,E,X,Ke,Ee;const a=window.open("","_blank");if(!a)return;const s=t.files.filter(u=>u.file_category==="kabupaten"),i=t.files.filter(u=>u.file_category==="admin_wilayah").filter(u=>["surat_pengantar_permohonan_rekomendasi","surat_rekomendasi_kanwil_khusus","surat_persetujuan_kepala_wilayah","surat_pernyataan_tidak_ikatan_dinas","surat_pernyataan_tidak_tugas_belajar","surat_keterangan_kanwil","surat_rekomendasi_kanwil"].includes(u.file_type)),m=[...s,...i],g=`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Final Pengajuan - ${(f=t.pegawai)==null?void 0:f.nama}</title>
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
             <tr><td>Nama Pegawai</td><td>: ${(E=t.pegawai)==null?void 0:E.nama}</td></tr>
             <tr><td>NIP</td><td>: ${(X=t.pegawai)==null?void 0:X.nip}</td></tr>
             <tr><td>Jabatan</td><td>: ${(Ke=t.pegawai)==null?void 0:Ke.jabatan}</td></tr>
             <tr><td>Jenis Jabatan</td><td>: ${t.jenis_jabatan}</td></tr>
                           <tr><td>Kabupaten/Kota Asal</td><td>: ${((Ee=t.office)==null?void 0:Ee.kabkota)||"Tidak tersedia"}</td></tr>
             <tr><td>Status Pengajuan</td><td>: <span class="status-approved">FINAL APPROVED</span></td></tr>
             <tr><td>Tanggal Final Approval</td><td>: ${t.final_approved_at?new Date(t.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}</td></tr>
             <tr><td>Disetujui Oleh</td><td>: ${t.final_approved_at?new Date(t.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}</td></tr>
           </table>
         </div>

        <!-- Berkas Kabupaten/Kota -->
        <div class="section">
          <div class="section-title">📋 Berkas Kabupaten/Kota (${s.length} dokumen)</div>
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
              ${s.map((u,Z)=>`
                <tr>
                  <td>${Z+1}</td>
                  <td>${B(u.file_type)}</td>
                  <td>
                    <span class="status-${u.verification_status}">
                      ${u.verification_status==="approved"?"✓ Sesuai":u.verification_status==="rejected"?"✗ Tidak Sesuai":"○ Belum Diverifikasi"}
                    </span>
                  </td>
                  <td>${u.verified_by||"-"}</td>
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
              ${i.map((u,Z)=>`
                <tr>
                  <td>${Z+1}</td>
                  <td>${B(u.file_type)}</td>
                  <td>
                    <span class="status-${u.verification_status}">
                      ${u.verification_status==="approved"?"✓ Sesuai":u.verification_status==="rejected"?"✗ Tidak Sesuai":"○ Belum Diverifikasi"}
                    </span>
                  </td>
                  <td>${u.verified_by||"-"}</td>
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
              <td>${s.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Berkas Admin Wilayah:</strong></td>
              <td>${i.length} dokumen</td>
            </tr>
            <tr>
              <td><strong>Total Semua Berkas:</strong></td>
              <td><strong>${m.length} dokumen</strong></td>
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
             Tanggal Final Approval: ${t.final_approved_at?new Date(t.final_approved_at).toLocaleDateString("id-ID"):new Date().toLocaleDateString("id-ID")}
           </div>
           <div style="font-size: 9pt; color: #000000; margin-top: 10px;">
             Si Imut Kanwil Kemenag NTB
           </div>
         </div>
      </body>
      </html>
    `;a.document.write(g),a.document.close(),a.print()},y=a=>new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),Ae=a=>{const r=["Bytes","KB","MB","GB"],i=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,i)).toFixed(2))+" "+r[i]},De=async a=>{try{const s=await fetch(`/api/pengajuan/files/${a.id}`,{headers:{Authorization:`Bearer ${p}`}});if(!s.ok)throw new Error("Gagal mengambil file");const r=await s.blob(),i=URL.createObjectURL(r);ze({...a,blobUrl:i}),ke(!0)}catch(s){console.error("Error previewing file:",s),c("Gagal preview file. Silakan coba lagi.")}},Pe=a=>{window.open(`/api/pengajuan/files/${a.id}`,"_blank")},b=(n==null?void 0:n.role)==="admin",T=(n==null?void 0:n.role)==="admin_wilayah",Te=(()=>{if(!t)return!1;const a=new Set([...W,...U]);for(const s of a){const r=t.files.find(i=>i.file_type===s);if(r&&r.verification_status==="pending")return!0}return!1})(),Y=((t==null?void 0:t.status)==="draft"||(t==null?void 0:t.status)==="rejected"||(t==null?void 0:t.status)==="admin_wilayah_rejected")&&(b||(t==null?void 0:t.created_by)===(n==null?void 0:n.id))&&!Te,Ce=(t==null?void 0:t.status)==="draft"&&(b||(t==null?void 0:t.created_by)===(n==null?void 0:n.id))&&!Te,ja=b&&(t==null?void 0:t.status)==="submitted"||T&&((t==null?void 0:t.status)==="approved"||(t==null?void 0:t.status)==="submitted"),fa=b&&(t==null?void 0:t.status)==="submitted"||T&&((t==null?void 0:t.status)==="approved"||(t==null?void 0:t.status)==="submitted"),ba=((t==null?void 0:t.status)==="rejected"||(t==null?void 0:t.status)==="draft"||(t==null?void 0:t.status)==="admin_wilayah_rejected")&&(n==null?void 0:n.role)!=="user",K=(()=>{if(!t)return!1;const a=new Set([...W,...U]);if(a.size===0)return!1;for(const s of a){const r=t.files.find(i=>i.file_type===s);if(!r||r.verification_status!=="approved")return!1}return!0})(),Fe=(()=>{if(!t)return!1;const a=new Set([...W,...U]);for(const s of a){const r=t.files.find(i=>i.file_type===s);if(!r||r.verification_status==="rejected")return!0}return!1})(),va=t?(n==null?void 0:n.role)==="operator"?!0:!Fe:!1,ya=(()=>{if(!t)return!1;const a=t.files.filter(s=>s.file_category==="admin_wilayah");if(a.length===0)return!1;for(const s of a)if(s.verification_status!=="approved")return!1;return!0})(),ka=(()=>{if(!t)return!1;const a=t.files.filter(s=>s.file_category==="admin_wilayah");if(a.length===0)return!1;for(const s of a)if(s.verification_status==="rejected")return!0;return!1})();return Oe?e.jsx("div",{className:"container mx-auto p-6",children:e.jsx(N,{children:e.jsxs(_,{className:"flex items-center justify-center py-12",children:[e.jsx(v,{className:"h-8 w-8 animate-spin mr-2"}),e.jsx("span",{children:"Memuat detail pengajuan..."})]})})}):t?e.jsxs("div",{className:"container mx-auto p-6",children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
        `}}),e.jsxs("div",{className:"flex items-center justify-between mb-6",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs(l,{variant:"outline",onClick:()=>S("/pengajuan"),className:"flex items-center gap-2",children:[e.jsx(_a,{className:"h-4 w-4"}),"Kembali ke Data Pengajuan"]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Detail Pengajuan"}),e.jsxs("p",{className:"text-gray-600",children:["ID: ",t.id]})]})]}),e.jsx("div",{className:"flex items-center gap-2",children:ma(t.status,t)})]}),ye&&e.jsx("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",children:e.jsx("p",{className:"text-red-600",children:ye})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"lg:col-span-2 space-y-6",children:[e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(wa,{className:"h-5 w-5"}),"Informasi Pegawai"]})}),e.jsx(_,{className:"space-y-4",children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Nama"}),e.jsx("p",{className:"text-gray-900 text-base",children:t.pegawai.nama})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"NIP"}),e.jsx("p",{className:"text-gray-900 text-base",children:t.pegawai.nip})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Jabatan Saat Ini"}),e.jsx("p",{className:"text-gray-900 text-base",children:t.pegawai.jabatan})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Jenis Jabatan Target"}),e.jsx(w,{variant:"outline",className:"text-sm",children:ua(t.jenis_jabatan)})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Kabupaten/Kota Asal"}),e.jsx("p",{className:"text-gray-900 text-base",children:((Be=t.office)==null?void 0:Be.kabkota)||"Tidak tersedia"})]})]})})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Q,{className:"h-5 w-5"}),"Berkas Kabupaten/Kota",e.jsxs(w,{variant:"outline",className:"ml-2",children:[t.files.filter(a=>!a.file_category||a.file_category==="kabupaten").length," / ",W.length]}),b&&t.status==="submitted"&&e.jsx(w,{variant:K?"default":"destructive",className:`ml-2 ${K?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:K?"Semua Dokumen Sesuai":"Ada Dokumen Tidak Sesuai"})]})}),e.jsx(_,{children:t.files.filter(a=>!a.file_category||a.file_category==="kabupaten").length===0?e.jsxs("div",{className:"text-center py-8",children:[e.jsx(Q,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500",children:"Belum ada dokumen kabupaten yang diupload"}),Y&&t.status!=="draft"&&e.jsxs(l,{onClick:()=>S(`/pengajuan/${t.id}/edit`),className:"mt-4 bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ee,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]}),Y&&t.status==="draft"&&e.jsxs(l,{onClick:()=>window.open(`http://localhost:8080/pengajuan/${t.id}/upload`,"_blank"),className:"mt-4 bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ee,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]})]}):e.jsx("div",{className:"space-y-4",children:t.files.filter(a=>!a.file_category||a.file_category==="kabupaten").map(a=>e.jsx("div",{className:"p-6 border rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("h4",{className:"font-medium text-base",children:B(a.file_type)}),e.jsx("p",{className:"text-sm text-gray-600",children:a.file_name}),e.jsx("p",{className:"text-xs text-gray-500",children:Ae(a.file_size)}),e.jsxs("div",{className:"mt-3 space-y-2",children:[e.jsxs(w,{variant:a.verification_status==="approved"?"default":"destructive",className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"bg-green-100 text-green-800":a.verification_status==="rejected"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:[a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi",a.verified_by&&` - ${a.verified_by}`]}),a.verification_notes&&e.jsx("p",{className:"text-xs text-gray-600",children:a.verification_notes})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[(b||T)&&(t.status==="submitted"||t.status==="rejected")?e.jsx("div",{className:"flex items-center gap-3 mr-3",children:V===a.id?e.jsx(v,{className:"h-4 w-4 animate-spin text-gray-500"}):e.jsxs("div",{className:"flex items-center gap-3 transition-all duration-500 ease-in-out",children:[e.jsx("div",{className:"relative transform transition-all duration-500 ease-in-out hover:scale-105 active:scale-95",children:e.jsx(Je,{id:`verify-${a.id}`,checked:a.verification_status==="approved",onCheckedChange:s=>{const r=s?"approved":"rejected";Se(a.id,r)},disabled:V===a.id,className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600":"data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600"}`})}),e.jsx(Ue,{htmlFor:`verify-${a.id}`,className:`text-sm font-medium cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 ${a.verification_status==="approved"?"text-green-700":a.verification_status==="rejected"?"text-red-700":"text-gray-700"}`,children:a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi"})]})}):null,e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>De(a),className:"px-3 py-2",children:[e.jsx(Re,{className:"h-4 w-4 mr-2"}),"Preview"]}),e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>Pe(a),className:"px-3 py-2",children:[e.jsx(Ie,{className:"h-4 w-4 mr-2"}),"Download"]})]})]})},a.id))})})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Q,{className:"h-5 w-5"}),"Berkas Admin Wilayah",e.jsxs(w,{variant:"outline",className:"ml-2",children:[t.files.filter(a=>a.file_category==="admin_wilayah").length," / ",U.length]})]})}),e.jsx(_,{children:t.files.filter(a=>a.file_category==="admin_wilayah").length===0?e.jsxs("div",{className:"text-center py-8",children:[e.jsx(Q,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500",children:"Belum ada dokumen admin wilayah yang diupload"})]}):e.jsx("div",{className:"space-y-4",children:t.files.filter(a=>a.file_category==="admin_wilayah").map(a=>e.jsx("div",{className:"p-6 border rounded-lg",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex-1 space-y-2",children:[e.jsx("h4",{className:"font-medium text-base",children:B(a.file_type)}),e.jsx("p",{className:"text-sm text-gray-600",children:a.file_name}),e.jsx("p",{className:"text-xs text-gray-500",children:Ae(a.file_size)}),a.uploaded_by_name&&e.jsxs("div",{className:"text-xs text-gray-500",children:["Upload oleh: ",a.uploaded_by_name," (",a.uploaded_by_office||"Admin Wilayah",")"]}),e.jsxs("div",{className:"mt-3 space-y-2",children:[e.jsxs(w,{variant:a.verification_status==="approved"?"default":"destructive",className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"bg-green-100 text-green-800":a.verification_status==="rejected"?"bg-red-100 text-red-800":"bg-gray-100 text-gray-800"}`,children:[a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi",a.verified_by&&` - ${a.verified_by}`]}),a.verification_notes&&e.jsx("p",{className:"text-xs text-gray-600",children:a.verification_notes})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[b&&(t.status==="submitted"||t.status==="rejected"||t.status==="admin_wilayah_approved")||T&&(t.status==="submitted"||t.status==="approved"||t.status==="rejected")?e.jsx("div",{className:"flex items-center gap-3 mr-3",children:V===a.id?e.jsx(v,{className:"h-4 w-4 animate-spin text-gray-500"}):e.jsxs("div",{className:"flex items-center gap-3 transition-all duration-500 ease-in-out",children:[e.jsx("div",{className:"relative transform transition-all duration-500 ease-in-out hover:scale-105 active:scale-95",children:e.jsx(Je,{id:`verify-${a.id}`,checked:a.verification_status==="approved",onCheckedChange:s=>{const r=s?"approved":"rejected";Se(a.id,r)},disabled:V===a.id,className:`transition-all duration-500 ease-in-out transform ${a.verification_status==="approved"?"data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600":"data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600"}`})}),e.jsx(Ue,{htmlFor:`verify-${a.id}`,className:`text-sm font-medium cursor-pointer transition-all duration-500 ease-in-out transform hover:scale-105 ${a.verification_status==="approved"?"text-green-700":a.verification_status==="rejected"?"text-red-700":"text-gray-700"}`,children:a.verification_status==="approved"?"Sesuai":a.verification_status==="rejected"?"Tidak Sesuai":"Belum Diverifikasi"})]})}):null,e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>De(a),className:"px-3 py-2",children:[e.jsx(Re,{className:"h-4 w-4 mr-2"}),"Preview"]}),e.jsxs(l,{size:"sm",variant:"outline",onClick:()=>Pe(a),className:"px-3 py-2",children:[e.jsx(Ie,{className:"h-4 w-4 mr-2"}),"Download"]})]})]})},a.id))})})]})]}),e.jsxs("div",{className:`space-y-6 transition-all duration-300 ${we?"lg:sticky lg:top-6 lg:z-40 lg:self-start sidebar-scroll":""}`,style:we?{position:"sticky",top:"80px",zIndex:40,maxHeight:"calc(100vh - 120px)",overflowY:"scroll",paddingRight:"12px"}:{},children:[e.jsxs(N,{children:[e.jsx(C,{children:e.jsxs(F,{className:"flex items-center gap-2",children:[e.jsx(Sa,{className:"h-5 w-5"}),"Timeline Status"]})}),e.jsx(_,{className:"space-y-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Dibuat"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.created_at)})]})]}),t.status!=="draft"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-blue-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Diajukan"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)})]})]}),t.status==="approved"&&t.approved_at&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.approved_at)}),t.approved_by&&e.jsxs("p",{className:"text-xs text-gray-500",children:["oleh ",t.approved_by]})]})]}),t.status==="rejected"&&t.rejected_at&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.rejected_at)}),t.rejected_by&&e.jsxs("p",{className:"text-xs text-gray-500",children:["oleh ",t.rejected_by]})]})]}),t.status==="admin_wilayah_approved"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui Admin Wilayah"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah menyetujui pengajuan"})]})]}),t.status==="admin_wilayah_rejected"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak Admin Wilayah"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah menolak pengajuan"})]})]}),t.status==="submitted"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-blue-500 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Diajukan ke Superadmin"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Admin Wilayah mengajukan ke Superadmin untuk review final"})]})]}),t.status==="final_approved"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-green-600 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Disetujui Final"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Superadmin menyetujui final pengajuan"})]})]}),t.status==="final_rejected"&&e.jsxs("div",{className:"flex items-start gap-4",children:[e.jsx("div",{className:"w-2 h-2 bg-red-600 rounded-full mt-2"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"font-medium",children:"Ditolak Final"}),e.jsx("p",{className:"text-sm text-gray-600",children:y(t.updated_at)}),e.jsx("p",{className:"text-xs text-gray-500",children:"Superadmin menolak final pengajuan"})]})]})]})})]}),(t.catatan||t.rejection_reason)&&e.jsxs(N,{children:[e.jsx(C,{children:e.jsx(F,{children:"Catatan"})}),e.jsxs(_,{children:[t.catatan&&e.jsxs("div",{className:"mb-6",children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-3",children:"Catatan Persetujuan:"}),e.jsx("p",{className:"text-sm text-gray-900 bg-green-50 p-4 rounded-lg leading-relaxed",children:t.catatan})]}),t.rejection_reason&&e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-medium text-gray-700 mb-3",children:"Alasan Penolakan:"}),e.jsx("p",{className:"text-sm text-gray-900 bg-red-50 p-4 rounded-lg leading-relaxed",children:t.rejection_reason})]})]})]}),e.jsxs(N,{children:[e.jsx(C,{children:e.jsx(F,{children:"Aksi"})}),e.jsxs(_,{className:"space-y-3",children:[ja&&K&&e.jsxs(l,{onClick:()=>J(!0),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Setujui"]}),fa&&(Fe||!K)&&e.jsxs(l,{onClick:()=>O(!0),variant:"destructive",className:"w-full",children:[e.jsx(Le,{className:"h-4 w-4 mr-2"}),"Tolak"]}),ba&&e.jsx(l,{onClick:ca,disabled:o||!va,className:"w-full bg-yellow-600 hover:bg-yellow-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Aa,{className:"h-4 w-4 mr-2"}),"Ajukan Ulang"]})}),(t==null?void 0:t.status)==="draft"&&Y&&e.jsxs(l,{onClick:()=>window.open(`http://localhost:8080/pengajuan/${t.id}/upload`,"_blank"),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ee,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]}),(t==null?void 0:t.status)==="draft"&&Ce&&e.jsxs(l,{onClick:()=>A(!0),variant:"destructive",className:"w-full",children:[e.jsx(Me,{className:"h-4 w-4 mr-2"}),"Hapus Pengajuan"]}),Y&&t.status!=="draft"&&e.jsxs(l,{onClick:()=>S(`/pengajuan/${t.id}/edit`),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(ee,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]}),Ce&&e.jsxs(l,{onClick:()=>A(!0),variant:"destructive",className:"w-full",children:[e.jsx(Me,{className:"h-4 w-4 mr-2"}),"Hapus Pengajuan"]}),t.status==="approved"&&b&&e.jsxs(l,{onClick:()=>z(!0),className:"w-full bg-blue-600 hover:bg-blue-700 text-white",children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"Cetak Laporan"]}),b&&t.status==="admin_wilayah_approved"&&e.jsxs(e.Fragment,{children:[ya&&e.jsxs(l,{onClick:()=>q(!0),className:"w-full bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(le,{className:"h-4 w-4 mr-2"}),"Setujui Final"]}),ka&&e.jsxs(l,{onClick:()=>G(!0),variant:"destructive",className:"w-full",children:[e.jsx(Le,{className:"h-4 w-4 mr-2"}),"Tolak Final"]})]}),t.status==="final_approved"&&b&&e.jsxs(l,{onClick:ha,className:"w-full bg-blue-600 hover:bg-blue-700 text-white",children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"Cetak Laporan Final"]})]})]})]})]}),e.jsx(R,{open:Ge,onOpenChange:J,children:e.jsxs(I,{children:[e.jsx(L,{children:e.jsx(M,{children:"Setujui Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Catatan (Opsional)"}),e.jsx(se,{value:H,onChange:a=>ne(a.target.value),placeholder:"Masukkan catatan persetujuan...",rows:3,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>J(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:na,disabled:o,className:"flex-1 bg-green-600 hover:bg-green-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Setujui"})]})]})]})}),e.jsx(oe,{open:Ve,onOpenChange:A,children:e.jsxs(me,{children:[e.jsxs(ue,{children:[e.jsx(pe,{children:"Hapus Pengajuan"}),e.jsx(he,{children:"Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan dan semua file yang diupload akan dihapus secara permanen."})]}),e.jsxs(xe,{children:[e.jsx(We,{disabled:o,children:"Batal"}),e.jsx(ge,{onClick:oa,disabled:o,className:"bg-red-600 hover:bg-red-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Menghapus..."]}):"Hapus Pengajuan"})]})]})}),e.jsx(oe,{open:Ye,onOpenChange:z,children:e.jsxs(me,{children:[e.jsxs(ue,{children:[e.jsx(pe,{children:"Cetak Laporan"}),e.jsx(he,{children:"Apakah Anda yakin ingin mencetak laporan pengajuan ini? Laporan akan dibuka di tab baru untuk dicetak."})]}),e.jsxs(xe,{children:[e.jsx(We,{disabled:o,children:"Batal"}),e.jsx(ge,{onClick:pa,disabled:o,className:"bg-blue-600 hover:bg-blue-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Menyiapkan..."]}):e.jsxs(e.Fragment,{children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"Cetak Laporan"]})})]})]})}),e.jsx(R,{open:He,onOpenChange:O,children:e.jsxs(I,{children:[e.jsx(L,{children:e.jsx(M,{children:"Tolak Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Alasan Penolakan *"}),e.jsx(se,{value:$,onChange:a=>re(a.target.value),placeholder:"Masukkan alasan penolakan...",rows:3,required:!0,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>O(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:ra,disabled:o||!$.trim(),variant:"destructive",className:"flex-1",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Tolak"})]})]})]})}),e.jsx(R,{open:Ze,onOpenChange:q,children:e.jsxs(I,{children:[e.jsx(L,{children:e.jsx(M,{children:"Setujui Final Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Catatan (Opsional)"}),e.jsx(se,{value:aa,onChange:a=>ta(a.target.value),placeholder:"Masukkan catatan persetujuan final...",rows:3,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>q(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:la,disabled:o,className:"flex-1 bg-green-600 hover:bg-green-700 text-white",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Setujui Final"})]})]})]})}),e.jsx(R,{open:Qe,onOpenChange:G,children:e.jsxs(I,{children:[e.jsx(L,{children:e.jsx(M,{children:"Tolak Final Pengajuan"})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium text-gray-700",children:"Alasan Penolakan Final *"}),e.jsx(se,{value:Ne,onChange:a=>sa(a.target.value),placeholder:"Masukkan alasan penolakan final...",rows:3,required:!0,className:"min-h-[80px]"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx(l,{onClick:()=>G(!1),variant:"outline",className:"flex-1",disabled:o,children:"Batal"}),e.jsx(l,{onClick:da,disabled:o||!Ne.trim(),variant:"destructive",className:"flex-1",children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"h-4 w-4 mr-2 animate-spin"}),"Memproses..."]}):"Tolak Final"})]})]})]})}),e.jsx(R,{open:qe,onOpenChange:a=>{ke(a),!a&&(j!=null&&j.blobUrl)&&URL.revokeObjectURL(j.blobUrl)},children:e.jsxs(I,{className:"max-w-4xl",children:[e.jsx(L,{children:e.jsxs(M,{children:["Preview File: ",j==null?void 0:j.file_name]})}),e.jsx("div",{className:"mt-4",children:j&&e.jsxs("div",{className:"border rounded-lg overflow-hidden bg-white",children:[e.jsx("div",{className:"bg-green-600 text-white px-4 py-2 flex items-center justify-between",children:e.jsx("span",{className:"font-medium",children:j.file_name})}),e.jsx("iframe",{src:j.blobUrl||`/api/pengajuan/files/${j.id}`,className:"w-full h-96 border-0",title:"File Preview"})]})})]})}),e.jsx(oe,{open:Xe,onOpenChange:k,children:e.jsxs(me,{children:[e.jsxs(ue,{children:[e.jsxs(pe,{className:"flex items-center gap-2",children:[e.jsx(le,{className:"h-5 w-5 text-green-600"}),"Berhasil!"]}),e.jsx(he,{className:"text-green-700",children:ea})]}),e.jsx(xe,{children:e.jsx(ge,{onClick:()=>k(!1),className:"bg-green-600 hover:bg-green-700 text-white",children:"OK"})})]})})]}):e.jsx("div",{className:"container mx-auto p-6",children:e.jsx(N,{children:e.jsxs(_,{className:"flex items-center justify-center py-12",children:[e.jsx(Na,{className:"h-8 w-8 text-red-500 mr-2"}),e.jsx("span",{className:"text-red-600",children:"Pengajuan tidak ditemukan"})]})})})};export{Ua as default};
//# sourceMappingURL=PengajuanDetail-BJ1qs8Am.js.map
