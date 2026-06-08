import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconFileSpreadsheet,
  IconPencil,
  IconPlus,
  IconTrash,
  IconHistory,
  IconCash,
  IconNotes
} from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { Button, Popconfirm, Pagination } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import ManageAffiliate from './manage';
import ManageAffiliateAll from './manage-all';
import { deleteData, getExcel, postData } from '@/utils/axios';
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

export default function AffiliateIndex() {
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState({});
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [withdrawalsVisible, setWithdrawalsVisible] = useState(false);
  const [withdrawalsData, setWithdrawalsData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
const [visibleAll, setVisibleAll] = useState(false);

  const dataAffiliate = useGetList({
    url: 'admin/affiliate/list',
    initialParams: {
      skip: 0,
      take: 20,
    },
    onSuccess: (response) => {
      console.log('Fetch API - Affiliate List:', response); // Log hasil fetch list
    },
    onError: (error) => {
      console.error('Error Fetch API - Affiliate List:', error);
    },
  });

  const handleDeleted = async (id: number) => {
    try {
      const response = await FetchAPI(deleteData(`affiliate/${id}`));
      console.log('Fetch API - Delete Affiliate:', response); // Log hasil delete
      dataAffiliate.refresh();
    } catch (error) {
      console.error('Error Fetch API - Delete Affiliate:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await getExcel('admin/affiliate/excel', 'affiliates');
      console.log('Fetch API - Export Excel:', response); // Log hasil export
    } catch (error) {
      console.error('Error Fetch API - Export Excel:', error);
    }
  };

  const handleOpenHistory = async (userId: number) => {
    try {
      const response = await FetchAPI(`admin/affiliate/history/${userId}`);
      console.log('Fetch API - History:', response); // Log hasil history
      setHistoryData(response.data || []);
      setHistoryVisible(true);
      setSelectedUserId(userId);
    } catch (error) {
      console.error('Error Fetch API - History:', error);
    }
  };

  const handleGenerateAll = async () => {
    try {
      const response = await FetchAPI(
        postData('admin/affiliate/generate-all', {})
      );
      console.log('Fetch API - Generate All Codes:', response);
      dataAffiliate.refresh();
    } catch (error) {
      console.error('Error Fetch API - Generate All Codes:', error);
    }
  };

  const handleOpenWithdrawals = async (userId: number) => {
    try {
      const response = await FetchAPI(`admin/affiliate/withdrawals/${userId}`);
      console.log('Fetch API - Withdrawals:', response); // Log hasil withdrawals
      setWithdrawalsData(response || []);
      setWithdrawalsVisible(true);
      setSelectedUserId(userId);
    } catch (error) {
      console.error('Error Fetch API - Withdrawals:', error);
    }
  };

  const handleApproveWithdraw = async (withdrawalId: number) => {
    try {
      const response = await FetchAPI(`admin/affiliate/withdraw/${withdrawalId}/approve`, { method: 'PUT' });
      console.log('Fetch API - Approve Withdraw:', response); // Log hasil approve
      // Refresh withdrawals data
      const refreshResponse = await FetchAPI(`admin/affiliate/withdrawals/${selectedUserId}`);
      console.log('Fetch API - Refresh Withdrawals after Approve:', refreshResponse); // Log hasil refresh
      setWithdrawalsData(refreshResponse || []);
    } catch (error) {
      console.error('Error Fetch API - Approve Withdraw:', error);
    }
  };

  const handleRejectWithdraw = async (withdrawalId: number, notes: string) => {
    try {
      const response = await FetchAPI(`admin/affiliate/withdraw/${withdrawalId}/reject`, {
        method: 'PUT',
        body: { notes },
      });
      console.log('Fetch API - Reject Withdraw:', response); // Log hasil reject
      // Refresh withdrawals data
      const refreshResponse = await FetchAPI(`admin/affiliate/withdrawals/${selectedUserId}`);
      console.log('Fetch API - Refresh Withdrawals after Reject:', refreshResponse); // Log hasil refresh
      setWithdrawalsData(refreshResponse || []);
    } catch (error) {
      console.error('Error Fetch API - Reject Withdraw:', error);
    }
  };

  // Pagination logic
  const paginationData = dataAffiliate.data?.pagination;
  const totalRecords = parseInt(paginationData?.total || '0', 10);
  const currentSkip = parseInt(paginationData?.skip || '0', 10);
  const pageSize = parseInt(paginationData?.take || '20', 10);
  const currentPage = Math.floor(currentSkip / pageSize) + 1;

  const handlePageChange = (page: number) => {
    const newSkip = (page - 1) * pageSize;
    dataAffiliate.setParams({
      ...dataAffiliate.params,
      skip: newSkip,
    });
    dataAffiliate.refresh();
  };

  const columns = [
    {
      colKey: 'applicant',
      title: '#',
      width: 60,
      cell: (row: any) => {
        return <span>{row.rowIndex + currentSkip + 1}</span>;
      },
    },
    {
      title: 'Nama User',
      colKey: 'name',
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Cari Nama User' },
        showConfirmAndReset: true,
      },
    },
    {
      title: 'Komisi (Tipe Komisi)',
      colKey: 'affiliateCommission',
      align: AlignType.Right,
      filter: {
        type: FilterType.Input,
        resetValue: '',
        confirmEvents: ['onEnter'],
        props: { placeholder: 'Cari Nilai Komisi' },
        showConfirmAndReset: true,
      },
      cell: ({ row }: any) => (
        <span>
          {row.affiliateCommission || 0} {row.commissionType === 'percent' ? '%' : 'IDR'}
        </span>
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
            <Button
              shape="circle"
              theme="default"
              onClick={() => {
                setDetail(() => ({
                  ...row,
                }));
                setVisible(true);
              }}
            >
              <IconPencil size={14} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <section className="">
      {visibleAll && (
        <ManageAffiliateAll
          setVisible={setVisibleAll}
          params={dataAffiliate}
        />
      )}
      {visible && (
        <ManageAffiliate
          setDetail={setDetail}
          params={dataAffiliate}
          setVisible={setVisible}
          detail={detail}
        />
      )}
      {/* History Modal Placeholder - Implement actual modal here */}
      {historyVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Riwayat Affiliate User ID: {selectedUserId}</h2>
            <pre className="text-sm overflow-auto mb-4">{JSON.stringify(historyData, null, 2)}</pre>
            <Button onClick={() => setHistoryVisible(false)}>Tutup</Button>
          </div>
        </div>
      )}
      {/* Withdrawals Modal Placeholder - Implement actual modal here */}
      {withdrawalsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Penarikan Affiliate User ID: {selectedUserId}</h2>
            <pre className="text-sm overflow-auto mb-4">{JSON.stringify(withdrawalsData, null, 2)}</pre>
            {/* Example approve/reject buttons - adjust based on data */}
            {withdrawalsData.map((item: any) => (
              <div key={item.id} className="border p-2 mb-2">
                <p>ID: {item.id} - Status: {item.status}</p>
                {item.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleApproveWithdraw(item.id)} theme="primary">Setujui</Button>
                    <Popconfirm content="Alasan penolakan?" onConfirm={(notes) => handleRejectWithdraw(item.id, notes)}>
                      <Button theme="danger">Tolak</Button>
                    </Popconfirm>
                  </div>
                )}
              </div>
            ))}
            <Button onClick={() => setWithdrawalsVisible(false)} className="mt-4">Tutup</Button>
          </div>
        </div>
      )}
      <BreadCrumb
        page={[{ name: 'Manage Affiliate', link: '/manage-affiliate' }]}
      />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5 ">
              Manage Affiliate
            </h1>
            <div className="flex gap-3">
              <Button
                theme="primary"
                onClick={() => setVisibleAll(true)}
                icon={<IconCash size={16} />}
              >
                Set Semua Komisi
              </Button>
            </div>
          </div>
        </div>
        <TableWrapper data={dataAffiliate} columns={columns} />
        {paginationData && totalRecords > 0 && (
          <div className="mt-6 flex justify-end">
            <Pagination
              total={totalRecords}
              current={currentPage}
              pageSize={pageSize}
              onChange={handlePageChange}
              showQuickJumper
              showSizeChanger={false}
              layout="total, prev, pager, next, jumper"
              className="w-full max-w-md"
            />
          </div>
        )}
      </div>
    </section>
  );
}