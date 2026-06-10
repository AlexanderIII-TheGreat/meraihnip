import { useState, useEffect } from 'react';
import { getData, postData, deleteData } from '@/utils/axios';
import { IconMessage, IconUser, IconHeadset, IconSend, IconTrash, IconPlus, IconBell, IconArrowLeft, IconChevronRight, IconClock } from '@tabler/icons-react';
import TicketForm from './TicketForm';
import Modal from '@/components/Modal';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/stores/auth-store';
import moment from 'moment';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  email: string;
}

interface ChatMessage {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

interface Ticket {
  id: number;
  userId: number;
  title: string;
  description: string;
  category?: string | null;
  status: string;
  image?: string | null;
  adminResponse?: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

const TicketList: React.FC = () => {
  const isMobile = useIsMobile();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [faqs, setFaqs] = useState<Array<{ id: number; question: string; answer: string }>>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [waNumber, setWaNumber] = useState<string>('628567898329');
  const { user } = useAuthStore();

  const fetchTickets = async () => {
    try {
      const auth = localStorage.getItem("authentication");
      let userId = null;

      if (auth) {
        const parsed = JSON.parse(auth);
        userId = parsed.state?.user?.id;
      }

      if (!userId) {
        setError("User ID tidak ditemukan. Silakan login ulang.");
        return;
      }

      const res = await getData(
        `admin/ticket/user?userId=${userId}&sortBy=updatedAt&descending=true&_=${Date.now()}`
      );

      if (!res || !res.list) {
        setError(res.msg || "Failed to fetch tickets.");
        return;
      }

      setTickets(res.list);
    } catch (err: any) {
      console.error("Fetch tickets error:", err.message, err.stack);
      setError("An error occurred while fetching tickets.");
    }
  };

useEffect(() => {
  console.log("Updated Tickets:", tickets);
}, [tickets]);

  const fetchFaqs = async () => {
    try {
      const res = await getData<{ list: any[] }>('faq-chatbot');
      if (res && !(res as any).error) {
        setFaqs((res as any).list || []);
      }
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    }
  };

  // hanya sekali jalan saat mount
  useEffect(() => {
    fetchTickets();
    fetchFaqs();
    getData('whatsapp-admin/public')
      .then((res: any) => {
        if (res?.nomor) {
          setWaNumber(res.nomor);
        }
      })
      .catch((err) => console.error('Failed to fetch WA number', err));
  }, []);

  const toggleFaq = (id: number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const renderFaqSection = () => {
    if (faqs.length === 0) return null;

    return (
      <div className="mb-10 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-bold text-indigo-950 tracking-tight">Bantuan</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">Pertanyaan yang sering diajukan</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {faqs.map((faq) => {
            const isExpanded = expandedFaqId === faq.id;
            return (
              <div 
                key={faq.id} 
                className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-100 hover:shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full py-4 px-5 flex items-center justify-between text-left font-bold text-indigo-950 text-sm hover:bg-blue-50/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-600 font-black">
                      {isExpanded ? 'v ' : '> '}
                    </span>
                    {faq.question}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 text-xs font-medium text-gray-500 border-t border-gray-50 bg-gray-50/30 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    fetchTickets(); // refresh lagi setelah modal close
  };

  const openChat = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsChatOpen(true);
    fetchMessages(ticket.id);
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

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedTicket(null);
    setMessages([]);
    setNewMessage('');
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
      fetchTickets(); // Refresh ticket list to update updatedAt order
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat mengirim pesan');
    } finally {
      setIsSending(false);
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 -mx-4 -mt-4 overflow-x-hidden">
        {/* Sticky Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 border-b">
          <Link to="/" className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-indigo-950">Layanan Bantuan</h1>
          <button className="text-indigo-950 p-1">
            <IconBell size={24} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* FAQ Accordion */}
          {renderFaqSection()}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={openModal}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-[0.98] transition-all"
            >
              <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <IconPlus size={16} stroke={3} />
              </div>
              Buat Tiket Baru
            </button>
            <button
              onClick={() => window.open(`https://wa.me/${waNumber}`, '_blank')}
              className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-[0.98] transition-all"
            >
              <IconMessage size={20} />
              Hubungi Chat WA
            </button>
          </div>

          {/* Active Summary */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-indigo-950 tracking-tight uppercase">Tiket Saya</h2>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full uppercase">
              {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length} Tiket Aktif
            </span>
          </div>

          {/* Ticket Cards */}
          <div className="flex flex-col gap-5">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.99]">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-blue-600 tracking-wider">#TK-{String(ticket.id).padStart(5, '0')}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      ticket.status === 'open' ? 'bg-blue-50 text-blue-600' :
                      ticket.status === 'in_progress' ? 'bg-orange-50 text-orange-600' :
                      ticket.status === 'resolved' ? 'bg-green-50 text-green-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {ticket.status === 'in_progress' ? 'PROSES' : 
                       ticket.status === 'resolved' ? 'SELESAI' : 
                       ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-black text-indigo-950 leading-snug">{ticket.title}</h3>
                    <div className="flex items-center gap-1 text-gray-400">
                      <IconHeadset size={14} />
                      <span className="text-xs font-bold tracking-tight">Kategori: <span className="text-gray-600">{ticket.category || 'N/A'}</span></span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border-l-[3px] border-blue-400">
                    <p className="text-xs font-medium text-gray-500 italic line-clamp-2 leading-relaxed">
                      "{ticket.adminResponse || ticket.description}"
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-1 border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <IconClock size={14} />
                      <span className="text-[10px] font-bold">{moment(ticket.createdAt).format('DD MMM YYYY, HH:mm')}</span>
                    </div>
                    <button
                      onClick={() => openChat(ticket)}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"
                    >
                      Lihat Detail <IconChevronRight size={12} stroke={3} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                  <IconHeadset size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-indigo-950">Belum ada tiket</h3>
                  <p className="text-xs font-medium text-gray-400 leading-relaxed px-4">Jika Anda memiliki kendala, silakan buat tiket bantuan baru.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Ticket Modal Backdrop for Mobile */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center transition-opacity duration-300">
            <div className="bg-white w-full sm:max-w-xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden animate-slide-up shadow-2xl">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-indigo-950">Buat Tiket Baru</h2>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">&times;</button>
              </div>
              <div className="p-6 pb-32 sm:pb-6 max-h-[85vh] overflow-y-auto no-scrollbar">
                <TicketForm closeModal={closeModal} />
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal for Mobile */}
        <Modal
          visible={isChatOpen}
          onClose={closeChat}
          title={`Detail Tiket #${String(selectedTicket?.id).padStart(5, '0')}`}
          className="max-w-2xl"
        >
          <div className="flex flex-col h-[75vh] sm:h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50/50 no-scrollbar">
              {selectedTicket && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-1 mb-2 px-1">
                    <h2 className="text-base font-black text-indigo-950 leading-tight">{selectedTicket.title}</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedTicket.category || 'UMUM'}</span>
                  </div>

                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 flex justify-end">
                      <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]">
                        <p className="text-[10px] font-black opacity-70 mb-1 uppercase tracking-widest">Laporan Awal</p>
                        <p className="text-sm font-medium leading-relaxed">{selectedTicket.description}</p>
                        <span className="text-[10px] opacity-70 mt-2 block font-bold">
                          {moment(selectedTicket.createdAt).format('DD MMM, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Percakapan</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  {messages.map((msg) => {
                    const isMe = msg.userId === user?.id;
                    return (
                      <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isMe ? 'bg-blue-100 text-blue-700 font-bold text-xs' : 'bg-white border border-gray-100 text-indigo-950'
                        }`}>
                          {msg.user.role === 'ADMIN' ? <IconHeadset size={18} /> : <span>{msg.user.name.charAt(0)}</span>}
                        </div>
                        <div className={`flex-1 flex ${isMe ? 'justify-end' : ''}`}>
                          <div className={`p-4 rounded-2xl shadow-sm max-w-[85%] relative group ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                          }`}>
                            <p className="text-[10px] font-black mb-1 uppercase tracking-widest opacity-70">
                              {isMe ? 'Anda' : (msg.user.role === 'ADMIN' ? 'Admin Support' : msg.user.name)}
                            </p>
                            <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-[10px] font-bold ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                                {moment(msg.createdAt).format('DD MMM, HH:mm')}
                              </span>
                              {isMe && (
                                <button 
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-100 p-1"
                                >
                                  <IconTrash size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {messages.length === 0 && (
                    <div className="py-8 text-center">
                       <p className="text-[11px] font-bold text-gray-400 italic">Menunggu balasan dari tim support...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 pt-4 pb-32 sm:pb-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik balasan Anda..."
                  className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold text-indigo-950 placeholder:text-gray-300"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
                >
                  <IconSend size={22} stroke={3} />
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      {/* FAQ Accordion */}
      {renderFaqSection()}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-950">My Tickets</h1>
        <div className="flex gap-3">
          <button
            onClick={() => window.open(`https://wa.me/${waNumber}`, '_blank')}
            className="py-2 px-4 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-all flex items-center gap-2 font-bold text-sm"
          >
            <IconMessage size={18} />
            Hubungi Chat WA
          </button>
          <button
            onClick={openModal}
            className="py-2 px-4 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 transition-all font-bold text-sm"
          >
            Create New Ticket
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center text-gray-600">No tickets found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">ID</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Title</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Category</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Status</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Admin Response</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Lampiran</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Created At</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{ticket.id}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{ticket.title}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">{ticket.category || 'N/A'}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : ''}
                        ${ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : ''}
                        ${ticket.status === 'closed' ? 'bg-gray-100 text-gray-700' : ''}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    {ticket.adminResponse || 'No response'}
                  </td>
                  <td className="py-2 px-4 border-b text-sm">
                      {ticket.image ? (
                        <a
                          href={ticket.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Image
                        </a>
                      ) : (
                        'No Image'
                      )}
                    </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b text-sm text-gray-700">
                    <button
                      onClick={() => openChat(ticket)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-indigo-900"
                      title="View Conversation"
                    >
                      <IconMessage size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isChatOpen}
        onClose={closeChat}
        title={`Ticket: ${selectedTicket?.title || ''}`}
        className="max-w-2xl"
      >
        <div className="flex flex-col h-[500px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg border border-gray-100">
            {selectedTicket && (
              <div className="space-y-4">
                {/* Initial Description from Ticket - Fixed to Right */}
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <IconUser size={18} />
                  </div>
                  <div className="flex-1 flex justify-end">
                    <div className="bg-indigo-900 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-[85%]">
                      <p className="text-sm font-semibold mb-1">Anda (Tiket Awal)</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {moment(selectedTicket.createdAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chat Messages from API */}
                {messages.map((msg) => {
                  const isMe = msg.userId === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {msg.user.role === 'ADMIN' ? <IconHeadset size={18} /> : <IconUser size={18} />}
                      </div>
                      <div className={`flex-1 flex ${isMe ? 'justify-end' : ''}`}>
                        <div className={`p-3 rounded-lg shadow-sm max-w-[85%] relative group ${
                          isMe 
                            ? 'bg-indigo-900 text-white rounded-tr-none' 
                            : 'bg-white border border-emerald-100 text-gray-800 rounded-tl-none'
                        }`}>
                          <p className="text-sm font-semibold mb-1">
                            {isMe ? 'Anda' : (msg.user.role === 'ADMIN' ? 'Admin Support' : msg.user.name)}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] ${isMe ? 'opacity-70' : 'text-gray-400'}`}>
                              {moment(msg.createdAt).format('DD/MM/YYYY HH:mm')}
                            </span>
                            {isMe && (
                              <button 
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-100 p-1"
                              >
                                <IconTrash size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {messages.length === 0 && !selectedTicket.adminResponse && (
                  <div className="text-center py-8">
                    <div className="inline-block px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100">
                      Menunggu respon dari admin...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message Input */}
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
                placeholder="Tulis pesan atau balasan..."
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
            <p className="text-[10px] text-gray-400 mt-2">
              Pesan Anda akan ditambahkan ke detail tiket ini.
            </p>
          </div>
        </div>
      </Modal>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-indigo-950">Create a New Ticket</h2>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <TicketForm closeModal={closeModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
