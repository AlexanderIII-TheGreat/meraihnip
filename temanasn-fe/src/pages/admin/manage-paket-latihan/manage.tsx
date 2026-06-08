import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Dialog } from 'tdesign-react';

export default function ManageVoucher({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const [jenisPaket, setJenisPaket] = useState('');

  useEffect(() => {
    if (detail.id) {
      setJenisPaket(detail.type);
    }
  }, [detail]);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    if (data.type === 'TRYOUT' && !data?.tanggal?.[0]) {
      setLoading(false);
      return toast.error('Tanggal tidak boleh kosong');
    }
    // const tanggal =
    // data.type === 'TRYOUT'
    //   ? {
    //       startAt: moment(data.tanggal[0], 'DD/MM/YYYY HH:mm'),
    //       endAt: moment(data.tanggal[1], 'DD/MM/YYYY HH:mm'),
    //       tanggal: null,
    //     }
    //   : {
    //       tanggal: null,
    //     };
    const payload = jsonToFormData({
      ...data,
      type: 'BIASA',
    });

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-latihan/update/${detail.id}`, payload)
        : postData('admin/paket-latihan/insert', payload)
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
      header={detail.id ? 'Edit Paket Latihan' : 'Tambah Paket Latihan'}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={detail}
      >
        <Input
          title="Judul"
          name="nama"
          validation={{
            required: 'Judul tidak boleh kosong',
          }}
        />
        {/* <Input
          title="Jenis Paket"
          name="type"
          type="select"
          validation={{
            required: 'Tipe tidak boleh kosong',
          }}
          onChange={(e) => setJenisPaket(e)}
          options={[
            { label: 'Biasa', value: 'BIASA' },
            { label: 'Tryout', value: 'TRYOUT' },
          ]}
        /> */}
        {/* {jenisPaket === 'BIASA' ? ( */}
        <Input
          title="Waktu"
          name="waktu"
          type="number"
          endAdornment="Menit"
          validation={{
            required: jenisPaket === 'BIASA' ? 'Waktu tidak boleh kosong' : '',
            min: {
              value: 0,
              message: 'Waktu tidak boleh kurang dari 0',
            },
          }}
        />
        {/* ) : null} */}
        {/* {jenisPaket === 'TRYOUT' ? (
          <Input title="Tanggal" name="tanggal" type="rangeDatePicker" />
        ) : null} */}
        <Input title="Passing Grade" name="kkm" type="number" />
        <Input
          title="Bagi Jawaban & Pembahasan"
          name="isShareAnswer"
          type="select"
          validation={{
            required: 'Bagi Jawaban & Pembahasan tidak boleh kosong',
          }}
          options={[
            { label: 'Bagi', value: 'true' },
            { label: 'Sembunyikan', value: 'false' },
          ]}
        />

        <Input
          title="Banner"
          name="banner"
          type="file"
          accept=".jpg,.jpeg,.png"
          validation={{
            required: detail.id ? false : 'Banner tidak boleh kosong',
          }}
        />
        <Input title="Keterangan" name="keterangan" type="ckeditor" />
        {null}
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
