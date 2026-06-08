import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, Input } from 'tdesign-react';

export default function ManageSoalModal({
  setVisible,
  params,
  detail,
  setDetail,
  kiasanId,
  kiasanDetail
}: any) {
  const [loading, setLoading] = useState(false);
  const [soalList, setSoalList] = useState<string[]>([]);
  const [jawaban, setJawaban] = useState('');
  const [waktu, setWaktu] = useState(60);

  useEffect(() => {
    if (Object.keys(detail).length > 0) {
      if (Array.isArray(detail.soal)) setSoalList(detail.soal);
      if (detail.jawaban) setJawaban(detail.jawaban);
      if (detail.waktu) setWaktu(detail.waktu);
    } else {
        // Reset defaults
         setSoalList([]);
         setJawaban('');
         setWaktu(60);
    }
  }, [detail]);

  const [inputSoal, setInputSoal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleAddSoal = () => {
    const val = inputSoal.trim();
    if (!val) return;
    
    // Validate if char is in Kiasan list
    if (kiasanDetail?.karakter && !kiasanDetail.karakter.includes(val)) {
        alert("Karakter harus sesuai dengan Kiasan yang tersedia (" + kiasanDetail.karakter.join(', ') + ")");
        return;
    }

    if (soalList.includes(val)) {
        alert("Karakter sudah ada dalam soal.");
        setInputSoal('');
        return;
    }

    if (soalList.length >= 4) {
        alert("Maksimal 4 karakter");
        return;
    }
    setSoalList([...soalList, val]);
    setInputSoal('');
  };

  const handleAddSoalDirect = (val: string) => {
    if (soalList.includes(val)) {
        // alert("Karakter sudah ada dalam soal.");
        return;
    }
    if (soalList.length >= 4) {
        alert("Maksimal 4 karakter");
        return;
    }
    setSoalList([...soalList, val]);
  }

  const handleRemoveSoal = (index: number) => {
    setSoalList(soalList.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setLoading(true);

    if (soalList.length === 0) {
        alert("Soal tidak boleh kosong.");
        setLoading(false);
        return;
    }

    if (!jawaban) {
        alert("Jawaban tidak boleh kosong.");
        setLoading(false);
        return;
    }

    const payload = {
      kiasanId: Number(kiasanId),
      soal: soalList,
      jawaban: jawaban,
      waktu: Number(waktu)
    };
    
    try {
      if (Object.keys(detail).length > 0) {
        await FetchAPI(
            patchData(`admin/soal-kecermatan/update/${detail.id}`, { ...payload, id: detail.id })
        );
      } else {
        await FetchAPI(postData('admin/soal-kecermatan/insert', payload));
      }
      params.refresh();
      setVisible(false);
      setDetail({});
    } catch (err: any) {
      console.error(err);
      alert(JSON.stringify(err.response?.data) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={
        Object.keys(detail).length > 0 ? 'Edit Soal' : 'Tambah Soal'
      }
      visible={true}
      onClose={() => {
        setVisible(false);
        setDetail({});
      }}
      footer={null}
      width={700}
    >
      <div className="space-y-6">
        
        {/* Soal Input Section */}
        <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Input Soal (Max 4 karakter)</label>
             <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded min-h-[45px] bg-gray-50">
                {soalList.map((k, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded shadow-sm text-sm font-bold">
                        {k}
                        <div onClick={() => handleRemoveSoal(i)} className="cursor-pointer text-gray-400 hover:text-red-500">
                             <IconX size={14} />
                        </div>
                    </div>
                ))}
                
                 {soalList.length < 4 && (
                    <div className="relative">
                         <input 
                            type="text" 
                            value={inputSoal}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                            onChange={(e) => setInputSoal(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSoal();
                                }
                            }}
                            placeholder="Pilih / Ketik..."
                            className="bg-transparent border-none outline-none text-sm w-[120px] focus:ring-0 p-0 h-full"
                            maxLength={1}
                        />
                        {showDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2 grid grid-cols-4 gap-2">
                                {(kiasanDetail?.karakter || []).map((char: string, index: number) => {
                                    const isSelected = soalList.includes(char);
                                    return (
                                        <button 
                                            key={index} 
                                            disabled={isSelected}
                                            onMouseDown={(e) => {
                                                e.preventDefault(); 
                                                if (!isSelected) handleAddSoalDirect(char);
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center border rounded font-bold text-sm ${isSelected ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
                                        >
                                            {char}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
             </div>
             {/* Removed static quick add to avoid redundancy */}
        </div>

        {/* Jawaban Input */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jawaban (Kunci)</label>
            <div className="flex gap-2">
                {(kiasanDetail?.kiasan || []).map((key: string, index: number) => (
                    <button 
                        key={index} 
                        onClick={() => setJawaban(key)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-lg font-bold text-lg transition-colors ${jawaban === key ? 'bg-green-500 text-white border-green-600' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'}`}
                    >
                        {key}
                    </button>
                ))}
            </div>
        </div>

        {/* Waktu Input */}
        <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Waktu (Detik)</label>
              <Input 
                className="w-full"
                type="number" 
                value={String(waktu)} 
                onChange={(val) => setWaktu(Number(val))} 
                suffix="Detik"
            />
        </div>


        <div className="flex justify-end gap-2 mt-8 border-t pt-4">
          <Button
            theme="default"
            variant="base"
            onClick={() => {
              setVisible(false);
              setDetail({});
            }}
          >
            Batal
          </Button>
          <Button theme="primary" loading={loading} onClick={onSubmit}>
            Simpan
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
