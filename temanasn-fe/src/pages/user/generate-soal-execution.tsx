import { getData, postData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CKeditor from '@/components/ckeditor';
import { Dialog, Radio, Tag, Switch } from 'tdesign-react';
import Countdown from 'react-countdown';
import { IconExclamationCircle } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import BreadCrumb from '@/components/breadcrumb';

export default function GenerateSoalExecution({ isPembahasan }: { isPembahasan?: boolean }) {
  const [onShow, setOnShow] = useState(0);
  const [history, setHistory] = useState<any>({});
  const { id } = useParams(); // history ID
  const [soal, setSoal] = useState<any>({});
  const navigate = useNavigate();

  const [selected, setSelected] = useState<any>(0);
  const [soalList, setSoalList] = useState<any>([]);

  const [isFinish, setIsFinish] = useState(false);
  const [showGrade, setShowGrade] = useState(false);
  const [finishAt, setFinishAt] = useState<any>();
  const [resultData, setResultData] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch History Detail (Header + List of Question IDs)
  const getDetail = async () => {
    getData(`user/generate-soal-history/history/${id}`).then((res) => {
      if (!res.id) return navigate('/generate-soal/riwayat');
      setHistory(res);
      setSoalList(res?.soalId || []);
      
      // Calculate finish time based on 'waktu' (minutes) and createdAt
      // Or if it's dynamic, maybe just count up? 
      // The requirement asks for timer similar to tryout.
      // Assuming 'waktu' is duration in minutes.
      // If the user continues a session, we need to know when it started or expires.
      // For now, let's assume 'waktu' is the limit from start.
      // But if user reloads, we need to persist time.
      // The backend doesn't seem to track 'startAt' for this specific history, only createdAt.
      // So we use createdAt + waktu (minutes).
      // Use current time + duration for Latihan, allowing user to do it anytime.
      // This resets timer on reload, which is acceptable for 'Latihan' simple mode.
      const endTime = moment().add(res.waktu, 'minutes');
      setFinishAt(endTime.format());
    });
  };

  // Answer Question
  const answerSoal = async (jawabanId: any) => {
    const currentSoalId = soalList?.[onShow]?.id;
    if (!currentSoalId) return;

    postData(`user/generate-soal-history/answer`, {
      jawabanSelect: jawabanId,
      id: currentSoalId, // detail ID
    }).then((res) => {
      if ('error' in res) {
         toast.error(res.message);
         return;
      }

      setSoalList((prev: any) => {
        const newList = [...prev];
        if (newList[onShow]) {
            newList[onShow].isAnswer = jawabanId !== null;
            newList[onShow].status = 'DIJAWAB'; // Optimistic update, actual correctness is hidden until finish?
        }
        return newList;
      });
    });
  };

  // Finish Exam
  const handleFinish = async () => {
    if (!history?.id) return;
    postData(`user/generate-soal-history/finish`, {
      id: history.id,
    }).then((res) => {
      if ('data' in res) {
          setResultData(res.data?.data);
          setShowGrade(true);
          setIsFinish(false);
      }
    });
  };

  useEffect(() => {
    getDetail();
  }, [id]);

  // Prevent copy/paste
  useEffect(() => {
    const handleCopy = (e: any)=> {
        e.preventDefault();
        e.clipboardData.setData("text/plain","");
    }
    const handleContextMenu = (e: any) => e.preventDefault();
    window.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("cut", handleCopy)
    window.addEventListener("copy", handleCopy)
    return () => {
        window.removeEventListener("contextmenu", handleContextMenu)
        window.removeEventListener("cut", handleCopy)
        window.removeEventListener("copy", handleCopy)
    }
  });

  const Completionist = () => {
    if (!showGrade && !isFinish) {
       // Auto finish when time is up
       // handleFinish(); // Careful with loop
       // Just show time up dialog
    }
    return <span>Waktu Habis</span>;
  };
    
  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <div  className="text-yellow-100  flex">
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none">
              {hours}
            </div>
            <div className=" text-center uppercase text-sm leading-none">
              Jam
            </div>
          </div>
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none">
              {minutes}
            </div>
            <div className=" text-center uppercase text-sm leading-none">
              Menit
            </div>
          </div>
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none">
              {seconds}
            </div>
            <div className=" text-center uppercase text-sm leading-none">
              Detik
            </div>
          </div>
        </div>
      );
    }
  };

  const CT = () => {
    if(!finishAt || isPembahasan) return null;
    return <Countdown date={finishAt} key={finishAt} renderer={renderer} onComplete={() => {
        if (!showGrade) handleFinish();
    }}/>;
  };

  // Fetch Question Content when 'onShow' changes
  useEffect(() => {
    const currentDetailId = soalList?.[onShow]?.id;
    if (currentDetailId) {
      getData(`user/generate-soal-history/soal/${currentDetailId}`).then((res) => {
        setSoal(res);
        // Handle -1 as null (no answer)
        setSelected(res?.jawabanSelect);
      });
    }
  }, [onShow, soalList]);

  return (
    <section>
      <BreadCrumb
        page={[
          { name: 'Generate Soal', link: '/generate-soal' },
          { name: 'Riwayat', link: '/generate-soal/riwayat' },
          { name: history?.name || 'Latihan', link: '#' },
        ]}
      />

      <div className="flex justify-end md:hidden mb-2">
        <CT />
      </div>

      <div className="bg-white px-4 xl:px-10 py-10 rounded-2xl relative">
        {/* Finish Dialog */}
        {isFinish && (
          <Dialog
            visible
            header={
              <>
                <IconExclamationCircle className="mr-2 text-warning" />
                <span>Apakah Kamu Yakin ?</span>
              </>
            }
            mode="modal"
            onClose={() => setIsFinish(false)}
            onConfirm={handleFinish}
          >
            <p>
              Apakah kamu yakin ingin mengakhiri latihan{' '}
              <span className="font-semibold">{history?.name}</span> ? Kamu telah mengerjakan{' '}
              {soalList?.filter((item: any) => item.isAnswer).length}/{soalList?.length} soal.
            </p>
          </Dialog>
        )}

        {/* Result Table View */}
        {showGrade && resultData && (
          <div className="bg-white p-8 rounded-2xl shadow-lg mt-6">
            <div className="flex justify-between items-center mb-10 border-b pb-6">
              <h2 className="text-3xl font-black text-indigo-950 text-center w-full uppercase tracking-tight">
                Hasil Latihan
              </h2>
            </div>

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

            <div className="mt-10 flex justify-center">
              <button
                onClick={() => navigate('/generate-soal/riwayat')}
                className="bg-indigo-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-800 transition-colors"
              >
                Kembali ke Riwayat
              </button>
            </div>
          </div>
        )}

        {/* Live Exam View */}
        {!showGrade && (
          <div className="block md:flex flex-row-reverse">
            {/* Sidebar Question Navigation */}
            <div className="relative w-full md:w-3/12 md:border-l md:pl-10">
              <aside className="sticky top-10  border-[#DDD] ">
                <div className="flex  gap-y-5 mb-5 md:flex-row md:items-center justify-start justify-between header-section w-full">
                  <div className="title">
                    <h1 className="text-2xl text-indigo-950 font-bold ">Nomor Soal</h1>
                  </div>
                  <small className="self-center">
                    {soalList?.filter((item: any) => item.isAnswer).length}/{soalList?.length}
                  </small>
                </div>

                <ul className="grid grid-cols-4 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {soalList?.map((item: any, index: number) => (
                    <li key={index}>
                      <button
                        onClick={() => setOnShow(index)}
                        className={`
                            text-indigo-950 hover:shadow-md text-center p-2 py-3 rounded-md w-full
                            ${
                              soalList?.[onShow]?.id === item.id
                                ? 'bg-[#1e1b4b] text-white border border-[#1e1b4b]'
                                : isPembahasan
                                ? item.status === 'BENAR'
                                  ? 'bg-green-500 text-white border-green-500'
                                  : item.status === 'SALAH'
                                  ? 'bg-red-500 text-white border-red-500'
                                  : 'border border-gray-300'
                                : item.isAnswer
                                ? 'border border-green-500 text-white bg-green-500'
                                : ' border border-gray-300'
                            }
                        `}
                      >
                        <span className="w-full"> {index + 1}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {!isPembahasan && (
                  <button
                    className="bg-success text-white w-full py-3 mt-4 text-sm rounded-md hover:shadow-md"
                    onClick={() => {
                      setIsFinish(true);
                    }}
                  >
                    Selesai
                  </button>
                )}
              </aside>
            </div>

            {/* Main Question Area */}
            <div className="w-full md:w-9/12 md:pr-5 mt-10 md:mt-0">
              <div className="flex flex-col border-b pb-2 border-gray-300 gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
                <div className="title flex gap-2 items-center">
                  <h1 className="text-xl">
                    Soal No
                    <span className=" text-md w-[20px]"> {onShow + 1}</span>
                  </h1>
                  {soal.subCategory && <Tag variant="light-outline">{soal?.category}</Tag>}
                </div>
                <div className="hidden md:block">
                  <CT />
                </div>
              </div>

              <div className="min-h-[200px] md:min-h-[600px] mt-8 ">
                <div className="mb-4">
                  <div>
                    <CKeditor content={soal?.soal || ''} readOnly className="mb-5 inline-block w-full" />
                  </div>
                </div>

                {soal?.jawabanShow?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`w-full flex mb-3 justify-start ${
                      isPembahasan && item.isCorrect ? 'text-green-500' : ''
                    } ${isPembahasan && String(selected) === String(item.id) && !item.isCorrect ? 'text-red-500' : ''}`}
                  >
                    <Radio
                      allowUncheck
                      checked={String(selected) === String(item.id)}
                      className="mr-2 self-baseline"
                      readonly={isPembahasan}
                      onChange={() => {
                        if (!isPembahasan) {
                          const newValue = String(selected) === String(item.id) ? null : item.id;
                          setSelected(newValue);
                          answerSoal(newValue);
                        }
                      }}
                    ></Radio>
                    <div
                      className="flex w-full cursor-pointer"
                      onClick={() => {
                        if (!isPembahasan) {
                          const newValue = String(selected) === String(item.id) ? null : item.id;
                          setSelected(newValue);
                          answerSoal(newValue);
                        }
                      }}
                    >
                      <p className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</p>
                      <div className="">
                        <div className=" overflow-hidden">
                          <CKeditor content={item.value} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isPembahasan && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-lg mb-2 text-indigo-900 border-b border-blue-200 pb-2">Pembahasan</h4>
                    <CKeditor content={soal?.pembahasan || 'Tidak ada pembahasan'} readOnly />
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-10 mt-10">
                <button
                  className={`bg-white border border-tertiary text-tertiary hover:bg-tertiary hover:text-white p-3 px-5 rounded-full ${
                    onShow > 0 ? '' : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (onShow > 0) setOnShow(onShow - 1);
                  }}
                >
                  Sebelumnya
                </button>
                <button
                  className={`bg-tertiary text-white p-3 px-5 rounded-full ${
                    onShow === soalList?.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (onShow < soalList?.length - 1) setOnShow(onShow + 1);
                  }}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
