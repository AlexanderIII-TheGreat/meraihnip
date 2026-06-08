import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, ImageViewer, Popconfirm } from 'tdesign-react';
import toast from 'react-hot-toast';
import ManagePaketPembelian from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import { formatCurrency } from '@/utils/number-format';
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
    url: 'admin/paket-pembelian/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/paket-pembelian/remove/${id}`)).then(() => {
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
      cell: ({ row }: any) => {
        const trigger = createTrigger(row.gambar);
        return (
          <ImageViewer trigger={trigger} images={[imageLink(row.gambar)]} />
        );
      },
    },
    {
      title: 'Name',
      colKey: 'nama',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => {
        return (
          <p className={!row.isActive ? 'text-red-500' : ''}>{row.nama}</p>
        );
      },
    },
    {
      title: 'Harga',
      colKey: 'harga',
      cell: ({ row }: any) => {
        return <span className="text-center">{formatCurrency(row.harga)}</span>;
      },
    },

    {
      title: 'Durasi',
      colKey: 'durasi',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) =>
        `${row.durasi ? `${row.durasi} Bulan` : 'Seumur Hidup'}`,
    },
    {
      title: 'Pembeli',
      colKey: 'pembeli',
      width: 100,
      sorter: true,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return <p>{row?._count?.Pembelian}</p>;
      },
    },
	{
      title: 'Link Wa',
      colKey: 'linkWa',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Link Wa' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => {
        return (
          <p className={!row.isActive ? 'text-red-500' : ''}>{row.linkWa}</p>
        );
      },
    },
    {
      title: 'Materi',
      colKey: 'materi',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
          <p
            onClick={() => navigate(`/manage-pembelian/${row.id}/materi`)}
            className="cursor-pointer text-blue-500 underline"
          >
            {row._count?.paketPembelianMateri}
          </p>
        );
      },
    },
    {
      title: 'Bimbel',
      colKey: 'bimbel',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
          <p
            onClick={() => navigate(`/manage-pembelian/${row.id}/bimbel`)}
            className="cursor-pointer text-blue-500 underline"
          >
            {row?._count?.paketPembelianBimbel}
          </p>
        );
      },
    },

    {
      title: 'Fitur',
      colKey: 'fitur',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
          <p
            onClick={() => navigate(`/manage-pembelian/${row.id}/fitur`)}
            className="cursor-pointer text-blue-500 underline"
          >
            {row?._count?.paketPembelianFitur}
          </p>
        );
      },
    },
    {
      title: 'Tryout',
      colKey: 'tryout',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
          <p
            onClick={() => navigate(`/manage-pembelian/${row.id}/tryout`)}
            className="cursor-pointer text-blue-500 underline"
          >
            {row?._count?.paketPembelianTryout}
          </p>
        );
      },
    },
    {
      title: 'Tanggal Dibuat',
      colKey: 'createdAt',
      align: AlignType.Center,
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Action',
      align: AlignType.Center,
      colKey: 'action',
      cell: ({ row }: any) => {
        const handleCopyLink = () => {
          const url = `https://bimbel.fungsional.id/paket-pembelian?search=${row.nama}`;
          navigator.clipboard.writeText(url);
          toast.success('Link berhasil disalin!');
        };
        return (
          <div className="flex justify-center gap-5">
             <Button
              shape="circle"
              theme="primary"
              variant="outline"
              onClick={handleCopyLink}
            >
              <IconCopy size={14} />
            </Button>
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setDetail(() => ({
                  ...row,
                  isActive: row.isActive ? '1' : '0',
                }));
                setVisible(true);
              }}
            >
              <IconPencil size={14} />
            </Button>

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
        <ManagePaketPembelian
          setDetail={setDetail}
          params={getData}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[{ name: 'Paket Pembelian', link: '/manage-pembelian' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Paket Pembelian
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
