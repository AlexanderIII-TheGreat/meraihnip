import BreadCrumb from '@/components/breadcrumb';
import StartTryout from '@/components/start-taryout';
import OnGoingTryout from '@/components/tryout';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TryoutPage({ isBimbel }: any) {
  const [data, setData] = useState<any>({});
  const [tryout, setTryout] = useState<any>({});
  const { id, paketId, tryoutId } = useParams();

  const getDetailClass = async () => {
    await getData(`user/find-my-class/${id}`).then((res) => {
      // if (res.error) window.location.href = '/paket-pembelian';
      setData(res);
    });

    await getData(`user/find-latihan/${paketId}`).then((res) => {
      setTryout(res);
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);
  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="hidden md:block">
        {isBimbel ? (
          <BreadCrumb
            page={[
              { name: 'Paket saya', link: '/my-class' },
              {
                name: data?.paketPembelian?.nama || 'Nama Kelas',
                link: '/my-class',
              },
              { name: 'Bimbel', link: `/my-class/${id}/bimbel` },
              { name: tryout?.nama || 'Tryout', link: '#' },
            ]}
          />
        ) : (
          <BreadCrumb
            page={[
              { name: 'Paket saya', link: '/my-class' },
              {
                name: data?.paketPembelian?.nama || 'Nama Kelas',
                link: '/my-class',
              },
              { name: 'Tryout', link: `/my-class/${id}/tryout` },
              { name: tryout?.nama || 'Tryout', link: '#' },
            ]}
          />
        )}
      </div>

      {tryoutId ? (
        <OnGoingTryout detail={tryout} isBimbel={isBimbel} />
      ) : (
        <StartTryout
          title={data?.paketPembelian?.nama}
          detail={tryout}
          isBimbel={isBimbel}
        />
      )}
    </div>
  );
}
