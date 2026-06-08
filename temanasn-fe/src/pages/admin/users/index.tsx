import TableWrapper from '@/components/table';
import useGetList from '@/hooks/use-get-list';
import {
  IconFileSpreadsheet,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
  IconPackage,
  IconPackageImport,
  IconX,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import moment from 'moment';
import { useState } from 'react';
import { Button, Popconfirm, Dialog, MessagePlugin, Select } from 'tdesign-react';
import BreadCrumb from '@/components/breadcrumb';
import ManageUser from './manage';
import { deleteData, getData, getExcel, postData } from '@/utils/axios';
import FetchAPI from '@/utils/fetch-api';

enum FilterType { Input = 'input' }
enum AlignType { Center = 'center', Left = 'left', Right = 'right' }

export default function UserIndex() {
  const [visible, setVisible]                   = useState(false);
  const [referalVisible, setReferalVisible]     = useState(false);
  const [detail, setDetail]                     = useState({});
  const [referalDetail, setReferalDetail]       = useState<any>(null);
  const [paketVisible, setPaketVisible]         = useState(false);
  const [paketUser, setPaketUser]               = useState<any>(null);
  const [userPaketList, setUserPaketList]       = useState<any[]>([]);
  const [allPaket, setAllPaket]                 = useState<any[]>([]);
  const [paketLoading, setPaketLoading]         = useState(false);
  const [gantiMode, setGantiMode]               = useState<any>(null);
  const [selectedNewPaket, setSelectedNewPaket] = useState<number | null>(null);
  const [tambahMode, setTambahMode]             = useState(false);
  const [selectedAddPaket, setSelectedAddPaket] = useState<number | null>(null);
  const [saving, setSaving]                     = useState(false);
  const [paketTab, setPaketTab]                 = useState<'aktif'|'semua'>('aktif');

  const dataUser = useGetList({
    url: 'admin/users/get',
    initialParams: { skip: 0, take: 10 },
  });

  const handleDeleted = async (id: number) => {
    FetchAPI(deleteData(`admin/users/remove/${id}`)).then(() => dataUser.refresh());
  };

  const handleExportExcel = async () => {
    await getExcel('admin/users/excel', 'users');
  };

  const handleReferalClick = (row: any) => {
    setReferalDetail(row);
    setReferalVisible(true);
  };

  const openPaketModal = async (row: any) => {
    setPaketUser(row);
    setPaketVisible(true);
    setGantiMode(null);
    setTambahMode(false);
    setSelectedNewPaket(null);
    setSelectedAddPaket(null);
    setPaketTab('aktif');
    setPaketLoading(true);
    try {
      const [userPaket, semua] = await Promise.all([
        getData(`admin/users/${row.id}/paket`),
        getData('admin/users/all-paket'),
      ]);
      setUserPaketList(Array.isArray(userPaket) ? userPaket : userPaket?.data || []);
      setAllPaket(Array.isArray(semua) ? semua : semua?.data || []);
    } catch {
      MessagePlugin.error('Gagal memuat data paket');
    } finally {
      setPaketLoading(false);
    }
  };

  const handleHapusPaket = async (pembelianId: number) => {
    try {
      await deleteData(`admin/users/hapus-paket/${pembelianId}`);
      MessagePlugin.success('Paket berhasil dihapus');
      setUserPaketList(prev => prev.filter(p => p.id !== pembelianId));
    } catch {
      MessagePlugin.error('Gagal menghapus paket');
    }
  };

  const handleGantiPaket = async () => {
    if (!selectedNewPaket || !gantiMode) return;
    setSaving(true);
    try {
      await postData(`admin/users/${paketUser.id}/ganti-paket`, {
        pembelianId: gantiMode.id,
        paketPembelianId: selectedNewPaket,
      });
      MessagePlugin.success('Paket berhasil diganti');
      setGantiMode(null);
      setSelectedNewPaket(null);
      const res = await getData(`admin/users/${paketUser.id}/paket`);
      setUserPaketList(Array.isArray(res) ? res : res?.data || []);
    } catch {
      MessagePlugin.error('Gagal mengganti paket');
    } finally {
      setSaving(false);
    }
  };

  const handleTambahPaket = async () => {
    if (!selectedAddPaket) return;
    setSaving(true);
    try {
      await postData(`admin/users/${paketUser.id}/add-paket`, {
        paketPembelianId: selectedAddPaket,
      });
      MessagePlugin.success('Paket berhasil ditambahkan');
      setTambahMode(false);
      setSelectedAddPaket(null);
      const res = await getData(`admin/users/${paketUser.id}/paket`);
      setUserPaketList(Array.isArray(res) ? res : res?.data || []);
    } catch {
      MessagePlugin.error('Gagal menambahkan paket');
    } finally {
      setSaving(false);
    }
  };

  const isAktif = (p: any) => p.status === 'PAID' && (!p.expiredAt || new Date(p.expiredAt) > new Date());

  const paketOptions = allPaket.map(p => ({
    label: `${p.nama} ${p.durasi ? `(${p.durasi} bulan)` : '(selamanya)'}`,
    value: p.id,
  }));

  const filteredPaket = paketTab === 'aktif'
    ? userPaketList.filter(isAktif)
    : userPaketList;

  const columns = [
    {
      colKey: 'applicant', title: '#', width: 60,
      cell: (row: any) => <span>{row.rowIndex + 1 * dataUser.params.skip + 1}</span>,
    },
    {
      title: 'Name', colKey: 'name',
      filter: { type: FilterType.Input, resetValue: '', confirmEvents: ['onEnter'], props: { placeholder: 'Input Name' }, showConfirmAndReset: true },
    },
    {
      title: 'Email', colKey: 'email',
      filter: { type: FilterType.Input, resetValue: '', confirmEvents: ['onEnter'], props: { placeholder: 'Input Email' }, showConfirmAndReset: true },
    },
    {
      title: 'Nomor Whatsapp', colKey: 'noWA',
      filter: { type: FilterType.Input, resetValue: '', confirmEvents: ['onEnter'], props: { placeholder: 'Input noWA' }, showConfirmAndReset: true },
    },
    {
      title: 'Domisili Kota', colKey: 'kabupaten',
      filter: { type: FilterType.Input, resetValue: '', confirmEvents: ['onEnter'], props: { placeholder: 'Input Kota' }, showConfirmAndReset: true },
    },
    {
      title: 'Referal', colKey: 'referal', align: AlignType.Center,
      cell: ({ row }: any) => {
        const count = row.affiliateToUsers ? row.affiliateToUsers.length : 0;
        return (
          <Button shape="round" size="small" theme="default" onClick={() => handleReferalClick(row)} disabled={count === 0} className="flex items-center gap-1">
            <IconUsers size={14} />
            <span>{count}</span>
          </Button>
        );
      },
    },
    {
      title: 'Created At', colKey: 'created_at', sorter: true,
      cell: ({ row }: any) => <span>{moment(row.createdAt).format('DD/MM/YYYY')}</span>,
    },
    {
      title: 'Action', align: AlignType.Center, colKey: 'action',
      cell: ({ row }: any) => (
        <div className="flex justify-center gap-2">
          <Button shape="circle" theme="primary" onClick={() => openPaketModal(row)} title="Kelola Paket">
            <IconPackage size={14} />
          </Button>
          <Button shape="circle" theme="default" onClick={() => { setDetail(() => ({ ...row, password: '' })); setVisible(true); }}>
            <IconPencil size={14} />
          </Button>
          <Popconfirm content="Apakah kamu yakin?" theme="danger" onConfirm={() => handleDeleted(row.id)}>
            <Button shape="circle" theme="danger"><IconTrash size={14} /></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <section>
      {visible && (
        <ManageUser setDetail={setDetail} params={dataUser} setVisible={setVisible} detail={detail} />
      )}

      {/* Modal Referal */}
      {referalVisible && referalDetail && (
        <Dialog visible={referalVisible} header={`Referal - ${referalDetail.name}`} width={800} onClose={() => { setReferalVisible(false); setReferalDetail(null); }}>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Daftar User yang Direferensikan:</h3>
            {referalDetail.affiliateToUsers?.length > 0
              ? referalDetail.affiliateToUsers.map((affUser: any, index: number) => (
                  <div key={affUser.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <h4 className="font-medium">User #{index + 1}: {affUser.name}</h4>
                      <p className="text-sm text-gray-600">Email: {affUser.email}</p>
                      <p className="text-sm text-gray-600">No WA: {affUser.noWA}</p>
                      <p className="text-sm text-gray-600">Created: {moment(affUser.createdAt).format('DD/MM/YYYY')}</p>
                    </div>
                    <h5 className="font-semibold mb-2">Pembelian:</h5>
                    {affUser.Pembelian?.length > 0
                      ? <ul className="space-y-2">{affUser.Pembelian.map((purchase: any) => (
                          <li key={purchase.id} className="text-sm bg-white p-2 rounded border-l-4 border-blue-500">
                            <div className="flex justify-between">
                              <span>{purchase.namaPaket}</span>
                              <span className="font-medium">Rp {purchase.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500">Status: {purchase.status} | Dibayar: {moment(purchase.paidAt).format('DD/MM/YYYY HH:mm')} | Expired: {moment(purchase.expiredAt).format('DD/MM/YYYY')}</p>
                          </li>
                        ))}</ul>
                      : <p className="text-sm text-gray-500 italic">Belum ada pembelian.</p>
                    }
                  </div>
                ))
              : <p className="text-gray-500 italic">Tidak ada user yang direferensikan.</p>
            }
          </div>
        </Dialog>
      )}

      {/* Modal Kelola Paket */}
      <Dialog
        visible={paketVisible}
        header={`Kelola Paket — ${paketUser?.name || ''}`}
        width={680}
        footer={null}
        onClose={() => { setPaketVisible(false); setGantiMode(null); setTambahMode(false); }}
      >
        <div className="space-y-4 py-2">
          {paketLoading ? (
            <div className="text-center py-10 text-gray-400">Memuat data...</div>
          ) : (
            <>
              <div>
                <h3 className="font-bold text-indigo-950 mb-3 flex items-center gap-2">
                  <IconPackage size={16} />
                  Paket User
                </h3>

                {/* Tab Aktif / Semua */}
                <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl w-fit">
                  {(['aktif', 'semua'] as const).map(tab => (
                    <button key={tab} onClick={() => setPaketTab(tab)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${paketTab === tab ? 'bg-white text-indigo-950 shadow-sm' : 'text-gray-400'}`}>
                      {tab === 'aktif'
                        ? `Aktif (${userPaketList.filter(isAktif).length})`
                        : `Semua (${userPaketList.length})`}
                    </button>
                  ))}
                </div>

                {filteredPaket.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl">
                    {paketTab === 'aktif' ? 'Tidak ada paket aktif' : 'User belum memiliki paket'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredPaket.map((p: any) => {
                      const aktif = isAktif(p);
                      const isGanti = gantiMode?.id === p.id;
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 ${aktif ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-indigo-950 truncate">{p.namaPaket}</p>
                              <div className="flex gap-3 mt-1 flex-wrap">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                  p.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                  p.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>{p.status}</span>
                                <span className="text-xs text-gray-400">Dibeli: {moment(p.paidAt || p.createdAt).format('DD MMM YYYY')}</span>
                                {p.expiredAt && (
                                  <span className={`text-xs font-semibold ${aktif ? 'text-green-600' : 'text-red-500'}`}>
                                    {aktif ? '✓ Aktif' : '⚠ Expired'}: {moment(p.expiredAt).format('DD MMM YYYY')}
                                  </span>
                                )}
                                {!p.expiredAt && p.status === 'PAID' && (
                                  <span className="text-xs font-semibold text-green-600">✓ Selamanya</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <Button size="small" theme="warning" variant="outline"
                                onClick={() => { setGantiMode(isGanti ? null : p); setSelectedNewPaket(null); }}>
                                Ganti
                              </Button>
                              <Popconfirm content="Hapus paket ini dari user?" theme="danger" onConfirm={() => handleHapusPaket(p.id)}>
                                <Button size="small" theme="danger" variant="outline"><IconX size={12} /></Button>
                              </Popconfirm>
                            </div>
                          </div>

                          {isGanti && (
                            <div className="mt-3 pt-3 border-t border-yellow-100">
                              <p className="text-xs font-bold text-yellow-700 mb-2">Pilih paket pengganti:</p>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Select
                                    options={paketOptions}
                                    value={selectedNewPaket}
                                    onChange={(v: any) => setSelectedNewPaket(v)}
                                    placeholder="Pilih paket baru..."
                                    filterable
                                    clearable
                                  />
                                </div>
                                <Button theme="success" size="small" onClick={handleGantiPaket}
                                  disabled={!selectedNewPaket || saving} loading={saving}>
                                  <IconDeviceFloppy size={14} />
                                  Simpan
                                </Button>
                                <Button theme="default" size="small" onClick={() => setGantiMode(null)}>
                                  Batal
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-indigo-950 flex items-center gap-2">
                    <IconPackageImport size={16} />
                    Tambah Paket
                  </h3>
                  {!tambahMode && (
                    <Button size="small" theme="primary" onClick={() => setTambahMode(true)}>
                      <IconPlus size={14} /> Tambah
                    </Button>
                  )}
                </div>

                {tambahMode && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-700 mb-2">Pilih paket yang akan ditambahkan:</p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          options={paketOptions}
                          value={selectedAddPaket}
                          onChange={(v: any) => setSelectedAddPaket(v)}
                          placeholder="Pilih paket..."
                          filterable
                          clearable
                        />
                      </div>
                      <Button theme="success" size="small" onClick={handleTambahPaket}
                        disabled={!selectedAddPaket || saving} loading={saving}>
                        <IconDeviceFloppy size={14} />
                        Simpan
                      </Button>
                      <Button theme="default" size="small" onClick={() => { setTambahMode(false); setSelectedAddPaket(null); }}>
                        Batal
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">* Paket langsung aktif. Durasi dihitung dari hari ini.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Dialog>

      <BreadCrumb page={[{ name: 'Manage User', link: '/manage-user' }]} />
      <div className="bg-white p-8 rounded-2xl min-w-[400px]">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title border-b border-[#ddd] w-full flex justify-between">
            <h1 className="text-2xl text-indigo-950 font-bold mb-5">Manage User</h1>
            <div className="flex gap-3">
              <Button theme="primary" size="large" variant="dashed" onClick={handleExportExcel} className="hover:shadow-xl">
                <IconFileSpreadsheet size={20} />
              </Button>
              <Button theme="default" size="large" className="border-success hover:bg-success hover:text-white group hover:shadow-xl" onClick={() => setVisible(true)}>
                <IconPlus size={20} className="text-success group-hover:text-white" />
              </Button>
            </div>
          </div>
        </div>
        <TableWrapper data={dataUser} columns={columns} />
      </div>
    </section>
  );
}
