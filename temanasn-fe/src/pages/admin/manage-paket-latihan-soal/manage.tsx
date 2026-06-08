import Form from '@/components/form';
import Input from '@/components/input';
import useGetList from '@/hooks/use-get-list';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog } from 'tdesign-react';

export default function ManagePaketSoal({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = {
      ...data,
      paketLatihanId: id,
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-latihan-soal/update/${detail.id}`, payload)
        : postData('admin/paket-latihan-soal/insert', payload)
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

  const listCategory = useGetList({
    url: 'admin/bank-soal-parent-kategori/get',
    initialParams: {
      skip: 0,
      take: 0,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const listSubCategory = useGetList({
    url: 'admin/bank-soal-kategori/get',
    initialParams: {
      skip: 0,
      take: 0,
      disabled: true,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleClose = () => {
    setVisible(false);
    setDetail({});
  };
  const idExist = params?.list.map((item: any) => item.bankSoalCategory.id);

  const filteredList = listSubCategory?.list
    ?.filter((item: any) => !idExist?.includes(item.id))
    ?.map((item: any) => ({
      label: item?.nama,
      value: item?.id,
    }));

  return (
    <Dialog
      header={
        detail.id ? 'Edit Soal Paket Latihan ' : 'Tambah Soal Paket Latihan '
      }
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6 "
        defaultValues={detail}
      >
        <Input
          title="Kategori Soal"
          name="bankSoalParentCategoryId"
          type="select"
          validation={{
            required: 'Kategori Soal tidak boleh kosong',
          }}
          options={listCategory?.list?.map((item: any) => ({
            label: item?.nama,
            value: item?.id,
          }))}
          onChange={(e) => {
            listSubCategory.setParams({
              ...listSubCategory.params,
              disabled: null,
              parentCategoryId: e,
            });
          }}
        />
        <Input
          title="Sub Kategori Soal"
          name="bankSoalCategoryId"
          type="select"
          validation={{
            required: 'Sub Kategori Soal tidak boleh kosong',
          }}
          options={filteredList}
        />
        <div className="flex justify-end gap-2 !mt-20">
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
