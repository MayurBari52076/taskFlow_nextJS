const express = require('express');
const router = express.Router();
const { list, upload: uploadFile, remove } = require('../controllers/file.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/', list);
router.post('/', upload.single('file'), uploadFile);
router.delete('/:id', remove);

module.exports = router;
