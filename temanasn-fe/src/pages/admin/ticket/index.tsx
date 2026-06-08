import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconFileSpreadsheet,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { Button, Popconfirm } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import ManageTicket from './manage';
import { deleteData, getExcel, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import Modal from '@/components/Modal';
import { IconMessage, IconHeadset, IconUser, IconSend, IconTrash } from '@tabler/icons-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import { getData } from '@/utils/axios';

enum FilterType {
  Input = 'input',
}
enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export default function TicketIndex() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<any>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();

  const dataTicket = useGetList({
    url: 'admin/ticket',
    initialParams: {
      skip: 0,
      take: 10,
    },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/ticket/${id}`)).then(() => {
      dataTicket.refresh();
    });
  };

  const handleExportExcel = async () => {
    await getExcel('admin/ticket/export', 'tickets');
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setIsSending(true);
    try {
      const res: any = await postData(`chat-ticket`, {
        ticketId: selectedTicket.id,
        userId: user.id,
        message: newMessage,
      });

      if (res.error) {
        toast.error(res.message || 'Gagal mengirim pesan');
        return;
      }

      toast.success('Pesan terkirim');
      setNewMessage('');
      fetchMessages(selectedTicket.id);
      dataTicket.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      const res = await getData(`chat-ticket/${ticketId}`);
      if (res && res.list) {
        setMessages(res.list);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm('Hapus pesan ini?')) return;
    try {
      const res: any = await deleteData(`chat-ticket/${messageId}`);
      if (res.error) {
        toast.error(res.message || 'Gagal menghapus pesan');
        return;
      }
      toast.success('Pesan dihapus');
      if (selectedTicket) fetchMessages(selectedTicket.id);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
  {
    colKey: 'index',
    title: '#',
    width: 60,
    cell: (row: any) => {
      return <span>{row.rowIndex + 1 + dataTicket.params.skip}</span>;
    },
  },
  {
    title: 'Title',
    colKey: 'title',
    filter: {
      type: FilterType.Input,
      resetValue: '',
      confirmEvents: ['onEnter'],
      props: { placeholder: 'Input Title' },
      showConfirmAndReset: true,
    },
  },
  {
    title: 'Description',
    colKey: 'description',
    cell: ({ row }: any) => {
      const text = row.description || '-';
      const urlRegex = /(https?:\/\/[^\s]+)/g;

      // pecah string jadi bagian teks & url
      const parts = text.split(urlRegex);

      return (
        <span>
          {parts.map((part: string, idx: number) =>
            urlRegex.test(part) ? (
              <a
                key={idx}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {part}
              </a>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </span>
      );
    },
    filter: {
      type: FilterType.Input,
      resetValue: '',
      confirmEvents: ['onEnter'],
      props: { placeholder: 'Input Description' },
      showConfirmAndReset: true,
    },
  },
  {
    title: 'Category',
    colKey: 'category',
    filter: {
      type: FilterType.Input,
      resetValue: '',
      confirmEvents: ['onEnter'],
      props: { placeholder: 'Input Category' },
      showConfirmAndReset: true,
    },
  },
  {
    title: 'Status',
    colKey: 'status',
    filter: {
      type: FilterType.Input,
      resetValue: '',
      confirmEvents: ['onEnter'],
      props: { placeholder: 'Input Status' },
      showConfirmAndReset: true,
    },
  },
  {
    title: 'User Email',
    colKey: 'userEmail',
    cell: ({ row }: any) => {
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
    title: 'Link',
    colKey: 'link',
    cell: ({ row }: any) => {
      if (!row.image) return <span>-</span>;

      return (
        <a
          href={row.image}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {row.image}
        </a>
      );
    },
  },

  {
    title: 'Admin Response',
    colKey: 'adminResponse',
    cell: ({ row }: any) => {
      const text = row.adminResponse || '-';
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = text.split(urlRegex);

      return (
        <span>
          {parts.map((part: string, idx: number) =>
            urlRegex.test(part) ? (
              <a
                key={idx}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 underline"
              >
                {part}
              </a>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </span>
      );
    },
    filter: {
      type: FilterType.Input,
      resetValue: '',
      confirmEvents: ['onEnter'],
      props: { placeholder: 'Input Admin Response' },
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
            theme="primary"
            variant="dashed"
            onClick={() => {
              setSelectedTicket(row);
              setIsChatOpen(true);
              fetchMessages(row.id);
            }}
          >
            <IconMessage size={14} />
          </Button>
          <Button
            shape="circle"
            theme="default"
            onClick={() => {
              setDetail(() => ({
                ...row,
                id: row.id || '',   // gunakan id ticket
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
        <ManageTicket
          setDetail={setDetail}
          params={dataTicket}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      <BreadCrumb
        page={[{ name: 'Manage Ticket', link: '/manage-ticket' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5">
              Manage Ticket
            </h1>
            <div className="flex gap-3">
              <Button
                theme="primary"
                size="large"
                variant="dashed"
                onClick={handleExportExcel}
                className="hover:shadow-xl"
              >
                <IconFileSpreadsheet size={20} />
              </Button>
              <Button
                theme="default"
                size="large"
                className="border-success hover:bg-success hover:text-white group hover:shadow-xl"
                onClick={() => setVisible(true)}
              >
                <IconPlus
                  size={20}
                  className="text-success group-hover:text-white"
                />
              </Button>
            </div>
          </div>
        </div>
        <TableWrapper data={dataTicket} columns={columns} />
      </div>

      {/* Chat Modal for Admin */}
      <Modal
        visible={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSelectedTicket(null);
          setMessages([]);
          setNewMessage('');
        }}
        title={`Replying Ticket: ${selectedTicket?.title || ''}`}
        className="max-w-2xl"
      >
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg border border-gray-100">
            {selectedTicket && (
              <div className="space-y-4">
                {/* User Message (Initial Description) */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <IconUser size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="bg-indigo-900 text-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                      <p className="text-sm font-semibold mb-1 text-indigo-50">{selectedTicket.user?.name || 'User'} (Tiket Awal)</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {moment(selectedTicket.createdAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages from API */}
                {messages.map((msg) => {
                  const isAdmin = msg.user.role === 'ADMIN';
                  const isMe = msg.userId === user?.id;
                  
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isAdmin ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isAdmin ? <IconHeadset size={18} /> : <IconUser size={18} />}
                      </div>
                      <div className={`flex-1 flex ${isAdmin ? 'justify-end' : ''}`}>
                        <div className={`p-3 rounded-lg shadow-sm max-w-[85%] relative group ${
                          isAdmin 
                            ? 'bg-white border border-indigo-100 text-gray-800 rounded-tr-none' 
                            : 'bg-indigo-900 text-white rounded-tl-none'
                        }`}>
                          <p className={`text-sm font-semibold mb-1 ${isAdmin ? 'text-indigo-700' : 'text-indigo-50'}`}>
                            {isAdmin ? (isMe ? 'Anda (Admin Support)' : 'Admin Support') : (msg.user.name || 'User')}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] ${isAdmin ? 'text-gray-400' : 'opacity-70'}`}>
                              {moment(msg.createdAt).format('DD/MM/YYYY HH:mm')}
                            </span>
                            {/* Admin can delete any message in this view, or just their own? 
                                Usually admin can delete anything for moderation. Let's allow admin to delete any message. */}
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className={`opacity-0 group-hover:opacity-100 p-1 hover:scale-110 transition-all ${
                                isAdmin ? 'text-red-400' : 'text-red-300'
                              }`}
                            >
                              <IconTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {messages.length === 0 && !selectedTicket.adminResponse && (
                  <div className="text-center py-8">
                    <div className="inline-block px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100">
                      Belum ada balasan baru...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message Input for Admin */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Balas tiket ini..."
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !newMessage.trim()}
                className="bg-indigo-900 text-white p-2.5 rounded-lg hover:bg-indigo-800 transition-all flex items-center justify-center"
              >
                <IconSend size={20} className={isSending ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  );
}