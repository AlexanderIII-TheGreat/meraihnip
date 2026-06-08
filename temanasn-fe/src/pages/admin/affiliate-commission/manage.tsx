import Form from '@/components/form';
import Input from '@/components/input';
import { patchData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { useState } from 'react';
import { Button, Dialog, MessagePlugin } from 'tdesign-react';

export default function ManageAffiliate({
  setDetail,
  setVisible,
  detail,
  params,
}: any) {
  const [loading, setLoading] = useState(false);
  const [commission_type, setCommissionType] = useState(
    detail?.commission_type || 'percent'
  );

  const handleSubmit = async (data: any) => {
    setLoading(true);

    const payload = {
      ...data,
      commission_value: parseFloat(data.affiliateCommission) || 0,
      commission_type,
    };

    FetchAPI(patchData(`admin/affiliate/${detail.id}/update-commission`, payload))
      .then((res) => {
        if (res?.status || res?.success) {
          MessagePlugin.success(res.message || 'Komisi berhasil diupdate!');
          params?.refresh?.();
          setVisible(false);
          setDetail({});
        } else {
          MessagePlugin.error(res?.message || 'Update gagal!');
        }
      })
      .catch((err) => {
        console.error('Error Update Affiliate Commission:', err);
        MessagePlugin.error(err?.message || 'Gagal update komisi!');
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
      header="Edit Komisi Affiliate"
      visible
      onClose={handleClose}
      className="w-[600px]"
      footer={null}
    >
      <div className="space-y-3 mb-4">
        <p>
          User:{' '}
          <span className="font-semibold">
            {detail?.name || detail?.email || '-'}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Kode Affiliate:{' '}
          <span className="font-mono">{detail?.affiliateCode || '-'}</span>
        </p>
      </div>

      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        defaultValues={{
          affiliateCommission: detail?.affiliateCommission || 0,
          commission_type: commission_type,
        }}
      >
        <Input
          title="Tipe Komisi"
          name="commission_type"
          type="select"
          options={[
            { label: 'Persentase (%)', value: 'percent' },
            { label: 'Tetap (IDR)', value: 'nominal' },
          ]}
          validation={{
            required: 'Tipe komisi tidak boleh kosong',
          }}
          value={commission_type}
          onChange={(val) => setCommissionType(val)}
        />

        <Input
          title="Nilai Komisi"
          name="affiliateCommission"
          type="number"
          step={commission_type=== 'percent' ? '0.01' : '1000'}
          suffix={commission_type=== 'percent' ? '%' : 'IDR'}
          validation={{
            required: 'Nilai komisi tidak boleh kosong',
            validate: (val: string) => {
              const num = parseFloat(val);
              if (isNaN(num)) return 'Nilai harus angka';
              if (num < 0) return 'Nilai tidak boleh negatif';
              if (commission_type=== 'percent' && num > 100)
                return 'Persentase maksimal 100%';
              return true;
            },
          }}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            size="large"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" size="large" loading={loading}>
            Simpan
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
