import {
  IconBuildingStore,
  IconCalendarEvent,
  IconHome2,
  IconTicket,
  IconBrandCashapp,
  IconEye
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

const menuList = [
  {
    title: 'Home',
    pages: [
      {
        icon: <IconHome2 />,
        title: 'Home',
        link: '/',
      },
      // {
      //   icon: <IconEye />,
      //   title: 'Soal Kecermatan',
      //   link: '/soal-kecermatan',
      // },
      // {
      //   icon: <IconBuildingStore />,
      //   title: (
      //     <div className="flex items-center gap-1">
      //       <span>Generate Soal Otomatis</span>
      //       <motion.span
      //         animate={{
      //           scale: [1, 1.1, 1],
      //           opacity: [0.8, 1, 0.8],
      //         }}
      //         transition={{
      //           duration: 2,
      //           repeat: Infinity,
      //           ease: "easeInOut"
      //         }}
      //         className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded font-bold leading-none"
      //       >
      //         NEW
      //       // </motion.span>
      //     </div>
      //   ) as any,
      //   link: '/generate-soal',
      //   count: 'generate',
      // },

      {
        icon: <IconBuildingStore />,
        title: 'Paket Pembelian',
        link: '/paket-pembelian',
        count: 'pembelian',
        exact: true,
      },
	  {
        link: '/my-tickets',
        title: 'Layanan Bantuan',
        icon: <IconTicket size={20} />,
      },
      // {
      //   icon: <IconBrandTrello />,
      //   title: 'Kelas saya',
      //   link: '/my-class',
      // },
      {
        icon: <IconCalendarEvent />,
        title: 'Event',
        link: '/event',
        count: 'event',
      },      {
        icon: <IconBrandCashapp />,
        title: 'Riwayat Pembelian',
        link: '/paket-pembelian/riwayat',
        //count: 'event',
      },
    ],
  },
];

export default menuList;
