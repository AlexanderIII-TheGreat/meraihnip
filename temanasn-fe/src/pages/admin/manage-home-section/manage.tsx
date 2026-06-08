import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { useState } from 'react';
import { Button, Dialog } from 'tdesign-react';

export default function ManageEvent({
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
        ? patchData(`admin/home-section/update/${detail.id}`, payload)
        : postData('admin/home-section/insert', payload)
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

  const [tipe, setTipe] = useState(detail.tipe || 'BANNER');

  return (
    <Dialog
      header={detail.id ? 'Edit Event' : 'Tambah Event'}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={{ ...detail, tipe }}
      >
        <Input
          title="Tipe Section"
          name="tipe"
          value={tipe}
          type="select"
          validation={{
            required: 'Tipe tidak boleh kosong',
          }}
          onChange={(e) => setTipe(e)}
          options={[
            { label: 'Banner', value: 'BANNER' },
            { label: 'Review', value: 'REVIEW' },
            { label: 'Custom', value: 'CUSTOM' },
          ]}
        />
        {tipe === 'BANNER' ? (
          <>
            <Input
              title="Thumbnail"
              name="gambar"
              type="file"
              accept=".jpg,.jpeg,.png"
            />
            <Input title="Url" name="url" type="text" />
          </>
        ) : null}
        {tipe === 'REVIEW' ? (
          <>
            <Input title="Nama Lengkap" name="title" type="text" />{' '}
            <Input title="Pekerjaan" name="pekerjaan" type="text" />
            <Input
              title="Bintang"
              name="bintang"
              type="rate"
              className="border-0"
            />{' '}
            <Input title="Komentar" name="keterangan" type="ckeditor" />
            <Input
              title="Foto Profile"
              name="gambar"
              type="file"
              accept=".jpg,.jpeg,.png"
              validation={{
                required: detail.id ? false : 'Thumbnail tidak boleh kosong',
              }}
            />
          </>
        ) : null}
        {tipe === 'CUSTOM' ? (
          <>
            <Input title="Judul" name="title" type="text" />
            <Input title="Isi" name="keterangan" type="ckeditor" />
            <Input title="URL / Link Target" name="url" type="text" placeholder="Contoh: /paket-pembelian atau https://wa.me/..." />
            <Input title="Label Tombol Link" name="pekerjaan" type="text" placeholder="Contoh: Lihat Paket Sekarang!" />
            <Input
              title="Tema Warna Card"
              name="bintang"
              type="select"
              options={[
                { label: 'Indigo / Biru', value: 1 },
                { label: 'Pink / Ungu', value: 2 },
                { label: 'Emerald / Hijau', value: 3 },
                { label: 'Amber / Oranye', value: 4 },
              ]}
            />
          </>
        ) : null}

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
