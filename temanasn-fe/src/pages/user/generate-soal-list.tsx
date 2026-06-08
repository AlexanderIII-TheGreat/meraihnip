import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconChartInfographic,
  IconEyeShare,
  IconPencil,
} from '@tabler/icons-react';
import { Button, Popup, Tag } from 'tdesign-react';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import moment from 'moment/min/moment-with-locales';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function GenerateSoalList() {
  const navigate = useNavigate();
  const listHistory = useGetList({
    url: 'user/generate-soal-history/history',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const columns = [
    {
      title: '#',
      colKey: 'position',
      width: 80,
      cell: ({ rowIndex }: any) => (
        <div>{rowIndex + 1 * listHistory.params.skip + 1}</div>
      ),
    },
    {
      title: 'Nama Latihan',
      colKey: 'name',
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md font-bold">{row.name}</p>
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
          {row.tingkatKesulitan.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Jumlah Soal',
      colKey: 'jumlahSoal',
      width: 120,
      align: AlignType.Center,
    },
    {
      title: 'Waktu',
      colKey: 'waktu',
      width: 120,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>{row.waktu} Menit</div>
      ),
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
      width: 150,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div className="flex gap-2 justify-center">
            <Popup content="Lihat Statistik" trigger="hover">
              <Button
                variant="dashed"
                theme="success"
                icon={<IconChartInfographic className="mr-1" size={16} />}
                onClick={() => {
                  alert('Fitur Statistik untuk Generate Soal akan segera hadir');
                }}
              >
                Statistik
              </Button>
            </Popup>
            <Popup content="Lihat Pembahasan" trigger="hover">
              <Button
                variant="dashed"
                theme="primary"
                icon={<IconEyeShare className="mr-1" size={16} />}
                onClick={() => {
                   navigate(`/generate-soal/pembahasan/${row.id}`);
                }}
              >
                Pembahasan
              </Button>
            </Popup>
            <Popup content="Kerjakan Soal" trigger="hover">
              <Button
                variant="dashed"
                theme="danger"
                icon={<IconPencil className="mr-1" size={16} />}
                onClick={() => {
                   navigate(`/generate-soal/kerjakan/${row.id}`);
                }}
              >
                Kerjakan
              </Button>
            </Popup>
        </div>
      ),
    },
  ];

  return (
    <section className="">
      <BreadCrumb
        page={[
          { name: 'Generate Soal', link: '/generate-soal' },
          { name: 'Daftar Soal', link: '/generate-soal/list' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mt-2">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
              Riwayat Generate Soal
            </h1>
            <Button onClick={() => navigate('/generate-soal')}>
                Buat Latihan Baru
            </Button>
          </div>
        </div>
        <TableWrapper data={listHistory} columns={columns} />
      </div>
    </section>
  );
}
