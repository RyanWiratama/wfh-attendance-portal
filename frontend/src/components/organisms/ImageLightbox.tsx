import React from 'react';
import { X, ExternalLink, Calendar, User } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  employeeName?: string;
  timestamp?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Foto Bukti Absensi WFH',
  employeeName,
  timestamp,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 text-white">
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              {employeeName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {employeeName}
                </span>
              )}
              {timestamp && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {timestamp}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka Tab Baru
          </a>
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
