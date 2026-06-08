import { imageLink } from '@/utils/image-link';
import { formatCurrency } from '@/utils/number-format';
import { IconCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { countDiscount } from '@/const';

const getTotalNonZeroCount = (count: any) => {
  const nonZeroCount = Object.values(count).filter((value) => value !== 0);

  return nonZeroCount.length;
};


// Cek apakah user punya pembelian yang masih aktif (belum expired)
function isActivelyPurchased(item: any): boolean {
  if (!item?.Pembelian || item.Pembelian.length === 0) return false;
  const now = new Date();
  return item.Pembelian.some((p: any) => {
    if (p.status !== 'PAID') return false;
    if (!p.expiredAt) return true; // tidak ada expiry = selamanya aktif
    return new Date(p.expiredAt) > now;
  });
}

export default function CardProduct({
  setVisible,
  isPurchasing,
  item,
  setItemDetail,
  alumniVoucher,
  mobileMode = false,
}: any) {
  if (mobileMode) {
    const discountedPrice = alumniVoucher?.value
      ? item.harga - countDiscount(alumniVoucher?.tipePotongan, item.harga, alumniVoucher?.value)
      : item.harga;

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
        {/* Image & Badges */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 flex items-center justify-center">
          <img
            src={imageLink(item?.gambar)}
            alt={item?.nama}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-[#22c55e] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              Terlaris
            </span>
            {alumniVoucher?.value && (
              <span className="bg-[#0ea5e9] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                Diskon 50%
              </span>
            )}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          {/* Title & Description */}
          <h3 className="text-lg font-extrabold text-[#111827] leading-[1.3] mb-3">
            {item?.nama}
          </h3>
          <div 
            className="text-[13px] text-gray-600 leading-relaxed space-y-2 mb-6 prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: item?.keterangan }}
          />

          {/* Features */}
          {item?.paketPembelianFitur?.length > 0 && (
            <ul className="flex flex-col gap-2.5 mb-6">
              {item.paketPembelianFitur.map((fitur: any, index: number) => (
                <li key={index} className="flex items-center gap-2.5">
                  <div className="bg-[#dcfce7] rounded-full p-0.5 shrink-0">
                    <IconCheck size={12} className="text-[#22c55e] stroke-[3]" />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{fitur.nama}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Price & Action */}
          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              {alumniVoucher?.value ? (
                <>
                  <p className="text-[10px] text-gray-400 line-through">
                    {formatCurrency(item?.harga)}
                  </p>
                  <p className="text-lg font-bold text-[#0ea5e9]">
                    {formatCurrency(discountedPrice)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold text-[#0ea5e9]">
                  {formatCurrency(item?.harga)}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setVisible(true);
                setItemDetail(item);
              }}
              disabled={isActivelyPurchased(item)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                isActivelyPurchased(item)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#0ea5e9] text-white shadow-md shadow-[#0ea5e9]/20 active:scale-95"
              }`}
            >
              {isActivelyPurchased(item) ? 'Sudah Diambil' : (item.Pembelian?.length > 0 ? 'Beli Lagi' : 'Beli Sekarang')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col rounded-xl bg-white h-fit bg-clip-border text-gray-700 shadow-lg">
      <div className="relative mx-4 mt-4 overflow-hidden text-white shadow-lg rounded-xl bg-blue-gray-500 bg-clip-border shadow-blue-gray-500/40">
        <img src={imageLink(item?.gambar)} alt={item?.nama} />
        <div className="absolute inset-0 w-full h-full to-bg-black-10 bg-gradient-to-tr from-transparent via-transparent to-black/60"></div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="block font-sans text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">
            {item?.nama}
          </h5>
          {!isPurchasing && (
            <div className=" self-start text-right">
              {alumniVoucher?.value ? (
                <>
                  <p className="line-through text-xs text-red-500">
                    {formatCurrency(item?.harga)}
                  </p>
                  <motion.span
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 5, x: 0 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    key={alumniVoucher?.value}
                  >
                    <p className="font-semibold text-green-600">
                      {formatCurrency(
                        item?.harga -
                          countDiscount(
                            alumniVoucher?.tipePotongan,
                            item.harga,
                            alumniVoucher?.value
                          )
                      )}
                    </p>
                  </motion.span>
                </>
              ) : (
                <p className="font-bold">{formatCurrency(item?.harga)}</p>
              )}
            </div>
          )}
        </div>
        <div
          className="block font-sans text-base antialiased font-light leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: item?.keterangan }}
        />

        {item?.paketPembelianFitur.length ? (
          <ul className="flex flex-col gap-1 mt-5">
            {item?.paketPembelianFitur.map((item: any) => (
              <li className="flex gap-2">
                <span className=" h-fit mt-0.5 border rounded-full  bg-[#def6ee]">
                  <IconCheck size={14} className="text-green-500" />
                </span>
                <p className="block font-sans text-sm antialiased font-normal leading-relaxed text-inherit">
                  {item?.nama}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="p-6 pt-3">
        {!isPurchasing ? (
          <button
            className="block w-full select-none rounded-lg bg-[#0ea5e9] py-3.5 px-7 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            disabled={isActivelyPurchased(item)}
            onClick={() => {
              setVisible(true);
              setItemDetail(item);
            }}
          >
            {isActivelyPurchased(item) ? 'Sudah Diambil' : (item.Pembelian?.length > 0 ? 'Ambil Lagi' : 'Ambil Sekarang!')}
          </button>
        ) : (
          <div
            className={`grid md:grid-cols-2  xl:grid-cols-${getTotalNonZeroCount(
              item?._count
            )} gap-2`}
          >
            {item?._count.paketPembelianMateri ? (
              <Link
                to={`/my-class/${item.id}/materi`}
                className="block w-full select-none rounded-lg bg-[#0ea5e9] py-3.5 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              >
                Materi
              </Link>
            ) : null}
            {item?._count.paketPembelianBimbel ? (
              <Link
                to={`/my-class/${item.id}/bimbel`}
                className="block w-full select-none rounded-lg bg-[#0ea5e9] py-3.5 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                onClick={() => setVisible(true)}
              >
                Bimbel
              </Link>
            ) : null}
            {item?._count.paketPembelianTryout ? (
              <Link
                to={`/my-class/${item.id}/tryout`}
                className="block w-full select-none rounded-lg bg-[#0ea5e9] py-3.5 text-center align-middle font-sans text-sm font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                onClick={() => setVisible(true)}
              >
                Tryout
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}