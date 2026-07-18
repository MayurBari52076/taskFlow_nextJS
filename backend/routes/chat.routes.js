const express = require('express');
const router = express.Router();
const { list } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, list);

module.exports = router;
