
import BreadCrumb from '@/components/breadcrumb';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'tdesign-react';

export default function SoalKecermatanUser() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Using existing endpoint
      const res = await getData('admin/kategori-soal-kecermatan/get');
      if (res?.list) {
          setData(res.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <BreadCrumb
        page={[
          { name: 'Home', link: '/' },
          { name: 'Soal Kecermatan', link: '#' },
        ]}
      />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bank Soal Kecermatan</h1>
        <p className="text-gray-500 mt-1">Pilih kategori soal untuk mulai berlatih kecermatan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.judul_kategori}</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.keterangan || 'Latihan Kecermatan'}</span>
                    </div>
                </div>
                
                <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-sm text-gray-600 border-b border-gray-50 pb-2">
                        <span>Jumlah Kiasan</span>
                        <span className="font-semibold">{item._count?.Kiasan || 0}</span>
                    </div>
                     <div className="flex justify-between text-sm text-gray-600 border-b border-gray-50 pb-2">
                        <span>Waktu</span>
                        <span className="font-semibold">{item.waktu} Detik</span>
                    </div>
                </div>

                <Link to={`/soal-kecermatan/${item.id}`} className="block">
                    <Button block theme="primary" variant="base">
                        Kerjakan Soal
                    </Button>
                </Link>
            </div>
        ))}

        {!loading && data.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                Belum ada soal kecermatan yang tersedia.
            </div>
        )}
      </div>
    </div>
  );
}
