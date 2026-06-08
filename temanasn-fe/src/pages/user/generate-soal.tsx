import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from '@/components/form';
import Input from '@/components/input';
import Button from '@/components/button';
import { MessagePlugin } from "tdesign-react";
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import Modal from '@/components/Modal';
import { getData, postData } from '@/utils/axios';

export default function GenerateSoal() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kategoriOptions, setKategoriOptions] = useState<any[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setShowInfo(true);
  }, []);

  useEffect(() => {
    getData('user/generate-soal-category/get').then((res: any) => {
      console.log('Category Response:', res);
      
      if (res?.error) {
        console.error('API Returned Error:', res);
        MessagePlugin.error(res.message || 'Gagal mengambil kategori');
        return;
      }

      const list = res?.list || res?.data?.list;
      if (list && Array.isArray(list)) {
        const options = list.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        console.log('Mapped Options:', options);
        setKategoriOptions(options);
      } else {
        console.error('Unexpected response format:', res);
        MessagePlugin.warning('Format data kategori tidak sesuai');
      }
    }).catch(err => {
      console.error('API Error:', err);
      MessagePlugin.error('Terjadi kesalahan saat mengambil kategori');
    });
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log('Generate Soal Data:', data);
      
      // Find category name
      const selectedCategory = kategoriOptions.find((opt: any) => opt.value === Number(data.kategori));
      const categoryName = selectedCategory ? selectedCategory.label : '';

      const payload = {
        categoryId: Number(data.kategori),
        tingkatKesulitan: data.kesulitan,
        jumlahSoal: Number(data.jumlah_soal),
        waktu: Number(data.waktu),
        kategori: categoryName,
      };

      const res: any = await postData('user/generate-soal-history/generate', payload);
      
      if (res.error) {
          MessagePlugin.error(res.message || "Gagal generate soal");
          return;
      }

      if (res.data && res.data.id) {
          MessagePlugin.success("Berhasil generate soal");
          navigate(`/generate-soal/kerjakan/${res.data.id}`);
      } else {
          navigate('/generate-soal/riwayat');
      }
     // User request: "tambahkan data ke table... berdasarkan filter..."
      // Doesn't explicitly say to navigate, but usually we'd go to the exam page.
      // Let's assume navigating to a list or the specific exam page would be next, 
      // but for now I'll just clear or leave it. 
      // Actually, typically you'd start the exam. 
      // The response 'res' should contain history ID.
      
      // Navigate to history list or detail if available
       // navigate('/generate-soal-history'); // Assuming a history page exists or will exist

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
          MessagePlugin.error(err.response.data.message);
      } else {
          MessagePlugin.error("Gagal generate soal");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const kesulitanOptions = [
    { label: 'Mudah', value: 'mudah' },
    { label: 'Sedang', value: 'sedang' },
    { label: 'Sulit', value: 'sulit' },
    { label: 'Campur', value: 'campur' },
  ];
  const jumlahSoalOptions = [
    { label: '10 Soal', value: 10 },
    { label: '50 Soal', value: 50 },
    { label: '100 Soal', value: 100 },
  ];

    const waktuOptions = [
    { label: '1 Menit', value: 1 },
    { label: '5 Menit', value: 5 },
    { label: '10 Menit', value: 10 },
    { label: '60 Menit', value: 60 },
  ];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg m-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-indigo-950">Generate Soal</h1>
          <button 
            onClick={() => setShowInfo(true)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
            title="Info Fitur"
          >
            <IconInfoCircle size={24} />
          </button>
        </div>
        <Button onClick={() => navigate('/generate-soal/riwayat')} className="!w-fit !min-w-32 bg-indigo-900">
          Riwayat
        </Button>
      </div>
      <Form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
                title="Tingkat Kesulitan"
                name="kesulitan"
                type="select"
                options={kesulitanOptions}
                placeholder="Pilih Tingkat Kesulitan"
                validation={{ required: "Tingkat Kesulitan wajib diisi" }}
            />
            <Input
                title="Paket Soal"
                name="kategori" // This will return the ID based on options setup
                type="select"
                options={kategoriOptions} // [{label: Name, value: ID}]
                placeholder="Pilih Paket Soal"
                validation={{ required: "Paket Soal wajib diisi" }}
            />
            <Input
                title="Jumlah Soal"
                name="jumlah_soal"
                type="select"
                options={jumlahSoalOptions}
                placeholder="Pilih Jumlah Soal"
                validation={{ required: "Jumlah Soal wajib diisi" }}
            />
            <Input
                title="Waktu Pengerjaan"
                name="waktu"
                type="select"
                options={waktuOptions}
                placeholder="Pilih Waktu"
                validation={{ required: "Waktu wajib diisi" }}
            />
        </div>

        <div className="flex justify-end mt-8">
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            className="w-full md:w-auto !px-10 !h-12 !text-lg !rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center gap-2">
              <IconWand size={20} />
              <span>Generate Soal</span>
            </div>
          </Button>
        </div>
      </Form>

      <Modal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Tentang Generate Soal Otomatis"
      >
        <div className="space-y-4 text-gray-700">
          <p>
            Fitur <strong>Generate Soal Otomatis</strong> memungkinkan Anda untuk membuat paket soal latihan secara instan sesuai dengan kebutuhan belajar Anda.
          </p>
          
          <div className="space-y-2">
            <h4 className="font-bold text-indigo-900">Cara Penggunaan:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Tingkat Kesulitan:</strong> Pilih tingkat kesulitan soal yang diinginkan (Mudah, Sedang, Sulit, atau Campuran).</li>
              <li><strong>Paket Soal:</strong> Pilih paket materi spesifik yang ingin Anda latih.</li>
              <li><strong>Jumlah Soal:</strong> Tentukan berapa banyak soal yang ingin Anda kerjakan dalam satu sesi.</li>
              <li><strong>Waktu Pengerjaan:</strong> Atur durasi waktu pengerjaan agar Anda terbiasa dengan tekanan waktu ujian sesungguhnya.</li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-4">
            <p className="text-sm font-medium text-indigo-800">
              💡 Setelah menekan tombol "Generate Soal", sistem akan meramu soal-soal berkualitas dan Anda bisa langsung mulai mengerjakan latihan!
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowInfo(false)} className="bg-indigo-600">
              Mengerti
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
