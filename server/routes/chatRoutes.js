const express = require('express');
const router = express.Router();
const { processChatQuery } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processChatQuery);

module.exports = router;
