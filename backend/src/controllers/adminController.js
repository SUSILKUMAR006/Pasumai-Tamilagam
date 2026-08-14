import Tree from '../models/Tree.js';
import User from '../models/User.js';
import TreeSpecies from '../models/TreeSpecies.js';
import District from '../models/District.js';

// @desc    Get admin dashboard overall statistics & chart aggregations
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboard = async (req, res) => {
  try {
    // 2. Trees by Month (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
      totalTrees,
      pendingVerification,
      verifiedTrees,
      rejectedTrees,
      totalUsers,
      totalDistricts,
      totalSpecies,
      treesByDistrict,
      treesByMonth,
      treesBySpecies
    ] = await Promise.all([
      Tree.countDocuments(),
      Tree.countDocuments({ status: 'PENDING_VERIFICATION' }),
      Tree.countDocuments({ status: 'VERIFIED' }),
      Tree.countDocuments({ status: 'REJECTED' }),
      User.countDocuments({ role: 'USER' }),
      District.countDocuments(),
      TreeSpecies.countDocuments(),
      // 1. Trees by District (Top 10)
      Tree.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Tree.aggregate([
        { $match: { plantingDate: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$plantingDate' },
              month: { $month: '$plantingDate' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      // 3. Trees by Species (Top 10)
      Tree.aggregate([
        { $group: { _id: '$species', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      summary: {
        totalTrees,
        pendingVerification,
        verifiedTrees,
        rejectedTrees,
        totalUsers,
        totalDistricts,
        totalSpecies
      },
      charts: {
        treesByDistrict,
        treesByMonth,
        treesBySpecies
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching admin dashboard' });
  }
};

// @desc    Get pending verification trees list
// @route   GET /api/admin/trees/pending
// @access  Private/Admin
export const getPendingTrees = async (req, res) => {
  try {
    const trees = await Tree.find({ status: 'PENDING_VERIFICATION' })
      .populate('user', 'name email phone district')
      .sort({ createdAt: 1 }); // Oldest first to process queue chronologically

    res.json(trees);
  } catch (error) {
    console.error('Error fetching pending trees:', error);
    res.status(500).json({ message: 'Server error fetching pending trees' });
  }
};

// @desc    Approve tree registration
// @route   PUT /api/admin/trees/:id/approve
// @access  Private/Admin
export const approveTree = async (req, res) => {
  try {
    const { notes } = req.body;
    const tree = await Tree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({ message: 'Tree record not found' });
    }

    tree.status = 'VERIFIED';
    tree.verifiedAt = new Date();
    tree.verifiedBy = req.user._id;
    tree.rejectionReason = ''; // Clear prior rejection if any
    tree.rejectionNotes = notes || '';

    tree.verificationHistory.push({
      adminId: req.user._id,
      decision: 'VERIFIED',
      notes: notes || 'Tree verified successfully',
    });

    await tree.save();

    res.json({ message: 'Tree approved successfully', tree });
  } catch (error) {
    console.error('Error approving tree:', error);
    res.status(500).json({ message: 'Server error during tree approval' });
  }
};

// @desc    Reject tree registration
// @route   PUT /api/admin/trees/:id/reject
// @access  Private/Admin
export const rejectTree = async (req, res) => {
  try {
    const { rejectionReason, notes } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const tree = await Tree.findById(req.params.id);

    if (!tree) {
      return res.status(404).json({ message: 'Tree record not found' });
    }

    tree.status = 'REJECTED';
    tree.verifiedAt = new Date();
    tree.verifiedBy = req.user._id;
    tree.rejectionReason = rejectionReason;
    tree.rejectionNotes = notes || '';

    tree.verificationHistory.push({
      adminId: req.user._id,
      decision: 'REJECTED',
      rejectionReason,
      notes: notes || '',
    });

    await tree.save();

    res.json({ message: 'Tree rejected successfully', tree });
  } catch (error) {
    console.error('Error rejecting tree:', error);
    res.status(500).json({ message: 'Server error during tree rejection' });
  }
};

// @desc    Get all trees (filtered and paginated)
// @route   GET /api/admin/trees
// @access  Private/Admin
export const getAllTrees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { district, species, status, treeIdSearch, userSearch } = req.query;

    const query = {};

    if (district) query.district = district;
    if (species) query.species = species;
    if (status) query.status = status;
    
    if (treeIdSearch) {
      query.treeId = { $regex: treeIdSearch, $options: 'i' };
    }

    if (userSearch) {
      // Find matching users first
      const users = await User.find({
        name: { $regex: userSearch, $options: 'i' }
      }).select('_id');
      const userIds = users.map(u => u._id);
      query.user = { $in: userIds };
    }

    const total = await Tree.countDocuments(query);
    const trees = await Tree.find(query)
      .populate('user', 'name email district')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      trees,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching all trees:', error);
    res.status(500).json({ message: 'Server error fetching trees list' });
  }
};

// @desc    Get all registered users and stats, block/unblock users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const [users, treeCounts] = await Promise.all([
      User.find({ role: 'USER' }).sort({ createdAt: -1 }).lean(),
      Tree.aggregate([
        {
          $group: {
            _id: '$user',
            treesRegistered: { $sum: 1 },
            verifiedTrees: {
              $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const countsByUser = new Map(treeCounts.map((c) => [c._id.toString(), c]));

    const usersWithStats = users.map((user) => {
      const counts = countsByUser.get(user._id.toString());
      return {
        ...user,
        treesRegistered: counts?.treesRegistered || 0,
        verifiedTrees: counts?.verifiedTrees || 0,
      };
    });

    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
};

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'ACTIVE' or 'BLOCKED'

    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status parameter' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot change administrative account status' });
    }

    user.status = status;
    await user.save();

    res.json({ message: `User status changed to ${status}`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error modifying user status' });
  }
};

// @desc    Get complete analytics grouping
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    // 1. Verification status percentages
    const totalTrees = await Tree.countDocuments();
    const verified = await Tree.countDocuments({ status: 'VERIFIED' });
    const pending = await Tree.countDocuments({ status: 'PENDING_VERIFICATION' });
    const rejected = await Tree.countDocuments({ status: 'REJECTED' });

    const verificationRates = {
      verifiedPercent: totalTrees > 0 ? ((verified / totalTrees) * 100).toFixed(1) : 0,
      pendingPercent: totalTrees > 0 ? ((pending / totalTrees) * 100).toFixed(1) : 0,
      rejectedPercent: totalTrees > 0 ? ((rejected / totalTrees) * 100).toFixed(1) : 0,
      total: totalTrees
    };

    // 2. Tree count by district (all districts)
    const distCounts = await Tree.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 }, verified: { $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    // 3. Species popularity analytics
    const speciesCounts = await Tree.aggregate([
      { $group: { _id: '$species', count: { $sum: 1 }, verified: { $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] } } } },
      { $sort: { count: -1 } }
    ]);

    // 4. Monthly analytics (12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAnalytics = await Tree.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          verified: { $sum: { $cond: [{ $eq: ['$status', 'VERIFIED'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      verificationRates,
      districtAnalytics: distCounts,
      speciesAnalytics: speciesCounts,
      monthlyAnalytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error generating analytics' });
  }
};

// @desc    Generate reports (Export to CSV)
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const { district, species, status, reportType } = req.query;

    const query = {};
    if (district) query.district = district;
    if (species) query.species = species;
    if (status) query.status = status;

    const trees = await Tree.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Construct CSV Header
    let csvContent = 'Tree ID,Participant Name,Participant Email,Participant Phone,Species,Tree Type,Planting Date,District,Area,Latitude,Longitude,Status,Submission Date,Verified Date,Rejection Reason\n';

    // Build CSV Row contents
    trees.forEach((tree) => {
      const row = [
        tree.treeId,
        `"${tree.user?.name || 'Unknown'}"`,
        `"${tree.user?.email || 'N/A'}"`,
        `"${tree.user?.phone || 'N/A'}"`,
        `"${tree.species}"`,
        `"${tree.treeType}"`,
        tree.plantingDate.toISOString().split('T')[0],
        `"${tree.district}"`,
        `"${tree.area}"`,
        tree.latitude,
        tree.longitude,
        tree.status,
        tree.createdAt.toISOString().split('T')[0],
        tree.verifiedAt ? tree.verifiedAt.toISOString().split('T')[0] : 'N/A',
        `"${tree.rejectionReason || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const filename = `TN_Tree_Report_${reportType || 'General'}_${new Date().toISOString().split('T')[0]}.csv`;

    // Set Response headers to trigger download file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error generating report file:', error);
    res.status(500).json({ message: 'Server error generating report CSV file' });
  }
};

// @desc    Get all tree species (active and inactive)
// @route   GET /api/admin/species
// @access  Private/Admin
export const getAdminSpecies = async (req, res) => {
  try {
    const species = await TreeSpecies.find().sort({ name: 1 });
    res.json(species);
  } catch (error) {
    console.error('Error fetching tree species:', error);
    res.status(500).json({ message: 'Server error fetching tree species' });
  }
};

// @desc    Create a tree species
// @route   POST /api/admin/species
// @access  Private/Admin
export const createSpecies = async (req, res) => {
  try {
    const { name, tamilName, category } = req.body;
    if (!name || !tamilName || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const speciesExists = await TreeSpecies.findOne({ name });
    if (speciesExists) {
      return res.status(400).json({ message: 'Species already exists' });
    }
    const newSpecies = await TreeSpecies.create({ name, tamilName, category });
    res.status(201).json(newSpecies);
  } catch (error) {
    console.error('Error creating species:', error);
    res.status(500).json({ message: 'Server error creating species' });
  }
};

// @desc    Update a tree species
// @route   PUT /api/admin/species/:id
// @access  Private/Admin
export const updateSpecies = async (req, res) => {
  try {
    const { name, tamilName, category, active } = req.body;
    const species = await TreeSpecies.findById(req.params.id);
    if (!species) {
      return res.status(404).json({ message: 'Species not found' });
    }
    species.name = name !== undefined ? name : species.name;
    species.tamilName = tamilName !== undefined ? tamilName : species.tamilName;
    species.category = category !== undefined ? category : species.category;
    species.active = active !== undefined ? active : species.active;

    await species.save();
    res.json(species);
  } catch (error) {
    console.error('Error updating species:', error);
    res.status(500).json({ message: 'Server error updating species' });
  }
};

// @desc    Delete a tree species
// @route   DELETE /api/admin/species/:id
// @access  Private/Admin
export const deleteSpecies = async (req, res) => {
  try {
    const species = await TreeSpecies.findById(req.params.id);
    if (!species) {
      return res.status(404).json({ message: 'Species not found' });
    }
    await TreeSpecies.findByIdAndDelete(req.params.id);
    res.json({ message: 'Species deleted successfully' });
  } catch (error) {
    console.error('Error deleting species:', error);
    res.status(500).json({ message: 'Server error deleting species' });
  }
};

