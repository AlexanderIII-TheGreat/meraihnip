import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconAlertCircleFilled,
  IconApps,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCreditCardPay,
  IconArrowLeft,
  IconClock,
} from '@tabler/icons-react';
import { Button, Popup, Tag } from 'tdesign-react';
import moment from 'moment';
import { useNavigate, Link } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useState } from 'react';
import { imageLink } from '@/utils/image-link';
import { formatCurrency } from '@/utils/number-format';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

const getStatusConfig = (status: string, isExpiredByTime: boolean) => {
  const normStatus = (status || '').toUpperCase();
  if (normStatus === 'UNPAID') {
    return {
      label: 'MENUNGGU PEMBAYARAN',
      theme: 'warning',
      color: 'bg-orange-50 text-orange-600',
      icon: <IconAlertCircleFilled size={14} />,
    };
  }
  if (normStatus === 'EXPIRED' || isExpiredByTime) {
    return {
      label: 'EXPIRED',
      theme: 'default',
      color: 'bg-gray-100 text-gray-500',
      icon: <IconClock size={14} />,
    };
  }
  if (normStatus === 'PAID') {
    return {
      label: 'BERHASIL',
      theme: 'success',
      color: 'bg-green-50 text-green-600',
      icon: <IconCircleCheckFilled size={14} />,
    };
  }
  if (normStatus === 'GAGAL' || normStatus === 'FAILED') {
    return {
      label: 'GAGAL',
      theme: 'danger',
      color: 'bg-red-50 text-red-600',
      icon: <IconCircleXFilled size={14} />,
    };
  }
  if (normStatus === 'REFUND') {
    return {
      label: 'REFUND',
      theme: 'warning',
      color: 'bg-yellow-50 text-yellow-600',
      icon: <IconAlertCircleFilled size={14} />,
    };
  }
  return {
    label: normStatus,
    theme: 'primary',
    color: 'bg-teal-50 text-teal-600',
    icon: <IconApps size={14} />,
  };
};

