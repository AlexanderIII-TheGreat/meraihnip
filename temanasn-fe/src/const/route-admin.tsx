import { Route } from 'react-router-dom';

import ManageSoalParentCategory from '@/pages/admin/manage-soal-parent-category';
import ManageSoalCategory from '@/pages/admin/manage-soal-category';
import Logs from '@/pages/admin/logs';
import Dashboard from '@/pages/admin/dashboard';
import User from '@/pages/admin/users';
import Voucher from '@/pages/admin/vouchers';
import ManageSoal from '@/pages/admin/manage-soal';
import ManagePaket from '@/pages/admin/manage-paket';
import ManagePaketCategory from '@/pages/admin/manage-paket-category';
import ManagePaketLatihan from '@/pages/admin/manage-paket-latihan';
import ManageSoalPaketLatihan from '@/pages/admin/manage-paket-latihan-soal';
import ManagePaketPembelian from '@/pages/admin/manage-paket-pembelian';
import ManagePaketPembelianMateri from '@/pages/admin/manage-paket-pembelian-materi';
import ManagePaketPembelianBimbel from '@/pages/admin/manage-paket-pembelian-bimbel';
import ManagePaketPembelianFitur from '@/pages/admin/manage-paket-pembelian-fitur';
import ManagePaketPembelianTryout from '@/pages/admin/manage-paket-pembelian-tryout';
import Penjualan from '@/pages/admin/penjualan';
import ManageEvent from '@/pages/admin/event';
import ManageHomePage from '@/pages/admin/manage-home-section';
import RiwayatTryoutAdmin from '@/pages/admin/riwayat-tryout-admin';
import ManageNotification from '@/pages/admin/manage-notification';
import TicketIndex from '@/pages/admin/ticket';
import DashboardNotification from '@/pages/admin/notificationdash';
import Feedback from '@/pages/admin/feedback';
import Affiliate from '@/pages/admin/affiliate';
import AffiliateCommission from '@/pages/admin/affiliate-commission';
import RekapPenjualan from '@/pages/admin/rekap-penjualan';
import ManageSoalKecermatan from '@/pages/admin/manage-soal-kecermatan';
import ManageKiasan from '@/pages/admin/manage-soal-kecermatan/detail';
import ManageSoalKecermatanList from '@/pages/admin/manage-soal-kecermatan/soal';
import ManageTestimoni from '@/pages/admin/manage-testimoni/index';
import ManageBerita from '@/pages/admin/manage-berita/index';
import ManageKalenderEvent from '@/pages/admin/manage-kalender-event';
import ManagePaketSoalGenerate from '@/pages/admin/manage-paket-soal-generate';
import ManageSoalGenerate from '@/pages/admin/manage-soal-generate';
import ManageSoalGenerateDetail from '@/pages/admin/manage-soal-generate/detail';
import ManageSoalGenerateHistory from '@/pages/admin/manage-soal-generate-history';
import SidebarMenuSetting from '@/pages/admin/sidebar-menu-setting';
import ManageSoalGenerateSub from '@/pages/admin/manage-soal-generate/sub-category';
import ManageWhatsappAdmin from '@/pages/admin/manage-whatsapp-admin';
import ManageFaqChatbot from '@/pages/admin/manage-faq-chatbot';

export const adminRoutes = [
  <Route path="/dashboard" element={<Dashboard />} />,
  <Route path="/rekap-penjualan" element={<RekapPenjualan />} />,
  <Route path="/manage-user" element={<User />} />,
  <Route path="/manage-penjualan" element={<Penjualan />} />,
  <Route path="/manage-soal-category" element={<ManageSoalParentCategory />} />,
  <Route
    path="/manage-soal-subcategory/:id"
    element={<ManageSoalCategory />}
  />,
  <Route path="/manage-event" element={<ManageEvent />} />,
  <Route path="/manage-kalender-event" element={<ManageKalenderEvent />} />,
  <Route path="/manage-soal/:id" element={<ManageSoal />} />,
  <Route path="/manage-voucher" element={<Voucher />} />,
  <Route path="/manage-paket" element={<ManagePaketCategory />} />,
  <Route path="/manage-paket/:id" element={<ManagePaket />} />,
  <Route path="/manage-latihan" element={<ManagePaketLatihan />} />,
  <Route path="/manage-latihan/:id" element={<ManageSoalPaketLatihan />} />,
  <Route path="/manage-pembelian" element={<ManagePaketPembelian />} />,
  <Route path="/manage-notifikasi" element={<ManageNotification />} />,
  <Route path="/manage-home-section" element={<ManageHomePage />} />,
  <Route path="/dashboard-notification" element={<DashboardNotification />} />,
  <Route path="/feedbacks" element={<Feedback />} />,
  <Route path="/affiliate" element={<Affiliate />} />,
  <Route path="/affiliate-commission" element={<AffiliateCommission />} />,
  <Route
    path="/manage-pembelian/:id/materi"
    element={<ManagePaketPembelianMateri />}
  />,
  <Route
    path="/manage-pembelian/:id/bimbel"
    element={<ManagePaketPembelianBimbel />}
  />,
  <Route
    path="/manage-pembelian/:id/fitur"
    element={<ManagePaketPembelianFitur />}
  />,
  <Route
    path="/manage-pembelian/:id/tryout"
    element={<ManagePaketPembelianTryout />}
  />,
  <Route
    path="/manage-pembelian/:id/tryout/:paketPembelianTryoutId/:latihanId"
    element={<RiwayatTryoutAdmin />}
  />,

  <Route path="/manage-ticket" element={<TicketIndex />} />,
  <Route path="/manage-soal-kecermatan" element={<ManageSoalKecermatan />} />,
  <Route path="/manage-soal-kecermatan/:id" element={<ManageKiasan />} />,
  <Route path="/manage-soal-kecermatan/:id/soal/:kiasanId" element={<ManageSoalKecermatanList />} />,

  <Route path="/manage-testimoni" element={<ManageTestimoni />} />,
  <Route path="/manage-berita" element={<ManageBerita />} />,
  <Route path="/manage-paket-soal-generate" element={<ManagePaketSoalGenerate />} />,
  <Route path="/manage-soal-generate" element={<ManageSoalGenerate />} />,
  <Route path="/manage-soal-generate-sub/:parentId" element={<ManageSoalGenerateSub />} />,
  <Route path="/manage-soal-generate/:id" element={<ManageSoalGenerateDetail />} />,
  <Route path="/manage-soal-generate-history" element={<ManageSoalGenerateHistory />} />,
  <Route path="/sidebar-menu-setting" element={<SidebarMenuSetting />} />,

  <Route path="/manage-whatsapp-admin" element={<ManageWhatsappAdmin />} />,
  <Route path="/manage-faq-chatbot" element={<ManageFaqChatbot />} />,
  <Route path="/logs" element={<Logs />} />,
];
