import React from 'react';

const SuratPreviewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="preview-container border rounded-lg bg-white shadow p-8 overflow-auto"
    style={{ minWidth: '420px', maxWidth: '700px', width: '100%', margin: '0 auto', fontFamily: 'inherit', fontSize: 15, background: '#fff', borderRadius: 12 }}
  >
    {/* Print style for container and img/logo */}
    <style>{`
      @media print {
        body { background: #fff !important; }
        .preview-container { max-width: 700px !important; margin: 0 auto !important; padding: 32px !important; background: #fff !important; }
        .preview-container img { max-width: 120px !important; height: auto !important; display: block !important; margin: 0 auto 16px auto !important; }
      }
      .preview-container img { max-width: 120px; height: auto; display: block; margin: 0 auto 16px auto; }
    `}</style>
    {children}
  </div>
);

export default SuratPreviewContainer; 