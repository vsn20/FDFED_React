// ============ SEARCH OPTIMIZATION ============
// MongoDB Text Search controller (Solr-like search experience)
// Uses MongoDB text indexes for full-text search across products
const Product = require('../models/products');
const Sale = require('../models/sale');

/**
 * @desc    Full-text search across products
 * @route   GET /api/search?q=<query>&page=1&limit=10
 * @access  Public
 */
exports.searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required. Use ?q=<search term>'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // MongoDB Text Search - uses the text index on Prod_name, prod_description, com_name
    const searchQuery = {
      $text: { $search: q },
      Status: 'Accepted' // Only search accepted/published products
    };

    const [products, total] = await Promise.all([
      Product.find(
        searchQuery,
        { score: { $meta: 'textScore' } } // Include search relevance score
      )
        .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(searchQuery)
    ]);

    // Enrich with sales data (ratings)
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const salesData = await Sale.aggregate([
          { $match: { product_id: product.prod_id, rating: { $ne: null } } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              totalSales: { $sum: 1 },
              totalReviews: { $sum: { $cond: [{ $ne: ['$rating', null] }, 1, 0] } }
            }
          }
        ]);

        return {
          ...product,
          averageRating: salesData[0] ? parseFloat(salesData[0].avgRating.toFixed(1)) : null,
          totalSales: salesData[0] ? salesData[0].totalSales : 0,
          totalReviews: salesData[0] ? salesData[0].totalReviews : 0
        };
      })
    );

    res.json({
      success: true,
      data: enrichedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResults: total,
        perPage: parseInt(limit)
      },
      query: q
    });
  } catch (error) {
    console.error('[SEARCH] Error:', error.message);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

/**
 * @desc    Autocomplete search suggestions
 * @route   GET /api/search/autocomplete?q=<partial query>
 * @access  Public
 */
exports.autocomplete = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    // Regex-based autocomplete for partial matches
    const regex = new RegExp(q, 'i');
    const products = await Product.find({
      Status: 'Accepted',
      $or: [
        { Prod_name: regex },
        { com_name: regex },
        { prod_description: regex }
      ]
    })
      .select('Prod_name com_name prod_id Retail_price prod_photos')
      .limit(8)
      .lean();

    const suggestions = products.map(p => ({
      prod_id: p.prod_id,
      name: p.Prod_name,
      company: p.com_name,
      price: p.Retail_price,
      image: p.prod_photos && p.prod_photos[0] ? p.prod_photos[0] : null
    }));

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('[SEARCH] Autocomplete error:', error.message);
    res.status(500).json({ success: false, message: 'Autocomplete failed' });
  }
};
