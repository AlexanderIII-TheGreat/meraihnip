import Form from '@/components/form';
import Input from '@/components/input';
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

    const payload = {
      ...data,
      paketPembelianId: id,
    };

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-pembelian-fitur/update/${detail.id}`, payload)
        : postData('admin/paket-pembelian-fitur/insert', payload)
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
      header={detail.id ? 'Edit Fitur ' : 'Tambah Fitur '}
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
          title="Nama"
          name="nama"
          type="text"
          validation={{
            required: 'Nama tidak boleh kosong',
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
