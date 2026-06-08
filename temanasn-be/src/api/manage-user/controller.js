const Joi = require("joi");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const excelJS = require("exceljs");
const redis = require("../../utils/redis");

const database = require("#database");
const { returnPagination, sendMail, filterToJson, generateToken } = require("#utils");
const { BadRequestError } = require("#errors");

const get = async (req, res, next) => {
  try {
    const schema = Joi.object({
      skip: Joi.number(),
      take: Joi.number(),
      sortBy: Joi.string().allow(""),
      descending: Joi.boolean(),
      filters: Joi.object(),
    });

    const validate = await schema.validateAsync(req.query);

    const users = await database.User.findMany({
      skip: validate.skip,
      take: validate.take,
      where: filterToJson(validate),
      orderBy: {
        [validate.sortBy]: validate.descending ? "desc" : "asc",
      },
      include: {
        // 1. USER YANG MEMAKAI REFERAL USER INI
        affiliateToUsers: {
          where: {
            Pembelian: {
              some: {}        // ambil hanya user yg punya pembelian
            }
          },
          include: {
            Pembelian: true
          }
        },

        // 2. PEMBELIAN PAID YANG DIREFERALKAN KE USER INI
        referredPurchases: {
          where: { status: "PAID" },
          include: {
            paketPembelian: true,
            user: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    const total = await database.User.count({
      where: filterToJson(validate),
    });

    return returnPagination(req, res, [users, total]);

  } catch (error) {
    next(error);
  }
};


const excel = async (req, res, next) => {
  try {
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    const User = await database.User.findMany({});

    worksheet.columns = [
      { header: "Nama Lengkap", key: "name", width: 15 },
      { header: "Email", key: "email", width: 15 },
      { header: "Nomor Telepon", key: "noWA", width: 15 },
      { header: "Alamat", key: "alamat", width: 15 },
      { header: "Provinsi", key: "provinsi", width: 15 },
      { header: "Kabupaten", key: "kabupaten", width: 15 },
      { header: "Kecamatan", key: "kecamatan", width: 15 },
      { header: "Role", key: "role", width: 10 },
      { header: "Tanggal Bergabung", key: "createdAt", width: 25 },
    ];
    User.forEach((user) => {
      worksheet.addRow({
        ...user,
        createdAt: moment(user.createdAt).format("DD-MM-YYYY HH:mm"),
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    workbook.xlsx.write(res).then(() => res.end());
  } catch (error) {
    next(error);
  }
};

const find = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
    });

    const validate = await schema.validateAsync(req.params);

    const result = await database.User.findUnique({
      where: {
        id: validate.id,
      },
    });

    if (!result) throw new BadRequestError("User dengan tidak ditemukan");

    res.status(200).json({
      data: result,
      msg: "Get data by id",
    });
  } catch (error) {
    next(error);
  }
};

const insert = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    noWA: Joi.string().allow(""),
    jenisKelamin: Joi.string().allow(""),
    alamat: Joi.string().allow(""),
    provinsi: Joi.string().allow(""),
    kabupaten: Joi.string().allow(""),
    kecamatan: Joi.string().allow(""),
    affiliate_code: Joi.string().allow(null, ""), // Tambahkan validasi untuk kode affiliate
  });

  try {
    const validate = await schema.validateAsync(req.body);

    // Cek apakah email sudah digunakan
    const isEmailExist = await database.User.findUnique({
      where: { email: validate.email },
    });
    if (isEmailExist) throw new BadRequestError("Email telah digunakan");

    // Cek apakah noWA sudah digunakan jika diisi
    if (validate.noWA) {
      const isNoWAExist = await database.User.findFirst({
        where: { noWA: validate.noWA },
      });
      if (isNoWAExist) throw new BadRequestError("No Whatsapp telah digunakan");
    }

    // Cek kode affiliate (referrer)
    let affiliateFromUserId = null;
    if (validate.affiliate_code) {
      const referrerUser = await database.User.findFirst({
        where: { affiliateCode: validate.affiliate_code },
      });
      if (referrerUser) {
        affiliateFromUserId = referrerUser.id;
      }
    }

    // Generate affiliateCode unik untuk user baru
    let affiliateCode;
    let unique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!unique && attempts < maxAttempts) {
      attempts++;
      affiliateCode = `AFFU${moment().unix()}${Math.floor(Math.random() * 900 + 100)}`;
      const exists = await database.User.findFirst({
        where: { affiliateCode },
      });
      if (!exists) unique = true;
      else await new Promise((r) => setTimeout(r, 50));
    }

    if (!unique) throw new BadRequestError("Gagal membuat kode afiliasi unik. Silakan coba lagi.");

    // Buat user baru
    const result = await database.User.create({
      data: {
        ...validate,
        verifyAt: new Date(),
        password: bcrypt.hashSync(validate.password, 10),
        affiliateFromUserId, // Tambahkan dari referrer
        affiliateCode,
        affiliateLink: `https://viracun.com/auth/register/${affiliateCode}`, // Sesuaikan domain dengan aplikasi Anda
        affiliateStatus: "active",
        affiliateCommission: 0,
        affiliateBalance: 0.0,
      },
    });

    // Kirim email konfirmasi bersifat best-effort, tidak boleh menggagalkan create user.
    try {
      const token = generateToken(result);
      sendMail({
        to: validate.email,
        subject: "Please Confirm Your Email",
        template: "register.html",
        name: validate.name,
        url: `${process.env.URL_SERVER}/auth/confirm-email/${token}`,
      });
    } catch (mailError) {
      // Ignore email notification errors to avoid failing user creation.
    }

    // Audit Log for Create User
    if (req.user) {
      try {
        const logData = {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          url: `Buat User: ${result.name} (${result.email})`,
          ip: req.ip,
          last_activity: Date.now(),
          action: 'CREATE_USER',
        };
        await redis.rpush('audit_logs', JSON.stringify(logData));
        await redis.ltrim('audit_logs', -1000, -1);
      } catch (logError) {
        // Ignore audit log errors to avoid failing user creation.
      }
    }

    res.status(201).json({
      data: result,
      msg: "Create data",
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
      name: Joi.string().required(),
      noWA: Joi.string().allow(""),
      jenisKelamin: Joi.string().allow(""),
      alamat: Joi.string().allow(""),
      provinsi: Joi.string().allow(""),
      kabupaten: Joi.string().allow(""),
      kecamatan: Joi.string().allow(""),
      password: Joi.string().min(8).allow(""),
      email: Joi.string().allow(""),
      verifyAt: Joi.date().allow(null, ""),

      // optional, boleh kosong
      affiliateFromUserId: Joi.alternatives().try(Joi.number(), Joi.valid(null)).allow(""),
    }).unknown();

    const validate = await schema.validateAsync({
      ...req.params,
      ...req.body,
    });

    // Konversi empty value untuk verifyAt
    if (validate.verifyAt === "") validate.verifyAt = null;

    // Hapus affiliateFromUserId jika kosong/null
    if (
      validate.affiliateFromUserId === "" ||
      validate.affiliateFromUserId === null ||
      typeof validate.affiliateFromUserId === "undefined"
    ) {
      delete validate.affiliateFromUserId;
    }

    const isExist = await database.User.findUnique({
      where: { id: validate.id },
    });

    if (!isExist) throw new BadRequestError("User tidak ditemukan");

    // Cek email duplikat
    if (validate.email && validate.email !== isExist.email) {
      const emailValidation = Joi.string().email().validate(validate.email);
      if (emailValidation.error) {
        throw new BadRequestError('Format email tidak sesuai');
      }

      const isEmailExist = await database.User.findUnique({
        where: { email: validate.email },
      });
      if (isEmailExist) throw new BadRequestError("Email telah digunakan");
    }

    // Hash password jika dikirim
    if (validate.password) {
      validate.password = bcrypt.hashSync(validate.password, 10);
    } else {
      delete validate.password;
    }

    const updateData = {
      name: validate.name,
      email: validate.email,
      noWA: validate.noWA,
      jenisKelamin: validate.jenisKelamin,
      alamat: validate.alamat,
      provinsi: validate.provinsi,
      kabupaten: validate.kabupaten,
      kecamatan: validate.kecamatan,
      verifyAt: validate.verifyAt,
      affiliateFromUserId: validate.affiliateFromUserId,
    };

    if (typeof validate.password !== "undefined") {
      updateData.password = validate.password;
    }

    // Remove undefined keys so Prisma only updates intended fields.
    Object.keys(updateData).forEach((key) => {
      if (typeof updateData[key] === "undefined") {
        delete updateData[key];
      }
    });

    const result = await database.User.update({
      where: { id: validate.id },
      data: updateData,
    });

    // Audit Log for Edit User
    if (req.user) {
      try {
        const logData = {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          url: `Ubah User: ${result.name} (${result.email})`,
          ip: req.ip,
          last_activity: Date.now(),
          action: 'EDIT_USER',
        };
        await redis.rpush('audit_logs', JSON.stringify(logData));
        await redis.ltrim('audit_logs', -1000, -1);
      } catch (logError) {
        // Ignore audit log errors to avoid failing user update.
      }
    }

    res.status(200).json({
      data: result,
      msg: "Berhasil mengubah data user",
    });

  } catch (error) {
    next(error);
  }
};


const remove = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
    });

    const validate = await schema.validateAsync(req.params);

    const isExist = await database.User.findUnique({
      where: {
        id: validate.id,
      },
    });

    if (!isExist) throw new BadRequestError("User tidak ditemukan");

    const result = await database.User.delete({
      where: {
        id: validate.id,
      },
    });

    // Audit Log for Delete User
    if (req.user) {
      try {
        const logData = {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          url: `Hapus User: ${isExist.name} (${isExist.email})`,
          ip: req.ip,
          last_activity: Date.now(),
          action: 'DELETE_USER',
        };
        await redis.rpush('audit_logs', JSON.stringify(logData));
        await redis.ltrim('audit_logs', -1000, -1);
      } catch (logError) {
        // Ignore audit log errors to avoid failing user deletion.
      }
    }

    res.status(200).json({
      data: result,
      msg: "Berhasil menghapus data user",
    });
  } catch (error) {
    next(error);
  }
};


