const Complaint = require("../../models/complaint");
const Company = require("../../models/company");

// Get Complaints with Pagination and Search
async function getCompanyComplaints(req, res) {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const companyId = req.user.c_id;

    // Build Query
    const query = { company_id: companyId };

    if (search) {
      query.$or = [
        { complaint_id: { $regex: search, $options: "i" } },
        { product_id: { $regex: search, $options: "i" } },
        { sale_id: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } }
      ];
    }

    // Execute Query
    const complaints = await Complaint.find(query)
      .sort({ complaint_date: -1 }) // Newest first
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalComplaints = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      totalPages: Math.ceil(totalComplaints / parseInt(limit)),
      currentPage: parseInt(page),
      totalComplaints
    });

  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// Update Complaint Status
async function updateComplaintStatus(req, res) {
  try {
    const { complaint_id } = req.params;
    const { status } = req.body;
    const companyId = req.user.c_id;

    // Validate status
    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaint_id, company_id: companyId },
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, message: "Status updated successfully", complaint });

  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = {
  getCompanyComplaints,
  updateComplaintStatus
};