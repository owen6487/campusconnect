const express = require('express');
const router = express.Router();
const { authOptional } = require('../middlerware/AuthMiddlerware');
const { submitContact } = require('../controllers/contactController');

router.post('/', authOptional, submitContact);

module.exports = router;
