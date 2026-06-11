import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconArrowLeft,
  IconCalendar,
  IconChartInfographic,
  IconDotsVertical,
  IconEyeShare,
  IconPencil,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Popup, Tag } from 'tdesign-react';
import { getData } from '@/utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';

import moment from 'moment/min/moment-with-locales';
import { konversiDetikKeWaktu } from '@/const';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function RiwayatTryout({ isBimbel }: any) {
  const [data, setData] = useState<any>({});
  const [tryout, setTryout] = useState<any>({});
  const [activeTab, setActiveTab] = useState('Semua');
  const isMobile = useIsMobile();

  const { id, paketId, paketFK } = useParams();
  const navigate = useNavigate();
  const listTryout = useGetList({
    url: 'user/tryout/history',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
      id: paketId,
      paketPembelianBimbelId: isBimbel ? paketFK : 0,
      paketPembelianTryoutId: isBimbel ? 0 : paketFK,
    },
  });

  useEffect(() => {
    getData(`user/find-my-class/${id}`).then((res) => {
      setData(res);
    });
    getData(`user/find-latihan/${paketId}`).then((res) => {
      setTryout(res);
    });
  }, []);

  const columns = [
    {
      title: '#',
      colKey: 'position',
      width: 100,
      cell: ({ rowIndex }: any) => (
        <div>{rowIndex + 1 * listTryout.params.skip + 1}</div>
      ),
    },
    {
      title: 'Waktu Pengerjaan',
      colKey: 'date',
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md font-bold">
            {moment(row.createdAt).format('dddd')},{' '}
            {moment(row.createdAt).format('LL')}
          </p>
          <p>Pukul {moment(row.createdAt).format('HH:mm')}</p>
        </div>
      ),
    },
    {
      title: 'Passing Grade',
      colKey: 'nama',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row?.pointCategory?.map((item: any) => (
            <Tag
              theme={item.all_point >= item.kkm ? 'success' : 'danger'}
              size="large"
              variant="light"
            >
              {item.category}: {item.all_point}/{item.kkm}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      colKey: 'status',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        const filter = row?.pointCategory?.filter(
          (e: any) => e.all_point < e.kkm
        );

        return (
          <>
            {moment(row.finishAt) > moment() ? (
              <Tag theme="warning" size="large" variant="light">
                Sedang Dikerjakan
              </Tag>
            ) : (
              <Tag
                theme={filter?.length < 1 ? 'success' : 'danger'}
                size="large"
                variant="light"
              >
                {filter?.length < 1 ? 'Lulus' : 'Tidak Lulus'}
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: 'Durasi Pengerjaan',
      colKey: 'durasi',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          {moment(row.finishAt) > moment()
            ? ''
            : konversiDetikKeWaktu(row?.waktuPengerjaan)}
        </div>
      ),
    },
    {
      title: 'Action',
      colKey: 'miniTest',
      width: 300,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div className="flex gap-2 justify-center">
          {moment(row.finishAt) > moment() ? (
            <Popup content={'Lanjutkan Tryout'} trigger="hover">
              <Button
                variant="dashed"
                theme="danger"
                icon={<IconPencil className="mr-1" size={16} />}
                onClick={() => {
                  navigate(
                    `/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}`
                  );
                }}
              >
                Lanjutkan
              </Button>
            </Popup>
          ) : (
            <>
              <Popup content="Lihat Statistik" trigger="hover">
                <Button
                  variant="dashed"
                  theme="success"
                  icon={<IconChartInfographic className="mr-1" size={16} />}
                  onClick={() => {
                    navigate(
                      `/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}/statistik`
                    );
                  }}
                >
                  Statistik
                </Button>
              </Popup>
              <Popup
                content={
                  row?.isShareAnswer
                    ? 'Pelajari Tryout'
                    : 'Pembahasan belum tersedia'
                }
                trigger="hover"
              >
                <Button
                  variant="dashed"
                  theme="primary"
                  icon={<IconEyeShare className="mr-1" size={16} />}
                  onClick={() => {
                    navigate(
                      `/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}/pembahasan`
                    );
                  }}
                  disabled={!row?.isShareAnswer}
                >
                  Pembahasan
                </Button>
              </Popup>
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredHistory = listTryout.list?.filter((item: any) => {
    if (activeTab === 'Semua') return true;
    const filter = item?.pointCategory?.filter((e: any) => e.all_point < e.kkm);
    const isLulus = filter?.length < 1;
    if (activeTab === 'Lulus') return isLulus;
    if (activeTab === 'Tidak Lulus') return !isLulus;
    return true;
  });

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F6F8FD] pb-24">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-950">
              <IconArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-black text-indigo-950 tracking-tight">Riwayat Pengerjaan</h1>
          </div>
          <button className="text-gray-400">
            <IconDotsVertical size={24} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-white px-4 border-b border-gray-100 mb-4 flex sticky top-[65px] z-40">
          {['Semua', 'Lulus', 'Tidak Lulus'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${isActive ? 'text-sky-500' : 'text-gray-400'}`}
              >
                {tab}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabRiwayat"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Card List */}
        <div className="px-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredHistory?.map((row: any, index: number) => {
              const filterStatus = row?.pointCategory?.filter((e: any) => e.all_point < e.kkm);
              const isLulus = filterStatus?.length < 1;
              const isOngoing = moment(row.finishAt) > moment();

              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      {isOngoing ? (
                        <span className="bg-yellow-50 text-yellow-600 text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          Sedang Dikerjakan
                        </span>
                      ) : (
                        <span className={`${isLulus ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider`}>
                          {isLulus ? 'Lulus Passing Grade' : 'Tidak Lulus'}
                        </span>
                      )}
                      <h3 className="text-[15px] font-black text-indigo-950 mt-3 leading-tight uppercase">
                        {tryout?.nama || 'Tryout'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Skor Akhir</p>
                      <p className="text-xl font-black text-sky-500 leading-none mt-1">
                        {row.point?._sum?.point ?? '0'}
                        <span className="text-gray-300 text-sm font-normal ml-0.5">/500</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400 mb-6">
                    <IconCalendar size={16} />
                    <span className="text-xs font-medium">
                      {moment(row.createdAt).format('DD MMM YYYY, HH:mm')}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {isOngoing ? (
                      <Button
                        block
                        theme="danger"
                        className="!rounded-xl h-11 font-bold shadow-lg shadow-red-100"
                        onClick={() => navigate(`/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}`)}
                      >
                        Lanjutkan
                      </Button>
                    ) : (
                      <>
                        <Button
                          block
                          theme="primary"
                          className="!rounded-xl h-11 font-bold shadow-lg shadow-sky-100 bg-[#0ea5e9] border-[#0ea5e9] hover:bg-[#0284c7] hover:border-[#0284c7]"
                          onClick={() => navigate(`/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}/statistik`)}
                        >
                          Lihat Detail
                        </Button>
                        <Button
                          block
                          variant="outline"
                          theme="primary"
                          className="!rounded-xl h-11 font-bold !text-sky-500 !border-sky-500 hover:bg-sky-50"
                          disabled={!row?.isShareAnswer}
                          onClick={() => navigate(`/my-class/${id}/tryout/${paketFK}/${paketId}/${row.id}/pembahasan`)}
                        >
                          Pembahasan
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {!listTryout.isLoading && filteredHistory?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium italic">Belum ada riwayat pengerjaan</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="">
      {isBimbel ? (
        <BreadCrumb
          page={[
            { name: 'Paket saya', link: '/my-class' },
            {
              name: data?.paketPembelian?.nama || 'Nama Kelas',
              link: '/my-class',
            },
            { name: 'Bimbel', link: `/my-class/${id}/bimbel` },
            {
              name: tryout?.nama || 'Bimbel',
              link: `/my-class/${id}/bimbel/mini-test/${paketFK}/${paketId}`,
            },
            { name: 'Riwayat', link: '#' },
          ]}
        />
      ) : (
        <BreadCrumb
          page={[
            { name: 'Paket saya', link: '/my-class' },
            {
              name: data?.paketPembelian?.nama || 'Nama Kelas',
              link: '/my-class',
            },
            { name: 'Tryout', link: `/my-class/${id}/tryout` },
            {
              name: tryout?.nama || 'Tryout',
              link: `/my-class/${id}/tryout/${paketFK}/${paketId}`,
            },
            { name: 'Riwayat', link: '#' },
          ]}
        />
      )}

      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mt-2">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
              Riwayat {isBimbel ? 'Mini Test' : 'Tryout'} {tryout?.nama}
            </h1>
          </div>
        </div>
        <TableWrapper data={listTryout} columns={columns} />
      </div>
    </section>
  );
}
