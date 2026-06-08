import { useNavigate, useLocation } from 'react-router-dom';
import { 
  IconHome2, 
  IconShoppingBag, 
  IconUser 
} from '@tabler/icons-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isTryoutPage = location.pathname.includes('/tryout/');

  if (isTryoutPage) return null;

  const navItems = [
    { label: 'Beranda', icon: <IconHome2 size={24} />, path: '/' },
    { label: 'Beli Paket', icon: <IconShoppingBag size={24} />, path: '/paket-pembelian' },
    { label: 'Akun', icon: <IconUser size={24} />, path: '/profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-center gap-16 items-center px-6 py-3 z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[#14B8A6]' : 'text-gray-400'
            }`}
          >
            <div className={`${isActive ? 'scale-110' : ''} transition-transform`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
