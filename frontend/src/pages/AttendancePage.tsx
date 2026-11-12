import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Camera,
} from 'lucide-react';
import dayjs from 'dayjs';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { LiveClock } from '../components/molecules/LiveClock';
import { AttendanceStatusBadge } from '../components/molecules/AttendanceStatusBadge';
import { LateBadge } from '../components/molecules/LateBadge';
import { CameraCapture } from '../components/organisms/CameraCapture';
import { ImageLightbox } from '../components/organisms/ImageLightbox';
import { Button } from '../components/atoms/Button';
import { Textarea } from '../components/atoms/Textarea';
import { FormField } from '../components/molecules/FormField';
import {
  useTodayAttendance,
  useCheckIn,
  useCheckOut,
} from '../hooks/useAttendance';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceStatus } from '../types/attendance.types';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { data: todayData, isLoading: isLoadingToday } = useTodayAttendance();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [, setPhotoPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  const hasCheckedIn = todayData?.hasCheckedIn ?? false;
  const hasCheckedOut = todayData?.hasCheckedOut ?? false;
  const attendance = todayData?.attendance;

  // Determine current time late preview (> 08:15)
  const currentHour = dayjs().hour();
  const currentMinute = dayjs().minute();
  const isPastLateTolerance =
    currentHour > 8 || (currentHour === 8 && currentMinute > 15);

  const isSubmitting = checkInMutation.isPending || checkOutMutation.isPending;

  const handleCapture = (file: File, previewUrl: string) => {
    setCapturedPhoto(file);
    setPhotoPreviewUrl(previewUrl);
  };

  const handleResetCapture = () => {
    setCapturedPhoto(null);
    setPhotoPreviewUrl(null);
  };

  const handleSubmitAttendance = async () => {
    if (!capturedPhoto) return;

    if (!hasCheckedIn) {
      await checkInMutation.mutateAsync({
        photo: capturedPhoto,
        notes: notes.trim() || undefined,
      });
    } else if (!hasCheckedOut) {
      await checkOutMutation.mutateAsync({
        photo: capturedPhoto,
        notes: notes.trim() || undefined,
      });
    }

    // Reset local state after submission
    setCapturedPhoto(null);
    setPhotoPreviewUrl(null);
    setNotes('');
  };

  return (
    <DashboardTemplate
      title="Presensi WFH Karyawan"
      description="Lakukan presensi harian WFH dengan verifikasi foto selfie dan pencatatan waktu sistem."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clock & Attendance Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Clock Card */}
          <LiveClock variant="card" />

          {/* Today's Status Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <span>Status Presensi Hari Ini</span>
            </h3>

            {isLoadingToday ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Memuat status presensi...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check In Status */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        1. Check-In (Pagi)
                      </span>
                      {hasCheckedIn ? (
                        <AttendanceStatusBadge status={AttendanceStatus.PRESENT} />
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Belum Absen
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-lg font-mono font-bold text-slate-800">
                      {attendance?.checkInTime
                        ? dayjs(attendance.checkInTime).format('HH:mm:ss') + ' WIB'
                        : '--:--:--'}
                    </p>
                    {attendance?.isLate && (
                      <div className="mt-1">
                        <LateBadge isLate={true} lateMinutes={attendance.lateMinutes} />
                      </div>
                    )}
                    {attendance?.checkInNotes && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        "{attendance.checkInNotes}"
                      </p>
                    )}
                  </div>

                  {attendance?.checkInPhotoPath && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxUrl(
                          `/api/attendances/photos/${attendance.checkInPhotoPath}`,
                        );
                        setLightboxTitle('Bukti Foto Check-In WFH');
                      }}
                      className="group relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer"
                      title="Klik untuk memperbesar"
                    >
                      <img
                        src={`/api/attendances/photos/${attendance.checkInPhotoPath}`}
                        alt="Bukti Check-In"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Check Out Status */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        2. Check-Out (Sore)
                      </span>
                      {hasCheckedOut ? (
                        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                          {hasCheckedIn ? 'Siap Check-Out' : 'Menunggu Check-In'}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-lg font-mono font-bold text-slate-800">
                      {attendance?.checkOutTime
                        ? dayjs(attendance.checkOutTime).format('HH:mm:ss') + ' WIB'
                        : '--:--:--'}
                    </p>
                    {attendance?.checkOutNotes && (
                      <p className="mt-1 text-xs text-slate-500 italic">
                        "{attendance.checkOutNotes}"
                      </p>
                    )}
                  </div>

                  {attendance?.checkOutPhotoPath && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxUrl(
                          `/api/attendances/photos/${attendance.checkOutPhotoPath}`,
                        );
                        setLightboxTitle('Bukti Foto Check-Out WFH');
                      }}
                      className="group relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shadow-xs cursor-pointer"
                      title="Klik untuk memperbesar"
                    >
                      <img
                        src={`/api/attendances/photos/${attendance.checkOutPhotoPath}`}
                        alt="Bukti Check-Out"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance Action Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {!hasCheckedIn
                      ? 'Langkah 1: Check-In WFH (Pagi)'
                      : !hasCheckedOut
                      ? 'Langkah 2: Check-Out WFH (Sore)'
                      : 'Presensi Hari Ini Selesai'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jam Operasional: 08:00 - 17:00 WIB (Batas toleransi keterlambatan 08:15 WIB)
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>2x / Hari</span>
                </div>
              </div>

              {/* Status Alert if complete */}
              {hasCheckedIn && hasCheckedOut ? (
                <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 my-8">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                  <h4 className="text-lg font-bold">Presensi WFH Hari Ini Lengkap!</h4>
                  <p className="text-sm text-emerald-700 mt-1 max-w-md mx-auto">
                    Anda telah menyelesaikan check-in dan check-out untuk hari ini. Terima kasih dan selamat beristirahat!
                  </p>
                </div>
              ) : (
                <>
                  {/* Late Warning Alert for Check-in */}
                  {!hasCheckedIn && isPastLateTolerance && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-semibold block text-amber-900">
                          Peringatan Keterlambatan:
                        </strong>
                        Waktu saat ini telah melewati pukul 08:15 WIB. Check-in Anda akan otomatis ditandai sebagai <strong>Terlambat</strong> oleh sistem.
                      </div>
                    </div>
                  )}

                  {/* Camera Capture Organism */}
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Ambil Foto Bukti Selfie WFH</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <CameraCapture
                      onCapture={handleCapture}
                      onReset={handleResetCapture}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Optional Notes */}
                  <div className="mb-6">
                    <FormField
                      label="Catatan Aktivitas / Pekerjaan WFH (Opsional)"
                      optional
                    >
                      <div className="relative">
                        <Textarea
                          placeholder="Contoh: Mengerjakan fitur integrasi API WFH dan unit testing..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          disabled={isSubmitting}
                          rows={3}
                        />
                      </div>
                    </FormField>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            {!hasCheckedIn || !hasCheckedOut ? (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={!capturedPhoto || isSubmitting}
                  isLoading={isSubmitting}
                  onClick={handleSubmitAttendance}
                  className="w-full sm:w-auto"
                >
                  <CalendarCheck className="w-5 h-5 mr-2" />
                  {!hasCheckedIn
                    ? 'Kirim Presensi Check-In (Pagi)'
                    : 'Kirim Presensi Check-Out (Sore)'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Lightbox for zooming photos */}
      <ImageLightbox
        isOpen={!!lightboxUrl}
        imageUrl={lightboxUrl}
        title={lightboxTitle}
        employeeName={user?.fullName}
        timestamp={dayjs().format('DD MMMM YYYY')}
        onClose={() => setLightboxUrl(null)}
      />
    </DashboardTemplate>
  );
};
