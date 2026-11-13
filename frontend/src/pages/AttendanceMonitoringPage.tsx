import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
} from 'lucide-react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { DataTable, type Column } from '../components/organisms/DataTable';
import { ImageLightbox } from '../components/organisms/ImageLightbox';
import { StatCard } from '../components/molecules/StatCard';
import { AttendanceStatusBadge } from '../components/molecules/AttendanceStatusBadge';
import { LateBadge } from '../components/molecules/LateBadge';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';
import { Button } from '../components/atoms/Button';
import { useAttendanceMonitoring } from '../hooks/useAttendance';
import type { AttendanceRecord } from '../types/attendance.types';

export const AttendanceMonitoringPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter States
  const [startDate, setStartDate] = useState(
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  );
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useAttendanceMonitoring({
    page,
    limit: pageSize,
    startDate,
    endDate,
    search,
    status: statusFilter,
  });

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxEmployee, setLightboxEmployee] = useState<string>('');
  const [lightboxTime, setLightboxTime] = useState<string>('');

  // Compute metrics from current data
  const totalCount = data?.total || 0;
  const onTimeCount =
    data?.items?.filter((item) => !item.isLate && item.checkInTime).length || 0;
  const lateCount = data?.items?.filter((item) => item.isLate).length || 0;

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'employee',
      header: 'Karyawan',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">
            {row.employee?.fullName || `ID: ${row.employeeId}`}
          </span>
          <span className="font-mono text-xs text-slate-500 block">
            {row.employee?.employeeCode || '-'} &bull; {row.employee?.department || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'workDate',
      header: 'Tanggal',
      render: (row) => (
        <span className="font-medium text-slate-700 text-xs">
          {dayjs(row.workDate).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check-In (Pagi)',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold text-slate-800 block">
            {row.checkInTime ? dayjs(row.checkInTime).format('HH:mm:ss') + ' WIB' : '-'}
          </span>
          {row.checkInPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkInPhotoPath}`);
                setLightboxTitle('Bukti Foto Check-In WFH');
                setLightboxEmployee(row.employee?.fullName || '');
                setLightboxTime(dayjs(row.checkInTime).format('DD MMM YYYY HH:mm:ss'));
              }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              <Eye className="w-3 h-3" />
              <span>Bukti Foto</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check-Out (Sore)',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold text-slate-800 block">
            {row.checkOutTime ? dayjs(row.checkOutTime).format('HH:mm:ss') + ' WIB' : '-'}
          </span>
          {row.checkOutPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkOutPhotoPath}`);
                setLightboxTitle('Bukti Foto Check-Out WFH');
                setLightboxEmployee(row.employee?.fullName || '');
                setLightboxTime(dayjs(row.checkOutTime).format('DD MMM YYYY HH:mm:ss'));
              }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              <Eye className="w-3 h-3" />
              <span>Bukti Foto</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'isLate',
      header: 'Keterlambatan',
      render: (row) => (
        <LateBadge isLate={row.isLate} lateMinutes={row.lateMinutes} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <AttendanceStatusBadge status={row.status} />,
    },
    {
      key: 'notes',
      header: 'Catatan Kerja',
      render: (row) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block" title={row.checkInNotes || row.checkOutNotes || ''}>
          {row.checkInNotes || row.checkOutNotes || '-'}
        </span>
      ),
    },
  ];

  return (
    <DashboardTemplate
      title="Monitoring Presensi Karyawan (HRD)"
      description="Pantau dan kontrol rekaman kehadiran WFH seluruh karyawan secara view-only dengan verifikasi foto dan status keterlambatan."
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Presensi Terdata"
            value={totalCount}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            description="Berdasarkan filter tanggal aktif"
          />
          <StatCard
            title="Tepat Waktu (Halaman Ini)"
            value={onTimeCount}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            description="Check-in sebelum batas 08:15 WIB"
          />
          <StatCard
            title="Terlambat (Halaman Ini)"
            value={lateCount}
            icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
            description="Check-in melewati jam 08:15 WIB"
          />
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 pb-2 border-b border-slate-100 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filter Presensi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cari Karyawan
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Nama atau kode..."
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status Kehadiran
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Semua Status</option>
                <option value="PRESENT">Hadir</option>
                <option value="LATE">Terlambat</option>
                <option value="ABSENT">Tidak Hadir</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
            >
              Terapkan Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
                setEndDate(dayjs().format('YYYY-MM-DD'));
                setSearchInput('');
                setSearch('');
                setStatusFilter('');
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Tidak ada catatan presensi pada rentang tanggal ini."
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

      {/* Lightbox for zooming photos */}
      <ImageLightbox
        isOpen={!!lightboxUrl}
        imageUrl={lightboxUrl}
        title={lightboxTitle}
        employeeName={lightboxEmployee}
        timestamp={lightboxTime}
        onClose={() => setLightboxUrl(null)}
      />
    </DashboardTemplate>
  );
};
