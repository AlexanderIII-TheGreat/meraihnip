import Form from '@/components/form';
import Input from '@/components/input';
import { useAuthStore } from '@/stores/auth-store';
import { postData, getData, deleteData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';
import { jsonToFormData } from '@/utils/json-to-form-data';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Tabs, Table, Input as TInput, MessagePlugin, Badge, Select, Popconfirm } from 'tdesign-react';
import Modal from '@/components/Modal';
import { IconShare, IconBuildingBank, IconNote, IconArrowLeft, IconCopy, IconLink, IconWallet, IconCash, IconBulb, IconChevronRight, IconChevronLeft, IconUsers, IconLock, IconUserCircle, IconLogout, IconSettings } from '@tabler/icons-react';
import moment from 'moment';
import UserAvatar from '@/components/user-avatar';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { Link } from 'react-router-dom';
import useGetList from '@/hooks/use-get-list';

export default function Empty() {
  const isMobile = useIsMobile();
  const account = useAuthStore((state) => state.user);
  const { login } = useAuthStore();
  const [image, setImage] = useState<any>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<{ code?: boolean; link?: boolean }>({});

  const [referrals, setReferrals] = useState([]);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  
  // Modal Withdraw
  const [modalBalance, setModalBalance] = useState(0);
  const [modalBalanceFormatted, setModalBalanceFormatted] = useState('0');
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [paymentDestination, setPaymentDestination] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal History
  const [historyVisible, setHistoryVisible] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [summary, setSummary] = useState({
    total_withdrawals: 0,
    total_approved: 0,
    total_approved_formatted: '0',
    total_pending: 0,
    total_rejected: 0,
  });

  // Tab dari URL
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const missingWa = searchParams.get('missing_wa');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'akun');
  const navigate = useNavigate();

  const dataLogs = useGetList({
    url: 'user-activity/audit',
    initialParams: {
      userId: account?.id,
      skip: 0,
      take: 10,
      disabled: !account?.id,
    },
  });

  useEffect(() => {
    if (account?.id) {
      dataLogs.setParams((prev: any) => ({ ...prev, userId: account.id, disabled: false }));
    }
  }, [account]);

  const handleClearProfileLogs = async () => {
    const res: any = await deleteData('user-activity/clear');
    if (res && !res.error) {
      MessagePlugin.success('Log Anda berhasil dihapus');
      dataLogs.refresh();
    } else {
      MessagePlugin.error(res.message || 'Gagal menghapus log');
    }
  };

  // Update tab dari URL
  useEffect(() => {
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // Alert for missing WhatsApp
  useEffect(() => {
    if (missingWa === 'true') {
      MessagePlugin.warning({
        content: 'Silakan melengkapi nomor WhatsApp Anda untuk melanjutkan.',
        duration: 5000,
      });
    }
  }, [missingWa]);

  // Load data affiliate saat login
  useEffect(() => {
    if (account?.id) {
      getData(`admin/affiliate/${account.id}`).then((res) => {
        console.log('data affiliate', res);
        setReferrals(res.referrals || []);
        setTotalWithdrawn(parseInt(res.total_withdrawn || '0', 10));
        setPendingWithdrawals(res.pending_withdrawals || []);
      });
    }
  }, [account]);

  // === Wilayah State ===
  const [provinces, setProvinces] = useState<any[]>([]);
  const [regencies, setRegencies] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [selectedProvId, setSelectedProvId] = useState<string>("");
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>("");

  // Load Provinces
  useEffect(() => {
    fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
      .then(res => {
        console.log("Raw response status:", res.status);
        return res.json();
      })
      .then(data => {
        console.log("Provinces loaded:", data);
        // Emsifa returns array directly: [{id: "11", name: "ACEH"}, ...]
        if (Array.isArray(data)) {
          setProvinces(data.map((p: any) => ({ label: p.name, value: p.name, code: p.id })));
        }
      })
      .catch(err => console.error("Error loading provinces", err));
  }, []);

  // Initialize region selection from account data
  useEffect(() => {
    if (account?.provinsi && provinces.length > 0 && !selectedProvId) {
       const prov = provinces.find(p => p.label === account.provinsi);
       if (prov) setSelectedProvId(prov.code);
    }
  }, [account, provinces]);

  useEffect(() => {
    if (account?.kabupaten && regencies.length > 0 && !selectedRegencyId) {
       const reg = regencies.find(r => r.label === account.kabupaten);
       if (reg) setSelectedRegencyId(reg.code);
    }
  }, [account, regencies]);

  // Load Regencies when Province changes
  useEffect(() => {
    if (!selectedProvId) {
      setRegencies([]);
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvId}.json`)
      .then(res => res.json())
      .then(data => {
        console.log("Regencies loaded:", data);
        if (Array.isArray(data)) {
          setRegencies(data.map((r: any) => ({ label: r.name, value: r.name, code: r.id })));
        }
      })
      .catch(err => console.error("Error loading regencies", err));
  }, [selectedProvId]);

  // Load Districts when Regency changes
  useEffect(() => {
    if (!selectedRegencyId) {
      setDistricts([]);
      return;
    }
    fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegencyId}.json`)
      .then(res => res.json())
      .then(data => {
        console.log("Districts loaded:", data);
        if (Array.isArray(data)) {
          setDistricts(data.map((d: any) => ({ label: d.name, value: d.name, code: d.id })));
        }
      })
      .catch(err => console.error("Error loading districts", err));
  }, [selectedRegencyId]);

  // === Fetch SALDO saat modal withdraw dibuka ===
  useEffect(() => {
    if (withdrawVisible && account?.id) {
      setModalBalance(0);
      setModalBalanceFormatted('0');

      FetchAPI(postData('user/affiliateuser', { userId: account.id }))
        .then((res) => {
          console.log('saldo affiliate user untuk withdraw', res);
          const data = res?.data || res;
          const balanceObj = data?.data?.balance || data?.balance || {};
          const current = parseInt(balanceObj.current || balanceObj || '0', 10);
          const formatted = balanceObj.formatted || current.toLocaleString('id-ID');

          setModalBalance(current);
          setModalBalanceFormatted(formatted);
        })
        .catch((err) => {
          console.error('Error fetching affiliate balance:', err);
          MessagePlugin.error({
            content: 'Gagal memuat saldo affiliate. Silakan coba lagi.',
            duration: 3000,
          });

          const fallback = parseInt(String(account?.affiliateBalance || '0'), 10);
          setModalBalance(fallback);
          setModalBalanceFormatted(fallback.toLocaleString('id-ID'));
        });
    } else if (!withdrawVisible) {
      setModalBalance(0);
      setModalBalanceFormatted('0');
      setWithdrawAmount('');
      setWithdrawNotes('');
      setPaymentDestination('');
    }
  }, [withdrawVisible, account?.id]);

  // Fetch HISTORY saat modal history dibuka
useEffect(() => {
  if (historyVisible && account?.id) {
    setWithdrawHistory([]);
    setSummary({
      total_withdrawals: 0,
      total_approved: 0,
      total_approved_formatted: '0',
      total_pending: 0,
      total_rejected: 0,
    });

    FetchAPI(postData('user/history/withdraw', { userId: account.id }))
      .then((res) => {
        console.log('riwayat withdraw (raw):', res);

        // AMBIL res.data (karena postData return result utuh)
        const data = res?.data?.data || {};

        const history = Array.isArray(data.history) ? data.history : [];
        const summaryData = data.summary || {};

        const totalApproved = parseInt(summaryData.total_approved || '0', 10);

        const formattedHistory = history.map((item: any) => ({
          ...item,
          amount: parseInt(item.amount || '0', 10),
          amount_formatted: parseInt(item.amount || '0', 10).toLocaleString('id-ID'),
          status_label: item.status_label || 
            (item.status === 'approved' ? 'Disetujui' : 
             item.status === 'rejected' ? 'Ditolak' : 'Pending'),
          created_at_formatted: item.created_at_formatted || 
            moment(item.createdAt || item.created_at).format('DD/MM/YYYY HH:mm'),
          processed_at_formatted: item.processed_at_formatted || 
            (item.processedAt ? moment(item.processedAt).format('DD/MM/YYYY HH:mm') : '-'),
        }));

        setSummary({
          total_withdrawals: parseInt(summaryData.total_withdrawals || '0', 10),
          total_approved: totalApproved,
          total_approved_formatted: totalApproved.toLocaleString('id-ID'),
          total_pending: parseInt(summaryData.total_pending || '0', 10),
          total_rejected: parseInt(summaryData.total_rejected || '0', 10),
        });

        setWithdrawHistory(formattedHistory);
      })
      .catch((err) => {
        console.error('Error fetching withdraw history:', err);
        MessagePlugin.error({
          content: 'Gagal memuat riwayat pencairan. Silakan coba lagi.',
          duration: 3000,
        });
        setHistoryVisible(false);
      });
  } else if (!historyVisible) {
    setWithdrawHistory([]);
    setSummary({
      total_withdrawals: 0,
      total_approved: 0,
      total_approved_formatted: '0',
      total_pending: 0,
      total_rejected: 0,
    });
  }
}, [historyVisible, account?.id]);

  // === Submit Form ===


const onSubmitProfil = async (data: any) => {
  const formData = jsonToFormData({ ...data, gambar: image });

  console.log("📤 DATA TERKIRIM:", Object.fromEntries(formData.entries()));

  // 🔐 Backup state lama jika gagal
  const oldState = {
    user: useAuthStore.getState().user,
    token: useAuthStore.getState().token,
  };

  try {
    const res = await FetchAPI(postData('user/change-profile', formData));

    console.log("📥 RESPONSE CHANGE PROFILE:", res);

    const newToken = res?.data?.data?.token;
    const newUser = res?.data?.data?.user;

    console.log("✅ TOKEN:", newToken);
    console.log("✅ USER:", newUser);

    // ❗ Prevent undefined → auto logout
    if (!newToken || !newUser) {
      console.warn("⚠️ API tidak mengembalikan user/token. Batal update state.");
      return;
    }

    // ✅ Update local storage lewat store
    login({
      data: {
        token: newToken,
        user: newUser
      }
    });

    console.log("🧠 LOCAL STORAGE AUTH (AFTER UPDATE):", JSON.parse(localStorage.getItem('auth-storage') || '{}'));

    navigate('/');

  } catch (err: any) {
    console.error("❌ Error update profile, mengembalikan data lama", err);

    // 🔄 Restore data lama biar tidak logout
    if (oldState.token && oldState.user) {
      login({
        data: {
          token: oldState.token,
          user: oldState.user
        }
      });
    }
  }
};


  const onSubmitPassword = async (data: any) => {
    FetchAPI(postData('user/change-password', {
      password: data.password,
      oldPassword: data.oldPassword,
    })).then(() => navigate('/'));
  };

  const handleWithdrawSubmit = async () => {
    const amount = parseInt(withdrawAmount);
    const balance = modalBalance;

    if (!amount || amount <= 0) {
      MessagePlugin.error({ content: 'Masukkan jumlah pencairan yang valid', duration: 3000 });
      return;
    }
    if (amount > balance) {
      MessagePlugin.error({ content: `Jumlah melebihi saldo (Rp ${balance.toLocaleString('id-ID')})`, duration: 3000 });
      return;
    }
    if (!paymentDestination.trim()) {
      MessagePlugin.error({ content: 'Tujuan pencairan wajib diisi', duration: 3000 });
      return;
    }

    if (!account?.id) {
      MessagePlugin.error({ content: 'Sesi anda telah berakhir. Silakan login kembali.', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    FetchAPI(postData('admin/affiliate/withdraw', {
      userId: account.id,
      amount: amountToWithdraw,
      notes: withdrawNotes,
      payload_destination: paymentDestination
    }))
      .then((res) => {
        if (res.status) {
          MessagePlugin.success({ content: res.message, duration: 3000 });
          setWithdrawVisible(false);
          if (account?.id) {
            getData(`admin/affiliate/${account.id}`).then((affRes) => {
              const data = affRes.data || affRes;
              setReferrals(data.referrals || []);
              setTotalWithdrawn(parseInt(data.total_withdrawn || '0', 10));
              setPendingWithdrawals(data.pending_withdrawals || []);
            });
          }
        } else {
          MessagePlugin.error({ content: res.message, duration: 3000 });
        }
      })
      .finally(() => setIsSubmitting(false));
  };

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ [type]: true });
      setTimeout(() => setCopied({ [type]: false }), 2000);
    }).catch(console.error);
  };

  const { TabPanel } = Tabs;

  const referralColumns = [
    { title: 'No', colKey: 'no', width: 50, cell: ({ rowIndex }: any) => rowIndex + 1 },
    { title: 'Nama User', colKey: 'name', cell: ({ row }: any) => row.name || '-' },
    { title: 'Email', colKey: 'email', cell: ({ row }: any) => row.email || '-' },
    { title: 'Tanggal Terdaftar', colKey: 'created_at', cell: ({ row }: any) => row.created_at ? moment(row.created_at).format('DD/MM/YYYY HH:mm') : '-' },
    { title: 'Jumlah Pembelian', colKey: 'pembelian_count', cell: ({ row }: any) => row.pembelian_count || 0 },
    { title: 'Total Komisi', colKey: 'total_komisi', cell: ({ row }: any) => `Rp ${(parseInt(row.total_komisi || '0', 10)).toLocaleString('id-ID')}` },
  ];

  const historyColumns = [
    { title: 'Jumlah', colKey: 'amount_formatted', width: 130, cell: ({ row }: any) => `Rp ${row.amount_formatted}` },
    {
      title: 'Status',
      colKey: 'status_label',
      width: 110,
      cell: ({ row }: any) => (
        <Badge
          color={row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : 'yellow'}
        >
          {row.status_label}
        </Badge>
      ),
    },
    { title: 'Tujuan', colKey: 'payload_destination', width: 180, cell: ({ row }: any) => row.payload_destination || '-' },
    { title: 'Catatan', colKey: 'notes', width: 150, cell: ({ row }: any) => row.notes || '-' },
    { title: 'Dibuat', colKey: 'created_at_formatted', width: 150 },
    { title: 'Diproses', colKey: 'processed_at_formatted', width: 150 },
  ];

  const logColumns = [
    {
      colKey: 'last_activity',
      title: 'Waktu',
      width: 150,
      cell: ({ row }: any) => moment(row.last_activity).format('DD MMM YYYY, HH:mm'),
    },
    {
      title: 'User',
      colKey: 'name',
      width: 200,
      cell: ({ row }: any) => {
        return (
          <div>
            <div className="font-medium text-gray-800">{row.name || '-'}</div>
            <div className="text-xs text-gray-500">{row.email || 'Guest'}</div>
          </div>
        );
      },
    },
    {
      colKey: 'action',
      title: 'Aktivitas',
      cell: ({ row }: any) => {
        const isGreen = row.action.startsWith('CREATE') || 
                        row.action === 'BUY_PAKET' || 
                        row.action.includes('START') || 
                        row.action.includes('FINISH') ||
                        row.action === 'LOGIN';
                        
        const isRed = row.action.startsWith('DELETE') || 
                      row.action === 'LOGOUT';
                      
        const isYellow = row.action.startsWith('EDIT') || 
                         row.action.startsWith('UPDATE') || 
                         row.action === 'CHANGE_PASSWORD';

        let colorClass = 'text-gray-800 bg-gray-100';
        if (isGreen) colorClass = 'text-green-800 bg-green-100';
        if (isRed) colorClass = 'text-red-800 bg-red-100';
        if (isYellow) colorClass = 'text-yellow-800 bg-yellow-100';

        const actionLabels: any = {
           LOGIN: 'LOGIN',
           LOGOUT: 'LOGOUT',
           CREATE_LATIHAN: 'CREATE LATIHAN',
           EDIT_LATIHAN: 'EDIT LATIHAN',
           DELETE_LATIHAN: 'DELETE LATIHAN',
           CREATE_PAKET_PEMBELIAN: 'CREATE PAKET PEMBELIAN',
           EDIT_PAKET_PEMBELIAN: 'EDIT PAKET PEMBELIAN',
           DELETE_PAKET_PEMBELIAN: 'DELETE PAKET PEMBELIAN',
           CREATE_SOAL_CATEGORY: 'CREATE KATEGORI SOAL',
           EDIT_SOAL_CATEGORY: 'EDIT KATEGORI SOAL',
           DELETE_SOAL_CATEGORY: 'DELETE KATEGORI SOAL',
           CREATE_USER: 'CREATE USER',
           EDIT_USER: 'EDIT USER',
           DELETE_USER: 'DELETE USER',
           UPDATE_PEMBELIAN_STATUS: 'APPROVE BAYAR',
           CHANGE_PASSWORD: 'UBAH PASSWORD',
           BUY_PAKET: 'BELI PAKET',
           START_TRYOUT: 'MULAI TRYOUT',
           FINISH_TRYOUT: 'SELESAI TRYOUT',
        };

        const label = actionLabels[row.action] || row.action;
        const needsUrl = !['LOGIN', 'LOGOUT'].includes(row.action);

        if (needsUrl) {
          return (
            <div className="flex flex-col gap-1">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${colorClass}`}>{label}</span>
              <span className="text-xs text-gray-500">{row.url || '-'}</span>
            </div>
          );
        }

        return <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${colorClass}`}>{label}</span>;
      }
    }
  ];

  // Hitung saldo dari referrals (fallback jika API balance gagal)
  const currentBalanceFromReferrals = referrals.reduce((total, r: any) => total + parseInt(r.total_komisi || '0', 10), 0);
  const balance = modalBalance > 0 ? modalBalance : currentBalanceFromReferrals;
  const balanceFormatted = modalBalanceFormatted !== '0' ? modalBalanceFormatted : `Rp ${currentBalanceFromReferrals.toLocaleString('id-ID')}`;
  const amountToWithdraw = parseInt(withdrawAmount) || 0;
  const isAmountExceedsBalance = amountToWithdraw > balance;
  const isDestinationEmpty = !paymentDestination.trim();

  // === Mobile Edit Profile (activeTab === 'profil') ===
  if (isMobile && activeTab === 'profil') {
    return (
      <div className="-mt-4 -mx-4 min-h-screen bg-gray-50 pb-20">
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b sticky top-0 z-30">
          <button onClick={() => setActiveTab('akun')} className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-indigo-950">Data Diri</h1>
          <div className="w-8"></div>
        </div>

        <div className="p-5 pb-20">
          <Form onSubmit={onSubmitProfil} defaultValues={account}>
            <div className="space-y-5">
               {/* Photo Upload */}
               <div className="flex flex-col items-center justify-center gap-3 mb-6">
                 <input type="file" id="photo-mobile" className="hidden" ref={fileInputRef} onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
                 <div className="relative">
                   <UserAvatar 
                      name={account?.name} 
                      image={image ? (typeof image === 'string' ? image : URL.createObjectURL(image)) : account?.gambar} 
                      size={100}
                      className="border-4 border-white shadow-md block"
                   />
                   <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg"
                   >
                     <IconSettings size={16} />
                   </button>
                 </div>
                 <p className="text-xs text-gray-400">Ketuk untuk mengganti foto</p>
               </div>

              <Input name="name" title="Nama Lengkap" type="text" validation={{ required: 'Nama harus diisi' }} />
              <Input name="email" title="Email" type="email" disabled />
              <Input name="noWA" title="No. WhatsApp" type="text" defaultValue={account?.noWA || ''} validation={{ pattern: { value: /^8[0-9]{9,11}$/, message: 'Format nomor telepon tidak sesuai / masukkan nomor tanpa angka "0" didepan' } }} />
              
              <Input name="alamat" title="Alamat Lengkap" type="text" validation={{ required: 'Alamat wajib diisi' }} />
              
              <Input 
                name="provinsi" 
                title="Provinsi" 
                type="select" 
                options={provinces}
                validation={{ required: 'Provinsi wajib diisi' }} 
                onChange={(val: string) => {
                  const selected = provinces.find(p => p.value === val);
                  setSelectedProvId(selected?.code || "");
                  setSelectedRegencyId(""); 
                  setRegencies([]); 
                  setDistricts([]); 
                }}
              />

              <Input 
                name="kabupaten" 
                title="Kabupaten/Kota" 
                type="select" 
                options={regencies}
                validation={{ required: 'Kabupaten wajib diisi' }} 
                onChange={(val: string) => {
                  const selected = regencies.find(r => r.value === val);
                  setSelectedRegencyId(selected?.code || "");
                  setDistricts([]); 
                }}
              />

              <Input 
                name="kecamatan" 
                title="Kecamatan" 
                type="select" 
                options={districts}
                validation={{ required: 'Kecamatan wajib diisi' }} 
              />
              
              <Input name="jurusan" title="Instansi / Jurusan" type="text" />
              <Input name="ttl" title="Tanggal Lahir" type="date" />

              <div className="pt-4">
                <Button theme="primary" type="submit" size="large" block>Simpan Perubahan</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  // === Mobile Change Password (activeTab === 'password') ===
  if (isMobile && activeTab === 'password') {
    return (
      <div className="-mt-4 -mx-4 min-h-screen bg-gray-50 pb-20">
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b sticky top-0 z-30">
          <button onClick={() => setActiveTab('akun')} className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-indigo-950">Ubah Password</h1>
          <div className="w-8"></div>
        </div>

        <div className="p-5">
           <Form onSubmit={onSubmitPassword}>
            <div className="space-y-6">
               <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                 <IconLock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                 <div>
                   <h4 className="font-bold text-blue-900 text-sm">Amankan Akun Anda</h4>
                   <p className="text-xs text-blue-700 mt-1">Gunakan password yang kuat gabungan huruf, angka, dan simbol.</p>
                 </div>
               </div>

               <Input type="password" name="oldPassword" title="Password Sekarang" validation={{ required: 'Password sekarang harus diisi' }} />
               <Input type="password" name="password" title="Password Baru" validation={{ required: 'Password baru harus diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } }} />
               <Input type="password" name="confirm_password" title="Konfirmasi Password Baru" validation={{ required: 'Konfirmasi password harus diisi', validate: (value: any, formValues: any) => value === formValues.password || 'Password tidak cocok' }} />

               <div className="pt-4">
                <Button theme="primary" type="submit" size="large" block>Update Password</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    );
  }

  if (isMobile && activeTab === 'akun') {
    const handleLogout = () => {
      useAuthStore.getState().logout();
      // Force reload to ensure all states are cleared
      window.location.href = '/auth/login';
    };

    return (
      <div className="-mt-4 -mx-4 h-full bg-[#f8f9fa] min-h-screen pb-20">
        {/* Header Profile */}
        <div className="bg-white px-5 pt-8 pb-6 rounded-b-[30px] shadow-sm mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
             <UserAvatar 
              name={account?.name} 
              image={account?.gambar}
              size={80}
              className="border-4 border-white shadow-lg mb-3"
            />
            <h2 className="text-lg font-bold text-gray-800">{account?.name}</h2>
            <p className="text-sm text-gray-500">{account?.email}</p>
            <div className="mt-2 text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              {account?.role || 'User'}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="px-5 grid gap-4">
          <div 
            onClick={() => setActiveTab('profil')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <IconUserCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Data Diri</h3>
                <p className="text-xs text-gray-400">Update informasi profil kamu</p>
              </div>
            </div>
            <IconChevronRight size={20} className="text-gray-300" />
          </div>

          <div 
            onClick={() => setActiveTab('password')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <IconLock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Ubah Password</h3>
                <p className="text-xs text-gray-400">Jaga keamanan akunmu</p>
              </div>
            </div>
            <IconChevronRight size={20} className="text-gray-300" />
          </div>
          
           <div 
            onClick={() => setActiveTab('affiliate')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <IconUsers size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Affiliate</h3>
                <p className="text-xs text-gray-400">Cek komisi dan referral</p>
              </div>
            </div>
            <IconChevronRight size={20} className="text-gray-300" />
          </div>

          <div 
            onClick={handleLogout}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mt-4 active:bg-red-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 group-active:bg-red-200">
                <IconLogout size={24} />
              </div>
              <div>
                <h3 className="font-bold text-red-600">Keluar</h3>
                <p className="text-xs text-red-300">Keluar dari aplikasi</p>
              </div>
            </div>
            <IconChevronRight size={20} className="text-red-200" />
          </div>
        </div>
      </div>
    );
  }

  // === Mobile Affiliate View (Early Return) ===
  if (isMobile && activeTab === 'affiliate') {
    return (
      <div className="flex flex-col gap-6 -mx-4 -mt-4 bg-[#F8FAFC] min-h-screen pb-20 overflow-x-hidden w-[calc(100%+2rem)]">
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b sticky top-0 z-30">
          <Link to="/" className="text-indigo-950 p-1">
            <IconArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-indigo-950">Affiliate</h1>
          <div className="w-8"></div>
        </div>

        <div className="px-5 space-y-6">
          {/* Alert Status */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 shadow-sm shadow-yellow-100/50">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <IconBulb className="text-yellow-500" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-yellow-900 leading-tight">Status Affiliate Aktif!</span>
              <span className="text-xs font-medium text-yellow-700/80 leading-relaxed mt-0.5">Anda mendapatkan komisi dari setiap pembelian melalui referral Anda.</span>
            </div>
          </div>

          {/* Affiliate Tools */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Affiliate Tools</h2>
            
            {/* Code Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kode Affiliate Anda</span>
                <span className="text-base font-black text-blue-600 tracking-tight">{account?.affiliateCode || '-'}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(account?.affiliateCode || '', 'code')}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black flex items-center gap-2 active:bg-blue-100 transition-colors"
              >
                <IconCopy size={14} />
                {copied.code ? 'Copied' : 'Salin'}
              </button>
            </div>

            {/* Link Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Link Affiliate</span>
                <span className="text-xs font-medium text-gray-500 break-all leading-relaxed">{account?.affiliateLink || '-'}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(account?.affiliateLink || '', 'link')}
                className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:bg-blue-700 transition-all transition-transform"
              >
                <IconLink size={16} />
                {copied.link ? 'Link Tersalin' : 'Salin Link Referral'}
              </button>
            </div>
          </div>

          {/* Financials Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 items-start relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <IconWallet size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Komisi</span>
                <span className="text-base font-black text-indigo-950">Rp {balanceFormatted.replace('Rp ', '')}</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 items-start relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <IconCash size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dicairkan</span>
                <span className="text-base font-black text-indigo-950">Rp {totalWithdrawn.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Withdrawal Button */}
          <button 
            onClick={() => setWithdrawVisible(true)}
            className="w-full py-5 bg-[#F97316] text-white rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-lg shadow-orange-100 active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            <IconShare className="rotate-180" size={20} />
            Ajukan Pencairan Komisi
          </button>
          
          <button 
            onClick={() => setHistoryVisible(true)}
            className="w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-100 rounded-2xl active:bg-gray-50 transition-all"
          >
            Riwayat Pencairan
          </button>

          {/* Referral List */}
          <div className="space-y-4 pb-10">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-black text-indigo-950 tracking-tight">Daftar Referral Anda</h2>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full">{referrals.length} USERS</span>
            </div>

            {referrals.length > 0 ? (
              <div className="flex flex-col gap-4">
                {referrals.map((item: any) => (
                  <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-indigo-950 font-black border border-gray-50">
                      {item.name?.substring(0, 2).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <h4 className="text-sm font-black text-indigo-950 leading-tight">{item.name || '-'}</h4>
                      <p className="text-[10px] font-medium text-gray-400">{item.email || '-'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded leading-none">KOMISI: Rp {parseInt(item.total_komisi || '0', 10).toLocaleString('id-ID')}</span>
                        <span className="text-[10px] font-medium text-gray-300">• {moment(item.created_at).format('DD MMM YYYY')}</span>
                      </div>
                    </div>
                    <IconChevronRight size={18} className="text-gray-200" />
                  </div>
                ))}
                
                {/* Mobile Pagination Placeholder */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button className="p-2 text-gray-300 disabled:opacity-50">
                    <IconChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-100">1</button>
                  </div>
                  <button className="p-2 text-blue-600">
                    <IconChevronRight size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                  <IconUsers size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-indigo-950">Belum ada referral</h3>
                  <p className="text-xs font-medium text-gray-400 leading-relaxed px-4">Bagikan link affiliate Anda untuk mulai mendapatkan komisi pertama Anda.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Existing Modals reused */}
        {withdrawVisible && (
          <Modal visible={withdrawVisible} onClose={() => setWithdrawVisible(false)} title="Ajukan Pencairan Komisi">
            {/* ... Modal content duplicated or reused, but easier to just let the main return handle modals if they are outside? 
                Wait, if I return early, the Modals defined at the end of the file WON'T be rendered.
                I need to include the Modals here too, or structure it differently. 
            */}
             <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 text-[#F97316] p-3 rounded-md text-sm">
                Saldo tersedia: <strong>Rp {balanceFormatted}</strong>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
                  <IconBuildingBank size={16} /> Tujuan Pencairan <span className="text-red-500">*</span>
                </label>
                <TInput
                  value={paymentDestination}
                  placeholder="BCA: 123456789 - Budi / Dana 08xxxx"
                  onChange={setPaymentDestination}
                  className="w-full"
                  style={{ minHeight: '40px' }}
                  status={isDestinationEmpty ? 'error' : undefined}
                />
                {isDestinationEmpty && <p className="text-xs text-red-600 mt-1">Tujuan pencairan wajib diisi</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
                  <IconBuildingBank size={16} /> Jumlah (Rp) <span className="text-red-500">*</span>
                </label>
                <TInput
                  type="number"
                  value={withdrawAmount}
                  onChange={(val: any) => setWithdrawAmount(val)}
                  className="w-full"
                  style={{ minHeight: '40px' }}
                  status={isAmountExceedsBalance ? 'error' : undefined}
                />
                {isAmountExceedsBalance && <p className="text-xs text-red-600 mt-1">Jumlah melebihi saldo</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
                  <IconNote size={16} /> Catatan
                </label>
                <TInput
                  value={withdrawNotes}
                  onChange={(val: any) => setWithdrawNotes(val)}
                  placeholder="Opsional"
                  className="w-full"
                  style={{ minHeight: '100px' }}
                />
              </div>

              {pendingWithdrawals.length > 0 && (
                <div className="bg-yellow-50 border text-yellow-800 border-yellow-200 text-sm p-3 rounded-md">
                  Anda punya pencairan pending, tunggu selesai dulu.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => setWithdrawVisible(false)}>Batal</Button>
              <Button
                theme="primary"
                className="!bg-[#F97316] !border-[#F97316]"
                loading={isSubmitting}
                disabled={pendingWithdrawals.length > 0 || isAmountExceedsBalance || !withdrawAmount || isDestinationEmpty || isSubmitting}
                onClick={handleWithdrawSubmit}
              >
                Kirim Permintaan
              </Button>
            </div>
          </Modal>
        )}

        {historyVisible && (
          <Modal visible={historyVisible} onClose={() => setHistoryVisible(false)} title="Riwayat Pencairan Komisi">
            <div className="space-y-4">
              
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-md text-center">
                  <h5 className="text-sm text-[#F97316]">Total Disetujui</h5>
                  <h3 className="text-lg font-semibold text-[#F97316]">Rp {summary.total_approved_formatted}</h3>
                </div>

              {withdrawHistory.length > 0 ? (
                <Table data={withdrawHistory} columns={historyColumns} pagination={{ pageSize: 10 }} rowKey="id" bordered stripe />
              ) : (
                <div className="text-center py-8 text-gray-500">Belum ada riwayat pencairan.</div>
              )}
            </div>
          </Modal>
        )}

      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-xl shadow-2xl">
      <Tabs value={activeTab} onChange={(val: any) => setActiveTab(val)} placement="top" size="medium">
        {/* === TAB AKUN === */}
        <TabPanel label="Akun" value="akun">
          <Form onSubmit={onSubmitProfil} defaultValues={account}>
            <div className="space-y-4">
              <Input name="name" title="Nama" type="text" validation={{ required: 'Nama harus diisi' }} />
              <Input name="email" title="Email" type="email" disabled validation={{ required: 'Email harus diisi' }} />
              <div className="flex justify-end">
                <Button theme="primary" type="submit">Simpan Perubahan</Button>
              </div>
            </div>
          </Form>
        </TabPanel>

        {/* === TAB PROFIL === */}
        <TabPanel label="Profil" value="profil">
          <Form onSubmit={onSubmitProfil} defaultValues={account}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="col-span-full">
                    <input type="file" id="photo" className="hidden" ref={fileInputRef} onChange={(e) => setImage(e.target.files?.[0] || null)} accept="image/*" />
                    <div className="mt-2 flex items-center gap-x-3">
                      <UserAvatar 
                        name={account?.name} 
                        image={image ? (typeof image === 'string' ? image : URL.createObjectURL(image)) : account?.gambar} 
                        size={80} 
                      />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Ganti
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <Input name="noWA" title="Telepon" type="text" defaultValue={account?.noWA || ''} validation={{ pattern: { value: /^8[0-9]{9,11}$/, message: 'Format nomor telepon tidak sesuai / masukkan nomor tanpa angka "0" didepan' } }} />
                  </div>
                  <div className="sm:col-span-full">
                    <Input name="alamat" title="Alamat Lengkap" type="text" validation={{ required: 'Alamat wajib diisi' }} />
                  </div>
                  <div className="sm:col-span-2">

                    <Input 
                      name="provinsi" 
                      title="Provinsi" 
                      type="select" 
                      options={provinces}
                      validation={{ required: 'Provinsi wajib diisi' }} 
                      onChange={(val: string) => {
                        console.log("Province changed:", val);
                        const selected = provinces.find(p => p.value === val);
                        console.log("Selected province object:", selected);
                        setSelectedProvId(selected?.code || "");
                        setSelectedRegencyId(""); // reset child
                        setRegencies([]); // reset child list
                        setDistricts([]); // reset child list
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input 
                      name="kabupaten" 
                      title="Kabupaten/Kota" 
                      type="select" 
                      options={regencies}
                      validation={{ required: 'Kabupaten wajib diisi' }} 
                      onChange={(val: string) => {
                        const selected = regencies.find(r => r.value === val);
                        setSelectedRegencyId(selected?.code || "");
                        setDistricts([]); // reset child list
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input 
                      name="kecamatan" 
                      title="Kecamatan" 
                      type="select" 
                      options={districts}
                      validation={{ required: 'Kecamatan wajib diisi' }} 
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input name="jurusan" title="Instansi" type="text" />
                  </div>
                  <div className="sm:col-span-full">
                    <Input name="ttl" title="Tanggal Lahir" type="date" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button theme="primary" type="submit">Simpan Perubahan</Button>
            </div>
          </Form>
        </TabPanel>

        {/* === TAB UBAH PASSWORD === */}
        <TabPanel label="Ubah Password" value="password">
          <Form onSubmit={onSubmitPassword}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <Input type="password" name="oldPassword" title="Password Sekarang" validation={{ required: 'Password sekarang harus diisi' }} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input type="password" name="password" title="Password Baru" validation={{ required: 'Password baru harus diisi', minLength: { value: 8, message: 'Minimal 8 karakter' } }} />
                  </div>
                  <div className="sm:col-span-3">
                    <Input type="password" name="confirm_password" title="Konfirmasi Password Baru" validation={{ required: 'Konfirmasi password harus diisi', validate: (value: any, formValues: any) => value === formValues.password || 'Password tidak cocok' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button theme="primary" type="submit">Simpan Perubahan</Button>
            </div>
          </Form>
        </TabPanel>

        {/* === TAB AFFILIATE === */}
        <TabPanel label="Affiliate" value="affiliate">
          {!isMobile ? (
            <div className="space-y-6">
              {account?.affiliateCode ? (
                <>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                    <strong>Status Affiliate Aktif!</strong> Anda mendapatkan komisi dari setiap pembelian melalui referral Anda.
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h6 className="font-semibold mb-2"><IconShare size={16} className="inline mr-2" /> Kode Affiliate Anda:</h6>
                    <div className="flex gap-2 mb-3">
                      <code className="bg-gray-100 p-2 rounded flex-1 text-sm">{account.affiliateCode}</code>
                      <Button theme="default" onClick={() => copyToClipboard(account?.affiliateCode || '', 'code')}>
                        {copied.code ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <h6 className="font-semibold mb-2"><IconShare size={16} className="inline mr-2" /> Link Affiliate:</h6>
                    <div className="flex gap-2">
                      <code className="bg-gray-100 p-2 rounded flex-1 text-sm break-all">{account.affiliateLink}</code>
                      <Button theme="primary" onClick={() => copyToClipboard(account?.affiliateLink || '', 'link')}>
                        {copied.link ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <small className="block mt-2 text-blue-600">Bagikan link ini untuk mendapatkan komisi dari referral Anda!</small>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-orange-100 p-4 rounded text-center">
                      <h5>Saldo Komisi Saat Ini</h5>
                      <h3 className="text-[#F97316]">Rp {balanceFormatted}</h3>
                    </div>
                    <div className="bg-blue-100 p-4 rounded text-center">
                      <h5>Total Sudah Dicairkan</h5>
                      <h3 className="text-blue-800">Rp {totalWithdrawn.toLocaleString('id-ID')}</h3>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button theme="primary" onClick={() => setWithdrawVisible(true)} className="w-full sm:w-auto flex-1 !bg-[#F97316] !border-[#F97316]">
                      Ajukan Pencairan Komisi
                    </Button>
                    <Button theme="default" onClick={() => setHistoryVisible(true)} className="w-full sm:w-auto flex-1">
                      Riwayat Pencairan
                    </Button>
                  </div>

                  {referrals.length > 0 ? (
                    <div>
                      <h6 className="font-semibold mb-3">Daftar Referral Anda</h6>
                      <Table data={referrals} columns={referralColumns} pagination={{ pageSize: 10 }} rowKey="id" bordered stripe />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center">
                      Belum ada user yang menggunakan affiliate Anda.
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded text-center text-gray-500">
                  Anda belum memiliki kode affiliate.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 -mx-4 -mt-4 bg-[#F8FAFC] min-h-screen pb-20 overflow-x-hidden h-full">
              {/* Header */}
              <div className="bg-white px-5 py-4 flex items-center justify-between border-b sticky top-0 z-30">
                <Link to="/" className="text-indigo-950 p-1">
                  <IconArrowLeft size={24} />
                </Link>
                <h1 className="text-lg font-bold text-indigo-950">Affiliate</h1>
                <div className="w-8"></div>
              </div>

              <div className="px-5 space-y-6">
                {/* Alert Status */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3 shadow-sm shadow-yellow-100/50">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <IconBulb className="text-yellow-500" size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-yellow-900 leading-tight">Status Affiliate Aktif!</span>
                    <span className="text-xs font-medium text-yellow-700/80 leading-relaxed mt-0.5">Anda mendapatkan komisi dari setiap pembelian melalui referral Anda.</span>
                  </div>
                </div>

                {/* Affiliate Tools */}
                <div className="space-y-4">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Affiliate Tools</h2>
                  
                  {/* Code Card */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kode Affiliate Anda</span>
                      <span className="text-base font-black text-blue-600 tracking-tight">{account?.affiliateCode || '-'}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(account?.affiliateCode || '', 'code')}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black flex items-center gap-2 active:bg-blue-100 transition-colors"
                    >
                      <IconCopy size={14} />
                      {copied.code ? 'Copied' : 'Salin'}
                    </button>
                  </div>

                  {/* Link Card */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Link Affiliate</span>
                      <span className="text-xs font-medium text-gray-500 break-all leading-relaxed">{account?.affiliateLink || '-'}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(account?.affiliateLink || '', 'link')}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:bg-blue-700 transition-all transition-transform"
                    >
                      <IconLink size={16} />
                      {copied.link ? 'Link Tersalin' : 'Salin Link Referral'}
                    </button>
                  </div>
                </div>

                {/* Financials Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 items-start relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                      <IconWallet size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo Komisi</span>
                      <span className="text-base font-black text-indigo-950">Rp {balanceFormatted.replace('Rp ', '')}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 items-start relative overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <IconCash size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Dicairkan</span>
                      <span className="text-base font-black text-indigo-950">Rp {totalWithdrawn.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Button */}
                <button 
                  onClick={() => setWithdrawVisible(true)}
                  className="w-full py-5 bg-[#F97316] text-white rounded-2xl text-sm font-black flex items-center justify-center gap-3 shadow-lg shadow-orange-100 active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  <IconShare className="rotate-180" size={20} />
                  Ajukan Pencairan Komisi
                </button>
                
                <button 
                  onClick={() => setHistoryVisible(true)}
                  className="w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest bg-white border border-gray-100 rounded-2xl active:bg-gray-50 transition-all"
                >
                  Riwayat Pencairan
                </button>

                {/* Referral List */}
                <div className="space-y-4 pb-10">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-base font-black text-indigo-950 tracking-tight">Daftar Referral Anda</h2>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full">{referrals.length} USERS</span>
                  </div>

                  {referrals.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {referrals.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-indigo-950 font-black border border-gray-50">
                            {item.name?.substring(0, 2).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 flex flex-col gap-0.5">
                            <h4 className="text-sm font-black text-indigo-950 leading-tight">{item.name || '-'}</h4>
                            <p className="text-[10px] font-medium text-gray-400">{item.email || '-'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded leading-none">KOMISI: Rp {parseInt(item.total_komisi || '0', 10).toLocaleString('id-ID')}</span>
                              <span className="text-[10px] font-medium text-gray-300">• {moment(item.created_at).format('DD MMM YYYY')}</span>
                            </div>
                          </div>
                          <IconChevronRight size={18} className="text-gray-200" />
                        </div>
                      ))}
                      
                      {/* Mobile Pagination Placeholder */}
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <button className="p-2 text-gray-300 disabled:opacity-50">
                          <IconChevronLeft size={20} />
                        </button>
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-100">1</button>
                          {/* More pages if needed */}
                        </div>
                        <button className="p-2 text-blue-600">
                          <IconChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                        <IconUsers size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-black text-indigo-950">Belum ada referral</h3>
                        <p className="text-xs font-medium text-gray-400 leading-relaxed px-4">Bagikan link affiliate Anda untuk mulai mendapatkan komisi pertama Anda.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabPanel>

        {/* === TAB LOGS === */}
        <TabPanel label="Logs" value="logs">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3 mt-4 mb-4 w-full justify-between">
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <TInput
                  placeholder="Cari aktivitas..."
                  onChange={(val: any) => {
                    dataLogs.setParams((prev: any) => ({ ...prev, search: val, skip: 0 }));
                  }}
                  style={{ width: 250 }}
                  clearable
                />
                <Select
                  options={[
                    { label: 'Terbaru', value: 'true' },
                    { label: 'Terlama', value: 'false' },
                  ]}
                  onChange={(val: any) => {
                    dataLogs.setParams((prev: any) => ({ ...prev, descending: val, skip: 0 }));
                  }}
                  defaultValue="true"
                  style={{ width: 120 }}
                />
              </div>
              <Popconfirm
                content="Apakah Anda yakin ingin menghapus semua log Anda? Tindakan ini tidak dapat dibatalkan."
                onConfirm={handleClearProfileLogs}
                theme="danger"
              >
                <Button theme="danger">Clear All Logs</Button>
              </Popconfirm>
            </div>
            <Table 
              data={dataLogs.list || []} 
              columns={logColumns} 
              pagination={{ 
                defaultCurrent: 1,
                total: dataLogs.count || 0,
                pageSizeOptions: [5, 10, 20],
                showJumper: false,
                onPageSizeChange: (pageSize: number) => {
                  dataLogs.setParams((prev: any) => ({ ...prev, take: pageSize, skip: 0 }));
                },
                onChange: (pageInfo: any) => {
                  dataLogs.setParams((prev: any) => ({ ...prev, skip: (pageInfo.current - 1) * pageInfo.pageSize }));
                }
              }} 
              loading={dataLogs.isLoading}
              rowKey="last_activity" 
              bordered 
              stripe 
            />
          </div>
        </TabPanel>
      </Tabs>

      {/* === MODAL WITHDRAW === */}
      <Modal visible={withdrawVisible} onClose={() => setWithdrawVisible(false)} title="Ajukan Pencairan Komisi">
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 text-[#F97316] p-3 rounded-md text-sm">
            Saldo tersedia: <strong>Rp {balanceFormatted}</strong>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
              <IconBuildingBank size={16} /> Tujuan Pencairan <span className="text-red-500">*</span>
            </label>
            <TInput
              value={paymentDestination}
              placeholder="BCA: 123456789 - Budi / Dana 08xxxx"
              onChange={setPaymentDestination}
              className="w-full"
              style={{ minHeight: '40px' }}
              status={isDestinationEmpty ? 'error' : undefined}
            />
            {isDestinationEmpty && <p className="text-xs text-red-600 mt-1">Tujuan pencairan wajib diisi</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
              <IconBuildingBank size={16} /> Jumlah (Rp) <span className="text-red-500">*</span>
            </label>
            <TInput
              type="number"
              value={withdrawAmount}
              onChange={(val: any) => setWithdrawAmount(val)}
              className="w-full"
              style={{ minHeight: '40px' }}
              status={isAmountExceedsBalance ? 'error' : undefined}
            />
            {isAmountExceedsBalance && <p className="text-xs text-red-600 mt-1">Jumlah melebihi saldo</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1 block">
              <IconNote size={16} /> Catatan
            </label>
            <TInput
              value={withdrawNotes}
              onChange={(val: any) => setWithdrawNotes(val)}
              placeholder="Opsional"
              className="w-full"
              style={{ minHeight: '100px' }}
            />
          </div>

          {pendingWithdrawals.length > 0 && (
            <div className="bg-yellow-50 border text-yellow-800 border-yellow-200 text-sm p-3 rounded-md">
              Anda punya pencairan pending, tunggu selesai dulu.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={() => setWithdrawVisible(false)}>Batal</Button>
          <Button
            theme="primary"
            className="!bg-[#F97316] !border-[#F97316]"
            loading={isSubmitting}
            disabled={pendingWithdrawals.length > 0 || isAmountExceedsBalance || !withdrawAmount || isDestinationEmpty || isSubmitting}
            onClick={handleWithdrawSubmit}
          >
            Kirim Permintaan
          </Button>
        </div>
      </Modal>

      {/* === MODAL HISTORY === */}
      <Modal visible={historyVisible} onClose={() => setHistoryVisible(false)} title="Riwayat Pencairan Komisi">
        <div className="space-y-4">
          
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-md text-center">
              <h5 className="text-sm text-[#F97316]">Total Disetujui</h5>
              <h3 className="text-lg font-semibold text-[#F97316]">Rp {summary.total_approved_formatted}</h3>
            </div>

          {withdrawHistory.length > 0 ? (
            <Table data={withdrawHistory} columns={historyColumns} pagination={{ pageSize: 10 }} rowKey="id" bordered stripe />
          ) : (
            <div className="text-center py-8 text-gray-500">Belum ada riwayat pencairan.</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
