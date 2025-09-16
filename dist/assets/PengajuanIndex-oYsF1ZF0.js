import{j as e,a0 as B,ao as de,V as Ve,aO as ce,aP as oe,aD as he,_ as P,aE as T,aq as me,aM as V,k as G,W as xe,ap as ue,ad as ge}from"./ui-vendor-BCnv6AUJ.js";import{d as Ge,r as c,c as We}from"./react-vendor-C8WR5ETM.js";import{C as qe,a as Ye,b as Xe,c as Qe}from"./card-C46WI_aE.js";import{u as Ze,a as je,B as o,I as ea,b as R,q as pe,r as be,s as fe,v as j,m as aa}from"./index-BWtU3-2g.js";import{S as ve,a as ye,b as we,c as ke,d as p}from"./select-Da2R1wjy.js";import{T as W,a as q,b as C,c as r,d as Y,e as h}from"./table-Bsi1cF0t.js";import{A as sa,a as ta,b as la,c as na}from"./accordion-B1s10pmr.js";import{A as ia,a as ra,b as da,c as ca,d as oa,e as ha,g as ma,f as xa}from"./alert-dialog-CZ2YZt1S.js";const wa=()=>{const u=Ge(),{user:l,token:E,isAuthenticated:$}=Ze(),[b,Ne]=c.useState([]),[De,X]=c.useState(!0),[Q,A]=c.useState(null),[_,Se]=c.useState(""),[v,Z]=c.useState("all"),[F,Ce]=c.useState("all"),[i,g]=c.useState(1),[y,_e]=c.useState(1),[f,Pe]=c.useState(0),[Te,M]=c.useState(!1),[ee,K]=c.useState(null),[L,ae]=c.useState(!1),[I,$e]=c.useState({users:[]}),[O,se]=c.useState({}),w=10,d=(l==null?void 0:l.role)==="admin",D=(l==null?void 0:l.role)==="user",H=d||D,z=We.useMemo(()=>H?Object.keys(O).length>0?O:!b||b.length===0?{}:b.reduce((a,t)=>{var n;const s=t.office&&(t.office.kabkota||t.office.name)||t.pegawai&&t.pegawai.induk_unit||((n=t.pegawai)==null?void 0:n.unit_kerja)||"Lainnya";return a[s]||(a[s]=[]),a[s].push(t),a},{}):{},[H,O,b]);c.useEffect(()=>{if(!$){u("/");return}D&&v!=="final_approved"&&Z("final_approved"),te()},[$,u,i,v,F,D]),c.useEffect(()=>{$&&d&&Ae()},[$,d]);const te=async()=>{var a,t;try{X(!0);const s=new URLSearchParams({page:i.toString(),limit:w.toString(),...v!=="all"&&{status:v},..._&&{search:_},...d&&F!=="all"&&{created_by:F}}),n=await je(`/api/pengajuan?${s}`,E);if(n.success){if(Ne(n.data),d){const S=n.grouped_by_kabkota;se(S||{})}const m=((a=n.pagination)==null?void 0:a.totalPages)||1,k=((t=n.pagination)==null?void 0:t.total)||0;_e(m),Pe(k)}else A(n.message||"Gagal mengambil data pengajuan")}catch(s){console.error("Error fetching pengajuan data:",s),A("Terjadi kesalahan saat mengambil data pengajuan")}finally{X(!1)}},Ae=async()=>{try{const a=await je("/api/pengajuan/filter-options",E);a.success&&$e(a.data)}catch(a){console.error("Error fetching filter options:",a)}},Fe=a=>{Se(a),g(1)},Me=a=>{D||(Z(a),g(1))},ze=a=>{Ce(a),g(1)},Ue=async()=>{if(ee)try{ae(!0);const a=await aa(`/api/pengajuan/${ee}`,E);a.success?(te(),M(!1),K(null)):A(a.message||"Gagal menghapus pengajuan")}catch(a){console.error("Error deleting pengajuan:",a),A("Terjadi kesalahan saat menghapus pengajuan")}finally{ae(!1)}},le=a=>{const s={draft:{label:"Draft",className:"bg-gray-100 text-gray-800 hover:bg-gray-200",icon:ge},submitted:{label:"Diajukan",className:"bg-blue-100 text-blue-800 hover:bg-blue-200",icon:B},approved:{label:"Disetujui",className:"bg-green-100 text-green-800 hover:bg-green-200",icon:P},rejected:{label:"Ditolak",className:"bg-red-100 text-red-800 hover:bg-red-200",icon:T},resubmitted:{label:"Diajukan Ulang",className:"bg-yellow-100 text-yellow-800 hover:bg-yellow-200",icon:ge},admin_wilayah_approved:{label:"Disetujui Admin Wilayah",className:"bg-green-200 text-green-800 hover:bg-green-300",icon:P},admin_wilayah_rejected:{label:"Ditolak Admin Wilayah",className:"bg-red-200 text-red-800 hover:bg-red-300",icon:T},final_approved:{label:"Final Approved",className:"bg-green-600 text-white",icon:P},final_rejected:{label:"Final Rejected",className:"bg-red-600 text-white",icon:T}}[a]||{label:a,className:"bg-gray-100 text-gray-800",icon:B},n=s.icon;return e.jsxs(R,{className:s.className,children:[e.jsx(n,{className:"h-3 w-3 mr-1"}),s.label]})},ne=a=>({guru:"Guru",eselon_iv:"Eselon IV",fungsional:"Fungsional",pelaksana:"Pelaksana"})[a]||a,ie=a=>new Date(a).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}),re=()=>{const a=Object.keys(z).length>0?z:b.reduce((t,s)=>{var m;const n=s.office&&(s.office.kabkota||s.office.name)||s.pegawai&&s.pegawai.induk_unit||((m=s.pegawai)==null?void 0:m.unit_kerja)||"Lainnya";return t[n]||(t[n]=[]),t[n].push(s),t},{});return Object.entries(a).map(([t,s])=>({kabkota:t,total:s.length}))},Be=(a,t)=>{const s=URL.createObjectURL(a),n=document.createElement("a");n.href=s,n.download=t,document.body.appendChild(n),n.click(),n.remove(),URL.revokeObjectURL(s)},Re=()=>{const a=re(),t=new Date,n=`Rekap-final_approved-per-kabkota-${`${t.getFullYear()}${String(t.getMonth()+1).padStart(2,"0")}${String(t.getDate()).padStart(2,"0")}`}.xls`,m=`
      <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead>
            <tr><th>Kab/Kota</th><th>Jumlah Pengajuan Final Approved</th></tr>
          </thead>
          <tbody>
            ${a.map(S=>`<tr><td>${S.kabkota}</td><td>${S.total}</td></tr>`).join("")}
          </tbody>
        </table>
      </body>
      </html>`,k=new Blob([m],{type:"application/vnd.ms-excel"});Be(k,n)},Ee=()=>{const a=re().sort((x,N)=>N.total-x.total),t=a.reduce((x,N)=>x+N.total,0),s=Math.max(1,...a.map(x=>x.total)),n=a.length,m=new Date,k=m.toLocaleString("id-ID",{day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"}),Ke=`Rekap-disetujui-kanwil-per-kabkota-${`${m.getFullYear()}${String(m.getMonth()+1).padStart(2,"0")}${String(m.getDate()).padStart(2,"0")}`}.pdf`,Le=(l==null?void 0:l.full_name)||(l==null?void 0:l.email)||"Admin Pusat",Ie=a.slice(0,5),J=window.open("","_blank");J&&(J.document.write(`
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
              <div class="meta">Dihasilkan: ${k} • Dibuat oleh: ${Le}</div>
            </div>
          </div>

          <div class="summary">
            <div class="card">
              <h3>Total Telah Disetujui Kanwil</h3>
              <div class="value">${t}</div>
            </div>
            <div class="card">
              <h3>Jumlah Kab/Kota</h3>
              <div class="value">${n}</div>
            </div>
            <div class="card">
              <h3>Top Kab/Kota</h3>
              <div style="font-size:12px; color:#111827; line-height:1.4;">
                ${Ie.map((x,N)=>`${N+1}. ${x.kabkota} (${x.total})`).join("<br/>")||"-"}
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
              ${a.map((x,N)=>{const Oe=t>0?Math.round(x.total/t*1e3)/10:0,He=Math.round(x.total/s*100),U=140,Je=Math.max(1,Math.round(He/100*U));return`
                  <tr>
                    <td>${N+1}</td>
                    <td>${x.kabkota}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${x.total}</td>
                    <td style="text-align:right; font-variant-numeric: tabular-nums;">${Oe.toFixed(1)}%</td>
                    <td>
                      <svg width="${U}" height="10" viewBox="0 0 ${U} 10" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="${U}" height="10" fill="#E5F6F1" stroke="#D1D5DB" />
                        <rect x="0" y="0" width="${Je}" height="10" fill="#10B981" />
                      </svg>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">Total</td>
                <td style="text-align:right; font-variant-numeric: tabular-nums;">${t}</td>
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
    `),J.document.close())};return console.log("🔍 Debug PengajuanIndex:",{userRole:l==null?void 0:l.role,isAdmin:d,userEmail:l==null?void 0:l.email}),e.jsxs("div",{className:"container mx-auto p-6",children:[e.jsxs(qe,{children:[e.jsx(Ye,{children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs(Xe,{className:"flex items-center gap-2",children:[e.jsx(B,{className:"h-5 w-5"}),"Daftar Pengajuan Mutasi PNS"]}),e.jsx("p",{className:"text-sm text-gray-600 mt-1",children:d?"Semua pengajuan mutasi PNS":D?"Semua pengajuan berstatus final_approved (read-only)":"Pengajuan mutasi PNS Anda"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[D&&e.jsxs(e.Fragment,{children:[e.jsx(o,{onClick:Re,className:"bg-green-600 hover:bg-green-700 text-white",children:"Export Excel"}),e.jsx(o,{onClick:Ee,className:"bg-blue-600 hover:bg-blue-700 text-white",children:"Export PDF"})]}),(l==null?void 0:l.role)!=="user"&&e.jsxs(o,{onClick:()=>u("/pengajuan/select"),className:"bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"Tambah Pengajuan"]})]})]})}),e.jsxs(Qe,{children:[Q&&e.jsx("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",children:e.jsx("p",{className:"text-red-600",children:Q})}),e.jsxs("div",{className:"flex flex-col gap-4 mb-6",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(Ve,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx(ea,{placeholder:"Cari berdasarkan nama pegawai, jabatan, atau jenis jabatan...",value:_,onChange:a=>Fe(a.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ce,{className:"h-4 w-4 text-gray-400"}),e.jsxs(ve,{value:v,onValueChange:Me,children:[e.jsx(ye,{className:"w-48",children:e.jsx(we,{placeholder:"Filter Status"})}),e.jsxs(ke,{children:[e.jsx(p,{value:"all",children:"Semua Status"}),e.jsx(p,{value:"draft",children:"Draft"}),e.jsx(p,{value:"submitted",children:"Diajukan"}),e.jsx(p,{value:"approved",children:"Disetujui"}),e.jsx(p,{value:"rejected",children:"Ditolak"}),e.jsx(p,{value:"resubmitted",children:"Diajukan Ulang"}),e.jsx(p,{value:"admin_wilayah_approved",children:"Disetujui Admin Wilayah"}),e.jsx(p,{value:"admin_wilayah_rejected",children:"Ditolak Admin Wilayah"})]})]})]}),d&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(ce,{className:"h-4 w-4 text-gray-400"}),e.jsxs(ve,{value:F,onValueChange:ze,children:[e.jsx(ye,{className:"w-48",children:e.jsx(we,{placeholder:"Filter Pembuat"})}),e.jsxs(ke,{children:[e.jsx(p,{value:"all",children:"Semua Pembuat"}),I.users.map(a=>e.jsx(p,{value:a.id,children:a.full_name||a.email||"Unknown User"},a.id))]})]})]})]})]}),H&&Object.keys(z).length>0?e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"text-sm text-gray-600",children:"Tergabung berdasarkan kabupaten/kota"}),e.jsx(sa,{type:"multiple",className:"w-full",children:Object.entries(z).map(([a,t])=>e.jsxs(ta,{value:a,className:"border rounded-lg",children:[e.jsx(la,{className:"px-4 py-3 hover:no-underline",children:e.jsxs("div",{className:"flex items-center justify-between w-full",children:[e.jsx("div",{className:"font-medium",children:a}),e.jsx(R,{variant:"secondary",className:"ml-2",children:t.length})]})}),e.jsx(na,{className:"px-0",children:e.jsx("div",{className:"border-t",children:e.jsxs(W,{children:[e.jsx(q,{children:e.jsxs(C,{children:[e.jsx(r,{children:"Pegawai"}),e.jsx(r,{children:"Jenis Jabatan"}),e.jsx(r,{children:"Status"}),e.jsx(r,{children:"Dokumen"}),d&&e.jsx(r,{children:"Pembuat"}),e.jsx(r,{children:"Tanggal Dibuat"}),e.jsx(r,{className:"text-right",children:"Aksi"})]})}),e.jsx(Y,{children:t.map(s=>e.jsxs(C,{className:"hover:bg-gray-50",children:[e.jsx(h,{children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:s.pegawai.nama}),e.jsx("div",{className:"text-sm text-gray-500",children:s.pegawai.jabatan})]})}),e.jsx(h,{children:e.jsx(R,{variant:"outline",children:ne(s.jenis_jabatan)})}),e.jsx(h,{children:le(s.status)}),e.jsx(h,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm",children:s.files.length}),e.jsx("span",{className:"text-gray-500",children:"/"}),e.jsx("span",{className:"text-sm",children:s.total_dokumen})]})}),d&&e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:(()=>{var m;const n=I.users.find(k=>k.id===s.created_by);return n?n.full_name||n.email||"Unknown User":(m=s.created_by)!=null&&m.includes("@")?s.created_by:"Unknown User"})()})}),e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:ie(s.created_at)})}),e.jsx(h,{className:"text-right",children:e.jsxs(pe,{children:[e.jsx(be,{asChild:!0,children:e.jsx(o,{variant:"ghost",size:"sm",children:e.jsx(oe,{className:"h-4 w-4"})})}),e.jsxs(fe,{align:"end",children:[e.jsxs(j,{onClick:()=>u(`/pengajuan/${s.id}`),children:[e.jsx(he,{className:"h-4 w-4 mr-2"}),"Lihat Detail"]}),d&&s.status==="submitted"&&e.jsxs(e.Fragment,{children:[e.jsxs(j,{onClick:()=>u(`/pengajuan/${s.id}`),children:[e.jsx(P,{className:"h-4 w-4 mr-2"}),"Setujui"]}),e.jsxs(j,{onClick:()=>u(`/pengajuan/${s.id}`),children:[e.jsx(T,{className:"h-4 w-4 mr-2"}),"Tolak"]})]}),d&&e.jsxs(j,{onClick:()=>{K(s.id),M(!0)},className:"text-red-600",children:[e.jsx(me,{className:"h-4 w-4 mr-2"}),"Hapus"]})]})]})})]},s.id))})]})})})]},a))}),y>1&&e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50",children:[e.jsxs("div",{className:"text-sm text-gray-700",children:["Menampilkan ",(i-1)*w+1," sampai ",Math.min(i*w,f)," dari ",f," pengajuan"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i-1),disabled:i===1,children:[e.jsx(V,{className:"h-4 w-4"}),"Sebelumnya"]}),e.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:y},(a,t)=>t+1).map(a=>e.jsx(o,{variant:i===a?"default":"outline",size:"sm",onClick:()=>g(a),className:"w-8 h-8 p-0",children:a},a))}),e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i+1),disabled:i===y,children:["Selanjutnya",e.jsx(G,{className:"h-4 w-4"})]})]})]})]}):e.jsx("div",{className:"border rounded-lg overflow-hidden",children:De?e.jsxs("div",{className:"flex items-center justify-center py-12",children:[e.jsx(xe,{className:"h-8 w-8 animate-spin mr-2"}),e.jsx("span",{children:"Memuat data pengajuan..."})]}):b.length===0&&f===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(B,{className:"h-12 w-12 text-gray-400 mx-auto mb-4"}),e.jsx("p",{className:"text-gray-500 mb-2",children:_||v!=="all"?"Tidak ada pengajuan yang sesuai dengan filter":"Belum ada pengajuan"}),!_&&v==="all"&&(l==null?void 0:l.role)!=="user"&&e.jsxs(o,{onClick:()=>u("/pengajuan/select"),className:"bg-green-600 hover:bg-green-700 text-white",children:[e.jsx(de,{className:"h-4 w-4 mr-2"}),"Buat Pengajuan Pertama"]})]}):b.length===0&&f>0?e.jsxs(e.Fragment,{children:[e.jsxs(W,{children:[e.jsx(q,{children:e.jsxs(C,{children:[e.jsx(r,{children:"Pegawai"}),e.jsx(r,{children:"Jenis Jabatan"}),e.jsx(r,{children:"Status"}),e.jsx(r,{children:"Dokumen"}),e.jsx(r,{children:"Tanggal Dibuat"}),e.jsx(r,{children:"Aksi"})]})}),e.jsx(Y,{children:e.jsx(C,{children:e.jsx(h,{colSpan:6,className:"text-center py-8 text-gray-500",children:"Tidak ada data di halaman ini"})})})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border-t bg-gray-50",children:[e.jsxs("div",{className:"text-sm text-gray-700",children:["Menampilkan ",(i-1)*w+1," sampai ",Math.min(i*w,f)," dari ",f," pengajuan"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i-1),disabled:i===1,children:[e.jsx(V,{className:"h-4 w-4"}),"Sebelumnya"]}),e.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:y},(a,t)=>t+1).map(a=>e.jsx(o,{variant:i===a?"default":"outline",size:"sm",onClick:()=>g(a),className:"w-8 h-8 p-0",children:a},a))}),e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i+1),disabled:i===y,children:["Selanjutnya",e.jsx(G,{className:"h-4 w-4"})]})]})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs(W,{children:[e.jsx(q,{children:e.jsxs(C,{children:[e.jsx(r,{children:"Pegawai"}),e.jsx(r,{children:"Jenis Jabatan"}),e.jsx(r,{children:"Status"}),e.jsx(r,{children:"Dokumen"}),d&&e.jsx(r,{children:"Pembuat"}),e.jsx(r,{children:"Tanggal Dibuat"}),e.jsx(r,{className:"text-right",children:"Aksi"})]})}),e.jsx(Y,{children:b.map(a=>e.jsxs(C,{className:"hover:bg-gray-50",children:[e.jsx(h,{children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:a.pegawai.nama}),e.jsx("div",{className:"text-sm text-gray-500",children:a.pegawai.jabatan})]})}),e.jsx(h,{children:e.jsx(R,{variant:"outline",children:ne(a.jenis_jabatan)})}),e.jsx(h,{children:le(a.status)}),e.jsx(h,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm",children:a.files.length}),e.jsx("span",{className:"text-gray-500",children:"/"}),e.jsx("span",{className:"text-sm",children:a.total_dokumen})]})}),d&&e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:(()=>{var s;const t=I.users.find(n=>n.id===a.created_by);return t?t.full_name||t.email||"Unknown User":(s=a.created_by)!=null&&s.includes("@")?a.created_by:"Unknown User"})()})}),e.jsx(h,{children:e.jsx("div",{className:"text-sm text-gray-600",children:ie(a.created_at)})}),e.jsx(h,{className:"text-right",children:e.jsxs(pe,{children:[e.jsx(be,{asChild:!0,children:e.jsx(o,{variant:"ghost",size:"sm",children:e.jsx(oe,{className:"h-4 w-4"})})}),e.jsxs(fe,{align:"end",children:[e.jsxs(j,{onClick:()=>u(`/pengajuan/${a.id}`),children:[e.jsx(he,{className:"h-4 w-4 mr-2"}),"Lihat Detail"]}),(l==null?void 0:l.role)!=="user"&&e.jsxs(e.Fragment,{children:[a.status==="draft"&&e.jsxs(j,{onClick:()=>u(`/pengajuan/${a.id}/upload`),children:[e.jsx(ue,{className:"h-4 w-4 mr-2"}),"Upload Dokumen"]}),a.status==="rejected"&&e.jsxs(j,{onClick:()=>u(`/pengajuan/${a.id}/edit`),children:[e.jsx(ue,{className:"h-4 w-4 mr-2"}),"Perbaiki Dokumen"]})]}),d&&a.status==="submitted"&&e.jsxs(e.Fragment,{children:[e.jsxs(j,{onClick:()=>u(`/pengajuan/${a.id}`),children:[e.jsx(P,{className:"h-4 w-4 mr-2"}),"Setujui"]}),e.jsxs(j,{onClick:()=>u(`/pengajuan/${a.id}`),children:[e.jsx(T,{className:"h-4 w-4 mr-2"}),"Tolak"]})]}),(d||a.status==="draft"&&(l==null?void 0:l.role)!=="user")&&e.jsxs(j,{onClick:()=>{console.log("🔍 Debug: Klik hapus untuk pengajuan:",{id:a.id,status:a.status,isAdmin:d,userRole:l==null?void 0:l.role}),K(a.id),M(!0)},className:"text-red-600",children:[e.jsx(me,{className:"h-4 w-4 mr-2"}),"Hapus"]})]})]})})]},a.id))})]}),e.jsxs("div",{className:"flex items-center justify-between px-4 py-3 border-t bg-gray-50",children:[e.jsxs("div",{className:"text-sm text-gray-700",children:["Menampilkan ",(i-1)*w+1," sampai ",Math.min(i*w,f)," dari ",f," pengajuan"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i-1),disabled:i===1,children:[e.jsx(V,{className:"h-4 w-4"}),"Sebelumnya"]}),e.jsx("div",{className:"flex items-center gap-1",children:Array.from({length:y},(a,t)=>t+1).map(a=>e.jsx(o,{variant:i===a?"default":"outline",size:"sm",onClick:()=>g(a),className:"w-8 h-8 p-0",children:a},a))}),e.jsxs(o,{variant:"outline",size:"sm",onClick:()=>g(i+1),disabled:i===y,children:["Selanjutnya",e.jsx(G,{className:"h-4 w-4"})]})]})]})]})})]})]}),e.jsx(ia,{open:Te,onOpenChange:M,children:e.jsxs(ra,{children:[e.jsxs(da,{children:[e.jsx(ca,{children:"Hapus Pengajuan"}),e.jsx(oa,{children:"Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan."})]}),e.jsxs(ha,{children:[e.jsx(ma,{disabled:L,children:"Batal"}),e.jsx(xa,{onClick:Ue,disabled:L,className:"bg-red-600 hover:bg-red-700",children:L?e.jsxs(e.Fragment,{children:[e.jsx(xe,{className:"h-4 w-4 mr-2 animate-spin"}),"Menghapus..."]}):"Hapus"})]})]})})]})};export{wa as default};
//# sourceMappingURL=PengajuanIndex-oYsF1ZF0.js.map
