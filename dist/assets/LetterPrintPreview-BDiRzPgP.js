import{j as t}from"./ui-vendor-DipkbOWo.js";import{d as b,e as k,r as n}from"./react-vendor-DheTkQGW.js";import{u as v,a as w}from"./index-CHkW9T71.js";import{T as y,a as T,b as _,c as L,d as N,e as E,f as S,g as P,h as A}from"./Template9-PAKI1hRq.js";const F=()=>{const{id:o}=b(),f=k(),{token:d,isAuthenticated:s,loading:i}=v(),[l,h]=n.useState(null),[x,m]=n.useState(!0),[c,j]=n.useState(null);n.useEffect(()=>{if(!i&&!s){f("/");return}},[i,s,f]),n.useEffect(()=>{!i&&s&&d&&o&&(async()=>{m(!0);try{const e=await w(`/api/letters/${o}`,d);h(e.letter||e)}catch(e){console.error("Error fetching letter:",e),j("Gagal mengambil data surat")}finally{m(!1)}})()},[o,d,s,i]);const g=r=>{var u;let e=r.form_data;if(typeof e=="string")try{e=JSON.parse(e)}catch{e={}}if(e={...e,office:r.office,kode_kabko:((u=r.office)==null?void 0:u.kode_kabko)||e.kode_kabko,letter_number:r.letter_number,...r},!e.nosrt&&r.letter_number){const p=r.letter_number.match(/^B-([^/]+)/);p&&(e.nosrt=p[1])}if(!e)return t.jsx("div",{children:"Data surat tidak ditemukan"});const a=String(r.template_id);return a==="1"?t.jsx(y,{data:e}):a==="2"?t.jsx(T,{data:e}):a==="3"?t.jsx(_,{data:e}):a==="4"?t.jsx(L,{data:e}):a==="5"?t.jsx(N,{data:e}):a==="6"?t.jsx(E,{data:e}):a==="7"?t.jsx(S,{data:e}):a==="8"?t.jsx(P,{data:e}):a==="9"?t.jsx(A,{data:e}):t.jsx("div",{children:"Template tidak dikenali"})};return i||x?t.jsx("div",{children:"Loading..."}):c?t.jsx("div",{className:"text-error",children:c}):l?t.jsxs("div",{style:{fontFamily:"Arial, sans-serif",background:"#f8fafc",minHeight:"100vh",padding:24},children:[t.jsx("style",{children:`
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
      `}),t.jsx("div",{className:"flex justify-end mb-4 print:hidden",children:t.jsx("button",{onClick:()=>window.print(),className:"bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded shadow",children:"Print"})}),t.jsx("div",{className:"flex justify-center",children:t.jsx("div",{className:"print-paper w-full max-w-[700px] bg-white rounded shadow p-4 md:p-8",children:g(l)})})]}):t.jsx("div",{children:"Surat tidak ditemukan"})};export{F as default};
//# sourceMappingURL=LetterPrintPreview-BDiRzPgP.js.map
