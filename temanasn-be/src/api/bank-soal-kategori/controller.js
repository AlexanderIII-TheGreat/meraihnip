const Joi = require('joi');
const redis = require('../../utils/redis');

const database = require('#database');
const { returnPagination, filterToJson } = require('#utils');
const { BadRequestError } = require('#errors');

const get = async (req, res, next) => {
  try {
    const schema = Joi.object({
      skip: Joi.number(),
      take: Joi.number(),
      sortBy: Joi.string(),
      descending: Joi.boolean(),
      filters: Joi.object(),
      parentCategoryId: Joi.number().allow(null),
    }).unknown(true);

    const validate = await schema.validateAsync(req.query);

    const take = validate.take ? { take: validate.take } : {};

    const result = await database.$transaction([
      database.bankSoalCategory.findMany({
        ...take,
        skip: validate.skip,
        orderBy: {
          [validate.sortBy]: validate.descending ? 'desc' : 'asc',
        },
        where: {
          ...filterToJson(validate),
          parentCategoryId: validate.parentCategoryId,
        },
        include: {
          _count: {
            select: {
              BankSoal: true,
            },
          },
        },
      }),
      database.bankSoalCategory.count({
        where: filterToJson(validate),
      }),
    ]);

    return returnPagination(req, res, result);
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

    const result = await database.bankSoalCategory.findUnique({
      where: {
        id: validate.id,
      },
      select: {
        id: true, // Include other scalar fields you need
        nama: true,
        // keterangan: true,
        parentCategoryId: true,
        createdAt: true,
        updatedAt: true,
        BankSoal: {
          select: {
            id: true,
            soal: true,
            pembahasan: true,
            subCategory: true,
            BankSoalJawaban: {
              select: {
                id: true,
                jawaban: true,
                isCorrect: true,
                point: true,
              },
            },
          },
        },
      },
    });

    if (!result) throw new BadRequestError('Kategori tidak ditemukan');

    res.status(200).json({
      data: result,
      msg: 'Get data by id',
    });
  } catch (error) {
    next(error);
  }
};

const insert = async (req, res, next) => {
  try {
    const schema = Joi.object({
      nama: Joi.string().required(),
      keterangan: Joi.allow(null, ''),
      kkm: Joi.number().allow(null, '', 0),
      parentCategoryId: Joi.number().allow(null, ''),
      tipePenilaian: Joi.string().required(),
      paketRekomendasiId: Joi.number().allow(null), // Added validation for paketRekomendasiId
    });

    const validate = await schema.validateAsync(
      { ...req.body },
      {
        stripUnknown: true,
      }
    );
    
    
    // Validate paketRekomendasiId exists in PaketPembelian if provided
    if (validate.paketRekomendasiId) {
      const paketPembelian = await database.paketPembelian.findUnique({
        where: {
          id: validate.paketRekomendasiId,
        },
      });
      if (!paketPembelian) {
        throw new BadRequestError('Paket Pembelian untuk paketRekomendasiId tidak ditemukan');
      }
    }
    
    const data = {
      data: {
        ...validate,
        parentCategory: {
          connect: {
            id: validate.parentCategoryId,
          },
        },
      },
    };

    delete data.data.parentCategoryId;

    const result = await database.bankSoalCategory.create(data);

    // Audit Log for Create Kategori Soal
    if (req.user) {
      const logData = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        url: `Buat Kategori Soal: ${result.nama}`,
        ip: req.ip,
        last_activity: Date.now(),
        action: 'CREATE_SOAL_CATEGORY',
      };
      await redis.rpush('audit_logs', JSON.stringify(logData));
      await redis.ltrim('audit_logs', -1000, -1);
    }

    res.status(200).json({
      data: result,
      msg: 'Berhasil menambahkan Kategori Bank Soal',
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
      nama: Joi.string().required(),
      keterangan: Joi.allow(null, ''),
      kkm: Joi.number().allow(null, '', 0),
      parentCategoryId: Joi.number().allow(null, ''),
      tipePenilaian: Joi.string().required(),
      paketRekomendasiId: Joi.number().allow(null), // Added validation for paketRekomendasiId
    });

    const validate = await schema.validateAsync(
      {
        ...req.body,
        ...req.params,
      },
      {
        stripUnknown: true,
      }
    );

    const isExist = await database.bankSoalCategory.findUnique({
      where: {
        id: validate.id,
      },
    });

    if (!isExist) throw new BadRequestError('Kategori tidak ditemukan');
    
    // Validate paketRekomendasiId exists in PaketPembelian if provided
    if (validate.paketRekomendasiId) {
      const paketPembelian = await database.paketPembelian.findUnique({
        where: {
          id: validate.paketRekomendasiId,
        },
      });
      if (!paketPembelian) {
        throw new BadRequestError('Paket Pembelian untuk paketRekomendasiId tidak ditemukan');
      }
    }

    const data = {
      data: {
        ...validate,
        parentCategory: {
          connect: {
            id: validate.parentCategoryId,
          },
        },
      },
    };

    delete data.data.parentCategoryId;
    delete data.data.id;

    const result = await database.bankSoalCategory.update({
      where: {
        id: validate.id,
      },
      data: data.data,
    });

    // Audit Log for Edit Kategori Soal
    if (req.user) {
      const logData = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        url: `Ubah Kategori Soal: ${result.nama}`,
        ip: req.ip,
        last_activity: Date.now(),
        action: 'EDIT_SOAL_CATEGORY',
      };
      await redis.rpush('audit_logs', JSON.stringify(logData));
      await redis.ltrim('audit_logs', -1000, -1);
    }

    res.status(200).json({
      data: result,
      msg: 'Berhasil mengubah data kategori bank soal',
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

    const isExist = await database.bankSoalCategory.findUnique({
      where: {
        id: validate.id,
      },
    });

    if (!isExist) throw new BadRequestError('Kategori tidak ditemukan');

    const result = await database.bankSoalCategory.delete({
      where: {
        id: validate.id,
      },
    });

    // Audit Log for Delete Kategori Soal
    if (req.user) {
      const logData = {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        url: `Hapus Kategori Soal: ${isExist.nama || validate.id}`,
        ip: req.ip,
        last_activity: Date.now(),
        action: 'DELETE_SOAL_CATEGORY',
      };
      await redis.rpush('audit_logs', JSON.stringify(logData));
      await redis.ltrim('audit_logs', -1000, -1);
    }

    res.status(200).json({
      data: result,
      msg: 'Berhasil menghapus kategori bank soal',
    });
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
};
