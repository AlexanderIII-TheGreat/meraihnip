import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, Popconfirm } from 'tdesign-react';
import ManageTestimoniModal from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';
import BreadCrumb from '@/components/breadcrumb';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageTestimoni() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});

  const getList = useGetList({
    url: 'testimoni/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`testimoni/remove/${id}`)).then(() => {
      getList.refresh();
    });
  };

  const columns = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 * getList.params.skip + 1}</span>;
      },
    },

    {
      title: 'Nama',
      colKey: 'nama',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Cari Nama' },
        showConfirmAndReset: true,
      },
    },
    {
        title: 'Pekerjaan',
        colKey: 'pekerjaan',
        width: 150,
    },
    {
      colKey: 'rating',
      title: 'Rating',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
            <div className="flex justify-center items-center text-yellow-500 gap-1">
                <span>{row.rating}</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
            </div>
        );
      },
    },
    {
      title: 'Isi Testimoni',
      colKey: 'isi',
      width: 300,
      cell: ({ row }: any) => {
        return (
            <span title={row.isi} className="line-clamp-2">
                {row.isi}
            </span>
        );
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
      width: 150,
      colKey: 'action',
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setDetail(() => ({
                  ...row,
                }));
                setVisible(true);
              }}
            >
              <IconPencil size={18} />
            </Button>
            <Popconfirm
              content="Apakah kamu yakin ingin menghapus testimoni ini?"
              theme="danger"
              onConfirm={() => handleDeleted(row.id)}
            >
              <Button shape="circle" theme="danger">
                <IconTrash size={18} />
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
        <ManageTestimoniModal
          setDetail={setDetail}
          params={getList}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Manage Testimoni', link: '#' },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mb-5">
          <div className="title border-b border-[#ddd] w-full flex justify-between items-center pb-4">
            <h1 className="text-2xl text-indigo-950 font-bold">
              Manage Testimoni
            </h1>
            <Button
              theme="primary"
              size="large"
              className="flex items-center gap-2"
              onClick={() => {
                  setDetail({});
                  setVisible(true);
              }}
            >
              <IconPlus size={20} />
              <span>Tambah Testimoni</span>
            </Button>
          </div>
        </div>
        <TableWrapper data={getList} columns={columns} />
      </div>
    </section>
  );
}
