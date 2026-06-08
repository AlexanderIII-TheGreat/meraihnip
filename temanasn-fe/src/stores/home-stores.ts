import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HomeProps {
  setData: (data: Partial<HomeProps>) => void;
  section?: any[];
  users?: number;
  pembelian?: number;
  soal?: number;
  event?: number;
  notifikasi?: any[];
  sidebarMenu?: any[];
  paketSaya?: any[];
  paketTersedia?: any[];
  riwayatPembelian?: any[];
  user?: any;
  totalBelajarMingguIni?: number;
  rerataBelajarHarian?: number;
  tryoutSayaStats?: any;
  tryoutAkbarStats?: any;
  tryoutStreak?: number;
  berita?: any[];
}

export const useHomeStore = create<HomeProps>()(
  persist(
    (set) => ({
      setData: (props: Partial<HomeProps>) => {
        set((state) => ({
          ...state,
          ...props,
          setData: state.setData, // preserve the function
        }));
      },
    }),
    { name: 'homepage' }
  )
);

export const getAllState = () => useHomeStore.getState();
