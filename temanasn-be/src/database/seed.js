const database = require('#database');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing database tables...');
  
  // Clean up existing records in order to prevent duplication during re-runs
  await database.faqChatbot.deleteMany({});
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
  await database.generateSoalHistoryDetail.deleteMany({});
  await database.generateSoalHistory.deleteMany({});
  await database.chatTicket.deleteMany({});
  await database.tickets.deleteMany({});
  await database.notificationUser.deleteMany({});

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
      name: 'Abiyyu',
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
      id: 7, // Match /my-class/7
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
      id: 6, // Match /my-class/7/tryout/1/6
      nama: 'Tryout Akbar CAT Nasional Ke-1',
      kkm: 311,
      banner: 'public/BANNER_DEFAULT.png',
      isShareAnswer: true,
      keterangan: 'Simulasi tryout akbar berskala nasional dengan sistem CAT.',
      waktu: 100,
      type: 'TRYOUT',
    }
  });

  // Seed paketPembelianTryout
  const ppt = await database.paketPembelianTryout.create({
    data: {
      id: 1, // Match /my-class/7/tryout/1
      paketPembelianId: paket.id,
      paketLatihanId: paketLatihan2.id,
      type: 'TRYOUT',
    }
  });

  const today = new Date();

  // Tryout 1: 6 days ago (Monday) - 60 mins (3600 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 320,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 6 * 24 * 3600 * 1000),
      waktuPengerjaan: 3600,
      createdAt: new Date(today.getTime() - 6 * 24 * 3600 * 1000),
    }
  });

  // Tryout 2: 5 days ago (Tuesday) - 80 mins (4800 secs)
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

  // Tryout 3: 4 days ago (Wednesday) - 75 mins (4500 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 390,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 4 * 24 * 3600 * 1000),
      waktuPengerjaan: 4500,
      createdAt: new Date(today.getTime() - 4 * 24 * 3600 * 1000),
    }
  });

  // Tryout 4: 3 days ago (Thursday) - 90 mins (5400 secs)
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

  // Tryout 5: 2 days ago (Friday) - 85 mins (5100 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 410,
      kkm: 311,
      maxPoint: 500,
      finishAt: new Date(today.getTime() - 2 * 24 * 3600 * 1000),
      waktuPengerjaan: 5100,
      createdAt: new Date(today.getTime() - 2 * 24 * 3600 * 1000),
    }
  });

  // Tryout 6: 1 day ago (Saturday) - 100 mins (6000 secs) - ID 10
  const tryoutMain = await database.tryout.create({
    data: {
      id: 10, // Match /my-class/7/tryout/1/6/10
      userId: testUser.id,
      paketLatihanId: paketLatihan2.id,
      paketPembelianTryoutId: ppt.id,
      point: 250, // Will be computed from sum of points
      kkm: 311,
      maxPoint: 550,
      finishAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000),
      waktuPengerjaan: 6000,
      createdAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000),
    }
  });

  // Tryout 7: Today (Sunday) - 95 mins (5700 secs)
  await database.tryout.create({
    data: {
      userId: testUser.id,
      paketLatihanId: paketLatihan1.id,
      point: 430,
      kkm: 311,
      maxPoint: 500,
      finishAt: today,
      waktuPengerjaan: 5700,
      createdAt: today,
    }
  });

  // Seed TryoutSoal records for tryout ID 10 to feed statistic charts
  console.log('Seeding TryoutSoal records for tryout 10...');
  
  // TWK: 30 Questions, max 150 points. KKM 65.
  const twkSubcategories = ["Nasionalisme", "Pilar Negara", "Integritas"];
  for (let i = 1; i <= 30; i++) {
    const isAnswered = i % 10 !== 0; // 3 unanswered
    const isCorrect = isAnswered && (i % 2 === 0); // half correct
    const point = isCorrect ? 5 : 0;

    await database.tryoutSoal.create({
      data: {
        tryoutId: tryoutMain.id,
        soalId: i,
        soal: `<p>Pertanyaan TWK tentang ${twkSubcategories[i % 3]} nomor ${i}</p>`,
        jawaban: JSON.stringify([{ id: 1, jawaban: 'Pilihan A', isCorrect: true, point: 5 }]),
        jawabanShow: 'Pilihan A',
        jawabanSelect: isAnswered ? 1 : null,
        isCorrect: isCorrect,
        pembahasan: '<p>Pembahasan soal TWK ini.</p>',
        point: point,
        kkm: 65,
        maxPoint: 150,
        category: 'TWK',
        categoryKet: 'Tes Wawasan Kebangsaan',
        duration: 10 + i,
        subCategory: twkSubcategories[i % 3],
        tipePenilaian: 'BENAR_SALAH'
      }
    });
  }

  // TIU: 35 Questions, max 175 points. KKM 80.
  const tiuSubcategories = ["Verbal", "Numerik", "Figural"];
  for (let i = 1; i <= 35; i++) {
    const isAnswered = i % 12 !== 0; // 3 unanswered
    const isCorrect = isAnswered && (i % 3 !== 0); // 2/3 correct
    const point = isCorrect ? 5 : 0;

    await database.tryoutSoal.create({
      data: {
        tryoutId: tryoutMain.id,
        soalId: 100 + i,
        soal: `<p>Pertanyaan TIU tentang ${tiuSubcategories[i % 3]} nomor ${i}</p>`,
        jawaban: JSON.stringify([{ id: 1, jawaban: 'Pilihan A', isCorrect: true, point: 5 }]),
        jawabanShow: 'Pilihan A',
        jawabanSelect: isAnswered ? 1 : null,
        isCorrect: isCorrect,
        pembahasan: '<p>Pembahasan soal TIU ini.</p>',
        point: point,
        kkm: 80,
        maxPoint: 175,
        category: 'TIU',
        categoryKet: 'Tes Inteligensia Umum',
        duration: 8 + i,
        subCategory: tiuSubcategories[i % 3],
        tipePenilaian: 'BENAR_SALAH'
      }
    });
  }

  // TKP: 45 Questions, max 225 points. KKM 166.
  const tkpSubcategories = ["Pelayanan Publik", "Jejaring Kerja", "Sosial Budaya"];
  for (let i = 1; i <= 45; i++) {
    const isAnswered = i % 15 !== 0; // 3 unanswered
    // Point assignment 1 to 5 for answered
    const point = isAnswered ? ((i % 5) + 1) : 0;

    await database.tryoutSoal.create({
      data: {
        tryoutId: tryoutMain.id,
        soalId: 200 + i,
        soal: `<p>Pertanyaan TKP tentang ${tkpSubcategories[i % 3]} nomor ${i}</p>`,
        jawaban: JSON.stringify([
          { id: 5, jawaban: 'Sangat Sesuai', isCorrect: false, point: 5 },
          { id: 4, jawaban: 'Sesuai', isCorrect: false, point: 4 },
          { id: 3, jawaban: 'Ragu-ragu', isCorrect: false, point: 3 },
          { id: 2, jawaban: 'Tidak Sesuai', isCorrect: false, point: 2 },
          { id: 1, jawaban: 'Sangat Tidak Sesuai', isCorrect: false, point: 1 }
        ]),
        jawabanShow: 'Sangat Sesuai',
        jawabanSelect: isAnswered ? ((i % 5) + 1) : null,
        isCorrect: false,
        pembahasan: '<p>Pembahasan soal TKP ini.</p>',
        point: point,
        kkm: 166,
        maxPoint: 225,
        category: 'TKP',
        categoryKet: 'Tes Karakteristik Pribadi',
        duration: 12 + i,
        subCategory: tkpSubcategories[i % 3],
        tipePenilaian: 'POINT'
      }
    });
  }

  // Recalculate and update tryout total score based on sum of TryoutSoal points
  const totalPoints = await database.tryoutSoal.aggregate({
    where: { tryoutId: tryoutMain.id },
    _sum: { point: true }
  });
  await database.tryout.update({
    where: { id: tryoutMain.id },
    data: { point: totalPoints._sum.point || 0 }
  });

  console.log('PaketLatihan, Tryout, and TryoutSoal stats seeded.');

  // Seed FAQ chatbot
  console.log('Seeding FAQ chatbot...');
  const faqs = [
    { question: 'Cara Lihat Pembahasan Tryout', answer: 'Klik menu paket saya > pilih tryout > klik tombol pembahasan pada tryout yang sudah selesai.', orderNo: 1 },
    { question: 'Cara Gabung Grup Telegram', answer: 'Link grup Telegram tersedia di dashboard setelah pembelian paket Anda dikonfirmasi.', orderNo: 2 },
    { question: 'Cara Reset Password Akun', answer: 'Masuk ke menu profile > pilih opsi ganti password, atau hubungi admin jika lupa password.', orderNo: 3 },
    { question: 'Cara Akses Rekaman Bimbel', answer: 'Klik menu bimbel > klik tombol tonton pada tab rekaman', orderNo: 4 },
    { question: 'Pembelian Belum Terkonfirmasi ?', answer: 'Kirim bukti transfer ke WhatsApp admin melalui tombol Hubungi Chat WA.', orderNo: 5 }
  ];

  for (const faq of faqs) {
    await database.faqChatbot.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        orderNo: faq.orderNo,
        isActive: true,
      }
    });
  }
  console.log('FAQ chatbot items seeded.');

  // 7. Seed Feedback Setting
  await database.feedbackSetting.create({
    data: {
      isActive: true,
    }
  });
  console.log('Feedback settings seeded.');

  // 8. Seed GenerateSoalHistory & Details for Abiyyu
  console.log('Seeding GenerateSoalHistory for Abiyyu...');
  const genHistory1 = await database.generateSoalHistory.create({
    data: {
      userId: testUser.id,
      name: 'Simulasi Mandiri IPA - Mudah',
      kkm: 80,
      jumlahSoal: 10,
      tingkatKesulitan: 'mudah',
      kategori: 'IPA',
      score: 45,
      waktu: 600,
      createdAt: new Date(today.getTime() - 2 * 24 * 3600 * 1000),
      updatedAt: new Date(today.getTime() - 2 * 24 * 3600 * 1000),
    }
  });

  for (let i = 1; i <= 10; i++) {
    const isCorrect = i <= 9; // 9 correct, 1 wrong
    await database.generateSoalHistoryDetail.create({
      data: {
        generateSoalHistoryId: genHistory1.id,
        generateSoalCategoryId: 3, // IPA
        soal: `<p>Berapakah hasil dari pertanyaan IPA nomor ${i}?</p>`,
        jawaban: JSON.stringify([{ id: 1, value: 'Pilihan A', isCorrect: true }]),
        jawabanShow: 'Pilihan A',
        jawabanSelect: '1',
        isCorrect: isCorrect,
        pembahasan: '<p>Pembahasan soal IPA.</p>',
        point: isCorrect ? 5 : 0,
        kkm: 80,
        maxPoint: 5,
        category: 'IPA',
        categoryKet: 'Kategori IPA',
        duration: 30 + i,
        subCategory: 'IPA Sub',
        tipePenilaian: 'BENAR_SALAH',
        tingkatkesulitansoal: 'mudah'
      }
    });
  }
  console.log('GenerateSoalHistory seeded.');

  // 9. Seed Support Tickets for Abiyyu
  console.log('Seeding tickets for Abiyyu...');
  const ticket1 = await database.tickets.create({
    data: {
      userId: testUser.id,
      title: 'Kendala Akses Pembahasan Tryout',
      description: 'Halo admin, saya baru menyelesaikan Tryout Akbar Ke-1 tapi pembahasannya belum muncul di tab pembahasan. Mohon bantuannya.',
      category: 'Tryout',
      status: 'resolved',
      adminResponse: 'Halo Abiyyu, terima kasih sudah menghubungi kami. Pembahasan Tryout Akbar baru akan dibuka secara otomatis setelah periode Tryout Akbar selesai (biasanya Lusa). Silakan cek kembali saat waktu pengerjaan tryout nasional ditutup ya.',
      createdAt: new Date(today.getTime() - 4 * 24 * 3600 * 1000),
      updatedAt: new Date(today.getTime() - 4 * 24 * 3600 * 1000),
    }
  });

  await database.chatTicket.create({
    data: {
      userId: testUser.id,
      ticketId: ticket1.id,
      message: 'Halo admin, saya baru menyelesaikan Tryout Akbar Ke-1 tapi pembahasannya belum muncul di tab pembahasan. Mohon bantuannya.',
      createdAt: new Date(today.getTime() - 4 * 24 * 3600 * 1000),
    }
  });

  await database.chatTicket.create({
    data: {
      userId: adminUser.id,
      ticketId: ticket1.id,
      message: 'Halo Abiyyu, terima kasih sudah menghubungi kami. Pembahasan Tryout Akbar baru akan dibuka secara otomatis setelah periode Tryout Akbar selesai (biasanya Lusa). Silakan cek kembali saat waktu pengerjaan tryout nasional ditutup ya.',
      createdAt: new Date(today.getTime() - 3.9 * 24 * 3600 * 1000),
    }
  });
  console.log('Support tickets seeded.');

  // 10. Seed NotificationUser for Abiyyu
  console.log('Seeding notifications for Abiyyu...');
  await database.notificationUser.create({
    data: {
      userId: testUser.id,
      title: 'Pembayaran Paket Platinum Berhasil',
      keterangan: 'Selamat! Pembayaran untuk Paket Platinum CPNS & PPPK 2026 Anda telah diverifikasi oleh admin. Sekarang Anda dapat mengakses semua fitur pembelajaran.',
      type: 'SYSTEM',
      status: 'PAYMENT_SUCCESS',
      isRead: false,
      createdAt: new Date(today.getTime() - 5 * 24 * 3600 * 1000),
    }
  });

  await database.notificationUser.create({
    data: {
      userId: testUser.id,
      title: 'Tryout Akbar Ke-1 Telah Dibuka',
      keterangan: 'Simulasi CAT Nasional Ke-1 sudah dibuka. Mulai kerjakan sekarang untuk mengukur kemampuan nasional Anda!',
      type: 'USER',
      status: 'BIMBEL_CHANGES',
      url: '/my-class/7/tryout/1/6',
      isRead: false,
      createdAt: new Date(today.getTime() - 1 * 24 * 3600 * 1000),
    }
  });
  console.log('Notifications seeded.');

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
