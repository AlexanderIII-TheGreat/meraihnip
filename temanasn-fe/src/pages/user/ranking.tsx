import TableWrapper from "@/components/table";
import useGetList from "@/hooks/use-get-list";
import { useEffect, useState } from "react";
import { Tag } from "tdesign-react";
import { getData } from "@/utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import BreadCrumb from "@/components/breadcrumb";
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { IconArrowLeft, IconDotsVertical, IconCalendar, IconTrophy } from '@tabler/icons-react';

import moment from "moment/min/moment-with-locales";
import { konversiDetikKeWaktu } from "@/const";

enum AlignType {
  Center = "center",
  Left = "left",
  Right = "right",
}

export default function Ranking({ isBimbel }: any) {
  const [data, setData] = useState<any>({});
  const [tryout, setTryout] = useState<any>({});
  const [activeTab, setActiveTab] = useState('Semua');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const { id, paketId, paketFK } = useParams();

  const listTryout = useGetList({
    url: "user/tryout/ranking",
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: "createdAt",
      descending: true,
      id: paketId,
      paketPembelianTryoutId: isBimbel ? 0 : paketFK,
      paketPembelianBimbelId: isBimbel ? paketFK : 0,
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
      title: "Posisi",
      colKey: "posisi",
      width: 100,
      align: AlignType.Center,
      cell: (prop: any) => (
        <div>{prop.rowIndex + 1 * listTryout.params.skip + 1}</div>
      ),
    },
    {
      title: "Nama Peserta",
      colKey: "name",
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md font-bold">{row.name}</p>
          <p className="text-xs text-gray-400 font-light">
            {moment(row.createdAt).format("dddd")},{" "}
            {moment(row.createdAt).format("LL")} <br /> Pukul{" "}
            {moment(row.createdAt).format("HH:mm")}
          </p>
        </div>
      ),
    },
    {
      title: "Passing Grade",
      colKey: "nama",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row?.pointCategory?.map((item: any) => (
            <Tag
              theme={item.all_point >= item.maxPoint ? "success" : "danger"}
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
      title: "Status",
      colKey: "status",
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        const filter = row?.pointCategory?.filter(
          (e: any) => e.all_point < e.kkm
        );
        return (
          <Tag
            theme={filter?.length < 1 ? "success" : "danger"}
            size="large"
            variant="light"
          >
            {filter?.length < 1 ? "Lulus" : "Tidak Lulus"}
          </Tag>
        );
      },
    },
    {
      title: "Durasi Pengerjaan",
      colKey: "durasi",
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>{konversiDetikKeWaktu(row?.waktuPengerjaan)}</div>
      ),
    },
    {
      title: "Skor",
      colKey: "point",
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => <div>{row.point || "0"}</div>,
    },
  ];

  const filteredRanking = listTryout.list?.filter((item: any) => {
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
            <h1 className="text-lg font-black text-indigo-950 tracking-tight">Ranking Peserta</h1>
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
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {tab}
                {isActive && (
                  <motion.div 
                    layoutId="activeTabRanking"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Card List */}
        <div className="px-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRanking?.map((row: any, index: number) => {
              const rank = index + 1 * listTryout.params.skip + 1;
              const filterStatus = row?.pointCategory?.filter((e: any) => e.all_point < e.kkm);
              const isLulus = filterStatus?.length < 1;

              return (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : rank === 2 ? 'bg-slate-100 text-slate-500' : rank === 3 ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {rank === 1 ? <IconTrophy size={20} /> : `#${rank}`}
                      </div>
                      <div>
                        <span className={`${isLulus ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider`}>
                          {isLulus ? 'Lulus Passing Grade' : 'Tidak Lulus'}
                        </span>
                        <h3 className="text-[14px] font-black text-indigo-950 mt-1 leading-tight uppercase">
                          {row.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Skor</p>
                      <p className="text-lg font-black text-blue-600 leading-none mt-1">
                        {row.point || '0'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-gray-400 mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 font-medium text-[11px]">
                      <IconCalendar size={14} />
                      {moment(row.createdAt).format('DD/MM/YYYY, HH:mm')}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Durasi: {konversiDetikKeWaktu(row?.waktuPengerjaan)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {!listTryout.isLoading && filteredRanking?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium italic">Belum ada ranking peserta</p>
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
            { name: "Paket saya", link: "/my-class" },
            {
              name: data?.paketPembelian?.nama || "Nama Kelas",
              link: "/my-class",
            },
            { name: "Bimbel", link: `/my-class/${id}/bimbel` },
            {
              name: tryout?.nama || "Bimbel",
              link: `/my-class/${id}/bimbel/mini-test/${paketFK}/${paketId}`,
            },
            { name: "Ranking", link: "#" },
          ]}
        />
      ) : (
        <BreadCrumb
          page={[
            { name: "Paket saya", link: "/my-class" },
            {
              name: data?.paketPembelian?.nama || "Nama Kelas",
              link: "/my-class",
            },
            { name: "Tryout", link: `/my-class/${id}/tryout` },
            {
              name: tryout?.nama || "Tryout",
              link: `/my-class/${id}/tryout/${paketFK}/${paketId}`,
            },
            { name: "Ranking", link: "#" },
          ]}
        />
      )}

      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mt-2">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
              Ranking Tryout {tryout?.nama}
            </h1>
          </div>
        </div>
        <TableWrapper data={listTryout} columns={columns} />
      </div>
    </section>
  );
}
