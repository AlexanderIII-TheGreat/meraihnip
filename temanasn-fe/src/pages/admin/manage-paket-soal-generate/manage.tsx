import Form from '@/components/form';
import Input from '@/components/input';
import { Button, Dialog } from 'tdesign-react';
import { useEffect, useState } from 'react';
import { getData, patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';

export default function ManagePacket({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async () => {
    try {
      const res: any = await getData('admin/generate-soal-category/get', {
        take: 100, // Fetch a large enough number
      });
      if (res && res.list) {
        setCategories(res.list.map((item: any) => ({
          label: item.name,
          value: item.id,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debugging: Log detail to ensure it's being passed correctly
  // useEffect(() => {
  //   console.log('ManageCategory Detail:', detail);
  // }, [detail]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    console.log('Submitting Data:', data);

    const payload = {
      ...data,
      kkm: Number(data.kkm),
      categoryIds: data.categoryIds || [],
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/parent-generate-soal-category/update/${detail.id}`, payload)
        : postData('admin/parent-generate-soal-category/insert', payload)
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
      header={detail.id ? 'Edit Paket ' : 'Tambah Paket '}
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
          categoryIds: detail.GenerateSoalCategory?.map((item: any) => item.id) || [],
        }}
      >
        <Input
          title="Nama Paket"
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

        <Input
           title="Pilih Kategori"
           name="categoryIds"
           type="selectTDesign"
           options={categories}
           multiple
           placeholder="Pilih Kategori"
           clearable
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
