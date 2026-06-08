import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postData } from '@/utils/axios';

interface FormData {
  title: string;
  description: string;
  category: string;
  image: string; // ubah ke string (link)
}

interface TicketFormProps {
  closeModal: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ closeModal }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    image: '', // default kosong
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setIsLoading(true);

  if (!formData.title || !formData.description) {
    setError('Title and description are required.');
    setIsLoading(false);
    return;
  }

  try {
    // Ambil auth dari localStorage
    const auth = localStorage.getItem("authentication");
    if (!auth) {
      setError("Authentication not found. Please login again.");
      setIsLoading(false);
      return;
    }

    const parsed = JSON.parse(auth);
    const userId = parsed?.state?.user?.id;

    if (!userId) {
      setError("User ID tidak ditemukan. Silakan login ulang.");
      setIsLoading(false);
      return;
    }

    // Kirim userId ke backend
    const payload = {
      ...formData,
      userId,
    };

    const response: any = await postData('admin/ticket', payload);

    if (response.error) {
      setError(response.msg || 'Failed to create ticket. Please try again.');
      setIsLoading(false);
      return;
    }

    setSuccess('Ticket created successfully!');
    setFormData({ title: '', description: '', category: '', image: '' });
    setTimeout(() => {
      closeModal();
      navigate('/my-tickets');
    }, 2000);
  } catch (err) {
    console.error(err);
    setError('An error occurred. Please try again.');
    setIsLoading(false);
  }
};

  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-xs font-black text-indigo-950 uppercase tracking-widest pl-1">
            Judul Kendala
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300"
            placeholder="Contoh: Masalah Pembayaran"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-black text-indigo-950 uppercase tracking-widest pl-1">
            Deskripsi Detail
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 resize-none"
            placeholder="Ceritakan kendala Anda secara lengkap..."
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className="block text-xs font-black text-indigo-950 uppercase tracking-widest pl-1">
            Kategori
          </label>
          <div className="relative">
            <select
              name="category"
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Pilih kategori</option>
              <option value="Saran">💡 Saran / Masukan</option>
              <option value="Komplain">⚠️ Komplain / Error</option>
              <option value="Lainnya">⚙️ Lainnya</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="image" className="block text-xs font-black text-indigo-950 uppercase tracking-widest pl-1">
            Link Gambar (Opsional)
          </label>
          <input
            type="text"
            name="image"
            id="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://imgur.com/..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-indigo-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className={`flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-100 uppercase tracking-widest active:scale-[0.98] transition-all ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Tiket'}
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="py-4 px-6 text-gray-400 text-sm font-black uppercase tracking-widest active:scale-[0.98] transition-all"
            disabled={isLoading}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
