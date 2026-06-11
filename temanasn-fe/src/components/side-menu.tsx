import { menuListUser, menuListAdmin } from '@/const';
import { useAuthStore } from '@/stores/auth-store';
import { useHomeStore } from '@/stores/home-stores';
import { checkRouteActive } from '@/utils';

import LOGO from '@/assets/Logo.png';

import {
  IconBook,
  IconBook2,
  IconBooks,
  IconChartAreaLine,
  IconChevronDown,
  IconChevronRight,
  IconX,
  IconUsers,
  IconBrandCashapp,
  IconHome2,
  IconBuildingStore,
  IconTicket,
  IconCalendarEvent,
  IconEye,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getData } from '@/utils/axios';

type MenuItem = {
  link: string;
  title: string | JSX.Element;
  icon: JSX.Element;
  count?: 'pembelian' | 'event';
  exact?: boolean;
};

const iconMap: Record<string, JSX.Element> = {
  IconHome2: <IconHome2 size={20} />,
  IconBuildingStore: <IconBuildingStore size={20} />,
  IconTicket: <IconTicket size={20} />,
  IconCalendarEvent: <IconCalendarEvent size={20} />,
  IconBrandCashapp: <IconBrandCashapp size={20} />,
  IconEye: <IconEye size={20} />,
};

interface SideMenuProps {
  classNames: string;
  menuOpened: number[];
  setMenuOpened: (value: number[]) => void;
  toggleMenu?: () => void;
  isDesktopLayout: boolean;
  isCollapsed?: boolean;
}

const DESKTOP_BREAKPOINT = 1200;

// Extract relative path from a URL (handles both absolute and relative URLs)
const toRelativePath = (link: string): string => {
  try {
    const url = new URL(link);
    return url.pathname + url.search + url.hash;
  } catch {
    // Already a relative path
    return link;
  }
};

