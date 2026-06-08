import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconPencil, IconPlus, IconTrash, IconList } from '@tabler/icons-react';
import { useState } from 'react';
import { Button, Popconfirm, Tooltip } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import { useParams, Link } from 'react-router-dom';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import ManageKiasanModal from './manage-kiasan';

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function ManageKiasan() {
  const { id } = useParams();
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});

  const getData = useGetList({
    url: 'admin/kiasan/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      descending: true,
      kategoriSoalKecermatanId: Number(id),
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/kiasan/remove/${id}`)).then(() => {
      getData.refresh();
    });
  };

  const columns = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + 1 * getData.params.skip + 1}</span>;
      },
    },
    {
      title: 'Kiasan',
      colKey: 'karakter',
      cell: ({ row }: any) => {
        return (
          <div className="flex gap-0 flex-wrap">
            {Array.isArray(row.karakter)
              ? row.karakter.map((k: string, i: number) => (
                  <div
                    key={i}
                    className="flex flex-col items-center border border-gray-200 rounded-md overflow-hidden min-w-[30px]"
                  >
                    <div className="px-0 py-0.5 bg-gray-100 font-bold border-b border-gray-200 w-full text-center text-xs text-gray-700">
                      {k}
                    </div>
                    <div className="px-0 py-0.5 bg-indigo-50 text-indigo-700 w-full text-center text-xs font-bold">
                      {row.kiasan?.[i] || '-'}
                    </div>
                  </div>
                ))
              : '-'}
          </div>
        );
      },
    },
    {
      title: 'Jumlah Soal',
      colKey: 'soal_count',
      width: 120,
      align: AlignType.Center,
      cell: ({ row }: any) => {
        return <span>{row?._count?.SoalKecermatan || 0}</span>;
      },
    },
    {
      title: 'Waktu',
      colKey: 'total_waktu',
      width: 150,
      align: AlignType.Center,
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{row.total_waktu || 0} Detik</span>;
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
            <Tooltip content="Manage Soal">
              <Link to={`/manage-soal-kecermatan/${id}/soal/${row.id}`}>
                <Button shape="circle" variant="outline" theme="primary">
                  <IconList size={14} />
                </Button>
              </Link>
            </Tooltip>
            
            <Tooltip content={row?._count?.SoalKecermatan > 0 ? "Kosongkan soal terlebih dahulu sebelum edit" : "Edit"}>
              <span className="inline-block">
                <Button
                  shape="circle"
                  theme="default"
                  disabled={row?._count?.SoalKecermatan > 0}
                  onClick={() => {
                    setVisible(true);
                    setDetail(() => ({
                      ...row,
                    }));
                  }}
                >
                  <IconPencil size={14} />
                </Button>
              </span>
            </Tooltip>

            <Popconfirm
              content="Apakah kamu yakin ?"
              theme="danger"
              onConfirm={() => handleDeleted(row.id)}
            >
              <Button shape="circle" theme="danger">
                <IconTrash size={14} />
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <section className="">
      {visible && (
        <ManageKiasanModal
          setDetail={setDetail}
          params={getData}
          setVisible={setVisible}
          detail={detail}
          categoryId={Number(id)}
        />
      )}
      <BreadCrumb
        page={[
          { name: 'Bank Soal Kecermatan', link: '/manage-soal-kecermatan' },
          { name: 'Manage Kiasan', link: '#' },
        ]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Kiasan
            </h1>
            <Button
              theme="default"
              size="large"
              className="border-success hover:bg-success hover:text-white group"
              onClick={() => {
                  setDetail({})
                  setVisible(true)
              }}
            >
              <IconPlus
                size={20}
                className="text-success group-hover:text-white"
              />
            </Button>
          </div>
        </div>
        <TableWrapper data={getData} columns={columns} />
      </div>
    </section>
  );
}
