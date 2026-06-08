import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Button, Dialog } from 'tdesign-react';

export default function ManageTestimoniModal({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    // Ensure rating is a number
    if (data.rating) {
        data.rating = Number(data.rating);
    }

    FetchAPI(
      detail.id
        ? patchData(`testimoni/update/${detail.id}`, data)
        : postData('testimoni/insert', data)
    )
      .then(() => {
        params.refresh();
        setVisible(false);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setVisible(false);
    setDetail({});
  };

  return (
    <Dialog
      header={detail.id ? 'Edit Testimoni' : 'Tambah Testimoni'}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={{
          ...detail,
        }}
      >
        <Input
          title="Nama"
          name="nama"
          type="text"
          validation={{
            required: 'Nama tidak boleh kosong',
          }}
          placeholder="Masukkan nama pemberi testimoni"
        />

        <Input
          title="Pekerjaan / Role"
          name="pekerjaan"
          type="text"
          validation={{
            required: 'Pekerjaan tidak boleh kosong',
          }}
          placeholder="Contoh: Siswa, CPNS 2024, dll"
        />

        <Input
            title="Rating (1-5)"
            name="rating"
            type="number"
            validation={{
                required: 'Rating tidak boleh kosong',
                min: { value: 1, message: 'Rating minimal 1' },
                max: { value: 5, message: 'Rating maksimal 5' },
                valueAsNumber: true,
            }}
            placeholder="Masukkan rating 1 sampai 5"
        />

        <Input 
            title="Isi Testimoni" 
            name="isi" 
            type="textarea" 
            validation={{
                required: 'Isi testimoni tidak boleh kosong',
            }}
            placeholder="Tuliskan testimoni mereka..."
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            size="large"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit" size="large" loading={loading}>
            Submit
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
