import {
  IconBell,
  IconCircleCheck,
  IconCircleX,
  IconHourglassHigh,
  IconMenu2,
  IconMoon,
  IconSun,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { checkRouteActive } from './utils';
import { useAuthStore } from './stores/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment/min/moment-with-locales';
import 'moment/min/moment-with-locales';
import useGetList from './hooks/use-get-list';
import SideMenu from './components/side-menu';
import AlertTryout from './components/alert-tryout';
import { useHomeStore } from '@/stores/home-stores';
import { getData, postData } from './utils/axios';
import BottomNav from './components/bottom-nav';
import { useIsMobile } from '@/hooks/use-is-mobile';
import UserAvatar from './components/user-avatar';
import FaqChatWidget from './components/faq-chat-widget';

interface LayoutProps {
  children: React.ReactNode;
}

const DESKTOP_BREAKPOINT = 1200;

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

export default function App({ children }: LayoutProps) {
  moment.locale('id');
  const { setMyClass } = useAuthStore();
  const { id } = useParams();
  const data = useHomeStore((state) => state);
  const [isDesktopLayout, setIsDesktopLayout] = useState<boolean>(() => {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });
  const [showMenu, setShowMenu] = useState<boolean>(() => {
    // Keep sidebar pinned only on desktop; tablet/mobile uses overlay menu.
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  });
  const { logout } = useAuthStore();
  const dropdownProfile = useRef<HTMLDivElement | null>(null);
  const dropdownProfileMobile = useRef<HTMLDivElement | null>(null);
  const account = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  // Dark mode state
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });
  // Toggle theme and persist in localStorage
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  // Apply theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  // Update showMenu on window resize
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktopLayout(isDesktop);
      setShowMenu(isDesktop);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const toggleDropdown = () => {
    setShowMenu((prev) => !prev);
  };
  const [showDropdownProfile, setShowDropdownProfile] = useState(false);
  const [showDropdownProfileMobile, setShowDropdownProfileMobile] = useState(false);
  const toggleDropdownProfileMobile = () => {
    setShowDropdownProfileMobile(!showDropdownProfileMobile);
  };
  const toggleDropdownProfile = () => {
    setShowDropdownProfile(!showDropdownProfile);
  };
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (dropdownProfile.current && !dropdownProfile.current.contains(target)) {
      setShowDropdownProfile(false);
    }
  };
  const handleClickOutsideMobile = (event: MouseEvent) => {
    if (!showDropdownProfileMobile) return;
    const target = event.target as HTMLElement;
    if (dropdownProfileMobile.current && !dropdownProfileMobile.current.contains(target)) {
      setShowDropdownProfileMobile(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('click', handleClickOutsideMobile);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('click', handleClickOutsideMobile);
    };
  }, []);
  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };
  const getMyClass = useGetList({
    url: 'user/get-my-class',
    initialParams: {
      skip: 0,
      take: 0,
      disabled: account?.role === 'ADMIN',
    },
    handleSuccess: (res) => {
      setMyClass(res.list);
    },
  });
  useEffect(() => {
    getMyClass.refresh();
  }, [location.pathname]);
  const [menuOpened, setMenuOpened] = useState<number[]>([]);
  useEffect(() => {
    if (checkRouteActive(`my-class/${id}`, location.pathname)) {
      setMenuOpened([Number(id)]);
    } else {
      setMenuOpened([]);
    }
  }, [location.pathname, id]);
  const [notificationTab, setNotificationTab] = useState('SYSTEM');
  const readData = async (id: number, url: string) => {
    await postData('user/notification/read', { id });
    window.location.href = url;
  };
  const setData = useHomeStore((state) => state.setData);
  const getDetail = async () => {
    getData(`dashboard/user`).then((res: any) => {
      if (!res?.error) setData(res);
    });
  };
  useEffect(() => {
    getDetail();
  }, [location.pathname]);
  const handleReadAll = async () => {
    await postData('user/notification/read-all');
    getDetail();
  };
  // Handle profile toggle based on screen size
  const handleProfileClick = () => {
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      toggleDropdownProfileMobile();
    } else {
      toggleDropdownProfile();
    }
  };
  // Auto-close sidebar on exam pages
  useEffect(() => {
    const isWorkingOnExam = 
      location.pathname.includes('/generate-soal/kerjakan/') ||
      /my-class\/[^/]+\/(tryout|bimbel\/mini-test)\/[^/]+\/[^/]+\/[^/]+/.test(location.pathname);
    if (isWorkingOnExam) {
      setShowMenu(false);
    }
  }, [location.pathname]);

  return (
    <div className="font-['Poppins'] bg-[#f5f5f5] dark:bg-gray-800 scroll-smooth min-h-screen w-full overflow-x-hidden">
      <div className="flex flex-row justify-start w-full min-h-screen relative">
        {isDesktopLayout ? (
          <motion.div
            animate={{ width: showMenu ? 280 : 80 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex-shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-900 z-50 flex flex-col border-r dark:border-gray-700 overflow-hidden"
          >
            <SideMenu
              classNames="flex h-full"
              menuOpened={menuOpened}
              setMenuOpened={setMenuOpened}
              toggleMenu={toggleDropdown}
              isDesktopLayout={isDesktopLayout}
              isCollapsed={!showMenu}
            />
          </motion.div>
        ) : (
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ x: '-100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0.5 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="fixed top-0 left-0 w-full h-full bg-white dark:bg-gray-900 z-50 flex flex-col"
              >
                <SideMenu
                  classNames="flex h-full"
                  menuOpened={menuOpened}
                  setMenuOpened={setMenuOpened}
                  toggleMenu={toggleDropdown}
                  isDesktopLayout={isDesktopLayout}
                  isCollapsed={false}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div 
          className="flex-1 min-w-0 transition-all duration-300 w-full"
        >
          {(!isMobile || account?.role !== 'USER') && (
            <div className="w-full navbar bg-white dark:bg-gray-900 md:py-4 md:px-7 relative">
              <div className="flex flex-row justify-between">
                <div className="flex items-center p-2 space-x-2">
                  <button
                    id="btn-dropdown"
                    onClick={toggleDropdown}
                    className="flex flex-row items-center p-2 border border-gray-300 dark:border-gray-600 rounded-full"
                  >
                    <IconMenu2 className="text-gray-700 dark:text-gray-200" />
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex flex-row items-center p-2 border border-gray-300 dark:border-gray-600 rounded-full"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  >
                    {theme === 'light' ? (
                      <IconMoon className="text-gray-700 dark:text-gray-200" size={20} />
                    ) : (
                      <IconSun className="text-gray-700 dark:text-gray-200" size={20} />
                    )}
                  </button>
                </div>
                <div
                  className="flex items-center gap-3 p-3 relative"
                  ref={dropdownProfile}
                >
                  {account?.role === 'USER' && isDesktopLayout && (
                    <div className="relative font-[sans-serif] w-max mx-auto group group-hover:opacity-100">
                      <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center group rounded-full text-sm font-semibold bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                      >
                        {data?.notifikasi?.filter((e: any) => !e?.isRead).length ? (
                          <div className="absolute inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full -top-1 -end-0">
                            {data.notifikasi.filter((e: any) => !e?.isRead).length}
                          </div>
                        ) : null}
                        <IconBell className="animate-swing" size={23} />
                      </button>
                      <div className="absolute pt-4 -right-20 top-[-999px] group-hover:top-10 overflow-hidden hover:overflow-auto z-[1000]">
                        <div className="group-hover:block bg-white dark:bg-gray-800 shadow-2xl notification-container border border-[#DDD] dark:border-gray-600 overflow-hidden min-w-full rounded-lg w-full max-w-sm md:w-[410px] transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                          <nav
                            className="isolate flex flex-col sm:flex-row divide-y sm:divide-x sm:divide-y-0 divide-gray-200 dark:divide-gray-600 rounded-lg shadow"
                            aria-label="Tabs"
                          >
                            <button
                              className="text-gray-900 dark:text-gray-200 rounded-l-lg group relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-gray-800 py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10"
                              onClick={() => setNotificationTab('SYSTEM')}
                            >
                              <div className="flex justify-center gap-1">
                                <span>Untuk kamu</span>
                                {data?.notifikasi?.filter((e: any) => e?.type === 'SYSTEM' && !e?.isRead).length! > 0 && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                )}
                              </div>
                              <span
                                aria-hidden="true"
                                className={`${notificationTab === 'SYSTEM' && 'bg-primary'} absolute inset-x-0 bottom-0 h-0.5`}
                              ></span>
                            </button>
                            <button
                              className="text-gray-900 dark:text-gray-200 rounded-r-lg group relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-gray-800 py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10"
                              onClick={() => setNotificationTab('USER')}
                            >
                              <div className="flex justify-center gap-1">
                                <span>Terbaru & Update</span>
                                {data?.notifikasi?.filter((e: any) => e?.type === 'USER' && !e?.isRead).length! > 0 && (
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                )}
                              </div>
                              <span
                                aria-hidden="true"
                                className={`${notificationTab === 'USER' && 'bg-primary'} absolute inset-x-0 bottom-0 h-0.5`}
                              ></span>
                            </button>
                          </nav>
                          <ul className="divide-y max-h-[350px] overflow-auto">
                            {data?.notifikasi
                              ?.filter((e: any) => e?.type === notificationTab)
                              .map((e: any) => (
                                <li key={e.id}>
                                  <button
                                    onClick={() => readData(e?.id, e.url || e?.notification?.url)}
                                    className={`py-4 px-4 flex items-center w-full hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-gray-200 text-sm cursor-pointer text-left ${!e?.isRead ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                  >
                                    {e?.notification?.icon ? (
                                      <span dangerouslySetInnerHTML={{ __html: e?.notification?.icon }} />
                                    ) : (
                                      generateIcon(e.status)
                                    )}
                                    <div className="ml-6 w-full">
                                      <h3 className="text-sm text-[#333] dark:text-gray-200 font-semibold">
                                        {e.title || e?.notification?.title}
                                      </h3>
                                      <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">
                                        {e.keterangan || e?.notification?.keterangan}
                                      </p>
                                      <p className="text-xs text-[#1E3A8A] dark:text-blue-300 leading-3 mt-2 w-full text-right">
                                        {moment(e.createdAt || e?.notification?.createdAt).fromNow()}
                                      </p>
                                    </div>
                                  </button>
                                </li>
                              ))}
                            {data?.notifikasi?.filter((e: any) => e?.type === notificationTab).length === 0 && (
                              <p className="text-center py-10 text-gray-600 dark:text-gray-400 italic">
                                Kamu telah membaca semua notifikasi
                              </p>
                            )}
                          </ul>
                          <p
                            onClick={handleReadAll}
                            className="text-sm p-3 text-center border-t border-gray-[#DDD] dark:border-gray-600 text-[#1E3A8A] dark:text-blue-300 cursor-pointer bg-white dark:bg-gray-800"
                          >
                            Tandai semua sudah dibaca
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div 
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();   
                      handleProfileClick();
                    }}
                  >
                    <UserAvatar 
                      name={account?.name} 
                      image={account?.gambar} 
                      size={isMobile ? 44 : 40} 
                      roundedFull 
                    />
                  </div>
                  {isDesktopLayout && (
                    <div className="flex flex-col text-right">
                      <h3 className="text-indigo-950 dark:text-indigo-200 font-semibold text-base">
                        {account?.name}
                      </h3>
                    </div>
                  )}
                  {/* Desktop Profile Dropdown */}
                  {showDropdownProfile && isDesktopLayout && (
                    <div
                      className="profile-dropdown absolute right-0 mt-2 top-12 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-md py-2 w-36 z-[99]"
                    >
                      <button
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
                        onClick={() => {
                          navigate('/profile');
                          toggleDropdownProfile();
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                  {/* Mobile Profile Dropdown */}
                  {showDropdownProfileMobile && !isDesktopLayout && (
                    <div
                      className="fixed inset-x-0 mt-2 top-[68px] bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-md py-2 z-[99] px-4"
                      ref={dropdownProfileMobile}
                    >
                      <button
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left text-sm"
                        onClick={() => {
                          navigate('/profile');
                          toggleDropdownProfileMobile();
                        }}
                      >
                        Profile
                      </button>
                      <button
                        className="block px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left text-sm"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {account?.role === 'USER' && <AlertTryout />}
          <div
            className={`min-h-[90vh] bg-[#f6f8fd] dark:bg-gray-700 border-t border-t-[#DDD] dark:border-t-gray-600 mb-10 w-full max-w-full overflow-x-hidden ${
              location.pathname !== '/' ? 'px-4 md:px-7 pt-4 md:pt-3' : ''
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {account?.role === 'USER' && <BottomNav />}
      <FaqChatWidget />
    </div>
  );
}