export default function SideMenu({
  classNames,
  menuOpened,
  setMenuOpened,
  toggleMenu,
  isDesktopLayout,
  isCollapsed = false,
}: SideMenuProps) {
  const navigate = useNavigate();
  const myClass = useAuthStore((state) => state.myClass);
  const account = useAuthStore((state) => state.user);
  const data = useHomeStore((state) => state);
  const location = useLocation();
  const [dynamicUserMenu, setDynamicUserMenu] = useState<any[]>([]);
  // Store raw menu data (not JSX) to avoid serialization issues with localStorage
  const { sidebarMenu: cachedRawMenus, setData } = useHomeStore();

  // Convert raw menu data (from API or cache) to formatted menu with JSX
  const buildFormattedMenu = (activeMenus: any[]) => [
    {
      title: 'Main Menu',
      pages: activeMenus
        .filter((m: any) => m.link !== '/generate-soal')
        .map((m: any) => ({
          link: m.link,
        title: m.hasBadge ? (
          <div className="flex items-center gap-1">
            <span>{m.title}</span>
            <motion.span
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded font-bold leading-none"
            >
              NEW
            </motion.span>
          </div>
        ) : m.title,
        icon: iconMap[m.icon] || <IconHome2 size={20} />,
        exact: m.link === '/paket-pembelian',
        count:
          m.link === '/generate-soal' ? 'generate'
          : m.link === '/paket-pembelian' ? 'pembelian'
          : m.link === '/event' ? 'event'
          : undefined,
      })),
    },
  ];

  useEffect(() => {
    if (account?.role === 'USER') {
      if (cachedRawMenus && cachedRawMenus.length > 0) {
        // Rebuild JSX from raw cached data (never store JSX in localStorage)
        setDynamicUserMenu(buildFormattedMenu(cachedRawMenus));
      } else {
        getData('sidebar-menu/get')
          .then((res: any) => {
            if (res?.list) {
              const activeMenus = res.list.filter((m: any) => m.isActive);
              // Save only raw data to the persisted store (no JSX)
              setData({ sidebarMenu: activeMenus });
              setDynamicUserMenu(buildFormattedMenu(activeMenus));
            } else {
              setDynamicUserMenu(menuListUser);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch sidebar menu:', err);
            setDynamicUserMenu(menuListUser);
          });
      }
    }
  }, [account?.role, cachedRawMenus]);

  const menuList =
    account?.role === 'USER'
      ? dynamicUserMenu
      : account?.role === 'ADMIN'
      ? menuListAdmin
      : [];

  return (
    <aside
      className={`flex flex-col h-full py-0 lg:py-8 overflow-y-auto no-scrollbar flex-shrink-0
        bg-white text-slate-700 
        border-r border-gray-200 
        rtl:border-r-0 rtl:border-l 
        z-[98] ${isCollapsed ? 'w-20 px-2 items-center bg-white' : 'w-[280px] px-6 bg-white'} ${classNames}`}
    >
      {/* Navbar top */}
      <div className={`flex flex-row justify-between bg-white ${isCollapsed ? 'p-2 justify-center bg-white' : 'p-5 bg-white'}`}>
        <div className="logo flex-row justify-center items-center gap-x-2 bg-white">
          <img className={`${isCollapsed ? 'h-9 w-9 object-contain bg-white' : 'w-auto h-12 bg-white'}`} src={LOGO} alt="logo" />
        </div>
      </div>

      {/* Close button for mobile */}
      {!isDesktopLayout && (
        <div className="flex justify-end py-5">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
          >
            <IconX size={24} />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between mt-0 w-full">
        <nav className={`w-full -mx-3 ${isCollapsed ? 'space-y-2' : 'space-y-4'}`}>
          {menuList.map((menu: any) => {
            const menuItem = menu.pages.map((page: MenuItem) => {
              const relativePath = toRelativePath(page.link);
              return (
                <button
                  key={page.link}
                  title={isCollapsed && typeof page.title === 'string' ? page.title : undefined}
                  className={`w-full text-left flex items-center group !mb-4 py-3 transition-colors duration-300 transform rounded-lg 
                    text-slate-600 hover:text-slate-900 
                    hover:bg-slate-100
                    ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4'}
                    ${
                      checkRouteActive(relativePath, location.pathname, 0, page.exact) &&
                      'bg-primary text-white hover:!bg-primary'
                    }`}
                  onClick={() => {
                    navigate(relativePath);
                    if (window.innerWidth < DESKTOP_BREAKPOINT) {
                      toggleMenu && toggleMenu();
                    }
                  }}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <span className="text-lg">{page.icon}</span>
                    {!isCollapsed && <span className="text-base font-medium">{page.title}</span>}
                  </div>
                  {!isCollapsed && page.count && data?.[page.count] ? (
                    <span
                      className={`text-xs w-[22px] h-[22px] flex justify-center items-center rounded-full 
                        bg-primary text-white
                        ${
                          checkRouteActive(relativePath, location.pathname, 0, page.exact) &&
                          'bg-white text-primary'
                        }`}
                    >
                      {data?.[page.count]}
                    </span>
                  ) : null}
                </button>
              );
            });

            if (!isCollapsed) {
              menuItem.unshift(
                <h6
                  key={menu.title}
                  className="text-sm text-slate-400 ml-3 mt-6 mb-3 uppercase tracking-wide"
                >
                  {menu.title}
                </h6>
              );
            }
            return menuItem;
          })}
        </nav>

        {/* Affiliate Section (admin only) */}
        {account?.role === 'ADMIN' && (
          <div className="w-full">
            {!isCollapsed && (
              <h6 className="text-sm text-gray-500 dark:text-gray-400 ml-3 mt-6 mb-3 uppercase tracking-wide">
                Affiliate
              </h6>
            )}
            <nav className={`w-full -mx-3 ${isCollapsed ? 'space-y-2' : 'space-y-3'}`}>
              <Link
                to="/affiliate"
                title={isCollapsed ? 'Affiliate' : undefined}
                className={`flex items-center group !mb-4 py-3 transition-colors duration-300 transform rounded-lg 
                  text-slate-600 hover:text-slate-900 
                  hover:bg-slate-100
                  ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4'}
                  ${
                    checkRouteActive('/affiliate', location.pathname) &&
                    'bg-primary text-white hover:!bg-primary'
                  }`}
                onClick={() => {
                  if (window.innerWidth < DESKTOP_BREAKPOINT) {
                    toggleMenu && toggleMenu();
                  }
                }}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <IconUsers size={20} />
                  {!isCollapsed && <span className="text-base font-medium">Affiliate</span>}
                </div>
              </Link>
              <Link
                to="/affiliate-commission"
                title={isCollapsed ? 'Affiliate Commission' : undefined}
                className={`flex items-center group !mb-4 py-3 transition-colors duration-300 transform rounded-lg 
                  text-slate-600 hover:text-slate-900 
                  hover:bg-slate-100
                  ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4'}
                  ${
                    checkRouteActive('/affiliate-commission', location.pathname) &&
                    'bg-primary text-white hover:!bg-primary'
                  }`}
                onClick={() => {
                  if (window.innerWidth < DESKTOP_BREAKPOINT) {
                    toggleMenu && toggleMenu();
                  }
                }}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <IconBrandCashapp size={20} />
                  {!isCollapsed && <span className="text-base font-medium">Affiliate Commission</span>}
                </div>
              </Link>
            </nav>
          </div>
        )}

        {/* Affiliate Section (user only) */}
        {account?.role === 'USER' && account?.affiliateCode && (
          <div className="w-full">
            {!isCollapsed && (
              <h6 className="text-sm text-slate-400 ml-3 mt-6 mb-3 uppercase tracking-wide">
                Affiliate
              </h6>
            )}
            <nav className="w-full -mx-3 space-y-3">
              <Link
                to="/profile?tab=affiliate"
                title={isCollapsed ? 'My Affiliate' : undefined}
                className={`flex items-center group !mb-4 py-3 transition-colors duration-300 transform rounded-lg 
                  text-slate-600 hover:text-slate-900 
                  hover:bg-slate-100
                  ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4'}
                  ${
                    location.pathname === '/profile' && location.search.includes('tab=affiliate') &&
                    'bg-primary text-white hover:!bg-primary'
                  }`}
                onClick={() => {
                  if (window.innerWidth < DESKTOP_BREAKPOINT) {
                    toggleMenu && toggleMenu();
                  }
                }}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <IconBrandCashapp size={20} />
                  {!isCollapsed && <span className="text-base font-medium">My Affiliate</span>}
                </div>
              </Link>
            </nav>
          </div>
        )}
      
        {/* Paket Saya (user only) */}
        {account?.role === 'USER' && (
          <div className="w-full">
            {!isCollapsed && (
              <div className="flex items-center justify-between">
                <h6 className="text-sm text-slate-400 mt-6 mb-3 uppercase tracking-wide">
                  Paket Saya
                </h6>
              </div>
            )}

            <nav className={`w-full -mx-3 ${isCollapsed ? 'space-y-2' : 'space-y-3'}`}>
              <AnimatePresence>
                {myClass?.map((item: any) => (
                  <motion.div
                    key={item.paketPembelianId}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <button
                      title={isCollapsed ? item.paketPembelian?.nama : undefined}
                      className={`flex items-center w-full group text-base font-medium rounded-lg transition-colors duration-300
                        text-slate-600 hover:text-slate-900
                        hover:bg-slate-100
                        ${isCollapsed ? 'justify-center px-0 h-11 w-11 mx-auto' : 'justify-between px-4 py-3'}
                        ${
                          checkRouteActive(
                            `my-class/${item.paketPembelianId}`,
                            location.pathname,
                            item.paketPembelianId
                          ) && 'bg-primary text-white hover:!bg-primary'
                        }`}
                      onClick={() => {
                        if (isCollapsed) {
                          navigate(`/my-class/${item.paketPembelianId}`);
                          return;
                        }
                        if (menuOpened?.includes(item.paketPembelianId)) {
                          setMenuOpened(
                            menuOpened?.filter(
                              (id: number) => id !== item.paketPembelianId
                            )
                          );
                        } else {
                          setMenuOpened([...menuOpened, item.paketPembelianId]);
                        }
                      }}
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-x-3'}`}>
                        <IconBook2 size={20} />
                        {!isCollapsed && (
                          <span className="text-left text-base">
                            {item.paketPembelian?.nama}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        menuOpened?.includes(item.paketPembelianId) ? (
                          <IconChevronRight size={20} className="text-white" />
                        ) : (
                          <IconChevronDown
                            size={20}
                            className="text-gray-400 dark:text-gray-500 group-hover:text-white"
                          />
                        )
                      )}
                    </button>

                    {/* Dropdown content */}
                    {!isCollapsed && menuOpened?.includes(item.paketPembelianId) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="pl-6"
                      >
                        {/* Materi */}
                        {item.paketPembelian?._count?.paketPembelianMateri > 0 && (
                           <Link
                            to={`/my-class/${item.paketPembelianId}/materi`}
                            className={`flex items-center mt-2 justify-between w-full px-4 py-2.5 text-base font-medium rounded-lg
                              text-slate-600 hover:text-slate-900 
                              hover:bg-slate-100
                              ${
                                checkRouteActive(
                                  `my-class/${item.paketPembelianId}/materi`,
                                  location.pathname
                                ) && 'text-primary bg-sky-50 hover:bg-sky-50'
                              }`}
                          >
                            <div className="flex items-center gap-x-3">
                              <IconBook size={18} />
                              <span>Materi</span>
                            </div>
                          </Link>
                        )}
 
                        {/* Bimbel */}
                        {item.paketPembelian?._count?.paketPembelianBimbel > 0 && (
                          <Link
                            to={`/my-class/${item.paketPembelianId}/bimbel`}
                            className={`flex items-center mt-2 justify-between w-full px-4 py-2 text-base font-medium rounded-lg
                              text-slate-600 hover:text-slate-900 
                              hover:bg-slate-100
                              ${
                                checkRouteActive(
                                  `my-class/${item.paketPembelianId}/bimbel`,
                                  location.pathname
                                ) && 'text-primary bg-sky-50 hover:bg-sky-50'
                              }`}
                          >
                            <div className="flex items-center gap-x-3">
                              <IconBooks size={18} />
                              <span>Bimbel</span>
                            </div>
                          </Link>
                        )}
 
                        {/* Tryout */}
                        {item.paketPembelian?._count?.paketPembelianTryout > 0 && (
                          <Link
                            to={`/my-class/${item.paketPembelianId}/tryout`}
                            className={`flex items-center mt-2 justify-between w-full px-4 py-2 text-base font-medium rounded-lg
                              text-slate-600 hover:text-slate-900 
                              hover:bg-slate-100
                              ${
                                checkRouteActive(
                                  `my-class/${item.paketPembelianId}/tryout`,
                                  location.pathname
                                ) && 'text-primary bg-sky-50 hover:bg-sky-50'
                              }`}
                          >
                            <div className="flex items-center gap-x-3">
                              <IconChartAreaLine size={18} />
                              <span>Tryout</span>
                            </div>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}