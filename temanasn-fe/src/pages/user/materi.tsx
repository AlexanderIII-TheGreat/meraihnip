import BreadCrumb from '@/components/breadcrumb';
import { getData } from '@/utils/axios';
import { 
  IconBook, 
  IconFiles, 
  IconArrowLeft, 
  IconDotsVertical, 
  IconInfoCircle 
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { motion } from 'framer-motion';

const CardTryout = ({ data }: any) => (
  <div className="bg-white p-6 w-full rounded-lg shadow-lg text-indigo-950">
    <div className="text-center text-lg md:text-2xl mb-2 md:mb-2 font-semibold">
      {data.nama}
    </div>
    <div className="h-0.5 md:h-1 w-2/3 bg-tertiary mx-auto mb-6"></div>
    <div className="flex flex-col mb-8 justify-center items-center gap-3">
      <div className="flex gap-2 text-sm md:text-base">
        <IconFiles size={20} />
        File dapat diunduh
      </div>
      <div className="flex gap-2 text-sm md:text-base">
        <IconBook size={20} />
        Materi dapat langsung dibaca
      </div>
    </div>
    <div className="grid grid-cols-1 items-center gap-2">
      <Link
        to={data.link}
        target="_blank"
        className="w-full bg-indigo-900 text-white  py-2 rounded-md transition-all hover:bg-indigo-900 text-center text-sm md:text-base"
      >
        Lihat Materi
      </Link>
    </div>
  </div>
);

export default function Materi() {
  const [data, setData] = useState<any>({});
  const { id } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const account = useAuthStore((state) => state.user);
  const backPath = account?.role === 'ADMIN' ? '/dashboard' : '/my-class';
  const isLoaded = Object.keys(data).length > 0;

  const getDetailClass = async () => {
    getData(`user/find-my-class/${id}`).then((res: any) => {
      if (res.error) window.location.href = '/paket-pembelian';
      setData({ ...res, materi: res?.paketPembelian?.paketPembelianMateri });
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);

  if (isMobile) {
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
              { label: 'Materi', value: 'Materi', show: !isLoaded || (data?.materi?.length || 0) > 0 },
              { label: 'Bimbel', value: 'Bimbel', show: !isLoaded || (data?.paketPembelian?.paketPembelianBimbel?.length || 0) > 0 }
            ].filter(tab => tab.show).map((tab) => {
              const isActive = (tab.label === 'Materi');
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    if (tab.value === 'Materi') return;
                    if (tab.value === 'Bimbel') navigate(`/my-class/${id}/bimbel`);
                    else navigate(`/my-class/${id}/tryout?type=${tab.value}`);
                  }}
                  className={`flex-1 py-4 text-[13px] font-black transition-all relative whitespace-nowrap px-5 ${isActive ? 'text-[#14B8A6]' : 'text-gray-400'}`}
                >
                  <span className="uppercase tracking-tight">{tab.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabMobile"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#14B8A6] rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6">
           {/* Info Important */}
           <div className="bg-[#14B8A6]/5 rounded-2xl p-5 mb-6 border border-[#14B8A6]/20 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#14B8A6]/10 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="text-[#14B8A6]" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-950 mb-1">Materi Pembelajaran</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Silakan pelajari materi berikut untuk mempersiapkan diri menghadapi ujian ASN.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {data?.materi?.map((item: any, index: number) => (
              <CardTryout key={index} data={item} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb
        page={[
          { name: 'Paket saya', link: '/my-class' },
          {
            name: data?.paketPembelian?.nama || 'Nama Kelas',
            link: '/my-class',
          },
          { name: 'Materi', link: '#' },
        ]}
      />
      <h1 className="self-center text-2xl text-indigo-950 font-bold text-center mb-5">
        Materi {data?.paketPembelian?.nama}
      </h1>
      <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 mt-4">
          {data?.materi?.map((item: any, index: number) => (
            <CardTryout key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
