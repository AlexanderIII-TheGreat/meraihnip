import { getData } from '@/utils/axios';
import { imageLink } from '@/utils/image-link';
import { IconBuildingBank, IconUsersGroup } from '@tabler/icons-react';
import moment from 'moment/min/moment-with-locales';
import { useEffect, useState } from 'react';
import { Tag, Button } from 'tdesign-react';

export default function DashboardAdmin() {
  const [data, setData] = useState({
    soal: 0,
    pembelian: 0,
    event: 0,
    voucher: 0,
    user: 0,
    users: [],
    pembelians: [],
  });

  const [onlineStats, setOnlineStats] = useState({
    total_online: 0,
    guests: 0,
    logged_in: 0,
  });

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });
  const [loadingOnline, setLoadingOnline] = useState(false);

  const getDetail = async () => {
    try {
      const res = await getData(`dashboard/admin`);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const getOnlineActivity = async (page = 1) => {
  setLoadingOnline(true);
  try {
    const statsRes = await getData('user-activity/stats');
    const usersRes = await getData(
      `user-activity/online?page=${page}&per_page=${pagination.perPage}`
    );

    // ✅ statsRes SUDAH LANGSUNG ISINYA
    setOnlineStats({
      total_online: statsRes?.total_online ?? 0,
      guests: statsRes?.guests ?? 0,
      logged_in: statsRes?.logged_in ?? 0,
    });

    // ✅ usersRes = { data, meta }
    const usersList = Array.isArray(usersRes?.data) ? usersRes.data : [];

    setOnlineUsers(usersList);

    setPagination({
      currentPage: usersRes?.meta?.current_page ?? 1,
      perPage: usersRes?.meta?.per_page ?? 10,
      total: usersRes?.meta?.total ?? 0,
      lastPage: usersRes?.meta?.last_page ?? 1,
    });

    console.log('Online users fetched:', {
      length: usersList.length,
      total: usersRes?.meta?.total,
      page: usersRes?.meta?.current_page,
      sample: usersList[0]?.name ?? 'no data',
    });
  } catch (err) {
    console.error('Failed fetch online activity:', err);
    setOnlineUsers([]);
  } finally {
    setLoadingOnline(false);
  }
};


  useEffect(() => {
    getDetail();
    getOnlineActivity(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.lastPage) return;
    getOnlineActivity(newPage);
  };
  return (
    <>
      <section className="header ">
        <div className="flex flex-col gap-y-5 md:flex-row md:items-center justify-start md:justify-between header-section w-full">
          <div className="title">
            <h1 className="text-2xl text-indigo-950 font-bold mb-1">
              Dashboard
            </h1>
          </div>
        </div>
      </section>

      <section className="stats pt-10 ">
        <h3 className="text-xl font-semibold text-indigo-950 mb-3">
          Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-7 gap-y-7">
          <div className="item-stat bg-white rounded-2xl p-5">
            <div className="flex flex-row mb-7 justify-between">
              <div className="bg-violet-700 rounded-full w-fit p-3">
                <IconBuildingBank className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl text-indigo-950 font-bold">{data?.soal}</h3>
            <p className="text-sm text-gray-500">Bank Soal</p>
          </div>
          <div className="item-stat bg-white rounded-2xl p-5">
            <div className="flex flex-row mb-7 justify-between">
              <div className="bg-blue-700 rounded-full w-fit p-3">
                <IconUsersGroup className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl text-indigo-950 font-bold">{data?.user}</h3>
            <p className="text-sm text-gray-500">Pengguna</p>
          </div>
          <div className="item-stat bg-white rounded-2xl p-5">
            <div className="flex flex-row mb-7 justify-between">
              <div className="bg-orange-500 rounded-full w-fit p-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.17004 7.43994L12 12.5499L20.77 7.46991"
                    stroke="#fff    "
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 21.6099V12.5399"
                    stroke="#fff  "
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.92999 2.48L4.59 5.45003C3.38 6.12003 2.39001 7.80001 2.39001 9.18001V14.83C2.39001 16.21 3.38 17.89 4.59 18.56L9.92999 21.53C11.07 22.16 12.94 22.16 14.08 21.53L19.42 18.56C20.63 17.89 21.62 16.21 21.62 14.83V9.18001C21.62 7.80001 20.63 6.12003 19.42 5.45003L14.08 2.48C12.93 1.84 11.07 1.84 9.92999 2.48Z"
                    stroke="#fff    "
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 13.24V9.58002L7.51001 4.09998"
                    stroke="#fff    "
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl text-indigo-950 font-bold">
              {data?.pembelian}
            </h3>
            <p className="text-sm text-gray-500">Pembelian</p>
          </div>
          <div className="item-stat bg-white rounded-2xl p-5">
            <div className="flex flex-row mb-7 justify-between">
              <div className="bg-cyan-700 rounded-full w-fit p-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 2V5"
                    stroke="#fff"
                    strokeWidth="2"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2V5"
                    stroke="#fff"
                    strokeWidth="2"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 13H15"
                    stroke="#fff"
                    strokeWidth="2"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 17H12"
                    stroke="#fff"
                    strokeWidth="2"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.5C19.33 3.68 21 4.95 21 9.65V15.83C21 19.95 20 22.01 15 22.01H9C4 22.01 3 19.95 3 15.83V9.65C3 4.95 4.67 3.69 8 3.5H16Z"
                    stroke="#fff"
                    strokeWidth="2"
                    stroke-miterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl text-indigo-950 font-bold">{data.event}</h3>
            <p className="text-sm text-gray-500">Event</p>
          </div>
        </div>
      </section>
    {/* User Online Cards */}
      <section className="pt-10">
        <h3 className="text-xl font-semibold text-indigo-950 mb-3">User Online</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-2xl font-bold text-indigo-950">{onlineStats.total_online}</h3>
            <p className="text-sm text-gray-500">Total Online</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-2xl font-bold text-indigo-950">{onlineStats.logged_in}</h3>
            <p className="text-sm text-gray-500">Logged In</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-2xl font-bold text-indigo-950">{onlineStats.guests}</h3>
            <p className="text-sm text-gray-500">Guest</p>
          </div>
        </div>
      </section>

      {/* Aktivitas User Online + Pagination */}
      <section className="pt-10">
        <h3 className="text-xl font-semibold text-indigo-950 mb-3">Aktivitas User Online</h3>
        <div className="bg-white rounded-2xl p-5 shadow-sm overflow-x-auto">
          {loadingOnline ? (
            <div className="text-center py-10 text-gray-500">Memuat data...</div>
          ) : onlineUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada user online saat ini
              <br />
              <small className="text-xs text-gray-400">
                (Stats menunjukkan {onlineStats.total_online} user)
              </small>
            </div>
          ) : (
            <>
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="text-left text-gray-600 border-b bg-gray-50">
                    <th className="pb-4 pl-2 font-medium">Nama</th>
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Halaman</th>
                    <th className="pb-4 font-medium">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {onlineUsers.map((user, i) => (
                    <tr key={user.id || `user-${i}`} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-2 font-medium text-indigo-950">
                        {user.name || 'Unknown'}
                      </td>
                      <td className="py-4">{user.email || '-'}</td>
                      <td className="py-4">
                        <Tag
                          theme={user.is_guest ? 'default' : 'success'}
                          variant="light"
                          size="medium"
                        >
                          {user.is_guest ? 'Guest' : 'Logged In'}
                        </Tag>
                      </td>
                      <td className="py-4 max-w-[280px] truncate text-gray-700" title={user.url}>
                        {user.url || '-'}
                      </td>
                      <td className="py-4 text-gray-600">
                        {user.last_activity
                          ? moment(Number(user.last_activity)).format('DD MMM YYYY, HH:mm:ss')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination.lastPage > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <Button
                    variant="outline"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-gray-600">
                    Halaman {pagination.currentPage} dari {pagination.lastPage} 
                    (Total: {pagination.total})
                  </div>

                  <Button
                    variant="outline"
                    disabled={pagination.currentPage === pagination.lastPage}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="sales pt-10  grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-7">
        <div className="flex flex-col gap-y-3">
          <h3 className="text-xl font-semibold text-indigo-950">
            Pengguna Terbaru
          </h3>
          <div className="flex flex-col bg-white rounded-2xl p-5">
            <table>
              <tbody className="flex flex-col gap-y-6">
                {data?.users?.map((item: any, index) => (
                  <tr
                    className="flex flex-row items-center 2xl:justify-start justify-between"
                    key={index}
                  >
                    <td className="flex justify-between w-full ">
                      <div className="flex xl:basis-5/12 flex-row gap-x-3 items-center">
                        <img
                          className="h-[50px] w-[50px] rounded-2xl object-cover"
                          src={imageLink(item?.gambar)}
                          alt=""
                        />
                        <div>
                          <a href="#">
                            <h3 className="text-indigo-950 font-semibold text-base">
                              {item?.name}
                            </h3>
                          </a>
                          <p className="text-sm text-gray-500">
                            {moment(item?.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                      <div className="self-center">
                        <Tag
                          theme={item?.verifyAt ? 'success' : 'warning'}
                          size="large"
                          variant="light"
                        >
                          {item?.verifyAt
                            ? 'Terverifikasi'
                            : 'Belum Verifikasi'}
                        </Tag>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-y-3">
          <h3 className="text-xl font-semibold text-indigo-950">
            Pembelian Terbaru
          </h3>
          <div className="flex flex-col bg-white rounded-2xl p-5">
            <table>
              <tbody className="flex flex-col gap-y-6">
                {data?.pembelians?.map((item: any, index) => (
                  <tr
                    className="flex flex-row items-center 2xl:justify-start justify-between"
                    key={index}
                  >
                    <td className="flex justify-between w-full ">
                      <div className="flex xl:basis-5/12 flex-row gap-x-3 items-center">
                        <img
                          className="h-[50px] w-[50px] rounded-2xl object-cover"
                          alt=""
                          src={imageLink(item?.paketPembelian?.gambar)}
                        />
                        <div>
                          <a href="#">
                            <h3 className="text-indigo-950 font-semibold text-base">
                              {item?.namaPaket}
                            </h3>
                          </a>
                          <p className="text-sm text-gray-500">
                            {moment(item?.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                      <div className="self-center">
                        <Tag
                          theme={
                            item?.status === 'PAID'
                              ? 'success'
                              : item?.status === 'UNPAID'
                              ? 'warning'
                              : 'danger'
                          }
                          size="large"
                          variant="light"
                        >
                          {item?.status}
                        </Tag>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
