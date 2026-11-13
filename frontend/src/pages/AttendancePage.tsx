import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Camera,
  ArrowRight,
  Clock,
  Info,
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
  const [notes, setNotes] = useState<string>('');

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');

  const hasCheckedIn = todayData?.hasCheckedIn ?? false;
  const hasCheckedOut = todayData?.hasCheckedOut ?? false;
  const attendance = todayData?.attendance;

  const schedule = todayData?.schedule;
  const workStartTime = schedule?.workStartTime ? schedule.workStartTime.substring(0, 5) : '08:00';
  const workEndTime = schedule?.workEndTime ? schedule.workEndTime.substring(0, 5) : '17:00';
  const lateToleranceMinutes = schedule?.lateToleranceMinutes ?? 15;

  const [startHour, startMinute] = workStartTime.split(':').map(Number);
  const scheduledStartDayjs = dayjs()
    .hour(isNaN(startHour) ? 8 : startHour)
    .minute(isNaN(startMinute) ? 0 : startMinute)
    .second(0);
  const lateThresholdDayjs = scheduledStartDayjs.add(lateToleranceMinutes, 'minute');
  const lateThresholdTimeStr = lateThresholdDayjs.format('HH:mm');

  const now = dayjs();
  const isPastLateTolerance = now.isAfter(lateThresholdDayjs);
  const [endHour, endMinute] = workEndTime.split(':').map(Number);
  const scheduledEndDayjs = dayjs()
    .hour(isNaN(endHour) ? 17 : endHour)
    .minute(isNaN(endMinute) ? 0 : endMinute)
    .second(0);
  const isBeforeWorkEndTime = now.isBefore(scheduledEndDayjs);

  const isSubmitting = checkInMutation.isPending || checkOutMutation.isPending;

  const handleCapture = (file: File) => {
    setCapturedPhoto(file);
  };

  const handleResetCapture = () => {
    setCapturedPhoto(null);
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

    setCapturedPhoto(null);
    setNotes('');
  };

  return (
    <DashboardTemplate
      title="Presensi WFH"
      description="Presensi kehadiran kerja dari rumah dengan verifikasi foto selfie."
    >
      <div className="space-y-6">
        {/* Top Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveClock variant="card" />

          {/* Today Summary Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Status Hari Ini
            </div>

            {isLoadingToday ? (
              <div className="py-4 text-center text-xs text-slate-400">Memuat status...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500">Check-In</span>
                    {hasCheckedIn ? (
                      <AttendanceStatusBadge status={AttendanceStatus.PRESENT} />
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Belum
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-800">
                    {attendance?.checkInTime
                      ? dayjs(attendance.checkInTime).format('HH:mm:ss') + ' WIB'
                      : '--:--:--'}
                  </div>
                  {attendance?.isLate && (
                    <div className="mt-1">
                      <LateBadge isLate={true} lateMinutes={attendance.lateMinutes} />
                    </div>
                  )}
                  {attendance?.checkInPhotoPath && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxUrl(`/api/attendances/photos/${attendance.checkInPhotoPath}`);
                        setLightboxTitle('Bukti Foto Check-In');
                      }}
                      className="mt-2 text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Foto</span>
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500">Check-Out</span>
                    {hasCheckedOut ? (
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Belum
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-base font-bold text-slate-800">
                    {attendance?.checkOutTime
                      ? dayjs(attendance.checkOutTime).format('HH:mm:ss') + ' WIB'
                      : '--:--:--'}
                  </div>
                  {attendance?.checkOutPhotoPath && (
                    <button
                      type="button"
                      onClick={() => {
                        setLightboxUrl(`/api/attendances/photos/${attendance.checkOutPhotoPath}`);
                        setLightboxTitle('Bukti Foto Check-Out');
                      }}
                      className="mt-2 text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Foto</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Attendance Window Information Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3 text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Ketentuan & Batas Waktu Absensi WFH</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-blue-900 block mb-1">
                  Batas Absen Masuk (Check-In)
                </span>
                <p className="text-slate-700">
                  Pukul <strong className="font-mono text-slate-900">{workStartTime} - {lateThresholdTimeStr} WIB</strong>
                </p>
              </div>
              <p className="text-[11px] text-blue-800/80 mt-2 leading-relaxed">
                *Toleransi keterlambatan {lateToleranceMinutes} menit. Check-in melewati pukul {lateThresholdTimeStr} WIB otomatis tercatat sebagai <strong>Terlambat</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  Batas Absen Keluar (Check-Out)
                </span>
                <p className="text-slate-700">
                  Mulai pukul <strong className="font-mono text-slate-900">{workEndTime} WIB</strong>
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                *Wajib melakukan Check-Out setelah jam kerja Anda selesai dengan mengunggah foto selfie.
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Action Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          {hasCheckedIn && hasCheckedOut ? (
            <div className="py-8 text-center text-slate-600">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-slate-800">Presensi Hari Ini Lengkap</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda telah menyelesaikan Check-In dan Check-Out untuk hari ini.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>
                    {!hasCheckedIn ? 'Ambil Foto Check-In (Pagi)' : 'Ambil Foto Check-Out (Sore)'}
                  </span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Jam Kerja: {workStartTime} - {workEndTime} WIB
                </span>
              </div>

              {!hasCheckedIn && isPastLateTolerance && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Waktu saat ini telah melewati batas toleransi ({lateThresholdTimeStr} WIB). Check-in akan tercatat sebagai <strong>Terlambat</strong>.
                  </span>
                </div>
              )}

              {hasCheckedIn && !hasCheckedOut && isBeforeWorkEndTime && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Jam kerja Anda berakhir pada pukul <strong>{workEndTime} WIB</strong>. Anda dapat melakukan Check-Out saat selesai bekerja.
                  </span>
                </div>
              )}

              {/* Camera Component */}
              <CameraCapture
                onCapture={handleCapture}
                onReset={handleResetCapture}
                disabled={isSubmitting}
              />

              {/* Notes */}
              <FormField label="Catatan Aktivitas / Tugas (Opsional)" optional>
                <Textarea
                  placeholder="Tuliskan catatan pekerjaan Anda..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={2}
                />
              </FormField>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  disabled={!capturedPhoto || isSubmitting}
                  isLoading={isSubmitting}
                  onClick={handleSubmitAttendance}
                >
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {!hasCheckedIn ? 'Kirim Check-In' : 'Kirim Check-Out'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

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
