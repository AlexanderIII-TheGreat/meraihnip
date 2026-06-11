import {
  IconAlertCircleFilled,
  IconCircleCheck,
  IconDeviceTv,
  IconDownload,
  IconHistory,
  IconPencil,
  IconVideo,
  IconArrowLeft,
  IconDotsVertical,
  IconInfoCircle,
  IconReportAnalytics,
  IconAlarm
} from '@tabler/icons-react';
import { Button, Popup, Table, Tag } from 'tdesign-react';
import { getData } from '@/utils/axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import BreadCrumb from '@/components/breadcrumb';
import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { motion } from 'framer-motion';

import moment from 'moment/min/moment-with-locales';
import { handleOpenLink } from '@/const';
import TutorialGroup from '@/components/tutorial-group';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

interface StatusInfo {
  label: string;
  theme: 'success' | 'danger' | 'warning' | 'default' | 'primary';
  icon: JSX.Element;
}

interface StatusNameListMap {
  BELUM: StatusInfo;
  SEDANG: StatusInfo;
  SELESAI: StatusInfo;
}

const statusNameListMap: StatusNameListMap = {
  BELUM: {
    label: 'Belum Dimulai',
    theme: 'default',
    icon: <IconAlarm size={20} />,
  },
  SEDANG: {
    label: 'Berlangsung',
    theme: 'warning',
    icon: <IconAlertCircleFilled size={20} />,
  },
  SELESAI: {
    label: 'Selesai',
    theme: 'success',
    icon: <IconCircleCheck size={20} />,
  },
};

