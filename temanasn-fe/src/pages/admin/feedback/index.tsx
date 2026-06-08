import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import { IconToggleRight, IconToggleLeft, IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { Button, Popconfirm, Switch, MessagePlugin } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import { deleteData, getData, patchData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';

enum FilterType {
  Input = 'input',
}
enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function FeedbackIndex() {
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [feedbackSettingId, setFeedbackSettingId] = useState(null);

  const dataFeedback = useGetList({
    url: 'admin/feedbacks',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'created_at',
      descending: 'true',
    },
  });

  // Ambil status feedback_enabled dari feedback-setting
useEffect(() => {
  const loadFeedbackSetting = async () => {
    try {
      const res = await getData('admin/feedback-settings');
      console.log("Response feedback-settings:", res);

      if (Array.isArray(res) && res.length > 0) {
        const firstSetting = res[0];
        console.log("First Setting:", firstSetting);

        setFeedbackEnabled(firstSetting.isActive);
        setFeedbackSettingId(firstSetting.id);
      } else {
        console.log("Feedback settings kosong");
        setFeedbackEnabled(false);
        setFeedbackSettingId(null);
      }
    } catch (err) {
      console.error('Error loading feedback setting:', err);
      MessagePlugin.error('Gagal memuat pengaturan feedback');
    }
  };
  loadFeedbackSetting();
}, []);

// Toggle feedback_enabled
const handleToggleFeedback = async (newValue: boolean) => {
  console.log("Toggle clicked, newValue:", newValue, "currentId:", feedbackSettingId);

  try {
    const res = await patchData(`admin/feedback-settings`, {
      isActive: newValue,
    });
    console.log("Patch response:", res);

    setFeedbackEnabled(newValue);
    setFeedbackSettingId(res.data?.id || null);
    MessagePlugin.success(`Feedback ${newValue ? 'diaktifkan' : 'dinonaktifkan'}`);
  } catch (err) {
    console.error('Error toggling feedback setting:', err);
    MessagePlugin.error('Gagal mengubah pengaturan feedback');
  }
};

  const handleDeleted = async (id) => {
    try {
      await FetchAPI(deleteData(`admin/feedbacks/${id}`));
      dataFeedback.refresh();
      MessagePlugin.success('Feedback berhasil dihapus');
    } catch (err) {
      console.error('Error deleting feedback:', err);
      MessagePlugin.error('Gagal menghapus feedback');
    }
  };

  const columns = [
    {
      colKey: 'index',
      title: '#',
      width: 60,
      cell: ({ rowIndex }) => {
        return <span>{rowIndex + 1 + dataFeedback.params.skip}</span>;
      },
    },
    {
      title: 'User Email',
      colKey: 'userEmail',
      cell: ({ row }) => {
        return <span>{row.user?.email || '-'}</span>;
      },
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input User Email' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Pekerjaan',
      colKey: 'pekerjaan',
      cell: ({ row }) => {
        return <span>{row.pekerjaan || '-'}</span>;
      },
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Pekerjaan' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Rating',
      colKey: 'rating',
      cell: ({ row }) => {
        return <span>{row.rating || '-'}</span>;
      },
      sorter: true,
    },
    {
      title: 'Saran',
      colKey: 'saran',
      cell: ({ row }) => {
        return <span>{row.saran || '-'}</span>;
      },
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Input Saran' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Created At',
      colKey: 'createdAt',
      sorter: true,
      cell: ({ row }) => {
        return <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>;
      },
    },
    {
      title: 'Action',
      align: AlignType.Center,
      colKey: 'action',
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-5">
            <Popconfirm
              content="Apakah kamu yakin?"
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
      <BreadCrumb
        page={[{ name: 'Manage Feedback', link: '/manage-feedback' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5">
              Manage Feedback
            </h1>
            <div className="flex gap-3">
              <Switch
                size="large"
                value={feedbackEnabled}
                onChange={handleToggleFeedback}
                label={['Feedback Enabled', 'Feedback Disabled']}
                thumbContent={
                  feedbackEnabled ? (
                    <IconToggleRight size={20} />
                  ) : (
                    <IconToggleLeft size={20} />
                  )
                }
              />
            </div>
          </div>
        </div>
        <TableWrapper data={dataFeedback} columns={columns} />
      </div>
    </section>
  );
}