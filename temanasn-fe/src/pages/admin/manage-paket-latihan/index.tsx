import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconApps, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, ImageViewer, Popconfirm, Popup } from 'tdesign-react';
import ManageCategory from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import createTrigger from '@/utils/create-trigger';
import { imageLink } from '@/utils/image-link';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function UserIndex() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();

  const getData = useGetList({
    url: 'admin/paket-latihan/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/paket-latihan/remove/${id}`)).then(() => {
      getData.refresh();
    });
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
      title: 'Image',
      colKey: 'gambar',
      width: 100,
      cell: ({ row }: any) => {
        const trigger = createTrigger(row.banner);
        return (
          <ImageViewer trigger={trigger} images={[imageLink(row.banner)]} />
        );
      },
    },
    {
      title: 'Name',
      colKey: 'nama',
      width: 300,
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Jumlah Paket Soal',
      colKey: 'jumlah_paket_soal',
      align: AlignType.Center,
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{row?._count?.PaketLatihanSoal || 0}</span>;
      },
    },
    {
      title: 'Waktu Pengerjaan',
      colKey: 'waktu',
      align: AlignType.Center,
      sorter: true,
      width: 200,
      cell: ({ row }: any) => (
        <div
          dangerouslySetInnerHTML={{
            __html:
              row.type == 'BIASA'
                ? `${row.waktu} Menit`
                : `${moment(row.startAt).format('DD/MM/YYYY HH:MM')} - ${moment(
                    row.endAt
                  ).format('DD/MM/YYYY HH:MM')} <br/> 
                  <p class="">${moment(row.endAt).diff(
                    moment(row.startAt),
                    'minutes'
                  )} Menit</p>`,
          }}
        />
      ),
    },
    {
      title: 'Keterangan',
      colKey: 'keterangan',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input ' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => (
        <div dangerouslySetInnerHTML={{ __html: row.keterangan }} />
      ),
    },

    {
      title: 'Tanggal Dibuat',
      colKey: 'createdAt',
      sorter: true,
      align: AlignType.Center,

      cell: ({ row }: any) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Action',
      align: AlignType.Center,
      colKey: 'action',
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center gap-5">
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setDetail(() => ({
                  ...row,
                  isShareAnswer: row.isShareAnswer.toString(),
                  tanggal: [
                    moment(row.startAt).format('DD/MM/YYYY HH:mm'),
                    moment(row.endAt).format('DD/MM/YYYY HH:mm'),
                  ],
                }));
                setVisible(true);
              }}
            >
              <IconPencil size={14} />
            </Button>
            <Popup content="Manage sub kategori" trigger="hover">
              <Button
                shape="circle"
                theme="default"
                onClick={() => {
                  navigate(`/manage-latihan/${row.id}`);
                }}
              >
                <IconApps size={14} />
              </Button>
            </Popup>
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
        <ManageCategory
          setDetail={setDetail}
          params={getData}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb page={[{ name: 'Paket Latihan', link: '/manage-latihan' }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Paket Latihan
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
