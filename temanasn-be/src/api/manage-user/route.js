const express = require('express');

const router = express.Router();

const { get, find, insert, update, remove, excel, getUserPaket, getAllPaket, addPaket, gantiPaket, hapusPaket } = require('./controller');

router.get('/get', get);
router.get('/find/:id', find);
router.post('/insert', insert);
router.patch('/update/:id', update);
router.delete('/remove/:id', remove);
router.get('/excel', excel);

// Manajemen paket user oleh admin
// PENTING: static route harus di atas dynamic route /:id
router.get('/all-paket', getAllPaket);
router.delete('/hapus-paket/:pembelianId', hapusPaket);
router.get('/:id/paket', getUserPaket);
router.post('/:id/add-paket', addPaket);
router.post('/:id/ganti-paket', gantiPaket);

module.exports = router;
