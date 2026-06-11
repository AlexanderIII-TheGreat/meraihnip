import Button from "@/components/button";
import Form from "@/components/form";
import Input from "@/components/input";
import { useAuthStore } from "@/stores/auth-store";
import { postData } from "@/utils/axios";
import toast from "react-hot-toast";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '@/const';
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getData } from "@/utils/axios";
import LOGO from "@/assets/Logo.png";
import { IconMessageCircle2 } from "@tabler/icons-react";

export default function Example() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const location = useLocation();
  const [waNumber, setWaNumber] = useState("628567898329");

  useEffect(() => {
    getData("whatsapp-admin/public")
      .then((res: any) => {
        if (res?.nomor) {
          setWaNumber(res.nomor);
        }
      })
      .catch((err) => console.error("Failed to fetch WA number", err));
  }, []);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Memproses...");
    try {
      const response = (await postData("auth/login", data)) as any;
      console.log(response);
      // Jika sukses
      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          response?.msg || response?.data?.msg || "Proses Selesai",
          { id: toastId }
        );
        login(response.data);
        const params = new URLSearchParams(location.search);
        let redirect = params.get("redirect");

        if (!redirect) {
          const rawQuery = location.search.substring(1);
          if (rawQuery.startsWith('/') && !rawQuery.startsWith('/?')) {
            redirect = rawQuery;
          }
        }

        // Use window.location.href for a full page reload to ensure
        // Zustand's persist middleware reads the token from localStorage correctly
        setTimeout(() => {
          if (response.data.data.user.role === "ADMIN") {
             if (redirect && redirect !== "/" && !redirect.includes("paket-pembelian")) {
                window.location.href = redirect;
                return;
             }
             window.location.href = "/dashboard";
             return;
          }

          if (redirect) {
             window.location.href = redirect;
             return;
          }

          window.location.href = "/";
        }, 500);
        return;
      }

      // Jika status bukan 200/201, tampilkan msg dari response jika bukan 500
      const status = response?.status;
      const message = response?.message || (response as any)?.msg || "Terjadi kesalahan.";

      if (status !== 500) {
        // Non-500, return/use msg
        toast.error(message, { id: toastId });
        return;
      } else {
        // 500, pesan generik
        toast.error("Cek ulang data anda, jika masih error, hubungi Admin", {
          id: toastId,
        });
        return;
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.message || err?.response?.data?.msg;
      let message = "";
      if (status === 500) {
        message = "Terjadi kesalahan, silakan coba lagi.";
      } else {
        // Non-500 di catch, gunakan msg dari backend
        message = backendMsg || err?.message || "Terjadi kesalahan.";
      }
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        style={{ backgroundImage: `linear-gradient(rgba(5, 10, 30, 0.62), rgba(5, 10, 30, 0.62)), url('/img/bg-astero.png')` }}
        className="min-h-[100vh] bg-no-repeat bg-cover bg-center pt-20"
      >
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto w-auto"
              style={{ height: "96px" }}
              src={LOGO}
              alt="Your Company"
            />
            <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
              Masuk ke akun Anda
            </h2>
          </div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <Form onSubmit={onSubmit} className="space-y-6">
                <Input
                  title="Email address"
                  name="email"
                  type="email"
                  validation={{
                    required: "Email tidak boleh kosong",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Format email tidak sesuai",
                    },
                  }}
                />
                <Input
                  type="password"
                  name="password"
                  title="Password"
                  validation={{
                    required: "Password tidak boleh kosong",
                  }}
                />
                <Link
                  to="/auth/forgot-password"
                  className="!mt-2 text-sm text-right w-full block text-[#1E3A8A] hover:text-[#1e40af]"
                >
                  Lupa password?
                </Link>
                 <Button type="submit" isLoading={isLoading}>
                  Login
                 </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Atau masuk dengan</span>
                  </div>
                </div>

                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (credentialResponse.credential) {
                          setIsLoading(true);
                          const toastId = toast.loading("Memproses Google Login...");
                          try {
                            const response = (await postData("auth/google", {
                              idToken: credentialResponse.credential,
                            })) as any;
                            
                            if (response?.status === 200 || response?.status === 201) {
                              toast.success("Login Berhasil", { id: toastId });
                              login(response.data);
                              
                              const params = new URLSearchParams(location.search);
                              let redirect = params.get("redirect");
                              
                              setTimeout(() => {
                                const user = response.data.data.user;
                                if (user.role === "ADMIN") {
                                  window.location.href = redirect || "/dashboard";
                                } else if (!user.noWA) {
                                  window.location.href = "/profile?tab=profil";
                                } else {
                                  window.location.href = redirect || "/";
                                }
                              }, 500);
                            } else {
                              toast.error(response?.message || "Login gagal", { id: toastId });
                            }
                          } catch (err: any) {
                            toast.error(err?.response?.data?.msg || "Gagal terhubung ke server", { id: toastId });
                          } finally {
                            setIsLoading(false);
                          }
                        }
                      }}
                      onError={() => {
                        toast.error("Google Login Gagal");
                      }}
                      useOneTap
                    />
                  </div>
                </GoogleOAuthProvider>
                <div className="text-center mt-3">
                  <p className="mt-10 text-center text-sm text-gray-500">
                    <span
                      style={{
                        color: "gray",
                        padding: "0 4px",
                        borderRadius: "4px",
                      }}
                    >
                      Belum punya akun?{" "}
                      <Link
                        to={`/auth/register${location.search}`}
                        className="font-semibold leading-6 hover:text-[#1e40af]"
                        style={{
                          textDecoration: "underline",
                          color: "#1E3A8A", // Dark Blue
                        }}
                      >
                        Daftar sekarang
                      </Link>
                    </span>
                  </p>
                </div>
              </Form>
            </div>
          </div>
        </div>
        {/* WhatsApp floating button */}
        <a
          href={`https://api.whatsapp.com/send/?phone=${waNumber}&text=Halo+admin%2C+saya+butuh+bantuan+di+Astero&type=phone_number&app_absent=0`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform"
        >
          <IconMessageCircle2 size={26} />
        </a>
      </div>
    </>
  );
}
