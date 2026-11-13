import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { DataTable, type Column } from '../components/organisms/DataTable';
import { Modal } from '../components/organisms/Modal';
import { ConfirmDialog } from '../components/organisms/ConfirmDialog';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Badge } from '../components/atoms/Badge';
import { FormField } from '../components/molecules/FormField';
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '../hooks/useEmployees';
import type { Employee } from '../types/employee.types';
import { Role } from '../types/auth.types';

// Validation Schema for Add/Edit Employee
const employeeSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.nativeEnum(Role),
  position: z.string().optional(),
  department: z.string().optional(),
  workStartTime: z.string().optional(),
  workEndTime: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const EmployeesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const pageSize = 10;

  const { data, isLoading } = useEmployees({ page, limit: pageSize, search });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const formatTimeForDb = (t?: string, defaultVal = '08:00:00') => {
    if (!t) return defaultVal;
    return t.length === 5 ? `${t}:00` : t;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: Role.EMPLOYEE,
      position: '',
      department: '',
      workStartTime: '08:00',
      workEndTime: '17:00',
    },
  });

  const handleOpenAdd = () => {
    reset({
      fullName: '',
      email: '',
      password: '',
      role: Role.EMPLOYEE,
      position: '',
      department: '',
      workStartTime: '08:00',
      workEndTime: '17:00',
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    reset({
      fullName: emp.fullName,
      email: emp.email,
      password: '',
      role: emp.role,
      position: emp.position || '',
      department: emp.department || '',
      workStartTime: emp.workStartTime ? emp.workStartTime.substring(0, 5) : '08:00',
      workEndTime: emp.workEndTime ? emp.workEndTime.substring(0, 5) : '17:00',
    });
  };

  const onSubmitAdd = async (values: EmployeeFormValues) => {
    await createMutation.mutateAsync({
      fullName: values.fullName,
      email: values.email,
      password: values.password || 'WFH#2026',
      role: values.role,
      position: values.position || undefined,
      department: values.department || undefined,
      workStartTime: formatTimeForDb(values.workStartTime, '08:00:00'),
      workEndTime: formatTimeForDb(values.workEndTime, '17:00:00'),
    });
    setIsAddOpen(false);
  };

  const onSubmitEdit = async (values: EmployeeFormValues) => {
    if (!editingEmployee) return;
    await updateMutation.mutateAsync({
      id: editingEmployee.id,
      data: {
        fullName: values.fullName,
        email: values.email,
        password: values.password || undefined,
        role: values.role,
        position: values.position || undefined,
        department: values.department || undefined,
        workStartTime: formatTimeForDb(values.workStartTime, '08:00:00'),
        workEndTime: formatTimeForDb(values.workEndTime, '17:00:00'),
      },
    });
    setEditingEmployee(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const columns: Column<Employee>[] = [
    {
      key: 'employeeCode',
      header: 'Kode Karyawan',
      render: (row) => (
        <span className="font-mono font-semibold text-slate-800 text-xs bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Nama Lengkap',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.fullName}</span>
          <span className="text-xs text-slate-500 block">{row.email}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Departemen / Posisi',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-700 block text-xs">
            {row.department || '-'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {row.position || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'workSchedule',
      header: 'Jam Kerja',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 inline-block whitespace-nowrap">
          {row.workStartTime?.substring(0, 5) || '08:00'} - {row.workEndTime?.substring(0, 5) || '17:00'} WIB
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role Akses',
      render: (row) => (
        <Badge variant={row.role === Role.ADMIN ? 'blue' : 'slate'}>
          {row.role === Role.ADMIN ? 'HR Admin' : 'Karyawan'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            aria-label="Edit"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ubah</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeletingId(row.id)}
            aria-label="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardTemplate
      title="Master Data Karyawan"
      description="Kelola seluruh akun dan profil karyawan yang berhak mengakses sistem absensi WFH."
      actions={
        <Button variant="primary" onClick={handleOpenAdd}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Karyawan
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Cari berdasarkan nama, kode karyawan, atau email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput);
                  setPage(1);
                }
              }}
              className="pl-9"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch(searchInput);
              setPage(1);
            }}
            className="w-full sm:w-auto"
          >
            Cari
          </Button>
          {search && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setPage(1);
              }}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Tidak ada data karyawan yang sesuai kriteria pencarian."
          pagination={
            data
              ? {
                  currentPage: page,
                  totalPages: data.totalPages,
                  totalItems: data.total,
                  pageSize,
                  onPageChange: (newPage) => setPage(newPage),
                }
              : undefined
          }
        />
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Karyawan Baru"
        description="Lengkapi formulir di bawah ini untuk mendaftarkan akun karyawan."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitAdd)} className="space-y-4">
          <FormField label="Nama Lengkap" error={errors.fullName?.message} required>
            <Input placeholder="Contoh: Budi Santoso" {...register('fullName')} />
          </FormField>

          <FormField label="Alamat Email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="budi@company.com"
              {...register('email')}
            />
          </FormField>

          <FormField
            label="Kata Sandi Awal"
            error={errors.password?.message}
            hint="Kosongkan jika ingin menggunakan password default: WFH#2026"
          >
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              {...register('password')}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Departemen" error={errors.department?.message}>
              <Input placeholder="Contoh: Information Technology" {...register('department')} />
            </FormField>

            <FormField label="Jabatan / Posisi" error={errors.position?.message}>
              <Input placeholder="Contoh: Frontend Developer" {...register('position')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Jam Masuk Kerja"
              error={errors.workStartTime?.message}
              hint="Format 24 jam (standar: 08:00)"
              required
            >
              <Input type="time" {...register('workStartTime')} />
            </FormField>

            <FormField
              label="Jam Absen Keluar"
              error={errors.workEndTime?.message}
              hint="Format 24 jam (standar: 17:00)"
              required
            >
              <Input type="time" {...register('workEndTime')} />
            </FormField>
          </div>

          <FormField label="Hak Akses (Role)" error={errors.role?.message} required>
            <Select {...register('role')}>
              <option value={Role.EMPLOYEE}>Karyawan (Absensi WFH)</option>
              <option value={Role.ADMIN}>HR Admin (Kelola Karyawan & Monitoring)</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={createMutation.isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
            >
              Simpan Data
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Ubah Data Karyawan"
        description={`Mengedit data akun ${editingEmployee?.fullName} (${editingEmployee?.employeeCode})`}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmitEdit)} className="space-y-4">
          <FormField label="Nama Lengkap" error={errors.fullName?.message} required>
            <Input {...register('fullName')} />
          </FormField>

          <FormField label="Alamat Email" error={errors.email?.message} required>
            <Input type="email" {...register('email')} />
          </FormField>

          <FormField
            label="Ganti Kata Sandi (Opsional)"
            error={errors.password?.message}
            hint="Biarkan kosong jika tidak ingin mengubah password karyawan"
          >
            <Input
              type="password"
              placeholder="Masukkan password baru jika ingin diganti"
              {...register('password')}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Departemen" error={errors.department?.message}>
              <Input {...register('department')} />
            </FormField>

            <FormField label="Jabatan / Posisi" error={errors.position?.message}>
              <Input {...register('position')} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Jam Masuk Kerja"
              error={errors.workStartTime?.message}
              hint="Format 24 jam (standar: 08:00)"
              required
            >
              <Input type="time" {...register('workStartTime')} />
            </FormField>

            <FormField
              label="Jam Absen Keluar"
              error={errors.workEndTime?.message}
              hint="Format 24 jam (standar: 17:00)"
              required
            >
              <Input type="time" {...register('workEndTime')} />
            </FormField>
          </div>

          <FormField label="Hak Akses (Role)" error={errors.role?.message} required>
            <Select {...register('role')}>
              <option value={Role.EMPLOYEE}>Karyawan (Absensi WFH)</option>
              <option value={Role.ADMIN}>HR Admin (Kelola Karyawan & Monitoring)</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingEmployee(null)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Hapus / Nonaktifkan Karyawan"
        message="Apakah Anda yakin ingin menonaktifkan akun karyawan ini? Data absensi yang telah tercatat sebelumnya tetap akan tersimpan secara aman."
        confirmText="Ya, Hapus Karyawan"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </DashboardTemplate>
  );
};
