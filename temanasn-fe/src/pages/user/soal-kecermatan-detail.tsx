
import { getData } from '@/utils/axios';
import { IconClock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Loading } from 'tdesign-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SoalKecermatanExam() {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentKiasanIndex, setCurrentKiasanIndex] = useState(0);
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    let interval: any;
    if (!finished && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
             if (prev <= 1) {
                 handleNext();
                 return 0;
             }
             return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [finished, timer]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getData(`admin/kiasan/get?kategoriSoalKecermatanId=${id}&includeSoal=true`);
      if (res?.list) {
          setData(res.list);
          if (res.list.length > 0) {
             prepareKiasan(0, res.list);
          }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const prepareKiasan = (index: number, listData: any[] = data) => {
      setCurrentKiasanIndex(index);
      setCurrentSoalIndex(0);
      if (listData[index]?.SoalKecermatan?.length > 0) {
          setTimer(listData[index].SoalKecermatan[0].waktu);
      } else {
           handleNextKiasan();
      }
  }

  const handleAnswer = (val: string) => {
      // Save answer
      // Logic: answers[kiasanId][soalId] = val
      // For now just basic state
      setAnswers({ ...answers, [`${currentKiasanIndex}-${currentSoalIndex}`]: val });
      handleNext();
  };

  const handleNext = () => {
      const currentKiasan = data[currentKiasanIndex];
      if (currentSoalIndex < currentKiasan.SoalKecermatan.length - 1) {
          const nextIndex = currentSoalIndex + 1;
          setCurrentSoalIndex(nextIndex);
          setTimer(currentKiasan.SoalKecermatan[nextIndex].waktu);
      } else {
          handleNextKiasan();
      }
  };

  const handleNextKiasan = () => {
      if (currentKiasanIndex < data.length - 1) {
          prepareKiasan(currentKiasanIndex + 1);
      } else {
          setFinished(true);
      }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loading /></div>;
  if (!data.length) return <div className="p-8 text-center text-gray-500">Data Soal tidak ditemukan.</div>;

  if (finished) {
      return (
          <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-bold mb-4 text-green-600">Selesai!</h2>
              <p className="text-gray-600 mb-6">Anda telah menyelesaikan semua soal kecermatan.</p>
              <Button href="/soal-kecermatan">Kembali ke Daftar</Button>
          </div>
      )
  }


  const currentKiasan = data[currentKiasanIndex];
  const currentSoal = currentKiasan?.SoalKecermatan?.[currentSoalIndex];

  if (!currentSoal) return <div>Loading Soal...</div>;

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 min-h-screen flex flex-col">
       {/* Header Info */}
       <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
           <div>
               <span className="text-gray-500 text-sm">Kolom</span>
               <div className="font-bold text-lg">{currentKiasanIndex + 1} / {data.length}</div>
           </div>
           
           <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
                    <IconClock /> {timer}
                </div>
                <span className="text-xs text-gray-400">Detik</span>
           </div>

           <div className="text-right">
               <span className="text-gray-500 text-sm">Soal</span>
               <div className="font-bold text-lg">{currentSoalIndex + 1} / {currentKiasan.SoalKecermatan.length}</div>
           </div>
       </div>

       {/* Kiasan Table (Answer Key) */}
       <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
           <div className="grid grid-cols-5 divide-x divide-gray-200 border border-gray-200 rounded-lg overflow-hidden mb-6">
                {/* Headers (Karakter) */}
                {currentKiasan.karakter.map((char: string, idx: number) => (
                    <div key={`char-${idx}`} className="bg-gray-50 p-3 text-center font-bold text-lg text-gray-700">
                        {char}
                    </div>
                ))}
                {/* Values (Kiasan/Keys) */}
                {currentKiasan.kiasan.map((key: string, idx: number) => (
                    <div key={`key-${idx}`} className="p-3 text-center font-bold text-2xl text-indigo-600 bg-white">
                        {key}
                    </div>
                ))}
           </div>

           {/* Question Display */}
           <div className="flex justify-center mb-8">
               <div className="flex flex-wrap gap-3 justify-center bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
                   {/* Soal is a JSON array string usually, need to parse if it comes as string, but Prisma returning JSON usually handles it. 
                       Wait, in typical implementation 'soal' is array of strings. 
                   */}
                   <AnimatePresence mode='wait'>
                        <motion.div 
                            key={`${currentKiasanIndex}-${currentSoalIndex}`}
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.05, ease: "linear" }}
                            className="flex gap-4 md:gap-8"
                        >
                            {(Array.isArray(currentSoal.soal) ? currentSoal.soal : []).map((char: string, idx: number) => (
                                <div key={idx} className="font-bold text-4xl md:text-5xl text-gray-800">
                                    {char}
                                </div>
                            ))}
                        </motion.div>
                   </AnimatePresence>
               </div>
           </div>

            {/* Answer Options */}
           <div className="grid grid-cols-5 gap-4">
               {currentKiasan.kiasan.map((key: string, idx: number) => (
                   <button 
                        key={idx}
                        onClick={() => handleAnswer(key)}
                        className="py-4 rounded-xl bg-indigo-600 text-white font-bold text-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-indigo-200"
                   >
                       {key}
                   </button>
               ))}
           </div>
       </div>

    </div>
  );
}
