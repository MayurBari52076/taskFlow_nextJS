const express = require('express');
const router = express.Router();
const { list, create, update, remove } = require('../controllers/subtask.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
