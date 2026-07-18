const express = require('express');
const router = express.Router();
const { list, markRead, markAllRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

module.exports = router;
