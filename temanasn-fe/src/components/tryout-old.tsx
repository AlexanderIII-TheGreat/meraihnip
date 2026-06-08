import { getData, postData } from '@/utils/axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CKeditor from './ckeditor';
import { Dialog, Radio, Tag } from 'tdesign-react';
import Countdown from 'react-countdown';
import { IconExclamationCircle } from '@tabler/icons-react';
import toast from 'react-hot-toast';
import moment from 'moment';

export default function OnGoingTryout({ isPembahasan, isBimbel }: any) {
  const [onShow, setOnShow] = useState(0);
  const [tryout, setTryout] = useState<any>({});
  const { tryoutId, id, paketId, paketFK } = useParams();
  const [soal, setSoal] = useState<any>({});
  const navigate = useNavigate();

  const [selected, setSelected] = useState<any>(0);
  const [soalId, setSoalId] = useState<any>([]);

  const [isFinish, setIsFinish] = useState(false);
  const [showGrade, setShowGrade] = useState(false);
  const [finishAt, setFinishAt] = useState<any>();
  const [allPoint, setAllPoint] = useState({
    isPassing: true,
    point: 0,
    maxPoint: 0,
  });
  const [point, setPoint] = useState<any>([]);

  const getDetail = async () => {
    getData(`user/find-tryout/${tryoutId}`, { isPembahasan }).then((res) => {
      if (!res.id) return navigate('/my-class');
      setTryout(res);
      setSoalId(res?.soalId);
      setFinishAt(moment().add(res?.waktuTersisa, 'seconds')?.format());
    });
  };
  const answerTryout = async (e: any) => {
    postData(`user/tryout/answer`, {
      jawabanSelect: e,
      soalId: soalId?.[onShow]?.id,
      tryoutId,
    }).then((res) => {
      if (!res?.data?.data?.id) {
        toast.error(res.data.msg);
        if (res.data.msg === 'Waktu Telah habis') {
          return handleFinish();
        } else {
          window.location.reload();
        }
      }
      setSoalId((prev: any) => {
        prev[onShow].isAnswer = e ? true : false;
        return prev;
      });
      // setOnShow(onShow < soalId?.length - 1 ? onShow + 1 : onShow);
    });
  };
  const handleFinish = async () => {
    if (!tryout?.id) return true;
    postData(`user/tryout/finish`, {
      tryoutId,
    }).then((res) => {
      setPoint(res?.data?.data);
      setShowGrade(true);
      res?.data?.data?.pointCategory?.forEach((e: any) => {
        if (e.all_point < e.kkm) {
          setAllPoint((prev) => ({
            ...prev,
            isPassing: false,
          }));
        }
        setAllPoint((prev: any) => ({
          ...prev,
          isPassing: e.all_point >= e.kkm ? true : false,
          point: Number(prev.point) + Number(e.all_point),
          maxPoint: Number(prev.maxPoint) + Number(e.maxPoint),
        }));
      });
    });
  };

  useEffect(() => {
    getDetail();
  }, []);
	
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
  })

  const Completionist = () => {
    if (!showGrade && !isPembahasan) {
      handleFinish();
    }
    return <div></div>;
  };
	
 
  const renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <div  className="text-yellow-100  flex">
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none" x-text="hours">
              {hours}
            </div>
            <div className=" text-center uppercase text-sm leading-none">
              Jam
            </div>
          </div>
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none" x-text="minutes">
              {minutes}
            </div>
            <div className=" text-center uppercase text-sm leading-none">
              Menit
            </div>
          </div>
          <div className="w-fit mx-1 p-2 bg-white text-indigo-900 rounded-lg">
            <div className=" text-center leading-none" x-text="seconds">
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
    return <Countdown date={finishAt} key={finishAt} renderer={renderer} />;
  };
  const [interval, setInterval] = useState(
    moment().add(5, 'seconds').format('YYYY-MM-DD HH:mm:ss')
  );

  const addDuration = async () => {
    await postData(`user/tryout/add-duration`, {
      id: soalId?.[onShow]?.id,
      duration: 5,
    });
  };

  const handleDurationChangeSoal = async () => {
    await postData(`user/tryout/add-duration`, {
      id: soalId?.[onShow]?.id,
      duration: moment(interval).diff(moment(), 'seconds'),
    });
    setInterval(moment().add(5, 'seconds').format('YYYY-MM-DD HH:mm:ss'));
  };

  useEffect(() => {
    if (soalId?.[onShow]?.id) {
      getData(`user/find-soal-tryout/${soalId?.[onShow]?.id}`, {
        isPembahasan,
      }).then((res) => {
        setSoal(res);
        if (!isPembahasan) {
          handleDurationChangeSoal();
          setInterval(moment().add(5, 'seconds').format('YYYY-MM-DD HH:mm:ss'));
        }
        setSelected(res?.jawabanSelect);
      });
    }
  }, [onShow, soalId]);

  return (
    <>
      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <div className="flex justify-end mb-2">
          <CT />
        </div>
        <div className="">
          {!isPembahasan && !showGrade ? (
            <Countdown
              date={interval}
              key={interval}
              className="hidden"
              onComplete={() => {
                addDuration();
                setInterval(
                  moment().add(5, 'seconds').format('YYYY-MM-DD HH:mm:ss')
                );
              }}
            />
          ) : (
            ''
          )}
        </div>{' '}
        <div className="bg-white px-4 xl:px-10 py-10 rounded-2xl ">
          <div>
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
                  Apakah kamu yakin ingin mengakhiri tryout{' '}
                  <span className="font-semibold">
                    {tryout?.paketLatihan?.nama}
                  </span>{' '}
                  ? Kamu tidak akan bisa melanjutkan tryout ini lagi. Kamu telah
                  mengerjakan{' '}
                  {soalId?.filter((item: any) => item.isAnswer).length}/
                  {soalId?.length} soal.
                </p>
              </Dialog>
            )}

            {showGrade && (
              <Dialog
                visible
                mode="modal"
                width={window.innerWidth < 768 ? '90%' : 500}
                header={
                  <h4 className="px-2 text-xl font-bold text-navy-700">
                    Hasil Tryout
                  </h4>
                }
                confirmBtn="Selesai"
                cancelBtn={false}
                closeBtn={false}
                onConfirm={() => {
                  if (isBimbel)
                    return navigate(
                      `/my-class/${id}/bimbel/mini-test/${paketFK}/${paketId}/${tryoutId}/statistik`
                    );

                  navigate(
                    `/my-class/${id}/tryout/${paketFK}/${paketId}/${tryoutId}/statistik`
                  );
                }}
              >
                <div className="relative flex flex-col items-center max-w-[95%] mx-auto bg-white bg-clip-bor-sm">
                  <div className="mb-4 w-full">
                    <p className="mt-2 px-2 text-base text-gray-600">
                      Hasil tryout kamu adalah sebagai berikut:
                    </p>

                    <p
                      className={`
                      mt-2 px-2 text-base text-gray-600 text-center ${
                        allPoint.isPassing ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {allPoint.isPassing
                        ? 'Selamat, kamu lulus!'
                        : 'Maaf, kamu belum lulus.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap flex-row mb-4 gap-2 w-full">
                    <Tag
                      variant="light-outline"
                      theme={allPoint.isPassing ? 'success' : 'danger'}
                      className={`flex flex-col h-auto w-full justify-center items-center rounded-2xl bg-white bg-clip-border py-4 px-4 border shadow-md ${
                        allPoint.isPassing
                          ? 'border-green-500'
                          : '!border-red-500'
                      }`}
                    >
                      <p className="text-sm text-gray-600 font-semibold text-center w-full break-words whitespace-normal mb-1">
                        {tryout?.paketLatihan?.nama}
                      </p>
                      <p className="text-base font-medium text-navy-700 text-center w-full">
                        <span>{allPoint.point} </span>
                        dari
                        <span> {allPoint.maxPoint}</span>
                      </p>
                    </Tag>
                    {point?.pointCategory?.map((e: any) => (
                      <Tag
                        key={e.category}
                        variant="light-outline"
                        theme={e.all_point >= e.kkm ? 'success' : 'danger'}
                        className={`flex flex-col h-auto w-full md:w-[48.5%] !m-0 justify-center items-center rounded-2xl bg-white bg-clip-border py-4 px-2 border shadow-md ${
                          e.all_point >= e.kkm
                            ? 'border-green-500'
                            : '!border-red-500'
                        }`}
                      >
                        <p className="text-xs text-gray-600 font-semibold text-center w-full break-words whitespace-normal mb-1">
                          {e.category}
                        </p>
                        <p className="text-sm font-medium text-navy-700 text-center w-full">
                          <span>{e.all_point} </span>
                          dari
                          <span> {e.kkm}</span>
                        </p>
                      </Tag>
                    ))}
                  </div>
                </div>
              </Dialog>
            )}
          </div>
          <div className="block md:flex flex-row-reverse">
            <div className="relative w-full md:w-3/12 md:border-l md:pl-10">
              <aside className="sticky top-10  border-[#DDD] ">
                <div className="flex  gap-y-5 mb-5 md:flex-row md:items-center justify-start justify-between header-section w-full">
                  <div className="title">
                    <h1 className="text-2xl text-indigo-950 font-bold ">
                      Nomor Soal
                    </h1>
                  </div>
                  <small className="self-center">
                    {soalId?.filter((item: any) => item.isAnswer).length}/
                    {soalId?.length}
                  </small>
                </div>
                {isPembahasan && (
                  <>
                    <div className="flex mb-5 gap-2">
                      <div className="w-[30px] h-[30px] bg-red-500"></div>
                      <p className="self-center">Salah</p>
                    </div>
                    <div className="flex mb-5 gap-2">
                      <div className="w-[30px] h-[30px] bg-green-500"></div>
                      <p className="self-center">Benar</p>
                    </div>
                    <div className="flex mb-5 gap-2">
                      <div className="w-[30px] h-[30px] bg-gray-300"></div>
                      <p className="self-center">Tidak Terjawab</p>
                    </div>
                  </>
                )}
                <ul className="grid grid-cols-4 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {soalId?.map((item: any, index: number) => (
                    <li key={index}>
                      <button
                        onClick={() => setOnShow(index)}
                        className={`
                      text-indigo-950 hover:shadow-md text-center p-2 py-3 rounded-md w-full
                      ${
                        soalId?.[onShow]?.id === item.id
                          ? 'bg-[#1e1b4b] text-white border border-[#1e1b4b]'
                          : item.status === 'BENAR'
                          ? '!bg-green-500 text-white'
                          : item.status === 'SALAH' && item.isAnswer
                          ? 'bg-red-500 border border-red-500 text-white'
                          : soalId?.[onShow]?.id === item.id
                          ? '!bg-[#1e1b4b] text-white border !border-[#1e1b4b]'
                          : item.status === 'SALAH' && !item.isAnswer
                          ? 'bg-gray-300 text-white'
                          : soalId?.[onShow]?.id !== item.id && item.isAnswer
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
            <div className="w-full md:w-9/12 md:pr-5 mt-10 md:mt-0">
              <div className="flex flex-col border-b pb-2 border-gray-300 gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
                <div className="title flex gap-2 items-center">
                  <h1 className="text-xl">
                    Soal No
                    <span className=" text-md w-[20px]"> {onShow + 1}</span>
                  </h1>
                  {soal.subCategory && (
                    <Tag variant="light-outline">{soal?.subCategory}</Tag>
                  )}
                </div>
                <div className="hidden md:block">
                  <CT />
                </div>
              </div>
              <div className="min-h-[200px] md:min-h-[600px] mt-8 ">
                <div className="mb-4">
                  <div>
                    <CKeditor
                      content={soal?.soal}
                      readOnly
                      className="mb-5 inline-block w-full"
                    />
                  </div>
                </div>
                {soal?.jawabanShow?.map((item: any, index: number) => (
                  <div
                    key={index}
                    className={`w-full flex mb-3 justify-start ${
                      isPembahasan && item.isCorrect ? 'text-green-500' : ''
                    }
                  ${
                    isPembahasan && item.id === selected ? 'text-red-500' : ''
                  }`}
                  >
                    <Radio
                      allowUncheck
                      checked={selected === item.id}
                      className="mr-2 self-baseline"
                      readonly={isPembahasan}
                      onChange={() => {
                        if (!isPembahasan) {
                          setSelected(selected === item.id ? null : item.id);
                          answerTryout(selected === item.id ? null : item.id);
                        }
                      }}
                    ></Radio>
                    <div
                      className={`${
                        isPembahasan && soal.tipePenilaian !== 'POINT'
                          ? 'block'
                          : 'flex'
                      }  w-full cursor-pointer`}
                      onClick={() => {
                        if (!isPembahasan) {
                          setSelected(selected === item.id ? null : item.id);
                          answerTryout(selected === item.id ? null : item.id);
                        }
                      }}
                    >
                      <p
                        className={`font-semibold mr-2 ${
                          isPembahasan && item.isCorrect ? 'text-green-500' : ''
                        }`}
                      >
                        {String.fromCharCode(65 + index)}.{' '}
                        {soal.tipePenilaian === 'POINT' && isPembahasan ? (
                          <span className="text-sm">({item.point} Point)</span>
                        ) : null}
                      </p>
                      <div className="">
                        <div className=" overflow-hidden">
                          <CKeditor content={item.jawaban} readOnly />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isPembahasan && (
                  <>
                    <div className="flex flex-col gap-y-5 md:flex-row md:items-center  mb-5 justify-start md:justify-between header-section w-full">
                      <div className="title">
                        <h1 className="text-xl font-bold">Pembahasan</h1>
                      </div>
                    </div>
                    <CKeditor
                      content={soal?.pembahasan}
                      readOnly
                      className="mb-5"
                    />
                  </>
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
                    onShow === soalId?.length - 1
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => {
                    if (onShow < soalId?.length - 1) setOnShow(onShow + 1);
                  }}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden fixed inset-0 z-50 bg-[#f4f7fa] overflow-y-auto overflow-x-hidden pb-24">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">

              <div>
                <h1 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                  SOAL NO {onShow + 1}
                </h1>
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>Beranda</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Paket Saya</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="truncate max-w-[80px]">{tryout?.nama || 'Tryout'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#14B8A6]/10 text-[#14B8A6] px-3 py-1 rounded-full text-xs font-bold border border-[#14B8A6]/20">
                <Countdown
                  date={finishAt}
                  key={finishAt}
                  renderer={({ hours, minutes, seconds }) => (
                    <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                  )}
                />
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1 bg-gray-100 relative">
            <div
              className="absolute left-0 top-0 h-full bg-[#14B8A6] transition-all duration-300"
              style={{ width: `${((onShow + 1) / soalId?.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4">
          {/* Subcategory Pill */}
          {soal.subCategory && (
            <div className="mb-6 inline-flex items-center gap-2 bg-[#e2e8f0] px-4 py-1.5 rounded-lg text-[#475569] font-bold text-[11px] uppercase tracking-wide">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {soal.subCategory}
            </div>
          )}

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="prose prose-sm max-w-none text-[#1e293b] font-medium leading-relaxed tryout-mobile-ck">
              <CKeditor content={soal?.soal} readOnly />
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-4 mb-8">
            {soal?.jawabanShow?.map((item: any, index: number) => {
              const isSelected = selected === item.id;
              const isCorrectLabel = isPembahasan && item.isCorrect;
              const isWrongLabel = isPembahasan && isSelected && !item.isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!isPembahasan) {
                      setSelected(selected === item.id ? null : item.id);
                      answerTryout(selected === item.id ? null : item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-4 bg-white p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-[#14B8A6] ring-1 ring-[#14B8A6]'
                      : (isCorrectLabel ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200')
                  } ${isWrongLabel ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isSelected
                      ? 'bg-[#14B8A6] text-white'
                      : (isCorrectLabel ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-[#64748b]')
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div className="flex-grow text-sm font-semibold text-[#334155] tryout-mobile-ck">
                    <CKeditor content={item.jawaban} readOnly />
                  </div>
                  {isSelected && (
                    <div className="shrink-0 bg-[#14B8A6] p-1.5 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Question Navigation Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1e293b]">Navigasi Soal</h3>
              <span className="text-[10px] text-gray-500 font-medium">
                {soalId?.filter((item: any) => item.isAnswer).length} dari {soalId?.length} Terjawab
              </span>
            </div>

            <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
              {soalId?.map((item: any, index: number) => {
                const isActive = onShow === index;
                const isAnswered = item.isAnswer;

                return (
                  <button
                    key={index}
                    onClick={() => setOnShow(index)}
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      isActive
                        ? 'bg-[#14B8A6] text-white shadow-lg shadow-teal-200 ring-2 ring-[#14B8A6] ring-offset-2'
                        : (isAnswered ? 'bg-[#ccfbf1] text-[#0f766e] border border-[#99f6e4]' : 'bg-[#f8fafc] text-[#94a3b8] border border-gray-100')
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#14B8A6]"></div>
                <span className="text-[10px] text-gray-500 font-bold">Terjawab</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e2e8f0]"></div>
                <span className="text-[10px] text-gray-500 font-bold">Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <button
              disabled={onShow === 0}
              onClick={() => onShow > 0 && setOnShow(onShow - 1)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl border border-gray-200 transition-all ${onShow === 0 ? 'opacity-30' : 'active:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Sebelumnya</span>
            </button>

            {!isPembahasan && (
              <button
                onClick={() => setIsFinish(true)}
                className="flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-xl bg-red-50 border border-red-100 active:bg-red-100 transition-all"
              >
                <div className="bg-white p-1 rounded-full border border-red-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">Selesai</span>
              </button>
            )}

            <button
              disabled={onShow === soalId?.length - 1}
              onClick={() => onShow < soalId?.length - 1 && setOnShow(onShow + 1)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-3 rounded-xl bg-[#14B8A6] shadow-lg shadow-teal-100 active:bg-[#0f766e] transition-all ${onShow === soalId?.length - 1 ? 'opacity-30' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">Selanjutnya</span>
            </button>
          </div>
        </div>

        {/* Mobile Dialogs */}
        <Dialog
          visible={isFinish}
          header="Akhiri Tryout?"
          mode="modal"
          onClose={() => setIsFinish(false)}
          onConfirm={handleFinish}
          confirmBtn="Ya, Selesai"
          cancelBtn="Batal"
        >
          <div className="text-center py-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              Kamu telah mengerjakan <span className="font-bold text-[#2563eb]">{soalId?.filter((item: any) => item.isAnswer).length}</span> dari <span className="font-bold">{soalId?.length}</span> soal. 
              Yakin ingin mengakhiri sesi ini?
            </p>
          </div>
        </Dialog>
      </div>

      {/* Global Mobile Styles */}
      <style>{`
        .tryout-mobile-ck .ck-content {
          font-size: 14px !important;
          line-height: 1.6 !important;
          color: #1e293b !important;
          margin: 0 !important;
          padding: 0 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
        }
        .tryout-mobile-ck .ck-content p {
          margin-bottom: 0 !important;
        }
        .tryout-mobile-ck .ck-content img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