// Ambil daftar paket milik user
const getUserPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pembelian = await database.pembelian.findMany({
      where: {
        userId: Number(id),
      },
      include: {
        paketPembelian: {
          select: { id: true, nama: true, harga: true, durasi: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({ data: pembelian });
  } catch (error) {
    next(error);
  }
};

// Ambil semua daftar paket yang tersedia (untuk dropdown pilihan)
const getAllPaket = async (req, res, next) => {
  try {
    const paket = await database.paketPembelian.findMany({
      where: { isActive: true },
      select: { id: true, nama: true, harga: true, durasi: true },
      orderBy: { nama: 'asc' },
    });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.status(200).json({ data: paket });
  } catch (error) {
    next(error);
  }
};

// Tambah paket ke user (tanpa hapus yang lama)
const addPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paketPembelianId } = req.body;

    const paket = await database.paketPembelian.findUnique({
      where: { id: Number(paketPembelianId) },
    });
    if (!paket) throw new BadRequestError('Paket tidak ditemukan');

    const user = await database.User.findUnique({ where: { id: Number(id) } });
    if (!user) throw new BadRequestError('User tidak ditemukan');

    const expiredAt = paket.durasi
      ? moment().add(paket.durasi, 'months').toDate()
      : null;

    const result = await database.pembelian.create({
      data: {
        userId: Number(id),
        paketPembelianId: Number(paketPembelianId),
        namaPaket: paket.nama,
        duration: paket.durasi || 0,
        status: 'PAID',
        paymentMethod: 'MANUAL_ADMIN',
        amount: 0,
        paidAt: new Date(),
        expiredAt,
      },
    });

    res.status(201).json({ data: result, msg: 'Paket berhasil ditambahkan' });
  } catch (error) {
    next(error);
  }
};

