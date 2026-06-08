import { useState } from 'react';
import { Button, Dialog, Input, MessagePlugin, Popconfirm, Switch } from 'tdesign-react';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import moment from 'moment';

import BreadCrumb from '@/components/breadcrumb';
import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import FetchAPI from '@/utils/fetch-api';
import { deleteData, patchData, postData } from '@/utils/axios';

interface FaqForm {
  id: number | null;
  question: string;
  answer: string;
  orderNo: number;
  isActive: boolean;
}

const initialForm: FaqForm = {
  id: null,
  question: '',
  answer: '',
  orderNo: 0,
  isActive: true,
};

const toPlainText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  }
  return String(value);
};

export default function ManageFaqChatbot() {
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<FaqForm>(initialForm);

  const getList = useGetList({
    url: 'admin/faq-chatbot/get',
    initialParams: {
      skip: 0,
      take: 10,
      sortBy: 'orderNo',
      descending: false,
      search: '',
    },
  });

  const handleAdd = () => {
    setFormData(initialForm);
    setVisible(true);
  };

  const handleEdit = (row: any) => {
    setFormData({
      id: row.id,
      question: toPlainText(row.question),
      answer: toPlainText(row.answer),
      orderNo: row.orderNo,
      isActive: row.isActive,
    });
    setVisible(true);
  };

  const handleDelete = async (id: number) => {
    FetchAPI(deleteData(`admin/faq-chatbot/remove/${id}`)).then(() => {
      MessagePlugin.success('FAQ berhasil dihapus');
      getList.refresh();
    });
  };

  const onSubmit = async () => {
    if (!formData.question.trim()) {
      MessagePlugin.warning('Pertanyaan wajib diisi');
      return;
    }

    if (!formData.answer.trim()) {
      MessagePlugin.warning('Jawaban wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        question: toPlainText(formData.question),
        answer: toPlainText(formData.answer),
        orderNo: Number(formData.orderNo || 0),
        isActive: formData.isActive,
      };

      const result = formData.id
        ? await patchData(`admin/faq-chatbot/update/${formData.id}`, payload)
        : await postData('admin/faq-chatbot/insert', payload);

      if ((result as any)?.error || ![200, 201].includes((result as any)?.status)) {
        throw new Error((result as any)?.message || 'Gagal menyimpan FAQ');
      }

      if (formData.id) {
        MessagePlugin.success('FAQ berhasil diperbarui');
      } else {
        MessagePlugin.success('FAQ berhasil ditambahkan');
      }

      setVisible(false);
      getList.refresh();
    } catch (error: any) {
      MessagePlugin.error(error?.message || 'Gagal menyimpan FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      colKey: 'id',
      title: '#',
      width: 60,
      cell: (row: any) => <span>{row.rowIndex + 1}</span>,
    },
    {
      colKey: 'question',
      title: 'Pertanyaan',
      cell: ({ row }: any) => <span className="font-semibold text-indigo-950">{row.question}</span>,
    },
    {
      colKey: 'answer',
      title: 'Jawaban',
      width: 360,
      cell: ({ row }: any) => (
        <span className="text-gray-700 line-clamp-2" title={row.answer}>
          {row.answer}
        </span>
      ),
    },
    {
      colKey: 'orderNo',
      title: 'Urutan',
      width: 90,
      sorter: true,
    },
    {
      colKey: 'isActive',
      title: 'Status',
      width: 110,
      cell: ({ row }: any) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${row.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {row.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      colKey: 'createdAt',
      title: 'Dibuat',
      width: 160,
      sorter: true,
      cell: ({ row }: any) => <span>{moment(row.createdAt).format('DD MMM YYYY HH:mm')}</span>,
    },
    {
      colKey: 'action',
      title: 'Aksi',
      align: 'center' as const,
      width: 140,
      cell: ({ row }: any) => (
        <div className="flex justify-center gap-2">
          <Button shape="circle" theme="default" onClick={() => handleEdit(row)}>
            <IconPencil size={14} />
          </Button>
          <Popconfirm content="Hapus FAQ ini?" theme="danger" onConfirm={() => handleDelete(row.id)}>
            <Button shape="circle" theme="danger">
              <IconTrash size={14} />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <section className="p-6 pt-0">
      <BreadCrumb
        page={[
          { name: 'Admin', link: '/dashboard' },
          { name: 'Manajemen FAQ Chatbot', link: '#' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b pb-5">
          <div>
            <h1 className="text-2xl font-bold text-indigo-950">Manajemen FAQ Chatbot</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola pertanyaan dan jawaban yang tampil pada widget FAQ chatbot.</p>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={search}
              onChange={(val) => setSearch(String(val))}
              onEnter={() => getList.setParams((prev: any) => ({ ...prev, search, skip: 0 }))}
              placeholder="Cari pertanyaan/jawaban"
              className="w-[240px]"
              clearable
            />
            <Button
              theme="default"
              onClick={() => getList.setParams((prev: any) => ({ ...prev, search, skip: 0 }))}
            >
              Cari
            </Button>
            <Button
              theme="primary"
              icon={<IconPlus size={20} />}
              onClick={handleAdd}
              className="h-10 px-5 rounded-xl"
            >
              Tambah FAQ
            </Button>
          </div>
        </div>

        <TableWrapper data={getList} columns={columns} />
      </div>

      <Dialog
        header={formData.id ? 'Edit FAQ Chatbot' : 'Tambah FAQ Chatbot'}
        visible={visible}
        onClose={() => setVisible(false)}
        onConfirm={onSubmit}
        confirmBtn={
          <Button theme="primary" loading={isSubmitting} onClick={onSubmit}>
            Simpan
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
            <Input
              value={toPlainText(formData.question)}
              onChange={(val) => setFormData((prev) => ({ ...prev, question: toPlainText(val) }))}
              placeholder="Masukkan pertanyaan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban</label>
            <textarea
              value={toPlainText(formData.answer)}
              onChange={(event) => setFormData((prev) => ({ ...prev, answer: event.target.value }))}
              placeholder="Masukkan jawaban"
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <Input
              value={String(formData.orderNo)}
              onChange={(val) => {
                const parsed = Number(String(val).replace(/[^0-9]/g, ''));
                setFormData((prev) => ({ ...prev, orderNo: Number.isNaN(parsed) ? 0 : parsed }));
              }}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aktif</label>
            <Switch
              value={formData.isActive}
              onChange={(val) => setFormData((prev) => ({ ...prev, isActive: Boolean(val) }))}
            />
          </div>
        </div>
      </Dialog>
    </section>
  );
}
