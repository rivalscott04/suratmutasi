import{j as t}from"./ui-vendor-DiY4nm-6.js";import{g as h,r as i}from"./react-vendor-C8WR5ETM.js";import{T as j,a as g,b as k,c as b,d as w,e as v,f as y,g as T,h as _}from"./Template9-BOl4RVnC.js";import{a as f}from"./index-9P-lsB0e.js";const E=()=>{const{id:n}=h(),[s,c]=i.useState(null),[p,o]=i.useState(!0),[d,u]=i.useState(null);i.useEffect(()=>{(async()=>{o(!0);try{const e=localStorage.getItem("token");let r;e?r=await f(`/api/letters/${n}`,e):r=await f(`/api/letters/${n}`),c(r.letter||r)}catch{u("Gagal mengambil data surat")}finally{o(!1)}})()},[n]);const x=a=>{var l;let e=a.form_data;if(typeof e=="string")try{e=JSON.parse(e)}catch{e={}}if(e={...e,office:a.office,kode_kabko:((l=a.office)==null?void 0:l.kode_kabko)||e.kode_kabko,letter_number:a.letter_number,...a},!e.nosrt&&a.letter_number){const m=a.letter_number.match(/^B-([^/]+)/);m&&(e.nosrt=m[1])}if(!e)return t.jsx("div",{children:"Data surat tidak ditemukan"});const r=String(a.template_id);return r==="1"?t.jsx(j,{data:e}):r==="2"?t.jsx(g,{data:e}):r==="3"?t.jsx(k,{data:e}):r==="4"?t.jsx(b,{data:e}):r==="5"?t.jsx(w,{data:e}):r==="6"?t.jsx(v,{data:e}):r==="7"?t.jsx(y,{data:e}):r==="8"?t.jsx(T,{data:e}):r==="9"?t.jsx(_,{data:e}):t.jsx("div",{children:"Template tidak dikenali"})};return p?t.jsx("div",{children:"Loading..."}):d?t.jsx("div",{className:"text-error",children:d}):s?t.jsxs("div",{style:{fontFamily:"Arial, sans-serif",background:"#f8fafc",minHeight:"100vh",padding:24},children:[t.jsx("style",{children:`
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
      `}),t.jsx("div",{className:"flex justify-end mb-4 print:hidden",children:t.jsx("button",{onClick:()=>window.print(),className:"bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded shadow",children:"Print"})}),t.jsx("div",{className:"flex justify-center",children:t.jsx("div",{className:"print-paper w-full max-w-[700px] bg-white rounded shadow p-4 md:p-8",children:x(s)})})]}):t.jsx("div",{children:"Surat tidak ditemukan"})};export{E as default};
//# sourceMappingURL=LetterPrintPreview-C58LG1wK.js.map
