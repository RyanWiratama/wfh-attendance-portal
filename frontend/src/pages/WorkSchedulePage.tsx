import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, AlertCircle, Pencil } from 'lucide-react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { Modal } from '../components/organisms/Modal';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { FormField } from '../components/molecules/FormField';
import { useWorkSchedule, useUpdateWorkSchedule } from '../hooks/useAttendance';
import type { WorkSchedule } from '../types/attendance.types';

const scheduleSchema = z.object({
  name: z.string().min(3, 'Nama jadwal minimal 3 karakter'),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Format jam harus HH:mm:ss atau HH:mm'),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Format jam harus HH:mm:ss atau HH:mm'),
  lateToleranceMinutes: z.coerce.number().min(0, 'Toleransi minimal 0 menit').max(120, 'Toleransi maksimal 120 menit'),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export const WorkSchedulePage: React.FC = () => {
  const { data: schedules, isLoading } = useWorkSchedule();
  const updateMutation = useUpdateWorkSchedule();

  const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
  });

  const handleOpenEdit = (schedule: WorkSchedule) => {
    setEditingSchedule(schedule);
    reset({
      name: schedule.name,
      workStartTime: schedule.workStartTime,
      workEndTime: schedule.workEndTime,
      lateToleranceMinutes: schedule.lateToleranceMinutes,
    });
  };

  const onSubmitEdit = async (values: ScheduleFormValues) => {
    if (!editingSchedule) return;
    await updateMutation.mutateAsync({
      id: editingSchedule.id,
      data: {
        name: values.name,
        workStartTime: values.workStartTime.length === 5 ? `${values.workStartTime}:00` : values.workStartTime,
        workEndTime: values.workEndTime.length === 5 ? `${values.workEndTime}:00` : values.workEndTime,
        lateToleranceMinutes: values.lateToleranceMinutes,
      },
    });
    setEditingSchedule(null);
  };

  return (
    <DashboardTemplate
      title="Pengaturan Jadwal Kerja WFH"
      description="Konfigurasi jam kerja standar perusahaan dan batas toleransi keterlambatan check-in."
    >
      <div className="max-w-4xl space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-800 text-sm">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Kebijakan Kerja WFH:</strong> Jam kerja WFH normal adalah pukul <strong>08:00 s/d 17:00 WIB</strong> dengan batas toleransi kehadiran <strong>15 menit</strong> (maksimal check-in pukul 08:15:00 WIB). Karyawan yang melakukan check-in melewati batas ini otomatis tercatat sebagai <strong>Terlambat</strong>.
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Memuat konfigurasi jadwal kerja...</div>
          ) : !schedules || schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Belum ada jadwal kerja terdaftar.</div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">{schedule.name}</h3>
                    {schedule.isDefault && (
                      <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Jadwal Utama
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Kode Jadwal: {schedule.code}</p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Jam Masuk: <strong className="font-mono text-slate-800">{schedule.workStartTime} WIB</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Jam Pulang: <strong className="font-mono text-slate-800">{schedule.workEndTime} WIB</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800">
                      <span>Toleransi: <strong className="font-mono text-amber-900">{schedule.lateToleranceMinutes} Menit</strong></span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEdit(schedule)}
                  className="self-start sm:self-auto"
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Ubah Jadwal
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Schedule Modal */}
      <Modal
        isOpen={!!editingSchedule}
        onClose={() => setEditingSchedule(null)}
        title="Ubah Konfigurasi Jadwal Kerja"
        description="Perubahan jam kerja akan berdampak pada kalkulasi keterlambatan presensi baru."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          <FormField label="Nama Jadwal" error={errors.name?.message} required>
            <Input {...register('name')} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Jam Masuk Kerja (WIB)"
              error={errors.workStartTime?.message}
              hint="Format: 08:00:00"
              required
            >
              <Input placeholder="08:00:00" {...register('workStartTime')} />
            </FormField>

            <FormField
              label="Jam Pulang Kerja (WIB)"
              error={errors.workEndTime?.message}
              hint="Format: 17:00:00"
              required
            >
              <Input placeholder="17:00:00" {...register('workEndTime')} />
            </FormField>
          </div>

          <FormField
            label="Toleransi Keterlambatan (Menit)"
            error={errors.lateToleranceMinutes?.message}
            hint="Check-in melewati (Jam Masuk + Toleransi) akan dianggap terlambat"
            required
          >
            <Input
              type="number"
              min={0}
              max={120}
              {...register('lateToleranceMinutes')}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingSchedule(null)}
              disabled={updateMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMutation.isPending}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardTemplate>
  );
};