// Ganti paket user (hapus yang lama, tambah yang baru)
const gantiPaket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pembelianId, paketPembelianId } = req.body;

    const paket = await database.paketPembelian.findUnique({
      where: { id: Number(paketPembelianId) },
    });
    if (!paket) throw new BadRequestError('Paket baru tidak ditemukan');

    // Hapus pembelian lama
    await database.pembelian.delete({
      where: { id: Number(pembelianId) },
    });

    const expiredAt = paket.durasi
      ? moment().add(paket.durasi, 'months').toDate()
      : null;

    // Buat pembelian baru
    const result = await database.pembelian.create({
      data: {
        userId: Number(id),
        paketPembelianId: Number(paketPembelianId),
        namaPaket: paket.nama,
        duration: paket.durasi || 0,
        status: 'PAID',
        paymentMethod: 'MANUAL_ADMIN',
        amount: 0,
        paidAt: new Date(),
        expiredAt,
      },
    });

    res.status(201).json({ data: result, msg: 'Paket berhasil diganti' });
  } catch (error) {
    next(error);
  }
};

// Hapus paket user
const hapusPaket = async (req, res, next) => {
  try {
    const { pembelianId } = req.params;
    await database.pembelian.delete({
      where: { id: Number(pembelianId) },
    });
    res.status(200).json({ msg: 'Paket berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
  find,
  insert,
  update,
  remove,
  excel,
  getUserPaket,
  getAllPaket,
  addPaket,
  gantiPaket,
  hapusPaket,
};