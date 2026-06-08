const database = require('#database');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing database tables...');
  
  // Clean up existing records in order to prevent duplication during re-runs
  await database.tryoutSoal.deleteMany({});
  await database.tryout.deleteMany({});
  await database.paketLatihan.deleteMany({});
  await database.sidebarMenu.deleteMany({});
  await database.testimoni.deleteMany({});
  await database.homeSection.deleteMany({});
  await database.kalenderEvent.deleteMany({});
  await database.paketPembelianCategory.deleteMany({});
  await database.paketPembelian.deleteMany({});
  await database.user.deleteMany({});
  await database.feedbackSetting.deleteMany({});
  await database.berita.deleteMany({});

  console.log('Seeding data...');

  // 1. Seed Users
  const adminUser = await database.user.create({
    data: {
      email: 'admin@bimbel.com',
      name: 'Super Admin',
      noWA: '+6281234567890',
      jenisKelamin: 'L',
      alamat: 'Jl. Admin No. 1',
      provinsi: 'DKI Jakarta',
      kabupaten: 'Jakarta Pusat',
      kecamatan: 'Gambir',
      password: '$2a$10$Hjzp1MtX/psnNT7icxcd/ee8GR0fsNItOEAwUfMcGw2c8jaHxVbAm', // password: admin
      gambar: 'public/DEFAULT_USER.png',
      role: 'ADMIN',
      verifyAt: new Date(),
    }
  });

  const userPasswordHash = await bcrypt.hash('Abiyyu132109#', 10);

  const testUser = await database.user.create({
    data: {
      email: 'abiyyu@gmail.com',
      name: 'Budi Santoso',
      noWA: '+6289876543210',
      jenisKelamin: 'L',
      alamat: 'Jl. Pemuda No. 45',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Coblong',
      password: userPasswordHash,
      gambar: 'public/DEFAULT_USER.png',
      role: 'USER',
      verifyAt: new Date(),
    }
  });

  // Keep compatibility with potential hardcoded admin logins in old tests
  await database.user.create({
    data: {
      email: 'admin',
      name: 'Bob Admin',
      noWA: '+123456789',
      jenisKelamin: 'L',
      password: '$2a$10$Hjzp1MtX/psnNT7icxcd/ee8GR0fsNItOEAwUfMcGw2c8jaHxVbAm',
      role: 'USER',
      verifyAt: new Date(),
    }
  });

  console.log('Users seeded.');

  // 2. Seed Sidebar Menus
  const menus = [
    { title: 'Home', link: '/', icon: 'IconHome2', order: 1 },
    { title: 'Generate Soal Otomatis', link: '/generate-soal', icon: 'IconBuildingStore', order: 2 },
    { title: 'Paket Pembelian', link: '/paket-pembelian', icon: 'IconBuildingStore', order: 3 },
    { title: 'Layanan Bantuan', link: '/my-tickets', icon: 'IconTicket', order: 4 },
    { title: 'Event', link: '/event', icon: 'IconCalendarEvent', order: 5 },
    { title: 'Riwayat Pembelian', link: '/paket-pembelian/riwayat', icon: 'IconBrandCashapp', order: 6 },
  ];

  for (const menu of menus) {
    await database.sidebarMenu.create({
      data: {
        title: menu.title,
        link: menu.link,
        icon: menu.icon,
        order: menu.order,
        isActive: true,
        hasBadge: menu.title === 'Generate Soal Otomatis',
      }
    });
  }
  console.log('Sidebar menus seeded.');

  // 3. Seed Testimoni
  const testimonies = [
    { nama: 'Budi Santoso', pekerjaan: 'Lulus PNS Kemenkumham', rating: 5, isi: 'Materi tryout di website ini sangat akurat dan mirip sekali dengan soal ujian asli. Saya berhasil lulus CPNS dalam satu kali tes!' },
    { nama: 'Siti Rahma', pekerjaan: 'Lulus PPPK Guru 2025', rating: 5, isi: 'Sangat terbantu dengan fitur statistik belajarnya, jadi saya tahu kelemahan materi saya di bagian mana. Rekomendasi banget!' },
    { nama: 'Dedi Kurniawan', pekerjaan: 'Taruna Akpol', rating: 5, isi: 'Latihan soal kecermatannya keren banget, melatih fokus mental saya untuk ujian polri.' },
    { nama: 'Ahmad Fauzi', pekerjaan: 'Lulus BUMN KAI 2025', rating: 5, isi: 'Sistem ujian CAT-nya luar biasa responsif dan pembahasan soalnya sangat mudah dipahami. Terima kasih TemanASN!' },
    { nama: 'Larasati Putri', pekerjaan: 'Lulus CPNS Kemenkeu', rating: 5, isi: 'Sangat menyukai ribuan bank soal yang selalu up-to-date. Belajar jadi lebih terarah dan efisien setiap hari.' },
    { nama: 'Ryan Hidayat', pekerjaan: 'Lulus PPPK Tenaga Kesehatan', rating: 5, isi: 'Fitur generate soal otomatis sangat membantu saya fokus ke materi medis yang paling sering keluar di ujian.' },
    { nama: 'Diana Lestari', pekerjaan: 'Lulus CPNS Pemprov DKI', rating: 5, isi: 'Fitur tryout akbar gratis sangat membantu saya membiasakan diri dengan persaingan ujian sesungguhnya. Nilai saya meningkat tajam!' },
    { nama: 'Hendra Wijaya', pekerjaan: 'Lulus PPPK Teknis 2025', rating: 5, isi: 'Aplikasi ini sangat ringan digunakan di HP. Saya bisa latihan soal kapan saja dan di mana saja saat senggang.' },
    { nama: 'Fitriani', pekerjaan: 'Taruni Akmil 2026', rating: 5, isi: 'Paket latihan soal kecerdasan dan akademiknya sangat lengkap. Sangat menunjang persiapan fisik dan mental saya.' }
  ];

  for (const t of testimonies) {
    await database.testimoni.create({
      data: t
    });
  }
  console.log('Testimonials seeded.');

  // 4. Seed HomeSection (Banner and Custom Content)
  await database.homeSection.createMany({
    data: [
      {
        title: 'Promo Paket Super Intensif CPNS 2026',
        keterangan: 'Dapatkan diskon hingga 50% untuk pembelian paket belajar pertama Anda!',
        url: '/paket-pembelian',
        gambar: 'public/BANNER_DEFAULT.png',
        tipe: 'BANNER',
      },
      {
        title: 'Tryout Akbar CAT Nasional Terbuka',
        keterangan: 'Ikuti simulasi ujian CAT nasional serentak secara online dan ukur kemampuan Anda!',
        url: '/paket-pembelian',
        gambar: 'public/BANNER_DEFAULT.png',
        tipe: 'BANNER',
      },
      {
        title: 'Layanan Bantuan 24/7 Terintegrasi',
        keterangan: 'Ada kendala atau pertanyaan? Hubungi tim mentor kami secara langsung melalui fitur Support Ticket.',
        url: '/my-tickets',
        gambar: 'public/BANNER_DEFAULT.png',
        tipe: 'BANNER',
      },
      {
        title: 'Selamat Datang di MeraihNIP!',
        keterangan: '<p>Persiapkan diri Anda menghadapi seleksi ASN dengan ribuan bank soal terupdate dan tryout interaktif terbaik.</p>',
        tipe: 'CUSTOM',
      }
    ]
  });
  console.log('Home sections seeded.');

  // 5. Seed KalenderEvent
  await database.kalenderEvent.create({
    data: {
      nama: 'Tryout Akbar Nasional CPNS 2026',
      keterangan: 'Simulasi ujian CAT nasional serentak secara online.',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Besok
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Lusa
    }
  });
  console.log('Calendar events seeded.');

  // Seed Berita
  const newsItems = [
    {
      judul: 'Membahas Ujian CPNS, PPPK Wajib Tahu Hal Ini!',
      isi: 'Persiapan menghadapi ujian CPNS dan PPPK tahun ini memerlukan strategi belajar yang terencana. Berikut rangkuman materi krusial.',
      gambar: 'public/BANNER_DEFAULT.png',
    },
    {
      judul: 'Tips Sukses Menghadapi Ujian SKD CPNS 2026',
      isi: 'Berikut adalah kumpulan tips praktis untuk membagi waktu saat mengerjakan soal TWK, TIU, dan TKP agar lulus passing grade.',
      gambar: 'public/BANNER_DEFAULT.png',
    }
  ];

  for (const news of newsItems) {
    await database.berita.create({
      data: news
    });
  }
  console.log('Berita items seeded.');

  // 6. Seed Paket Pembelian
  const paket = await database.paketPembelian.create({
    data: {
      nama: 'Paket Platinum CPNS & PPPK 2026',
      harga: 250000,
      keterangan: 'Akses penuh ke semua materi pembelajaran, video tutor, 10+ simulasi CAT, dan grup diskusi khusus.',
      durasi: 365,
      isActive: true,
      panduan: 'Silakan masuk ke menu Paket Saya setelah pembayaran berhasil diverifikasi.',
    }
  });

  await database.paketPembelianCategory.create({
    data: {
      paketPembelianId: paket.id,
      nama: 'CPNS / PPPK',
    }
  });
  
  // Seed paketPembelianMateri
  await database.paketPembelianMateri.create({
    data: {
      paketPembelianId: paket.id,
      nama: 'Materi Tes Wawasan Kebangsaan (TWK) Lengkap',
      materi: 'Panduan lengkap UUD 1945, Pancasila, Pilar Negara, dan Bela Negara.',
    }
  });

  // Seed paketPembelianFitur
  await database.paketPembelianFitur.create({
    data: {
      paketPembelianId: paket.id,
      nama: 'Akses Grup WhatsApp Eksklusif',
    }
  });

  // Seed a PAID Pembelian for the testUser so they have "Paket Saya" on the dashboard
  await database.pembelian.create({
    data: {
      userId: testUser.id,
      paketPembelianId: paket.id,
      namaPaket: paket.nama,
      duration: paket.durasi,
      status: 'PAID',
      amount: paket.harga,
      paymentMethod: 'MANUAL',
      invoice: 'INV-' + Date.now(),
      paidAt: new Date(),
      expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  });

  console.log('Purchase packages and user purchase seeded.');

  // Seed PaketLatihan & Tryouts to make the study stats look active
  console.log('Seeding PaketLatihan and Tryout stats...');
  const paketLatihan1 = await database.paketLatihan.create({
    data: {
      nama: 'Simulasi Mandiri SKD CPNS 2026',
      kkm: 311,
      banner: 'public/BANNER_DEFAULT.png',
      isShareAnswer: true,
      keterangan: 'Paket latihan soal Mandiri SKD materi TWK, TIU, dan TKP.',
      waktu: 90,
      type: 'BIASA',
    }
  });

  const paketLatihan2 = await database.paketLatihan.create({
    data: {
      nama: 'Tryout Akbar CAT Nasional Ke-1',
      kkm: 311,
      banner: 'public/BANNER_DEFAULT.png',
      isShareAnswer: true,
      keterangan: 'Simulasi tryout akbar berskala nasional dengan sistem CAT.',
      waktu: 100,
      type: 'TRYOUT',
    }
  });

  const today = new Date();

  // Tryout 1: 5 days ago (Monday) - 80 mins (4800 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 380,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 5 * 24 * 3600 * 1000),
      waktuPengerjaan: 4800,
      createdAt: new Date(today.getTime() - 5 * 24 * 3600 * 1000),
    }
  });

  // Tryout 2: 3 days ago (Wednesday) - 90 mins (5400 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 420,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 3 * 24 * 3600 * 1000),
      waktuPengerjaan: 5400,
      createdAt: new Date(today.getTime() - 3 * 24 * 3600 * 1000),
    }
  });

  // Tryout 3: 1 day ago (Friday) - 100 mins (6000 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan2.id,
      point: 395,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000),
      waktuPengerjaan: 6000,
      createdAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000),
    }
  });

  console.log('PaketLatihan and Tryout stats seeded.');

  // 7. Seed Feedback Setting
  await database.feedbackSetting.create({
    data: {
      isActive: true,
    }
  });
  console.log('Feedback settings seeded.');

  console.log('Database Seeding Completed Successfully!');
}

main()
  .then(async () => {
    await database.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seeding:', e);
    await database.$disconnect();
    process.exit(1);
  });
