import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { DataTable, type Column } from '../components/organisms/DataTable';
import { ImageLightbox } from '../components/organisms/ImageLightbox';
import { LateBadge } from '../components/molecules/LateBadge';
import { useMyAttendanceHistory } from '../hooks/useAttendance';
import type { AttendanceRecord } from '../types/attendance.types';
import { useAuth } from '../contexts/AuthContext';

export const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useMyAttendanceHistory({ page, limit: pageSize });

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxTime, setLightboxTime] = useState<string>('');

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'workDate',
      header: 'Tanggal',
      render: (row) => (
        <span className="font-medium text-slate-800">
          {dayjs(row.workDate).format('DD MMM YYYY')}
        </span>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Check-In',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.checkInTime ? dayjs(row.checkInTime).format('HH:mm:ss') + ' WIB' : '-'}
        </span>
      ),
    },
    {
      key: 'checkOutTime',
      header: 'Check-Out',
      render: (row) => (
        <span className="font-mono text-xs text-slate-700">
          {row.checkOutTime ? dayjs(row.checkOutTime).format('HH:mm:ss') + ' WIB' : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (!row.checkInTime) {
          return <span className="text-xs text-slate-400">-</span>;
        }
        if (row.isLate) {
          return <LateBadge isLate={true} lateMinutes={row.lateMinutes} />;
        }
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tepat Waktu
          </span>
        );
      },
    },
    {
      key: 'photos',
      header: 'Foto Bukti',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.checkInPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkInPhotoPath}`);
                setLightboxTitle('Foto Check-In');
                setLightboxTime(dayjs(row.checkInTime).format('DD MMM YYYY HH:mm'));
              }}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
          {row.checkOutPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkOutPhotoPath}`);
                setLightboxTitle('Foto Check-Out');
                setLightboxTime(dayjs(row.checkOutTime).format('DD MMM YYYY HH:mm'));
              }}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pulang</span>
            </button>
          )}
          {!row.checkInPhotoPath && !row.checkOutPhotoPath && (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (row) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block">
          {row.checkInNotes || row.checkOutNotes || '-'}
        </span>
      ),
    },
  ];

  return (
    <DashboardTemplate
      title="Riwayat Presensi"
      description="Catatan kehadiran harian Anda beserta waktu, status, dan bukti foto."
    >
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="Belum ada riwayat absensi tercatat."
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

      <ImageLightbox
        isOpen={!!lightboxUrl}
        imageUrl={lightboxUrl}
        title={lightboxTitle}
        employeeName={user?.fullName}
        timestamp={lightboxTime}
        onClose={() => setLightboxUrl(null)}
      />
    </DashboardTemplate>
  );
};
