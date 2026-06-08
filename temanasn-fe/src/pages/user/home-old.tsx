import CKeditor from "@/components/ckeditor";
import { useHomeStore } from "@/stores/home-stores";
import { useAuthStore } from "@/stores/auth-store";
import { imageLink } from "@/utils/image-link";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import UserAvatar from "@/components/user-avatar";

const generateIcon = (status: string) => {
  switch (status) {
    case 'PAYMENT_PENDING':
      return <IconHourglassHigh className="text-warning" size={30} />;
    case 'PAYMENT_SUCCESS':
      return <IconCircleCheck className="text-success" size={30} />;
    case 'PAYMENT_FAILED':
      return <IconCircleX className="text-red-500" size={30} />;
    default:
      return null;
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const data = useHomeStore((state) => state);
  const { user, token, isHasShow, setIsHasShow, logout } = useAuthStore();
  const [notification, setNotification] = useState<any>(null);
  const [feedbackModal, setFeedbackModal] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [events, setEvents] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const [activeMenuLinks, setActiveMenuLinks] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'SYSTEM' | 'USER'>('SYSTEM');

  const { setData: setHomeData } = useHomeStore();

  const getDetail = async () => {
    getData(`dashboard/user`).then((res: any) => {
      if (!res?.error) setHomeData(res);
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

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch Testimonials
    getData('admin/testimoni/get?take=3&sortBy=createdAt&descending=true').then((res) => {
      if (res?.list) {
        setTestimonials(res.list);
      }
    });

    // Fetch Events
    getData('user/event/get?take=100&sortBy=startDate&descending=false').then((res) => {
      console.log('Events Response:', res);
      if (res?.list) {
        const mappedEvents = res.list.map((e: any) => ({
          title: e.nama,
          start: new Date(e.startDate),
          end: new Date(e.endDate),
        }));
        setEvents(mappedEvents);
      }
    });

    // Fetch Sidebar Menu for dynamic visibility
    getData('sidebar-menu/get').then((res: any) => {
      if (res?.list) {
        const activeLinks = res.list
          .filter((m: any) => m.isActive)
          .map((m: any) => m.link);
        setActiveMenuLinks(activeLinks);
      }
    });
  }, []);
  // Calendar setup
  const localizer = momentLocalizer(moment);

  const formatNumber = (value: any) =>
    new Intl.NumberFormat("id-ID").format(value ?? 0);

  /* Chart Data State */
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 7 }, (_, i) => {
       const d = new Date();
       d.setDate(d.getDate() - (6 - i));
       return moment(d).format("DD MMM");
    }),
    datasets: [
      {
        label: "Tryout Dikerjakan",
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: "rgb(234, 88, 12)",
        backgroundColor: "rgba(234, 88, 12, 0.2)", 
        tension: 0.3,
        fill: true,
      }
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistik Belajar Mingguan',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
            display: false,
            text: 'Jumlah Soal'
        },
        ticks: {
          display: false,
          stepSize: 1,
          precision: 0
        }
      },
    },
  };


  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

   useEffect(() => {
    const load = async () => {
      try {
        // Fetch notification
        const notificationRes = await getData("dashboard-notification");
        const list = notificationRes?.list || [];
        const activeNotification = list.find((item: any) => item.status === "active") || null;
        setNotification(activeNotification);

        // Fetch Dashboard User Statistics
        const dashboardUserRes = await getData("dashboard/user");
        if (dashboardUserRes?.chartData) {
            setChartData(dashboardUserRes.chartData);
        }
        data.setData(dashboardUserRes);

        // Debug log
        console.log("Auth State:", { isLoggedIn, user, isHasShow });

        // Check feedback only if logged in, user exists, and modal hasn't been shown
        if (isLoggedIn && user?.id && !isHasShow) {
          const [settingsRes, feedbackRes] = await Promise.all([
            getData("/user/feedback-settings"),
            getData(`/user/feedbacksUser?userId=${user.id}`),
          ]);

          // Debug respons mentah
          console.log("Raw feedback settings response:", settingsRes);
          console.log("Raw feedback user response:", feedbackRes);

          const isFeedbackActive = settingsRes?.[0]?.isActive || false;
          const hasFeedback = feedbackRes?.hasFeedback || false;

          // Debug hasil parsing
          console.log("Parsed values:", {
            isFeedbackActive,
            hasFeedback,
            settingsRes,
            feedbackRes,
          });

          if (isFeedbackActive && !hasFeedback) {
            console.log("➡️ Kondisi terpenuhi: Feedback modal akan ditampilkan");
            setFeedbackModal({
              title: "Berikan Feedback Anda",
              message: "Kami ingin mendengar pendapat Anda untuk meningkatkan layanan kami!",
            });
            setIsHasShow(true);
          } else {
            console.log("❌ Kondisi tidak terpenuhi, modal tidak ditampilkan", {
              isFeedbackActive,
              hasFeedback,
            });
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        MessagePlugin.error("Gagal ambil data");
      }
    };

    load();
  }, [isLoggedIn, user?.id, isHasShow, setIsHasShow]);


  // Handle feedback form submission
  const handleFeedbackSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        pekerjaan: formData.pekerjaan || "",
        rating: Number(formData.rating),
        saran: formData.saran || "",
      };
      await postData("/user/feedbacks", payload);
      MessagePlugin.success("Feedback berhasil disimpan");
      setFeedbackModal(null); // Close modal on success
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      MessagePlugin.error(err.message || "Gagal menyimpan feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render feedback modal with form
  const renderFeedbackModal = () => {
    if (!feedbackModal) return null;
    const feedback = feedbackModal as any;

    const createdAt = user?.createdAt ? new Date(user.createdAt) : null;
    const now = new Date();
    const daysUsed = createdAt ? Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
        <div className="bg-white p-6 rounded-[30px] shadow-lg max-w-md w-[90%]">
          <h3 className="text-lg font-black text-indigo-950 mb-2">{feedback.title}</h3>
          <p className="text-xs text-gray-500 mb-4">{feedback.message}</p>

          <p className="text-[10px] text-gray-400 mb-6 uppercase tracking-widest font-bold">
            Kamu sudah menggunakan website ini selama <span className="text-[#14B8A6]">{daysUsed}</span> hari
          </p>

          <Form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <Input
              title="Pekerjaan"
              name="pekerjaan"
              type="text"
              placeholder="Masukkan pekerjaan (opsional)"
              validation={{ required: false }}
            />
            <Input
              title="Rating (1-5)"
              name="rating"
              type="number"
              placeholder="Masukkan rating (1-5)"
              validation={{
                required: "Rating wajib diisi",
                min: { value: 1, message: "Rating minimal 1" },
                max: { value: 5, message: "Rating maksimal 5" },
              }}
            />
            <div className="flex flex-col gap-1">
               <label className="text-xs font-bold text-gray-700 ml-1">Saran</label>
               <textarea
                 name="saran"
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:border-[#14B8A6] transition-colors cursor-text"
                 placeholder="Masukkan saran (opsional)"
               ></textarea>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                className="px-6 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500"
                onClick={() => setFeedbackModal(null)}
                disabled={isSubmitting}
              >
                Tutup
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-[#14B8A6] text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Feedback'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    );
  };


  if (isMobile && user?.role === 'USER') {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 -mt-4 w-[100vw] relative left-1/2 -translate-x-1/2 overflow-x-hidden">
        {renderFeedbackModal()}
        
        {/* Blue Gradient Header */}
        <div className="bg-gradient-to-b from-[#07A97B] to-[#00419C] pt-10 pb-8 px-6 rounded-b-[40px] relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="active:scale-95 transition-transform"
              >
                <UserAvatar 
                  name={user?.name} 
                  image={user?.gambar} 
                  size={48} 
                />
              </button>
              <div>
                <h1 className="text-white text-lg font-black tracking-tight">Halo, {user?.name?.split(' ')[0]} {user?.name?.split(' ')[1] || ''}</h1>
              </div>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-14 left-0 w-40 bg-white rounded-2xl shadow-2xl z-[100] overflow-hidden border border-gray-100"
                  >
                    <button 
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-5 py-3 text-left text-sm font-bold text-indigo-950 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50"
                    >
                      Profil Saya
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-5 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" ref={notificationMenuRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md relative"
              >
                <IconBell size={24} className="text-white" />
                {(data?.notifikasi?.filter((e: any) => !e?.isRead)?.length || 0) > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#14B8A6]"></div>
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
                      <h3 className="font-black text-indigo-950 text-base">NOTIFIKASI</h3>
                      {(data?.notifikasi?.filter((e: any) => !e?.isRead)?.length || 0) > 0 && (
                        <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full">
                          {data?.notifikasi?.filter((e: any) => !e?.isRead).length} BARU
                        </span>
                      )}
                    </div>
                    
                    <div className="flex border-b border-gray-50">
                      <button 
                        onClick={() => setNotificationTab('SYSTEM')}
                        className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-colors ${notificationTab === 'SYSTEM' ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]' : 'text-gray-400'}`}
                      >
                        Untuk Kamu
                      </button>
                      <button 
                        onClick={() => setNotificationTab('USER')}
                        className={`flex-1 py-3 text-xs font-black tracking-widest uppercase transition-colors ${notificationTab === 'USER' ? 'text-[#14B8A6] border-b-2 border-[#14B8A6]' : 'text-gray-400'}`}
                      >
                        Terbaru & Update
                      </button>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto no-scrollbar">
                      {(data?.notifikasi?.filter((e: any) => e?.type === notificationTab)?.length || 0) > 0 ? (
                        data?.notifikasi
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
                                <h4 className="text-sm font-black text-indigo-950 mb-1 leading-tight">
                                  {e.title || e?.notification?.title}
                                </h4>
                                <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed">
                                  {e.keterangan || e?.notification?.keterangan}
                                </p>
                                <span className="text-[10px] font-bold text-[#14B8A6] mt-2 block uppercase tracking-tighter">
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
                      className="w-full py-4 text-xs font-black text-[#14B8A6] bg-gray-50 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                    >
                      Tandai semua sudah dibaca
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Overlapping Banner */}
        <div className="mt-5 relative z-10 overflow-hidden">
          {!data?.section ? (
            // Skeleton while loading
            <div className="mx-5 rounded-[20px] bg-gray-200 animate-pulse aspect-[2.2/1] w-full" />
          ) : data?.section?.filter((e) => e?.tipe === "BANNER")?.length > 0 ? (
          <Carousel
            autoPlay
            infiniteLoop
            showStatus={false}
            showIndicators={true}
            showThumbs={false}
            interval={3000}
            className="rounded-[20px] overflow-hidden shadow-2xl shadow-teal-900/10 mx-5"
          >
            {data?.section
              ?.filter((e) => e?.tipe === "BANNER")
              ?.map((e) => (
                <div key={e?.id} onClick={() => e?.url && window.open(e.url, "_blank")} className="relative group">
                  <img src={imageLink(e?.gambar)} alt="Banner" className="w-full h-auto object-contain" />
                </div>
              ))}
          </Carousel>
          ) : null}
        </div>

        {/* Menu Layanan Section */}
        <div className="px-6 mt-10">
          <h2 className="text-xl font-black text-indigo-950 mb-6 uppercase tracking-widest pl-1">Menu Layanan</h2>
          <div className="grid grid-cols-3 gap-y-8">
            {[
              { label: 'Paket Saya', icon: <IconBuildingBank size={28} />, color: 'bg-blue-50 text-blue-600 shadow-blue-100', link: '/my-class' },
              { label: 'Beli Paket', icon: <IconShoppingCart size={28} />, color: 'bg-green-50 text-green-600 shadow-green-100', link: '/paket-pembelian' },
              { label: 'Riwayat Pembelian', icon: <IconReceipt size={28} />, color: 'bg-orange-50 text-orange-600 shadow-orange-100', link: '/paket-pembelian/riwayat' },
              { label: 'Generate Soal', icon: <IconBolt size={28} />, color: 'bg-yellow-50 text-yellow-600 shadow-yellow-100', link: '/generate-soal' },
              { label: 'Affiliate', icon: <IconUsers size={28} />, color: 'bg-violet-50 text-violet-600 shadow-violet-100', link: '/profile?tab=affiliate' },
              { label: 'Layanan Bantuan', icon: <IconTicket size={28} />, color: 'bg-red-50 text-red-600 shadow-red-100', link: '/my-tickets' },
              { label: 'Kalender', icon: <IconCalendar size={28} />, color: 'bg-cyan-50 text-cyan-600 shadow-cyan-100', link: '/event' },
            ].filter(item => {
              // Core items that should bypass the sidebar setting
              if (item.link === '/my-class') return true;
              if (item.link === '/profile?tab=affiliate') return !!user?.affiliateCode;
              
              // If activeMenuLinks is empty (still loading), show all for better UX
              if (activeMenuLinks.length === 0) return true;
              
              // Match against the fetched links for other items
              return activeMenuLinks.includes(item.link);
            }).map((item) => (
              <div key={item.label} onClick={() => navigate(item.link)} className="flex flex-col items-center gap-2 group active:scale-95 transition-transform">
                <div className={`w-16 h-16 ${item.color} rounded-[22px] flex items-center justify-center shadow-lg transition-shadow group-hover:shadow-xl`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-indigo-950 text-center leading-tight tracking-tight px-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistik Platform Section */}
        <div className="px-6 mt-12 bg-gray-50/50 py-4">
          <h2 className="text-xl font-black text-indigo-950 mb-6 uppercase tracking-widest pl-1">Statistik Platform</h2>
          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconUsers size={20} />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-0.5">{formatNumber(data?.user || 10000)}+</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">PENGGUNA</p>
            </div>
            <div className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconFileText size={20} />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-0.5">{formatNumber(data?.soal || 100000)}+</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">BANK SOAL</p>
            </div>
            <div className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconBuildingBank size={20} />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-0.5">{formatNumber(data?.paketSaya || 0)}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">PAKET SAYA</p>
            </div>
            <div className="bg-white p-5 rounded-[30px] shadow-sm border border-gray-100 text-center">
              <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <IconUsersGroup size={20} />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-0.5">{formatNumber(data?.paketTersedia || 0)}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">PAKET TERSEDIA</p>
            </div>
          </div>
        </div>

        {/* Testimoni Lulusan */}
        <div className="px-6 mt-10">
           <h2 className="text-xl font-black text-indigo-950 mb-6 uppercase tracking-widest pl-1">Testimoni Pengguna</h2>
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {testimonials.map((item: any, index: number) => (
                <div key={item.id} className="min-w-[280px] bg-white p-5 rounded-[22px] shadow-sm border border-gray-50 flex gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black bg-gradient-to-br ${
                     index % 3 === 0 ? 'from-blue-500 to-blue-700' : index % 3 === 1 ? 'from-orange-400 to-orange-600' : 'from-indigo-500 to-indigo-700'
                   }`}>
                      {item.nama.substring(0, 2).toUpperCase()}
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-indigo-950 text-base leading-tight">{item.nama}</h4>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                           <IconStarFilled 
                             key={i} 
                             size={14} 
                             className={i < (item.rating || 5) ? "text-yellow-400" : "text-gray-200"} 
                           />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 italic mt-1 leading-relaxed line-clamp-2">"{item.isi}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Spacing for Bottom Nav */}
        <div className="h-10"></div>
      </div>
    );
  }

  return (
    <div className="w-[100%] overflow-hidden">
      {renderFeedbackModal()}
      {notification && (
        <div className="mx-5 my-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <h2 className="text-lg font-semibold text-indigo-950 mb-1">{(notification as any).title}</h2>
          <p className="text-sm text-gray-600 mb-2">{(notification as any).description}</p>
          {(notification as any).link && (
            <a
              href={(notification as any).link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Lihat selengkapnya
            </a>
          )}
        </div>
      )}
      {!data?.section ? (
        // Skeleton while loading
        <div className="mx-5 rounded-md bg-gray-200 animate-pulse aspect-[3/1] w-auto" />
      ) : data?.section?.filter((e) => e.tipe === "BANNER")?.length > 0 ? (
      <Carousel
        autoPlay
        infiniteLoop
        swipeable
        emulateTouch
        interval={2000}
        showArrows={false}
        showThumbs={false}
        className="p-5 rounded-sm"
      >
        {data?.section
          ?.filter((e) => e.tipe === "BANNER")
          ?.map((e) => (
            <div
              className="cursor-grab"
              onClick={() => {
                if (e.url) window.open(e.url, "_blank");
              }}
              key={e.id}
            >
              <img className="rounded-md w-full h-auto object-contain" src={imageLink(e.gambar)} alt="Banner" />
            </div>
          ))}
      </Carousel>
      ) : null}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-7 gap-y-7 mx-5">
  {/* Paket Saya */}
        <div
          className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/my-class")}
        >
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-violet-700 rounded-full w-fit p-3">
              <IconBuildingBank className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.paketSaya)}</h3>
          <p className="text-sm text-gray-500">Paket Saya</p>
        </div>

        {/* Paket Tersedia */}
        <div
          className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/paket-pembelian")}
        >
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-blue-700 rounded-full w-fit p-3">
              <IconUsersGroup className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.paketTersedia)}</h3>
          <p className="text-sm text-gray-500">Paket Tersedia</p>
        </div>

        {/* Event */}
        <div
          className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/paket-pembelian")}
        >
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-orange-500 rounded-full w-fit p-3">
              <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#fff"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m8-6H4m2-7h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"
        />
      </svg>
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.soal)}</h3>
          <p className="text-sm text-gray-500">Bank Soal</p>
        </div>

        {/* Riwayat Pembelian */}
        <div
          className="item-stat bg-white rounded-2xl p-5 cursor-pointer hover:shadow-lg transition"
          
        >
          <div className="flex flex-row mb-7 justify-between">
            <div className="bg-cyan-700 rounded-full w-fit p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#fff"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20v-2a4 4 0 00-3-3.87m-7 5.87v-2a4 4 0 013-3.87m10-4a4 4 0 11-8 0 4 4 0 018 0zm-10 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl text-indigo-950 font-bold">{formatNumber(data?.user)}</h3>
          <p className="text-sm text-gray-500"> Siswa Tergabung</p>
        </div>
      </div>
     
      <div className="grid rounded-xl md:grid-cols-2 gap-2">
        {data?.section
          ?.filter((e) => e.tipe === "CUSTOM")
          ?.map((e) => (
            <div className="mx-5 bg-white mt-5 px-10 rounded-xl" key={e.id}>
              <h3 className="pt-10 text-xl text-center font-medium mb-5">{e.title}</h3>
              <CKeditor
                content={e.keterangan}
                readOnly
                className="mb-5 inline-block w-full"
              />
            </div>
          ))}
      </div>
        
      {/* Calendar Section */}
      {/* <div className="mx-5 mt-10 mb-6">
        <h2 className="text-3xl font-bold text-center text-indigo-950 mb-2">Jadwal Kegiatan</h2>
        <p className="text-center text-gray-500 text-sm">Lihat jadwal latihan dan tryout mendatang</p>
      </div> */}
      
      <div className="mx-5 mt-10 mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg h-[600px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-indigo-950 mb-1">Jadwal Kegiatan</h2>
            <p className="text-gray-500 text-sm">Lihat jadwal latihan dan tryout mendatang</p>
          </div>
          <div className="flex-1">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month']}
              defaultView="month"
            />
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg h-[600px] flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-indigo-950 mb-1">Statistik Belajar</h2>
            <p className="text-gray-500 text-sm">Pantau progress belajar harianmu</p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      </div>

      <div className="mx-5 mt-10 mb-6">
        <h2 className="text-3xl font-bold text-center text-indigo-950 mb-2">Testimoni</h2>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mx-5 my-8">
        {testimonials.length > 0 ? (
          testimonials.map((item: any, index: number) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                    index % 3 === 0
                      ? 'from-violet-500 to-purple-600'
                      : index % 3 === 1
                      ? 'from-blue-500 to-cyan-600'
                      : 'from-orange-500 to-red-600'
                  } flex items-center justify-center text-white font-bold text-xl`}
                >
                  {item.nama
                    .split(' ')
                    .map((n: any) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-indigo-950">
                    {item.nama}
                  </h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 fill-current ${
                          i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                "{item.isi}"
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            Belum ada testimoni
          </div>
        )}
      </div>

    </div>
  );
}