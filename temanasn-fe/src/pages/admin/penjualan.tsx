import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import moment from 'moment';
import { Button, Popconfirm, Tag } from 'tdesign-react';
// import FetchAPI from '@/utils/fetch-api';
// import { deleteData } from '@/utils/axios';
import BreadCrumb from '@/components/breadcrumb';
import { formatCurrency } from '@/utils/number-format';
import { IconCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import FetchAPI from '@/utils/fetch-api';
import { postData } from '@/utils/axios';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManagePenjualan() {
  const getData = useGetList({
    url: 'admin/paket-latihan/penjualan',
    initialParams: {
      skip: 0,
      take: 10,
    },
  });

  const finishPayment = async (id: number) => {
    FetchAPI(
      postData('admin/paket-latihan/penjualan/finish-payment', { id })
    ).then(() => {
      getData.setParams((prev: any) => ({ ...prev }));
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
      title: 'Invoice',
      colKey: 'invoice',
      width: 130,
      cell: ({ row }: any) => {
        return (
          <Link
            to={row.paymentUrl}
            className={row.paymentUrl ? 'text-blue-500 hover:underline' : ''}
            target="_blank"
          >
            {row.invoice}
          </Link>
        );
      },
    },
    {
      title: 'Nama Paket',
      colKey: 'namaPaket',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Name' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Nama User',
      colKey: 'userName',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Name' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => <span>{row?.user?.name}</span>,
    },
    {
      title: 'Email',
      colKey: 'userEmail',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Email' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => <span>{row?.user?.email || '-'}</span>,
    },
    {
      title: 'Total Voucher',
      colKey: 'voucher',
      width: 150,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return row?.voucherCode ? (
          <span>
            Rp. {row?.voucherCode}
            <br />
            <small> {formatCurrency(row?.voucherValue)}</small>
          </span>
        ) : (
          'Rp. 0'
        );
      },
    },
    {
      title: 'Total Voucer Alumni',
      colKey: 'voucherAlumni',
      width: 150,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return <span>{formatCurrency(row?.voucherAlumni)}</span>;
      },
    },
    {
      title: 'Total Harga',
      colKey: 'amount',
      width: 150,
      align: AlignType.Center,

      sorter: true,
      cell: ({ row }: any) => {
        return <span>{formatCurrency(row?.amount)}</span>;
      },
    },
    {
      title: 'Status',
      colKey: 'status',
      width: 100,
      filter: {
        type: 'single',
        resetValue: [],
        list: [
          { label: 'UNPAID', value: 'UNPAID' },
          { label: 'PAID', value: 'PAID' },
          { label: 'OVERDUE', value: 'OVERDUE' },
          { label: 'EXPIRED', value: 'EXPIRED' },
        ],
        showConfirmAndReset: true,
      },
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return (
          <div className="flex gap-2 items-center">
            <Tag
              theme={
                moment(row?.expiredAt).isBefore(moment()) &&
                row?.status !== 'UNPAID'
                  ? 'danger'
                  : row?.status === 'PAID'
                  ? 'success'
                  : row?.status === 'UNPAID'
                  ? 'warning'
                  : 'danger'
              }
              size="large"
              variant="light"
            >
              {moment(row?.expiredAt).isBefore(moment()) &&
              row?.status !== 'UNPAID'
                ? 'Overdue'
                : row?.status}
            </Tag>
            {row?.status === 'UNPAID' || row?.status === 'EXPIRED' ? (
              <Popconfirm
                content="Apakah kamu yakin ?"
                theme="default"
                onConfirm={() => {
                  finishPayment(row.id);
                }}
              >
                <Button theme="success" size="small">
                  <IconCheck size={14} />
                </Button>{' '}
              </Popconfirm>
            ) : (
              ''
            )}
          </div>
        );
      },
    },
    {
      title: 'Tanggal',
      colKey: 'tanggal',
      width: 150,
      align: AlignType.Center,

      sorter: true,
      cell: ({ row }: any) => {
        return (
          <span>
            {`${moment(row.createdAt).format('DD/MM/YYYY')} - `}

            {row.expiredAt ? (
              <span
                className={`${
                  moment(row?.expiredAt).isBefore(moment()) && 'text-red-500'
                }`}
              >
                {moment(row.expiredAt).format('DD/MM/YYYY')}
              </span>
            ) : (
              'Seumur Hidup'
            )}
          </span>
        );
      },
    },
  ];
  return (
    <section className="">
      <BreadCrumb
        page={[{ name: 'Manage Voucher', link: '/manage-voucher' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Penjualan
            </h1>
            {/* <Button
              theme="default"
              size="large"
              className="border-success hover:bg-success hover:text-white group"
              onClick={() => setVisible(true)}
            >
              <IconPlus
                size={20}
                className="text-success group-hover:text-white"
              />
            </Button> */}
          </div>
        </div>
        <TableWrapper data={getData} columns={columns} />
      </div>
    </section>
  );
}
