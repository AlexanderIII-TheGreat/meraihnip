import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconAlertCircleFilled,
  IconApps,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCreditCardPay,
  IconPlus,
} from '@tabler/icons-react';
import { Button, Popup, Tag } from 'tdesign-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

const statusNameListMap: StatusNameListMap = {
  PAID: {
    label: 'Berhasil',
    theme: 'success',
    icon: <IconCircleCheckFilled />,
  },
  GAGAL: { label: 'Gagal', theme: 'danger', icon: <IconCircleXFilled /> },
  UNPAID: {
    label: 'Menunggu Pembayaran',
    theme: 'warning',
    icon: <IconAlertCircleFilled />,
  },
};

interface StatusNameListMap {
  PAID: StatusInfo;
  GAGAL: StatusInfo;
  UNPAID: StatusInfo;
}

interface StatusInfo {
  label: string;
  theme: 'success' | 'danger' | 'warning' | 'default' | 'primary';
  icon: JSX.Element;
}

export default function UserIndex() {
  const navigate = useNavigate();

  const getData = useGetList({
    url: 'user/payment-gateway/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

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
      title: 'Nama Paket',
      colKey: 'namaPaket',
      align: AlignType.Center,
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Nama Paket',
      colKey: 'status',
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <Tag
          shape="round"
          theme={
            statusNameListMap[row.status as keyof StatusNameListMap]?.theme ||
            'danger'
          }
          variant="light-outline"
          icon={
            statusNameListMap[row.status as keyof StatusNameListMap]?.icon ||
            statusNameListMap.GAGAL?.icon
          }
        >
          {statusNameListMap[row.status as keyof StatusNameListMap]?.label ||
            row.status}
        </Tag>
      ),
    },
    {
      title: 'Durasi Paket',
      colKey: 'duration',
      sorter: true,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return row.duration ? (
          <p className="text-center">
            {`${row.duration} Bulan`} <br />
            {row.paidAt ? (
              moment(row.expiredAt).diff(moment(), 'days') < 0 ? (
                <span className="text-red-500">Sudah Berakhir</span>
              ) : (
                <span className="text-green-500">
                  Tersisa: {moment(row.expiredAt).diff(moment(), 'days')} Hari
                </span>
              )
            ) : (
              ''
            )}
          </p>
        ) : (
          'Seumur Hidup'
        );
      },
    },
    {
      title: 'Tanggal Pembelian',
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
            <Popup content="Bayar Sekarang" trigger="hover">
              <Button
                disabled={row.status !== 'UNPAID' || !row.paymentUrl}
                shape="circle"
                theme="primary"
                variant="outline"
                onClick={() => {
                  window.open(row.paymentUrl, '_blank');
                }}
              >
                <IconCreditCardPay size={14} />
              </Button>
            </Popup>
            <Popup content="Akses Kelas" trigger="hover">
              <Button
                disabled={row.status !== 'PAID'}
                shape="circle"
                theme="primary"
                onClick={() => {
                  navigate(`/my-class`);
                }}
              >
                <IconApps size={14} />
              </Button>
            </Popup>
          </div>
        );
      },
    },
  ];
  return (
    <section className="">
      <BreadCrumb
        page={[
          { name: 'Paket Pembelian', link: '/paket-pembelian' },
          { name: 'Riwayat', link: '/paket-pembelian/riwayat' },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Riwayat Pembelian
            </h1>
            <Button
              theme="default"
              size="large"
              className="border-success hover:bg-success hover:text-white group"
              // onClick={() => setVisible(true)}
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
