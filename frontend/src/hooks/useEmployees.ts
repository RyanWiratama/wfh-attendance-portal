import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, PaginatedResult } from '../types/employee.types';
import { useToast } from '../contexts/ToastContext';

interface FetchEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

export function useEmployees(params: FetchEmployeesParams = {}) {
  const { page = 1, limit = 10, search = '', department = '' } = params;

  return useQuery({
    queryKey: ['employees', page, limit, search, department],
    queryFn: async () => {
      const query = new URLSearchParams();
      query.append('page', page.toString());
      query.append('limit', limit.toString());
      if (search) query.append('search', search);
      if (department) query.append('department', department);

      const res = await apiClient.get<any>(`/employees?${query.toString()}`);
      // Accommodate both { items, total } and { data, meta } structures
      const data = res.data;
      if (data.items) {
        return data as PaginatedResult<Employee>;
      }
      return {
        items: data.data || [],
        total: data.meta?.total ?? data.total ?? 0,
        page: data.meta?.page ?? page,
        pageSize: data.meta?.limit ?? limit,
        totalPages:
          data.meta?.totalPages ?? (Math.ceil((data.meta?.total ?? 0) / limit) || 1),
      } as PaginatedResult<Employee>;
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateEmployeeInput) => {
      const res = await apiClient.post<Employee>('/employees', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      addToast('Data karyawan berhasil ditambahkan!', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal menambahkan karyawan.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateEmployeeInput }) => {
      const res = await apiClient.patch<Employee>(`/employees/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      addToast('Data karyawan berhasil diperbarui!', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal memperbarui karyawan.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      addToast('Karyawan berhasil dinonaktifkan/dihapus.', 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Gagal menghapus karyawan.';
      addToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    },
  });
}
