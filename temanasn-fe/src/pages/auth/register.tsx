import Button from "@/components/button";
import Form from "@/components/form";
import Input from "@/components/input";
import { postData } from "@/utils/axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import LOGO from "@/assets/Logo.png";

export default function Example() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { affCode } = useParams(); // Ambil affCode dari route params (opsional)
  const location = useLocation();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Memproses...");
    try {
      const response = await postData("auth/register", data);
      console.log(response);
      // Jika sukses
      if (response?.status === 200 || response?.status === 201) {
        toast.success(
          response?.msg || response?.data?.msg || "Proses Selesai",
          { id: toastId }
        );
        setTimeout(() => {
          navigate(`/auth/login${location.search}`);
        }, 1000);
        return;
      }
   
      // Jika status bukan 200/201, tampilkan msg dari response jika bukan 500
      const status = response?.status;
      const message = response?.message || "Terjadi kesalahan.";
   
      if (status !== 500) {
        // Non-500, return/use msg
        toast.error(message, { id: toastId });
        return;
      } else {
        // 500, pesan generik
        toast.error("Cek ulang data anda, jika masih error, hubungi Admin", { id: toastId });
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

  // Optional: Jika Form mendukung initialValues, bisa set di sini
  // Misal: <Form initialValues={{ affiliate_code: affCode || '' }} onSubmit={onSubmit} ...>

  return (
    <>
      <div
        style={{ backgroundImage: `url('/img/bg.jpg')` }}
        className="min-h-[100vh] bg-no-repeat bg-cover bg-center pt-10"
      >
        <div className="flex min-h-full flex-1 flex-col justify-center py-10 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
              className="mx-auto w-auto"
              style={{ height: "76px" }}
              src={LOGO}
              alt="Your Company"
            />
            <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Daftar akun baru
            </h2>
          </div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
              <Form onSubmit={onSubmit} className="space-y-6">
                <Input
                  title="Nama Lengkap"
                  name="name"
                  type="text"
                  validation={{
                    required: "Nama tidak boleh kosong",
                  }}
                />
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
                    minLength: {
                      value: 8,
                      message: "Password minimal 8 karakter",
                    },
                  }}
                />
                <Input
                  title="Nomor Telphone"
                  startAdornment="+62"
                  placeholder="81234567890"
                  name="noWA"
                  type="text"
                  validation={{
                    required: "Nomor telphone tidak boleh kosong",
                    pattern: {
                      value: /^8[0-9]{9,11}$/,
                      message: "Format nomor telphone tidak sesuai",
                    },
                  }}
                />
                <Input
                  title="Kode Affiliate (Opsional)"
                  name="affiliate_code"
                  type="text"
                  placeholder="Masukkan kode affiliate jika ada"
                  defaultValue={affCode || ''} // Auto-fill dari route jika ada
                  validation={{
                    // Opsional: tambah validasi jika perlu, misal pattern untuk kode tertentu
                    // pattern: {
                    // value: /^[A-Z0-9]{16}$/, // Contoh: asumsi format AFF + 16 digit
                    // message: "Format kode affiliate tidak sesuai",
                    // },
                  }}
                />
                <Button type="submit" isLoading={isLoading}>
                  Register
                </Button>
                <div className="mt-3 text-center">
                  <p className="mt-10 text-center text-sm text-gray-500">
                    <span
                      style={{
                        color: "rgb(73 193 191 / 1)",
                        padding: "0 4px",
                        borderRadius: "4px",
                      }}
                    >
                      Sudah punya akun?{" "}
                      <Link
                        to={`/auth/login${location.search}`}
                        className="font-semibold leading-6 hover:text-gray-300"
                        style={{
                          textDecoration: "underline",
                          color: "rgb(73 193 191 / 1)",
                        }}
                      >
                        Login sekarang
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
          href="https://api.whatsapp.com/send/?phone=628567854441&text=Halo+admin%2C+saya+butuh+bantuan+di+MeraihNIP&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50"
        >
          <img
            src="/img/whatsapp.webp"
            alt="WhatsApp Admin"
            className="w-14 h-14 drop-shadow-lg hover:scale-110 transition-transform"
          />
        </a>
      </div>
    </>
  );
}