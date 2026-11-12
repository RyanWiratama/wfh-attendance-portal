import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  AttendanceRecord,
  TodayAttendance,
  WorkSchedule,
} from '../types/attendance.types';
import type { PaginatedResult } from '../types/employee.types';
import { useToast } from '../contexts/ToastContext';

export function useTodayAttendance() {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const res = await apiClient.get<TodayAttendance>('/attendances/today');
      return res.data;
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ photo, notes }: { photo: File; notes?: string }) => {
      const formData = new FormData();
      formData.append('photo', photo);
      if (notes) formData.append('notes', notes);

      const res = await apiClient.post<AttendanceRecord>(
        '/attendances/check-in',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      if (data.isLate) {
        addToast(
          `Check-in berhasil! Anda tercatat terlambat ${data.lateMinutes} menit.`,
          'info',
        );
      } else {
        addToast('Check-in WFH berhasil tepat waktu! Selamat bekerja.', 'success');
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal melakukan check-in.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ photo, notes }: { photo: File; notes?: string }) => {
      const formData = new FormData();
      formData.append('photo', photo);
      if (notes) formData.append('notes', notes);

      const res = await apiClient.post<AttendanceRecord>(
        '/attendances/check-out',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      addToast('Check-out WFH berhasil! Terima kasih atas dedikasi Anda hari ini.', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal melakukan check-out.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}

export function useMyAttendanceHistory(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['attendance', 'my-history', page, limit],
    queryFn: async () => {
      const res = await apiClient.get<any>(
        `/attendances/my-history?page=${page}&limit=${limit}`,
      );
      const data = res.data;
      if (data.items) {
        return data as PaginatedResult<AttendanceRecord>;
      }
      return {
        items: data.data || [],
        total: data.meta?.total ?? data.total ?? 0,
        page: data.meta?.page ?? page,
        pageSize: data.meta?.limit ?? limit,
        totalPages:
          data.meta?.totalPages ?? (Math.ceil((data.meta?.total ?? 0) / limit) || 1),
      } as PaginatedResult<AttendanceRecord>;
    },
  });
}

interface MonitoringParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  status?: string;
}

export function useAttendanceMonitoring(params: MonitoringParams = {}) {
  const {
    page = 1,
    limit = 10,
    startDate = '',
    endDate = '',
    search = '',
    status = '',
  } = params;

  return useQuery({
    queryKey: ['attendance', 'monitoring', page, limit, startDate, endDate, search, status],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('limit', limit.toString());
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      if (search) query.append('search', search);
      if (status) query.append('status', status);

      const res = await apiClient.get<any>(`/attendances/monitoring?${query.toString()}`);
      const data = res.data;
      if (data.items) {
        return data as PaginatedResult<AttendanceRecord>;
      }
      return {
        items: data.data || [],
        total: data.meta?.total ?? data.total ?? 0,
        page: data.meta?.page ?? page,
        pageSize: data.meta?.limit ?? limit,
        totalPages:
          data.meta?.totalPages ?? (Math.ceil((data.meta?.total ?? 0) / limit) || 1),
      } as PaginatedResult<AttendanceRecord>;
    },
  });
}

export function useWorkSchedule() {
  return useQuery({
    queryKey: ['attendance', 'work-schedule'],
    queryFn: async () => {
      const res = await apiClient.get<WorkSchedule[]>('/attendances/schedules');
      return res.data;
    },
  });
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<WorkSchedule>;
    }) => {
      const res = await apiClient.patch<WorkSchedule>(
        `/attendances/schedules/${id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'work-schedule'] });
      addToast('Jadwal kerja berhasil diperbarui!', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal memperbarui jadwal kerja.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}
