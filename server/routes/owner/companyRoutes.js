const express = require('express');
const router = express.Router();

const { getCompanies,addCompany,getsingleCompany,updateCompany } = require('../../controllers/owner/CompanyController');
const { protect, authorize } = require('../../middleware/authMiddleware');


router.route('/')
    .get(protect, authorize('owner'), getCompanies)
    .post(protect, authorize('owner'), addCompany);

router.route('/:id')
    .get(protect, authorize('owner'), getsingleCompany) // Placeholder for future use
    .put(protect, authorize('owner'), updateCompany) // Placeholder for future use

module.exports = router;