export default function RiwayatPembelianPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('Semua');

  /** Ambil data via hook */
  const getData = useGetList({
    url: 'user/payment-gateway/get', // Fixed API URL
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const filteredList = getData.list?.filter((item: any) => {
    // Debug log to see raw values from server
    console.log('DEBUG_RIWAYAT_ITEM:', {
      id: item.id,
      namaPaket: item.namaPaket,
      status: item.status,
      expiredAt: item.expiredAt,
      serverNow: item.serverNow // checking if server returns its own time
    });

    const daysLeft = item.expiredAt ? moment(item.expiredAt).diff(moment(), 'days') : 999;
    const status = (item.status || '').toUpperCase();

    if (activeTab === 'Berhasil') {
      return status === 'PAID' && daysLeft >= 0;
    }
    if (activeTab === 'Menunggu') {
      return status === 'UNPAID';
    }
    if (activeTab === 'Expired') {
      return status === 'EXPIRED' || (status === 'PAID' && daysLeft < 0);
    }
    return true;
  });

  /** Kolom tabel desktop */
  const columns = [
    {
      colKey: 'index',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 + getData.params.skip}</span>;
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
        props: { placeholder: 'Cari Paket' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.namaPaket}</div>
      ),
    },
    {
      title: 'Status',
      colKey: 'status',
      align: AlignType.Center,
      cell: ({ row }: any) => {
        const daysLeft = row.expiredAt ? moment(row.expiredAt).diff(moment(), 'days') : 999;
        const isExpiredByTime = (row.status || '').toUpperCase() === 'PAID' && daysLeft < 0;
        const config = getStatusConfig(row.status, isExpiredByTime);
        return (
          <Tag
            shape="round"
            theme={config.theme as any}
            variant="light-outline"
            icon={config.icon}
          >
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Durasi',
      colKey: 'duration',
      sorter: true,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        const daysLeft = moment(row.expiredAt).diff(moment(), 'days');
        return (
          <p className="text-center">
            {row.duration ? `${row.duration} Bulan` : 'Seumur Hidup'}
            {row.paidAt &&
              (daysLeft < 0 ? (
                <span className="block text-red-500 text-xs">Sudah Berakhir</span>
              ) : (
                <span className="block text-green-500 text-xs">
                  Tersisa: {daysLeft} Hari
                </span>
              ))}
          </p>
        );
      },
    },
    {
      title: 'Tanggal Pembelian',
      colKey: 'createdAt',
      sorter: true,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Action',
      colKey: 'action',
      align: AlignType.Center,
      width: 160,
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center gap-5">
            {/* Tombol Bayar */}
            <Popup content="Bayar Sekarang" trigger="hover">
              <Button
                disabled={row.status !== 'UNPAID' || !row.paymentUrl}
                shape="circle"
                theme="primary"
                variant="outline"
                onClick={() => window.open(row.paymentUrl, '_blank')}
              >
                <IconCreditCardPay size={14} />
              </Button>
            </Popup>

            {/* Tombol Akses Kelas */}
            <Popup content="Akses Kelas" trigger="hover">
              <Button
                disabled={row.status !== 'PAID'}
                shape="circle"
                theme="primary"
                onClick={() => navigate('/my-class')}
              >
                <IconApps size={14} />
              </Button>
            </Popup>
          </div>
        );
      },
    },
  ];

  if (isMobile) {
    return (
      <div className="md:hidden fixed inset-0 z-50 bg-[#f8f9fa] overflow-y-auto overflow-x-hidden pb-10">
        {/* Sticky Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 border-b">
          <Link to="/" className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-indigo-950">Riwayat Pembelian</h1>
          <div className="w-8"></div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white border-b sticky top-[61px] z-20 overflow-x-auto no-scrollbar flex px-4">
          {['Semua', 'Berhasil', 'Menunggu', 'Expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Card List */}
        <div className="py-6 px-5 flex flex-col gap-6 w-full">
          {filteredList?.length > 0 ? (
            filteredList.map((item: any) => {
              const daysLeft = item.expiredAt ? moment(item.expiredAt).diff(moment(), 'days') : 999;
              const isExpiredByTime = (item.status || '').toUpperCase() === 'PAID' && daysLeft < 0;
              const config = getStatusConfig(item.status, isExpiredByTime);
              
              const statusLabel = config.label;
              const statusColor = config.color;

              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.98]">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className={`px-2 py-1 rounded text-[10px] font-black w-fit tracking-wider ${statusColor}`}>
                        {statusLabel.toUpperCase()}
                      </div>
                      <h3 className="text-base font-black text-indigo-950 leading-snug line-clamp-2 pr-4 transition-all">
                        {item.namaPaket}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium">
                        {moment(item.createdAt).format('DD MMM YYYY, HH:mm')}
                      </p>
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 border border-gray-50 overflow-hidden flex items-center justify-center">
                      <img 
                        src={imageLink(item.paketPembelian?.gambar)} 
                        alt={item.namaPaket}
                        className="w-full h-full object-contain p-1"
                        onError={(e: any) => {
                          e.target.src = 'https://placehold.co/100x100?text=Paket';
                        }}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gray-50 w-full"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 tracking-tight">Total Pembayaran</span>
                    <span className={`text-base font-black ${item.status === 'UNPAID' ? 'text-blue-600' : 'text-indigo-950'}`}>
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  {item.status === 'PAID' && !isExpiredByTime && (
                    <button 
                      onClick={() => navigate('/my-class')}
                      className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-100 uppercase tracking-widest mt-2 flex items-center justify-center gap-2 active:bg-[#1e40af]"
                    >
                      Masuk Kelas
                    </button>
                  )}

                  {item.status === 'UNPAID' && item.paymentUrl && (
                    <button 
                      onClick={() => window.open(item.paymentUrl, '_blank')}
                      className="w-full py-4 bg-orange-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-100 uppercase tracking-widest mt-2 flex items-center justify-center gap-2 active:bg-orange-600"
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <IconClock size={40} />
              </div>
              <h3 className="text-base font-bold text-gray-400">Belum ada riwayat pembelian</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">Paket yang kamu beli akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section>
      <BreadCrumb
        page={[
          { name: 'Paket Pembelian', link: '/paket-pembelian' },
          { name: 'Riwayat Pembelian', link: '/paket-pembelian/riwayat' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-between header-section mb-6">
          <h1 className="text-2xl text-indigo-950 font-bold">Riwayat Pembelian</h1>
          
          {/* Tabs for Desktop */}
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {['Semua', 'Berhasil', 'Menunggu', 'Expired'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-6 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* COMPONENT TABEL */}
        <TableWrapper data={{ ...getData, list: filteredList }} columns={columns} />
      </div>
    </section>
  );
}
