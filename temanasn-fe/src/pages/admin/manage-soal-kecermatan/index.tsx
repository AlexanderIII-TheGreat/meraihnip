import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, Popconfirm } from 'tdesign-react';
import ManageKecermatan from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageSoalKecermatan() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});

  const getData = useGetList({
    url: 'admin/kategori-soal-kecermatan/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/kategori-soal-kecermatan/remove/${id}`)).then(
      () => {
        getData.refresh();
      }
    );
  };

  const columns = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 * getData.params.skip + 1}</span>;
      },
    },

    {
      title: 'Judul Kategori',
      colKey: 'judul_kategori',

      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Judul' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => {
        return (
          <Link
            to={`/manage-soal-kecermatan/${row.id}`}
            className="text-gray-900 hover:text-indigo-800 hover:underline"
          >
            {row.judul_kategori}
          </Link>
        );
      },
    },

    {
      title: 'Keterangan',
      colKey: 'keterangan',
      width: 250,
      align: AlignType.Left,
      cell: ({ row }: any) => {
        return <span className="line-clamp-2">{row.keterangan || '-'}</span>;
      },
    },

    {
      colKey: 'kiasan_count',
      title: 'Jumlah Kiasan',
      width: 120,
      align: AlignType.Center,

      cell: ({ row }: any) => {
        return <span>{row?._count?.Kiasan || 0}</span>;
      },
    },
    {
      title: 'Tanggal Dibuat',
      colKey: 'createdAt',
      width: 150,
      align: AlignType.Center,
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Action',
      align: AlignType.Center,
      width: 180,
      colKey: 'action',
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center gap-5">
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setVisible(true);
                setDetail(() => ({
                  ...row,
                }));
              }}
            >
              <IconPencil size={14} />
            </Button>
            {/* 
            // TODO: Navigate to Sub-Manage (Kiasan) if needed later
            <Popup content="Manage Kiasan" trigger="hover">
              <Button
                shape="circle"
                theme="default"
                onClick={() => {
                  navigate(`/manage-kecermatan/${row.id}/kiasan`);
                }}
              >
                <IconApps size={14} />
              </Button>
            </Popup> 
            */}
            <Popconfirm
              content="Apakah kamu yakin ?"
              theme="danger"
              onConfirm={() => handleDeleted(row.id)}
            >
              <Button shape="circle" theme="danger">
                <IconTrash size={14} />
              </Button>{' '}
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  return (
    <section className="">
      {visible && (
        <ManageKecermatan
          setDetail={setDetail}
          params={getData}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[{ name: 'Bank Soal Kecermatan', link: '/manage-soal-kecermatan' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Soal Kecermatan
            </h1>
            <Button
              theme="default"
              size="large"
              className="border-success hover:bg-success hover:text-white group"
              onClick={() => setVisible(true)}
            >
              <IconPlus
                size={20}
                className="text-success group-hover:text-white"
              />
            </Button>
          </div>
        </div>
        <TableWrapper data={getData} columns={columns} />
      </div>
    </section>
  );
}
