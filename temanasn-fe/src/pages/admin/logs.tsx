import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import BreadCrumb from '@/components/breadcrumb';
import moment from 'moment';
import { Button, Input, Select, Popconfirm, MessagePlugin } from 'tdesign-react';
import { deleteData } from '@/utils/axios';

export default function Logs() {
  const dataLogs = useGetList({
    url: 'user-activity/audit',
    initialParams: {
      skip: 0,
      take: 20,
    },
  });

  const handleClearLogs = async () => {
    const res: any = await deleteData('user-activity/clear?userId=all');
    if (res && !res.error) {
      MessagePlugin.success('Semua log berhasil dihapus');
      dataLogs.refresh();
    } else {
      MessagePlugin.error(res.message || 'Gagal menghapus log');
    }
  };

  const columns = [
    {
      colKey: 'index',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 + 1 * dataLogs.params.skip}</span>;
      },
    },
    {
      title: 'Tanggal & Waktu',
      colKey: 'last_activity',
      cell: ({ row }: any) => {
        const date = moment(row.last_activity);
        return <span>{date.isValid() ? date.format('DD/MM/YYYY HH:mm:ss') : '-'}</span>;
      },
    },
    {
      title: 'User',
      colKey: 'name',
      cell: ({ row }: any) => {
        return (
          <div>
            <div className="font-medium text-gray-800">{row.name || '-'}</div>
            <div className="text-xs text-gray-500">{row.email || 'Guest'}</div>
          </div>
        );
      },
    },
    {
      title: 'Aktivitas',
      colKey: 'action',
      cell: ({ row }: any) => {
        if (row.action === 'LOGIN') {
          return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">LOGIN</span>;
        } else if (row.action === 'LOGOUT') {
          return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">LOGOUT</span>;
        } else if (row.action === 'CREATE_LATIHAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">CREATE LATIHAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'EDIT_LATIHAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">EDIT LATIHAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'DELETE_LATIHAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full w-fit">DELETE LATIHAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'CREATE_PAKET_PEMBELIAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">CREATE PAKET PEMBELIAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'EDIT_PAKET_PEMBELIAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">EDIT PAKET PEMBELIAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'DELETE_PAKET_PEMBELIAN') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full w-fit">DELETE PAKET PEMBELIAN</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'CREATE_SOAL_CATEGORY') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">CREATE KATEGORI SOAL</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'EDIT_SOAL_CATEGORY') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">EDIT KATEGORI SOAL</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'DELETE_SOAL_CATEGORY') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full w-fit">DELETE KATEGORI SOAL</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'CREATE_USER') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">CREATE USER</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'EDIT_USER') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">EDIT USER</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'DELETE_USER') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full w-fit">DELETE USER</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'UPDATE_PEMBELIAN_STATUS') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">APPROVE BAYAR</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'CHANGE_PASSWORD') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full w-fit">UBAH PASSWORD</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'BUY_PAKET') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">BELI PAKET</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'START_TRYOUT') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">MULAI TRYOUT</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else if (row.action === 'FINISH_TRYOUT') {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full w-fit">SELESAI TRYOUT</span>
              <span className="text-xs text-gray-600">{row.url || '-'}</span>
            </div>
          );
        } else {
          return (
            <span className="text-sm font-mono bg-gray-100 p-1 rounded text-gray-700">
              {row.url || 'ACCESS'}
            </span>
          );
        }
      },
    },
  ];

  return (
    <section className="">
      <BreadCrumb page={[{ name: 'Logs', link: '/logs' }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between items-center">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              User Activity Logs
            </h1>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 mt-4 mb-6 w-full justify-between">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <Input
              placeholder="Cari user, email, atau aktivitas..."
              onChange={(val) => {
                dataLogs.setParams((prev: any) => ({ ...prev, search: val, skip: 0 }));
              }}
              style={{ width: 300 }}
              clearable
            />
            <Select
              options={[
                { label: 'Terbaru', value: 'true' },
                { label: 'Terlama', value: 'false' },
              ]}
              onChange={(val) => {
                dataLogs.setParams((prev: any) => ({ ...prev, descending: val, skip: 0 }));
              }}
              defaultValue="true"
              style={{ width: 140 }}
            />
          </div>
          <Popconfirm
            content="Apakah Anda yakin ingin menghapus semua log? Tindakan ini tidak dapat dibatalkan."
            onConfirm={handleClearLogs}
            theme="danger"
          >
            <Button theme="danger">Clear All Logs</Button>
          </Popconfirm>
        </div>
        <TableWrapper data={dataLogs} columns={columns} />
      </div>
    </section>
  );
}
