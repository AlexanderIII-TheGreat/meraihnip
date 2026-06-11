import CKeditor from "@/components/ckeditor";
import { useHomeStore } from "@/stores/home-stores";
import { useAuthStore } from "@/stores/auth-store";
import { imageLink } from "@/utils/image-link";
import { formatCurrency } from "@/utils/number-format";
import {
  IconBuildingBank,
  IconUsersGroup,
  IconBell,
  IconShoppingCart,
  IconReceipt,
  IconUsers,
  IconTicket,
  IconCalendar,
  IconFileText,
  IconBolt,
  IconHourglassHigh,
  IconCircleCheck,
  IconCircleX,
  IconStarFilled
} from "@tabler/icons-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { getData, postData } from "@/utils/axios";
import { MessagePlugin } from "tdesign-react";
import { useEffect, useState, useRef } from "react";
import Form from "@/components/form";
import Input from "@/components/input";
import { useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import UserAvatar from "@/components/user-avatar";

const generateIcon = (status: string) => {
  switch (status) {
    case 'PAYMENT_PENDING': return <IconHourglassHigh className="text-warning" size={30} />;
    case 'PAYMENT_SUCCESS': return <IconCircleCheck className="text-success" size={30} />;
    case 'PAYMENT_FAILED':  return <IconCircleX className="text-red-500" size={30} />;
    default: return null;
  }
};

const formatNumber = (value: any) => new Intl.NumberFormat('id-ID').format(value ?? 0);

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const data = useHomeStore((state) => state);
  const { user, token, isHasShow, setIsHasShow, logout } = useAuthStore();

  const [notification, setNotification]   = useState<any>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(true);
  const [feedbackModal, setFeedbackModal]  = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn]        = useState(!!token);
  const [isSubmitting, setIsSubmitting]    = useState(false);
  const [testimonials, setTestimonials]    = useState<any[]>([]);
  const [events, setEvents]               = useState<any[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

  const handleExportCalendar = () => {
    if (!events || events.length === 0) {
      MessagePlugin.warning("Tidak ada agenda untuk diexport");
      return;
    }
    const headers = ["Title", "Start Date", "End Date"];
    const rows = events.map(e => [
      `"${(e.title || '').replace(/"/g, '""')}"`,
      moment(e.start).format("YYYY-MM-DD HH:mm"),
      moment(e.end).format("YYYY-MM-DD HH:mm")
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agenda-bimbel-${moment(currentCalendarDate).format("YYYY-MM")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    MessagePlugin.success("Agenda berhasil diexport!");
  };

  const [latestPaket, setLatestPaket]     = useState<any[]>([]);
  const [activeMenuLinks, setActiveMenuLinks] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu]   = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab]     = useState<'SYSTEM'|'USER'>('SYSTEM');

  const profileMenuRef      = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const { setData: setHomeData } = useHomeStore();

  const getDetail = async () => {
    getData('dashboard/user').then((res: any) => { if (!res?.error) setHomeData(res); });
  };

  const readData = async (id: number, url: string) => {
    await postData('user/notification/read', { id });
    window.location.href = url;
  };

  const handleReadAll = async () => {
    await postData('user/notification/read-all');
    getDetail();
  };

  const handleLogout = () => { logout(); navigate('/'); window.location.reload(); };

  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return moment(d).format('DD MMM');
    }),
    datasets: [{
      label: 'Tryout Dikerjakan',
      data: [0,0,0,0,0,0,0],
      borderColor: 'rgb(30, 58, 138)',
      backgroundColor: 'rgba(30, 58, 138, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointBackgroundColor: 'rgb(30, 58, 138)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        suggestedMin: 0,
        suggestedMax: 4,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#94a3b8',
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
          }
        },
        grid: {
          display: false,
        }
      }
    }
  };


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setShowProfileMenu(false);
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setIsLoggedIn(!!token); }, [token]);

  useEffect(() => {
    getData('admin/testimoni/get?take=6&sortBy=createdAt&descending=true').then((res) => {
      if (res?.list) setTestimonials(res.list);
    });
    getData('user/event/get?take=100&sortBy=startDate&descending=false').then((res) => {
      if (res?.list) setEvents(res.list.map((e: any) => ({ title: e.nama, start: new Date(e.startDate), end: new Date(e.endDate) })));
    });
    getData('sidebar-menu/get').then((res: any) => {
      if (res?.list) setActiveMenuLinks(res.list.filter((m: any) => m.isActive).map((m: any) => m.link));
    });
    getData('user/tryout/my-tryout', { take: 8, sortBy: 'createdAt', descending: true }).then((res) => {
      if (res?.list) setLatestPaket(res.list);
    });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const notifRes = await getData('dashboard-notification');
        setNotification((notifRes?.list || []).find((i: any) => i.status === 'active') || null);
        const dashRes = await getData('dashboard/user');
        if (dashRes?.chartData) {
          const styledChartData = {
            ...dashRes.chartData,
            datasets: (dashRes.chartData.datasets || []).map((ds: any) => ({
              ...ds,
              borderColor: 'rgb(30, 58, 138)',
              backgroundColor: 'rgba(30, 58, 138, 0.1)',
              tension: 0.4,
              fill: true,
              borderWidth: 3,
              pointBackgroundColor: 'rgb(30, 58, 138)',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            }))
          };
          setChartData(styledChartData);
        }
        data.setData(dashRes);
        if (isLoggedIn && user?.id && !isHasShow) {
          const [settingsRes, feedbackRes] = await Promise.all([
            getData('/user/feedback-settings'),
            getData(`/user/feedbacksUser?userId=${user.id}`),
          ]);
          if ((settingsRes?.[0]?.isActive || false) && !(feedbackRes?.hasFeedback || false)) {
            setFeedbackModal({ title: 'Berikan Feedback Anda', message: 'Kami ingin mendengar pendapat Anda!' });
            setIsHasShow(true);
          }
        }
      } catch (err) {
        console.error(err);
        MessagePlugin.error('Gagal ambil data');
      }
    };
    load();
  }, [isLoggedIn, user?.id, isHasShow, setIsHasShow]);

  const handleFeedbackSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await postData('/user/feedbacks', { userId: user?.id, pekerjaan: formData.pekerjaan || '', rating: Number(formData.rating), saran: formData.saran || '' });
      MessagePlugin.success('Feedback berhasil disimpan');
      setFeedbackModal(null);
    } catch (err: any) {
      MessagePlugin.error(err.message || 'Gagal menyimpan feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFeedbackModal = () => {
    if (!feedbackModal) return null;
    const fb = feedbackModal as any;
    const daysUsed = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000) : 0;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
        <div className="bg-white p-6 rounded-[30px] shadow-lg max-w-md w-[90%]">
          <h3 className="text-lg font-black text-indigo-950 mb-2">{fb.title}</h3>
          <p className="text-xs text-gray-500 mb-4">{fb.message}</p>
          <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-bold">
            Kamu sudah menggunakan website ini selama <span className="text-[#07A97B]">{daysUsed}</span> hari
          </p>
          <Form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <Input title="Pekerjaan" name="pekerjaan" type="text" placeholder="Masukkan pekerjaan (opsional)" validation={{ required: false }} />
            <Input title="Rating (1-5)" name="rating" type="number" placeholder="Masukkan rating (1-5)"
              validation={{ required: 'Rating wajib diisi', min: { value: 1, message: 'Min 1' }, max: { value: 5, message: 'Max 5' } }} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-700 ml-1">Saran</label>
              <textarea name="saran" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm" placeholder="Masukkan saran (opsional)" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500"
                onClick={() => setFeedbackModal(null)} disabled={isSubmitting}>Tutup</button>
              <button type="submit" className="px-6 py-2 bg-[#00419C] text-white rounded-xl text-sm font-bold" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim...' : 'Kirim Feedback'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    );
  };

  // ─── MOBILE VIEW ──────────────────────────────────────────────────────────
  if (isMobile && user?.role === 'USER') {
    const localizer = momentLocalizer(moment);

    // Kategori paket — statis sesuai permintaan
    const kategoriPaket = [
      { label: 'Semua Paket', sub: 'Semua kategori',   path: '/paket-pembelian',                           bg: '#f0f7ff', border: '#bae6fd', stroke: '#0284c7',
        icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
      { label: 'Rekrutmen',   sub: 'BUMN & swasta',    path: '/paket-pembelian?category=Rekrutmen',        bg: '#dbeafe', border: '#a5cbfb', stroke: '#1e40af',
        icon: <><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></> },
      { label: 'Uji Kom',     sub: 'Kompetensi',       path: '/paket-pembelian?category=Uji+Kom',          bg: '#f0f7ff', border: '#bae6fd', stroke: '#0369a1',
        icon: <><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></> },
      { label: 'CPNS / PPPK', sub: 'ASN 2026-2027',         path: '/paket-pembelian?category=CPNS',             bg: '#f0f7ff', border: '#bae6fd', stroke: '#0284c7',
        icon: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></> },
      { label: 'Polri / TNI', sub: 'Kedinasan',         path: '/paket-pembelian?category=Polri',            bg: '#f0f7ff', border: '#bae6fd', stroke: '#0369a1',
        icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></> },
      { label: 'Lainnya',     sub: 'Semua paket',       path: '/paket-pembelian',                           bg: '#f8fafc', border: '#e2e8f0', stroke: '#0284c7',
        icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></> },
    ];

    // Akses cepat — tone mint/teal soft
    const aksesCepat = [
      { label: 'Paket Saya', sub: 'Kelas aktif',       path: '/my-class',
        icon: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></> },
      { label: 'Transaksi',  sub: 'Riwayat beli',      path: '/paket-pembelian/riwayat',
        icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></> },
      { label: 'Bantuan',    sub: 'Support ticket',     path: '/my-tickets',
        icon: <><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.77 1.18 2 2 0 012.76 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.07-1.07a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></> },
      { label: 'Affiliate',  sub: 'Komisi referral',    path: '/profile?tab=affiliate',
        icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></> },
    ];

    // Bottom nav

    // Warna avatar testimoni
    const avatarColors = ['#1e40af','#065f46','#b91c1c','#7e22ce','#c2410c','#0891b2'];

    return (
      <div className="min-h-screen bg-gray-50 pb-24 -mt-4 w-[100vw] relative left-1/2 -translate-x-1/2 overflow-x-hidden">
        {renderFeedbackModal()}

        {/* ── Header ── */}
        <div className="bg-gradient-to-b from-[#07A97B] to-[#00419C] pt-10 pb-8 px-6 rounded-b-[40px] relative">
          <div className="flex justify-between items-start">

            {/* Avatar + nama */}
            <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="active:scale-95 transition-transform">
                <UserAvatar name={user?.name} image={user?.gambar} size={48} />
              </button>
              <div>
                <h1 className="text-white text-lg font-black tracking-tight">
                  Halo, {user?.name?.split(' ')[0]} {user?.name?.split(' ')[1] || ''}
                </h1>
              </div>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div initial={{ opacity:0, y:-10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.95 }}
                    className="absolute top-14 left-0 w-40 bg-white rounded-2xl shadow-2xl z-[100] overflow-hidden border border-gray-100">
                    <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                      className="w-full px-5 py-3 text-left text-sm font-bold text-indigo-950 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                      Profil Saya
                    </button>
                    <button onClick={handleLogout}
                      className="w-full px-5 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2">
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifikasi */}
            <div className="relative" ref={notificationMenuRef}>
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md relative">
                <IconBell size={24} className="text-white" />
                {(data?.notifikasi?.filter((e:any) => !e?.isRead)?.length || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1E3A8A]"></div>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity:0, y:10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:10, scale:0.95 }}
                    className="absolute top-14 right-0 w-[calc(100vw-48px)] max-w-sm bg-white rounded-[30px] shadow-2xl z-[100] overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-black text-indigo-950 text-base">NOTIFIKASI</h3>
                      {(data?.notifikasi?.filter((e:any) => !e?.isRead)?.length || 0) > 0 && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
                          {data?.notifikasi?.filter((e:any) => !e?.isRead).length} BARU
                        </span>
                      )}
                    </div>
                    <div className="flex border-b border-gray-50">
                      {(['SYSTEM','USER'] as const).map(tab => (
                        <button key={tab} onClick={() => setNotificationTab(tab)}
                          className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-colors ${notificationTab===tab ? 'text-[#1E3A8A] border-b-2 border-[#1E3A8A]' : 'text-gray-400'}`}>
                          {tab === 'SYSTEM' ? 'Untuk Kamu' : 'Terbaru & Update'}
                        </button>
                      ))}
                    </div>
                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                      {(data?.notifikasi?.filter((e:any) => e?.type === notificationTab)?.length || 0) > 0
                        ? data?.notifikasi?.filter((e:any) => e?.type === notificationTab).map((e:any) => (
                            <button key={e.id} onClick={() => readData(e?.id, e.url || e?.notification?.url)}
                              className={`w-full p-4 flex gap-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50/50 ${!e?.isRead ? 'bg-teal-50/30' : ''}`}>
                              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                {e?.notification?.icon
                                  ? <span dangerouslySetInnerHTML={{ __html: e?.notification?.icon }} className="scale-75" />
                                  : generateIcon(e.status)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-black text-indigo-950 mb-1 leading-tight">{e.title || e?.notification?.title}</h4>
                                <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">{e.keterangan || e?.notification?.keterangan}</p>
                                <span className="text-[10px] font-bold text-[#1E3A8A] mt-2 block uppercase tracking-tighter">
                                  {moment(e.createdAt || e?.notification?.createdAt).fromNow()}
                                </span>
                              </div>
                            </button>
                          ))
                        : (
                          <div className="py-12 px-6 text-center">
                            <IconBell size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-xs font-bold text-gray-400 italic">Belum ada notifikasi di kategori ini</p>
                          </div>
                        )}
                    </div>
                    <button onClick={handleReadAll}
                      className="w-full py-4 text-xs font-black text-[#1E3A8A] bg-gray-50 hover:bg-gray-100 transition-colors uppercase tracking-widest">
                      Tandai semua sudah dibaca
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Stats floating ── */}
        <div className="mx-4 -mt-4 relative z-10 bg-white rounded-[22px] shadow-[0_6px_24px_rgba(0,65,156,.13)] px-2 py-3">
          <div className="grid grid-cols-4">
            {[
              { v: `${formatNumber(data?.user ?? 0)}+`,         l: 'Pengguna' },
              { v: `${formatNumber(data?.soal ?? 0)}+`,         l: 'Bank Soal' },
              { v: formatNumber(data?.paketSaya ?? 0),          l: 'Paket Saya' },
              { v: formatNumber(data?.paketTersedia ?? 0),      l: 'Tersedia' },
            ].map((s, i) => (
              <div key={i} className={`flex flex-col items-center gap-1 py-1 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                <span className="text-[13px] font-black text-slate-900">{s.v}</span>
                <span className="text-[9px] font-semibold text-gray-400 text-center leading-tight">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Banner — slider asli dipertahankan ── */}
        <div className="mt-5 relative z-10 overflow-hidden">
          {!data?.section ? (
            <div className="mx-5 rounded-[20px] bg-gray-200 animate-pulse aspect-[2.2/1] w-full" />
          ) : data?.section?.filter((e) => e?.tipe === 'BANNER')?.length > 0 ? (
            <Carousel autoPlay infiniteLoop showStatus={false} showIndicators showThumbs={false} interval={3000}
              className="rounded-[20px] overflow-hidden shadow-2xl shadow-teal-900/10 mx-5">
              {data?.section?.filter((e) => e?.tipe === 'BANNER')?.map((e) => (
                <div key={e?.id} onClick={() => e?.url && window.open(e.url, '_blank')} className="relative group">
                  <img src={imageLink(e?.gambar)} alt="Banner" className="w-full h-auto object-contain" />
                </div>
              ))}
            </Carousel>
          ) : null}
        </div>

        {/* ── Menu ── */}
        <div className="px-5 mt-8">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3">Menu</h2>

          {/* Sub-label: Kategori Paket */}
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-0.5">Kategori Paket</p>
          <div className="flex flex-col gap-2 mb-4">
            {[0,1,2].map(rowIdx => (
              <div key={rowIdx} className="grid grid-cols-2 gap-2">
                {kategoriPaket.slice(rowIdx*2, rowIdx*2+2).map((item) => (
                  <button key={item.label} onClick={() => navigate(item.path)}
                    className="flex items-center gap-2.5 bg-white rounded-[13px] px-3 py-2.5 border active:scale-95 transition-transform text-left"
                    style={{ borderColor: item.border }}>
                    <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                      <svg width="16" height="16" fill="none" stroke={item.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-700 text-slate-800 leading-tight font-bold truncate">{item.label}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Sub-label: Akses Cepat */}
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-0.5">Akses Cepat</p>
          <div className="flex flex-col gap-2">
            {[0,1].map(rowIdx => (
              <div key={rowIdx} className="grid grid-cols-2 gap-2">
                {aksesCepat.slice(rowIdx*2, rowIdx*2+2).map((item) => (
                  <button key={item.label} onClick={() => navigate(item.path)}
                    className="flex items-center gap-2.5 rounded-[13px] px-3 py-2.5 border active:scale-95 transition-transform text-left"
                    style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                    <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(30, 58, 138, 0.12)' }}>
                      <svg width="16" height="16" fill="none" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#1e3a8a] leading-tight truncate">{item.label}</div>
                      <div className="text-[9px] text-[#1e40af] mt-0.5">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Paket Terbaru ── */}
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Paket Terbaru</h2>
            <button onClick={() => navigate('/paket-pembelian')} className="text-[10px] font-bold text-[#07A97B]">Lihat semua</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {latestPaket.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="min-w-[130px] h-[185px] bg-white rounded-[14px] animate-pulse flex-shrink-0 border border-gray-100" />
                ))
              : latestPaket.map((item) => {
                  const catName = item?.paketPembelianCategory?.[0]?.nama || '';
                  // cari warna dari daftar kategori
                  const found = kategoriPaket.find(k => k.label === catName || k.label.includes(catName) || catName.includes(k.label));
                  const bg     = found?.bg     || '#f1f5f9';
                  const stroke = found?.stroke || '#475569';
                  const sudahBeli = item?._count?.Pembelian > 0;
                  return (
                    <button key={item.id} onClick={() => navigate('/paket-pembelian')}
                      className="min-w-[130px] max-w-[130px] bg-white rounded-[14px] overflow-hidden flex-shrink-0 border border-gray-100 active:scale-95 transition-transform text-left">
                      {item.gambar
                        ? <div className="w-full h-[64px] overflow-hidden"><img src={imageLink(item.gambar)} alt={item.nama} className="w-full h-full object-cover object-top" /></div>
                        : <div className="w-full h-[64px] flex items-center justify-center" style={{ background: bg }}>
                            <svg width="24" height="24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                            </svg>
                          </div>
                      }
                      <div className="p-2">
                        {catName && (
                          <span className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded inline-block mb-1"
                            style={{ background: bg, color: stroke }}>{catName}</span>
                        )}
                        <p className="text-[10px] font-bold text-slate-800 leading-tight mb-1 line-clamp-2">{item.nama}</p>
                        <p className="text-[11px] font-black text-[#00419C]">{formatCurrency(item.harga)}</p>
                        <div className="mt-1.5 w-full py-1 rounded text-center text-[9px] font-black"
                          style={{ background: sudahBeli ? '#f1f5f9' : '#00419C', color: sudahBeli ? '#94a3b8' : '#fff' }}>
                          {sudahBeli ? 'Sudah Dimiliki' : 'Lihat Detail'}
                        </div>
                      </div>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* ── Target Progress ── */}
        <div className="px-5 mt-8 space-y-4">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Target & Progres Belajar</h2>
          
          {/* Tryout Saya card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-indigo-950 text-xs">Tryout Saya</h4>
                  <p className="text-[9px] text-gray-400">Total Latihan Soal</p>
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600">{data?.tryoutSayaStats?.selesai || 0}/{data?.tryoutSayaStats?.total || 0} Selesai</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(data?.tryoutSayaStats?.rataRata || 0, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span>Rerata: {data?.tryoutSayaStats?.rataRata || 0}%</span>
              <span>Target: {data?.tryoutSayaStats?.target || 10} Paket</span>
            </div>
          </div>

          {/* Tryout Akbar card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-indigo-950 text-xs">Tryout Akbar</h4>
                    <span className="bg-rose-500 text-white text-[8px] font-bold px-1 rounded-full">Ke-1</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Simulasi Ujian Nasional</p>
                </div>
              </div>
              <span className="text-sm font-bold text-rose-600">{data?.tryoutAkbarStats?.selesai || 0}/{data?.tryoutAkbarStats?.total || 0} Selesai</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${Math.min(data?.tryoutAkbarStats?.rataRata || 0, 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-500">
              <span>Rerata: {data?.tryoutAkbarStats?.rataRata || 0}%</span>
              <span>Target: {data?.tryoutAkbarStats?.target || 5} Akbar</span>
            </div>
          </div>
        </div>

        {/* ── Berita & Update ── */}
        <div className="px-5 mt-8">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3">Berita & Update</h2>
          <div className="space-y-3">
            {data?.berita && data.berita.length > 0 ? (
              data.berita.map((item: any) => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-gray-50 flex gap-3 shadow-sm">
                  <img src={imageLink(item.gambar || 'public/BANNER_DEFAULT.png')} alt={item.judul} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-indigo-950 line-clamp-2 leading-snug">{item.judul}</h4>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[8px] text-gray-400">{moment(item.createdAt).format('DD MMM YYYY')}</span>
                      <span className="text-[9px] text-indigo-600 font-bold cursor-pointer" onClick={() => navigate('/paket-pembelian')}>Beli Paket</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-[10px] italic py-4">Belum ada berita terbaru</p>
            )}
          </div>
        </div>

        {/* ── Testimoni ── */}
        <div className="px-5 mt-8">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3">Testimoni Pengguna</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {testimonials.map((item: any, index: number) => (
              <div key={item.id} className="min-w-[280px] bg-white p-5 rounded-[22px] shadow-sm border border-gray-50 flex gap-4">
                <div className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black"
                  style={{ background: avatarColors[index % avatarColors.length] }}>
                  {item.nama.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-indigo-950 text-base leading-tight">{item.nama}</h4>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStarFilled key={i} size={14} className={i < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic mt-1 leading-relaxed line-clamp-2">"{item.isi}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>
    );
  }

  // ─── DESKTOP VIEW — tidak diubah ─────────────────────────────────────────
  const localizer = momentLocalizer(moment);

  return (
    <div className="w-[100%] overflow-hidden">
      {renderFeedbackModal()}
      {notification && showNotificationBanner && (
        <div className="mx-5 mt-5 mb-2 bg-[#f0f4ff] border border-indigo-100 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center gap-3.5 flex-1 mr-4">
            <div className="bg-indigo-600/10 text-indigo-600 p-2.5 rounded-xl flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                <span className="font-bold text-indigo-950 text-sm">{(notification as any).title}</span>
                <span className="hidden md:inline text-gray-300">|</span>
                <p className="text-xs text-gray-600 truncate leading-relaxed">{(notification as any).description}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {(notification as any).link && (
              <a 
                href={(notification as any).link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex-shrink-0"
              >
                Lihat Selengkapnya
              </a>
            )}
            <button 
              onClick={() => setShowNotificationBanner(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {!data?.section ? (
        <div className="mx-5 rounded-md bg-gray-200 animate-pulse aspect-[3/1] w-auto" />
      ) : data?.section?.filter((e) => e.tipe === 'BANNER')?.length > 0 ? (
        <Carousel autoPlay infiniteLoop swipeable emulateTouch interval={2000} showArrows={false} showThumbs={false} className="p-5 rounded-sm">
          {data?.section?.filter((e) => e.tipe === 'BANNER')?.map((e) => (
            <div className="cursor-grab" onClick={() => { if (e.url) window.open(e.url, '_blank'); }} key={e.id}>
              <img className="rounded-md w-full h-auto object-contain" src={imageLink(e.gambar)} alt="Banner" />
            </div>
          ))}
        </Carousel>
      ) : null}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-7 gap-y-7 mx-5">
        <div className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/my-class')}>
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-violet-700 rounded-full w-fit p-3"><IconBuildingBank className="text-white" /></div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.paketSaya)}</h3>
          <p className="text-sm text-gray-500">Paket Saya</p>
        </div>
        <div className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/paket-pembelian')}>
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-blue-700 rounded-full w-fit p-3"><IconUsersGroup className="text-white" /></div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.paketTersedia)}</h3>
          <p className="text-sm text-gray-500">Paket Tersedia</p>
        </div>
        <div className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/paket-pembelian')}>
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-orange-500 rounded-full w-fit p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m8-6H4m2-7h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.soal)}</h3>
          <p className="text-sm text-gray-500">Bank Soal</p>
        </div>
        <div className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition">
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-cyan-700 rounded-full w-fit p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20v-2a4 4 0 00-3-3.87m-7 5.87v-2a4 4 0 013-3.87m10-4a4 4 0 11-8 0 4 4 0 018 0zm-10 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.user)}</h3>
          <p className="text-sm text-gray-500">Siswa Tergabung</p>
        </div>
      </div>

      {/* Two-Column Grid: Left (Widgets) & Right (Promos / News) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-5 mt-7">
        
        {/* LEFT COLUMN (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-7">
          
          {/* Target Progress Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tryout Saya card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[140px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-950">Tryout Saya</h4>
                    <p className="text-[11px] text-gray-400">Total Latihan Soal</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-emerald-600">{data?.tryoutSayaStats?.selesai || 0}/{data?.tryoutSayaStats?.total || 0} <span className="text-xs text-gray-400 font-normal">Selesai</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(data?.tryoutSayaStats?.rataRata || 0, 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Rata-rata Target: {data?.tryoutSayaStats?.rataRata || 0}%</span>
                <span>Target: {data?.tryoutSayaStats?.target || 10} Paket</span>
              </div>
            </div>

            {/* Total Tryout / Streak card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[140px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-950">Total Tryout</h4>
                    <p className="text-[11px] text-gray-400">Simulasi Ujian & Latihan</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-rose-600">{ (data?.tryoutSayaStats?.total || 0) + (data?.tryoutAkbarStats?.total || 0) } <span className="text-xs text-gray-400 font-normal">Diikuti</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(data?.tryoutAkbarStats?.rataRata || 0, 100)}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Tryout Streak: <span className="text-rose-600 font-bold">{data?.tryoutStreak || 3} Hari</span></span>
                <span>Target: {data?.tryoutAkbarStats?.target || 5} Tryout</span>
              </div>
            </div>

          </div>

          {/* Aktivitas Belajar (Weekly Chart) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-[380px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="border-l-4 border-primary pl-3">
                <h3 className="text-lg font-bold text-indigo-950 leading-tight">Aktivitas Belajar</h3>
                <p className="text-gray-400 text-xs mt-1 font-medium">Monitoring waktu belajar mingguan</p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-2 px-4 flex items-center gap-4 border border-gray-100/50 self-start sm:self-center">
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-gray-400">Total Minggu Ini</p>
                  <p className="text-sm mt-0.5 font-bold">
                    <span className="text-gray-900">{data?.totalBelajarMingguIni || 0}</span>{" "}
                    <span className="text-[10px] font-normal text-gray-400">menit</span>
                  </p>
                </div>
                <div className="w-[1px] h-6 bg-gray-200" />
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-[#1E3A8A]">Rata-rata/Hari</p>
                  <p className="text-sm mt-0.5 font-bold">
                    <span className="text-[#1E3A8A]">{data?.rerataBelajarHarian || 0}</span>{" "}
                    <span className="text-[10px] font-normal text-[#1E3A8A]">menit</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <Line key={JSON.stringify(chartData.labels)} options={{ ...chartOptions, maintainAspectRatio: false }} data={chartData} />
            </div>
          </div>


          {/* Agenda Bimbel (Calendar) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-lg font-bold text-indigo-950">Agenda Bimbel</h2>
              </div>
              <button 
                onClick={handleExportCalendar} 
                className="border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>

            {/* Calendar View Card wrapper */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white flex flex-col">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-gray-50 text-gray-800 text-xs font-bold px-6 py-1.5 rounded-full select-none">
                  {moment(currentCalendarDate).format("MMMM YYYY")}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-50 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Grid of weekdays */}
              <div className="grid grid-cols-7 gap-x-2 text-center mb-4">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                  <div key={day} className="text-xs font-bold text-[#1E3A8A] select-none">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grid of days */}
              <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                {(() => {
                  const year = currentCalendarDate.getFullYear();
                  const month = currentCalendarDate.getMonth();
                  const firstDayIndex = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();
                  const dayCells = [];
                  
                  for (let i = 0; i < firstDayIndex; i++) {
                    dayCells.push(<div key={`empty-${i}`} className="h-10" />);
                  }
                  
                  const today = new Date();
                  for (let day = 1; day <= totalDays; day++) {
                    const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                    const hasEvent = events.some(event => {
                      const eventDate = new Date(event.start);
                      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
                    });
                    
                    dayCells.push(
                      <div key={`day-${day}`} className="h-10 flex flex-col justify-center items-center relative select-none">
                        {isToday ? (
                          <div className="border border-primary rounded-xl w-10 h-10 flex flex-col items-center justify-center font-bold text-primary mx-auto">
                            <span className="text-sm">{day}</span>
                            {hasEvent && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />}
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex flex-col items-center justify-center text-[#1E3A8A] font-bold mx-auto hover:bg-slate-50 rounded-xl cursor-pointer transition-all">
                            <span className="text-sm text-[#1E3A8A]">{day}</span>
                            {hasEvent && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return dayCells;
                })()}
              </div>
            </div>
          </div>


        </div>

        {/* RIGHT COLUMN (lg:col-span-1) */}
        <div className="lg:col-span-1 space-y-7">
          {(() => {
            const promoCards = data?.section?.filter((e: any) => e.tipe === 'CUSTOM') || [];
            const defaultPromoCards = [
              {
                id: 'default-1',
                title: 'Gabung Bimbel SKD CPNS 2026',
                keterangan: 'Join bersama kami dengan bergabung di paket Bimbel SKD CPNS 2026! Dapatkan pengalaman menarik dan insight terbaru dalam belajar dan mempersiapkan Tes SKD!',
                url: '/paket-pembelian',
                pekerjaan: 'Lihat Paket Sekarang!',
                bintang: 1,
              },
              {
                id: 'default-2',
                title: 'Gabung Tryout SKD CPNS Terbaru!',
                keterangan: 'Yuk cobain Tryout terbaru Viracun, soal-soal sudah disesuaikan dengan real test dan berdasarkan pengalaman peserta tahun 2024.',
                url: '/paket-pembelian',
                pekerjaan: 'Daftar paket sekarang!',
                bintang: 2,
              }
            ];

            const activePromoCards = promoCards.length > 0 ? promoCards : defaultPromoCards;

            const getPromoCardTheme = (themeValue: any) => {
              switch (Number(themeValue)) {
                case 2: // Deep Blue theme
                  return {
                    bg: 'bg-[#eff6ff]',
                    border: 'border-blue-100',
                    text: 'text-blue-700',
                    hover: 'hover:text-blue-900',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    ),
                  };
                case 3: // Blue
                  return {
                    bg: 'bg-[#eff6ff]',
                    border: 'border-blue-100',
                    text: 'text-blue-600',
                    hover: 'hover:text-blue-800',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  };
                case 4: // Slate/Navy
                  return {
                    bg: 'bg-slate-50',
                    border: 'border-slate-200',
                    text: 'text-slate-700',
                    hover: 'hover:text-slate-900',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  };
                case 1: // Indigo
                default:
                  return {
                    bg: 'bg-[#f0f4ff]',
                    border: 'border-indigo-100',
                    text: 'text-indigo-600',
                    hover: 'hover:text-indigo-800',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                  };
              }
            };

            return activePromoCards.map((promo: any) => {
              const theme = getPromoCardTheme(promo.bintang);
              return (
                <div 
                  key={promo.id} 
                  className={`${theme.bg} rounded-2xl p-6 shadow-sm border ${theme.border} flex flex-col justify-between h-[230px]`}
                >
                  <div>
                    <div className={`flex items-center gap-2 ${theme.text} font-bold text-sm mb-2`}>
                      {theme.icon}
                      <span>{promo.title}</span>
                    </div>
                    <p 
                      className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: promo.keterangan || '' }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (promo.url?.startsWith('http')) {
                        window.open(promo.url, '_blank');
                      } else {
                        navigate(promo.url || '/paket-pembelian');
                      }
                    }} 
                    className={`text-xs font-bold ${theme.text} ${theme.hover} text-left flex items-center gap-1 group`}
                  >
                    {promo.pekerjaan || 'Lihat Detail'} <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              );
            });
          })()}

          {/* Berita & Update */}
          <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col h-fit">
            <div className="mb-4 flex items-center gap-2 text-indigo-950">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="text-lg font-bold">Berita & Update</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {data?.berita && data.berita.length > 0 ? (
                data.berita.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-xl transition">
                    <img src={imageLink(item.gambar || 'public/BANNER_DEFAULT.png')} alt={item.judul} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 block mb-1">{moment(item.createdAt).format('DD MMMM YYYY')}</span>
                      <h4 className="text-xs font-bold text-indigo-950 line-clamp-2 leading-snug mb-1">{item.judul}</h4>
                      <p className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/paket-pembelian')}>Dengan paket sekarang</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 text-xs italic py-10">Belum ada berita terbaru</p>
              )}
            </div>
          </div>

        </div>

      </div>

      <div className="mx-5 mt-16 mb-4 text-center">
        <h2 className="text-3xl font-bold text-indigo-950 mb-2">Testimonial</h2>
        <p className="text-gray-500 text-sm max-w-xl mx-auto">Cerita sukses dan pengalaman dari para alumni yang telah berhasil meraih impian mereka bersama kami.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mx-5 my-8">
        {testimonials.length > 0 ? testimonials.map((item: any, index: number) => (
          <div 
            key={item.id} 
            className={`rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
              index % 2 === 1 ? 'bg-[#f0f6ff] border border-blue-100' : 'bg-white border border-gray-100'
            }`}
          >
            <p className="text-gray-700 text-sm leading-relaxed mb-6 font-medium">"{item.isi}"</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                  index % 3 === 0 ? 'bg-amber-500' : index % 3 === 1 ? 'bg-blue-500' : 'bg-emerald-600'
                }`}>
                  {item.nama.split(' ').map((n:any) => n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950">{item.nama}</h4>
                  <span className="text-[9px] font-bold text-blue-600 block uppercase tracking-wider leading-tight">{item.pekerjaan || 'PESERTA'}</span>
                </div>
              </div>
              <div className="flex text-yellow-400 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3.5 h-3.5 fill-current ${i < (item.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center text-gray-500 py-10">Belum ada testimoni</div>
        )}
      </div>
    </div>
  );
}
