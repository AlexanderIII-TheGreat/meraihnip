import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Button, Dialog } from 'tdesign-react';

export default function ManageCategory({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  // Debugging: Log detail to ensure it's being passed correctly
  // useEffect(() => {
  //   console.log('ManageCategory Detail:', detail);
  // }, [detail]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    console.log('Submitting Data:', data);

    // Ensure KKM is a number
    const payload = {
      ...data,
      kkm: Number(data.kkm),
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/generate-soal-category/update/${detail.id}`, payload)
        : postData('admin/generate-soal-category/insert', payload)
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
      header={detail.id ? 'Edit Kategori ' : 'Tambah Kategori '}
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
          title="Nama Kategori"
          name="name"
          type="text"
          validation={{
            required: 'Nama Kategori tidak boleh kosong',
          }}
        />

        <Input 
          title="KKM" 
          name="kkm" 
          type="number"
          validation={{
            required: 'KKM tidak boleh kosong',
            valueAsNumber: true,
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
