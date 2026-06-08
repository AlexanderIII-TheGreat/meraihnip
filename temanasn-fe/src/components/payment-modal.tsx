import { getData, postData } from '@/utils/axios';
import { formatCurrency } from '@/utils/number-format';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Dialog, Popconfirm, Button as ButtonT } from 'tdesign-react';
import Form from './form';
import Input from './input';
import FetchAPI from '@/utils/fetch-api';
import { countDiscount } from '@/const';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from './button';

export default function PaymentModal({
  setVisible,
  setDetail,
  itemDetail,
  alumniVoucher,
}: any) {
  const navigate = useNavigate();
  const [merchantList, setMerchantList] = useState([]);
  const [voucher, setVoucher] = useState('');
  const [voucherDetail, setVoucherDetail] = useState({
    kode: '',
    tipePotongan: '',
    value: 0,
  });
  const [payment, setPayment] = useState({
    method: '',
    fee: 0,
    isLoading: false,
  });
  const getMerchantList = async () => {
    getData('user/payment-gateway/merchant-list').then((res) => {
      setMerchantList(res);
    });
  };

  const CountPaymentFee = async () => {
    getData('user/payment-gateway/payment-fee', {
      amount: itemDetail.harga,
      code: payment.method,
    }).then((res) => {
      setPayment((prev) => ({
        ...prev,
        fee: res[0]?.total_fee?.customer,
        isLoading: false,
      }));
    });
  };

  useEffect(() => {
    if (payment.method) {
      setPayment((prev) => ({
        ...prev,
        isLoading: true,
      }));
      CountPaymentFee();
    }
  }, [payment.method]);

  useEffect(() => {
    getMerchantList();
  }, []);

  const handleClose = () => {
    setVisible(false);
    setDetail({});
  };

  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = () => {
    setIsLoading(true);
    const price =
      itemDetail.harga -
      (PotonganDiscount || 0) -
      (countDiscount(
        alumniVoucher?.tipePotongan,
        itemDetail.harga,
        alumniVoucher?.value
      ) || 0) +
      payment.fee;
    if (isFree && price <= 10000) {
      return toast.error(
        'Minimal pembayaran Rp.10.000, silahkan hubungi admin'
      );
    }
    postData('user/payment-gateway/create-payment', {
      paketPembelianId: itemDetail.id,
      code: payment.method || 'GRATIS',
      discountCode: voucherDetail?.kode,
    })
      .then((res) => {
        if (res.data.data.checkout_url)
          return (window.location.href = res.data.data.checkout_url);
        else navigate('riwayat');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleUseVoucher = async () => {
    FetchAPI(
      postData('user/check-voucher', {
        code: voucher,
        paketId: itemDetail.id,
      })
    ).then((res: any) => {
      setVoucherDetail({
        ...res?.data?.data,
      });
    });
  };

  const content = (
    <>
      <p className="title">
        <span className="text-red-500">*</span> Masukkan Kode Voucher
      </p>
      <div className="describe">
        <Form onSubmit={() => {}}>
          <Input
            autocomplete="off"
            name="name"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value)}
            type="text"
            validation={{
              required: 'Voucher tidak boleh kosong',
            }}
          />
        </Form>
      </div>
    </>
  );

  const PotonganDiscount = countDiscount(
    voucherDetail.tipePotongan,
    itemDetail.harga,
    voucherDetail.value
  );
  const isFree = itemDetail.harga - (PotonganDiscount || 0) > 0;
  return (
    <Dialog
      header={'Konfirmasi Pembayaran'}
      visible
      onClose={handleClose}
      className="w-[800px]"
      footer={null}
    >
      <h5 className="text-md font-semibold mb-2">
        <span className="text-red-500">*</span> Pilih Metode Pembayaran
      </h5>
      <div className="grid grid-cols-4 gap-5">
        {merchantList?.map((item: any) => (
          <div key={item.code}>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payment"
                id={item.code}
                onChange={(e) =>
                  setPayment((prev) => ({
                    ...prev,
                    method: e.target.id,
                  }))
                }
                checked={payment.method === item.code}
                className="w-5 h-5"
              />
              <label htmlFor={item.code}>
                <img
                  src={item.icon_url}
                  alt={item.name}
                  className="w-20 h-20 object-contain cursor-pointer"
                />
              </label>
            </div>
            <div className="flex gap-2"></div>
          </div>
        ))}
      </div>

      <h5 className="text-md font-semibold mb-2">Ringkasan Pembayaran</h5>
      <div aria-labelledby="summary-heading">
        <div className="rounded-lg bg-gray-50 py-6 sm:p-6 lg:p-8">
          <div className="flow-root">
            <dl className="-my-4 divide-y divide-gray-200 text-base">
              <div className="flex items-center justify-between py-4">
                <dt className="text-black">Harga</dt>
                <dd className="font-medium mr-4 text-gray-900">
                  {formatCurrency(itemDetail.harga)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-black">Admin</dt>
                <dd className="font-medium mr-4 text-gray-900">
                  {formatCurrency(payment.fee)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-black ">Diskon </dt>
                <dd className="font-medium mr-4 text-gray-900 flex gap-2 items-center">
                  {alumniVoucher?.value && (
                    <span>
                      {formatCurrency(
                        countDiscount(
                          alumniVoucher?.tipePotongan,
                          itemDetail.harga,
                          alumniVoucher?.value
                        )
                      )}{' '}
                      (ALUMNI)
                    </span>
                  )}
                  {voucherDetail?.kode ? (
                    <span>+ {formatCurrency(PotonganDiscount || 0)}</span>
                  ) : (
                    <Popconfirm
                      theme={'default'}
                      content={content}
                      onConfirm={handleUseVoucher}
                    >
                      <ButtonT variant="dashed" className="flex gap-2">
                        <IconPlus size={13} className=" self-center" />
                        <span>Voucher</span>
                      </ButtonT>
                    </Popconfirm>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-base font-semibold text-gray-900">Total</dt>
                <dd className="text-base font-semibold text-green-500 mr-4">
                  {itemDetail.harga != isFree && PotonganDiscount ? (
                    <span className="line-through mr-4 font-medium text-xs text-gray-900">
                      {formatCurrency(itemDetail.harga)}
                    </span>
                  ) : (
                    ''
                  )}
                  {isFree
                    ? formatCurrency(
                        itemDetail.harga -
                          (PotonganDiscount || 0) -
                          (countDiscount(
                            alumniVoucher?.tipePotongan,
                            itemDetail.harga,
                            alumniVoucher?.value
                          ) || 0) +
                          payment.fee
                      )
                    : 'Gratis'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button
          type="submit"
          disabled={isFree ? !payment.method : false}
          onClick={handlePayment}
          className="px-5 disabled:opacity-50 disabled:bg-primary"
          isLoading={isLoading}
        >
          Bayar Sekarang
        </Button>
      </div>
    </Dialog>
  );
}
