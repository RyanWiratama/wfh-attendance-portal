import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';

export interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onReset?: () => void;
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onReset,
  disabled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh browser ini. Gunakan fitur upload file.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setHasPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Izin kamera ditolak. Berikan izin di browser Anda atau gunakan upload file.'
          : err.message || 'Gagal mengakses kamera.',
      );
    }
  }, [stopStream]);

  useEffect(() => {
    if (!previewUrl && !disabled) {
      startCamera();
    }
    return () => {
      stopStream();
    };
  }, [previewUrl, disabled, startCamera, stopStream]);

  const takeSnapshot = () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `wfh-proof-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopStream();
        onCapture(file, url);
      },
      'image/jpeg',
      0.85,
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file foto berformat JPG, PNG, atau WebP.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    stopStream();
    onCapture(file, url);
  };

  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) onReset();
    startCamera();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container display */}
      <div className="relative w-full aspect-4/3 max-w-md bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center">
        {previewUrl ? (
          // Captured Preview
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Bukti Absensi WFH"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 bg-emerald-600/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Foto Siap
            </div>
          </div>
        ) : isCameraActive ? (
          // Live Video
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          // Error or No Camera Fallback View
          <div className="p-6 text-center text-slate-300 flex flex-col items-center justify-center gap-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-medium">{errorMessage || 'Kamera tidak aktif.'}</p>
            <p className="text-xs text-slate-400">
              Anda dapat mengunggah file foto selfie secara langsung.
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
        {previewUrl ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleRetake}
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Ambil Ulang Foto
          </Button>
        ) : (
          <>
            {isCameraActive && (
              <Button
                type="button"
                variant="primary"
                onClick={takeSnapshot}
                disabled={disabled}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Ambil Foto Selfie
              </Button>
            )}
            <Button
              type="button"
              variant={isCameraActive ? 'outline' : 'primary'}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={isCameraActive ? 'shrink-0' : 'w-full'}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isCameraActive ? 'Upload File' : 'Pilih Foto dari Perangkat'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
