
import React, { useState, useRef } from 'react';
import { storageService } from '../services/storageService';
import { Camera, X, Loader2, UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
  label: string;
  initialUrl?: string;
  onUpload: (url: string) => void;
  onDelete?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  initialUrl,
  onUpload,
  onDelete,
  className = '',
  aspectRatio = 'square'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // If there's an existing image, we might want to delete it from R2
      // But for simplicity, we'll just upload the new one.
      // The user can delete manually if needed.
      const url = await storageService.uploadImage(file);
      setPreviewUrl(url);
      onUpload(url);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!previewUrl) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this image?');
    if (!confirmDelete) return;

    setIsUploading(true);
    try {
      await storageService.deleteImage(previewUrl);
      setPreviewUrl(undefined);
      if (onDelete) onDelete();
      onUpload(''); // Clear the URL
    } catch (err) {
      setError('Failed to delete image.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const ratioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      
      <div 
        className={`relative group overflow-hidden rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-zinc-300 ${ratioClass}`}
      >
        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full"
            >
              <img 
                src={previewUrl} 
                alt={label}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isUploading}
                  className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full flex-col items-center justify-center space-y-2 p-4 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="rounded-full bg-zinc-100 p-3 text-zinc-400 transition-colors group-hover:bg-zinc-200 group-hover:text-zinc-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="text-sm font-medium text-zinc-600">
                Click to upload
              </div>
              <div className="text-xs text-zinc-400">
                PNG, JPG up to 5MB
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
            <span className="mt-2 text-xs font-medium text-zinc-900">Processing...</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500">{error}</p>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
