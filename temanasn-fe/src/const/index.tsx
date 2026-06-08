export { default as routes } from "./routes";
export { default as menuListUser } from "./menu-list-user";
export { default as menuListAdmin } from "./menu-list-admin";

// export const SERVER_URL_API = 'https://bimbel.fungsional.id/server/api';
// export const SERVER_URL = 'https://bimbel.fungsional.id/server/';
// export const FRONTEND_URL = 'https://bimbel.fungsional.id';

export const SERVER_URL_API = import.meta.env.VITE_API_URL || "http://localhost:8002/api";
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8002";
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
export const GOOGLE_CLIENT_ID = "325309011250-2gpas1aoils9hherkrj8l1nu5rsfgcup.apps.googleusercontent.com";

export { adminRoutes } from "./route-admin";

export const countDiscount = (
  type: string,
  price: number,
  discount: number
) => {
  if (type === "PERSEN") {
    return price * (discount / 100);
  } else {
    return discount;
  }
};

export const handleOpenLink = (link: string) => {
  if (!link.startsWith("http://") && !link.startsWith("https://")) {
    link = "https://" + link;
  }

  // Membuka link dalam jendela baru
  return window.open(link, "_blank");
};

export const hitungJumlahBankSoal = (data: any) => {
  let totalBankSoal = 0;

  if (data && data.PaketLatihan && data.PaketLatihan.PaketLatihanSoal) {
    const paketLatihanSoal = data.PaketLatihan.PaketLatihanSoal;

    paketLatihanSoal.forEach((item: any) => {
      if (
        item &&
        item.bankSoalCategory &&
        item.bankSoalCategory._count &&
        item.bankSoalCategory._count.BankSoal
      ) {
        totalBankSoal += item.bankSoalCategory._count.BankSoal;
      }
    });
  } else if (data && data.PaketLatihanSoal) {
    const paketLatihanSoal = data.PaketLatihanSoal;

    paketLatihanSoal.forEach((item: any) => {
      if (
        item &&
        item.bankSoalCategory &&
        item.bankSoalCategory._count &&
        item.bankSoalCategory._count.BankSoal
      ) {
        totalBankSoal += item.bankSoalCategory._count.BankSoal;
      }
    });
  }

  return totalBankSoal;
};

export const konversiDetikKeWaktu = (detik: any) => {
  if (!detik) return "00:00";
  // Menghitung jam, menit, dan detik
  let jam: string = Math.floor(detik / 3600).toString();
  const sisaDetik = detik % 3600;
  let menit: string = Math.floor(sisaDetik / 60).toString();
  let detikSisa: string = Number(sisaDetik % 60).toString();

  // Menambahkan "0" di depan angka jika kurang dari 10
  jam = jam.length < 2 ? `0${jam}` : jam;
  menit = menit.length < 2 ? `0${menit}` : menit.toString();
  detikSisa = detikSisa.length < 2 ? `0${detikSisa}` : detikSisa.toString();

  // Membuat format waktu
  let formatWaktu = "";
  if (jam > "0") {
    formatWaktu += jam + ":";
  }
  formatWaktu += menit + ":" + detikSisa;

  return formatWaktu;
};
