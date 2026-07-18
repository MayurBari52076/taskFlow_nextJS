const express = require('express');
const router = express.Router();
const { list, getOne, create, update, remove } = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
