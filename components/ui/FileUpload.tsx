'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
  existingFiles?: UploadedFile[];
  onDeleteFile?: (fileId: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export default function FileUpload({
  onFilesChange,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFiles = 5,
  maxSizePerFile = 10,
  existingFiles = [],
  onDeleteFile
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalFiles = existingFiles.length + selectedFiles.length + newFiles.length;

    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles: File[] = [];
    
    for (const file of newFiles) {
      // Check file size
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum ${maxSizePerFile}MB per file.`);
        continue;
      }

      // Check file type
      const fileType = file.type || '';
      const fileName = file.name.toLowerCase();
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        return fileType.match(type.replace('*', '.*'));
      });

      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-cyan-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-cyan-500 bg-cyan-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-cyan-500' : 'text-gray-400'}`} />
        
        <div className="space-y-2">
          <p className="text-lg font-body text-gray-700">
            {dragActive ? 'Drop files here' : 'Upload files'}
          </p>
          <p className="text-sm text-gray-500 font-body">
            Drag and drop or click to select files
          </p>
          <p className="text-xs text-gray-400 font-body">
            Supported: Images, PDF, DOC • Max {maxSizePerFile}MB per file • Up to {maxFiles} files
          </p>
        </div>
      </div>

      {/* File List */}
      {(selectedFiles.length > 0 || existingFiles.length > 0) && (
        <div className="space-y-3">
          <h4 className="font-heading text-gray-700">Files</h4>
          
          {/* Existing Files */}
          {existingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name, file.type)}
                <div>
                  <p className="font-body text-sm text-gray-700">{file.name}</p>
                  <p className="font-body text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-600 hover:text-cyan-700 text-sm font-body"
                >
                  View
                </a>
                {onDeleteFile && (
                  <button
                    type="button"
                    onClick={() => onDeleteFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* New Files */}
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file.name, file.type)}
                <div>
                  <p className="font-body text-sm text-gray-700">{file.name}</p>
                  <p className="font-body text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Warning */}
      {selectedFiles.length > 0 && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm text-amber-800">
              {selectedFiles.length} file(s) ready to upload
            </p>
            <p className="font-body text-xs text-amber-600">
              Files will be uploaded when you save the form
            </p>
          </div>
        </div>
      )}
    </div>
  );
}