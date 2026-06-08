import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Dialog, Input } from 'tdesign-react';

export default function ManageKiasanModal({
  setVisible,
  params,
  detail,
  setDetail,
  categoryId,
}: any) {
  const [loading, setLoading] = useState(false);
  const [karakterList, setKarakterList] = useState<string[]>([]);
  const [kiasanList, setKiasanList] = useState<string[]>([]);
  const [inputKarakter, setInputKarakter] = useState('');
  const [inputKiasan, setInputKiasan] = useState('');

  useEffect(() => {
    if (Object.keys(detail).length > 0) {
      if (Array.isArray(detail.karakter)) setKarakterList(detail.karakter);
      if (Array.isArray(detail.kiasan)) setKiasanList(detail.kiasan);
    }
  }, [detail]);

  const handleAddKarakter = () => {
    const val = inputKarakter.trim();
    if (!val) return;
    if (karakterList.length >= 5) {
        alert("Maksimal 5 karakter");
        return;
    }
    setKarakterList([...karakterList, val]);
    setInputKarakter('');
  };

  const handleAddKiasan = () => {
    const val = inputKiasan.trim();
    if (!val) return;
    if (kiasanList.length >= 5) {
        alert("Maksimal 5 kiasan");
        return;
    }
    setKiasanList([...kiasanList, val]);
    setInputKiasan('');
  };

  const handleRemoveKarakter = (index: number) => {
    setKarakterList(karakterList.filter((_, i) => i !== index));
  };

  const handleRemoveKiasan = (index: number) => {
    setKiasanList(kiasanList.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    setLoading(true);

    if (karakterList.length === 0 || kiasanList.length === 0) {
        alert("Karakter dan Kiasan harus diisi minimal satu.");
        setLoading(false);
        return;
    }

    if (karakterList.length !== kiasanList.length) {
        alert(`Jumlah Karakter (${karakterList.length}) dan Kiasan (${kiasanList.length}) harus sama.`);
        setLoading(false);
        return;
    }

    const payload = {
      kategoriSoalKecermatanId: categoryId,
      karakter: karakterList,
      kiasan: kiasanList,
    };
    
    console.log('[DEBUG] Submitting Payload:', payload);

    try {
      if (Object.keys(detail).length > 0) {
        await FetchAPI(
            patchData(`admin/kiasan/update/${detail.id}`, { ...payload, id: detail.id })
        );
      } else {
        await FetchAPI(postData('admin/kiasan/insert', payload));
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
        Object.keys(detail).length > 0 ? 'Edit Kiasan' : 'Tambah Kiasan'
      }
      visible={true}
      onClose={() => {
        setVisible(false);
        setDetail({});
      }}
      footer={null}
      width={600}
    >
      <div className="space-y-6">
        
        {/* Karakter Input Section */}
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Input Karakter (Max 5)</label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded min-h-[45px] bg-gray-50">
                {karakterList.map((k, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1 rounded shadow-sm text-sm font-bold">
                        {k}
                        <div onClick={() => handleRemoveKarakter(i)} className="cursor-pointer text-gray-400 hover:text-red-500">
                             <IconX size={14} />
                        </div>
                    </div>
                ))}
                {karakterList.length < 5 && (
                    <input 
                        type="text" 
                        value={inputKarakter}
                        onChange={(e) => setInputKarakter(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKarakter();
                            }
                        }}
                        placeholder="Ketik & Enter..."
                        className="bg-transparent border-none outline-none text-sm w-[120px] focus:ring-0 p-0"
                        maxLength={5}
                    />
                )}
            </div>
            <p className="text-xs text-gray-400">* Tekan Enter untuk menambahkan karakter</p>
        </div>

        {/* Kiasan Input Section */}
         <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Input Kiasan (Max 5)</label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-200 rounded min-h-[45px] bg-indigo-50">
                {kiasanList.map((k, i) => (
                    <div key={i} className="flex items-center gap-1 bg-white border border-indigo-200 px-2 py-1 rounded shadow-sm text-sm font-bold text-indigo-700">
                        {k}
                        <div onClick={() => handleRemoveKiasan(i)} className="cursor-pointer text-gray-400 hover:text-red-500">
                             <IconX size={14} />
                        </div>
                    </div>
                ))}
                {kiasanList.length < 5 && (
                    <input 
                        type="text" 
                        value={inputKiasan}
                        onChange={(e) => setInputKiasan(e.target.value)}
                        onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddKiasan();
                            }
                        }}
                        placeholder="Ketik & Enter..."
                        className="bg-transparent border-none outline-none text-sm w-[120px] focus:ring-0 p-0 text-indigo-900 placeholder:text-indigo-300"
                    />
                )}
            </div>
             <p className="text-xs text-gray-400">* Tekan Enter untuk menambahkan kiasan/simbol</p>
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
