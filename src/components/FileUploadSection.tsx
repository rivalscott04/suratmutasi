import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Eye, Trash2, Loader2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AdminWilayahFileConfig {
  id: number;
  jenis_jabatan_id: number;
  file_type: string;
  display_name: string;
  is_required: boolean;
  description?: string;
  is_active: boolean;
}

interface FileUploadSectionProps {
  fileConfig: AdminWilayahFileConfig;
  status: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  uploadedFile?: {
    id: string;
    file_name: string;
    file_size: number;
    uploaded_by_name?: string;
    uploaded_by_office?: string;
    created_at: string;
  };
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileConfig,
  status,
  uploading,
  onUpload,
  uploadedFile
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusBadge = () => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600 text-white">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      default:
        return <Badge className="bg-gray-600 text-white">Not Uploaded</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-green-600 animate-spin" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset file input setelah file dipilih
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card className={`border-2 transition-all duration-200 ${
        status === 'verified' 
          ? 'border-green-200 bg-green-50' 
          : status === 'rejected'
          ? 'border-red-200 bg-red-50'
          : status === 'pending'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-gray-200 hover:border-green-300'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon()}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{fileConfig.display_name}</h3>
                  {fileConfig.description && (
                    <p className="text-sm text-gray-600 mt-1">{fileConfig.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {fileConfig.is_required && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">Wajib</Badge>
                  )}
                  {getStatusBadge()}
                </div>
              </div>

              {uploadedFile ? (
                <div className="mt-3 p-3 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {(() => {
                            const officeRaw = (uploadedFile.uploaded_by_office || '').toString();
                            const withoutParens = officeRaw.replace(/\s*\([^)]*\)\s*$/, '');
                            const withoutUuid = withoutParens.replace(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, '').trim();
                            const officeText = withoutUuid ? ` ${withoutUuid}` : '';
                            return `${formatFileSize(uploadedFile.file_size)} • Uploaded by ${uploadedFile.uploaded_by_name}${officeText}`;
                          })()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(uploadedFile.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(true)}
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteDialog(true)}
                        className="border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Klik untuk upload file atau drag & drop
                    </p>
                    <Button
                      onClick={handleUploadClick}
                      disabled={uploading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-green-600" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-green-800">Preview File</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {uploadedFile && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">{uploadedFile.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.file_size)} • Uploaded by {uploadedFile.uploaded_by_name}
                    </p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 text-center">
                    Preview file akan ditampilkan di sini
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800">Konfirmasi Hapus File</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-gray-600">
              Apakah Anda yakin ingin menghapus file "{uploadedFile?.file_name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete
                setShowDeleteDialog(false);
              }}
            >
              Hapus File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileUploadSection;
