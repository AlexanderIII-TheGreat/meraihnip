import BreadCrumb from '@/components/breadcrumb';
import { getData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PassingGradeChart from './passing-grade-chart';
import CategoryChart from './category-chart';
import { konversiDetikKeWaktu } from '@/const';
import { Tag } from 'tdesign-react';
import { IconCircleCheck, IconCircleX, IconArrowLeft } from '@tabler/icons-react';
import PointChartBenarSalah from './point-chart-benar-salah';
import PointChartPenilaian from './point-chart-penilaian';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Link } from 'react-router-dom';

interface SubcategoryMap {
  [subcategoryName: string]: {
    subcategory: string;
    duration: number;
    correct: number;
    point: number;
    pointFrequency: { point: number; frequency: number }[];
    // Add any other properties if necessary
  };
}

function modifyData(data: any[]) {
  const processedData = [];

  for (const categoryData of data) {
    const processedCategory = { ...categoryData };
    const subcategoryMap: SubcategoryMap = {};

    for (const subcategoryData of categoryData.subCategory) {
      const subcategoryName = subcategoryData.subcategory;
      const duration = subcategoryData.duration;
      const correct = subcategoryData.correct || 0;
      const point = subcategoryData.point;

      if (!subcategoryMap[subcategoryName]) {
        // Jika subCategory belum ada, tambahkan baru
        subcategoryMap[subcategoryName] = {
          ...subcategoryData,
          correct: correct,
          point: point,
        };

        // Inisialisasi frekuensi nilai point di dalam subcategory
        subcategoryMap[subcategoryName].pointFrequency = [];
      } else {
        // Jika subCategory sudah ada, tambahkan durasi, correct, dan point-nya
        subcategoryMap[subcategoryName].duration += duration;
        subcategoryMap[subcategoryName].correct += correct;
        subcategoryMap[subcategoryName].point += point;
      }

      // Hitung frekuensi kemunculan setiap nilai point di dalam subcategory
      if (point) {
        const frequencyIndex = subcategoryMap[
          subcategoryName
        ].pointFrequency.findIndex((entry) => entry.point === point);

        if (frequencyIndex === -1) {
          // Jika point belum ada dalam array, tambahkan baru
          subcategoryMap[subcategoryName].pointFrequency.push({
            point,
            frequency: 1,
          });
        } else {
          // Jika point sudah ada dalam array, tingkatkan frekuensinya
          subcategoryMap[subcategoryName].pointFrequency[frequencyIndex]
            .frequency++;
        }
      }
    }

    const processedSubcategories = Object.values(subcategoryMap);
    processedCategory.subCategory = processedSubcategories;
    processedData.push(processedCategory);
  }

  return processedData;
}

