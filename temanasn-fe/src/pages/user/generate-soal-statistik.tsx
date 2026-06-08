import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CKeditor from '@/components/ckeditor';
import { Switch, Button } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import { IconArrowLeft } from '@tabler/icons-react';

export default function GenerateSoalStatistik() {
  const { id } = useParams(); // history ID
  const navigate = useNavigate();
  const [resultData, setResultData] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStatistic = async () => {
    setLoading(true);
    await getData(`user/generate-soal-history/statistic/${id}`).then((res) => {
      setResultData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    getStatistic();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  return (
    <section>
      <BreadCrumb
        page={[
          { name: 'Generate Soal', link: '/generate-soal' },
          { name: 'Riwayat', link: '/generate-soal/riwayat' },
          { name: 'Statistik', link: '#' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
        <div className="flex justify-between items-center mb-10 border-b pb-6 relative">
          <Button 
            variant="text" 
            shape="circle" 
            icon={<IconArrowLeft size={24} />} 
            onClick={() => navigate('/generate-soal/riwayat')}
            className="absolute left-0"
          />
          <h2 className="text-3xl font-black text-indigo-950 text-center w-full uppercase tracking-tight">
            Statistik Latihan
          </h2>
        </div>

        {resultData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-indigo-900 p-6 rounded-3xl text-center shadow-lg shadow-indigo-100">
                <p className="text-indigo-200 text-xs mb-1 uppercase font-black tracking-widest">Skor Akhir</p>
                <h3 className="text-5xl font-black text-white">{resultData.calculatedScore}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center border-2 border-orange-100">
                <p className="text-orange-500 text-xs mb-1 uppercase font-black tracking-widest">Benar</p>
                <h3 className="text-5xl font-black text-orange-600">{resultData.benarCount}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center border-2 border-red-500/10">
                <p className="text-red-500 text-xs mb-1 uppercase font-black tracking-widest">Salah</p>
                <h3 className="text-5xl font-black text-red-600">{resultData.salahCount}</h3>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center border-2 border-gray-100">
                <p className="text-gray-400 text-xs mb-1 uppercase font-black tracking-widest">Kosong</p>
                <h3 className="text-5xl font-black text-gray-500">{resultData.kosongCount}</h3>
              </div>
            </div>

            <div className="flex justify-center items-center mb-6 gap-3">
              <span className="text-sm font-bold text-indigo-950 uppercase tracking-wider">Tampilkan Detail</span>
              <Switch
                size="large"
                value={showExplanation}
                onChange={(val) => setShowExplanation(val as boolean)}
                label={['ON', 'OFF']}
              />
            </div>

            {showExplanation && (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-center">NO</th>
                      <th scope="col" className="px-6 py-3">SOAL</th>
                      <th scope="col" className="px-6 py-3 text-center uppercase">Jawaban Kamu</th>
                      <th scope="col" className="px-6 py-3 text-center uppercase text-indigo-900">Kunci</th>
                      <th scope="col" className="px-6 py-3 uppercase text-indigo-950 font-black">Pembahasan</th>
                      <th scope="col" className="px-6 py-3 text-center uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultData.summaryTable?.map((item: any, index: number) => (
                      <tr key={index} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-center font-medium text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4 text-base font-bold text-gray-900">
                          <CKeditor content={item.soal} readOnly />
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900 text-sm">
                          <CKeditor content={item.jawabanKamu} readOnly />
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900 text-sm text-indigo-900">
                          <CKeditor content={item.kunci} readOnly />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 bg-indigo-50/30">
                          <div className="max-w-md">
                            <CKeditor content={item.pembahasan} readOnly />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                              item.status === 'Benar' ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
