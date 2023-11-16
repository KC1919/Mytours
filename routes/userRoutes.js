const express = require('express');
const router = express.Router();

router.route('/api/v1/user').get().post()

router.route('api/v1/user/:id').get().patch().delete()

module.exports = router;