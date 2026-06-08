import { IconHome2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

export default function BreadCrumb({ page }: any) {
  const navigate = useNavigate();
  const account = useAuthStore((state) => state.user);

  const homePath = account?.role === 'ADMIN' ? '/dashboard' : '/';

  return (
    <nav className="flex !mb-8 overflow-auto" aria-label="Breadcrumb">
      <ol
        role="list"
        className="flex space-x-4 min-h-10 rounded-md bg-white px-6 shadow"
      >
        <li className="flex">
          <div className="flex items-center cursor-pointer">
            <p onClick={() => navigate(homePath)}>
              <IconHome2 size={20} className="text-gray-500" />
            </p>
          </div>
        </li>
        {page.map((item: any, index: number) => (
          <li className="flex flex-wrap">
            <div className="flex items-center">
              <svg
                className="h-full w-4 flex-shrink-0 text-gray-200"
                viewBox="0 0 24 44"
                preserveAspectRatio="none"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>
              <p
                onClick={() => navigate(item.link)}
                className={`ml-4 text-xs font-medium hover:text-gray-700 cursor-pointer w-full ${
                  index === page.length - 1 ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
