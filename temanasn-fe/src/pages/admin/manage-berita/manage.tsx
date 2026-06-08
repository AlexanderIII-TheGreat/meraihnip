import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { useState } from 'react';
import { Button, Dialog } from 'tdesign-react';

export default function ManageBeritaModal({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = jsonToFormData(data);

    FetchAPI(
      detail.id
        ? patchData(`berita/update/${detail.id}`, payload)
        : postData('berita/insert', payload)
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
      header={detail.id ? 'Edit Berita' : 'Tambah Berita'}
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
          title="Judul Berita"
          name="judul"
          type="text"
          validation={{
            required: 'Judul berita tidak boleh kosong',
          }}
          placeholder="Masukkan judul berita"
        />

        <Input
          title="Gambar/Thumbnail"
          name="gambar"
          type="file"
          accept=".jpg,.jpeg,.png"
          validation={{
            required: detail.id ? false : 'Thumbnail tidak boleh kosong',
          }}
        />

        <Input 
          title="Isi Berita" 
          name="isi" 
          type="ckeditor" 
          validation={{
            required: 'Isi berita tidak boleh kosong',
          }}
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
