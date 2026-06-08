import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconApps, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Button, Popconfirm, Popup } from 'tdesign-react';
import ManageCategory from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData, getData } from '@/utils/axios';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import BreadCrumb from '@/components/breadcrumb';

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
  const navigate = useNavigate();
  const [parent, setParent] = useState<any>({});
  const params = useParams();

  const getDetail = async () => {
    getData(`admin/bank-soal-parent-kategori/find/${params.id}`).then((res) => {
      setParent(res);
    });
  };

  useEffect(() => {
    getDetail();
  }, []);

  const getList = useGetList({
    url: 'admin/bank-soal-kategori/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
      parentCategoryId: params.id,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/bank-soal-kategori/remove/${id}`)).then(() => {
      getList.refresh();
    });
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
      colKey: 'jumlah_soal',
      title: 'Jumlah Soal',
      width: 80,
      align: AlignType.Center,

      cell: ({ row }: any) => {
        return <span>{row._count?.BankSoal || 0}</span>;
      },
    },
    {
      colKey: 'kkm',
      title: 'Passing Grade',
      align: AlignType.Center,
      width: 80,
    },
    {
      colKey: 'penilaian',
      title: 'Penilaian',
      width: 120,
      align: AlignType.Center,

      cell: ({ row }: any) => {
        return (
          <span>{row.tipePenilaian == 'POINT' ? 'Point' : 'Benar Salah'}</span>
        );
      },
    },
    {
      title: 'Tanggal Dibuat',
      colKey: 'createdAt',
      width: 150,
      align: AlignType.Center,
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Action',
      align: AlignType.Center,
      width: 180,
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
            <Popup content="Manage Bank Soal" trigger="hover">
              <Button
                shape="circle"
                theme="default"
                onClick={() => {
                  navigate(`/manage-soal/${row.id}`);
                }}
              >
                <IconApps size={14} />
              </Button>
            </Popup>
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
  return (
    <section className="">
      {visible && (
        <ManageCategory
          setDetail={setDetail}
          params={getList}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[
          { name: 'Bank Soal', link: '/manage-soal-category' },
          { name: parent.nama || 'Category', link: '#' },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              [Sub Kategori] Manage Soal
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
