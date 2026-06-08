import { formatTime } from '@/utils';
import { getData, postData } from '@/utils/axios';
import { useEffect, useRef, useState } from 'react';
import Countdown from 'react-countdown';
import { useNavigate } from 'react-router-dom';
import { Popconfirm } from 'tdesign-react';

export default function AlertTryout() {
  const navigate = useNavigate();
  const [active, setActive] = useState<any>({});
  const location = window.location.pathname;

  const checkActive = () => {
    getData(`user/tryout/check-active`).then((res) => {
      if (res?.id) setActive(res);
      else setActive({});
    });
  };

  useEffect(() => {
    checkActive();
  }, [location]);

  const handleFinish = async () => {
    postData(`user/tryout/finish`, {
      tryoutId: active?.id,
    }).then(() => {
      if (active?.paketPembelianTryout?.id) {
        navigate(
          `/my-class/${active?.paketPembelianTryout?.paketPembelianId}/tryout/${active.paketPembelianTryoutId}/${active.paketLatihanId}/${active?.id}/statistik`
        );
      } else if (active?.paketPembelianBimbel?.paketPembelianId) {
        navigate(
          `/my-class/${active?.paketPembelianBimbel?.paketPembelianId}/tryout/${active.paketPembelianBimbelId}/${active.paketLatihanId}/${active?.id}/statistik`
        );
      }
    });
  };

  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return '';
    } else {
      return (
        <span className="text-sm text-gray-500">
          {formatTime(hours, minutes, seconds)}
        </span>
      );
    }
  };

  const refChild = useRef<any>(null);

  if (
    !active?.id ||
    location ===
      `/my-class/${active?.paketPembelianTryout?.paketPembelianId}/tryout/${active.paketPembelianTryoutId}/${active.paketLatihanId}/${active?.id}` ||
    location ===
      `/my-class/${active?.paketPembelianBimbel?.paketPembelianId}/bimbel/mini-test/${active.paketPembelianBimbelId}/${active.paketLatihanId}/${active?.id}`
  )
    return null;

  return (
    <div className="z-[99] pointer-events-none fixed right-0 bottom-8 animate-pulse w-full">
      <div className="flex justify-end md:mr-10">
        <div
          ref={refChild}
          className=" pointer-events-auto bg-white flex w-full max-w-md divide-x divide-gray-200 rounded-lg border border-indigo-500  shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div className="flex w-0 flex-1 items-center p-4">
            <div className="w-full">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-900">
                  Tryout masih berjalan
                </p>
                <Countdown
                  date={active?.finishAt}
                  key={active?.finishAt}
                  renderer={renderer}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                silahkan selesaikan tryout yang sedang berjalan{' '}
                <span className="text-black">{active?.paketLatihan?.nama}</span>
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col divide-y divide-gray-200">
              <div className="flex h-0 flex-1">
                <button
                  onClick={() => {
                    if (active?.paketPembelianTryout?.id) {
                      navigate(
                        `/my-class/${active?.paketPembelianTryout?.paketPembelianId}/tryout/${active.paketPembelianTryoutId}/${active.paketLatihanId}/${active?.id}`
                      );
                    } else if (active?.paketPembelianBimbel?.paketPembelianId) {
                      navigate(
                        `/my-class/${active?.paketPembelianBimbel?.paketPembelianId}/bimbel/mini-test/${active.paketPembelianBimbelId}/${active.paketLatihanId}/${active?.id}`
                      );
                    }
                  }}
                  type="button"
                  className="flex w-full items-center justify-center rounded-none rounded-tr-lg border border-transparent px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Lanjutkan
                </button>
              </div>
              <div className="flex h-0 flex-1">
                <Popconfirm
                  content="Apakah kamu yakin ?"
                  theme="danger"
                  onConfirm={() => handleFinish()}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent px-4 py-3 text-sm font-medium text-red-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Selesaikan
                  </button>
                </Popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
