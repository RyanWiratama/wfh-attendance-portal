import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Eye, Calendar } from 'lucide-react';
import { DashboardTemplate } from '../components/templates/DashboardTemplate';
import { DataTable, type Column } from '../components/organisms/DataTable';
import { ImageLightbox } from '../components/organisms/ImageLightbox';
import { AttendanceStatusBadge } from '../components/molecules/AttendanceStatusBadge';
import { LateBadge } from '../components/molecules/LateBadge';
import { useMyAttendanceHistory } from '../hooks/useAttendance';
import type { AttendanceRecord } from '../types/attendance.types';
import { useAuth } from '../contexts/AuthContext';

export const AttendanceHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useMyAttendanceHistory({ page, limit: pageSize });

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxTime, setLightboxTime] = useState<string>('');

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'workDate',
      header: 'Tanggal',
      render: (row) => (
        <div className="flex items-center gap-2 font-medium text-slate-800">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{dayjs(row.workDate).format('DD MMM YYYY')}</span>
        </div>
      ),
    },
    {
      key: 'checkInTime',
      header: 'Check-In',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold text-slate-700 block">
            {row.checkInTime ? dayjs(row.checkInTime).format('HH:mm:ss') + ' WIB' : '-'}
          </span>
          {row.checkInPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkInPhotoPath}`);
                setLightboxTitle('Bukti Foto Check-In');
                setLightboxTime(dayjs(row.checkInTime).format('DD MMM YYYY HH:mm:ss'));
              }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              <Eye className="w-3 h-3" />
              <span>Lihat Foto</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'checkOutTime',
      header: 'Check-Out',
      render: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold text-slate-700 block">
            {row.checkOutTime ? dayjs(row.checkOutTime).format('HH:mm:ss') + ' WIB' : '-'}
          </span>
          {row.checkOutPhotoPath && (
            <button
              type="button"
              onClick={() => {
                setLightboxUrl(`/api/attendances/photos/${row.checkOutPhotoPath}`);
                setLightboxTitle('Bukti Foto Check-Out');
                setLightboxTime(dayjs(row.checkOutTime).format('DD MMM YYYY HH:mm:ss'));
              }}
              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
            >
              <Eye className="w-3 h-3" />
              <span>Lihat Foto</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Kehadiran',
      render: (row) => <AttendanceStatusBadge status={row.status} />,
    },
    {
      key: 'isLate',
      header: 'Keterlambatan',
      render: (row) => (
        <LateBadge isLate={row.isLate} lateMinutes={row.lateMinutes} />
      ),
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (row) => (
        <div className="text-xs text-slate-500 max-w-xs truncate">
          {row.checkInNotes || row.checkOutNotes || '-'}
        </div>
      ),
    },
  ];

  return (
    <DashboardTemplate
      title="Riwayat Presensi Saya"
      description="Daftar catatan kehadiran WFH harian Anda beserta bukti foto dan status keterlambatan."
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
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
