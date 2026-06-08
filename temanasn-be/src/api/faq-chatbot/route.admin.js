const express = require('express');

const router = express.Router();
const { getAdmin, find, insert, update, remove } = require('./controller');

router.get('/get', getAdmin);
router.get('/find/:id', find);
router.post('/insert', insert);
router.patch('/update/:id', update);
router.delete('/remove/:id', remove);

module.exports = router;
