import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconTrash,
  IconChartInfographic,
  IconEyeShare,
} from '@tabler/icons-react';
import { Button, Popup, Tag, Popconfirm } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import moment from 'moment/min/moment-with-locales';
import { deleteData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageSoalGenerateHistory() {
  const navigate = useNavigate();
  const listHistory = useGetList({
    url: 'admin/generate-soal-history',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDelete = async (id: number) => {
    FetchAPI(deleteData(`admin/generate-soal-history/${id}`)).then(() => {
      listHistory.refresh();
    });
  };

  const columns = [
    {
      title: '#',
      colKey: 'position',
      width: 60,
      cell: ({ rowIndex }: any) => (
        <div>{rowIndex + (listHistory.params.skip || 0) + 1}</div>
      ),
    },
    {
      title: 'User',
      colKey: 'user.name',
      width: 200,
      cell: ({ row }: any) => (
        <div>
          <p className="text-sm font-bold">{row.user?.name || '-'}</p>
          <p className="text-xs text-gray-500">{row.user?.email || '-'}</p>
        </div>
      ),
    },
    {
      title: 'Nama Latihan',
      colKey: 'name',
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-sm font-bold">{row.name}</p>
          <p className="text-xs text-gray-500">
            {moment(row.createdAt).format('LL HH:mm')}
          </p>
        </div>
      ),
    },
    {
      title: 'Kategori',
      colKey: 'kategori',
      width: 150,
    },
    {
      title: 'Kesulitan',
      colKey: 'tingkatKesulitan',
      width: 120,
      cell: ({ row }: any) => (
        <Tag theme={row.tingkatKesulitan === 'sulit' ? 'danger' : row.tingkatKesulitan === 'sedang' ? 'warning' : 'success'} variant="light">
          {(row.tingkatKesulitan || '').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Jumlah',
      colKey: 'jumlahSoal',
      width: 100,
      align: AlignType.Center,
    },
    {
      title: 'Score',
      colKey: 'score',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <span className="font-bold">{row.score}</span>
      ),
    },
    {
      title: 'Aksi',
      colKey: 'action',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div className="flex gap-2 justify-center">
            <Popup content="Lihat Statistik" trigger="hover">
              <Button
                variant="dashed"
                theme="success"
                icon={<IconChartInfographic size={16} />}
                onClick={() => navigate(`/generate-soal/statistik/${row.id}`)}
              />
            </Popup>
            <Popup content="Lihat Pembahasan" trigger="hover">
              <Button
                variant="dashed"
                theme="primary"
                icon={<IconEyeShare size={16} />}
                onClick={() => navigate(`/generate-soal/pembahasan/${row.id}`)}
              />
            </Popup>
             <Popconfirm
                content="Apakah Anda yakin ingin menghapus riwayat ini?"
                destroyOnClose
                placement="top"
                showArrow
                theme="default"
                onConfirm={() => handleDelete(row.id)}
              >
                <Button
                  variant="dashed"
                  theme="danger"
                  shape="square"
                  icon={<IconTrash size={16} />}
                />
              </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <section className="">
      <BreadCrumb
        page={[
          { name: 'Admin', link: '/dashboard' },
          { name: 'Manage Generate Soal', link: '/manage-soal-generate' },
          { name: 'History', link: '#' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mt-2">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
              Manage Soal Generate History
            </h1>
          </div>
        </div>
        <TableWrapper data={listHistory} columns={columns} />
      </div>
    </section>
  );
}
