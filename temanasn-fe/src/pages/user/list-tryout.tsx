import BreadCrumb from '@/components/breadcrumb';
import TutorialGroup from '@/components/tutorial-group';
import { hitungJumlahBankSoal } from '@/const';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { 
  IconArrowLeft, 
  IconDotsVertical, 
  IconFileText, 
  IconClock, 
  IconChartBar, 
  IconInfoCircle,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const MobileCardTryout = ({ data, id, isBimbel }: any) => {
  const navigate = useNavigate();
  const tryoutData = data?.[isBimbel ? 'paketLatihan' : 'PaketLatihan'];
  const isDone = data?.status === 'SUCCESS' || (data?.riwayatCount || 0) > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-4 p-5"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[15px] font-black text-indigo-950 leading-tight w-3/4">
          {tryoutData?.nama}
        </h3>
        {isDone && (
          <span className="bg-emerald-50 text-emerald-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
            SELESAI
          </span>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-gray-400">
          <IconFileText size={16} />
          <span className="text-xs font-bold">{hitungJumlahBankSoal(isBimbel ? data.paketLatihan : data)} Soal</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <IconClock size={16} />
          <span className="text-xs font-bold">{tryoutData?.waktu} Menit</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <button 
          onClick={() => navigate(isBimbel ? `/my-class/${id}/bimbel/mini-test/${data.id}/${tryoutData?.id}` : `/my-class/${id}/tryout/${data.id}/${tryoutData?.id}`)}
          className="bg-[#1E3A8A] text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-transform"
        >
          {isDone ? 'Kerjakan Lagi' : 'Kerjakan'}
        </button>
        <button 
          onClick={() => navigate(isBimbel ? `/my-class/${id}/bimbel/mini-test/${data.id}/${tryoutData?.id}/riwayat` : `/my-class/${id}/tryout/${data.id}/${tryoutData?.id}/riwayat`)}
          className="border border-gray-200 text-indigo-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-transform"
        >
          Riwayat
        </button>
      </div>

      <button 
        onClick={() => navigate(isBimbel ? `/my-class/${id}/bimbel/mini-test/${data.id}/${tryoutData?.id}/ranking` : `/my-class/${id}/tryout/${data.id}/${tryoutData?.id}/ranking`)}
        className="w-full bg-gray-50 text-[#1E3A8A] font-black py-2.5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <IconChartBar size={16} />
        Lihat Ranking
      </button>

      {isDone && data?.updatedAt && (
        <p className="mt-4 text-center text-[10px] text-gray-400 font-medium italic">
          Dikerjakan: {new Date(data.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      )}
    </motion.div>
  );
};

const CardTryout = ({ data, id, isBimbel }: any) => (
  <div className="bg-white p-6 w-full rounded-lg shadow-lg">
    <div className="text-center text-2xl mb-4 font-semibold">
      {data?.[isBimbel ? 'paketLatihan' : 'PaketLatihan']?.nama}
    </div>
    <div className="h-1 w-2/3 bg-tertiary mx-auto mb-6"></div>

    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold">Jumlah:</span>
      <span>
        {hitungJumlahBankSoal(isBimbel ? data.paketLatihan : data)} Soal
      </span>
    </div>

    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold">Durasi:</span>
      <span>
        {data?.[isBimbel ? 'paketLatihan' : 'PaketLatihan']?.waktu} Menit
      </span>
    </div>

    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold">Ranking:</span>
      <span>
        <Link
          to={
            isBimbel
              ? `/my-class/${id}/bimbel/mini-test/${data.id}/${data?.paketLatihan?.id}/ranking`
              : `/my-class/${id}/tryout/${data.id}/${data?.PaketLatihan?.id}/ranking`
          }
          className="text-[#1E3A8A] underline text-sm"
        >
          Lihat Ranking
        </Link>
      </span>
    </div>

    <div className="mb-6 bg-[#1E3A8A]/10 px-4 py-3 text-[#1E3A8A] text-sm italic rounded">
      Ranking hanya dihitung pada saat pertama kali mengerjakan soal ini.
    </div>

    <div className="grid grid-cols-2 items-center gap-2">
      <Link
        to={
          isBimbel
            ? `/my-class/${id}/bimbel/mini-test/${data.id}/${data?.paketLatihan?.id}`
            : `/my-class/${id}/tryout/${data.id}/${data?.PaketLatihan?.id}`
        }
        className="w-full bg-indigo-900 text-white  py-2 rounded-md transition-all hover:bg-indigo-900 text-center"
      >
        Kerjakan
      </Link>
      <Link
        to={
          isBimbel
            ? `/my-class/${id}/bimbel/mini-test/${data.id}/${data?.paketLatihan?.id}/riwayat`
            : `/my-class/${id}/tryout/${data.id}/${data?.PaketLatihan?.id}/riwayat`
        }
        className="w-full border border-indigo-900 text-indigo-900  py-2 rounded-md transition-all hover:bg-indigo-900 hover:text-white text-center"
      >
        Riwayat
      </Link>
    </div>
  </div>
);

export default function ListTryout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const account = useAuthStore((state) => state.user);
  const backPath = account?.role === 'ADMIN' ? '/dashboard' : '/my-class';

  const [data, setData] = useState<any>({});
  const [visible, setVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'Tryout';
  const isLoaded = Object.keys(data).length > 0;

  const getDetailClass = async () => {
    getData(`user/find-my-class/${id}`).then((res) => {
      if (res.error) window.location.href = '/paket-pembelian';
      setData({
        ...res,
        tryout: res?.paketPembelian?.paketPembelianTryout,
        bimbel: res?.paketPembelian?.paketPembelianBimbel,
      });
    });
  };

  useEffect(() => {
    getDetailClass();
    if (!searchParams.get('type')) setSearchParams({ type: 'Tryout' });
  }, []);

  const renderTryout = () => {
    const list = type === 'Bimbel'
      ? data?.bimbel?.filter((e: any) => e.paketLatihanId)
      : data?.tryout;

    if (!list) return null;

    return list.map((e: any) => (
      isMobile 
        ? <MobileCardTryout key={e.id} data={e} id={id} isBimbel={type === 'Bimbel'} />
        : <CardTryout key={e.id} data={e} id={id} isBimbel={type === 'Bimbel'} />
    ));
  };

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
              { label: 'Tryout', value: 'Tryout', show: !isLoaded || (data?.tryout?.length || 0) > 0 },
              { label: 'Materi', value: 'Materi', show: !isLoaded || (data?.paketPembelian?.paketPembelianMateri?.length || 0) > 0 },
              { label: 'Bimbel', value: 'Bimbel', show: !isLoaded || (data?.bimbel?.length || 0) > 0 }
            ].filter(tab => tab.show).map((tab) => {
              const isActive = (tab.value === 'Tryout' && (type === 'Tryout' || type === 'Pendahuluan' || type === 'Pemantapan')) || (tab.value === type);
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    if (tab.value === 'Materi') navigate(`/my-class/${id}/materi`);
                    else if (tab.value === 'Bimbel') navigate(`/my-class/${id}/bimbel`);
                    else setSearchParams({ type: tab.value });
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

        <div className="px-6">
          {/* Info Important */}
          <div className="bg-[#1E3A8A]/5 rounded-2xl p-5 mb-6 border border-[#1E3A8A]/20 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center flex-shrink-0">
              <IconInfoCircle className="text-[#1E3A8A]" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-indigo-950 mb-1">Info Penting</h4>
              <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                Ranking hanya dihitung pada saat pertama kali mengerjakan soal ini. Pastikan koneksi internet Anda stabil.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {isLoaded && 
              (data?.tryout?.length || 0) === 0 && 
              (data?.bimbel?.length || 0) === 0 && 
              (data?.paketPembelian?.paketPembelianMateri?.length || 0) === 0 ? (
              <div className="py-20 text-center bg-white rounded-[40px] shadow-sm border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconInfoCircle size={32} className="text-gray-200" />
                </div>
                <h3 className="text-gray-950 font-black text-sm uppercase tracking-widest">Tidak ada pembelajaran</h3>
                <p className="text-gray-400 font-medium text-xs mt-2 px-10">Paket ini belum memiliki konten tryout, materi, atau bimbel.</p>
              </div>
            ) : (
              renderTryout()
            )}
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
          { name: 'Tryout', link: '#' },
        ]}
      />
      <div className=" rounded-2xl">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title flex justify-between w-full mb-4">
            <h1 className="self-center text-2xl text-indigo-950 font-bold">
              Tryout {data?.paketPembelian?.nama}
              <div className="mt-4">
                <button
                  className="self-center p-0 m-0 relative mt-2 rounded-xl text-primary hover:underline flex items-center"
                  onClick={() => setVisible(true)}
                >
                  <span className="text-xs relative">
                    Masuk group dan baca petunjuk Tryout
                  </span>
                </button>
              </div>
            </h1>
          </div>
        </div>

        {visible && (
          <TutorialGroup
            title={`Petunjuk Tryout `}
            setVisible={setVisible}
            detail={data?.paketPembelian?.panduan}
          />
        )}
        <div className="flex items-center gap-3 mb-6">
          {['Tryout', 'Bimbel']
            .filter((item) => item !== 'Bimbel' || (data?.bimbel && data?.bimbel?.length > 0))
            .map((item) => (
              <button
                key={item}
                onClick={() => {
                  setSearchParams({ type: item });
                }}
                className={`text-gray-700 py-2 px-8 border rounded border-indigo-900 transition-all hover:bg-indigo-900 hover:text-white ${
                  searchParams.get('type') === item
                    ? ' shadow-[4px_4px_0px_#facc15] bg-indigo-900 text-white'
                    : ' bg-white'
                }`}
              >
                {item}
              </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5 mt-4">
          {renderTryout()}
        </div>
      </div>
    </div>
  );
}
