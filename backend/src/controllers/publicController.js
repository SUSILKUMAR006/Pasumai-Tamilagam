import Tree from '../models/Tree.js';
import User from '../models/User.js';
import TreeSpecies from '../models/TreeSpecies.js';
import District from '../models/District.js';

// Deterministic noise generator to obfuscate exact GPS points (+/- 40 meters)
const getObfuscatedCoords = (treeId, lat, lng) => {
  let hash = 0;
  for (let i = 0; i < treeId.length; i++) {
    hash = treeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latNoise = (hash % 100) / 250000;
  const lngNoise = ((hash >> 2) % 100) / 250000;
  return {
    latitude: lat + latNoise,
    longitude: lng + lngNoise,
  };
};

// @desc    Get landing page and global platform statistics
// @route   GET /api/public/statistics
// @access  Public
export const getStatistics = async (req, res) => {
  try {
    const [
      totalTrees,
      verifiedTrees,
      totalParticipants,
      activeDistricts,
      totalTreeSpecies,
      recentVerifiedTrees,
    ] = await Promise.all([
      Tree.countDocuments(),
      Tree.countDocuments({ status: 'VERIFIED' }),
      User.countDocuments({ role: 'USER' }),
      // Count unique districts represented in the system
      Tree.distinct('district'),
      // Count unique species represented
      TreeSpecies.countDocuments({ active: true }),
      // Recent 5 verified trees
      Tree.find({ status: 'VERIFIED' })
        .sort({ verifiedAt: -1 })
        .limit(5)
        .select('treeId species district plantingDate photoUrl'),
    ]);
    const totalDistrictsCovered = activeDistricts.length;

    res.json({
      totalTrees,
      verifiedTrees,
      totalParticipants,
      totalDistricts: totalDistrictsCovered || 38,
      totalTreeSpecies,
      recentVerifiedTrees,
    });
  } catch (error) {
    console.error('Error fetching public statistics:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

// @desc    Get all active districts
// @route   GET /api/public/districts
// @access  Public
export const getDistricts = async (req, res) => {
  try {
    const districts = await District.find().sort({ name: 1 });
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Server error fetching districts' });
  }
};

// @desc    Get verified trees for map coordinates with privacy obfuscation
// @route   GET /api/public/tree-map
// @access  Public
export const getTreeMap = async (req, res) => {
  try {
    const { district, species, treeType, startDate, endDate } = req.query;

    const query = { status: 'VERIFIED' };

    if (district) query.district = district;
    if (species) query.species = species;
    if (treeType) query.treeType = treeType;
    if (startDate || endDate) {
      query.plantingDate = {};
      if (startDate) query.plantingDate.$gte = new Date(startDate);
      if (endDate) query.plantingDate.$lte = new Date(endDate);
    }

    const trees = await Tree.find(query)
      .select('treeId species district plantingDate treeType latitude longitude status')
      .lean();

    // Obfuscate GPS locations before returning
    const obfuscatedTrees = trees.map((tree) => {
      const coords = getObfuscatedCoords(tree.treeId, tree.latitude, tree.longitude);
      return {
        ...tree,
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
    });

    res.json(obfuscatedTrees);
  } catch (error) {
    console.error('Error fetching tree map markers:', error);
    res.status(500).json({ message: 'Server error fetching tree map' });
  }
};

// @desc    Get district leaderboard ranks
// @route   GET /api/public/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    // Aggregate verified trees by district
    const results = await Tree.aggregate([
      { $match: { status: 'VERIFIED' } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Fetch all districts to ensure 0 counts are also included
    const allDistricts = await District.find().select('name').lean();

    const leaderboard = allDistricts.map((dist) => {
      const match = results.find((r) => r._id === dist.name);
      return {
        districtName: dist.name,
        verifiedTrees: match ? match.count : 0,
      };
    });

    // Sort complete list by count descending
    leaderboard.sort((a, b) => b.verifiedTrees - a.verifiedTrees);

    // Apply ranking (incorporate ties gracefully)
    let currentRank = 1;
    const rankedLeaderboard = leaderboard.map((item, idx) => {
      if (idx > 0 && item.verifiedTrees < leaderboard[idx - 1].verifiedTrees) {
        currentRank = idx + 1;
      }
      return {
        ...item,
        rank: currentRank,
      };
    });

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error calculating district leaderboard:', error);
    res.status(500).json({ message: 'Server error calculating leaderboard' });
  }
};

// @desc    Get active tree species list
// @route   GET /api/public/species
// @access  Public
export const getPublicSpecies = async (req, res) => {
  try {
    const speciesList = await TreeSpecies.find({ active: true }).sort({ name: 1 });
    res.json(speciesList);
  } catch (error) {
    console.error('Error retrieving active species:', error);
    res.status(500).json({ message: 'Server error fetching species catalog' });
  }
};

