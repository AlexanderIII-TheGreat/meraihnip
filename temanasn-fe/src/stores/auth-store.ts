import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserProps = {
  email: string;
  role: string;
  name: string;
  gambar: string | undefined;
  id: number;
  affiliateCode?: string | undefined;
  affiliateLink?: string | undefined;
  affiliateBalance?: string | number | undefined;
  provinsi?: string | undefined;
  kabupaten?: string | undefined;
  kecamatan?: string | undefined;
  alamat?: string | undefined;
  noWA?: string | undefined;
  jurusan?: string | undefined;
  ttl?: string | undefined;
  createdAt?: string | undefined;
};

type LoginDataProps = {
  refreshToken?: string;
  token: string;
  tokenExpiresIn?: string;
  user: UserProps;
};

interface AuthProps {
  login: (data: { data: LoginDataProps }) => void;
  logout: () => void;
  user?: UserProps;
  token?: string;
  myClass?: any;
  setMyClass: (myClass: any) => void;
  isHasShow: boolean;
  setIsHasShow: (value: boolean) => void;
}

export const useAuthStore = create<AuthProps>()(
  persist(
    (set) => ({
      isHasShow: false,
      login: ({ data }) => {
        set({
          user: data.user,
          token: data.token,
          isHasShow: false,
        });
      },
      logout: () => {
        // Fire-and-forget API logout to push audit log
        const token = useAuthStore.getState().token;
        if (token) {
          fetch('http://localhost:8002/api/auth/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }

        set({
          user: undefined,
          token: undefined,
          myClass: undefined,
          isHasShow: false,
        });
        const deleteLocalStorage = () => {
          const keys = Object.keys(localStorage);
          for (const key of keys) {
            if (key !== "authentication") {
              localStorage.removeItem(key);
            }
          }
        };
        deleteLocalStorage();
      },
      setMyClass: (myClass: any) => {
        set({ myClass });
      },
      setIsHasShow: (value: boolean) => {
        set({ isHasShow: value });
      },
    }),
    { name: "authentication" }
  )
);

export const getAllState = () => useAuthStore.getState();
