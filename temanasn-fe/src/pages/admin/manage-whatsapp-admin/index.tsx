import { useState } from 'react';
import { 
  Button, 
  Dialog, 
  Form, 
  Input, 
  MessagePlugin, 
  Popconfirm 
} from 'tdesign-react';
import { 
  IconPencil, 
  IconPlus, 
  IconTrash 
} from '@tabler/icons-react';
import moment from 'moment';
import useGetList from '@/hooks/use-get-list';
import TableWrapper from '@/components/table';
import BreadCrumb from '@/components/breadcrumb';
import FetchAPI from '@/utils/fetch-api';
import { postData, putData, deleteData } from '@/utils/axios';

const { FormItem } = Form;

export default function ManageWhatsappAdmin() {
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ id: null, nomor: '' });

  const getList = useGetList({
    url: 'admin/whatsapp-admin/get',
    initialParams: {
      skip: 0,
      take: 10,
    },
  });

  const handleEdit = (row: any) => {
    setFormData({ id: row.id, nomor: row.nomor });
    setVisible(true);
  };

  const handleAdd = () => {
    setFormData({ id: null, nomor: '' });
    setVisible(true);
  };

  const handleDelete = async (id: number) => {
    FetchAPI(deleteData(`admin/whatsapp-admin/delete/${id}`)).then(() => {
      MessagePlugin.success('Nomor berhasil dihapus');
      getList.refresh();
    });
  };

  const onSubmit = async () => {
    if (!formData.nomor) {
      MessagePlugin.warning('Nomor WhatsApp harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      if (formData.id) {
        await putData(`admin/whatsapp-admin/update/${formData.id}`, { nomor: formData.nomor });
        MessagePlugin.success('Nomor berhasil diperbarui');
      } else {
        await postData('admin/whatsapp-admin/create', { nomor: formData.nomor });
        MessagePlugin.success('Nomor berhasil ditambahkan');
      }
      setVisible(false);
      getList.refresh();
    } catch (error) {
      console.error(error);
      MessagePlugin.error('Gagal menyimpan data');
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
      colKey: 'nomor',
      title: 'Nomor WhatsApp',
      cell: ({ row }: any) => <span className="font-bold text-indigo-950">{row.nomor}</span>,
    },
    {
      colKey: 'createdAt',
      title: 'Dibuat Pada',
      cell: ({ row }: any) => <span>{moment(row.createdAt).format('DD MMM YYYY, HH:mm')}</span>,
    },
    {
      colKey: 'action',
      title: 'Aksi',
      align: 'center' as const,
      width: 150,
      cell: ({ row }: any) => (
        <div className="flex justify-center gap-3">
          <Button shape="circle" theme="default" onClick={() => handleEdit(row)}>
            <IconPencil size={14} />
          </Button>
          <Popconfirm content="Hapus nomor ini?" theme="danger" onConfirm={() => handleDelete(row.id)}>
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
          { name: 'Manage Whatsapp', link: '#' },
        ]}
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm mt-6">
        <div className="flex justify-between items-center mb-8 border-b pb-5">
          <div>
            <h1 className="text-2xl font-bold text-indigo-950">Manage Whatsapp Admin</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola nomor WhatsApp admin yang akan tampil di halaman login user.</p>
          </div>
          <Button 
            theme="primary" 
            icon={<IconPlus size={20} />}
            onClick={handleAdd}
            className="bg-indigo-600 h-12 px-6 rounded-xl shadow-lg shadow-indigo-100"
          >
            Tambah Nomor
          </Button>
        </div>

        <TableWrapper data={getList} columns={columns} />
      </div>

      <Dialog
        header={formData.id ? 'Edit Nomor WhatsApp' : 'Tambah Nomor WhatsApp'}
        visible={visible}
        onClose={() => setVisible(false)}
        onConfirm={onSubmit}
        confirmBtn={
            <Button theme="primary" loading={isSubmitting} onClick={onSubmit}>
                Simpan
            </Button>
        }
      >
        <Form>
          <FormItem label="Nomor WhatsApp" name="nomor">
            <Input
              value={formData.nomor}
              onChange={(val) => setFormData({ ...formData, nomor: val })}
              placeholder="Contoh: 628567898329"
            />
            <p className="text-[10px] text-gray-400 mt-2 italic">* Gunakan format kode negara (62)</p>
          </FormItem>
        </Form>
      </Dialog>
    </section>
  );
}