export default function PembahasanTryout({ isBimbel }: any) {
  const isMobile = useIsMobile();
  const [data, setData] = useState<any>({});
  const [tryout, setTryout] = useState<any>({});
  const { id, paketId, tryoutId, paketFK } = useParams();
  const [detail, setDetail] = useState<any>({});
  const [allPoint, setAllPoint] = useState({
    isPassing: true,
    point: 0,
    max_point: 0,
  });

  const getDetailClass = async () => {
    await getData(`user/find-my-class/${id}`).then((res) => {
      if (res.error) window.location.href = '/paket-pembelian';
      setData({ ...res });
    });

    await getData(`user/find-latihan/${paketId}`).then((res) => {
      setTryout(res);
    });

    await getData(`user/tryout/statistic`, {
      id: tryoutId,
    }).then((res) => {
      setAllPoint({
        isPassing: true,
        point: 0,
        max_point: 0,
      });
      res?.pointCategory?.forEach((e: any) => {
        if (e.all_point < e.kkm) {
          setAllPoint((prev) => ({
            ...prev,
            isPassing: false,
          }));
        }
        setAllPoint((prev) => ({
          ...prev,
          point: Number(prev.point) + Number(e.all_point),
          max_point: Number(prev.max_point) + Number(e.maxPoint),
        }));
      });
      setDetail({ ...res, pointCategory: modifyData(res.pointCategory) });
    });
  };

  useEffect(() => {
    getDetailClass();
  }, []);

  return (
    <div className={isMobile ? "md:hidden fixed inset-0 z-50 bg-[#f8f9fa] overflow-y-auto overflow-x-hidden pb-10" : ""}>
      {isMobile && (
        <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 border-b">
          <Link to={`/my-class/${id}/${isBimbel ? 'bimbel' : 'tryout'}/${paketFK}/${paketId}`} className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-indigo-950">Statistik</h1>
          <div className="w-8"></div>
        </div>
      )}

      {!isMobile && (
        isBimbel ? (
          <BreadCrumb
            page={[
              { name: 'Paket saya', link: '/my-class' },
              {
                name: data?.paketPembelian?.nama || 'Nama Kelas',
                link: '/my-class',
              },
              { name: 'Bimbel', link: `/my-class/${id}/bimbel` },
              {
                name: tryout?.nama || 'Bimbel',
                link: `/my-class/${id}/bimbel/mini-test/${paketFK}/${paketId}`,
              },
              { name: 'Statistic', link: '#' },
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
              {
                name: tryout?.nama || 'Tryout',
                link: `/my-class/${id}/tryout/${paketFK}/${paketId}`,
              },
              { name: 'Statistic', link: `#` },
            ]}
          />
        )
      )}

      <div className={isMobile ? "p-4" : ""}>
        {!isMobile && (
          <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
            <div className="title">
              <h1 className="text-2xl font-bold">Statistik</h1>
            </div>
          </div>
        )}
        <div className="mt-2">
          <div className="flex gap-5 flex-wrap xl:flex-nowrap">
            <div className="w-full md:w-6/12 xl:w-4/12 bg-white px-5 py-6 md:px-10 md:py-10 rounded-2xl">
              <h1 className="text-lg md:text-xl font-bold mb-5">Passing Grade</h1>

              {allPoint.isPassing ? (
                <Tag
                  variant="light-outline"
                  theme={'success'}
                  className={`flex mb-5 w-full justify-center rounded-2xl h-14 bg-white bg-clip-border px-3 py-4 border shadow-md border-green-500`}
                >
                  <p className=" text-lg font-medium text-navy-700 text-center w-full flex">
                    <IconCircleCheck size={24} className="mr-1 mt-0.5" />
                    <span className="self-center">Selamat, kamu lulus!</span>
                  </p>
                </Tag>
              ) : null}
              {!allPoint.isPassing ? (
                <Tag
                  variant="light-outline"
                  theme={'danger'}
                  className={`flex mb-5 w-full justify-center rounded-2xl bg-white bg-clip-border px-1 py-6 border shadow-md border-green-500`}
                >
                  <p className=" text-lg font-medium text-navy-700 text-center w-full flex">
                    <IconCircleX size={24} className="mr-1 mt-0.5" />
                    <span className="self-center text-sm">
                      Maaf, Kamu Belum Lulus!
                    </span>
                  </p>
                </Tag>
              ) : null}
              <div className="text-center mt-5">
                <p className="text-xl">SKOR ANDA</p>
                <p className="text-4xl font-semibold">{allPoint.point}</p>
                <p>
                  dari <strong>{allPoint.max_point}</strong>
                </p>
              </div>
              <div className="text-center mt-5">
                <p className="text-xl">DURASI PENGERJAAN</p>

                <p className="text-lg">
                  <strong>
                    {konversiDetikKeWaktu(detail?.waktuPengerjaan)}
                  </strong>
                </p>
              </div>
            </div>
            <div className="w-full paketrekomendasiplace md:w-6/12 xl:w-8/12 min-h-[400px] bg-white px-5 py-6 md:px-10 md:py-10 rounded-2xl flex flex-wrap">
              <div className="w-full xl:w-3/12">
                <h1 className="text-base xl:text-xl font-bold mb-5">
                  Passing Grade
                </h1>

                {detail?.pointCategory?.map((e: any) => (
                  <Tag
                    variant="light-outline"
                    theme={e.all_point >= e?.kkm ? 'success' : 'danger'}
                    className={`flex mb-5 w-full justify-center rounded-2xl h-20 bg-white bg-clip-border px-3 py-4 border shadow-md ${
                      e.all_point >= e?.kkm
                        ? 'border-green-500'
                        : '!border-red-500'
                    }`}
                  >
                  {/*  <p className="text-xl text-gray-600 font-semibold text-center w-full">
                      {e.category}                    </p> */}

                    <p className="text-base font-medium text-navy-700 text-center w-full">
                      <span>{e.all_point} </span>
                      dari
                      <span> {e?.kkm}</span>
                    </p>
                  </Tag>
                ))}
              </div>
              <div className="w-full xl:w-9/12">
                <PassingGradeChart
                  data={detail?.pointCategory?.map((e: any) => ({
                    name: e.category,
                    KKM: e.kkm,
                    Nilai: e.all_point,
                  }))}
                />
              </div>
                {/* Paket Rekomendasi */}
              {detail?.pointCategory?.some(
                (e: any) => e.all_point < e.kkm && e?.paketRekomendasi?.id
              ) && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Rekomendasi Belajar</h2>
                  <div className="space-y-4">
                    {detail.pointCategory
                      .filter((e: any) => e.all_point < e.kkm && e?.paketRekomendasi?.id)
                      .map((e: any) => (
                        <div
                          key={e.category}
                          className="p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-50 shadow-sm hover:shadow-md transition cursor-pointer"
                          onClick={() => {
                            const query = encodeURIComponent(e.paketRekomendasi.nama);
                            window.location.href = `/paket-pembelian?search=${query}`;
                          }}
                        >
                          <p className="text-sm text-gray-800 mb-2">
                            Nilai <span className="font-semibold">{e.category}</span> kamu belum
                            mencapai KKM ({e.all_point}/{e.kkm}).  
                            Disarankan untuk mempelajari paket berikut:
                          </p>
                          <h3 className="text-lg font-semibold text-blue-900">
                            {e.paketRekomendasi.nama}
                          </h3>
                          {e.paketRekomendasi.deskripsi && (
                            <p className="text-sm text-gray-600 mb-1">
                              {e.paketRekomendasi.deskripsi}
                            </p>
                          )}
                          <p className="text-base font-bold text-green-600">
                            Rp {e.paketRekomendasi.harga?.toLocaleString("id-ID")}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        <div className="mt-5 xl:mt-6">
          <div className="grid grid-cols-1 gap-5">
            {detail?.pointCategory?.map((e: any) => (
              <div key={e.category} className="grid md:grid-cols-2 gap-5">
                <div className="bg-white w-full px-5 py-6 md:px-10 md:py-10 rounded-2xl min-h-[450px]">
                  <h1 className="text-lg md:text-xl font-bold text-center">
                    {e.category}
                  </h1>
                  <p className="text-center mb-5 font-semibold text-gray-600 text-sm md:text-base">
                    Total Waktu: {konversiDetikKeWaktu(e.duration)}
                  </p>

                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2">Topik</th>
                          <th scope="col" className="px-4 py-2 text-right">Durasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {e.subCategory?.map((sub: any, idx: number) => (
                          sub.subcategory && (
                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{sub.subcategory}</td>
                              <td className="px-4 py-2 text-right font-mono">
                                {konversiDetikKeWaktu(sub.duration)}
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold">Jumlah Soal</p>
                      <p className="text-lg font-bold text-gray-800">{e.count_soal}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold">Skor Anda</p>
                      <p className="text-lg font-bold text-indigo-600">{e.all_point}<span className="text-gray-400 text-sm">/{e.maxPoint}</span></p>
                    </div>
                    
                    {e.tipe_penilaian === 'BENAR_SALAH' && (
                      <>
                        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                          <p className="text-xs text-green-600 uppercase font-bold">Benar</p>
                          <p className="text-lg font-bold text-green-700">{e.answer_right}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
                          <p className="text-xs text-red-600 uppercase font-bold">Salah</p>
                          <p className="text-lg font-bold text-red-700">{e.answer_wrong}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-100 col-span-2">
                          <p className="text-xs text-yellow-600 uppercase font-bold">Tidak Terjawab</p>
                          <p className="text-lg font-bold text-yellow-700">{e.not_answer}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {e.tipe_penilaian === 'POINT' && (
                    <div className="grid grid-cols-5 gap-2 mb-6 text-center text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block font-bold text-gray-400">5 Poin</span>
                        <span className="font-bold text-indigo-600">{e?.point5}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block font-bold text-gray-400">4 Poin</span>
                        <span className="font-bold text-indigo-600">{e?.point4}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block font-bold text-gray-400">3 Poin</span>
                        <span className="font-bold text-indigo-600">{e?.point3}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block font-bold text-gray-400">2 Poin</span>
                        <span className="font-bold text-indigo-600">{e?.point2}</span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <span className="block font-bold text-gray-400">1 Poin</span>
                        <span className="font-bold text-indigo-600">{e?.point1}</span>
                      </div>
                    </div>
                  )}

                  <div className="h-[250px]">
                    <CategoryChart item={e} type={e.tipe_penilaian} />
                  </div>
                </div>
                <div className="bg-white w-full px-5 py-8 md:px-10 md:py-10 rounded-2xl min-h-[450px]">
                  <p className="text-center font-medium text-sm md:text-base">
                    Grafik Jawaban berdasarkan kategori
                  </p>
                  <div className="h-full max-h-[400px]">
                    {e.tipe_penilaian === 'BENAR_SALAH' ? (
                      <PointChartBenarSalah data={e.subCategory} />
                    ) : (
                      <PointChartPenilaian data={e.subCategory} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
