import TableWrapper from '@/components/table';
import BreadCrumb from '@/components/breadcrumb';
import useGetList from '@/hooks/use-get-list';
import { IconApps, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button, Popconfirm, Popup } from 'tdesign-react';
import ManageCategory from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import moment from 'moment';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageSoalGenerate() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});
  const navigate = useNavigate();
  const getList = useGetList({
    url: 'admin/generate-soal-category/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/generate-soal-category/remove/${id}`)).then(() => {
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
      colKey: 'name',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Nama' },
        showConfirmAndReset: true,
      },
    },
    {
      colKey: 'kkm',
      title: 'KKM',
      align: AlignType.Center,
      width: 80,
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
      width: 120,
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
            <Popup content="Manage Soal" trigger="hover">
              <Button
                shape="circle"
                theme="default"
                onClick={() => {
                  navigate(`/manage-soal-generate/${row.id}`);
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
    <section className="flex justify-center">
      {visible && (
        <ManageCategory
          setDetail={setDetail}
          params={getList}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <div className="p-8 pt-2 rounded-2xl max-w-5xl w-full">
        <BreadCrumb
          page={[{ name: 'Manage Soal Generate Category', link: '/manage-soal-generate' }]}
        />
        <div className="bg-white p-8 rounded-2xl min-w-[400px]">
          <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
            <div className="title border-b border-[#ddd] w-full flex justify-between items-center">
              <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
                Master Soal Generate
              </h1>
              <div className="flex items-center gap-6 mb-5">
                <Button
                  theme="default"
                  size="large"
                  className="border-success hover:bg-success hover:text-white group"
                  onClick={() => {
                    setDetail({});
                    setVisible(true);
                  }}
                >
                  <IconPlus
                    size={20}
                    className="text-success group-hover:text-white"
                  />
                </Button>
              </div>
            </div>
          </div>
          <TableWrapper data={getList} columns={columns} />
        </div>
      </div>
    </section>
  );
}
