import BreadCrumb from '@/components/breadcrumb';
import OnGoingTryout from '@/components/tryout';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PembahasanTryout() {
  const [data, setData] = useState<any>({});
  const [tryout, setTryout] = useState<any>({});
  const { id, paketId } = useParams();

  const getDetailClass = async () => {
    await getData(`user/find-my-class/${id}`).then((res) => {
      if (res.error) window.location.href = '/paket-pembelian';
      setData({ ...res, materi: res?.paketPembelian?.paketPembelianMateri });
    });

    await getData(`user/find-latihan/${paketId}`).then((res) => {
      setTryout(res);
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);
  return (
    <div>
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
      <OnGoingTryout isPembahasan />
    </div>
  );
}
