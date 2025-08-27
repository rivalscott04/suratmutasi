import{j as e}from"./ui-vendor-e65TVV2G.js";import{g as h,r as i}from"./react-vendor-C8WR5ETM.js";import{T as j,a as g,b as k,c as b,d as w,e as v,f as y,g as T,h as _}from"./Template9-B8oZ99_N.js";import{a as f}from"./index-DMfYXVru.js";import"./data-vendor-DtxkLsA5.js";const B=()=>{const{id:n}=h(),[s,p]=i.useState(null),[c,o]=i.useState(!0),[d,u]=i.useState(null);i.useEffect(()=>{(async()=>{o(!0);try{const t=localStorage.getItem("token");let r;t?r=await f(`/api/letters/${n}`,t):r=await f(`/api/letters/${n}`),p(r.letter||r)}catch{u("Gagal mengambil data surat")}finally{o(!1)}})()},[n]);const x=a=>{var l;let t=a.form_data;if(typeof t=="string")try{t=JSON.parse(t)}catch{t={}}if(t={...t,office:a.office,kode_kabko:((l=a.office)==null?void 0:l.kode_kabko)||t.kode_kabko,letter_number:a.letter_number,...a},!t.nosrt&&a.letter_number){const m=a.letter_number.match(/^B-([^/]+)/);m&&(t.nosrt=m[1])}if(!t)return e.jsx("div",{children:"Data surat tidak ditemukan"});const r=String(a.template_id);return r==="1"?e.jsx(j,{data:t}):r==="2"?e.jsx(g,{data:t}):r==="3"?e.jsx(k,{data:t}):r==="4"?e.jsx(b,{data:t}):r==="5"?e.jsx(w,{data:t}):r==="6"?e.jsx(v,{data:t}):r==="7"?e.jsx(y,{data:t}):r==="8"?e.jsx(T,{data:t}):r==="9"?e.jsx(_,{data:t}):e.jsx("div",{children:"Template tidak dikenali"})};return c?e.jsx("div",{children:"Loading..."}):d?e.jsx("div",{className:"text-error",children:d}):s?e.jsxs("div",{style:{fontFamily:"Arial, sans-serif",background:"#f8fafc",minHeight:"100vh",padding:24},children:[e.jsx("style",{children:`
        @media print {
          .print-paper {
            background: #fff !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          body { background: #fff !important; }
        }
      `}),e.jsx("div",{className:"flex justify-end mb-4 print:hidden",children:e.jsx("button",{onClick:()=>window.print(),className:"bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded shadow",children:"Print"})}),e.jsx("div",{className:"flex justify-center",children:e.jsx("div",{className:"print-paper w-full max-w-[700px] bg-white rounded shadow p-4 md:p-8",children:x(s)})})]}):e.jsx("div",{children:"Surat tidak ditemukan"})};export{B as default};
//# sourceMappingURL=LetterPrintPreview-hizE08zh.js.map
