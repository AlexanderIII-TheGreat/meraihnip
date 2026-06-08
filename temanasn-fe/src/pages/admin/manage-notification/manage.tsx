import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Button, Dialog } from 'tdesign-react';

export default function ManageVoucher({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    FetchAPI(
      detail.id
        ? patchData(`admin/notification/update/${detail.id}`, data)
        : postData('admin/notification/insert', data)
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
      header={detail.id ? 'Edit Notifikasi' : 'Tambah Notifikasi'}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        disabledEnter
        defaultValues={detail}
      >
        <Input
          title="Judul"
          name="title"
          type="text"
          validation={{
            required: 'Judul tidak boleh kosong',
          }}
        />
        <Input title="Url" name="url" type="text" />
        <Input title="Keterangan" name="keterangan" type="multiple" />
        <Input title="Icon" name="icon" type="multiple" />
        <small>
          <p className="text-gray-500">
            *Generate icon dari{' '}
            <a
              href="https://tablericons.com/"
              className="text-blue-500 underline"
              target="_blank"
            >
              Tabler Icon
            </a>{' '}
            atau custom svg
          </p>
        </small>
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
