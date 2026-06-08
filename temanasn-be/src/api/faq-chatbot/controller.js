const Joi = require('joi');

const database = require('#database');
const { returnPagination } = require('#utils');
const { BadRequestError } = require('#errors');

const get = async (req, res, next) => {
  try {
    const schema = Joi.object({
      take: Joi.number().min(1).max(50).default(10),
    });

    const validate = await schema.validateAsync(req.query);

    const list = await database.FaqChatbot.findMany({
      where: { isActive: true },
      orderBy: [
        { orderNo: 'asc' },
        { id: 'asc' },
      ],
      take: Number(validate.take),
      select: {
        id: true,
        question: true,
        answer: true,
      },
    });

    res.status(200).json({
      data: { list },
      msg: 'Berhasil mendapatkan FAQ chatbot',
    });
  } catch (error) {
    next(error);
  }
};

const getAdmin = async (req, res, next) => {
  try {
    const schema = Joi.object({
      skip: Joi.number().default(0),
      take: Joi.number().min(1).max(100).default(10),
      sortBy: Joi.string().valid('id', 'question', 'orderNo', 'isActive', 'createdAt', 'updatedAt').default('orderNo'),
      descending: Joi.boolean().default(false),
      search: Joi.string().allow('').default(''),
    });

    const validate = await schema.validateAsync(req.query);

    const where = validate.search
      ? {
          OR: [
            { question: { contains: validate.search } },
            { answer: { contains: validate.search } },
          ],
        }
      : {};

    const result = await database.$transaction([
      database.FaqChatbot.findMany({
        where,
        skip: Number(validate.skip),
        take: Number(validate.take),
        orderBy: {
          [validate.sortBy]: validate.descending ? 'desc' : 'asc',
        },
      }),
      database.FaqChatbot.count({ where }),
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

    const result = await database.FaqChatbot.findUnique({
      where: { id: validate.id },
    });

    if (!result) throw new BadRequestError('FAQ tidak ditemukan');

    res.status(200).json({
      data: result,
      msg: 'Berhasil mendapatkan data FAQ',
    });
  } catch (error) {
    next(error);
  }
};

const insert = async (req, res, next) => {
  try {
    const schema = Joi.object({
      question: Joi.string().trim().required(),
      answer: Joi.string().trim().required(),
      orderNo: Joi.number().default(0),
      isActive: Joi.boolean().default(true),
    });

    const validate = await schema.validateAsync(req.body);

    const result = await database.FaqChatbot.create({
      data: {
        question: validate.question,
        answer: validate.answer,
        orderNo: Number(validate.orderNo),
        isActive: Boolean(validate.isActive),
      },
    });

    res.status(201).json({
      data: result,
      msg: 'Berhasil menambahkan FAQ',
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const schema = Joi.object({
      id: Joi.number().required(),
      question: Joi.string().trim().required(),
      answer: Joi.string().trim().required(),
      orderNo: Joi.number().default(0),
      isActive: Joi.boolean().default(true),
    });

    const validate = await schema.validateAsync({
      ...req.params,
      ...req.body,
    });

    const isExist = await database.FaqChatbot.findUnique({
      where: { id: validate.id },
    });

    if (!isExist) throw new BadRequestError('FAQ tidak ditemukan');

    const result = await database.FaqChatbot.update({
      where: { id: validate.id },
      data: {
        question: validate.question,
        answer: validate.answer,
        orderNo: Number(validate.orderNo),
        isActive: Boolean(validate.isActive),
      },
    });

    res.status(200).json({
      data: result,
      msg: 'Berhasil mengubah FAQ',
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

    const isExist = await database.FaqChatbot.findUnique({
      where: { id: validate.id },
    });

    if (!isExist) throw new BadRequestError('FAQ tidak ditemukan');

    await database.FaqChatbot.delete({
      where: { id: validate.id },
    });

    res.status(200).json({
      data: { id: validate.id },
      msg: 'Berhasil menghapus FAQ',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  get,
  getAdmin,
  find,
  insert,
  update,
  remove,
};
