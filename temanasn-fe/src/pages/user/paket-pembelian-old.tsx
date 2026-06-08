import BreadCrumb from "@/components/breadcrumb";
import CardProduct from "@/components/card-product";
import PaymentModal from "@/components/payment-modal";
import useGetList from "@/hooks/use-get-list";
import useDebounce from "@/hooks/useDebounce";
import { getData } from "@/utils/axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useInView } from "react-intersection-observer";
// helper buat ambil query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
export default function PaketPembelian() {
  const query = useQuery();
  const searchFromUrl = query.get("search") || "";
  const [paymentModal, setPaymentModal] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<{ nama: string }[]>([]);
  const [search, setSearch] = useState(searchFromUrl);
  const [alumniVoucher, setAlumniVoucher] = useState({});
  const [itemDetail, setItemDetail] = useState({});
  const { ref: desktopRef, inView: desktopInView } = useInView();
  const { ref: mobileRef, inView: mobileInView } = useInView();
  const searchQ = useDebounce(search, 1000);

  const getClass = useGetList({
    initialParams: { take: page * 10 },
    url: "user/tryout/my-tryout",
  });

  const getCategories = async () => {
    getData(`user/category/get`).then((res) => setCategory(res));
  };

  const getAlumniVoucher = async () => {
    getData(`user/get-voucher-alumni`).then((res) => setAlumniVoucher(res));
  };

  useEffect(() => {
    getClass.setParams((param: any) => ({ ...param, search: searchQ || "" }));
  }, [searchQ]);

  useEffect(() => {
    getCategories();
    getAlumniVoucher();
  }, []);

  useEffect(() => {
    if (desktopInView || mobileInView) setPage((p) => p + 1);
  }, [desktopInView, mobileInView]);

  useEffect(() => {
    getClass.setParams((param: any) => ({ ...param, take: page * 10 }));
  }, [page]);

  const handleCategoryChange = (catName: string) => {
    getClass.setParams({ ...getClass.params, category: catName });
  };

  const renderFilterButtons = (isMobile: boolean) => {
    const categories = [{ nama: "Semua Kelas", value: "" }, ...category.map(c => ({ nama: c.nama, value: c.nama }))];
    
    return categories.map((item) => {
      const isActive = getClass.params.category === item.value;
      if (isMobile) {
        return (
          <button
            key={item.nama}
            onClick={() => handleCategoryChange(item.value)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all shrink-0 ${
              isActive
                ? "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20"
                : "bg-white text-[#64748b] border border-gray-100"
            }`}
          >
            {item.nama === "Semua Kelas" ? "Semua" : item.nama}
          </button>
        );
      }
      return (
        <button
          key={item.nama}
          className={`py-3 px-6 border rounded text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#0ea5e9] hover:shadow-[5px_5px_rgb(255,_0,_108,_0.4),_10px_10px_rgb(255,_0,_109,_0.22)] whitespace-nowrap flex-shrink-0 sm:whitespace-normal sm:flex-shrink sm:mr-2 sm:mb-5 transition-all ${
            isActive ? " shadow-[5px_5px_rgb(255,_0,_108,_0.4),_10px_10px_rgb(255,_0,_109,_0.22)] bg-[#0ea5e9] text-white" : " bg-white"
          } hover:text-white`}
          onClick={() => handleCategoryChange(item.value)}
        >
          {item.nama}
        </button>
      );
    });
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      {paymentModal && (
        <PaymentModal
          setVisible={setPaymentModal}
          itemDetail={itemDetail}
          alumniVoucher={alumniVoucher}
        />
      )}

      {/* DESKTOP VIEW */}
      <div className="hidden md:block p-4">
        <BreadCrumb page={[{ name: "Paket Pembelian", link: "/paket-pembelian" }]} />
        <div className="flex justify-between items-start w-full mb-8">
          <h1 className="text-2xl text-[#0ea5e9] font-bold">Paket Tryout</h1>
          <Link to={"riwayat"} className="text-sm text-blue-700 hover:underline">
            Riwayat Pembelian
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-3 mb-5">
          {renderFilterButtons(false)}
        </div>

        <div className="flex bg-slate-200 mt-4 mb-8 rounded-md border border-slate-300 w-full max-w-[25rem] overflow-hidden">
          <input
            placeholder="Cari disini"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2.5 flex-grow text-[0.9rem] bg-slate-200"
          />
          <div className="px-3 py-2 flex items-center bg-slate-200">
            <svg className="size-[1.1rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {getClass?.list?.map((item) => (
            <CardProduct key={item.id} setVisible={setPaymentModal} item={item} alumniVoucher={alumniVoucher} setItemDetail={setItemDetail} />
          ))}
          <div ref={desktopRef} className="h-10"></div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden fixed inset-0 z-50 bg-[#f8f9fa] overflow-y-auto overflow-x-hidden pb-10">
        <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 border-b w-full">
          <Link to="/" className="text-[#0ea5e9]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Beli Paket</h1>
          <div className="w-6"></div>
        </div>

        <div className="bg-[#22c55e] px-4 py-2.5 flex items-center gap-2 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-[10px] font-bold text-white uppercase tracking-wider">PROMO TERBATAS: DISKON S.D 50% HINGGA AKHIR BULAN!</p>
        </div>

        <div className="flex flex-nowrap gap-3 overflow-x-auto px-5 py-5 no-scrollbar w-full items-center">
          {renderFilterButtons(true)}
        </div>

        <div className="px-5 mb-6 w-full">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari paket belajar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#0ea5e9]/10 focus:border-[#0ea5e9] transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="px-5 mb-6 w-full">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">Pilih Paket Belajarmu</h2>
          <p className="text-sm text-gray-500 mt-1">Investasi terbaik untuk masa depan ASN Anda</p>
        </div>

        <div className="px-5 flex flex-col gap-6 w-full">
          {getClass?.list?.map((item) => (
            <CardProduct key={item.id} setVisible={setPaymentModal} item={item} alumniVoucher={alumniVoucher} setItemDetail={setItemDetail} mobileMode={true} />
          ))}
          <div ref={mobileRef} className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
