import BreadCrumb from '@/components/breadcrumb';
import CardProduct from '@/components/card-product';
import PaymentModal from '@/components/payment-modal';
import useGetList from '@/hooks/use-get-list';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useHomeStore } from '@/stores/home-stores';
import { imageLink } from '@/utils/image-link';
import { getData, postData } from '@/utils/axios';
import { 
  IconArrowLeft, 
  IconBell, 
  IconFilter, 
  IconSearch,
  IconChevronRight,
  IconHourglassHigh,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const generateIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <IconHourglassHigh className="text-yellow-500" />;
    case 'SUCCESS':
      return <IconCircleCheck className="text-green-500" />;
    case 'FAILED':
      return <IconCircleX className="text-red-500" />;
    default:
      return <IconBell className="text-[#14B8A6]" />;
  }
};

export default function MyClass() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [paymentModal, setPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const homeData = useHomeStore();
  const { setData: setHomeData } = useHomeStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'SYSTEM' | 'USER'>('SYSTEM');
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const getMyClass = useGetList({
    url: 'user/get-my-class',
    initialParams: {
      skip: 0,
      take: 0,
    },
  });

  const getDetail = async () => {
    getData(`dashboard/user`).then((res) => {
      setHomeData(res);
    });
  };

  const readData = async (id: number, url: string) => {
    await postData('user/notification/read', { id });
    window.location.href = url;
  };

  const handleReadAll = async () => {
    await postData('user/notification/read-all');
    getDetail();
  };

  // Close notification menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const filteredList = useMemo(() => {
    if (!getMyClass?.list) return [];
    return getMyClass.list.filter((item: any) => 
      item.paketPembelian?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [getMyClass?.list, searchQuery]);

  // Handle "Mulai Belajar" navigation logic
  const handleStartLearning = (item: any) => {
    const counts = item.paketPembelian?._count;
    if (counts?.paketPembelianTryout) {
      navigate(`/my-class/${item.paketPembelian.id}/tryout`);
    } else if (counts?.paketPembelianMateri) {
      navigate(`/my-class/${item.paketPembelian.id}/materi`);
    } else if (counts?.paketPembelianBimbel) {
      navigate(`/my-class/${item.paketPembelian.id}/bimbel`);
    } else {
      // Default to detail if no specific counts
      navigate(`/my-class/${item.paketPembelian.id}`);
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pb-24 -mt-4 -mx-4 h-full">
        {paymentModal && <PaymentModal setVisible={setPaymentModal} />}
        
        {/* Mobile Header - Blue Gradient container */}
        <div className="relative">
          {/* Isolated Background layer with clipping for animations */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#07A97B] to-[#00419C] rounded-b-[40px] shadow-lg overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-[#14B8A6]/20 rounded-full blur-2xl"></div>
          </div>

          {/* Content Layer - No overflow-hidden to allow dropdowns to pop out. Higher Z to stay above search */}
          <div className="relative z-30 pt-12 pb-20 px-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate('/')} 
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md active:scale-90 transition-transform"
              >
                <IconArrowLeft size={22} className="text-white" />
              </button>
              <h1 className="text-white text-xl font-black tracking-tight">Paket Saya</h1>
              <div className="relative" ref={notificationMenuRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md relative active:scale-90 transition-transform"
                >
                  <IconBell size={22} className="text-white" />
                  {(homeData?.notifikasi || [])?.filter((e: any) => !e?.isRead).length > 0 && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-[#14B8A6]"></div>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-14 right-0 w-[calc(100vw-48px)] max-w-sm bg-white rounded-[30px] shadow-2xl z-[100] overflow-hidden border border-gray-100"
                    >
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black text-indigo-950 text-xs">NOTIFIKASI</h3>
                        {(homeData?.notifikasi || [])?.filter((e: any) => !e?.isRead).length > 0 && (
                          <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">
                            {(homeData?.notifikasi || [])?.filter((e: any) => !e?.isRead).length} Baru
                          </span>
                        )}
                      </div>
                      
                      <div className="flex border-b border-gray-50">
                        <button 
                          onClick={() => setNotificationTab('SYSTEM')}
                          className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-colors ${notificationTab === 'SYSTEM' ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]' : 'text-gray-400'}`}
                        >
                          Untuk Kamu
                        </button>
                        <button 
                          onClick={() => setNotificationTab('USER')}
                          className={`flex-1 py-3 text-[10px] font-black tracking-widest uppercase transition-colors ${notificationTab === 'USER' ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]' : 'text-gray-400'}`}
                        >
                          Terbaru & Update
                        </button>
                      </div>

                      <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                        {(homeData?.notifikasi || [])?.filter((e: any) => e?.type === notificationTab).length > 0 ? (
                          homeData?.notifikasi
                            ?.filter((e: any) => e?.type === notificationTab)
                            .map((e: any) => (
                              <button
                                key={e.id}
                                onClick={() => readData(e?.id, e.url || e?.notification?.url)}
                                className={`w-full p-4 flex gap-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50/50 ${!e?.isRead ? 'bg-teal-50/30' : ''}`}
                              >
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                  {e?.notification?.icon ? (
                                    <span dangerouslySetInnerHTML={{ __html: e?.notification?.icon }} className="scale-75" />
                                  ) : (
                                    generateIcon(e.status)
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xs font-black text-indigo-950 mb-1 leading-tight">
                                    {e.title || e?.notification?.title}
                                  </h4>
                                  <p className="text-[10px] font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                    {e.keterangan || e?.notification?.keterangan}
                                  </p>
                                  <span className="text-[9px] font-bold text-[#14B8A6] mt-2 block uppercase tracking-tighter">
                                    {moment(e.createdAt || e?.notification?.createdAt).fromNow()}
                                  </span>
                                </div>
                              </button>
                            ))
                        ) : (
                          <div className="py-12 px-6 text-center">
                            <IconBell size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-xs font-bold text-gray-400 italic">Belum ada notifikasi di kategori ini</p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleReadAll}
                        className="w-full py-4 text-[10px] font-black text-[#14B8A6] bg-gray-50 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                      >
                        Tandai semua sudah dibaca
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Search Bar Container - Outside both layers */}
          <div className="absolute bottom-[-28px] left-6 right-6 z-20">
            <div className="bg-white rounded-[20px] p-1.5 shadow-xl shadow-teal-900/10 flex items-center gap-2 border border-gray-100/50">
              <div className="flex-1 flex items-center px-4 gap-3 bg-gray-50/50 rounded-[15px] py-2.5">
                <IconSearch size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari paket belajar..."
                  className="bg-transparent border-none outline-none text-sm font-bold text-indigo-950 w-full placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-11 h-11 bg-[#14B8A6]/10 text-[#14B8A6] rounded-[15px] flex items-center justify-center active:scale-90 transition-transform">
                <IconFilter size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-indigo-950 uppercase tracking-widest pl-1">Paket Aktif</h2>
            <span className="bg-[#14B8A6]/10 text-[#14B8A6] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
              {filteredList.length} Paket
            </span>
          </div>

          <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {filteredList.map((item: any, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-teal-900/5 border border-gray-50 flex flex-col group"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[30px] m-2 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={imageLink(item.paketPembelian?.gambar)} 
                      alt={item.paketPembelian?.nama} 
                      className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6 pt-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 block">
                      {item.paketPembelian?.category?.nama || 'TERBARU 2024'}
                    </span>
                    <h3 className="text-lg font-black text-indigo-950 leading-[1.3] mb-3 group-hover:text-[#14B8A6] transition-colors">
                      {item.paketPembelian?.nama}
                    </h3>
                    <div 
                      className="text-[12px] text-gray-600 leading-relaxed mb-6 prose-xs"
                      dangerouslySetInnerHTML={{ __html: item.paketPembelian?.keterangan }}
                    />
                    <p className="text-[10px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 uppercase tracking-tighter">
                      Masa aktif: <span className="text-indigo-950/80 font-black italic tracking-normal lowercase">{item.expiredAt ? moment(item.expiredAt).format('DD MMM YYYY') : '-'}</span>
                    </p>

                    <button 
                      onClick={() => handleStartLearning(item)}
                      className="w-full bg-[#14B8A6] hover:bg-[#0F766E] text-white font-black py-4 rounded-[22px] shadow-lg shadow-teal-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                    >
                      Mulai Belajar
                      <IconChevronRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredList.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconSearch size={32} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-bold italic text-sm">Paket tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout (Original)
  return (
    <div className="header min-h-[90vh] pb-10">
      <BreadCrumb page={[{ name: 'Paket saya', link: '/my-class' }]} />
      {paymentModal && <PaymentModal setVisible={setPaymentModal} />}
      <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
        <div className="title">
          <h1 className="text-2xl text-indigo-950 font-bold mb-5">
            Paket Saya
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-80 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
           <IconSearch size={20} className="text-gray-400 ml-2" />
           <input 
             type="text" 
             placeholder="Cari paket saya..." 
             className="w-full outline-none text-sm font-medium"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">
        {filteredList.map((item: any) => {
          return (
            <CardProduct
              key={item.id}
              setVisible={setPaymentModal}
              item={item.paketPembelian}
              isPurchasing
            />
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="py-20 text-center bg-white rounded-3xl mt-6 border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Buka menu Beli Paket untuk memulai persiapan kamu.</p>
        </div>
      )}
    </div>
  );
}
