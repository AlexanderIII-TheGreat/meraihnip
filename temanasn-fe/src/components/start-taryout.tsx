import { getData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconBook2,
  IconCircleCheck,
  IconClock,
  IconExclamationCircle,
  IconFolder,
  IconGraph,
} from '@tabler/icons-react';
import { hitungJumlahBankSoal } from '@/const';
import { useEffect, useState } from 'react';
import { Dialog } from 'tdesign-react';

export default function StartTryout({ title, detail, isBimbel }: any) {
  const { paketId, id, paketFK } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState<any>({});
  const [isOnGoing, setIsOnGoing] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const handleStart = async () => {
    if (!hasChecked) return;
    FetchAPI(
      postData('user/tryout/start', {
        paketLatihanId: paketId,
        paketPembelianTryoutId: isBimbel ? undefined : paketFK,
        paketPembelianBimbelId: isBimbel ? paketFK : undefined,
      })
    ).then(({ data }: any) => {
      if (isBimbel)
        return navigate(
          `/my-class/${id}/bimbel/mini-test/${paketFK}/${paketId}/${data.data.id}`
        );
      navigate(`/my-class/${id}/tryout/${paketFK}/${paketId}/${data.data.id}`);
    });
  };

  const checkActive = () => {
    getData(`user/tryout/check-active`).then((res) => {
      setActive(res);
      setHasChecked(true);
      if (res?.id) setIsOnGoing(true);
    });
  };

  useEffect(() => {
    checkActive();
  }, []);

  const handleFinish = async () => {
    postData(`user/tryout/finish`, {
      tryoutId: active?.id,
    }).then(() => {
      navigate(
        `/my-class/${id}/tryout/${paketFK}/${paketId}/${active?.id}/statistik`
      );
    });
  };

  return (
    <div>
      {isOnGoing && hasChecked ? (
        <Dialog
          visible
          header={
            <>
              <IconExclamationCircle className="mr-2 text-warning" />
              <span>Maaf, kamu tidak bisa mengikuti tryout </span>
            </>
          }
          mode="modal"
          footer={
            <div className="flex gap-3 justify-between">
              <div className="flex gap-3">
                <button
                  className="bg-white text-black border-gray-300 border-2 px-6 py-1.5 rounded-md hover:shadow-xl"
                  onClick={() => {
                    setIsOnGoing(false);
                  }}
                >
                  Batal
                </button>
                <button
                  className="bg-red-500 text-white px-6 py-1.5 rounded-md hover:shadow-xl"
                  onClick={handleFinish}
                >
                  Selesaikan
                </button>{' '}
              </div>
              <button
                className="bg-primary text-white px-6 py-1.5 rounded-md hover:shadow-xl"
                onClick={() => {
                  if (active.paketPembelianTryout.id) {
                    navigate(
                      `/my-class/${id}/tryout/${active.paketPembelianTryoutId}/${active.paketLatihanId}/${active?.id}`
                    );
                  } else if (active.paketPembelianBimbel.id) {
                    navigate(
                      `/my-class/${id}/bimbel/mini-test/${active.paketPembelianBimbelId}/${active.paketLatihanId}/${active?.id}`
                    );
                  }
                }}
              >
                Lanjutkan
              </button>
            </div>
          }
        >
          <p className="text-center">
            Kamu masih memiliki tryout yang sedang berlangsung, <br />
            <strong>Matematika</strong> <br />
            Apakah kamu ingin melanjutkan tryout tersebut?
          </p>
        </Dialog>
      ) : null}
      <div className="  ">
        <div className="flex  ">
          <div className="max-w-[800px] w-full bg-white pr-10 p-10 rounded-2xl">
            <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
              <div className="title">
                <h1 className="text-xl md:text-2xl text-indigo-950 font-bold mb-5">
                  {title}
                </h1>
              </div>
            </div>
            <table className="table-auto w-full md:w-3/4 text-sm">
              <tbody>
                <tr>
                  <td className="flex gap-2 w-[150px] md:w-[200px]">
                    <IconFolder />
                    Nama Paket
                  </td>
                  <td style={{ width: 20 }}>:</td>
                  <td>
                    <span>{detail?.nama}</span>
                  </td>
                </tr>
                <tr>
                  <td className="flex gap-2 w-[150px] md:w-[200px]">
                    <IconBook2 />
                    Jumlah Soal
                  </td>
                  <td style={{ width: 20 }}>:</td>
                  <td>
                    <span>{hitungJumlahBankSoal(detail)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="flex gap-2 w-[150px] md:w-[200px]">
                    <IconClock />
                    Durasi Pengerjaan
                  </td>
                  <td style={{ width: 20 }}>:</td>
                  <td>
                    <span>{detail?.waktu} Menit</span>
                  </td>
                </tr>
                <tr>
                  <td className="flex gap-2 w-[150px] md:w-[200px]">
                    <IconGraph />
                    Passing Grade
                  </td>
                  <td
                    style={{
                      width: 20,
                      verticalAlign: 'top',
                      paddingTop: '5px',
                    }}
                  >
                    :
                  </td>
                  <td>
                    <ul className="mt-1">
                      {detail?.PaketLatihanSoal?.map(
                        (item: any, index: number) => (
                          <li className="flex gap-1" key={index}>
                            <IconCircleCheck
                              className="text-green-500"
                              size={24}
                            />
                            <span>
                              <span className="font-semibold">
                                {item.bankSoalCategory?.nama}
                              </span>{' '}
                              : {item.bankSoalCategory?.kkm}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-10 text-sm md:text-base">
              Catatan: <br />
              <ul className=" ml-5 list-disc">
                <li>Pastikan koneksi internet kamu stabil.</li>
                <li>Menggunakan browser dengan versi terbaru</li>
                <li>
                  Disarankan menggunakan laptop atau komputer untuk mengerjakan
                  d.
                </li>
                <li>
                  Tidak ada aktifitas lain di akun kamu selama mengerjakan
                  tryout
                </li>
              </ul>
            </div>

            <div className="flex justify-center  mt-10">
              <button
                className="bg-tertiary text-white p-3 px-10 rounded-full"
                onClick={() =>
                  active?.id ? setIsOnGoing(true) : handleStart()
                }
              >
                Mulai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
