import{j as e}from"./ui-vendor-XUDKdrve.js";import{g as b,d as k,r as n}from"./react-vendor-C8WR5ETM.js";import{u as v,a as w}from"./index-WIUaKMpU.js";import{T as y,a as T,b as _,c as L,d as N,e as E,f as S,g as P,h as A}from"./Template9-Dz_BaQxR.js";const F=()=>{const{id:o}=b(),f=k(),{token:d,isAuthenticated:s,loading:i}=v(),[l,h]=n.useState(null),[x,m]=n.useState(!0),[c,g]=n.useState(null);n.useEffect(()=>{if(!i&&!s){f("/");return}},[i,s,f]),n.useEffect(()=>{!i&&s&&d&&o&&(async()=>{m(!0);try{const t=await w(`/api/letters/${o}`,d);h(t.letter||t)}catch(t){console.error("Error fetching letter:",t),g("Gagal mengambil data surat")}finally{m(!1)}})()},[o,d,s,i]);const j=r=>{var u;let t=r.form_data;if(typeof t=="string")try{t=JSON.parse(t)}catch{t={}}if(t={...t,office:r.office,kode_kabko:((u=r.office)==null?void 0:u.kode_kabko)||t.kode_kabko,letter_number:r.letter_number,...r},!t.nosrt&&r.letter_number){const p=r.letter_number.match(/^B-([^/]+)/);p&&(t.nosrt=p[1])}if(!t)return e.jsx("div",{children:"Data surat tidak ditemukan"});const a=String(r.template_id);return a==="1"?e.jsx(y,{data:t}):a==="2"?e.jsx(T,{data:t}):a==="3"?e.jsx(_,{data:t}):a==="4"?e.jsx(L,{data:t}):a==="5"?e.jsx(N,{data:t}):a==="6"?e.jsx(E,{data:t}):a==="7"?e.jsx(S,{data:t}):a==="8"?e.jsx(P,{data:t}):a==="9"?e.jsx(A,{data:t}):e.jsx("div",{children:"Template tidak dikenali"})};return i||x?e.jsx("div",{children:"Loading..."}):c?e.jsx("div",{className:"text-error",children:c}):l?e.jsxs("div",{style:{fontFamily:"Arial, sans-serif",background:"#f8fafc",minHeight:"100vh",padding:24},children:[e.jsx("style",{children:`
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
      `}),e.jsx("div",{className:"flex justify-end mb-4 print:hidden",children:e.jsx("button",{onClick:()=>window.print(),className:"bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded shadow",children:"Print"})}),e.jsx("div",{className:"flex justify-center",children:e.jsx("div",{className:"print-paper w-full max-w-[700px] bg-white rounded shadow p-4 md:p-8",children:j(l)})})]}):e.jsx("div",{children:"Surat tidak ditemukan"})};export{F as default};
//# sourceMappingURL=LetterPrintPreview-BDWjDBt0.js.map
