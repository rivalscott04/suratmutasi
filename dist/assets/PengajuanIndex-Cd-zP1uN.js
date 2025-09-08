import{j as e,a0 as U,ao as se,V as Je,aO as le,aP as ne,aD as ie,_ as S,aE as C,aq as re,aM as de,k as ce,W as oe,ap as he,ad as me}from"./ui-vendor-DiY4nm-6.js";import{d as Ve,r as d,c as We}from"./react-vendor-C8WR5ETM.js";import{C as qe,a as Ye,b as Xe,c as Qe}from"./card-3AvYvHu0.js";import{u as Ze,a as xe,B as u,I as ea,b as R,q as ue,r as ge,s as je,v as g,m as aa}from"./index-Dlr9n9Fn.js";import{S as pe,a as be,b as fe,c as ve,d as j}from"./select-7qvpgjGe.js";import{T as ye,a as we,b as B,c as o,d as ke,e as h}from"./table-Ddq6p5ZU.js";import{A as ta,a as sa,b as la,c as na}from"./accordion-K2waJNtN.js";import{A as ia,a as ra,b as da,c as ca,d as oa,e as ha,g as ma,f as xa}from"./alert-dialog-rev1wtsJ.js";const wa=()=>{const x=Ve(),{user:n,token:z,isAuthenticated:_}=Ze(),[b,Ne]=d.useState([]),[De,J]=d.useState(!0),[V,P]=d.useState(null),[k,Se]=d.useState(""),[f,W]=d.useState("all"),[$,Ce]=d.useState("all"),[r,p]=d.useState(1),[y,_e]=d.useState(1),[T,Pe]=d.useState(0),[$e,A]=d.useState(!1),[q,E]=d.useState(null),[K,Y]=d.useState(!1),[L,Te]=d.useState({users:[]}),[O,X]=d.useState({}),N=10,i=(n==null?void 0:n.role)==="admin",w=(n==null?void 0:n.role)==="user",I=i||w,F=We.useMemo(()=>I?Object.keys(O).length>0?O:!b||b.length===0?{}:b.reduce((a,s)=>{var l;const t=s.office&&(s.office.kabkota||s.office.name)||s.pegawai&&s.pegawai.induk_unit||((l=s.pegawai)==null?void 0:l.unit_kerja)||"Lainnya";return a[t]||(a[t]=[]),a[t].push(s),a},{}):{},[I,O,b]);d.useEffect(()=>{if(!_){x("/");return}w&&f!=="final_approved"&&W("final_approved"),Q()},[_,x,r,f,$,w]),d.useEffect(()=>{_&&i&&Ae()},[_,i]);const Q=async()=>{var a,s;try{J(!0);const t=new URLSearchParams({page:r.toString(),limit:N.toString(),...f!=="all"&&{status:f},...k&&{search:k},...i&&$!=="all"&&{created_by:$}}),l=await xe(`/api/pengajuan?${t}`,z);if(l.success){if(Ne(l.data.data||l.data),i){const c=l.data&&l.data.grouped_by_kabkota||l.grouped_by_kabkota;X(c||{})}_e(((a=l.data.pagination)==null?void 0:a.totalPages)||1),Pe(((s=l.data.pagination)==null?void 0:s.total)||0)}else P(l.message||"Gagal mengambil data pengajuan")}catch(t){console.error("Error fetching pengajuan data:",t),P("Terjadi kesalahan saat mengambil data pengajuan")}finally{J(!1)}},Ae=async()=>{try{const a=await xe("/api/pengajuan/filter-options",z);a.success&&(console.log("🔍 Debug fetchFilterOptions - Response:",a.data),Te(a.data))}catch(a){console.error("Error fetching filter options:",a)}},Fe=a=>{Se(a),p(1)},Me=a=>{w||(W(a),p(1))},Ue=a=>{Ce(a),p(1)},Re=async()=>{if(q)try{Y(!0);const a=await aa(`/api/pengajuan/${q}`,z);a.success?(Q(),A(!1),E(null)):P(a.message||"Gagal menghapus pengajuan")}catch(a){console.error("Error deleting pengajuan:",a),P("Terjadi kesalahan saat menghapus pengajuan")}finally{Y(!1)}},Z=a=>{const t={draft:{label:"Draft",className:"bg-gray-100 text-gray-800 hover:bg-gray-200",icon:me},submitted:{label:"Diajukan",className:"bg-blue-100 text-blue-800 hover:bg-blue-200",icon:U},approved:{label:"Disetujui",className:"bg-green-100 text-green-800 hover:bg-green-200",icon:S},rejected:{label:"Ditolak",className:"bg-red-100 text-red-800 hover:bg-red-200",icon:C},resubmitted:{label:"Diajukan Ulang",className:"bg-yellow-100 text-yellow-800 hover:bg-yellow-200",icon:me},admin_wilayah_approved:{label:"Disetujui Admin Wilayah",className:"bg-green-200 text-green-800 hover:bg-green-300",icon:S},admin_wilayah_rejected:{label:"Ditolak Admin Wilayah",className:"bg-red-200 text-red-800 hover:bg-red-300",icon:C},final_approved:{label:"Final Approved",className:"bg-green-600 text-white",icon:S},final_rejected:{label:"Final Rejected",className:"bg-red-600 text-white",icon:C}}[a]||{label:a,className:"bg-gray-100 text-gray-800",icon:U},l=t.icon;return e.jsxs(R,{className:t.className,children:[e.jsx(l,{className:"h-3 w-3 mr-1"}),t.label]})},ee=a=>({guru:"Guru",eselon_iv:"Eselon IV",fungsional:"Fungsional",pelaksana:"Pelaksana"})[a]||a,ae=a=>new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),te=()=>{const a=Object.keys(F).length>0?F:b.reduce((s,t)=>{var c;const l=t.office&&(t.office.kabkota||t.office.name)||t.pegawai&&t.pegawai.induk_unit||((c=t.pegawai)==null?void 0:c.unit_kerja)||"Lainnya";return s[l]||(s[l]=[]),s[l].push(t),s},{});return Object.entries(a).map(([s,t])=>({kabkota:s,total:t.length}))},Be=(a,s)=>{const t=URL.createObjectURL(a),l=document.createElement("a");l.href=t,l.download=s,document.body.appendChild(l),l.click(),l.remove(),URL.revokeObjectURL(t)},ze=()=>{const a=te(),s=new Date,l=`Rekap-final_approved-per-kabkota-${`${s.getFullYear()}${String(s.getMonth()+1).padStart(2,"0")}${String(s.getDate()).padStart(2,"0")}`}.xls`,c=`
      <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Kab/Kota</th><th>Jumlah Pengajuan Final Approved</th></tr>
          </thead>
          <tbody>
            ${a.map(H=>`<tr><td>${H.kabkota}</td><td>${H.total}</td></tr>`).join("")}
          </tbody>
        </table>
      </body>
      </html>`,D=new Blob([c],{type:"application/vnd.ms-excel"});Be(D,l)},Ee=()=>{const a=te().sort((m,v)=>v.total-m.total),s=a.reduce((m,v)=>m+v.total,0),t=Math.max(1,...a.map(m=>m.total)),l=a.length,c=new Date,D=c.toLocaleString("id-ID",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}),Ke=`Rekap-disetujui-kanwil-per-kabkota-${`${c.getFullYear()}${String(c.getMonth()+1).padStart(2,"0")}${String(c.getDate()).padStart(2,"0")}`}.pdf`,Le=(n==null?void 0:n.full_name)||(n==null?void 0:n.email)||"Admin Pusat",Oe=a.slice(0,5),G=window.open("","_blank");G&&(G.document.write(`
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${Ke}</title>
          <style>
            @page { size: A4; margin: 18mm 14mm; }
            * { box-sizing: border-box; }
            body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111827; }
            .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
            .title { font-size: 18px; font-weight: 700; }
            .meta { font-size: 12px; color: #4b5563; }
            .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 12px 0 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; }
            .card h3 { font-size: 12px; color: #6b7280; margin: 0 0 4px; font-weight: 600; }
            .card .value { font-size: 20px; font-weight: 700; color: #111827; }
            table { border-collapse: collapse; width: 100%; margin-top: 4px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; }
            th { background: #f9fafb; text-align: left; }
            tfoot td { font-weight: 700; background: #f3f4f6; }
            .row { display: flex; align-items: center; gap: 10px; }
            .bar { height: 8px; background: #d1fae5; border-radius: 4px; overflow: hidden; }
            .bar > span { display: block; height: 100%; background: #10b981; }
            .note { margin-top: 12px; font-size: 11px; color: #6b7280; }
            .section-title { margin-top: 16px; font-size: 14px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Rekap Pengajuan Telah Disetujui Kanwil per Kab/Kota</div>
              <div class="meta">Dihasilkan: ${D} • Dibuat oleh: ${Le}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <h3>Total Telah Disetujui Kanwil</h3>
              <div class="value">${s}</div>
            </div>
            <div class="card">
              <h3>Jumlah Kab/Kota</h3>
              <div class="value">${l}</div>
            </div>
            <div class="card">
              <h3>Top Kab/Kota</h3>
              <div style="font-size:12px; color:#111827; line-height:1.4;">
                ${Oe.map((m,v)=>`${v+1}. ${m.kabkota} (${m.total})`).join("<br/>")||"-"}
              </div>
            </div>
          </div>

          <div class="section-title">Tabel Rekap</div>
          <table>
            <thead>
              <tr>
                <th style="width:36px;">No</th>
                <th>Kab/Kota</th>
                <th style="width:110px;">Jumlah</th>
                <th style="width:80px;">Persen</th>
                <th>Visual</th>
              </tr>
            </thead>
            <tbody>
              ${a.map((m,v)=>{const Ie=s>0?Math.round(m.total/s*1e3)/10:0,He=Math.round(m.total/t*100),M=140,Ge=Math.max(1,Math.round(He/100*M));return`
                  <tr>
                    <td>${v+1}</td>
                    <td>${m.kabkota}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${m.total}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${Ie.toFixed(1)}%</td>
                    <td>
                      <svg width="${M}" height="10" viewBox="0 0 ${M} 10" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="${M}" height="10" fill="#E5F6F1" stroke="#D1D5DB" />
                        <rect x="0" y="0" width="${Ge}" height="10" fill="#10B981" />
                      </svg>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total</td>
                <td style="text-align:right; font-variant-numeric: tabular-nums;">${s}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="note">Catatan: Laporan ini menampilkan pengajuan yang <strong>telah disetujui Kanwil</strong>.</div>

          <script>
            window.onload = function() { window.print(); };
          <\/script>
        </body>
      </html>
    `),G.document.close())};return console.log("🔍 Debug PengajuanIndex:",{userRole:n==null?void 0:n.role,isAdmin:i,userEmail:n==null?void 0:n.email}),e.jsxs("div",{className:"container mx-auto p-6",children:[e.jsxs(qe,{children:[e.jsx(Ye,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs(Xe,{className:"flex items-center gap-2",children:[e.jsx(U,{className:"h-5 w-5"}),"Daftar Pengajuan Mutasi PNS"]}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:i?"Semua pengajuan mutasi PNS":w?"Semua pengajuan berstatus final_approved (read-only)":"Pengajuan mutasi PNS Anda"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[w&&e.jsxs(e.Fragment,{children:[e.jsx(u,{onClick:ze,className:"bg-green-600 hover:bg-green-700 text-white",children:"Export Excel"}),e.jsx(u,{onClick:Ee,className:"bg-blue-600 hover:bg-blue-700 text-white",children:"Export PDF"})]}),(n==null?void 0:n.role)!=="user"&&e.jsxs(u,{onClick:()=>x("/pengajuan/select"),className:"bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(se,{className:"h-4 w-4 mr-2"}),"Tambah Pengajuan"]})]})]})}),e.jsxs(Qe,{children:[V&&e.jsx("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",children:e.jsx("p",{className:"text-red-600",children:V})}),e.jsxs("div",{className:"flex flex-col gap-4 mb-6",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(Je,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx(ea,{placeholder:"Cari berdasarkan nama pegawai, jabatan, atau jenis jabatan...",value:k,onChange:a=>Fe(a.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(le,{className:"h-4 w-4 text-gray-400"}),e.jsxs(pe,{value:f,onValueChange:Me,children:[e.jsx(be,{className:"w-48",children:e.jsx(fe,{placeholder:"Filter Status"})}),e.jsxs(ve,{children:[e.jsx(j,{value:"all",children:"Semua Status"}),e.jsx(j,{value:"draft",children:"Draft"}),e.jsx(j,{value:"submitted",children:"Diajukan"}),e.jsx(j,{value:"approved",children:"Disetujui"}),e.jsx(j,{value:"rejected",children:"Ditolak"}),e.jsx(j,{value:"resubmitted",children:"Diajukan Ulang"}),e.jsx(j,{value:"admin_wilayah_approved",children:"Disetujui Admin Wilayah"}),e.jsx(j,{value:"admin_wilayah_rejected",children:"Ditolak Admin Wilayah"})]})]})]}),i&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(le,{className:"h-4 w-4 text-gray-400"}),e.jsxs(pe,{value:$,onValueChange:Ue,children:[e.jsx(be,{className:"w-48",children:e.jsx(fe,{placeholder:"Filter Pembuat"})}),e.jsxs(ve,{children:[e.jsx(j,{value:"all",children:"Semua Pembuat"}),L.users.map(a=>e.jsx(j,{value:a.id,children:a.full_name||a.email||"Unknown User"},a.id))]})]})]})]})]}),I&&Object.keys(F).length>0?e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"text-sm text-gray-600",children:"Tergabung berdasarkan kabupaten/kota"}),e.jsx(ta,{type:"multiple",className:"w-full",children:Object.entries(F).map(([a,s])=>e.jsxs(sa,{value:a,className:"border rounded-lg",children:[e.jsx(la,{className:"px-4 py-3 hover:no-underline",children:e.jsxs("div",{className:"flex items-center justify-between w-full",children:[e.jsx("div",{className:"font-medium",children:a}),e.jsx(R,{variant:"secondary",className:"ml-2",children:s.length})]})}),e.jsx(na,{className:"px-0",children:e.jsx("div",{className:"border-t",children:e.jsxs(ye,{children:[e.jsx(we,{children:e.jsxs(B,{children:[e.jsx(o,{children:"Pegawai"}),e.jsx(o,{children:"Jenis Jabatan"}),e.jsx(o,{children:"Status"}),e.jsx(o,{children:"Dokumen"}),i&&e.jsx(o,{children:"Pembuat"}),e.jsx(o,{children:"Tanggal Dibuat"}),e.jsx(o,{className:"text-right",children:"Aksi"})]})}),e.jsx(ke,{children:s.map(t=>e.jsxs(B,{className:"hover:bg-gray-50",children:[e.jsx(h,{children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:t.pegawai.nama}),e.jsx("div",{className:"text-sm text-gray-500",children:t.pegawai.jabatan})]})}),e.jsx(h,{children:e.jsx(R,{variant:"outline",children:ee(t.jenis_jabatan)})}),e.jsx(h,{children:Z(t.status)}),e.jsx(h,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm",children:t.files.length}),e.jsx("span",{className:"text-gray-500",children:"/"}),e.jsx("span",{className:"text-sm",children:t.total_dokumen})]})}),i&&e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:(()=>{var c;const l=L.users.find(D=>D.id===t.created_by);return l?l.full_name||l.email||"Unknown User":(c=t.created_by)!=null&&c.includes("@")?t.created_by:"Unknown User"})()})}),e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:ae(t.created_at)})}),e.jsx(h,{className:"text-right",children:e.jsxs(ue,{children:[e.jsx(ge,{asChild:!0,children:e.jsx(u,{variant:"ghost",size:"sm",children:e.jsx(ne,{className:"h-4 w-4"})})}),e.jsxs(je,{align:"end",children:[e.jsxs(g,{onClick:()=>x(`/pengajuan/${t.id}`),children:[e.jsx(ie,{className:"h-4 w-4 mr-2"}),"Lihat Detail"]}),i&&t.status==="submitted"&&e.jsxs(e.Fragment,{children:[e.jsxs(g,{onClick:()=>x(`/pengajuan/${t.id}`),children:[e.jsx(S,{className:"h-4 w-4 mr-2"}),"Setujui"]}),e.jsxs(g,{onClick:()=>x(`/pengajuan/${t.id}`),children:[e.jsx(C,{className:"h-4 w-4 mr-2"}),"Tolak"]})]}),i&&e.jsxs(g,{onClick:()=>{E(t.id),A(!0)},className:"text-red-600",children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Hapus"]})]})]})})]},t.id))})]})})})]},a))}),y>1&&e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50",children:[e.jsxs("div",{className:"text-sm text-gray-700",children:["Menampilkan ",(r-1)*N+1," sampai ",Math.min(r*N,T)," dari ",T," pengajuan"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(u,{variant:"outline",size:"sm",onClick:()=>p(r-1),disabled:r===1,children:[e.jsx(de,{className:"h-4 w-4"}),"Sebelumnya"]}),e.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:y},(a,s)=>s+1).map(a=>e.jsx(u,{variant:r===a?"default":"outline",size:"sm",onClick:()=>p(a),className:"w-8 h-8 p-0",children:a},a))}),e.jsxs(u,{variant:"outline",size:"sm",onClick:()=>p(r+1),disabled:r===y,children:["Selanjutnya",e.jsx(ce,{className:"h-4 w-4"})]})]})]})]}):e.jsx("div",{className:"border rounded-lg overflow-hidden",children:De?e.jsxs("div",{className:"flex items-center justify-center py-12",children:[e.jsx(oe,{className:"h-8 w-8 animate-spin mr-2"}),e.jsx("span",{children:"Memuat data pengajuan..."})]}):b.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(U,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500 mb-2",children:k||f!=="all"?"Tidak ada pengajuan yang sesuai dengan filter":"Belum ada pengajuan"}),!k&&f==="all"&&(n==null?void 0:n.role)!=="user"&&e.jsxs(u,{onClick:()=>x("/pengajuan/select"),className:"bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(se,{className:"h-4 w-4 mr-2"}),"Buat Pengajuan Pertama"]})]}):e.jsxs(e.Fragment,{children:[e.jsxs(ye,{children:[e.jsx(we,{children:e.jsxs(B,{children:[e.jsx(o,{children:"Pegawai"}),e.jsx(o,{children:"Jenis Jabatan"}),e.jsx(o,{children:"Status"}),e.jsx(o,{children:"Dokumen"}),i&&e.jsx(o,{children:"Pembuat"}),e.jsx(o,{children:"Tanggal Dibuat"}),e.jsx(o,{className:"text-right",children:"Aksi"})]})}),e.jsx(ke,{children:b.map(a=>e.jsxs(B,{className:"hover:bg-gray-50",children:[e.jsx(h,{children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:a.pegawai.nama}),e.jsx("div",{className:"text-sm text-gray-500",children:a.pegawai.jabatan})]})}),e.jsx(h,{children:e.jsx(R,{variant:"outline",children:ee(a.jenis_jabatan)})}),e.jsx(h,{children:Z(a.status)}),e.jsx(h,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm",children:a.files.length}),e.jsx("span",{className:"text-gray-500",children:"/"}),e.jsx("span",{className:"text-sm",children:a.total_dokumen})]})}),i&&e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:(()=>{var t;const s=L.users.find(l=>l.id===a.created_by);return s?s.full_name||s.email||"Unknown User":(t=a.created_by)!=null&&t.includes("@")?a.created_by:"Unknown User"})()})}),e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:ae(a.created_at)})}),e.jsx(h,{className:"text-right",children:e.jsxs(ue,{children:[e.jsx(ge,{asChild:!0,children:e.jsx(u,{variant:"ghost",size:"sm",children:e.jsx(ne,{className:"h-4 w-4"})})}),e.jsxs(je,{align:"end",children:[e.jsxs(g,{onClick:()=>x(`/pengajuan/${a.id}`),children:[e.jsx(ie,{className:"h-4 w-4 mr-2"}),"Lihat Detail"]}),(n==null?void 0:n.role)!=="user"&&e.jsxs(e.Fragment,{children:[a.status==="draft"&&e.jsxs(g,{onClick:()=>x(`/pengajuan/${a.id}/upload`),children:[e.jsx(he,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]}),a.status==="rejected"&&e.jsxs(g,{onClick:()=>x(`/pengajuan/${a.id}/edit`),children:[e.jsx(he,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]})]}),i&&a.status==="submitted"&&e.jsxs(e.Fragment,{children:[e.jsxs(g,{onClick:()=>x(`/pengajuan/${a.id}`),children:[e.jsx(S,{className:"h-4 w-4 mr-2"}),"Setujui"]}),e.jsxs(g,{onClick:()=>x(`/pengajuan/${a.id}`),children:[e.jsx(C,{className:"h-4 w-4 mr-2"}),"Tolak"]})]}),(i||a.status==="draft"&&(n==null?void 0:n.role)!=="user")&&e.jsxs(g,{onClick:()=>{console.log("🔍 Debug: Klik hapus untuk pengajuan:",{id:a.id,status:a.status,isAdmin:i,userRole:n==null?void 0:n.role}),E(a.id),A(!0)},className:"text-red-600",children:[e.jsx(re,{className:"h-4 w-4 mr-2"}),"Hapus"]})]})]})})]},a.id))})]}),y>1&&e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border-t bg-gray-50",children:[e.jsxs("div",{className:"text-sm text-gray-700",children:["Menampilkan ",(r-1)*N+1," sampai ",Math.min(r*N,T)," dari ",T," pengajuan"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(u,{variant:"outline",size:"sm",onClick:()=>p(r-1),disabled:r===1,children:[e.jsx(de,{className:"h-4 w-4"}),"Sebelumnya"]}),e.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:y},(a,s)=>s+1).map(a=>e.jsx(u,{variant:r===a?"default":"outline",size:"sm",onClick:()=>p(a),className:"w-8 h-8 p-0",children:a},a))}),e.jsxs(u,{variant:"outline",size:"sm",onClick:()=>p(r+1),disabled:r===y,children:["Selanjutnya",e.jsx(ce,{className:"h-4 w-4"})]})]})]})]})})]})]}),e.jsx(ia,{open:$e,onOpenChange:A,children:e.jsxs(ra,{children:[e.jsxs(da,{children:[e.jsx(ca,{children:"Hapus Pengajuan"}),e.jsx(oa,{children:"Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan."})]}),e.jsxs(ha,{children:[e.jsx(ma,{disabled:K,children:"Batal"}),e.jsx(xa,{onClick:Re,disabled:K,className:"bg-red-600 hover:bg-red-700",children:K?e.jsxs(e.Fragment,{children:[e.jsx(oe,{className:"h-4 w-4 mr-2 animate-spin"}),"Menghapus..."]}):"Hapus"})]})]})})]})};export{wa as default};
//# sourceMappingURL=PengajuanIndex-Cd-zP1uN.js.map
