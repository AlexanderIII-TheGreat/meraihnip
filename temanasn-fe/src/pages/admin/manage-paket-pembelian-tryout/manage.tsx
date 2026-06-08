import Form from '@/components/form';
import Input from '@/components/input';
import useGetList from '@/hooks/use-get-list';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog } from 'tdesign-react';

export default function ManagePaketPembelian({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleSubmit = async (data: any) => {
    setLoading(true);

    delete data.bankSoalCategory;

    const payload = {
      ...data,
      paketPembelianId: id,
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-pembelian-tryout/update/${detail.id}`, payload)
        : postData('admin/paket-pembelian-tryout/insert', payload)
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
  const listCategory = useGetList({
    url: 'admin/paket-latihan/get',
    initialParams: {
      skip: 0,
      take: 0,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const filteredList = listCategory?.list?.map((item: any) => ({
    label: item?.nama,
    value: item?.id,
  }));

  return (
    <Dialog
      header={detail.id ? 'Edit Tryout ' : 'Tambah Tryout '}
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
          name="paketLatihanId"
          containerClass=""
          type="select"
          validation={{
            required: 'Paket Latihan tidak boleh kosong',
          }}
          options={filteredList}
        />
        <Input
          title="Tipe Tryout"
          name="type"
          type="select"
          options={[
            {
              label: 'Tryout',
              value: 'TRYOUT',
            },
            {
              label: 'Pendahuluan',
              value: 'PENDAHULUAN',
            },
            {
              label: 'Pemantapan',
              value: 'PEMANTAPAN',
            },
          ]}
        />
        <div className="flex justify-end gap-2 !mt-40">
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
