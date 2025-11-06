const express = require('express');
const router = express.Router();

const {getBranches}=require('../controllers/owner/BranchController')

router.route('/').get(getBranches);

module.exports = router;