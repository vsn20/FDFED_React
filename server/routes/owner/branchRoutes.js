const express = require('express');
const router = express.Router();

const { getBranches, addBranch, getSingleBranch, updateBranch } = require('../../controllers/owner/BranchController');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('owner'), getBranches)
    .post(protect, authorize('owner'), addBranch);

router.route('/:bid')
    .get(protect, authorize('owner'), getSingleBranch)
    .put(protect, authorize('owner'), updateBranch);

module.exports = router;