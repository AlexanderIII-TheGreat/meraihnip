const Joi = require('joi');

const database = require('#database');
const { returnPagination, deleteFile, filterToJson } = require('#utils');
const { BadRequestError } = require('#errors');

const get = async (req, res, next) => {
  try {
    const schema = Joi.object({
      skip: Joi.number().default(0),
      take: Joi.number().default(10),
      sortBy: Joi.string().default('createdAt'),
      descending: Joi.boolean().default(true),
      filters: Joi.object(),
    }).unknown(true);

    const validate = await schema.validateAsync(req.query);
    const take = validate.take ? { take: validate.take } : {};

    const result = await database.$transaction([
      database.berita.findMany({
        ...take,
        skip: validate.skip,
        orderBy: {
          [validate.sortBy]: validate.descending ? 'desc' : 'asc',
        },
        where: {
          ...filterToJson(validate),
        },
      }),
      database.berita.count({
        where: filterToJson(validate),
      }),
    ]);

    return returnPagination(req, res, result);
  } catch (error) {
    next(error);
  }
};

const insert = async (req, res, next) => {
  try {
    const schema = Joi.object({
      judul: Joi.string().required(),
      isi: Joi.string().required(),
      gambar: Joi.string().allow(null, ''),
    });

    const validate = await schema.validateAsync({
      ...req.body,
      gambar: req?.file?.path,
    });

    const result = await database.berita.create({
      data: {
        judul: validate.judul,
        isi: validate.isi,
        gambar: validate.gambar,
      },
    });

    res.status(200).json({
      data: result,
      msg: 'Berhasil menambahkan Berita',
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
      judul: Joi.string(),
      isi: Joi.string(),
      gambar: Joi.string().allow(null, ''),
    });

    const validate = await schema.validateAsync({
      ...req.body,
      ...req.params,
      gambar: req?.file?.path,
    }, {
      stripUnknown: true,
    });

    const isExist = await database.berita.findUnique({
      where: { id: validate.id },
    });

    if (!isExist) throw new BadRequestError('Berita tidak ditemukan');

    const updateData = {};
    if (validate.judul) updateData.judul = validate.judul;
    if (validate.isi) updateData.isi = validate.isi;
    if (validate.gambar !== undefined) updateData.gambar = validate.gambar;

    const result = await database.berita.update({
      where: { id: validate.id },
      data: updateData,
    });

    if (validate.gambar && isExist.gambar) {
      deleteFile(isExist.gambar);
    }

    res.status(200).json({
      data: result,
      msg: 'Berhasil mengubah data berita',
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

    const isExist = await database.berita.findUnique({
      where: { id: validate.id },
    });

    if (!isExist) throw new BadRequestError('Berita tidak ditemukan');

    const result = await database.berita.delete({
      where: { id: validate.id },
    });

    res.status(200).json({
      data: result,
      msg: 'Berhasil menghapus berita',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
  insert,
  update,
  remove,
};
