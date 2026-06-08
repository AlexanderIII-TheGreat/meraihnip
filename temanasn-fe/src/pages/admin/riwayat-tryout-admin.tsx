import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Popup, Tag } from 'tdesign-react';
import { getData, getExcel } from '@/utils/axios';
import { useParams } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';

import moment from 'moment/min/moment-with-locales';
import { konversiDetikKeWaktu } from '@/const';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function RiwayatTryoutAdmin() {
  const { id, latihanId, paketPembelianTryoutId } = useParams();
  const [tryout, setTryout] = useState<any>({});
  const [detailPaket, setDetailPaket] = useState({
    nama: '',
  });

  const listTryout = useGetList({
    url: 'admin/paket-pembelian-tryout/get-history',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
      disabled: true,
    },
  });

  useEffect(() => {
    if (latihanId && id) {
      listTryout.setParams((prev: any) => ({
        ...prev,
        paketPembelianTryoutId: paketPembelianTryoutId,
        id: latihanId,
        disabled: false,
      }));
    }
  }, [latihanId, id]);

  const handleExportExcel = async (id: number, namaUser: string) => {
    await getExcel(
      'admin/paket-pembelian-tryout/excel-tryout',
      `Tryout ${tryout?.PaketLatihan?.nama} - ${namaUser}`,
      {
        id: id,
      }
    );
  };

  const columns = [
    {
      title: '#',
      colKey: 'position',
      width: 50,
      cell: ({ rowIndex }: any) => (
        <div>{rowIndex + 1 * listTryout.params.skip + 1}</div>
      ),
    },
    {
      title: 'User',
      colKey: 'user',
      width: 200,
      cell: ({ row }: any) => (
        <div>
          <p>{row.name}</p>
          <span className="text-xs">
            {row?.email} - {row?.noWA}
          </span>
        </div>
      ),
    },
    {
      title: 'Waktu Pengerjaan',
      colKey: 'date',
      width: 250,
      cell: ({ row }: any) => (
        <div>
          <p className="text-md font-bold">
            {moment(row.createdAt).format('dddd')},{' '}
            {moment(row.createdAt).format('LL')}
          </p>
          <p>Pukul {moment(row.createdAt).format('HH:mm')}</p>
        </div>
      ),
    },
    {
      title: 'Passing Grade',
      colKey: 'nama',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {row?.pointCategory?.map((item: any) => (
            <Tag
              theme={item.all_point >= item.kkm ? 'success' : 'danger'}
              size="large"
              variant="light"
            >
              {item.category}: {item.all_point}/{item.maxPoint}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      colKey: 'status',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <>
          {moment(row.finishAt) > moment() ? (
            <Tag theme="warning" size="large" variant="light">
              Sedang Dikerjakan
            </Tag>
          ) : (
            <Tag
              theme={
                row?.point?._sum?.point >= row?.point?._sum?.maxPoint
                  ? 'success'
                  : 'danger'
              }
              size="large"
              variant="light"
            >
              {row?.point?._sum?.point >= row?.point?._sum?.maxPoint
                ? 'Lulus'
                : 'Tidak Lulus'}
            </Tag>
          )}
        </>
      ),
    },
    {
      title: 'Durasi Pengerjaan',
      colKey: 'durasi',
      width: 130,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div>
          {moment(row.finishAt) > moment()
            ? ''
            : konversiDetikKeWaktu(row?.waktuPengerjaan)}
        </div>
      ),
    },
    {
      title: 'Action',
      colKey: 'miniTest',
      width: 50,
      align: AlignType.Center,
      cell: ({ row }: any) => (
        <div className="flex gap-2 justify-center">
          <Popup content="Lihat Statistik" trigger="hover">
            <Button
              shape="circle"
              theme="primary"
              variant="dashed"
              onClick={() => handleExportExcel(row.id, row.name)}
              className="hover:shadow-xl"
            >
              <IconFileSpreadsheet size={14} className="" />
            </Button>
          </Popup>
        </div>
      ),
    },
  ];

  const getDetail = async () => {
    getData(`admin/paket-pembelian/find/${id}`).then((res) => {
      setDetailPaket(res);
    });
  };

  const getDetailTryout = async () => {
    getData(`admin/paket-pembelian-tryout/find/${paketPembelianTryoutId}`).then(
      (res) => {
        setTryout(res);
      }
    );
  };
  useEffect(() => {
    getDetail();
    getDetailTryout();
  }, []);

  return (
    <section className="">
      <BreadCrumb
        page={[
          { name: 'Paket Pembelian', link: '/manage-pembelian' },
          {
            name: detailPaket?.nama || 'Paket Pembelian Detail',
            link: '/manage-pembelian',
          },
          {
            name: tryout?.PaketLatihan?.nama,
            link: `/manage-pembelian/${id}/tryout`,
          },
          {
            name: 'Riwayat',
            link: '#',
          },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full mt-2">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-xl text-indigo-950 font-bold mb-5 ">
              Riwayat Tryout
            </h1>
          </div>
        </div>
        <TableWrapper data={listTryout} columns={columns} />
      </div>
    </section>
  );
}
