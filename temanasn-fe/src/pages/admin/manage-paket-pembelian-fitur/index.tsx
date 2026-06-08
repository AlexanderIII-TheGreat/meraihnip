import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Popconfirm } from 'tdesign-react';
import ManagePaketPembelian from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData, getData } from '@/utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';
import toast from 'react-hot-toast';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function UserIndex() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});
  const [detailPaket, setDetailPaket] = useState({
    nama: '',
  });
  const navigate = useNavigate();
  const { id } = useParams();

  const getList = useGetList({
    url: 'admin/paket-pembelian-fitur/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: false,
      paketPembelianId: id,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/paket-pembelian-fitur/remove/${id}`)).then(
      () => {
        getList.refresh();
      }
    );
  };

  const columns = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 * getList.params.skip + 1}</span>;
      },
    },

    {
      title: 'Name',
      colKey: 'nama',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
    },

    {
      title: 'Action',
      align: AlignType.Center,
      colKey: 'action',
      cell: ({ row }: any) => {
        return (
          <div className="flex justify-center gap-5">
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setDetail(() => ({
                  ...row,
                }));
                setVisible(true);
              }}
            >
              <IconPencil size={14} />
            </Button>

            <Popconfirm
              content="Apakah kamu yakin ?"
              theme="danger"
              onConfirm={() => handleDeleted(row.id)}
            >
              <Button shape="circle" theme="danger">
                <IconTrash size={14} />
              </Button>{' '}
            </Popconfirm>
          </div>
        );
      },
    },
  ];
  const getDetail = async () => {
    getData(`admin/paket-pembelian/find/${id}`).then((res) => {
      setDetailPaket(res);

      if (!res.id) {
        toast.error('Data tidak ditemukan');
        navigate('/manage-pembelian');
      }
    });
  };

  useEffect(() => {
    getDetail();
  }, []);

  return (
    <section className="">
      {visible && (
        <ManagePaketPembelian
          setDetail={setDetail}
          params={getList}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[
          { name: 'Paket Pembelian', link: '/manage-pembelian' },
          {
            name: detailPaket?.nama || 'Paket Pembelian Detail',
            link: '/manage-pembelian',
          },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Fitur
            </h1>
            <Button
              theme="default"
              size="large"
              className="border-success hover:bg-success hover:text-white group"
              onClick={() => setVisible(true)}
            >
              <IconPlus
                size={20}
                className="text-success group-hover:text-white"
              />
            </Button>
          </div>
        </div>
        <TableWrapper data={getList} columns={columns} />
      </div>
    </section>
  );
}
