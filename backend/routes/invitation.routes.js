const express = require('express');
const router = express.Router();
const { list, create, accept, revoke } = require('../controllers/invitation.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', list);
router.post('/', create);
router.get('/accept/:token', accept);
router.delete('/:id', revoke);

module.exports = router;
