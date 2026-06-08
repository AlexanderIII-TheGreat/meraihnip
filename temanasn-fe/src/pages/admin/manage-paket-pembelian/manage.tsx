import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { currencyToNumber } from '@/utils/number-format';
import { useEffect, useState } from 'react';
import { Button, Dialog, TagInput } from 'tdesign-react';

export default function ManagePaketPembelian({
  setVisible,
  params,
  detail,
  setDetail,
}: any) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<any[]>([]);

  useEffect(() => {
    if (detail?.paketPembelianCategory) {
      setCategory(detail.paketPembelianCategory?.map((item: any) => item.nama));
    }
  }, [detail]);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = jsonToFormData({
      ...data,
      harga: currencyToNumber(data.harga),
      category: JSON.stringify(category),
    });

    FetchAPI(
      detail.id
        ? patchData(`admin/paket-pembelian/update/${detail.id}`, payload)
        : postData('admin/paket-pembelian/insert', payload)
    )
      .then(() => {
        params.refresh();
        setVisible(false);
        setLoading(false);
        setDetail({});
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
      header={detail.id ? 'Edit Paket Pembelian ' : 'Tambah Paket Pembelian '}
      visible
      onClose={handleClose}
      className="!w-[600px]"
      showOverlay
      footer={null}
    >
      <Form
        disabledEnter
        onSubmit={handleSubmit}
        className="space-y-6 "
        defaultValues={detail}
      >
        <Input
          title="Thumbnail"
          name="gambar"
          type="file"
          accept=".jpg,.jpeg,.png"
          validation={{
            required: detail.id ? false : 'Thumbnail tidak boleh kosong',
          }}
        />
        <Input
          title="Judul"
          name="nama"
          type="text"
          validation={{
            required: 'Judul tidak boleh kosong',
          }}
        />
        <Input
          title="Harga"
          name="harga"
          type="text"
          isCurrency
          startAdornment="Rp. "
          min={0}
          validation={{
            min: {
              value: 0,
              message: 'Harga tidak boleh kurang dari 0',
            },
          }}
        />
        <Input
          title="Status"
          name="isActive"
          type="select"
          options={[
            { label: 'Active', value: '1' },
            { label: 'Hidden', value: '0' },
          ]}
        />
        <Input
          title="Durasi"
          name="durasi"
          type="number"
          endAdornment="Bulan"
          min={0}
          validation={{
            required: 'Durasi tidak boleh kosong',
          }}
        />
        <small>*isi 0 untuk selamanya</small>
        <div className="">
          <label
            className={`block text-sm font-medium leading-6 text-gray-900 `}
          >
            Kategori
          </label>
          <TagInput
            autoWidth={false}
            clearable
            defaultInputValue=""
            className="border border-gray-300 py-1 px-2 rounded-md"
            value={category}
            onChange={(e) => {
              setCategory(e);
            }}
            dragSort
            excessTagsDisplayType="break-line"
            minCollapsedNum={0}
            placeholder={'Kategori (Ketik & Enter)'}
            readonly={false}
            size="medium"
          />
        </div>
		<Input
          title="Link WhatsApp"
          name="linkWa"
          type="text"
          validation={{
            pattern: {
              message: "Link harus berupa URL WhatsApp yang valid (contoh: https://wa.me/6281234567890)",
            },
          }}
        />
        <Input title="Langkah Langkah Panduan" name="panduan" type="ckeditor" />
        <Input title="Keterangan" name="keterangan" type="ckeditor" />

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
