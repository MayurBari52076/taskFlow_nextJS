const express = require('express');
const router = express.Router();
const { list, me, updateProfile, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.get('/me', me);
router.patch('/me', updateProfile);
router.patch('/me/password', changePassword);

module.exports = router;
