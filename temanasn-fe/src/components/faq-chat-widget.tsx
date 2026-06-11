import { useEffect, useMemo, useRef, useState } from 'react';
import { IconMessageCircle2, IconX, IconChevronLeft } from '@tabler/icons-react';
import { getData } from '@/utils/axios';

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  isHtml?: boolean;
};

const introMessages: ChatMessage[] = [
  {
    id: 'intro-1',
    role: 'assistant',
    text: 'Halo! Selamat datang di MeraihNIP. Aku asisten virtual yang siap bantu kamu.',
  },
  {
    id: 'intro-2',
    role: 'assistant',
    text: 'Pilih salah satu pertanyaan di bawah ya. Kalau butuh bantuan lebih lanjut, kamu bisa hubungi admin lewat WhatsApp.',
  },
];

export default function FaqChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(introMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [waNumber, setWaNumber] = useState('628567898329');
  const [optionsVisible, setOptionsVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingScrollTargetRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldFetch = useMemo(() => isOpen && faqs.length === 0 && !isLoading, [isOpen, faqs.length, isLoading]);

  useEffect(() => {
    const targetId = pendingScrollTargetRef.current;

    if (targetId) {
      const targetElement = messageRefs.current[targetId];

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        pendingScrollTargetRef.current = null;
        return;
      }
    }

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  const toAnswerHtml = (text: string) => {
    // Keep admin-provided HTML, but also support plain text with Enter/newline.
    return text.replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    const fetchFaq = async () => {
      setIsLoading(true);
      const [faqResult, waResult] = await Promise.all([
        getData<{ list: FaqItem[] }>('faq-chatbot?take=10'),
        getData<{ nomor?: string }>('whatsapp-admin/public'),
      ]);

      if (!(waResult as any)?.error && (waResult as any)?.nomor) {
        setWaNumber((waResult as any).nomor);
      }

      if ((faqResult as any)?.error) {
        setFaqs([]);
        setIsLoading(false);
        return;
      }

      const list = (faqResult as { list?: FaqItem[] })?.list || [];
      setFaqs(list);
      setIsLoading(false);
    };

    if (shouldFetch) {
      fetchFaq();
    }
  }, [shouldFetch]);

  const handleSelectQuestion = (item: FaqItem) => {
    if (isTyping) return;

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    const interactionId = `${Date.now()}-${item.id}`;
    const userMessageId = `user-${interactionId}`;
    const assistantMessageId = `assistant-${interactionId}`;
    pendingScrollTargetRef.current = userMessageId;

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: 'user',
        text: item.question,
      },
    ]);

    setIsTyping(true);

    const delay = 1000 + Math.floor(Math.random() * 1000);
    typingTimerRef.current = setTimeout(() => {
      pendingScrollTargetRef.current = assistantMessageId;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          text: item.answer,
          isHtml: true,
        },
      ]);
      setIsTyping(false);
      typingTimerRef.current = null;
    }, delay);
  };

  const handleOpenWhatsapp = () => {
    const clean = waNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const resetChat = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setMessages(introMessages);
    setOptionsVisible(true);
  };

  return (
    <div className="fixed right-4 bottom-6 z-[120]">
      {isOpen && (
        <div className="w-[340px] max-w-[calc(100vw-2rem)] mb-3 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="px-3 py-3 bg-white border-b border-gray-100 text-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                onClick={resetChat}
                aria-label="Reset chat"
              >
                <IconChevronLeft size={18} />
              </button>
              <p className="text-sm font-semibold">Asisten MeraihNIP</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Tutup chat"
              type="button"
            >
              <IconX size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="h-[420px] overflow-y-auto p-3 bg-[#f5f7fb]">
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  ref={(element) => {
                    messageRefs.current[msg.id] = element;
                  }}
                  className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] text-[13px] leading-relaxed px-3 py-2 rounded-2xl ${
                      msg.role === 'assistant'
                        ? 'bg-white text-gray-700 border border-gray-200'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {msg.isHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: toAnswerHtml(msg.text) }} />
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] text-[13px] leading-relaxed px-3 py-2 rounded-2xl bg-white text-gray-700 border border-gray-200 inline-flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">Asisten sedang mengetik</span>
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isLoading && (
              <p className="text-sm text-gray-500 px-1 py-3">Memuat FAQ...</p>
            )}

            {!isLoading && optionsVisible && (
              <div className="mt-3 bg-white rounded-2xl border border-[#dce2ee] p-3">
                <p className="text-center text-xs text-gray-500 mb-2">Pilih pertanyaan cepat</p>
                <div className="space-y-2">
                  {faqs.length > 0 ? (
                    faqs.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectQuestion(item)}
                        disabled={isTyping}
                        className="w-full text-left px-3 py-2 text-[12px] font-medium rounded-xl border border-[#8ed8d0] text-[#0f766e] hover:bg-[#edf9f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {item.question}
                      </button>
                    ))
                  ) : (
                    <p className="text-[12px] text-gray-500 text-center py-2">
                      Belum ada FAQ aktif. Silakan tambah dari panel admin.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenWhatsapp}
                    className="w-full text-left px-3 py-2 text-[12px] font-semibold rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Hubungi Admin MeraihNIP (WhatsApp)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setOptionsVisible(false)}
                  className="w-full mt-3 text-[11px] text-[#94a3b8] font-semibold"
                >
                  Sembunyikan
                </button>
              </div>
            )}

            {!isLoading && !optionsVisible && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setOptionsVisible(true)}
                  className="text-[11px] text-[#94a3b8] font-semibold"
                >
                  Tampilkan pilihan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ml-auto h-14 w-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:brightness-95 transition"
        aria-label="Buka FAQ"
      >
        <IconMessageCircle2 size={26} />
      </button>
    </div>
  );
}