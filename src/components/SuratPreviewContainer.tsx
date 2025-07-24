import React from 'react';

const SuratPreviewContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="preview-container border rounded-lg bg-white shadow"
    style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0, fontFamily: 'inherit', fontSize: 15, background: '#fff', borderRadius: 0 }}
  >
    {/* Print style for container and img/logo */}
    <style>{`
      @media print {
        body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
        .preview-container, .template-preview, .letter-body, .sheet {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .preview-container img { max-width: 120px !important; height: auto !important; display: block !important; margin: 0 auto 16px auto !important; }
      }
      .preview-container img { max-width: 120px; height: auto; display: block; margin: 0 auto 16px auto; }
    `}</style>
    {children}
  </div>
);

export default SuratPreviewContainer; 