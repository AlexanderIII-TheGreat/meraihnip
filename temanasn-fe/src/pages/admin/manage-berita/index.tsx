import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, ImageViewer, Popconfirm } from 'tdesign-react';
import ManageBeritaModal from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';
import BreadCrumb from '@/components/breadcrumb';
import { imageLink } from '@/utils/image-link';
import createTrigger from '@/utils/create-trigger';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageBerita() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});

  const getList = useGetList({
    url: 'berita/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`berita/remove/${id}`)).then(() => {
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
      title: 'Gambar',
      colKey: 'gambar',
      width: 120,
      cell: ({ row }: any) => {
        const trigger = createTrigger(row.gambar);
        return (
          <ImageViewer trigger={trigger} images={[imageLink(row.gambar)]} />
        );
      },
    },
    {
      title: 'Judul Berita',
      colKey: 'judul',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Cari Judul' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => {
        return (
          <span title={row.judul} className="font-bold text-indigo-950 line-clamp-2">
            {row.judul}
          </span>
        );
      },
    },
    {
      title: 'Isi Berita',
      colKey: 'isi',
      cell: ({ row }: any) => {
        return (
          <span title={row.isi} className="line-clamp-2 text-gray-500">
            {row.isi?.replace(/<[^>]*>/g, '') || ''}
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
              content="Apakah kamu yakin ingin menghapus berita ini?"
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
        <ManageBeritaModal
          setDetail={setDetail}
          params={getList}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Manage Berita', link: '#' },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mb-5">
          <div className="title border-b border-[#ddd] w-full flex justify-between items-center pb-4">
            <h1 className="text-2xl text-indigo-950 font-bold">
              Manage Berita & Update
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
              <span>Tambah Berita</span>
            </Button>
          </div>
        </div>
        <TableWrapper data={getList} columns={columns} />
      </div>
    </section>
  );
}
