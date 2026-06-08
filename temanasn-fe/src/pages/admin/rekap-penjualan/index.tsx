import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import moment from 'moment';
import { useState } from 'react';
import { DateRangePicker } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function RekapPenjualan() {
  // Perbaikan utama: gunakan tipe yang benar dan inisialisasi sebagai array kosong atau [null, null]
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);


  const dataRekap = useGetList({
    url: 'dashboard/rekap-penjualan',
    initialParams: {
      startDate: '',
      endDate: '',
      sort: 'terjual_desc',
    },
  });

const handleFilterDate = (value: [Date | null, Date | null]) => {
  setDateRange(value);

  dataRekap.setParams({
    ...dataRekap.params,
    startDate: value[0] ? moment(value[0]).format("YYYY-MM-DD") : "",
    endDate: value[1] ? moment(value[1]).format("YYYY-MM-DD") : "",
  });
};


  const handleSortClick = () => {
    const newSort =
      dataRekap.params.sort === 'terjual_desc' ? 'terjual_asc' : 'terjual_desc';
    dataRekap.setParams({
      ...dataRekap.params,
      sort: newSort,
    });
  };

  const columns = [
    {
      title: 'No',
      colKey: 'no',
      width: 70,
      align: AlignType.Center,
    },
    {
      title: 'Nama Paket',
      colKey: 'namaPaket',
      ellipsis: true,
    },
    {
      title: (
        <div
          className="flex items-center gap-1 cursor-pointer select-none"
          onClick={handleSortClick}
        >
          <span>Jumlah Terjual</span>
          <span className="text-sm opacity-70">
            {dataRekap.params.sort === 'terjual_desc' ? '▼' : '▲'}
          </span>
        </div>
      ),
      colKey: 'jumlahTerjual',
      width: 150,
      align: AlignType.Center,
    },
  ];

  return (
    <section>
      <BreadCrumb page={[{ name: 'Rekap Penjualan', link: '/rekap-penjualan' }]} />
      <div className="bg-white p-8 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-indigo-900">Rekap Penjualan</h1>
          <div className="flex gap-3 items-center">
            {/* DateRangePicker dengan tipe dan value yang benar */}
            <DateRangePicker
              placeholder={['Start Date', 'End Date']}
              value={dateRange}
              onChange={handleFilterDate}
              format="YYYY-MM-DD"
              clearable // opsional: biar bisa clear tanggal
            />
            {/* Tombol Export Excel sudah dihapus sesuai permintaan */}
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <TableWrapper data={dataRekap} columns={columns} />
        </div>
      </div>
    </section>
  );
}