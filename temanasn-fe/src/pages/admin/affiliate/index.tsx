import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconFileSpreadsheet,
  IconHistory,
  IconCash,
  IconPencil,
  IconPlus,
  IconTrash,
  IconNotes,
} from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { Button, Popconfirm, Pagination, Tabs, Input, Select } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import ManageAffiliate from './manage';
import { getData, deleteData, getExcel, patchData, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';

enum FilterType {
  Input = 'input',
  Select = 'select',
}

enum AlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

const { TabPanel } = Tabs;

export default function AffiliateIndex() {
  const [activeTab, setActiveTab] = useState('affiliates');
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [withdrawalsVisible, setWithdrawalsVisible] = useState(false);
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  // === TAB 1: AFFILIATE LIST ===
  const dataAffiliate = useGetList({
    url: 'admin/affiliate/list',
    initialParams: { skip: 0, take: 20 },
    onSuccess: (response) => {
      console.log('✅ Fetch API - Affiliate List:', response);
    },
    onError: (error) => {
      console.error('❌ Error Fetch API - Affiliate List:', error);
    },
  });
  // === TAB 2: ALL WITHDRAWALS ===
  const dataWithdrawals = useGetList({
    url: 'admin/history/withdraw-all',
    initialParams: { skip: 0, take: 20 },
  });
  // 🧹 Delete affiliate
  const handleDeleted = async (id: number) => {
    try {
      const response = await FetchAPI(deleteData(`affiliate/${id}`));
      console.log('✅ Fetch API - Delete Affiliate:', response);
      dataAffiliate.refresh();
    } catch (error) {
      console.error('❌ Error Fetch API - Delete Affiliate:', error);
    }
  };
  // 📊 Export Excel
  const handleExportExcel = async () => {
    try {
      await getExcel('admin/affiliate/excel', 'affiliates');
    } catch (error) {
      console.error('❌ Error Fetch API - Export Excel:', error);
    }
  };
  // 📜 Get affiliate history
  const handleOpenHistory = async (userId: number, userName: string) => {
    try {
      const response = await getData(`admin/affiliate/history/${userId}`);
      console.log('✅ Get History:', response);
      setHistoryData(response || []); // karena getData() return langsung response.data.data
      setHistoryVisible(true);
      setSelectedUserId(userId);
      setSelectedUserName(userName);
    } catch (error) {
      console.error('❌ Error Get History:', error);
    }
  };
  // 💸 Get withdrawals list
  const handleOpenWithdrawals = async (userId: number, userName: string) => {
    try {
      const response = await getData(`admin/affiliate/withdrawals/${userId}`);
      console.log('✅ Get Withdrawals:', response);
      setWithdrawalsData(response || []); // karena getData() return response.data.data langsung
      setWithdrawalsVisible(true);
      setSelectedUserId(userId);
      setSelectedUserName(userName);
    } catch (error) {
      console.error('❌ Error Get Withdrawals:', error);
    }
  };
  // ⚙️ Generate all affiliate codes
  const handleGenerateAll = async () => {
    try {
      const response = await FetchAPI(postData('admin/affiliate/generate-all', {}));
      console.log('✅ Fetch API - Generate All Codes:', response);
      dataAffiliate.refresh();
    } catch (error) {
      console.error('❌ Error Fetch API - Generate All Codes:', error);
    }
  };
  // ✅ Approve withdraw for modal
  const handleApproveWithdraw = async (withdrawalId: number) => {
    try {
      const response = await FetchAPI(
        patchData(`admin/affiliate/withdraw/${withdrawalId}/approve`, {})
      );
      console.log('✅ Approve Withdraw Response:', response);
      // 🔄 Refresh data setelah berhasil approve
      const refreshResponse = await getData(`admin/affiliate/withdrawals/${selectedUserId}`);
      setWithdrawalsData(refreshResponse);
    } catch (error) {
      console.error('❌ Error Approving Withdraw:', error);
    }
  };
  // ❌ Reject withdraw for modal
  const handleRejectWithdraw = async (withdrawalId: number, notes: string) => {
    try {
      const response = await FetchAPI(
        patchData(`admin/affiliate/withdraw/${withdrawalId}/reject`, { notes })
      );
      console.log('✅ Reject Withdraw Response:', response);
      // 🔄 Refresh data setelah berhasil reject
      const refreshResponse = await getData(`admin/affiliate/withdrawals/${selectedUserId}`);
      setWithdrawalsData(refreshResponse);
    } catch (error) {
      console.error('❌ Error Rejecting Withdraw:', error);
    }
  };
  // ✅ Approve withdraw for tab
  const handleApproveWithdrawTab = async (id: number) => {
    try {
      await FetchAPI(patchData(`admin/affiliate/withdraw/${id}/approve`, {}));
      dataWithdrawals.refresh();
    } catch (error) {
      console.error('Error approving withdraw:', error);
    }
  };
  // ❌ Reject withdraw for tab
  const handleRejectWithdrawTab = async (id: number, notes: string) => {
    try {
      await FetchAPI(patchData(`admin/affiliate/withdraw/${id}/reject`, { notes }));
      dataWithdrawals.refresh();
    } catch (error) {
      console.error('Error rejecting withdraw:', error);
    }
  };
  // 📄 Pagination Affiliate
  const paginationAff = dataAffiliate.data?.pagination;
  const totalAff = parseInt(paginationAff?.total || '0', 10);
  const currentSkipAff = parseInt(paginationAff?.skip || '0', 10);
  const pageSizeAff = parseInt(paginationAff?.take || '20', 10);
  const currentPageAff = Math.floor(currentSkipAff / pageSizeAff) + 1;
  const handlePageChangeAff = (page: number) => {
    const newSkip = (page - 1) * pageSizeAff;
    dataAffiliate.setParams({ ...dataAffiliate.params, skip: newSkip });
    dataAffiliate.refresh();
  };
  // === Pagination Withdrawals ===
  const paginationWd = dataWithdrawals.data?.data?.pagination;
  const totalWd = parseInt(paginationWd?.total || '0', 10);
  const currentSkipWd = parseInt(paginationWd?.skip || '0', 10);
  const pageSizeWd = parseInt(paginationWd?.take || '20', 10);
  const currentPageWd = Math.floor(currentSkipWd / pageSizeWd) + 1;
  const handlePageChangeWd = (page: number) => {
    const newSkip = (page - 1) * pageSizeWd;
    dataWithdrawals.setParams({ ...dataWithdrawals.params, skip: newSkip });
    dataWithdrawals.refresh();
  };
  // === Columns Affiliate ===
  const columnsAffiliate = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => <span>{row.rowIndex + currentSkipAff + 1}</span>,
    },
    {
      title: 'Nama User',
      colKey: 'name',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: {
          placeholder: 'Cari Nama User',
        },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Email',
      colKey: 'email',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: {
          placeholder: 'Cari Email',
        },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Kode Affiliate',
      colKey: 'affiliateCode',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: {
          placeholder: 'Cari Kode Affiliate',
        },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Link Affiliate',
      colKey: 'affiliateLink',
      cell: ({ row }: any) =>
        row.affiliateLink ? (
          <a href={row.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {row.affiliateLink}
          </a>
        ) : (
          <span className="text-gray-500">Tidak tersedia</span>
        ),
    },
    {
      title: 'Saldo',
      colKey: 'total_komisi',
      align: AlignType.Right,
      cell: ({ row }: any) => (
        <span>{parseFloat(row.affiliateBalance || 0).toLocaleString('id-ID')} IDR</span>
      ),
    },
    {
      title: 'Sudah Dicairkan',
      colKey: 'total_withdrawn',
      align: AlignType.Right,
      cell: ({ row }: any) => (
        <span>{parseFloat(row.total_withdrawn || 0).toLocaleString('id-ID')} IDR</span>
      ),
    },
    {
      title: 'Action',
      align: AlignType.Center,
      colKey: 'action',
      cell: ({ row }: any) => {
        const hasBalance = parseFloat(row.affiliateBalance || 0) > 0;
        return (
          <div className="flex justify-center gap-5">
            <Button shape="circle" theme="default" onClick={() => handleOpenHistory(row.id, row.name)} size="small">
              <IconHistory size={14} />
            </Button>
              <Button shape="circle" theme="default" onClick={() => handleOpenWithdrawals(row.id, row.name)} size="small">
                <IconCash size={14} />
              </Button>
          </div>
        );
      },
    },
  ];
  // === Columns Withdrawals ===
  const columnsWithdrawals = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => (
        <span>{row.rowIndex + currentSkipWd + 1}</span>
      ),
    },
    {
      title: 'User',
      colKey: 'user',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.user?.name}</p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
          <p className="text-xs text-blue-600">Kode: {row.user?.affiliateCode}</p>
        </div>
      ),
    },
    {
      title: 'Jumlah',
      colKey: 'amount',
      cell: ({ row }: any) => (
        <span className="font-medium text-blue-600">{row.amount_formatted}</span>
      ),
    },
    {
      title: 'Status',
      colKey: 'status',
      filter: {
        type: FilterType.Select,
        resetValue: '',
        confirmEvents: ['onChange'],
        props: {
          placeholder: 'Filter Status',
          clearable: true,
        },
        showConfirmAndReset: true,
        list: [
          { text: 'Pending', value: 'pending' },
          { text: 'Disetujui', value: 'approved' },
          { text: 'Ditolak', value: 'rejected' },
        ],
      },
      cell: ({ row }: any) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            row.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : row.status === 'rejected'
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {row.status_label}
        </span>
      ),
    },
    {
      title: 'Tujuan',
      colKey: 'payload_destination',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: {
          placeholder: 'Cari Tujuan',
        },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => (
        <span className="text-sm">{row.payload_destination || '-'}</span>
      ),
    },
    {
      title: 'Catatan',
      colKey: 'notes',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: {
          placeholder: 'Cari Catatan',
        },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => (
        <span className="text-sm">{row.notes || '-'}</span>
      ),
    },
    {
      title: 'Dibuat',
      colKey: 'createdAt',
      cell: ({ row }: any) => (
        <span className="text-sm">{row.created_at_formatted}</span>
      ),
    },
    {
      title: 'Action',
      colKey: 'action',
      align: AlignType.Center,
      cell: ({ row }: any) =>
        row.status === 'pending' ? (
          <div className="flex gap-2 justify-center">
            <Button size="small" theme="primary" onClick={() => handleApproveWithdrawTab(row.id)}>
              Setujui
            </Button>
            <Popconfirm
              content="Alasan penolakan"
              onConfirm={(notes) => handleRejectWithdrawTab(row.id, notes as string)}
            >
              <Button size="small" theme="danger">
                Tolak
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <span className="text-gray-400">Selesai</span>
        ),
    },
  ];

  return (
    <section>
      {visible && (
        <ManageAffiliate setDetail={setDetail} params={dataAffiliate} setVisible={setVisible} detail={detail} />
      )}
      {/* 📘 History Modal */}
      {historyVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Riwayat Affiliate - {selectedUserName}
            </h2>
            {historyData.length > 0 ? (
              <div className="space-y-3">
                {historyData.map((item: any, index: number) => (
                  <div key={item.id || index} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">ID Transaksi</p>
                        <p className="font-semibold">{item.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            item.status?.toUpperCase() === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status_label || item.status || '-'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-blue-600">{item.amount_formatted || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Komisi</p>
                        <p className="font-semibold text-green-600">{item.komisi_formatted || '0'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Paket</p>
                        <p className="font-medium">{item.paketPembelian?.nama || '-'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Tanggal</p>
                        <p className="text-sm">{item.created_at_formatted || item.createdAt || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"> Belum ada riwayat transaksi </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setHistoryVisible(false)} theme="primary">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 💵 Withdrawals Modal */}
      {withdrawalsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Riwayat Penarikan - {selectedUserName}
            </h2>
            {withdrawalsData.length > 0 ? (
              <div className="space-y-3">
                {withdrawalsData.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">ID Penarikan</p>
                        <p className="font-semibold">{item.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            item.status?.toLowerCase() === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : item.status?.toLowerCase() === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.status_label || item.status || '-'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Jumlah</p>
                        <p className="font-semibold text-blue-600">
                          {item.amount_formatted || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tanggal Dibuat</p>
                        <p className="text-sm">{item.created_at_formatted}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tujuan Pencairan</p>
                        <p className="text-sm">{item.payload_destination}</p>
                      </div>
                      {item.notes && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Catatan</p>
                          <p className="text-sm italic">{item.notes}</p>
                        </div>
                      )}
                    </div>
                    {item.status === 'pending' && (
                      <div className="flex gap-2 mt-3 justify-end">
                        <Button
                          onClick={() => handleApproveWithdraw(item.id)}
                          theme="primary"
                          size="small"
                        >
                          Setujui
                        </Button>
                        <Popconfirm
                          content="Masukkan alasan penolakan"
                          onConfirm={(notes) => handleRejectWithdraw(item.id, notes)}
                        >
                          <Button theme="danger" size="small">
                            Tolak
                          </Button>
                        </Popconfirm>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada data penarikan
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setWithdrawalsVisible(false)} theme="primary">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
      <BreadCrumb page={[{ name: 'Manage Affiliate', link: '/manage-affiliate' }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-950">Manage Affiliate</h1>
          <Button theme="primary" onClick={handleExportExcel}>
            <IconFileSpreadsheet className="mr-2" size={16} />
            Export Excel
          </Button>
        </div>
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v as string)}>
          <TabPanel value="affiliates" label="Daftar Affiliate">
            <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
              <div className="title border-b border-[#ddd] w-full flex justify-between">
                <h1 className="text-2xl text-indigo-950 font-bold mb-5">Manage Affiliate</h1>
              </div>
            </div>
            <TableWrapper data={dataAffiliate} columns={columnsAffiliate} />
            {paginationAff && totalAff > 0 && (
              <div className="mt-6 flex justify-end">
                <Pagination
                  total={totalAff}
                  current={currentPageAff}
                  pageSize={pageSizeAff}
                  onChange={handlePageChangeAff}
                  showQuickJumper
                  showSizeChanger={false}
                  layout="total, prev, pager, next, jumper"
                  className="w-full max-w-md"
                />
              </div>
            )}
          </TabPanel>
          <TabPanel value="withdrawals" label="Semua Penarikan">
            <div className="mt-4">
              <TableWrapper data={dataWithdrawals} columns={columnsWithdrawals} />
              {paginationWd && totalWd > 0 && (
                <div className="mt-6 flex justify-end">
                  <Pagination
                    total={totalWd}
                    current={currentPageWd}
                    pageSize={pageSizeWd}
                    onChange={handlePageChangeWd}
                    showQuickJumper
                    showSizeChanger={false}
                    layout="total, prev, pager, next, jumper"
                    className="w-full max-w-md"
                  />
                </div>
              )}
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </section>
  );
}