const MobileCardBimbel = ({ row, id, navigate, handleOpenLink }: any) => {
  const statusInfo = statusNameListMap[row.status as keyof StatusNameListMap];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 p-5"
    >
      {/* Header: Status & Actions */}
      <div className="flex justify-between items-center mb-4">
        <Tag
          shape="round"
          size="medium"
          theme={statusInfo?.theme}
          variant="light-outline"
          icon={statusInfo?.icon}
          className="font-bold scale-90 origin-left"
        >
          {statusInfo?.label}
        </Tag>
        <div className="flex gap-2">
           <Popup content="Riwayat Mini Test" trigger="hover">
            <button
              disabled={!row.paketLatihanId}
              onClick={() => navigate(`/my-class/${id}/bimbel/mini-test/${row.id}/${row.paketLatihanId}/riwayat`)}
              className={`p-2 rounded-full transition-all ${row.paketLatihanId ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-gray-50 text-gray-300'}`}
            >
              <IconHistory size={18} />
            </button>
          </Popup>
        </div>
      </div>

      {/* Info Section */}
      <div className="mb-5">
        <h3 className="text-base font-black text-indigo-950 mb-3 leading-tight uppercase tracking-tight">
          {row.nama}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-gray-500">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <IconAlarm size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Jadwal Sesi</p>
              <p className="text-xs font-bold text-gray-700">
                {moment(row.date).format('dddd, LL')} • {moment(row.date).format('HH:mm')} WIB
              </p>
            </div>
          </div>

          {row?.mentor && (
            <div className="flex items-center gap-2.5 text-gray-500">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <IconPencil size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider">Mentor</p>
                <p className="text-xs font-bold text-gray-700">{row.mentor}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Action: Masuk Zoom / YouTube */}
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => handleOpenLink(row.videoLink)}
          disabled={!row.videoLink}
          className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
            row.videoLink 
              ? 'bg-[#1E3A8A] text-white hover:bg-[#1e40af] active:scale-95 shadow-[#1E3A8A]/20' 
              : 'bg-gray-100 text-gray-300'
          }`}
        >
          <IconVideo size={18} />
          Masuk Sesi {row.status === 'SEDANG' ? 'Live' : ''}
        </button>

        <div className="grid grid-cols-3 gap-2 mt-1">
          <button
            onClick={() => handleOpenLink(row.materiLink)}
            disabled={!row.materiLink}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
              row.materiLink 
                ? 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50 active:scale-95' 
                : 'border-gray-50 bg-gray-50 text-gray-300'
            }`}
          >
            <IconDownload size={18} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Materi</span>
          </button>

          <button
            onClick={() => handleOpenLink(row.rekamanLink)}
            disabled={!row.rekamanLink}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
              row.rekamanLink 
                ? 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50 active:scale-95' 
                : 'border-gray-50 bg-gray-50 text-gray-300'
            }`}
          >
            <IconDeviceTv size={18} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Rekaman</span>
          </button>

          <button
            onClick={() => navigate(`/my-class/${id}/bimbel/mini-test/${row.id}/${row.paketLatihanId}`)}
            disabled={!row.paketLatihanId}
            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
              row.paketLatihanId 
                ? 'border-orange-100 bg-orange-50/30 text-orange-600 hover:bg-orange-50 active:scale-95' 
                : 'border-gray-50 bg-gray-50 text-gray-300'
            }`}
          >
            <IconPencil size={18} className="mb-1" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Mini Test</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function UserIndex() {
  const [data, setData] = useState<any>([]);
  const [filter, setFilter] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const account = useAuthStore((state) => state.user);
  const backPath = account?.role === 'ADMIN' ? '/dashboard' : '/my-class';
  const isLoaded = Object.keys(data).length > 0;

  const columns = [
    {
      title: 'Waktu',
      colKey: 'date',
      width: 180,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md font-bold">
            {moment(row.date).format('dddd')}, {moment(row.date).format('LL')}
          </p>
          <p>Pukul {moment(row.date).format('HH:mm')}</p>
        </div>
      ),
    },
    {
      title: 'Judul',
      colKey: 'nama',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md ">{row.nama}</p>
          {row?.mentor && <p>Mentor: {row.mentor}</p>}
        </div>
      ),
    },
    {
      title: 'Mini Test',
      colKey: 'miniTest',
      width: 180,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div className="flex gap-2 justify-center">
          <Popup
            content={
              row?.paketLatihanId
                ? 'Kerjakan Mini Test'
                : 'Mini Test Belum Tersedia'
            }
            trigger="hover"
          >
            <Button
              variant="dashed"
              theme="warning"
              icon={<IconPencil className="mr-1" size={16} />}
              disabled={!row.paketLatihanId}
              onClick={() => {
                navigate(
                  `/my-class/${id}/bimbel/mini-test/${row.id}/${row.paketLatihanId}`
                );
              }}
            >
              Kerjakan
            </Button>
          </Popup>
          <Popup
            content={
              row?.paketLatihanId
                ? 'Riwayat Mini Test'
                : 'Belum ada riwayat Mini Test'
            }
            trigger="hover"
          >
            <Button
              variant="dashed"
              theme="default"
              icon={<IconHistory className="mr-1" size={16} />}
              disabled={!row.paketLatihanId}
              onClick={() => {
                navigate(
                  `/my-class/${id}/bimbel/mini-test/${row.id}/${row.paketLatihanId}/riwayat`
                );
              }}
            ></Button>
          </Popup>
        </div>
      ),
    },
    {
      title: 'Materi',
      colKey: 'materi',
      width: 140,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          <Popup
            content={
              row.materiLink ? 'Download Materi' : 'Materi Belum Tersedia'
            }
            trigger="hover"
          >
            <Button
              variant="dashed"
              theme="danger"
              icon={<IconDownload className="mr-1" size={16} />}
              disabled={!row.materiLink}
              onClick={() => handleOpenLink(row.materiLink)}
            >
              Download
            </Button>
          </Popup>
        </div>
      ),
    },
    {
      title: 'Zoom / Youtube',
      colKey: 'zoom',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          <Popup
            content={row.videoLink ? 'Download Video' : 'Video Belum Tersedia'}
            trigger="hover"
          >
            <Button
              variant="dashed"
              theme="success"
              icon={<IconVideo className="mr-1" size={16} />}
              disabled={!row.videoLink}
              onClick={() => handleOpenLink(row.videoLink)}
            >
              Masuk
            </Button>
          </Popup>
        </div>
      ),
    },
    {
      title: 'Rekaman',
      colKey: 'rekaman',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          <Popup
            content={
              row.rekamanLink ? 'Download Rekaman' : 'Rekaman Belum Tersedia'
            }
            trigger="hover"
          >
            <Button
              variant="dashed"
              theme="primary"
              icon={<IconDeviceTv className="mr-1" size={16} />}
              disabled={!row.rekamanLink}
              onClick={() => handleOpenLink(row.rekamanLink)}
            >
              Tonton
            </Button>
          </Popup>
        </div>
      ),
    },
    {
      title: 'Status',
      colKey: 'status',
      width: 100,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          {' '}
          <Tag
            shape="round"
            size="large"
            theme={
              statusNameListMap[row.status as keyof StatusNameListMap]?.theme
            }
            variant="light-outline"
            icon={
              statusNameListMap[row.status as keyof StatusNameListMap]?.icon
            }
          >
            <span className="ml-1">
              {statusNameListMap[row.status as keyof StatusNameListMap]?.label}
            </span>
          </Tag>
        </div>
      ),
    },
  ];

  const getDetailClass = async () => {
    getData(`user/find-my-class/${id}`).then((res: any) => {
      setData({ ...res, bimbel: res?.paketPembelian?.paketPembelianBimbel });
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);

  const [visible, setVisible] = useState(false);

  if (isMobile) {
    const list = data?.bimbel?.filter((item: any) =>
      item.nama?.toLowerCase()?.includes(filter?.toLowerCase())
    ) || [];

    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24 -mt-4 -mx-4">
        {/* Mobile Header */}
        <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(backPath)} className="text-gray-950">
              <IconArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-black text-indigo-950 tracking-tight">{data?.paketPembelian?.nama || 'Detail Paket'}</h1>
          </div>
          <button className="text-gray-400">
            <IconDotsVertical size={24} />
          </button>
        </div>

        {/* Consolidated Navigation Tabs */}
        <div className="bg-white px-0 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar sticky top-[68px] z-40 shadow-sm">
          <div className="flex min-w-full px-4">
            {[
              { label: 'Tryout', value: 'Tryout', show: !isLoaded || (data?.paketPembelian?.paketPembelianTryout?.length || 0) > 0 },
              { label: 'Materi', value: 'Materi', show: !isLoaded || (data?.paketPembelian?.paketPembelianMateri?.length || 0) > 0 },
              { label: 'Bimbel', value: 'Bimbel', show: !isLoaded || (data?.bimbel?.length || 0) > 0 }
            ].filter(tab => tab.show).map((tab) => {
              const isActive = (tab.label === 'Bimbel');
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    if (tab.value === 'Bimbel') return;
                    if (tab.value === 'Materi') navigate(`/my-class/${id}/materi`);
                    else navigate(`/my-class/${id}/tryout?type=${tab.value}`);
                  }}
                  className={`flex-1 py-4 text-[13px] font-black transition-all relative whitespace-nowrap px-5 ${isActive ? 'text-[#1E3A8A]' : 'text-gray-400'}`}
                >
                  <span className="uppercase tracking-tight">{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E3A8A] rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-20">
          {/* Info Important */}
          <div className="bg-[#1E3A8A]/5 rounded-2xl p-5 mb-6 border border-[#1E3A8A]/20 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="text-[#1E3A8A]" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-950 mb-1">Jadwal Bimbel</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Pastikan Anda hadir tepat waktu sesuai jadwal yang tertera. Link absensi dan materi tersedia di sini.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
             {list.map((item: any) => (
               <MobileCardBimbel 
                key={item.id} 
                row={item} 
                id={id} 
                navigate={navigate} 
                handleOpenLink={handleOpenLink} 
               />
             ))}
             {list.length === 0 && (
               <div className="text-center py-20">
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Belum ada jadwal bimbel</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="">
      <BreadCrumb
        page={[
          { name: 'Paket saya', link: '/my-class' },
          {
            name: data?.paketPembelian?.nama || 'Nama Kelas',
            link: '/my-class',
          },
          { name: 'Bimbel', link: '#' },
        ]}
      />{' '}
      <div className="bg-white p-8 pt-4 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between mb-5 ">
            <h1 className="text-2xl text-indigo-950 font-semibold self-center mb-4 mt-4 ">
              Bimbel {data?.namaPaket}
              <div className="mt-4">
                <span className="text-sm font-semibold relative">
                  Masuk group dan baca petunjuk Bimbel
                </span>
                <Button
                    className="self-center p-0 m-0 relative mt-2 rounded-sm text-white bg-primary px-4 py-1.5 border border-primary hover:shadow-md flex items-center text-sm"
                    disabled={!data?.paketPembelian?.linkWa}
                    onClick={() => handleOpenLink(data?.paketPembelian?.linkWa)}
                  >
                    Masuk Grup
                  </Button>
              </div>
            </h1>

            {visible && (
              <TutorialGroup
                title={`Panduan Bimbel `}
                setVisible={setVisible}
                detail={data?.paketPembelian?.panduan}
              />
            )}
          </div>
        </div>
        <Table
          data={
            data?.bimbel?.filter((item: any) =>
              item.nama?.toLowerCase()?.includes(filter?.toLowerCase())
            ) || []
          }
          onFilterChange={(e) => {
            setFilter(e.nama);
          }}
          rowKey="bimbel"
          columns={columns}
        />
        <div className="flex justify-between  gap-4 mt-2">
          <Link
            to={`/my-class/${id}/tryout?type=Tryout`}
            className="self-center border-indigo-900 border mb-4 mt-2 rounded-xl text-indigo-900 hover:text-white hover:bg-indigo-900 hover:shadow-2xl px-4 py-2 md:px-6 md:py-2 flex items-center"
          >
            <IconReportAnalytics size={20} className="mr-2" />
            <span className="text-xs md:text-base">Kerjakan Tryout</span>
          </Link>
          <Link
            to={`/my-class/${id}/tryout?type=Bimbel`}
            className="self-center border-indigo-900 border mb-4 mt-2 rounded-xl text-indigo-900 hover:text-white hover:bg-indigo-900 hover:shadow-2xl px-4 py-2 md:px-6 md:py-2 flex items-center"
          >
            <IconReportAnalytics size={20} className="mr-2" />
            <span className="text-xs md:text-base">Kerjakan Latihan</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
