import Form from '@/components/form';
import Input from '@/components/input';
import { patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { currencyToNumber } from '@/utils/number-format';
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog } from 'tdesign-react';

export default function ManageVoucher({
  setVisible,
  params,
  detail,
  setDetail,
  paketPembelian,
}: any) {
  const [loading, setLoading] = useState(false);
  const [tipe, setTipe] = useState('PERSEN');
  const [tipeDiskon, setTipeDiskon] = useState('NORMAL');

  useEffect(() => {
    if (detail.id) {
      setTipe(detail.tipePotongan);
      setTipeDiskon(detail.tipe);
    }
  }, [detail]);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = jsonToFormData({
      ...data,
      status: 'AKTIF',
      value: currencyToNumber(
        data.tipePotongan === 'HARGA' ? data.harga : data.persen
      ),
      voucherProduct: data?.voucherProduct?.map(
        (item: any) => item.value || item
      ),
      persen: null,
      harga: null,
    });

    FetchAPI(
      detail.id
        ? patchData(`admin/vouchers/update/${detail.id}`, payload)
        : postData('admin/vouchers/insert', payload)
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
      header={detail.id ? 'Edit Voucher' : 'Tambah Voucher'}
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
        {tipeDiskon === 'ALUMNI' ? (
          <Alert
            theme="warning"
            message="Membuat Voucher Alumni baru akan menonaktifkan Voucher Alumni yang lain."
          />
        ) : null}

        <Input
          title="Tipe Diskon"
          name="tipe"
          type="select"
          validation={{
            required: 'Tipe tidak boleh kosong',
          }}
          onChange={(e) => setTipeDiskon(e)}
          options={[
            { label: 'Normal', value: 'NORMAL' },
            { label: 'Alumni', value: 'ALUMNI' },
          ]}
        />
        {tipeDiskon === 'NORMAL' ? (
          <Input
            title="Kode*"
            name="kode"
            type="text"
            validation={{
              required: 'Kode tidak boleh kosong',
              pattern: {
                value: /^[A-Z0-9]+$/,
                message:
                  'Masukkan kode yang terdiri dari huruf besar dan angka',
              },
            }}
          />
        ) : null}
        <Input
          title="Tipe*"
          name="tipePotongan"
          type="select"
          validation={{
            required: 'Potongan tidak boleh kosong',
          }}
          onChange={(e) => setTipe(e)}
          options={[
            { label: 'Persen', value: 'PERSEN' },
            { label: 'Harga', value: 'HARGA' },
          ]}
        />

        {tipe === 'HARGA' ? (
          <Input
            title="Nominal"
            name="harga"
            type="text"
            isCurrency
            startAdornment="Rp. "
            min={0}
            validation={{
              required: 'Harga tidak boleh kosong',
              min: {
                value: 0,
                message: 'Harga tidak boleh kurang dari 0',
              },
            }}
          />
        ) : (
          <Input
            title="Persen"
            name="persen"
            type="number"
            endAdornment="%"
            validation={{
              required: 'Persen tidak boleh kosong',
              max: {
                value: 100,
                message: 'Persen tidak boleh lebih dari 100',
              },
              min: {
                value: 0,
                message: 'Persen tidak boleh kurang dari 0',
              },
            }}
          />
        )}
        <Input
          title="Thumbnail"
          name="gambar"
          type="file"
          accept=".jpg,.jpeg,.png"
          validation={{
            required: detail.id ? false : 'Thumbnail tidak boleh kosong',
          }}
        />
        {tipeDiskon !== 'ALUMNI' ? (
          <div className="">
            <Input
              name="voucherProduct"
              type="selectCreatable"
              title="Paket Pembelian"
              labelStyle="block mb-2 !text-base text-black"
              options={paketPembelian?.list?.map((item: any) => ({
                label: item.nama,
                value: item.id,
              }))}
              multiple
              creatable={false}
              // value={value?.subcategory}
            />
            <small>* Kosongkan jika ingin memilih semua produk</small>
          </div>
        ) : null}
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
