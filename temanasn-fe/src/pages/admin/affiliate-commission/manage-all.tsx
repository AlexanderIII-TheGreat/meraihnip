import Form from '@/components/form';
import Input from '@/components/input';
import { postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Button, Dialog, Message } from 'tdesign-react';

export default function ManageAffiliateAll({ setVisible, params }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        commission_type: data.commission_type,
        commission_value: parseFloat(data.commission_value),
      };

      const res = await FetchAPI(
        postData('admin/affiliate/mass-update-commission', payload)
      );

      if (res.status || res.success) {
        Message.success(res.message || 'Komisi semua user berhasil diperbarui!');
        params.refresh();
        setVisible(false);
      } else {
        Message.error(res.message || 'Gagal memperbarui komisi semua user');
      }
    } catch (err: any) {
      console.error('Error update all commission:', err);
      Message.error(err?.message || 'Terjadi kesalahan saat update komisi');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Dialog
      header="Set Komisi Semua User"
      visible
      onClose={handleClose}
      className="w-[600px]"
      footer={null}
    >
      <div className="text-gray-600 mb-4">
        Aksi ini akan mengganti komisi <b>semua user affiliate</b>. Harap berhati-hati.
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <Input
          title="Tipe Komisi"
          name="commission_type"
          type="select"
          validation={{ required: 'Tipe komisi wajib diisi' }}
          options={[
            { label: 'Persentase (%)', value: 'percent' },
            { label: 'Nominal (IDR)', value: 'nominal' },
          ]}
        />

        <Input
          title="Nilai Komisi"
          name="commission_value"
          type="number"
          validation={{
            required: 'Nilai komisi wajib diisi',
            validate: (value: any, formData: any) => {
              const num = parseFloat(value);
              if (isNaN(num)) return 'Nilai komisi harus angka';
              if (num < 0) return 'Nilai komisi tidak boleh negatif';
              if (formData.commission_type === 'percent' && num > 100)
                return 'Persentase maksimal 100%';
              return true;
            },
          }}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            size="large"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" size="large" loading={loading}>
            Simpan
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
