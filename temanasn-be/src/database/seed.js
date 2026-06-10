const database = require('#database');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing global database tables...');
  
  // Clean up global/non-user tables to prevent duplicates
  await database.faqChatbot.deleteMany({});
  await database.sidebarMenu.deleteMany({});
  await database.testimoni.deleteMany({});
  await database.homeSection.deleteMany({});
  await database.kalenderEvent.deleteMany({});
  await database.feedbackSetting.deleteMany({});
  await database.berita.deleteMany({});

  console.log('Seeding data...');

  // 1. Seed Users (only create if not exists, preserving existing users)
  let adminUser = await database.user.findFirst({
    where: { email: 'admin@bimbel.com' }
  });
  if (!adminUser) {
    adminUser = await database.user.create({
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
  }

  const userPasswordHash = await bcrypt.hash('Abiyyu132109#', 10);

  let testUser = await database.user.findFirst({
    where: { email: 'abiyyu@gmail.com' }
  });
  if (!testUser) {
    testUser = await database.user.create({
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
  }

  let adminUserCompat = await database.user.findFirst({
    where: { email: 'admin' }
  });
  if (!adminUserCompat) {
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
  }

  console.log('Users verified / seeded.');

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
        title: 'Selamat Datang di Astero!',
        keterangan: '<p>Persiapkan diri Anda menghadapi seleksi ASN dengan ribuan bank soal terupdate dan tryout interaktif terbaik.</p>',
        tipe: 'CUSTOM',
      }
    ]
  });
  console.log('Home sections seeded.');

  // 5. Seed KalenderEvent
  const calendarEvents = [
    {
      nama: 'Tryout Akbar Nasional CPNS 2026',
      keterangan: 'Simulasi ujian CAT nasional serentak secara online.',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Besok
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Lusa
    },
    {
      nama: 'Bimbel Live SKD: Tips & Trik TIU Numerik',
      keterangan: 'Pembahasan rumus cepat deret angka dan berhitung cepat bersama Coach Astero.',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 hari lalu
      endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    },
    {
      nama: 'Kelas Eksklusif TWK: Pilar Negara & UUD 1945',
      keterangan: 'Pendalaman materi bela negara dan konstitusi RI.',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 hari lagi
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    },
    {
      nama: 'Simulasi Mini-Test Mingguan Ke-3',
      keterangan: 'Uji kemampuan mingguan materi campuran SKD.',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 hari lagi
      endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      nama: 'Webinar Strategi Lolos Passing Grade CPNS 2026',
      keterangan: 'Diskusi panel bersama alumni yang sukses lolos formasi CPNS favorit.',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 hari lalu
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    },
    {
      nama: 'Bimbingan Konseling Formasi Instansi Pusat',
      keterangan: 'Konsultasi pemilihan formasi yang paling realistis dan minim persaingan.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari lagi
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    }
  ];

  for (const eventItem of calendarEvents) {
    await database.kalenderEvent.create({
      data: eventItem
    });
  }
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
    },
    {
      judul: 'Formasi Terbanyak Seleksi CPNS Kemenkumham RI 2026',
      isi: 'Kementerian Hukum dan Hak Asasi Manusia membuka formasi besar-besaran untuk lulusan SMA/SMK sederajat dan Sarjana.',
      gambar: 'public/BANNER_DEFAULT.png',
    },
    {
      judul: 'Memahami Tipe Penilaian TKP (Tes Karakteristik Pribadi)',
      isi: 'TKP tidak memiliki jawaban salah, namun memiliki skala nilai dari 1 sampai 5. Pelajari cara memilih jawaban bernilai tertinggi.',
      gambar: 'public/BANNER_DEFAULT.png',
    },
    {
      judul: 'Update Alur Seleksi Administrasi Berkas CPNS 2026',
      isi: 'Pastikan dokumen seperti ijazah, KTP, dan surat lamaran telah diunggah dengan format dan ukuran yang tepat untuk menghindari kegagalan.',
      gambar: 'public/BANNER_DEFAULT.png',
    },
    {
      judul: 'Strategi Ampuh Menaklukkan Soal Penalaran Logis TIU',
      isi: 'Penalaran logis seringkali menjadi jebakan bagi banyak peserta. Berikut metode diagram Venn untuk menyelesaikannya dengan cepat.',
      gambar: 'public/BANNER_DEFAULT.png',
    }
  ];

  for (const news of newsItems) {
    await database.berita.create({
      data: news
    });
  }
  console.log('Berita items seeded.');

  // 6. Seed/Verify Paket Pembelian
  let paket = await database.paketPembelian.findUnique({
    where: { id: 7 }
  });
  if (!paket) {
    paket = await database.paketPembelian.create({
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
    
    await database.paketPembelianMateri.create({
      data: {
        paketPembelianId: paket.id,
        nama: 'Materi Tes Wawasan Kebangsaan (TWK) Lengkap',
        materi: 'Panduan lengkap UUD 1945, Pancasila, Pilar Negara, dan Bela Negara.',
      }
    });

    await database.paketPembelianFitur.create({
      data: {
        paketPembelianId: paket.id,
        nama: 'Akses Grup WhatsApp Eksklusif',
      }
    });
  }

  // Ensure testUser has a PAID Pembelian for the paketPembelian so that "Paket Saya" works
  const hasPurchased = await database.pembelian.findFirst({
    where: {
      userId: testUser.id,
      paketPembelianId: paket.id,
      status: 'PAID'
    }
  });

  if (!hasPurchased) {
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
  }

  console.log('Purchase packages and user purchase verified/seeded.');

  // Seed PaketLatihan & Tryouts stats only if not already present
  console.log('Verifying PaketLatihan and Tryout stats...');
  
  let paketLatihan1 = await database.paketLatihan.findFirst({
    where: { nama: 'Simulasi Mandiri SKD CPNS 2026' }
  });
  if (!paketLatihan1) {
    paketLatihan1 = await database.paketLatihan.create({
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
  }

  let paketLatihan2 = await database.paketLatihan.findFirst({
    where: { nama: 'Tryout Akbar CAT Nasional Ke-1' }
  });
  if (!paketLatihan2) {
    paketLatihan2 = await database.paketLatihan.create({
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
  }

  let ppt = await database.paketPembelianTryout.findUnique({
    where: { id: 1 }
  });
  if (!ppt) {
    ppt = await database.paketPembelianTryout.create({
      data: {
        id: 1, // Match /my-class/7/tryout/1
        paketPembelianId: paket.id,
        paketLatihanId: paketLatihan2.id,
        type: 'TRYOUT',
      }
    });
  }

  // Check if testUser already has tryout records, if not seed them
  const userTryoutsCount = await database.tryout.count({
    where: { userId: testUser.id }
  });

  // We want to make sure the user has at least 9 tryout records to populate a very active 7+ days dashboard chart.
  // We can seed them if the count is less than 9.
  if (userTryoutsCount < 9) {
    const today = new Date();
    const existingCount = userTryoutsCount;

    // Seed up to 9 tryouts (let's create the remaining ones)
    const pointsAndTimes = [
      { pts: 380, timeSecs: 4800, type: 'BIASA', daysAgo: 8 },
      { pts: 420, timeSecs: 5400, type: 'BIASA', daysAgo: 7 },
      { pts: 400, timeSecs: 5000, type: 'BIASA', daysAgo: 6 },
      { pts: 440, timeSecs: 5300, type: 'BIASA', daysAgo: 5 },
      { pts: 395, timeSecs: 4700, type: 'BIASA', daysAgo: 4 },
      { pts: 450, timeSecs: 5600, type: 'BIASA', daysAgo: 3 },
      { pts: 410, timeSecs: 4900, type: 'BIASA', daysAgo: 2 },
      { pts: 430, timeSecs: 5200, type: 'BIASA', daysAgo: 1 },
      { pts: 250, timeSecs: 6000, type: 'TRYOUT', daysAgo: 0, customId: 10 }
    ];

    console.log(`Seeding additional tryouts. Currently have ${existingCount} tryouts. Seeding full set...`);

    for (let index = 0; index < pointsAndTimes.length; index++) {
      const item = pointsAndTimes[index];
      const targetDate = new Date(today.getTime() - item.daysAgo * 24 * 3600 * 1000);

      // If it's the main tryout (id: 10), check if it already exists before creating it
      if (item.customId) {
        const checkTryout = await database.tryout.findUnique({ where: { id: item.customId } });
        if (checkTryout) continue;
      }

      const tryoutRecord = await database.tryout.create({
        data: {
          id: item.customId || undefined,
          userId: testUser.id,
          paketLatihanId: item.type === 'BIASA' ? paketLatihan1.id : paketLatihan2.id,
          paketPembelianTryoutId: item.type === 'TRYOUT' ? ppt.id : undefined,
          point: item.pts,
          kkm: 311,
          maxPoint: 500,
          finishAt: targetDate,
          waktuPengerjaan: item.timeSecs,
          createdAt: targetDate,
        }
      });

      // If it's the main tryout, seed the detailed TryoutSoal records
      if (item.customId === 10) {
        console.log('Seeding TryoutSoal records for tryout 10...');
        // TWK: 30 Questions
        const twkSubcategories = ["Nasionalisme", "Pilar Negara", "Integritas"];
        for (let i = 1; i <= 30; i++) {
          const isAnswered = i % 10 !== 0;
          const isCorrect = isAnswered && (i % 2 === 0);
          const point = isCorrect ? 5 : 0;

          await database.tryoutSoal.create({
            data: {
              tryoutId: tryoutRecord.id,
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

        // TIU: 35 Questions
        const tiuSubcategories = ["Verbal", "Numerik", "Figural"];
        for (let i = 1; i <= 35; i++) {
          const isAnswered = i % 12 !== 0;
          const isCorrect = isAnswered && (i % 3 !== 0);
          const point = isCorrect ? 5 : 0;

          await database.tryoutSoal.create({
            data: {
              tryoutId: tryoutRecord.id,
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

        // TKP: 45 Questions
        const tkpSubcategories = ["Pelayanan Publik", "Jejaring Kerja", "Sosial Budaya"];
        for (let i = 1; i <= 45; i++) {
          const isAnswered = i % 15 !== 0;
          const point = isAnswered ? ((i % 5) + 1) : 0;

          await database.tryoutSoal.create({
            data: {
              tryoutId: tryoutRecord.id,
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

        // Recalculate total score
        const totalPoints = await database.tryoutSoal.aggregate({
          where: { tryoutId: tryoutRecord.id },
          _sum: { point: true }
        });
        await database.tryout.update({
          where: { id: tryoutRecord.id },
          data: { point: totalPoints._sum.point || 0 }
        });
      }
    }
  }

  // Seed user notifications
  console.log('Seeding user notifications...');
  const notifications = [
    {
      title: 'Pembayaran Paket Platinum Berhasil',
      keterangan: 'Selamat! Akun Anda telah berhasil diaktifkan untuk paket pembelajaran Platinum CPNS & PPPK 2026.',
      url: '/my-class',
      type: 'SYSTEM',
      status: 'PAYMENT_SUCCESS',
    },
    {
      title: 'Event Baru: Tryout Akbar Nasional CAT Ke-1',
      keterangan: 'Ikuti Tryout Akbar Nasional CAT Ke-1 serentak besok pagi. Bersiaplah untuk bersaing dengan ribuan peserta!',
      url: '/my-class/7/tryout',
      type: 'SYSTEM',
      status: 'BIMBEL_CHANGES',
    },
    {
      title: 'Materi Baru Diunggah: Ringkasan TWK',
      keterangan: 'Materi rangkuman Pilar Negara terbaru telah diunggah ke kelas Anda. Silakan unduh sekarang.',
      url: '/my-class/7/materi',
      type: 'USER',
      status: 'BIMBEL_CHANGES',
    },
    {
      title: 'Jadwal Kelas Live: TIU Kemampuan Kuantitatif',
      keterangan: 'Bimbel Live TIU Numerik akan dimulai malam ini pukul 19:30 WIB. Link zoom telah tersedia.',
      url: '/my-class/7/bimbel',
      type: 'USER',
      status: 'BIMBEL_CHANGES',
    },
    {
      title: 'Promo Flash Sale Astero 2026',
      keterangan: 'Gunakan kode voucher ASTERO2026 untuk diskon tambahan 20% pembelian paket bimbel.',
      url: '/paket-pembelian',
      type: 'SYSTEM',
      status: 'PAYMENT_SUCCESS',
    }
  ];

  for (const notif of notifications) {
    await database.notificationUser.create({
      data: {
        userId: testUser.id,
        title: notif.title,
        keterangan: notif.keterangan,
        url: notif.url,
        type: notif.type,
        status: notif.status,
        isRead: false,
      }
    });
  }
  console.log('User notifications seeded.');

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

  console.log('Database Seeding Completed Safely!');
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
