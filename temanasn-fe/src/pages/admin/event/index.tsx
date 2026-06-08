import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import createTrigger from '@/utils/create-trigger';
import { imageLink } from '@/utils/image-link';
import { formatCurrency } from '@/utils/number-format';

import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { Button, ImageViewer, Popconfirm } from 'tdesign-react';
import ManageEvent from './manage';
import FetchAPI from '@/utils/fetch-api';
import { deleteData } from '@/utils/axios';
import BreadCrumb from '@/components/breadcrumb';

enum FilterType {
  Input = 'input',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function EventIndex() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});

  const getData = useGetList({
    url: 'admin/event/get',
    initialParams: {
      skip: 0,
      take: 10,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/event/remove/${id}`)).then(() => {
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
      title: 'Image',
      colKey: 'gambar',
      cell: ({ row }: any) => {
        const trigger = createTrigger(row.gambar);
        return (
          <ImageViewer trigger={trigger} images={[imageLink(row.gambar)]} />
        );
      },
    },
    {
      title: 'Judul',
      colKey: 'nama',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Judul' },
        showConfirmAndReset: true,
      },
    },

    {
      title: 'Created At',
      colKey: 'createdAt',
      sorter: true,
      cell: ({ row }: any) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
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
                  persen: row.tipePotongan === 'PERSEN' ? row.value : '',
                  harga:
                    row.tipePotongan === 'HARGA'
                      ? formatCurrency(row.value, true)
                      : '',
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
  return (
    <section className="">
      {visible && (
        <ManageEvent
          setDetail={setDetail}
          params={getData}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb page={[{ name: 'Manage Event', link: '/manage-event' }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Event
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
        <TableWrapper data={getData} columns={columns} />
      </div>
    </section>
  );
}
